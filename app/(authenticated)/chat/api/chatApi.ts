'use client'

// REST API fallback for chat functionality when sockets are not available

interface SendMessageRequest {
  assignmentId: number
  message: string
}

interface SendMessageResponse {
  success: boolean
  messageId: string
  response?: string
  error?: string
}

interface ChatHistoryResponse {
  success: boolean
  messages: Array<{
    id: string
    type: 'user' | 'assistant'
    content: string
    timestamp: string
    responseType?: 'text' | 'changes'
  }>
  error?: string
}

interface CurrentGenerationResponse {
  success: boolean
  generation?: {
    id: number
    content: string
    content_css: string
    word_count: number
    generated_at: string
  }
  error?: string
}

class ChatApi {
  private baseUrl = '/api/chat'

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to send message:', error)
      return {
        success: false,
        messageId: '',
        error: error instanceof Error ? error.message : 'Failed to send message'
      }
    }
  }

  async getChatHistory(assignmentId: number, limit: number = 50): Promise<ChatHistoryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${assignmentId}?limit=${limit}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get chat history:', error)
      return {
        success: false,
        messages: [],
        error: error instanceof Error ? error.message : 'Failed to get chat history'
      }
    }
  }

  async getCurrentGeneration(assignmentId: number): Promise<CurrentGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generation/${assignmentId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get current generation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current generation'
      }
    }
  }
}

export const chatApi = new ChatApi()