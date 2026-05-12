import { Hobby, HobbyLog, User } from '../types';
import { formatDuration, currentYYYYMM } from '../utils/format';
import { calcStreak } from '../utils/streak';

interface Props {
  currentUser: User;
  hobbies: Hobby[];
  logs: HobbyLog[];
  onSelectHobby: (id: string) => void;
  onAddHobby: () => void;
  onDashboard: () => void;
  onSwitchUser: () => void;
  onOpenSettings: () => void;
}

export default function HobbyListScreen({
  currentUser, hobbies, logs, onSelectHobby, onAddHobby, onDashboard, onSwitchUser, onOpenSettings,
}: Props) {
  const thisMonth = currentYYYYMM();

  function hobbyStats(id: string) {
    const hl = logs.filter(l => l.hobbyId === id);
    const ml = hl.filter(l => l.date.startsWith(thisMonth));
    const streak = calcStreak(hl);
    return {
      sessions: ml.length,
      duration: ml.reduce((s, l) => s + l.duration, 0),
      amount: ml.reduce((s, l) => s + l.amount, 0),
      streak: streak.current,
    };
  }

  function goalProgress(hobby: Hobby, duration: number, amount: number) {
    const goals = hobby.goals;
    if (!goals) return null;
    const hoursPct = goals.monthlyHours > 0 ? duration / (goals.monthlyHours * 60) : null;
    const budgetPct = goals.monthlyBudget > 0 ? amount / goals.monthlyBudget : null;
    return { hoursPct, budgetPct };
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ecfdf5 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hobby Ledger</h1>
          <p className="text-sm text-gray-400">{currentUser}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenSettings} className="text-gray-400 text-lg px-1">⚙️</button>
          <button onClick={onSwitchUser} className="text-xs text-gray-400 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100">
            切替
          </button>
        </div>
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
              <div className="text-xs text-gray-400">全趣味の統計・グラフ・年間サマリー</div>
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
              const { sessions, duration, amount, streak } = hobbyStats(hobby.id);
              const progress = goalProgress(hobby, duration, amount);
              return (
                <button
                  key={hobby.id}
                  onClick={() => onSelectHobby(hobby.id)}
                  className="bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 active:scale-95 transition-transform"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: hobby.color + '22' }}
                    >
                      {hobby.emoji}
                    </div>
                    {streak > 0 && (
                      <span className="text-xs bg-orange-50 text-orange-400 rounded-full px-1.5 py-0.5 font-medium">
                        🔥{streak}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-gray-800 text-sm truncate">{hobby.name}</div>
                  {sessions > 0 ? (
                    <div className="text-xs text-gray-400 mt-0.5">今月 {sessions}回 · {formatDuration(duration)}</div>
                  ) : (
                    <div className="text-xs text-gray-300 mt-0.5">今月の記録なし</div>
                  )}

                  {/* Goal progress bars */}
                  {progress?.hoursPct !== null && progress?.hoursPct !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-300">時間目標</span>
                        <span style={{ color: progress.hoursPct > 1 ? '#22c55e' : hobby.color }}>
                          {Math.round(progress.hoursPct * 100)}%
                        </span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, progress.hoursPct * 100)}%`,
                            backgroundColor: progress.hoursPct > 1 ? '#22c55e' : hobby.color,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {progress?.budgetPct !== null && progress?.budgetPct !== undefined && (
                    <div className="mt-1.5">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-300">予算</span>
                        <span style={{ color: progress.budgetPct > 1 ? '#ef4444' : '#10b981' }}>
                          {Math.round(progress.budgetPct * 100)}%
                        </span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, progress.budgetPct * 100)}%`,
                            backgroundColor: progress.budgetPct > 1 ? '#ef4444' : '#10b981',
                          }}
                        />
                      </div>
                    </div>
                  )}
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
