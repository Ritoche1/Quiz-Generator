'use client';

const COLORS = [
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
  'bg-blue-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-orange-500',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function Avatar({ username = '', size = 'md', className = '', imageUrl = null }) {
  const initial = (username || 'U').charAt(0).toUpperCase();
  const colorClass = COLORS[hashString(username || '') % COLORS.length];
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
  };
  const base = `${sizes[size] || sizes.md} rounded-full overflow-hidden shrink-0`;

  if (imageUrl) {
    return (
      <div className={`${base} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={username} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${base} ${colorClass} flex items-center justify-center text-white font-semibold ${className}`}>
      {initial}
    </div>
  );
}
