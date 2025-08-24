'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSocket, useIsConnected } from '@/app/socket/socketStore'
import { useMessagesStore } from '../sections/chatMessages/store/store'
import { chatApi } from '../api/chatApi'

interface ChatMessage {
    id: string
    type: 'user' | 'assistant'
    content: string
    timestamp: string
    responseType?: 'text' | 'changes'
}

interface DocumentUpdateData {
    assignmentId: number
    generationId: number
    summary: string
    timestamp: string
}

interface ChatResponseData {
    assignmentId: number
    messageId: string
    response: string
    sender: 'ai'
    timestamp: string
}

interface ChatErrorData {
    assignmentId: number
    error: string
    timestamp: string
    
}

export const useAssignmentChat = (assignmentId: number) => {
    const socket = useSocket()
    const isConnected = useIsConnected()
    const { value, addChatMessage, update, setAssignmentId } = useMessagesStore()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Update assignment ID in store when it changes
    useEffect(() => {
        if (assignmentId && assignmentId !== value.assignmentId) {
            setAssignmentId(assignmentId)
        }
    }, [assignmentId, value.assignmentId, setAssignmentId])

    // Send chat message
    const sendMessage = useCallback(async (message: string) => {
        if (!assignmentId || !message.trim()) {
            console.warn('Cannot send message:', { assignmentId, hasMessage: !!message.trim() })
            return
        }

        // Validate message length
        if (message.length > 5000) {
            setError('Message too long (max 5000 characters)')
            return
        }

        // Add user message to store immediately
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: message.trim(),
            timestamp: new Date().toISOString()
        }

        addChatMessage(userMessage)
        setIsLoading(true)
        setError(null)

        // Try socket first, fallback to REST API
        if (socket && isConnected) {
            // Send via socket
            socket.emit('assignment:chat-message', {
                assignmentId,
                message: message.trim()
            })
            console.log('Sent chat message via socket:', { assignmentId, message: message.trim() })
        } else {
            // Fallback to REST API
            console.log('Socket not available, using REST API fallback')
            try {
                const response = await chatApi.sendMessage({
                    assignmentId,
                    message: message.trim()
                })

                if (response.success && response.response) {
                    // Add AI response to chat
                    const aiMessage: ChatMessage = {
                        id: response.messageId,
                        type: 'assistant',
                        content: response.response,
                        timestamp: new Date().toISOString(),
                        responseType: 'text'
                    }
                    addChatMessage(aiMessage)
                } else if (response.error) {
                    setError(response.error)
                }
            } catch (error) {
                setError('Failed to send message')
                console.error('REST API fallback failed:', error)
            } finally {
                setIsLoading(false)
            }
        }
    }, [socket, isConnected, assignmentId, addChatMessage])

    // Get chat history
    const getChatHistory = useCallback(async (limit: number = 50) => {
        if (!assignmentId) return

        if (socket && isConnected) {
            // Use socket
            socket.emit('assignment:get-chat-history', {
                assignmentId,
                limit
            })
        } else {
            // Fallback to REST API
            try {
                const response = await chatApi.getChatHistory(assignmentId, limit)
                if (response.success) {
                    console.log('REST API chat history:', response.messages)

                    // Map REST API response (should already be correct format, but let's be safe)
                    const mappedMessages: ChatMessage[] = response.messages.map((msg: any) => ({
                        id: msg.id,
                        type: msg.sender_type ? (msg.sender_type === 'user' ? 'user' : 'assistant') :
                            msg.sender ? (msg.sender === 'user' ? 'user' : 'assistant') :
                                msg.type, // Handle sender_type, sender, or type formats
                        content: msg.content,
                        timestamp: msg.created_at || msg.timestamp,
                        responseType: msg.responseType
                    }))

                    console.log('Mapped REST API messages:', mappedMessages)
                    update('chat_messages', mappedMessages)
                } else if (response.error) {
                    setError(response.error)
                }
            } catch (error) {
                console.error('Failed to get chat history:', error)
                setError('Failed to load chat history')
            }
        }
    }, [socket, isConnected, assignmentId, update])

    // Get current generation
    const getCurrentGeneration = useCallback(async () => {
        if (!assignmentId) return

        if (socket && isConnected) {
            // Use socket
            socket.emit('assignment:get-current-generation', {
                assignmentId
            })
        } else {
            // Fallback to REST API
            try {
                const response = await chatApi.getCurrentGeneration(assignmentId)
                if (response.success && response.generation) {
                    update('generated_content', {
                        content: response.generation.content,
                        content_css: response.generation.content_css,
                        word_count: response.generation.word_count,
                        generated_at: response.generation.generated_at,
                        generation_id: response.generation.id
                    })
                    update('has_generated_content', true)
                } else if (response.error) {
                    setError(response.error)
                }
            } catch (error) {
                console.error('Failed to get current generation:', error)
                setError('Failed to load document')
            }
        }
    }, [socket, isConnected, assignmentId, update])

    // Socket event listeners
    useEffect(() => {
        if (!socket) return

        // Handle chat responses (text responses)
        const handleChatResponse = (data: ChatResponseData) => {
            if (data.assignmentId !== assignmentId) return

            const assistantMessage: ChatMessage = {
                id: data.messageId,
                type: 'assistant',
                content: data.response,
                timestamp: data.timestamp,
                responseType: 'text'
            }

            addChatMessage(assistantMessage)
            setIsLoading(false)
        }

        // Handle document updates (when AI edits the document)
        const handleDocumentUpdate = (data: DocumentUpdateData) => {
            if (data.assignmentId !== assignmentId) return

            // Add system message about document update
            const updateMessage: ChatMessage = {
                id: `update-${data.generationId}`,
                type: 'assistant',
                content: data.summary || 'Document has been updated',
                timestamp: data.timestamp,
                responseType: 'changes'
            }

            addChatMessage(updateMessage)
            setIsLoading(false)

            // Refresh current generation to get updated content
            getCurrentGeneration()
        }

        // Handle chat history response
        const handleChatHistory = (data: { assignmentId: number; messages: any[]; timestamp: string }) => {
            if (data.assignmentId !== assignmentId) return

            console.log('Raw chat history from socket:', data.messages)

            // Map socket message format to frontend format
            const mappedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
                id: msg.id,
                type: msg.sender_type === 'user' ? 'user' : 'assistant', // Map sender_type to type
                content: msg.content,
                timestamp: msg.created_at || msg.timestamp, // Use created_at from server
                responseType: msg.responseType || (msg.sender_type === 'ai' ? 'text' : undefined)
            }))

            console.log('Mapped chat messages:', mappedMessages)

            // Replace current chat messages with history
            update('chat_messages', mappedMessages)
        }

        // Handle current generation response
        const handleCurrentGeneration = (data: any) => {
            if (data.assignmentId !== assignmentId) return

            if (data.generation) {
                // Update the generated content in store
                update('generated_content', {
                    content: data.generation.content,
                    content_css: data.generation.content_css,
                    word_count: data.generation.word_count,
                    generated_at: data.generation.generated_at,
                    generation_id: data.generation.id
                })
                update('has_generated_content', true)
            }
        }

        // Handle errors
        const handleChatError = (data: ChatErrorData) => {
            if (data.assignmentId !== assignmentId) return

            setError(data.error)
            setIsLoading(false)

            // Add error message to chat
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                type: 'assistant',
                content: `Error: ${data.error}`,
                timestamp: data.timestamp,
                responseType: 'text'
            }

            addChatMessage(errorMessage)
        }

        // Register event listeners
        socket.on('assignment:chat-response', handleChatResponse)
        socket.on('assignment:document-updated', handleDocumentUpdate)
        socket.on('assignment:chat-history', handleChatHistory)
        socket.on('assignment:current-generation', handleCurrentGeneration)
        socket.on('assignment:chat-error', handleChatError)

        // Cleanup listeners
        return () => {
            socket.off('assignment:chat-response', handleChatResponse)
            socket.off('assignment:document-updated', handleDocumentUpdate)
            socket.off('assignment:chat-history', handleChatHistory)
            socket.off('assignment:current-generation', handleCurrentGeneration)
            socket.off('assignment:chat-error', handleChatError)
        }
    }, [socket, assignmentId, addChatMessage, update, getCurrentGeneration])

    // Load chat history and current generation on mount
    useEffect(() => {
        if (assignmentId) {
            getChatHistory()
            getCurrentGeneration()
        }
    }, [assignmentId, getChatHistory, getCurrentGeneration])

    return {
        messages: value.chat_messages,
        currentGeneration: value.generated_content,
        isLoading,
        error,
        sendMessage,
        getChatHistory,
        getCurrentGeneration
    }
}