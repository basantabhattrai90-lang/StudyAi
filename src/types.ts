export type StudyMode = 'easy' | 'teach' | 'followup';

export type StudyTone = 'concise' | 'formal' | 'engaging' | 'balanced';

export type StudyLanguage = 'english' | 'nepali';

export type AppPage = 'home' | 'chat' | 'history' | 'account';

export interface ImageAttachment {
  dataUrl: string; // base64 data url
  name: string;
  size?: number;
  mimeType: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: ImageAttachment;
  mode?: 'easy' | 'teach';
  tone?: StudyTone;
  language?: StudyLanguage;
  timestamp: number;
  isPendingModeSelection?: boolean; // When AI asks "How do you want help?"
  isStreaming?: boolean;
  questionRefId?: string; // Links response to the original question for mode switching
  originalQuestion?: {
    text: string;
    image?: ImageAttachment;
  };
}

export type Subject =
  | 'General'
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'English'
  | 'Social Studies'
  | 'Computer Science';

export interface UserAccount {
  uid: string;
  email: string | null;
  displayName: string | null;
  preferredTone?: StudyTone;
  preferredLanguage?: StudyLanguage;
  isAnonymous?: boolean;
  isLocalOnly?: boolean;
}

export interface ChatSessionMeta {
  id: string;
  userId: string;
  title: string;
  subject: Subject;
  tone: StudyTone;
  createdAt: number;
  updatedAt: number;
  preview: string;
  messageCount: number;
}
