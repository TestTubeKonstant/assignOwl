import { create } from 'zustand';

interface GeneratedContent {
    content: string; // HTML content
    content_css: string; // CSS styles
    word_count: number;
    generated_at: string;
    generation_id: number;
}

interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: string;
    // Response type for assistant messages - 'changes' if document was modified, 'text' for normal conversation
    responseType?: 'text' | 'changes';
}

interface AssignmentData {
    success: boolean;
    assignmentId: number;
    // Basic assignment info (null if not available)
    title: string | null;
    description: string | null;
    status: string;
    assignment_type: string | null;
    subject: string | null;
    word_count: number | null;
    created_at: string;
    updated_at: string;
    // Generated content (null if not generated)
    generated_content: GeneratedContent | null;
    // Status flags for easy checking
    has_title: boolean;
    has_description: boolean;
    has_generated_content: boolean;
    timestamp: string;
    // Chat messages array
    chat_messages: ChatMessage[];
}

interface MessagesStore {
    value: AssignmentData;
    update: (key: keyof AssignmentData, value: any) => void;
    addChatMessage: (message: ChatMessage) => void;
    setChatMessages: (messages: ChatMessage[]) => void;
    resetChat: () => void;
    setAssignmentId: (id: number) => void;
}

export const useMessagesStore = create<MessagesStore>((set) => ({
    value: {
        success: false,
        assignmentId: 0,
        // Basic assignment info (null if not available)
        title: null,
        description: null,
        status: "",
        assignment_type: null,
        subject: null,
        word_count: null,
        created_at: "",
        updated_at: "",
        // Generated content (null if not generated)
        generated_content: null,
        // Status flags for easy checking
        has_title: false,
        has_description: false,
        has_generated_content: false,
        timestamp: "",
        // Chat messages array
        chat_messages: []
    },
    update: (key, value) => set((state) => ({
        value: { ...state.value, [key]: value }
    })),
    addChatMessage: (message) => set((state) => ({
        value: {
            ...state.value,
            chat_messages: [...state.value.chat_messages, message]
        }
    })),
    setChatMessages: (messages) => set((state) => ({
        value: { ...state.value, chat_messages: messages }
    })),
    resetChat: () => set((state) => ({
        value: {
            ...state.value,
            chat_messages: [],
            generated_content: null,
            has_generated_content: false
        }
    })),
    setAssignmentId: (id) => set((state) => ({
        value: { ...state.value, assignmentId: id }
    })),
}));