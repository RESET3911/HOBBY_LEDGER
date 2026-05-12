import { useEffect } from 'react';

interface Props {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50 whitespace-nowrap">
      {message}
    </div>
  );
}
