// File: quiz-generator/src/components/Footer.js
'use client';

export default function Footer() {
  const version = process.env.VERSION || 'dev';
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto md:fixed md:bottom-0 border-t border-white/20 backdrop-blur supports-[backdrop-filter]:bg-white/10 bg-white/80 dark:bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        {/* Left: Branding */}
        <div className="flex items-center gap-2 text-sm text-white/90">
          <a
            href="https://github.com/ritoche1/quiz-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-300 transition-colors flex items-center gap-2 touch-manipulation"
            aria-label="GitHub repository"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Made with ❤ by Ritoche1</span>
            <span className="sm:hidden">By Ritoche1</span>
          </a>
          <span className="hidden sm:inline text-white/60">•</span>
          <a
            href="https://mistral.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-300 transition-colors touch-manipulation"
          >
            Mistral AI
          </a>
        </div>

        {/* Right: Version + year */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/70 hidden sm:inline">© {year}</span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full border border-white/30 text-white/90 bg-white/10">
            v{version}
          </span>
        </div>
      </div>
    </footer>
  );
}
