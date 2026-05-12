import { useState } from 'react';
import { Hobby, HobbyGoals } from '../types';

interface Props {
  hobby: Hobby;
  onSave: (goals: HobbyGoals) => void;
  onClose: () => void;
}

export default function GoalModal({ hobby, onSave, onClose }: Props) {
  const [hours, setHours] = useState(hobby.goals?.monthlyHours ?? 0);
  const [budget, setBudget] = useState(hobby.goals?.monthlyBudget ?? 0);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">🎯 月間目標</h2>
          <span className="text-sm text-gray-400">{hobby.emoji} {hobby.name}</span>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">活動時間の目標（0 = 設定なし）</label>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <input
                type="number"
                value={hours || ''}
                min={0}
                placeholder="0"
                onChange={e => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 text-2xl font-bold text-gray-800 bg-transparent focus:outline-none"
              />
              <span className="text-gray-400">時間 / 月</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">支出予算の目標（0 = 設定なし）</label>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-gray-400">¥</span>
              <input
                type="number"
                value={budget || ''}
                min={0}
                placeholder="0"
                onChange={e => setBudget(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 text-2xl font-bold text-gray-800 bg-transparent focus:outline-none"
              />
              <span className="text-gray-400">/ 月</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">
            キャンセル
          </button>
          <button
            onClick={() => { onSave({ monthlyHours: hours, monthlyBudget: budget }); onClose(); }}
            className="flex-1 py-3 rounded-xl text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)' }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
