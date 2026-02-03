
export type UserDisplayMode = 'real_name' | 'pseudonym' | 'anonymous';

export interface UserProfile {
  id: string;
  name?: string;
  pseudonym?: string;
  displayMode: UserDisplayMode;
}

export interface Question {
  id: string;
  text: string;
  date: string;
  verseReference?: string;
}

export interface Response {
  id: string;
  questionId: string;
  userId: string;
  userName?: string;
  userPseudonym?: string;
  displayMode: UserDisplayMode;
  content: string;
  createdAt: string;
  reactions: {
    identificado: number;
    orando: number;
  };
  hasSensitiveContent?: boolean;
}

export type View = 'home' | 'answer' | 'collective' | 'history' | 'about' | 'report';
