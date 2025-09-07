import { QuizQuestion, ETGTheme, EXAM_DISTRIBUTION, CarBrand, CarQuizQuestion } from '../types';
import databaseData from '../data/database.json';

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Selects questions for Examen Blanc following the official ETG distribution
 */
export function selectExamQuestions(allQuestions: QuizQuestion[]): QuizQuestion[] {
  const selectedQuestions: QuizQuestion[] = [];
  
  // Group questions by theme
  const questionsByTheme: Record<ETGTheme, QuizQuestion[]> = {} as Record<ETGTheme, QuizQuestion[]>;
  
  allQuestions.forEach(question => {
    if (!questionsByTheme[question.theme]) {
      questionsByTheme[question.theme] = [];
    }
    questionsByTheme[question.theme].push(question);
  });

  // Select questions according to distribution
  Object.entries(EXAM_DISTRIBUTION).forEach(([theme, count]) => {
    const themeQuestions = questionsByTheme[theme as ETGTheme] || [];
    const shuffledThemeQuestions = shuffleArray(themeQuestions);
    
    // Take the required number of questions, or all available if fewer
    const selectedFromTheme = shuffledThemeQuestions.slice(0, count);
    selectedQuestions.push(...selectedFromTheme);
  });

  // If we don't have enough questions, fill with random ones
  if (selectedQuestions.length < 40) {
    const remainingQuestions = allQuestions.filter(
      q => !selectedQuestions.find(sq => sq.id === q.id)
    );
    const shuffledRemaining = shuffleArray(remainingQuestions);
    const needed = 40 - selectedQuestions.length;
    selectedQuestions.push(...shuffledRemaining.slice(0, needed));
  }

  // Final shuffle to randomize order
  return shuffleArray(selectedQuestions);
}

/**
 * Loads questions from the database
 */
export function loadQuestions(): QuizQuestion[] {
  return databaseData.questions as QuizQuestion[];
}

/**
 * Fetches car brands from GitHub API
 */
export async function fetchCarBrands(): Promise<CarBrand[]> {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/logos.json'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch car brands');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching car brands:', error);
    
    // Fallback data if API fails
    return [
      { name: 'BMW', logo: '/api/placeholder/100/100' },
      { name: 'Mercedes', logo: '/api/placeholder/100/100' },
      { name: 'Audi', logo: '/api/placeholder/100/100' },
      { name: 'Toyota', logo: '/api/placeholder/100/100' },
      { name: 'Ford', logo: '/api/placeholder/100/100' },
      { name: 'Volkswagen', logo: '/api/placeholder/100/100' },
      { name: 'Peugeot', logo: '/api/placeholder/100/100' },
      { name: 'Renault', logo: '/api/placeholder/100/100' },
      { name: 'Citroën', logo: '/api/placeholder/100/100' },
      { name: 'Nissan', logo: '/api/placeholder/100/100' },
    ];
  }
}

/**
 * Generates car quiz questions from car brands data
 */
export function generateCarQuiz(brands: CarBrand[], count: number = 20): CarQuizQuestion[] {
  const shuffledBrands = shuffleArray(brands);
  const selectedBrands = shuffledBrands.slice(0, count);
  
  return selectedBrands.map((brand, index) => {
    // Create 3 wrong options by selecting other brands
    const otherBrands = brands.filter(b => b.name !== brand.name);
    const shuffledOthers = shuffleArray(otherBrands);
    const wrongOptions = shuffledOthers.slice(0, 3).map(b => b.name);
    
    // Combine correct answer with wrong options and shuffle
    const allOptions = shuffleArray([brand.name, ...wrongOptions]);
    
    return {
      id: `car-${index + 1}`,
      logoUrl: brand.logo,
      correctAnswer: brand.name,
      options: allOptions,
    };
  });
}

/**
 * Calculates quiz score with thematic breakdown
 */
export function calculateScore(
  answers: Record<string, string[]>,
  questions: QuizQuestion[]
): {
  totalScore: number;
  thematicBreakdown: Record<ETGTheme, { correct: number; total: number }>;
  isPassing: boolean;
} {
  let totalCorrect = 0;
  const thematicBreakdown: Record<ETGTheme, { correct: number; total: number }> = {} as Record<ETGTheme, { correct: number; total: number }>;

  questions.forEach((question) => {
    const userAnswer = answers[question.id] || [];
    const correctAnswer = question.correctAnswers;
    
    // Initialize theme stats if not exists
    if (!thematicBreakdown[question.theme]) {
      thematicBreakdown[question.theme] = { correct: 0, total: 0 };
    }
    
    thematicBreakdown[question.theme].total++;
    
    // Check if answer is correct (arrays must match exactly)
    const isCorrect = userAnswer.length === correctAnswer.length &&
      userAnswer.every((answer, index) => answer === correctAnswer[index]);
    
    if (isCorrect) {
      totalCorrect++;
      thematicBreakdown[question.theme].correct++;
    }
  });

  return {
    totalScore: totalCorrect,
    thematicBreakdown,
    isPassing: totalCorrect >= 35, // 35 out of 40 for passing
  };
}

/**
 * Formats time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generates a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Calculates percentage with optional decimal places
 */
export function calculatePercentage(value: number, total: number, decimals: number = 1): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * Math.pow(10, decimals)) / Math.pow(10, decimals);
}