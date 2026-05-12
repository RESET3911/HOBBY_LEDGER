import { Hobby, HobbyLog, User } from '../types';
import { formatDuration, currentYYYYMM } from '../utils/format';

interface Props {
  currentUser: User;
  hobbies: Hobby[];
  logs: HobbyLog[];
  onSelectHobby: (id: string) => void;
  onAddHobby: () => void;
  onDashboard: () => void;
  onSwitchUser: () => void;
}

export default function HobbyListScreen({
  currentUser, hobbies, logs, onSelectHobby, onAddHobby, onDashboard, onSwitchUser,
}: Props) {
  const thisMonth = currentYYYYMM();

  function hobbyStats(id: string) {
    const hobbyLogs = logs.filter(l => l.hobbyId === id);
    const monthLogs = hobbyLogs.filter(l => l.date.startsWith(thisMonth));
    const totalDuration = monthLogs.reduce((s, l) => s + l.duration, 0);
    const lastLog = hobbyLogs[0];
    return { sessions: monthLogs.length, duration: totalDuration, lastLog };
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ecfdf5 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hobby Ledger</h1>
          <p className="text-sm text-gray-400">{currentUser}</p>
        </div>
        <button onClick={onSwitchUser} className="text-xs text-gray-400 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100">
          切替
        </button>
      </div>

      {/* Dashboard button */}
      <div className="px-5 mb-4">
        <button
          onClick={onDashboard}
          className="w-full flex items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div className="text-left">
              <div className="text-sm font-bold text-gray-800">総合ダッシュボード</div>
              <div className="text-xs text-gray-400">全趣味の統計・グラフ</div>
            </div>
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </button>
      </div>

      {/* Hobby list */}
      <div className="flex-1 px-5 pb-28">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">趣味一覧</p>

        {hobbies.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🌱</div>
            <p className="text-gray-400 text-sm">まだ趣味がありません</p>
            <p className="text-gray-300 text-xs mt-1">下のボタンから追加してみよう</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {hobbies.map(hobby => {
              const { sessions, duration, lastLog } = hobbyStats(hobby.id);
              return (
                <button
                  key={hobby.id}
                  onClick={() => onSelectHobby(hobby.id)}
                  className="bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 active:scale-95 transition-transform"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                    style={{ backgroundColor: hobby.color + '22' }}
                  >
                    {hobby.emoji}
                  </div>
                  <div className="font-bold text-gray-800 text-sm truncate">{hobby.name}</div>
                  {sessions > 0 ? (
                    <div className="text-xs text-gray-400 mt-1">
                      今月 {sessions}回 · {formatDuration(duration)}
                    </div>
                  ) : lastLog ? (
                    <div className="text-xs text-gray-300 mt-1">今月の記録なし</div>
                  ) : (
                    <div className="text-xs text-gray-300 mt-1">まだ記録なし</div>
                  )}
                  <div
                    className="mt-2 h-1 rounded-full"
                    style={{ backgroundColor: hobby.color + '55', width: sessions > 0 ? '100%' : '0%' }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-5">
        <button
          onClick={onAddHobby}
          className="text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)' }}
        >
          +
        </button>
      </div>
    </div>
  );
}
