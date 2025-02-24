// langage: javascript
// filepath: quiz-generator/src/components/QuizQuestion.test.jsx
import { render, screen } from '@testing-library/react';
import QuizQuestion from '../components/QuizQuestion';
import '@testing-library/jest-dom';

describe('QuizQuestion Component', () => {
  test('renders correctly with a question prop', () => {
    const fakeQuestion = {
      question: "Quelle est la capitale de la France ?",
      options: ["Paris", "Lyon", "Marseille", "Toulouse"],
      answer: "Paris"
    };
    render(<QuizQuestion question={fakeQuestion.question} options={fakeQuestion.options}  />);
    expect(screen.getByText(/capitale de la France/i)).toBeInTheDocument();
  });
});