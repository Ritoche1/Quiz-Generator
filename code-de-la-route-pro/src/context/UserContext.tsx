import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { UserState, UserAction, UserProfile, QuizAttempt, UserStatistics } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const initialUserProfile: UserProfile = {
  id: 'user-' + Date.now(),
  attempts: [],
  statistics: {
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    currentStreak: 0,
    weakestThemes: [],
    strongestThemes: [],
  },
  preferences: {
    theme: 'dark',
    language: 'fr',
    soundEnabled: true,
  },
};

const initialUserState: UserState = {
  profile: initialUserProfile,
  isLoaded: false,
};

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'LOAD_PROFILE':
      return {
        ...state,
        profile: action.payload,
        isLoaded: true,
      };

    case 'ADD_ATTEMPT':
      const newAttempts = [...state.profile.attempts, action.payload];
      const updatedStatistics = calculateStatistics(newAttempts);
      
      return {
        ...state,
        profile: {
          ...state.profile,
          attempts: newAttempts,
          statistics: updatedStatistics,
        },
      };

    case 'UPDATE_STATISTICS':
      return {
        ...state,
        profile: {
          ...state.profile,
          statistics: {
            ...state.profile.statistics,
            ...action.payload,
          },
        },
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        profile: {
          ...state.profile,
          preferences: {
            ...state.profile.preferences,
            ...action.payload,
          },
        },
      };

    default:
      return state;
  }
}

function calculateStatistics(attempts: QuizAttempt[]): UserStatistics {
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      currentStreak: 0,
      weakestThemes: [],
      strongestThemes: [],
    };
  }

  const totalAttempts = attempts.length;
  const scores = attempts.map(a => a.score);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
  const bestScore = Math.max(...scores);

  // Calculate current streak (consecutive passing attempts from the end)
  let currentStreak = 0;
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (attempts[i].score >= 35) { // Pass threshold
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate theme performance
  const themeStats: Record<string, { correct: number; total: number }> = {};
  
  attempts.forEach(attempt => {
    Object.entries(attempt.thematicBreakdown).forEach(([theme, stats]) => {
      if (!themeStats[theme]) {
        themeStats[theme] = { correct: 0, total: 0 };
      }
      themeStats[theme].correct += stats.correct;
      themeStats[theme].total += stats.total;
    });
  });

  const themePerformances = Object.entries(themeStats).map(([theme, stats]) => ({
    theme,
    percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
  }));

  const sortedByPerformance = themePerformances.sort((a, b) => a.percentage - b.percentage);
  
  const weakestThemes = sortedByPerformance.slice(0, 3).map(t => t.theme) as any[];
  const strongestThemes = sortedByPerformance.slice(-3).map(t => t.theme) as any[];

  return {
    totalAttempts,
    averageScore: Math.round(averageScore * 10) / 10,
    bestScore,
    currentStreak,
    weakestThemes,
    strongestThemes,
  };
}

interface UserContextType {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  // Helper functions
  addAttempt: (attempt: QuizAttempt) => void;
  updateStatistics: (statistics: Partial<UserStatistics>) => void;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void;
  getRecentAttempts: (count?: number) => QuizAttempt[];
  getAttemptsByMode: (mode: 'examen_blanc' | 'car_recognition') => QuizAttempt[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [storedProfile, setStoredProfile] = useLocalStorage<UserProfile>('codeRouteProfile', initialUserProfile);
  const [state, dispatch] = useReducer(userReducer, { profile: storedProfile, isLoaded: true });

  // Sync with localStorage whenever profile changes
  useEffect(() => {
    if (state.isLoaded) {
      setStoredProfile(state.profile);
    }
  }, [state.profile, state.isLoaded, setStoredProfile]);

  // Load profile on mount
  useEffect(() => {
    dispatch({ type: 'LOAD_PROFILE', payload: storedProfile });
  }, [storedProfile]);

  // Helper functions
  const addAttempt = (attempt: QuizAttempt) => {
    dispatch({ type: 'ADD_ATTEMPT', payload: attempt });
  };

  const updateStatistics = (statistics: Partial<UserStatistics>) => {
    dispatch({ type: 'UPDATE_STATISTICS', payload: statistics });
  };

  const updatePreferences = (preferences: Partial<UserProfile['preferences']>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  const getRecentAttempts = (count: number = 5): QuizAttempt[] => {
    return state.profile.attempts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  };

  const getAttemptsByMode = (mode: 'examen_blanc' | 'car_recognition'): QuizAttempt[] => {
    return state.profile.attempts.filter(attempt => attempt.mode === mode);
  };

  const value: UserContextType = {
    state,
    dispatch,
    addAttempt,
    updateStatistics,
    updatePreferences,
    getRecentAttempts,
    getAttemptsByMode,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}