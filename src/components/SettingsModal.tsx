import { useState } from 'react';
import { HobbyLedgerSettings } from '../types';

interface Props {
  settings: HobbyLedgerSettings;
  onSave: (s: HobbyLedgerSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSave, onClose }: Props) {
  const [topic, setTopic] = useState(settings.ntfyTopic);
  const [testSent, setTestSent] = useState(false);

  const sendTest = async () => {
    if (!topic.trim()) return;
    await fetch(`https://ntfy.sh/${topic.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: topic.trim(),
        title: '📒 Hobby Ledger テスト',
        message: '通知の設定が完了しました！',
      }),
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold text-gray-800 mb-5">⚙️ 設定</h2>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 mb-1">ntfy 通知トピック</label>
          <p className="text-xs text-gray-300 mb-3">RINGIと同じトピックを使えます。ログ記録時に相手に通知されます。</p>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="例: saku-taka-hobby"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          <button
            onClick={sendTest}
            disabled={!topic.trim()}
            className="mt-2 text-xs text-violet-500 disabled:text-gray-300"
          >
            {testSent ? '✓ 送信しました' : 'テスト送信'}
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">
            キャンセル
          </button>
          <button
            onClick={() => { onSave({ ntfyTopic: topic.trim() }); onClose(); }}
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
