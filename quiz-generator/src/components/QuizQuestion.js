'use client';

export default function QuizQuestion({ question, options, onAnswer, selectedAnswer, showFeedback, isCorrect }) {
  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg text-black" testid="quiz-question">
      <p className="font-bold mb-4 text-lg">{question}</p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label key={index} className="flex items-center space-x-2">
            <input
              type="radio"
              name="question"
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onAnswer(option)}
              className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              disabled={showFeedback} // Disable radio buttons after answering
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      {showFeedback && (
        <p className={`mt-4 text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? 'Correct!' : 'Incorrect!'}
        </p>
      )}
    </div>
  );
}