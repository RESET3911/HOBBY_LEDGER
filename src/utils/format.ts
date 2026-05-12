export function formatDuration(minutes: number): string {
  if (minutes === 0) return '0分';
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
}

export function formatDate(dateStr: string): string {
  const [, mm, dd] = dateStr.split('-');
  return `${parseInt(mm)}/${parseInt(dd)}`;
}

export function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getLast6Months(): { key: string; label: string }[] {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({ key, label: `${d.getMonth() + 1}月` });
  }
  return result;
}

export function currentYYYYMM(): string {
  return today().slice(0, 7);
}
