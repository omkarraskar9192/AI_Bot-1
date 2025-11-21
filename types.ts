export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface GroundingMetadata {
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  webSearchQueries?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
  groundingMetadata?: GroundingMetadata;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}
