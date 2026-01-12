
export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  imageUrl?: string;
  timestamp: number;
}

export interface AppState {
  messages: Message[];
  currentImage: string | null;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  error: string | null;
}
