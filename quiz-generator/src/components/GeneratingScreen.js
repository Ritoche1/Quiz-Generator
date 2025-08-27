'use client';
import { useEffect, useState } from 'react';

export default function GeneratingScreen({ onCancel }) {
  const emojis = ['🧠', '✍️', '🎯', '📚', '🧩', '🎲'];
  const messages = [
    'Brewing brilliant questions...',
    'Sharpening pencils and minds...',
    'Picking the perfect brain teasers...',
    'Teaching robots to quiz you...',
    'Counting to π and back...',
  ];

  const [emojiIndex, setEmojiIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const e = setInterval(() => setEmojiIndex((i) => (i + 1) % emojis.length), 700);
    const m = setInterval(() => setMessageIndex((i) => (i + 1) % messages.length), 2200);
    return () => { clearInterval(e); clearInterval(m); };
  }, []);

return (
    <div className="fixed inset-0 z-50 gradient-bg flex flex-col items-center justify-center text-gray-800 text-center px-6">
        {/* Floating bubbles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="floaty left-[10%] top-[15%]" />
            <span className="floaty left-[75%] top-[25%] delay-200" />
            <span className="floaty left-[20%] top-[70%] delay-300" />
            <span className="floaty left-[60%] top-[80%] delay-500" />
        </div>

        <div className="glass-card max-w-xl w-full p-10 rounded-2xl shadow-2xl relative">
            <div className="text-6xl sm:text-7xl mb-4 bounce-slow" aria-hidden>
                {emojis[emojiIndex]}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Generating your quiz</h2>
            <p className="text-black/90 mb-6">{messages[messageIndex]}</p>

            {/* Progress shimmer */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-blue-500 shimmer" />
            </div>

            <button onClick={onCancel} className="btn-secondary">Cancel</button>
        </div>
    </div>
);
}
