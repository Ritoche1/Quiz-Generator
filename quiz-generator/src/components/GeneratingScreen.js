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
    <div className="w-full max-w-md mx-auto">
        {/* Quiz Generator Branding */}
        <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Q</span>
                </div>
                <span className="text-white font-bold text-2xl">Quiz Generator</span>
            </div>
            <p className="text-white/80">Creating your personalized quiz experience</p>
        </div>

        {/* Main Generation UI */}
        <div className="glass-card p-8 rounded-2xl text-center">
            <div className="text-6xl sm:text-7xl mb-6 bounce-slow" aria-hidden>
                {emojis[emojiIndex]}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">Generating your quiz</h2>
            <p className="text-gray-600 mb-8">{messages[messageIndex]}</p>

            {/* Progress shimmer - more visible with better styling */}
            <div className="w-full max-w-xs mx-auto mb-8">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Processing</span>
                    <span>AI at work</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full w-1/3 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md shimmer" />
                </div>
            </div>

            <button 
                onClick={onCancel} 
                className="btn-secondary bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
            >
                Cancel Generation
            </button>
        </div>

        {/* Floating animation elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
            <span className="floaty left-[10%] top-[15%]" />
            <span className="floaty left-[75%] top-[25%] delay-200" />
            <span className="floaty left-[20%] top-[70%] delay-300" />
            <span className="floaty left-[60%] top-[80%] delay-500" />
        </div>
    </div>
);
}
