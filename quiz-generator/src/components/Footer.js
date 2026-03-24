'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Made with Mistral AI</span>
            <span className="hidden sm:inline">-</span>
            <a
              href="https://github.com/ritoche1/quiz-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors"
            >
              GitHub
            </a>
          </div>
          <div className="text-sm text-gray-400">
            &copy; {year} Quiz Generator
          </div>
        </div>
      </div>
    </footer>
  );
}
