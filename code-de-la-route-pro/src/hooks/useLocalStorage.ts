import { useState } from 'react';

/**
 * Custom hook for localStorage persistence
 * @param key - localStorage key
 * @param initialValue - initial value if nothing is stored
 * @returns [value, setValue] tuple
 */
export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get from local storage then parse stored json or return initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}