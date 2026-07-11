import { User, USER_LABELS } from '../types';
import { formatDuration } from './format';
import { writeNotification, ntfyPush } from '../shared/notify';
import { other } from '../shared/users';

const APP_URL = 'https://RESET3911.github.io/HOBBY_LEDGER/';

// 趣味ログ追加通知（相手に知らせる）
export async function notifyLogAdded(
  user: User,
  hobbyName: string,
  title: string,
  duration: number,
  topic: string,
  logId?: string,
): Promise<void> {
  const bodyText = duration > 0
    ? `${hobbyName} ·「${title}」· ${formatDuration(duration)}`
    : `${hobbyName} ·「${title}」· 支出のみ`;
  const notifTitle = `📒 ${USER_LABELS[user]}が記録しました`;

  await Promise.allSettled([
    writeNotification({ toUser: other(user), fromApp: 'hobby', type: 'hobby_log_added', title: notifTitle, body: bodyText, linkedUrl: APP_URL, linkedId: logId ?? null }),
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
  const title = `📒 趣味予算オーバー`;
  const body  = `${USER_LABELS[user]}の「${hobbyName}」が今月の予算を ¥${overAmount.toLocaleString('ja-JP')} 超過しました`;

  await Promise.allSettled([
    writeNotification({ toUser: user, fromApp: 'hobby', type: 'hobby_budget_over', title, body, linkedUrl: APP_URL }),
    ntfyPush(topic, title, body),
  ]);
}
