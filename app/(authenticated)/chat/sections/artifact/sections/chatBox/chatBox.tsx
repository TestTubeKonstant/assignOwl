'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, Bot, User, AlertCircle } from 'lucide-react'
import { Artifact } from '../../../../store/chatStore'
import { useMessagesStore } from '../../../chatMessages/store/store'
import { useAssignmentChat } from '@/app/(authenticated)/chat/hooks/useAssignmentChat'
import { useSearchParams } from 'next/navigation'
import ConnectionStatus from '@/app/(authenticated)/chat/components/ConnectionStatus'
import styles from './chatBox.module.scss'

interface ChatBoxProps {
  artifact: Artifact
  onDocumentUpdate?: (content: string) => void
}

const ChatBox: React.FC<ChatBoxProps> = ({ artifact, onDocumentUpdate }) => {
  const searchParams = useSearchParams()
  const assignmentId = parseInt(searchParams.get('id') || '0')
  
  const { value, addChatMessage } = useMessagesStore()
  const { messages, isLoading, error, sendMessage } = useAssignmentChat(assignmentId)
  
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initializedArtifacts = useRef<Set<string>>(new Set())

  // Initialize welcome message if no messages exist for this artifact
  useEffect(() => {
    const artifactWelcomeId = `welcome-${artifact.id}`
    const hasWelcomeForThisArtifact = value.chat_messages.some(msg => msg.id === artifactWelcomeId)

    if (!hasWelcomeForThisArtifact && !initializedArtifacts.current.has(artifact.id) && value.chat_messages.length === 0) {
      const welcomeMessage = {
        id: artifactWelcomeId,
        type: 'assistant' as const,
        content: `I'm here to help you with your document: "${artifact.title}". You can ask me to make changes, add content, or improve the document in any way.`,
        timestamp: new Date().toISOString(),
        responseType: 'text' as const
      }
      addChatMessage(welcomeMessage)
      initializedArtifacts.current.add(artifact.id)
    }
  }, [artifact.id, artifact.title, addChatMessage, value.chat_messages.length])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [value.chat_messages])

  // Handle document updates from the chat system
  useEffect(() => {
    if (onDocumentUpdate && value.generated_content?.content) {
      onDocumentUpdate(value.generated_content.content)
    }
  }, [value.generated_content?.content, onDocumentUpdate])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !assignmentId) return

    // Send message through socket
    sendMessage(inputValue.trim())
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={styles.chatBox}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <MessageSquare size={20} />
        </div>
        <div className={styles.headerTitle}>
          <div className={styles.titleRow}>
            <h3>Document Chat</h3>
            <ConnectionStatus />
          </div>
          <p>
            Chat about: <abbr title={artifact.title}>
              {`${artifact.title.slice(0, 30)}...`}
            </abbr>
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {value.chat_messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${message.type === 'user' ? styles.userMessage : styles.assistantMessage
              } ${message.responseType === 'changes' ? styles.changesMessage : ''}`}
          >
            <div className={styles.messageIcon}>
              {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={styles.messageContent}>
              <p>{message.content}</p>
              {message.responseType === 'changes' && (
                <div className={styles.changesIndicator}>
                  <span>📝 Document updated</span>
                </div>
              )}
              <span className={styles.messageTime}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage} ${styles.loadingMessage}`}>
            <div className={styles.messageIcon}>
              <Bot size={16} />
            </div>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className={styles.loadingText}>AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={assignmentId ? "Ask me to modify the document..." : "Loading assignment..."}
            className={styles.input}
            disabled={isLoading || !assignmentId}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || !assignmentId}
            className={styles.sendButton}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
