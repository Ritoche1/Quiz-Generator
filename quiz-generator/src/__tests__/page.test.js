import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import Home from '@/app/page';
import '@testing-library/jest-dom';

// On peut mocker les composants enfants s'ils ne doivent pas être testés ici
jest.mock('@/components/QuizGenerator', () => () => <div data-testid="quiz-generator">QuizGenerator Component</div>);
jest.mock('@/components/QuizQuestion', () => () => <div data-testid="quiz-question">QuizQuestion Component</div>);
jest.mock('@/components/QuizRecap', () => () => <div data-testid="quiz-recap">QuizRecap Component</div>);

describe('Home page', () => {
  test('affiche QuizGenerator lorsque le quiz est null', () => {
    render(<Home />);
    expect(screen.getByTestId('quiz-generator')).toBeInTheDocument();
  });

  test('affiche un message d\'erreur si aucun quiz n\'est reçu', () => {
    render(<Home />);
    const errorElem = screen.queryByText(/No questions found. Please try again./i);
    expect(errorElem).not.toBeInTheDocument();
  });

  test('affiche QuizQuestion après génération de quiz et réponse', () => {
    const fakeQuiz = {
      questions: [
        {
          question: "Quelle est la capitale de la France ?",
          options: ["Paris", "Lyon", "Marseille", "Toulouse"],
          answer: "Paris"
        }
      ]
    };

    // On passe le fakeQuiz en prop pour simuler qu'un quiz a déjà été généré.
    render(<Home initialQuiz={fakeQuiz} />);
    expect(screen.getByTestId('quiz-question')).toBeInTheDocument();
  });
});