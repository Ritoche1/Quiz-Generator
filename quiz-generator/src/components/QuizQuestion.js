'use client';

export default function QuizQuestion({ question, options, onAnswer, selectedAnswer, showFeedback, isCorrect }) {
  return (
    <div className="w-full max-w-2xl question-card" data-testid="quiz-question">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{question}</h3>
      </div>
      
      <div className="space-y-4">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = showFeedback && isCorrect && isSelected;
          const isIncorrectOption = showFeedback && !isCorrect && isSelected;
          
          return (
            <label key={index} className="block cursor-pointer">
              <div className={`option-button ${
                isSelected ? 'selected' : ''
              } ${
                isCorrectOption ? 'correct' : ''
              } ${
                isIncorrectOption ? 'incorrect' : ''
              } ${
                showFeedback ? 'cursor-default' : 'cursor-pointer'
              }`}>
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                    isSelected 
                      ? isCorrectOption 
                        ? 'border-green-500 bg-green-500' 
                        : isIncorrectOption 
                          ? 'border-red-500 bg-red-500'
                          : 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  
                  <span className={`text-lg flex-1 ${
                    isCorrectOption 
                      ? 'text-green-800 font-medium' 
                      : isIncorrectOption 
                        ? 'text-red-800 font-medium'
                        : isSelected 
                          ? 'text-indigo-800 font-medium'
                          : 'text-gray-700'
                  }`}>
                    {option}
                  </span>
                  
                  {showFeedback && isCorrectOption && (
                    <div className="ml-3 text-green-600">
                      ✓
                    </div>
                  )}
                  {showFeedback && isIncorrectOption && (
                    <div className="ml-3 text-red-600">
                      ✗
                    </div>
                  )}
                </div>
                
                <input
                  type="radio"
                  name="question"
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={() => onAnswer(option)}
                  className="hidden"
                  disabled={showFeedback}
                />
              </div>
            </label>
          );
        })}
      </div>
      
      {showFeedback && (
        <div className={`mt-8 p-4 rounded-xl text-center ${
          isCorrect 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center justify-center gap-2 text-lg font-semibold">
            {isCorrect ? (
              <>
                <span>🎉</span>
                <span>Correct!</span>
              </>
            ) : (
              <>
                <span>💡</span>
                <span>Incorrect!</span>
              </>
            )}
          </div>
          <p className="text-sm mt-2 opacity-80">
            {isCorrect 
              ? "Great job! You got it right." 
              : "Don't worry, keep learning!"
            }
          </p>
        </div>
      )}
    </div>
  );
}