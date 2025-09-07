import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { QuizState, QuizAction, QuizQuestion } from '../types';

const initialQuizState: QuizState = {
  currentQuiz: null,
  currentQuestionIndex: 0,
  userAnswers: {},
  timeRemaining: 20,
  isComplete: false,
  score: null,
  mode: null,
  startTime: null,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...state,
        currentQuiz: action.payload.questions,
        mode: action.payload.mode,
        currentQuestionIndex: 0,
        userAnswers: {},
        timeRemaining: 20,
        isComplete: false,
        score: null,
        startTime: new Date(),
      };

    case 'ANSWER_QUESTION':
      return {
        ...state,
        userAnswers: {
          ...state.userAnswers,
          [action.payload.questionId]: action.payload.answers,
        },
      };

    case 'NEXT_QUESTION':
      const nextIndex = state.currentQuestionIndex + 1;
      const isLastQuestion = state.currentQuiz ? nextIndex >= state.currentQuiz.length : false;
      
      return {
        ...state,
        currentQuestionIndex: isLastQuestion ? state.currentQuestionIndex : nextIndex,
        timeRemaining: 20, // Reset timer for next question
        isComplete: isLastQuestion,
      };

    case 'PREVIOUS_QUESTION':
      const prevIndex = Math.max(0, state.currentQuestionIndex - 1);
      return {
        ...state,
        currentQuestionIndex: prevIndex,
        timeRemaining: 20, // Reset timer
      };

    case 'SET_TIME_REMAINING':
      return {
        ...state,
        timeRemaining: action.payload,
      };

    case 'COMPLETE_QUIZ':
      // Calculate score
      const score = state.currentQuiz ? calculateQuizScore(state.currentQuiz, state.userAnswers) : 0;
      
      return {
        ...state,
        isComplete: true,
        score,
        timeRemaining: 0,
      };

    case 'RESET_QUIZ':
      return initialQuizState;

    default:
      return state;
  }
}

function calculateQuizScore(questions: QuizQuestion[], userAnswers: Record<string, string[]>): number {
  let correctCount = 0;
  
  questions.forEach((question) => {
    const userAnswer = userAnswers[question.id] || [];
    const correctAnswer = question.correctAnswers;
    
    // Check if arrays are equal (same elements, same order)
    const isCorrect = userAnswer.length === correctAnswer.length &&
      userAnswer.every((answer, index) => answer === correctAnswer[index]);
    
    if (isCorrect) {
      correctCount++;
    }
  });
  
  return correctCount;
}

interface QuizContextType {
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
  // Helper functions
  startQuiz: (questions: QuizQuestion[], mode: "examen_blanc" | "car_recognition") => void;
  answerQuestion: (questionId: string, answers: string[]) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setTimeRemaining: (time: number) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  getCurrentQuestion: () => QuizQuestion | null;
  getProgress: () => { current: number; total: number; percentage: number };
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);

  // Helper functions
  const startQuiz = (questions: QuizQuestion[], mode: "examen_blanc" | "car_recognition") => {
    dispatch({ type: 'START_QUIZ', payload: { questions, mode } });
  };

  const answerQuestion = (questionId: string, answers: string[]) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, answers } });
  };

  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const previousQuestion = () => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  };

  const setTimeRemaining = (time: number) => {
    dispatch({ type: 'SET_TIME_REMAINING', payload: time });
  };

  const completeQuiz = () => {
    dispatch({ type: 'COMPLETE_QUIZ' });
  };

  const resetQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
  };

  const getCurrentQuestion = (): QuizQuestion | null => {
    if (!state.currentQuiz || state.currentQuestionIndex >= state.currentQuiz.length) {
      return null;
    }
    return state.currentQuiz[state.currentQuestionIndex];
  };

  const getProgress = () => {
    const total = state.currentQuiz?.length || 0;
    const current = Math.min(state.currentQuestionIndex + 1, total);
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    return { current, total, percentage };
  };

  const value: QuizContextType = {
    state,
    dispatch,
    startQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    setTimeRemaining,
    completeQuiz,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}