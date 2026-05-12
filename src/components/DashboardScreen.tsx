import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { Hobby, HobbyLog, User } from '../types';
import { formatDuration, formatAmount, formatCostPerHour, getLast6Months } from '../utils/format';

interface Props {
  hobbies: Hobby[];
  logs: HobbyLog[];
  onBack: () => void;
}

const USER_COLORS: Record<User, string> = {
  けんしん: '#3b82f6',
  れな: '#ec4899',
};

export default function DashboardScreen({ hobbies, logs, onBack }: Props) {
  const totalSessions = logs.length;
  const totalDuration = logs.reduce((s, l) => s + l.duration, 0);
  const totalAmount = logs.reduce((s, l) => s + l.amount, 0);

  const kenshinLogs = logs.filter(l => l.user === 'けんしん');
  const renaLogs = logs.filter(l => l.user === 'れな');

  const userStats = [
    {
      user: 'けんしん' as User,
      sessions: kenshinLogs.length,
      duration: kenshinLogs.reduce((s, l) => s + l.duration, 0),
      amount: kenshinLogs.reduce((s, l) => s + l.amount, 0),
    },
    {
      user: 'れな' as User,
      sessions: renaLogs.length,
      duration: renaLogs.reduce((s, l) => s + l.duration, 0),
      amount: renaLogs.reduce((s, l) => s + l.amount, 0),
    },
  ];

  const hobbyCompare = hobbies.map(h => {
    const hl = logs.filter(l => l.hobbyId === h.id);
    const dur = hl.reduce((s, l) => s + l.duration, 0);
    const amt = hl.reduce((s, l) => s + l.amount, 0);
    return {
      name: h.emoji + h.name,
      時間: Math.round(dur / 60 * 10) / 10,
      支出: amt,
      color: h.color,
      yph: dur > 0 ? Math.round(amt / (dur / 60)) : null,
    };
  }).filter(h => h.時間 > 0 || h.支出 > 0);

  const pieData = hobbies
    .map(h => ({ name: h.name, value: logs.filter(l => l.hobbyId === h.id).reduce((s, l) => s + l.amount, 0), color: h.color }))
    .filter(d => d.value > 0);

  const months = getLast6Months();
  const monthlyTrend = months.map(({ key, label }) => {
    const ml = logs.filter(l => l.date.startsWith(key));
    return {
      label,
      時間: Math.round(ml.reduce((s, l) => s + l.duration, 0) / 60 * 10) / 10,
      支出: ml.reduce((s, l) => s + l.amount, 0),
    };
  });

  const hasAmount = totalAmount > 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ecfdf5 100%)' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={onBack} className="text-gray-400 text-2xl leading-none">‹</button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">総合ダッシュボード</h1>
          <p className="text-sm text-gray-400">全趣味の統計</p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-10 space-y-4">
        {/* Total stats */}
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
              <div className="text-sm font-bold text-gray-800">{hasAmount ? formatAmount(totalAmount) : '―'}</div>
              <div className="text-xs text-gray-400">総支出</div>
            </div>
            <div>
              <div className="text-sm font-bold text-violet-600">{formatCostPerHour(totalAmount, totalDuration)}</div>
              <div className="text-xs text-gray-400">時間単価</div>
            </div>
          </div>
        </div>

        {/* User comparison */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 mb-3">ユーザー別</p>
          <div className="grid grid-cols-2 gap-3">
            {userStats.map(({ user, sessions, duration, amount }) => (
              <div
                key={user}
                className="rounded-xl p-3 text-white"
                style={{ background: `linear-gradient(135deg, ${USER_COLORS[user]}, ${USER_COLORS[user]}99)` }}
              >
                <div className="text-sm font-bold mb-2">{user}</div>
                <div className="text-xs opacity-90">{sessions}回</div>
                <div className="text-xs opacity-90">{formatDuration(duration)}</div>
                {amount > 0 && <div className="text-xs opacity-90">{formatAmount(amount)}</div>}
                <div className="text-xs opacity-90 mt-1 font-semibold">{formatCostPerHour(amount, duration)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hobby comparison */}
        {hobbyCompare.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 mb-3">趣味別 活動時間（時間）</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hobbyCompare} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === '時間') return [`${value}h`, '活動時間'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="時間" radius={[4, 4, 0, 0]}>
                  {hobbyCompare.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* ¥/h per hobby */}
            <div className="mt-3 flex flex-wrap gap-2">
              {hobbyCompare.filter(h => h.yph !== null).map(h => (
                <span key={h.name} className="text-xs text-gray-500">
                  {h.name} <span className="font-semibold text-violet-600">¥{h.yph?.toLocaleString()}/h</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Spending pie */}
        {pieData.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 mb-3">趣味別 支出</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatAmount(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <div className="text-xs text-gray-600 truncate">{d.name}</div>
                    <div className="text-xs font-medium text-gray-800 ml-auto">{formatAmount(d.value)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Monthly trend */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 mb-3">月別 活動時間トレンド（時間）</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="時間" stroke="#8b5cf6" fill="url(#colorHours)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
