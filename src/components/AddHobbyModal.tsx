import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Hobby } from '../types';

interface Props {
  onSave: (hobby: Hobby) => void;
  onClose: () => void;
}

const EMOJIS = ['🎮', '🎨', '🎵', '📚', '🏃', '🍳', '✈️', '🎬', '📷', '🌱',
  '🎯', '🧩', '⚽', '🏋️', '🎸', '🎲', '🖥️', '🧶', '🐾', '🎭',
  '🏊', '🚴', '🎺', '✍️', '🧁', '🌸', '🎑', '🏕️', '🎪', '🎠'];

const COLORS = [
  '#6366f1', '#a855f7', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

export default function AddHobbyModal({ onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎮');
  const [color, setColor] = useState(COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: uuidv4(),
      name: name.trim(),
      emoji,
      color,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold text-gray-800 mb-4">趣味を追加</h2>

        <label className="block text-sm font-medium text-gray-600 mb-1">名前</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="例：ゲーム、読書..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-violet-300"
          autoFocus
        />

        <label className="block text-sm font-medium text-gray-600 mb-2">絵文字</label>
        <div className="grid grid-cols-10 gap-1 mb-4">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`text-xl p-1 rounded-lg transition-colors ${emoji === e ? 'bg-violet-100 ring-2 ring-violet-400' : 'hover:bg-gray-100'}`}
            >
              {e}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-gray-600 mb-2">カラー</label>
        <div className="flex gap-2 mb-6 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl text-white text-sm font-bold disabled:opacity-40 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)' }}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
