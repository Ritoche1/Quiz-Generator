import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import Home from '@/app/page';
import '@testing-library/jest-dom';

// On peut mocker les composants enfants s'ils ne doivent pas être testés ici
jest.mock('@/components/QuizGenerator', () => () => <div data-testid="quiz-generator">QuizGenerator Component</div>);
jest.mock('@/components/QuizQuestion', () => () => <div data-testid="quiz-question">QuizQuestion Component</div>);
jest.mock('@/components/QuizRecap', () => () => <div data-testid="quiz-recap">QuizRecap Component</div>);

describe('Home page', () => {
  beforeEach(() => {
    // Simule un utilisateur authentifié
    localStorage.setItem('quizToken', 'test-token');
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'u1', email: 'test@example.com' }),
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  test('affiche QuizGenerator lorsque le quiz est null', async () => {
    render(<Home />);
    // Attendre que l’état auth soit mis à jour et que le composant s’affiche
    expect(await screen.findByTestId('quiz-generator')).toBeInTheDocument();
  });

  test("affiche un message d'erreur si aucun quiz n'est reçu", async () => {
    render(<Home />);
    // Le message d'erreur ne doit pas être affiché par défaut
    const errorElem = screen.queryByText(/No questions found. Please try again./i);
    expect(errorElem).not.toBeInTheDocument();
  });

  test('affiche QuizQuestion après génération de quiz et réponse', async () => {
    const fakeQuiz = {
      questions: [
        {
          question: 'Quelle est la capitale de la France ?',
          options: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
          answer: 'Paris',
        },
      ],
    };

    // On passe le fakeQuiz en prop pour simuler qu'un quiz a déjà été généré.
    render(<Home initialQuiz={fakeQuiz} />);
    expect(await screen.findByTestId('quiz-question')).toBeInTheDocument();
  });
});