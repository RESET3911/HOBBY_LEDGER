import { User } from '../types';
import { formatDuration } from './format';

export async function notifyLogAdded(
  user: User,
  hobbyName: string,
  title: string,
  duration: number,
  topic: string
): Promise<void> {
  if (!topic.trim()) return;
  const message = duration > 0
    ? `${hobbyName} ·「${title}」· ${formatDuration(duration)}`
    : `${hobbyName} ·「${title}」· 支出のみ`;
  await fetch(`https://ntfy.sh/${topic.trim()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: topic.trim(),
      title: `📒 ${user}が記録しました`,
      message,
    }),
  });
}
