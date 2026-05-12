import { useState } from 'react';
import { Hobby } from '../types';

interface Props {
  hobby: Hobby;
  onUpdate: (tags: string[]) => void;
  onClose: () => void;
}

export default function TagsModal({ hobby, onUpdate, onClose }: Props) {
  const [tags, setTags] = useState<string[]>(hobby.tags ?? []);
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    const next = [...tags, trimmed];
    setTags(next);
    setInput('');
    onUpdate(next);
  };

  const removeTag = (tag: string) => {
    const next = tags.filter(t => t !== tag);
    setTags(next);
    onUpdate(next);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">🏷️ タグ管理</h2>
          <span className="text-sm text-gray-400">{hobby.emoji} {hobby.name}</span>
        </div>

        {tags.length === 0 ? (
          <p className="text-sm text-gray-300 mb-4">タグがまだありません</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-400 ml-1 text-xs leading-none">✕</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="新しいタグ名..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          <button
            onClick={addTag}
            disabled={!input.trim()}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)' }}
          >
            追加
          </button>
        </div>

        <button onClick={onClose} className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">
          閉じる
        </button>
      </div>
    </div>
  );
}
