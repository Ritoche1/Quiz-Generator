'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function QuizEditor() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    language: 'English',
    difficulty: 'easy',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        answer: ''
      }
    ]
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewCurrentQuestion, setPreviewCurrentQuestion] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState({});

  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Turkish', 'Polish'];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('quizToken');
    if (token) {
      try {
        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
    setLoading(false);
  };

  const updateQuizField = (field, value) => {
    setQuiz(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateQuestion = (index, field, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          options: q.options.map((opt, j) => j === optionIndex ? value : opt)
        } : q
      )
    }));
  };

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        options: ['', '', '', ''],
        answer: ''
      }]
    }));
    setCurrentQuestionIndex(quiz.questions.length);
  };

  const removeQuestion = (index) => {
    if (quiz.questions.length > 1) {
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
      if (currentQuestionIndex >= quiz.questions.length - 1) {
        setCurrentQuestionIndex(Math.max(0, quiz.questions.length - 2));
      }
    }
  };

  const addOption = (questionIndex) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          options: [...q.options, '']
        } : q
      )
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    const question = quiz.questions[questionIndex];
    if (question.options.length > 2) {
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => 
          i === questionIndex ? {
            ...q,
            options: q.options.filter((_, j) => j !== optionIndex)
          } : q
        )
      }));
    }
  };

  const saveQuiz = async () => {
    setSaveStatus('saving');
    try {
      // Validate quiz
      if (!quiz.title.trim()) {
        throw new Error('Quiz title is required');
      }
      
      const validQuestions = quiz.questions.filter(q => 
        q.question.trim() && 
        q.options.every(opt => opt.trim()) && 
        q.answer.trim()
      );
      
      if (validQuestions.length === 0) {
        throw new Error('At least one complete question is required');
      }

      // Save to backend
      const token = localStorage.getItem('quizToken');
      const response = await fetch(`${baseUrl}/quizzes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description || `A ${quiz.difficulty} quiz in ${quiz.language} with ${validQuestions.length} questions`,
          language: quiz.language,
          difficulty: quiz.difficulty,
          questions: validQuestions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }

      const savedQuiz = await response.json();
      console.log('Quiz saved successfully:', savedQuiz);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
      console.error('Error saving quiz:', error);
    }
  };

  const previewQuiz = () => {
    // Validate that there's at least one complete question
    const validQuestions = quiz.questions.filter(q => 
      q.question.trim() && 
      q.options.every(opt => opt.trim()) && 
      q.answer.trim()
    );
    
    if (validQuestions.length === 0) {
      alert('Please complete at least one question before previewing');
      return;
    }
    
    setPreviewCurrentQuestion(0);
    setPreviewAnswers({});
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewCurrentQuestion(0);
    setPreviewAnswers({});
  };

  const selectPreviewAnswer = (answer) => {
    setPreviewAnswers(prev => ({
      ...prev,
      [previewCurrentQuestion]: answer
    }));
  };

  const nextPreviewQuestion = () => {
    const validQuestions = quiz.questions.filter(q => 
      q.question.trim() && 
      q.options.every(opt => opt.trim()) && 
      q.answer.trim()
    );
    
    if (previewCurrentQuestion < validQuestions.length - 1) {
      setPreviewCurrentQuestion(prev => prev + 1);
    }
  };

  const prevPreviewQuestion = () => {
    if (previewCurrentQuestion > 0) {
      setPreviewCurrentQuestion(prev => prev - 1);
    }
  };

  const importFromTemplate = async () => {
    try {
      // Fetch user's quiz history
      const token = localStorage.getItem('quizToken');
      const response = await fetch(`${baseUrl}/quizzes/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userQuizzes = await response.json();
        
        if (userQuizzes.length === 0) {
          alert('No quiz history found. Create your first quiz to use templates later!');
          return;
        }
        
        // For now, show simple selection - in a full implementation, we'd show a modal
        const quizTitles = userQuizzes.map((q, i) => `${i + 1}. ${q.title}`).join('\n');
        const selection = prompt(`Select a quiz template:\n\n${quizTitles}\n\nEnter the number (1-${userQuizzes.length}):`);
        
        const selectedIndex = parseInt(selection) - 1;
        if (selectedIndex >= 0 && selectedIndex < userQuizzes.length) {
          const selectedQuiz = userQuizzes[selectedIndex];
          setQuiz(selectedQuiz);
          setCurrentQuestionIndex(0);
        } else {
          alert('Invalid selection');
        }
      } else {
        throw new Error('Failed to fetch quiz history');
      }
    } catch (error) {
      console.error('Error loading user quiz history:', error);
      
      // Fallback to sample template
      alert('Could not load your quiz history. Using a sample template instead.');
      const template = {
        title: 'Sample Quiz Template',
        description: 'A sample quiz to help you get started',
        language: 'English',
        difficulty: 'easy',
        questions: [
          {
            question: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            answer: 'Paris'
          },
          {
            question: 'Which programming language is known for web development?',
            options: ['Python', 'JavaScript', 'C++', 'Java'],
            answer: 'JavaScript'
          }
        ]
      };
      setQuiz(template);
      setCurrentQuestionIndex(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-default gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-default gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to access the quiz editor
          </p>
          <Link href="/" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <>
      <Navigation user={user} />
      <div className="min-h-screen gradient-bg pt-20 pb-16 md:pb-24 safe-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header - unified with other pages */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-3">
              <span>📝</span>
              Quiz Editor
            </h1>
            <p className="text-white/80 text-base sm:text-lg">Create and customize your own quizzes</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button onClick={importFromTemplate} className="btn-secondary">📝 Load from History</button>
            <button onClick={previewQuiz} className="btn-secondary">👁️ Preview</button>
            <button onClick={saveQuiz} disabled={saveStatus === 'saving'} className={`btn-primary ${saveStatus === 'saving' ? 'opacity-75' : ''}`}>
              {saveStatus === 'saving' ? (
                <div className="flex items-center gap-2"><div className="loading-spinner"></div>Saving...</div>
              ) : (
                '💾 Save Quiz'
              )}
            </button>
          </div>

          {/* Save Status */}
          {saveStatus && saveStatus !== 'saving' && (
            <div className={`glass-card p-4 rounded-lg mb-6 ${
              saveStatus === 'success' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
            }`}>
              <p className={`font-medium ${
                saveStatus === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {saveStatus === 'success' ? '✅ Quiz saved successfully!' : '❌ Error saving quiz. Please try again.'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quiz Settings Panel */}
            <div className="glass-card p-6 rounded-2xl h-fit">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>⚙️</span>
                Quiz Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title*
                  </label>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={(e) => updateQuizField('title', e.target.value)}
                    className="form-input"
                    placeholder="Enter quiz title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={quiz.description}
                    onChange={(e) => updateQuizField('description', e.target.value)}
                    className="form-input h-24 resize-none"
                    placeholder="Brief description of your quiz..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={quiz.difficulty}
                      onChange={(e) => updateQuizField('difficulty', e.target.value)}
                      className="form-select"
                    >
                      <option value="easy">🟢 Easy</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="hard">🔴 Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={quiz.language}
                      onChange={(e) => updateQuizField('language', e.target.value)}
                      className="form-select"
                    >
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-800">
                      Questions ({quiz.questions.length})
                    </h4>
                    <button
                      onClick={addQuestion}
                      className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      + Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {quiz.questions.map((q, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg border-2 transition-colors cursor-pointer ${
                          index === currentQuestionIndex
                            ? 'border-indigo-300 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Q{index + 1}: {q.question.substring(0, 30)}{q.question.length > 30 ? '...' : ''}
                          </span>
                          {quiz.questions.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeQuestion(index);
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Question Editor Panel */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span>📝</span>
                  Question {currentQuestionIndex + 1}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === quiz.questions.length - 1}
                    className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text*
                  </label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'question', e.target.value)}
                    className="form-input h-24 resize-none"
                    placeholder="Enter your question here..."
                  />
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Answer Options*
                    </label>
                    <button
                      onClick={() => addOption(currentQuestionIndex)}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      + Add Option
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuestionOption(currentQuestionIndex, index, e.target.value)}
                            className="form-input"
                            placeholder={`Option ${index + 1}...`}
                          />
                        </div>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`correct-${currentQuestionIndex}`}
                            checked={currentQuestion.answer === option}
                            onChange={() => updateQuestion(currentQuestionIndex, 'answer', option)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Correct</span>
                        </label>
                        {currentQuestion.options.length > 2 && (
                          <button
                            onClick={() => removeOption(currentQuestionIndex, index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question Validation */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Question Status</h4>
                  <div className="space-y-1 text-sm">
                    <div className={`flex items-center gap-2 ${currentQuestion.question.trim() ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{currentQuestion.question.trim() ? '✅' : '❌'}</span>
                      Question text
                    </div>
                    <div className={`flex items-center gap-2 ${currentQuestion.options.every(opt => opt.trim()) ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{currentQuestion.options.every(opt => opt.trim()) ? '✅' : '❌'}</span>
                      All options filled
                    </div>
                    <div className={`flex items-center gap-2 ${currentQuestion.answer.trim() ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{currentQuestion.answer.trim() ? '✅' : '❌'}</span>
                      Correct answer selected
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Quiz Preview</h2>
                <button
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Quiz Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span>Language: {quiz.language}</span>
                  <span>•</span>
                  <span>Difficulty: {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}</span>
                </div>
              </div>

              {/* Question Display */}
              {(() => {
                const validQuestions = quiz.questions.filter(q => 
                  q.question.trim() && 
                  q.options.every(opt => opt.trim()) && 
                  q.answer.trim()
                );
                
                if (validQuestions.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No complete questions to preview</p>
                    </div>
                  );
                }
                
                const currentPreviewQuestion = validQuestions[previewCurrentQuestion];
                
                return (
                  <div className="max-w-2xl mx-auto">
                    {/* Question Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Question {previewCurrentQuestion + 1} of {validQuestions.length}</span>
                        <span>{Math.round(((previewCurrentQuestion + 1) / validQuestions.length) * 100)}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((previewCurrentQuestion + 1) / validQuestions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Question */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                      <h4 className="text-xl font-semibold text-gray-800 mb-6">
                        {currentPreviewQuestion.question}
                      </h4>
                      
                      <div className="space-y-3">
                        {currentPreviewQuestion.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => selectPreviewAnswer(option)}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                              previewAnswers[previewCurrentQuestion] === option
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              previewAnswers[previewCurrentQuestion] === option
                                ? 'border-indigo-500 bg-indigo-500'
                                : 'border-gray-300'
                            }`}>
                              {previewAnswers[previewCurrentQuestion] === option && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                            <span>{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <button
                        onClick={prevPreviewQuestion}
                        disabled={previewCurrentQuestion === 0}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        ← Previous
                      </button>
                      
                      <button
                        onClick={nextPreviewQuestion}
                        disabled={previewCurrentQuestion >= validQuestions.length - 1}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {previewCurrentQuestion >= validQuestions.length - 1 ? 'Finish Preview' : 'Next →'}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}