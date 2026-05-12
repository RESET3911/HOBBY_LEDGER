import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Hobby, HobbyLog } from '../types';
import { formatDuration, formatAmount, formatCostPerHour } from '../utils/format';
import { useState } from 'react';

interface Props {
  hobbies: Hobby[];
  logs: HobbyLog[];
  onBack: () => void;
}

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function YearlySummaryScreen({ hobbies, logs, onBack }: Props) {
  const currentYear = new Date().getFullYear();
  const years = [...new Set(logs.map(l => parseInt(l.date.slice(0, 4))))].sort((a, b) => b - a);
  if (!years.includes(currentYear)) years.unshift(currentYear);

  const [year, setYear] = useState(currentYear);

  const yearLogs = logs.filter(l => l.date.startsWith(String(year)));
  const totalDuration = yearLogs.reduce((s, l) => s + l.duration, 0);
  const totalAmount = yearLogs.reduce((s, l) => s + l.amount, 0);
  const totalSessions = yearLogs.length;

  // Monthly breakdown
  const monthlyData = MONTH_LABELS.map((label, i) => {
    const key = `${year}-${String(i + 1).padStart(2, '0')}`;
    const ml = yearLogs.filter(l => l.date.startsWith(key));
    return {
      label,
      時間: Math.round(ml.reduce((s, l) => s + l.duration, 0) / 60 * 10) / 10,
      支出: ml.reduce((s, l) => s + l.amount, 0),
    };
  });

  // Best month
  const bestMonth = monthlyData.reduce((best, m) => m.時間 > best.時間 ? m : best, monthlyData[0]);

  // Per-hobby breakdown
  const hobbyBreakdown = hobbies.map(h => {
    const hl = yearLogs.filter(l => l.hobbyId === h.id);
    const dur = hl.reduce((s, l) => s + l.duration, 0);
    const amt = hl.reduce((s, l) => s + l.amount, 0);
    return { hobby: h, sessions: hl.length, duration: dur, amount: amt };
  }).filter(d => d.sessions > 0).sort((a, b) => b.duration - a.duration);

  const topHobby = hobbyBreakdown[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ecfdf5 100%)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={onBack} className="text-gray-400 text-2xl leading-none">‹</button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">年間サマリー</h1>
          <p className="text-sm text-gray-400">1年間の趣味ログ</p>
        </div>
      </div>

      {/* Year selector */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => setYear(y => y - 1)}
          disabled={!years.includes(year - 1) && year - 1 !== currentYear}
          className="text-gray-400 disabled:opacity-30 text-xl px-2"
        >
          ‹
        </button>
        <span className="text-2xl font-bold text-gray-800">{year}</span>
        <button
          onClick={() => setYear(y => y + 1)}
          disabled={year >= currentYear}
          className="text-gray-400 disabled:opacity-30 text-xl px-2"
        >
          ›
        </button>
      </div>

      <div className="flex-1 px-5 pb-10 space-y-4">
        {yearLogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">{year}年の記録はありません</p>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{totalSessions}</div>
                  <div className="text-xs text-gray-400">総回数</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">{formatDuration(totalDuration)}</div>
                  <div className="text-xs text-gray-400">総時間</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">{totalAmount > 0 ? formatAmount(totalAmount) : '―'}</div>
                  <div className="text-xs text-gray-400">総支出</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-violet-600">{formatCostPerHour(totalAmount, totalDuration)}</div>
                  <div className="text-xs text-gray-400">時間単価</div>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3">
              {topHobby && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-gray-400 mb-1">最多活動</p>
                  <div className="text-2xl mb-1">{topHobby.hobby.emoji}</div>
                  <p className="text-sm font-bold text-gray-800">{topHobby.hobby.name}</p>
                  <p className="text-xs text-gray-400">{formatDuration(topHobby.duration)}</p>
                </div>
              )}
              {bestMonth.時間 > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-gray-400 mb-1">最も活動した月</p>
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="text-sm font-bold text-gray-800">{bestMonth.label}</p>
                  <p className="text-xs text-gray-400">{bestMonth.時間}時間</p>
                </div>
              )}
            </div>

            {/* Monthly chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 mb-3">月別 活動時間（時間）</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="時間" radius={[4, 4, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-hobby breakdown */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 mb-3">趣味別まとめ</p>
              <div className="space-y-3">
                {hobbyBreakdown.map(({ hobby, sessions, duration, amount }) => (
                  <div key={hobby.id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: hobby.color + '33' }}
                    >
                      {hobby.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 truncate">{hobby.name}</span>
                        <span className="text-xs text-violet-600 font-semibold ml-2 flex-shrink-0">
                          {formatCostPerHour(amount, duration)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {sessions}回 · {formatDuration(duration)}{amount > 0 ? ` · ${formatAmount(amount)}` : ''}
                      </div>
                      {/* Duration bar */}
                      <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, duration / (totalDuration || 1) * 100)}%`,
                            backgroundColor: hobby.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
