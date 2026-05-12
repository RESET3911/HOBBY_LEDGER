export function calcStreak(logs: { date: string }[]): { current: number; max: number } {
  if (logs.length === 0) return { current: 0, max: 0 };

  const dateSet = new Set(logs.map(l => l.date));
  const dates = [...dateSet].sort();

  const ds = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // Current streak (allow today or yesterday as start)
  let current = 0;
  const d = new Date();
  if (!dateSet.has(ds(d))) d.setDate(d.getDate() - 1);
  while (dateSet.has(ds(d))) {
    current++;
    d.setDate(d.getDate() - 1);
  }

  // Max streak
  let max = current;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000;
    if (Math.round(diff) === 1) {
      run++;
      if (run > max) max = run;
    } else {
      run = 1;
    }
  }

  return { current, max };
}
