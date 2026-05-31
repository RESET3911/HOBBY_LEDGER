import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';
import { formatDuration } from './format';

// ── Helpers ──────────────────────────────────────────────────────
type FsUser = 'saku' | 'takahashi' | 'both';

function hobbyUserToFsId(user: User): FsUser {
  return user === 'けんしん' ? 'takahashi' : 'saku';
}

async function ntfyPush(topic: string, title: string, body: string): Promise<void> {
  if (!topic.trim()) return;
  await fetch('https://ntfy.sh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: topic.trim(), title, message: body }),
  });
}

async function writeNotification(params: {
  toUser: FsUser;
  type: string;
  title: string;
  body: string;
  linkedId?: string | null;
}): Promise<void> {
  await addDoc(collection(db, 'notifications'), {
    toUser: params.toUser,
    fromApp: 'hobby',
    type: params.type,
    title: params.title,
    body: params.body,
    isRead: false,
    linkedUrl: 'https://RESET3911.github.io/HOBBY_LEDGER/',
    linkedId: params.linkedId ?? null,
    createdAt: Date.now(),
  });
}

// ── Public API ────────────────────────────────────────────────────

// 趣味ログ追加通知（相手に知らせる）
export async function notifyLogAdded(
  user: User,
  hobbyName: string,
  title: string,
  duration: number,
  topic: string,
  logId?: string,
): Promise<void> {
  const otherFsUser: FsUser = user === 'けんしん' ? 'saku' : 'takahashi';
  const bodyText = duration > 0
    ? `${hobbyName} ·「${title}」· ${formatDuration(duration)}`
    : `${hobbyName} ·「${title}」· 支出のみ`;
  const notifTitle = `📒 ${user}が記録しました`;

  await Promise.allSettled([
    writeNotification({ toUser: otherFsUser, type: 'hobby_log_added', title: notifTitle, body: bodyText, linkedId: logId ?? null }),
    ntfyPush(topic, notifTitle, bodyText),
  ]);
}

// 月次予算超過通知
export async function notifyBudgetOver(
  user: User,
  hobbyName: string,
  overAmount: number,
  topic: string,
): Promise<void> {
  const toUser = hobbyUserToFsId(user);
  const title = `📒 趣味予算オーバー`;
  const body  = `${user}の「${hobbyName}」が今月の予算を ¥${overAmount.toLocaleString('ja-JP')} 超過しました`;

  await Promise.allSettled([
    writeNotification({ toUser, type: 'hobby_budget_over', title, body }),
    ntfyPush(topic, title, body),
  ]);
}
