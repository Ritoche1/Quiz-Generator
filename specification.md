# Code de la Route Pro - Quiz Application Specification

## 1.0 Project Overview

**Code de la Route Pro** is a comprehensive quiz web application specifically designed for French driving license exam preparation. The application provides an authentic "Examen Blanc" (practice exam) experience with official ETG (Epreuve Théorique Générale) themes and question formats.

### 1.1 Technology Requirements
- **Framework**: React with TypeScript (Create React App template)
- **Styling**: styled-components for all styling
- **Routing**: react-router-dom for client-side navigation
- **State Management**: React Context API with useReducer
- **Design Aesthetic**: Dark mode "Heads-Up Display" (HUD) style
- **Data Persistence**: Browser localStorage with custom hook

### 1.2 Core Features
- Examen Blanc mode with 40-question practice tests
- 20-second countdown timer per question
- Car Brand Recognition quiz
- Comprehensive results analysis with thematic breakdown
- Historical statistics and performance tracking
- Responsive design for mobile and desktop

## 2.0 Data Architecture

### 2.1 Data Sources
- **Primary Questions**: Local database.json file with 50+ questions
- **Car Logos**: External API - https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/logos.json

### 2.2 QuizQuestion Schema

```typescript
interface QuizQuestion {
  id: string;
  category: "official_code" | "general_knowledge";
  theme: ETGTheme;
  question: string;
  options: string[];
  correctAnswers: string[]; // Multiple answers supported
  explanation?: string;
  imageUrl?: string;
  difficulty: "easy" | "medium" | "hard";
}

type ETGTheme = 
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
```

### 2.3 Thematic Distribution for Examen Blanc

| Theme | Questions | Percentage |
|-------|-----------|------------|
| Circulation Routière | 8 | 20% |
| Conducteur | 6 | 15% |
| Route | 5 | 12.5% |
| Autres Usagers | 4 | 10% |
| Réglementation Générale | 4 | 10% |
| Précautions Diverses | 3 | 7.5% |
| Éléments Mécaniques & Sécurité | 3 | 7.5% |
| Équipements de Sécurité | 3 | 7.5% |
| Règle de Circulation | 2 | 5% |
| Environnement | 2 | 5% |
| **Total** | **40** | **100%** |

### 2.4 Car Brand Recognition Schema

```typescript
interface CarBrand {
  name: string;
  logo: string; // URL from GitHub API
  country?: string;
}

interface CarQuizQuestion {
  id: string;
  logoUrl: string;
  correctAnswer: string;
  options: string[]; // 4 options including correct answer
}
```

### 2.5 User Data Persistence

```typescript
interface UserProfile {
  id: string;
  attempts: QuizAttempt[];
  statistics: UserStatistics;
  preferences: UserPreferences;
}

interface QuizAttempt {
  id: string;
  date: Date;
  mode: "examen_blanc" | "car_recognition";
  score: number;
  totalQuestions: number;
  timeSpent: number; // seconds
  thematicBreakdown: Record<ETGTheme, { correct: number; total: number }>;
  answers: QuestionAnswer[];
}

interface UserStatistics {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  weakestThemes: ETGTheme[];
  strongestThemes: ETGTheme[];
}
```

## 3.0 Application Features

### 3.1 Dashboard (Home Page)
- Mode selection: "Examen Blanc" and "Car Brand Recognition"
- Overall progress gauge showing performance trends
- Quick access to recent results
- Statistics overview

### 3.2 Quiz Engine

#### 3.2.1 Examen Blanc Mode
- **Question Selection**: Random selection following thematic distribution (Table 2.2)
- **Timer**: 20-second countdown per question
- **Auto-Submit**: Questions auto-submit when timer expires
- **No Immediate Feedback**: No right/wrong indication during quiz
- **Progress Indicator**: Visual progress bar and question counter
- **Multiple Answers**: Clear indication when multiple selections required

#### 3.2.2 Car Brand Recognition Mode
- **Dynamic Loading**: Fetch car logos from GitHub API
- **Question Generation**: Create multiple-choice questions from logo data
- **Same Timer Rules**: 20-second countdown per question
- **Scoring**: Standard scoring system

### 3.3 Results Page

#### 3.3.1 Score Display
- **Pass/Fail Threshold**: 35 out of 40 questions (87.5%)
- **Visual Score Indicator**: Large, prominent score display
- **Pass/Fail Status**: Clear visual indication with color coding

#### 3.3.2 Thematic Breakdown
- **Bar Chart**: Visual representation of performance by theme
- **Performance Indicators**: Color-coded bars (green: good, orange: needs improvement, red: critical)
- **Detailed Statistics**: Correct/total for each theme

#### 3.3.3 Question Review
- **Complete Review List**: All 40 questions with user answers
- **Correct/Incorrect Indicators**: Visual status for each question
- **Explanations**: Detailed explanations for incorrect answers
- **Theme Tags**: Questions grouped by theme

### 3.4 Statistics Page

#### 3.4.1 Performance Over Time
- **Line Chart**: Score progression over multiple attempts
- **Trend Analysis**: Improvement or decline indicators
- **Moving Average**: Smoothed performance trend

#### 3.4.2 Aggregate Statistics
- **Total Attempts**: Number of quizzes taken
- **Average Score**: Overall performance average
- **Best Score**: Personal best achievement
- **Current Streak**: Consecutive passing attempts
- **Theme Analysis**: Strongest and weakest themes

## 4.0 Component Blueprint

### 4.1 Core Components

#### 4.1.1 Router.tsx
- Main application router using react-router-dom
- Route definitions for all pages
- Protected route logic if needed

#### 4.1.2 App.tsx
- ThemeProvider wrapper with styled-components theme
- Global state providers (Context API)
- Router component

### 4.2 Page Components

#### 4.2.1 Dashboard.tsx
- Mode selection cards
- Overall progress gauge
- Recent results summary
- Navigation to quiz modes

#### 4.2.2 Quiz.tsx
- Question display with timer
- Option selection interface
- Progress indicator
- Navigation controls

#### 4.2.3 Results.tsx
- Score display with pass/fail status
- Thematic breakdown chart
- Question review list
- Navigation to retake or statistics

#### 4.2.4 Statistics.tsx
- Performance over time chart
- Aggregate statistics display
- Theme analysis breakdown

### 4.3 UI Components

#### 4.3.1 CategoryCard.tsx
Props specification:
```typescript
interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  backgroundColor?: string;
}
```

#### 4.3.2 OverallProgressGauge.tsx
- Circular progress indicator
- Performance trend visualization
- Color-coded status

#### 4.3.3 QuestionReviewItem.tsx
- Individual question review display
- Answer comparison
- Explanation text
- Status indicators

#### 4.3.4 Timer.tsx
- 20-second countdown display
- Visual progress ring
- Auto-submit functionality

## 5.0 Design System

### 5.1 Color Palette

#### 5.1.1 Primary Colors
```typescript
const colors = {
  // Electric Blue (Primary)
  electricBlue: '#00D4FF',
  electricBlueDark: '#0099CC',
  electricBlueLight: '#33DDFF',
  
  // Dark Mode Background
  backgroundDark: '#0A0A0B',
  backgroundMedium: '#1A1A1B',
  backgroundLight: '#2A2A2B',
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B8B8',
  textMuted: '#888888',
  
  // Status Colors
  success: '#00FF88',
  warning: '#FFB800',
  error: '#FF4444',
  
  // Glass Effect
  glassBackground: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
}
```

### 5.2 Typography Scale

```typescript
const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  
  // Font Sizes
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  
  // Font Weights
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}
```

### 5.3 Spacing Scale (4px baseline)

```typescript
const spacing = {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
}
```

### 5.4 Effects & Shadows

#### 5.4.1 Glass Morphism Effect
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

#### 5.4.2 Electric Blue Glow
```css
box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
border: 1px solid #00D4FF;
```

#### 5.4.3 Inset Shadows (HUD Style)
```css
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
```

### 5.5 Iconography
- **Library**: react-feather
- **Style**: Outline style with 2px stroke width
- **Colors**: Match theme colors (electric blue for primary actions)

## 6.0 Technical Implementation

### 6.1 Project Setup

#### 6.1.1 Create React App Command
```bash
npx create-react-app code-de-la-route-pro --template typescript
cd code-de-la-route-pro
```

#### 6.1.2 Required Dependencies
```bash
npm install styled-components react-router-dom react-feather
npm install --save-dev @types/styled-components @types/react-router-dom
```

#### 6.1.3 File Structure
```
/src
├── /assets
│   ├── /images
│   └── /icons
├── /components
│   ├── /ui           # Reusable UI components
│   └── /layout       # Layout components
├── /context          # React Context providers
├── /data
│   └── database.json # Quiz questions data
├── /hooks            # Custom React hooks
├── /pages            # Page components
├── /styles
│   ├── GlobalStyle.ts
│   └── theme.ts
├── App.tsx
└── index.tsx
```

### 6.2 State Management

#### 6.2.1 Quiz Context
```typescript
interface QuizState {
  currentQuiz: QuizQuestion[] | null;
  currentQuestionIndex: number;
  userAnswers: Record<string, string[]>;
  timeRemaining: number;
  isComplete: boolean;
  score: number | null;
}

interface QuizActions {
  START_QUIZ: { questions: QuizQuestion[] };
  ANSWER_QUESTION: { questionId: string; answers: string[] };
  NEXT_QUESTION: {};
  COMPLETE_QUIZ: {};
  RESET_QUIZ: {};
}
```

#### 6.2.2 User Profile Context
```typescript
interface UserState {
  profile: UserProfile;
  isLoaded: boolean;
}

interface UserActions {
  LOAD_PROFILE: { profile: UserProfile };
  ADD_ATTEMPT: { attempt: QuizAttempt };
  UPDATE_STATISTICS: { statistics: Partial<UserStatistics> };
}
```

### 6.3 Custom Hooks

#### 6.3.1 useLocalStorage Hook
```typescript
function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T) => void] {
  // Implementation for localStorage persistence
}
```

#### 6.3.2 useTimer Hook
```typescript
function useTimer(
  initialTime: number,
  onTimeUp: () => void
): {
  timeRemaining: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
} {
  // Implementation for countdown timer
}
```

### 6.4 Quiz Engine Logic

#### 6.4.1 Question Selection Algorithm
```typescript
function selectExamQuestions(
  allQuestions: QuizQuestion[],
  distribution: Record<ETGTheme, number>
): QuizQuestion[] {
  // Implement random selection following thematic distribution
}
```

#### 6.4.2 Scoring Algorithm
```typescript
function calculateScore(
  answers: Record<string, string[]>,
  questions: QuizQuestion[]
): {
  totalScore: number;
  thematicBreakdown: Record<ETGTheme, { correct: number; total: number }>;
  isPassing: boolean;
} {
  // Implement scoring logic with 35/40 pass threshold
}
```

### 6.5 API Integration

#### 6.5.1 Car Brands API
```typescript
async function fetchCarBrands(): Promise<CarBrand[]> {
  const response = await fetch(
    'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/logos.json'
  );
  return response.json();
}

function generateCarQuiz(brands: CarBrand[], count: number): CarQuizQuestion[] {
  // Generate random car brand recognition questions
}
```

### 6.6 Build Configuration

#### 6.6.1 Package.json Scripts
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

#### 6.6.2 Deployment Requirements
- Build output in `/build` directory
- Static files ready for deployment on Vercel or similar platforms
- Environment variables for external API endpoints if needed

## 7.0 Acceptance Criteria

### 7.1 Functional Requirements
- ✅ Application built with Create React App + TypeScript
- ✅ All styling implemented with styled-components (no CSS files)
- ✅ Client-side routing with react-router-dom
- ✅ 50+ sample questions in database.json following QuizQuestion schema
- ✅ Examen Blanc mode with 40 questions and correct thematic distribution
- ✅ 20-second timer per question with auto-submit
- ✅ Car brand recognition quiz with GitHub API integration
- ✅ Results page with score, thematic breakdown, and question review
- ✅ Statistics page with performance tracking
- ✅ localStorage persistence with custom hook
- ✅ Dark mode HUD aesthetic with electric blue accents

### 7.2 Technical Requirements
- ✅ All components use TypeScript with proper type definitions
- ✅ Theme system with consistent colors, typography, and spacing
- ✅ Responsive design for mobile and desktop
- ✅ React Context API for state management
- ✅ Custom hooks for reusable logic
- ✅ Production-ready build output

### 7.3 User Experience Requirements
- ✅ Smooth navigation between pages
- ✅ Clear visual feedback for user actions
- ✅ Accessible design with proper ARIA labels
- ✅ Loading states for API calls
- ✅ Error handling for network issues
- ✅ Intuitive quiz flow without immediate feedback

### 7.4 Documentation Requirements
- ✅ README.md with installation and running instructions
- ✅ Clear code comments for complex logic
- ✅ Type definitions for all data structures
- ✅ Component props documentation

## 8.0 Future Enhancements

### 8.1 Potential Features
- User authentication and cloud sync
- Multiplayer quiz competitions
- Additional quiz categories
- Offline mode with service workers
- Mobile app with React Native
- Advanced analytics dashboard

### 8.2 Performance Optimizations
- Image lazy loading
- Component code splitting
- Service worker for caching
- Progressive Web App features