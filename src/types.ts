export type User = 'けんしん' | 'れな';

export interface Hobby {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export interface HobbyLog {
  id: string;
  hobbyId: string;
  user: User;
  date: string;
  duration: number;
  amount: number;
  memo: string;
  createdAt: string;
}
