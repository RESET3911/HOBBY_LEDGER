export type User = 'けんしん' | 'れな';

export interface HobbyGoals {
  monthlyHours: number;
  monthlyBudget: number;
}

export interface HobbyLedgerSettings {
  ntfyTopic: string;
}

export interface Hobby {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
  tags?: string[];
  goals?: HobbyGoals;
}

export interface HobbyLog {
  id: string;
  hobbyId: string;
  user: User;
  date: string;
  title: string;
  duration: number;
  amount: number;
  memo: string;
  tags?: string[];
  createdAt: string;
}
