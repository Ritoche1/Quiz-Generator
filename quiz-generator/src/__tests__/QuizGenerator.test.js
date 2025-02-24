// langage: javascript
// filepath: quiz-generator/src/components/QuizGenerator.test.jsx
import { render, screen } from '@testing-library/react';
import QuizGenerator from '../components/QuizGenerator';
import '@testing-library/jest-dom';

describe('QuizGenerator Component', () => {
  test('renders properly', () => {
    render(<QuizGenerator />);
    expect(screen.getByTestId('quiz-generator')).toBeInTheDocument();
  });
});