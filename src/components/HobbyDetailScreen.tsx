import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { Hobby, HobbyGoals, HobbyLog, User } from '../types';
import { formatDuration, formatDate, formatAmount, formatCostPerHour, getLast6Months, currentYYYYMM } from '../utils/format';
import { calcStreak } from '../utils/streak';
import TagsModal from './TagsModal';
import GoalModal from './GoalModal';
import CalendarView from './CalendarView';

interface Props {
  hobby: Hobby;
  logs: HobbyLog[];
  currentUser: User;
  onBack: () => void;
  onAddLog: () => void;
  onEditLog: (logId: string) => void;
  onDeleteLog: (logId: string) => void;
  onDeleteHobby: () => void;
  onUpdateTags: (tags: string[]) => void;
  onUpdateGoals: (goals: HobbyGoals) => void;
}

const USER_COLORS: Record<User, string> = {
  けんしん: '#3b82f6',
  れな: '#ec4899',
};

type ModalState = 'none' | 'menu' | 'tags' | 'goal' | 'deleteConfirm';

export default function HobbyDetailScreen({
  hobby, logs, onBack, onAddLog, onEditLog, onDeleteLog, onDeleteHobby, onUpdateTags, onUpdateGoals,
}: Props) {
  const [tab, setTab] = useState<'log' | 'graph'>('log');
  const [modal, setModal] = useState<ModalState>('none');

  // Filter state
  const [filterUser, setFilterUser] = useState<User | 'all'>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const allTags = hobby.tags ?? [];
  const activeFilterCount = (filterUser !== 'all' ? 1 : 0) + filterTags.length + (searchText ? 1 : 0);

  const filteredLogs = useMemo(() => logs.filter(l => {
    if (filterUser !== 'all' && l.user !== filterUser) return false;
    if (filterTags.length > 0 && !filterTags.every(t => (l.tags ?? []).includes(t))) return false;
    if (searchText && !l.title.includes(searchText) && !l.memo.includes(searchText)) return false;
    return true;
  }), [logs, filterUser, filterTags, searchText]);

  const toggleFilterTag = (tag: string) => {
    setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Stats
  const totalSessions = logs.length;
  const totalDuration = logs.reduce((s, l) => s + l.duration, 0);
  const totalAmount = logs.reduce((s, l) => s + l.amount, 0);
  const hasAmount = totalAmount > 0;
  const { current: streak, max: maxStreak } = calcStreak(logs);

  // Goal progress
  const thisMonthLogs = logs.filter(l => l.date.startsWith(currentYYYYMM()));
  const monthDuration = thisMonthLogs.reduce((s, l) => s + l.duration, 0);
  const monthAmount = thisMonthLogs.reduce((s, l) => s + l.amount, 0);
  const goals = hobby.goals;

  // Graph data
  const months = getLast6Months();
  const monthlyData = months.map(({ key, label }) => {
    const ml = logs.filter(l => l.date.startsWith(key));
    return {
      label,
      けんしん: ml.filter(l => l.user === 'けんしん').reduce((s, l) => s + l.duration, 0),
      れな: ml.filter(l => l.user === 'れな').reduce((s, l) => s + l.duration, 0),
    };
  });
  const monthlyAmount = months.map(({ key, label }) => {
    const ml = logs.filter(l => l.date.startsWith(key));
    return {
      label,
      けんしん: ml.filter(l => l.user === 'けんしん').reduce((s, l) => s + l.amount, 0),
      れな: ml.filter(l => l.user === 'れな').reduce((s, l) => s + l.amount, 0),
    };
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ecfdf5 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 text-2xl leading-none">‹</button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: hobby.color + '33' }}>
            {hobby.emoji}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">{hobby.name}</h1>
            {streak > 0 && (
              <p className="text-xs text-orange-400">🔥 {streak}日連続 (最大{maxStreak}日)</p>
            )}
          </div>
        </div>
        <button onClick={() => setModal('menu')} className="text-gray-400 text-xl px-2">···</button>
      </div>

      {/* Goal progress (if set) */}
      {goals && (goals.monthlyHours > 0 || goals.monthlyBudget > 0) && (
        <div className="mx-5 mb-3 bg-white rounded-2xl px-4 py-3 shadow-sm space-y-2">
          {goals.monthlyHours > 0 && (() => {
            const pct = monthDuration / (goals.monthlyHours * 60);
            return (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">🎯 月間時間目標</span>
                  <span style={{ color: pct >= 1 ? '#22c55e' : hobby.color }}>
                    {formatDuration(monthDuration)} / {goals.monthlyHours}時間 ({Math.round(pct * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct * 100)}%`, backgroundColor: pct >= 1 ? '#22c55e' : hobby.color }} />
                </div>
              </div>
            );
          })()}
          {goals.monthlyBudget > 0 && (() => {
            const pct = monthAmount / goals.monthlyBudget;
            return (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">💰 月間予算</span>
                  <span style={{ color: pct > 1 ? '#ef4444' : '#10b981' }}>
                    {formatAmount(monthAmount)} / {formatAmount(goals.monthlyBudget)} ({Math.round(pct * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct * 100)}%`, backgroundColor: pct > 1 ? '#ef4444' : '#10b981' }} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tabs */}
      <div className="flex mx-5 bg-white rounded-xl p-1 shadow-sm mb-3">
        {(['log', 'graph'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'text-white shadow' : 'text-gray-400'}`}
            style={tab === t ? { background: `linear-gradient(135deg, ${hobby.color}, ${hobby.color}cc)` } : {}}
          >
            {t === 'log' ? '📋 ログ' : '📊 グラフ'}
          </button>
        ))}
      </div>

      {/* Log tab */}
      {tab === 'log' && (
        <div className="flex-1 px-5 pb-28">
          {/* Filter bar */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
                <span className="text-gray-300 text-sm">🔍</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="タイトル・メモで検索"
                  className="flex-1 text-sm text-gray-700 focus:outline-none bg-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`relative bg-white rounded-xl px-3 py-2 shadow-sm text-sm ${showFilter ? 'text-violet-600' : 'text-gray-400'}`}
              >
                🏷️
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: hobby.color }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {showFilter && (
              <div className="bg-white rounded-xl mt-2 p-3 shadow-sm space-y-2">
                {/* User filter */}
                <div className="flex gap-2">
                  {(['all', 'けんしん', 'れな'] as const).map(u => (
                    <button
                      key={u}
                      onClick={() => setFilterUser(u)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterUser === u ? 'text-white border-transparent' : 'text-gray-400 border-gray-200'}`}
                      style={filterUser === u ? { backgroundColor: u === 'けんしん' ? '#3b82f6' : u === 'れな' ? '#ec4899' : hobby.color } : {}}
                    >
                      {u === 'all' ? '全員' : u}
                    </button>
                  ))}
                </div>
                {/* Tag filter */}
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleFilterTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterTags.includes(tag) ? 'text-white border-transparent' : 'text-gray-400 border-gray-200'}`}
                        style={filterTags.includes(tag) ? { backgroundColor: hobby.color } : {}}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setFilterUser('all'); setFilterTags([]); setSearchText(''); }}
                    className="text-xs text-red-400"
                  >
                    フィルターをクリア
                  </button>
                )}
              </div>
            )}
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">{logs.length === 0 ? '📝' : '🔍'}</div>
              <p className="text-gray-400 text-sm">{logs.length === 0 ? 'まだ記録がありません' : '該当する記録がありません'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map(log => (
                <div key={log.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="font-bold text-gray-800 text-sm flex-1 pr-2 leading-snug">{log.title || '（タイトルなし）'}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => onEditLog(log.id)} className="text-gray-300 text-sm px-1">✏️</button>
                      <button onClick={() => onDeleteLog(log.id)} className="text-gray-300 text-sm px-1">🗑️</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">{formatDate(log.date)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: USER_COLORS[log.user] }}>
                      {log.user}
                    </span>
                    {log.duration > 0
                      ? <span className="text-xs font-medium text-gray-600">⏱ {formatDuration(log.duration)}</span>
                      : <span className="text-xs font-medium text-amber-500">支出のみ</span>
                    }
                    {log.amount > 0 && <span className="text-xs font-medium text-emerald-600">{formatAmount(log.amount)}</span>}
                  </div>
                  {(log.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(log.tags ?? []).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: hobby.color + 'bb' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {log.memo && <p className="text-xs text-gray-400 mt-2 leading-relaxed">{log.memo}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Graph tab */}
      {tab === 'graph' && (
        <div className="flex-1 px-5 pb-8 space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-gray-800">{totalSessions}</div>
                <div className="text-xs text-gray-400">回</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">{formatDuration(totalDuration)}</div>
                <div className="text-xs text-gray-400">合計時間</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">{hasAmount ? formatAmount(totalAmount) : '―'}</div>
                <div className="text-xs text-gray-400">合計支出</div>
              </div>
              <div>
                <div className="text-sm font-bold text-violet-600">{formatCostPerHour(totalAmount, totalDuration)}</div>
                <div className="text-xs text-gray-400">時間単価</div>
              </div>
            </div>
          </div>

          {/* Monthly duration */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 mb-3">月別 活動時間（分）</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="けんしん" stackId="a" fill={USER_COLORS['けんしん']} />
                <Bar dataKey="れな" stackId="a" fill={USER_COLORS['れな']} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly amount */}
          {hasAmount && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 mb-3">月別 支出（円）</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyAmount} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="けんしん" stackId="a" fill={USER_COLORS['けんしん']} />
                  <Bar dataKey="れな" stackId="a" fill={USER_COLORS['れな']} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Calendar view */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 mb-3">📅 活動カレンダー（過去1年）</p>
            <CalendarView logs={logs} color={hobby.color} />
          </div>
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-6 right-5">
        <button
          onClick={onAddLog}
          className="text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${hobby.color}, ${hobby.color}99)` }}
        >
          +
        </button>
      </div>

      {/* Options menu */}
      {modal === 'menu' && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-end justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setModal('none'); }}>
          <div className="bg-white rounded-3xl p-4 w-full max-w-sm shadow-2xl space-y-2">
            <button onClick={() => setModal('tags')} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 text-left">
              <span className="text-xl">🏷️</span>
              <div>
                <div className="font-semibold text-gray-800 text-sm">タグを管理</div>
                <div className="text-xs text-gray-400">ログに付けられるタグを追加・削除</div>
              </div>
            </button>
            <button onClick={() => setModal('goal')} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 text-left">
              <span className="text-xl">🎯</span>
              <div>
                <div className="font-semibold text-gray-800 text-sm">月間目標を設定</div>
                <div className="text-xs text-gray-400">活動時間・支出予算の目標</div>
              </div>
            </button>
            <button onClick={() => setModal('deleteConfirm')} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-red-50 text-left">
              <span className="text-xl">🗑️</span>
              <div className="font-semibold text-red-500 text-sm">趣味を削除</div>
            </button>
            <button onClick={() => setModal('none')} className="w-full py-3 rounded-2xl bg-gray-100 text-gray-500 text-sm font-medium">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {modal === 'tags' && (
        <TagsModal hobby={hobby} onUpdate={onUpdateTags} onClose={() => setModal('none')} />
      )}
      {modal === 'goal' && (
        <GoalModal hobby={hobby} onSave={onUpdateGoals} onClose={() => setModal('none')} />
      )}
      {modal === 'deleteConfirm' && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="font-bold text-gray-800 mb-1">「{hobby.name}」を削除</h3>
            <p className="text-xs text-gray-400 mb-5">すべてのログも削除されます。元に戻せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setModal('none')} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">キャンセル</button>
              <button onClick={onDeleteHobby} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold">削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
