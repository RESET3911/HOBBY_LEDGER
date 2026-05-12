import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Hobby, HobbyLog, User } from '../types';
import { today } from '../utils/format';

interface Props {
  currentUser: User;
  hobby: Hobby;
  editLog?: HobbyLog;
  onSave: (log: HobbyLog) => void;
  onBack: () => void;
}

export default function AddLogScreen({ currentUser, hobby, editLog, onSave, onBack }: Props) {
  const [title, setTitle] = useState(editLog?.title ?? '');
  const [date, setDate] = useState(editLog?.date ?? today());
  const [hours, setHours] = useState(editLog ? Math.floor(editLog.duration / 60) : 0);
  const [mins, setMins] = useState(editLog ? editLog.duration % 60 : 30);
  const [amount, setAmount] = useState(editLog?.amount ?? 0);
  const [memo, setMemo] = useState(editLog?.memo ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(editLog?.tags ?? []);

  const hobbyTags = hobby.tags ?? [];
  const duration = hours * 60 + mins;
  const isValid = title.trim() !== '' && (duration > 0 || amount > 0);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      id: editLog?.id ?? uuidv4(),
      hobbyId: hobby.id,
      user: currentUser,
      date,
      title: title.trim(),
      duration,
      amount,
      memo,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      createdAt: editLog?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ecfdf5 100%)' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-6">
        <button onClick={onBack} className="text-gray-400 text-2xl leading-none">‹</button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{editLog ? 'ログを編集' : 'ログを追加'}</h1>
          <p className="text-sm text-gray-400">{hobby.emoji} {hobby.name}</p>
        </div>
      </div>

      <div className="flex-1 px-5 space-y-3">
        {/* Title */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-xs font-semibold text-gray-400 mb-2">タイトル <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例：SF小説を読んだ、新しいゲームを買った..."
            className="w-full text-gray-800 font-medium text-base focus:outline-none"
            autoFocus
          />
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-xs font-semibold text-gray-400 mb-2">日付</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full text-gray-800 font-medium text-base focus:outline-none"
          />
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-xs font-semibold text-gray-400 mb-3">活動時間（出費のみの場合は0のまま）</label>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={hours}
                min={0}
                max={23}
                onChange={e => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 text-center text-2xl font-bold text-gray-800 border-b-2 border-gray-200 focus:outline-none focus:border-violet-400"
              />
              <span className="text-gray-400 text-sm">時間</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={mins}
                onChange={e => setMins(parseInt(e.target.value))}
                className="w-14 text-center text-2xl font-bold text-gray-800 border-b-2 border-gray-200 focus:outline-none focus:border-violet-400 bg-transparent"
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-gray-400 text-sm">分</span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-xs font-semibold text-gray-400 mb-2">支出（任意）</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">¥</span>
            <input
              type="number"
              value={amount || ''}
              min={0}
              placeholder="0"
              onChange={e => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 text-gray-800 font-medium text-base focus:outline-none"
            />
          </div>
        </div>

        {/* Tags */}
        {hobbyTags.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-xs font-semibold text-gray-400 mb-3">タグ</label>
            <div className="flex flex-wrap gap-2">
              {hobbyTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'text-white border-transparent'
                      : 'text-gray-500 border-gray-200 bg-gray-50'
                  }`}
                  style={selectedTags.includes(tag) ? { backgroundColor: hobby.color } : {}}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Memo */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-xs font-semibold text-gray-400 mb-2">メモ（任意）</label>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="どんなことをした？どうだった？"
            rows={3}
            className="w-full text-gray-800 text-sm focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!isValid}
          className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-md disabled:opacity-40 transition-opacity active:scale-98"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)' }}
        >
          {editLog ? '更新する' : '記録する'}
        </button>
      </div>
      <div className="h-8" />
    </div>
  );
}
