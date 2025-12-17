export interface Agent {
  id: string;
  name: string;
  description: string;
  iconColor: string;
  icon: 'shield' | 'radar' | 'coin' | 'grid'; // Simplified icon mapping
}

export enum MessageType {
  TEXT = 'text',
  IMAGE_CHOICE = 'image_choice', // For Quick Judgment
  IMAGE_REQUEST = 'image_request', // For Collection
  REPORT = 'report',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  sender: 'user' | 'agent';
  type: MessageType;
  content: string; // Text content or JSON string for complex data
  timestamp: number;
  isLoading?: boolean;
  // Optional extras for task state
  taskData?: {
    imageUrl?: string;
    options?: string[];
    correctOption?: string;
    targetObject?: string; // For collection task (e.g., "car")
    userImage?: string; // For when user uploads
    isCorrect?: boolean;
  };
}

export enum TaskType {
  NONE = 'none',
  QUICK_JUDGMENT = 'quick_judgment',
  COLLECTION = 'collection',
}

export interface TaskState {
  isActive: boolean;
  type: TaskType;
  currentRound: number; // 0 to 10
  score: number;
  totalRounds: number;
  history: Array<{
    round: number;
    correct: boolean;
    timestamp: number;
  }>;
}

export interface UserStats {
  userId: string;
  username: string;
  quickTasksCompleted: number;
  collectionTasksCompleted: number;
  quickScoreTotal: number;
  collectionScoreTotal: number;
}