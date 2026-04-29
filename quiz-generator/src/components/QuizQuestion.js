'use client';

export default function QuizQuestion({ question, options, onAnswer, selectedAnswer, showFeedback, isCorrect, correctAnswer }) {
  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-in" data-testid="quiz-question">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold text-gray-900 mb-6 text-center leading-relaxed">{question}</h3>

        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === (correctAnswer || '');
            const showCorrect = showFeedback && isCorrectOption;
            const showIncorrect = showFeedback && isSelected && !isCorrect;
            const letter = String.fromCharCode(65 + index);

            return (
              <button
                key={index}
                onClick={() => !showFeedback && onAnswer(option)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all duration-200 ${
                  showCorrect
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100 animate-bounce-once'
                    : showIncorrect
                      ? 'border-red-400 bg-red-50 shadow-sm shadow-red-100 animate-shake'
                      : isSelected && !showFeedback
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-sm'
                } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {/* Letter badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                  showCorrect
                    ? 'bg-emerald-500 text-white'
                    : showIncorrect
                      ? 'bg-red-500 text-white'
                      : isSelected
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100'
                }`}>
                  {showCorrect ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : showIncorrect ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : letter}
                </div>

                <span className={`text-base leading-snug ${
                  showCorrect ? 'text-emerald-800 font-medium' :
                  showIncorrect ? 'text-red-800 font-medium' :
                  isSelected ? 'text-indigo-800 font-medium' :
                  'text-gray-700'
                }`}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`mt-6 p-4 rounded-xl text-center ${
            isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
            <p className={`text-sm mt-1 ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
              {isCorrect ? 'Great job!' : `The correct answer is: ${correctAnswer || ''}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
