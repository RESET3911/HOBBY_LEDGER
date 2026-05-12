import { User } from '../types';

interface Props {
  onSelect: (user: User) => void;
}

const USERS: { user: User; emoji: string; from: string; to: string }[] = [
  { user: 'けんしん', emoji: '🧑', from: '#3b82f6', to: '#1d4ed8' },
  { user: 'れな', emoji: '👩', from: '#ec4899', to: '#be185d' },
];

export default function UserSelectScreen({ onSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ecfdf5 100%)' }}>
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">📒</div>
        <h1 className="text-2xl font-bold"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Hobby Ledger
        </h1>
        <p className="text-gray-400 text-sm mt-2">どちらですか？</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {USERS.map(({ user, emoji, from, to }) => (
          <button
            key={user}
            onClick={() => onSelect(user)}
            className="text-white rounded-2xl p-6 text-center shadow-lg active:scale-95 transition-transform"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            <div className="text-4xl mb-2">{emoji}</div>
            <div className="text-xl font-bold">{user}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
