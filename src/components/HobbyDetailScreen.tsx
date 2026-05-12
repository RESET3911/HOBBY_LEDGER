import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { Hobby, HobbyLog, User } from '../types';
import { formatDuration, formatDate, formatAmount, formatCostPerHour, getLast6Months } from '../utils/format';
import TagsModal from './TagsModal';

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
}

const USER_COLORS: Record<User, string> = {
  けんしん: '#3b82f6',
  れな: '#ec4899',
};

export default function HobbyDetailScreen({
  hobby, logs, onBack, onAddLog, onEditLog, onDeleteLog, onDeleteHobby, onUpdateTags,
}: Props) {
  const [tab, setTab] = useState<'log' | 'graph'>('log');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const totalSessions = logs.length;
  const totalDuration = logs.reduce((s, l) => s + l.duration, 0);
  const totalAmount = logs.reduce((s, l) => s + l.amount, 0);
  const hasAmount = totalAmount > 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ecfdf5 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 text-2xl leading-none">‹</button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: hobby.color + '33' }}
          >
            {hobby.emoji}
          </div>
          <h1 className="text-lg font-bold text-gray-800">{hobby.name}</h1>
        </div>
        <button onClick={() => setMenuOpen(true)} className="text-gray-400 text-xl px-2">···</button>
      </div>

      {/* Tabs */}
      <div className="flex mx-5 bg-white rounded-xl p-1 shadow-sm mb-4">
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
          {logs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-gray-400 text-sm">まだ記録がありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-gray-800 text-sm flex-1 pr-2">{log.title || '（タイトルなし）'}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => onEditLog(log.id)} className="text-gray-300 text-sm px-1">✏️</button>
                      <button onClick={() => onDeleteLog(log.id)} className="text-gray-300 text-sm px-1">🗑️</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">{formatDate(log.date)}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                      style={{ backgroundColor: USER_COLORS[log.user] }}
                    >
                      {log.user}
                    </span>
                    {log.duration > 0 ? (
                      <span className="text-xs font-medium text-gray-600">⏱ {formatDuration(log.duration)}</span>
                    ) : (
                      <span className="text-xs font-medium text-amber-500">支出のみ</span>
                    )}
                    {log.amount > 0 && (
                      <span className="text-xs font-medium text-emerald-600">{formatAmount(log.amount)}</span>
                    )}
                  </div>
                  {(log.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(log.tags ?? []).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: hobby.color + 'bb' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {log.memo && (
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{log.memo}</p>
                  )}
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
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 flex items-end justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setMenuOpen(false); }}
        >
          <div className="bg-white rounded-3xl p-4 w-full max-w-sm shadow-2xl space-y-2">
            <button
              onClick={() => { setMenuOpen(false); setShowTagsModal(true); }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 text-left"
            >
              <span className="text-xl">🏷️</span>
              <div>
                <div className="font-semibold text-gray-800 text-sm">タグを管理</div>
                <div className="text-xs text-gray-400">ログに付けられるタグを追加・削除</div>
              </div>
            </button>
            <button
              onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-red-50 text-left"
            >
              <span className="text-xl">🗑️</span>
              <div className="font-semibold text-red-500 text-sm">趣味を削除</div>
            </button>
            <button onClick={() => setMenuOpen(false)} className="w-full py-3 rounded-2xl bg-gray-100 text-gray-500 text-sm font-medium">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Tags modal */}
      {showTagsModal && (
        <TagsModal
          hobby={hobby}
          onUpdate={onUpdateTags}
          onClose={() => setShowTagsModal(false)}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="font-bold text-gray-800 mb-1">「{hobby.name}」を削除</h3>
            <p className="text-xs text-gray-400 mb-5">すべてのログも削除されます。元に戻せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">
                キャンセル
              </button>
              <button onClick={onDeleteHobby} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
