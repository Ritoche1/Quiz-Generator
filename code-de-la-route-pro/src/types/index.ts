// Quiz Question Types
export type ETGTheme = 
  | "circulation_routiere"
  | "conducteur" 
  | "route"
  | "autres_usagers"
  | "reglementation_generale"
  | "precautions_diverses"
  | "elements_mecaniques_securite"
  | "equipements_securite"
  | "regle_circulation"
  | "environnement";

export interface QuizQuestion {
  id: string;
  category: "official_code" | "general_knowledge";
  theme: ETGTheme;
  question: string;
  options: string[];
  correctAnswers: string[];
  explanation?: string;
  imageUrl?: string;
  difficulty: "easy" | "medium" | "hard";
}

// Car Brand Recognition Types
export interface CarBrand {
  name: string;
  logo: string;
  country?: string;
}

export interface CarQuizQuestion {
  id: string;
  logoUrl: string;
  correctAnswer: string;
  options: string[];
}

// User Data Types
export interface QuestionAnswer {
  questionId: string;
  userAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface QuizAttempt {
  id: string;
  date: Date;
  mode: "examen_blanc" | "car_recognition";
  score: number;
  totalQuestions: number;
  timeSpent: number;
  thematicBreakdown: Record<ETGTheme, { correct: number; total: number }>;
  answers: QuestionAnswer[];
}

export interface UserStatistics {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  weakestThemes: ETGTheme[];
  strongestThemes: ETGTheme[];
}

export interface UserPreferences {
  theme: "dark" | "light";
  language: "fr" | "en";
  soundEnabled: boolean;
}

export interface UserProfile {
  id: string;
  attempts: QuizAttempt[];
  statistics: UserStatistics;
  preferences: UserPreferences;
}

// Quiz State Types
export interface QuizState {
  currentQuiz: QuizQuestion[] | null;
  currentQuestionIndex: number;
  userAnswers: Record<string, string[]>;
  timeRemaining: number;
  isComplete: boolean;
  score: number | null;
  mode: "examen_blanc" | "car_recognition" | null;
  startTime: Date | null;
}

export type QuizAction =
  | { type: 'START_QUIZ'; payload: { questions: QuizQuestion[]; mode: "examen_blanc" | "car_recognition" } }
  | { type: 'ANSWER_QUESTION'; payload: { questionId: string; answers: string[] } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'RESET_QUIZ' };

// User State Types
export interface UserState {
  profile: UserProfile;
  isLoaded: boolean;
}

export type UserAction =
  | { type: 'LOAD_PROFILE'; payload: UserProfile }
  | { type: 'ADD_ATTEMPT'; payload: QuizAttempt }
  | { type: 'UPDATE_STATISTICS'; payload: Partial<UserStatistics> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> };

// Component Props Types
export interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  backgroundColor?: string;
}

export interface TimerProps {
  initialTime: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

export interface ProgressGaugeProps {
  current: number;
  total: number;
  variant?: "circular" | "linear";
}

export interface QuestionReviewItemProps {
  question: QuizQuestion;
  userAnswers: string[];
  isCorrect: boolean;
  showExplanation?: boolean;
}

// Thematic Distribution for Examen Blanc
export const EXAM_DISTRIBUTION: Record<ETGTheme, number> = {
  circulation_routiere: 8,
  conducteur: 6,
  route: 5,
  autres_usagers: 4,
  reglementation_generale: 4,
  precautions_diverses: 3,
  elements_mecaniques_securite: 3,
  equipements_securite: 3,
  regle_circulation: 2,
  environnement: 2,
};

// Theme Labels for Display
export const THEME_LABELS: Record<ETGTheme, string> = {
  circulation_routiere: "Circulation Routière",
  conducteur: "Conducteur",
  route: "Route",
  autres_usagers: "Autres Usagers",
  reglementation_generale: "Réglementation Générale",
  precautions_diverses: "Précautions Diverses",
  elements_mecaniques_securite: "Éléments Mécaniques & Sécurité",
  equipements_securite: "Équipements de Sécurité",
  regle_circulation: "Règle de Circulation",
  environnement: "Environnement",
};

// Quiz Constants
export const QUIZ_CONSTANTS = {
  QUESTION_TIME_LIMIT: 20, // seconds
  EXAM_QUESTION_COUNT: 40,
  PASS_THRESHOLD: 35, // out of 40
  CAR_QUIZ_QUESTION_COUNT: 20,
} as const;