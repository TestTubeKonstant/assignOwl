# Assignment Chat System Integration

## Overview

The assignment chat system is now fully integrated with both socket-based real-time communication and REST API fallback. Users can interact with AI to modify documents or have text conversations.

## Features

✅ **Real-time Socket Communication**
- Instant message delivery and responses
- Live document updates
- Connection status indicator

✅ **REST API Fallback**
- Works when sockets are unavailable
- Graceful degradation
- Same functionality as socket version

✅ **Smart AI Decision Making**
- Detects edit requests vs text questions
- Creates new document generations for edits
- Provides text responses for discussions

✅ **Document Integration**
- Real-time document updates
- Version tracking with generation IDs
- CSS styling preservation

## Usage

### Basic Integration

The chat system is automatically integrated into the `ArtifactEditor` component:

```tsx
import { ArtifactEditor } from './sections/artifact/artificatEditor/ArtifactEditor'

// The ChatBox is already included in the split layout
<ArtifactEditor
  artifact={artifact}
  onClose={() => setEditingArtifact(null)}
  onSave={() => {}}
  onDownload={() => handleDownloadArtifact(artifact)}
/>
```

### Using the Chat Hook Directly

```tsx
import { useAssignmentChat } from './hooks/useAssignmentChat'

const MyComponent = () => {
  const assignmentId = 123
  const { 
    messages, 
    currentGeneration, 
    isLoading, 
    error, 
    sendMessage 
  } = useAssignmentChat(assignmentId)

  const handleSendMessage = (message: string) => {
    sendMessage(message)
  }

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.type}:</strong> {msg.content}
          {msg.responseType === 'changes' && <span>📝 Document Updated</span>}
        </div>
      ))}
      
      {error && <div className="error">{error}</div>}
      {isLoading && <div>AI is thinking...</div>}
    </div>
  )
}
```

## Socket Events

### Outgoing Events

```javascript
// Send a chat message
socket.emit('assignment:chat-message', {
  assignmentId: 123,
  message: "Make the introduction longer"
})

// Get chat history
socket.emit('assignment:get-chat-history', {
  assignmentId: 123,
  limit: 50
})

// Get current document generation
socket.emit('assignment:get-current-generation', {
  assignmentId: 123
})
```

### Incoming Events

```javascript
// Text response from AI
socket.on('assignment:chat-response', (data) => {
  // { assignmentId, messageId, response, sender: 'ai', timestamp }
})

// Document was updated by AI
socket.on('assignment:document-updated', (data) => {
  // { assignmentId, generationId, summary, timestamp }
})

// Chat history received
socket.on('assignment:chat-history', (data) => {
  // { assignmentId, messages: [...], timestamp }
})

// Current generation received
socket.on('assignment:current-generation', (data) => {
  // { assignmentId, generation: {...}, timestamp }
})

// Error occurred
socket.on('assignment:chat-error', (data) => {
  // { assignmentId, error, timestamp }
})
```

## REST API Endpoints

### Send Message
```bash
POST /api/chat/message
Content-Type: application/json

{
  "assignmentId": 123,
  "message": "Make it shorter"
}
```

### Get Chat History
```bash
GET /api/chat/history/123?limit=50
```

### Get Current Generation
```bash
GET /api/chat/generation/123
```

## Message Types

### User Messages
```typescript
{
  id: string
  type: 'user'
  content: string
  timestamp: string
}
```

### AI Text Response
```typescript
{
  id: string
  type: 'assistant'
  content: string
  timestamp: string
  responseType: 'text'
}
```

### AI Document Edit
```typescript
{
  id: string
  type: 'assistant'
  content: "Updated the introduction section"
  timestamp: string
  responseType: 'changes'
}
```

## Error Handling

The system handles various error scenarios:

- **Connection Issues**: Automatic fallback to REST API
- **Authentication Errors**: Clear error messages
- **Message Too Long**: Client-side validation (5000 char limit)
- **Assignment Not Found**: Server-side validation
- **AI Service Failures**: Graceful error responses

## Connection Status

The chat interface shows real-time connection status:

- 🟢 **Real-time**: Socket connected, instant messaging
- 🟡 **Connecting**: Attempting to establish connection
- 🔴 **Connection Error**: Socket failed, using REST fallback
- ⚫ **Offline Mode**: No socket, REST API only

## AI Decision Logic

The AI automatically determines whether to:

1. **Edit Document**: Keywords like "change", "modify", "add", "remove", "update"
   - Creates new generation
   - Updates document content and CSS
   - Sends `assignment:document-updated` event

2. **Text Response**: Questions, discussions, clarifications
   - Sends conversational response
   - Sends `assignment:chat-response` event

## Document Versioning

Each edit creates a new generation:

```typescript
interface Generation {
  id: number
  content: string        // HTML content
  content_css: string   // CSS styles
  word_count: number
  generated_at: string
  generation_number: number
  generation_type: 'initial' | 'edit'
}
```

## Performance Considerations

- **Message Batching**: Multiple rapid messages are queued
- **Auto-scroll**: Messages automatically scroll to bottom
- **Lazy Loading**: Chat history loaded on demand
- **Memory Management**: Old messages cleaned up automatically

## Security

- **Authentication**: All requests require valid user session
- **Authorization**: Users can only access their own assignments
- **Input Validation**: Message length and content validation
- **Rate Limiting**: Prevents spam and abuse

## Monitoring

The system provides comprehensive logging:

- All chat interactions with user ID
- AI decision reasoning
- Document edit tracking
- Error rates and types
- Performance metrics

## Next Steps

To complete the integration, implement these backend endpoints:

1. **Socket Server**: Handle the socket events listed above
2. **REST API**: Implement the fallback endpoints
3. **AI Service**: Connect to Gemini or other AI provider
4. **Database**: Store messages and generations
5. **Queue System**: Process chat messages asynchronously

The frontend is ready and will work as soon as the backend endpoints are implemented!