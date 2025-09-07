import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Clock } from 'react-feather';
import { Container, Card, Flex } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Timer } from '../components/ui/Timer';
import { ProgressGauge } from '../components/ui/ProgressGauge';
import { useQuiz } from '../context/QuizContext';
import { useUser } from '../context/UserContext';
import { loadQuestions, selectExamQuestions, fetchCarBrands, generateCarQuiz, generateId } from '../utils/quizUtils';
import { QUIZ_CONSTANTS, QuizAttempt } from '../types';

const QuizContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.backgroundDark};
  padding: ${({ theme }) => theme.spacing[4]} 0;
`;

const QuizHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[4]};
    text-align: center;
  }
`;

const QuizTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography['2xl']};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const QuestionCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[3]};
  }
`;

const QuestionText = styled.h2`
  font-size: ${({ theme }) => theme.typography.xl};
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.5;
  margin: 0;
  flex: 1;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const OptionButton = styled.button<{ isSelected: boolean }>`
  ${({ theme }) => theme.effects.glassMorphism}
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: 12px;
  border: 2px solid ${({ isSelected, theme }) => 
    isSelected ? theme.colors.electricBlue : 'transparent'};
  background: ${({ isSelected, theme }) => 
    isSelected ? `${theme.colors.electricBlue}20` : theme.colors.glassBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: ${({ theme }) => theme.typography.base};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.electricBlue};
    transform: translateX(4px);
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.electricBlue};
    outline-offset: 2px;
  }
`;

const NavigationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[4]};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const LoadingText = styled.div`
  font-size: ${({ theme }) => theme.typography.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export function Quiz() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { state: quizState, startQuiz, answerQuestion, nextQuestion, getCurrentQuestion, getProgress, completeQuiz } = useQuiz();
  const { addAttempt } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  
  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  
  // Initialize quiz on mount
  useEffect(() => {
    const initializeQuiz = async () => {
      setIsLoading(true);
      
      try {
        if (mode === 'examen-blanc') {
          const allQuestions = loadQuestions();
          const examQuestions = selectExamQuestions(allQuestions);
          startQuiz(examQuestions, 'examen_blanc');
        } else if (mode === 'car-recognition') {
          const carBrands = await fetchCarBrands();
          const carQuestions = generateCarQuiz(carBrands, QUIZ_CONSTANTS.CAR_QUIZ_QUESTION_COUNT);
          
          // Convert car questions to quiz questions format
          const quizQuestions = carQuestions.map(cq => ({
            id: cq.id,
            category: 'general_knowledge' as const,
            theme: 'autres_usagers' as const,
            question: 'Quelle est cette marque automobile ?',
            options: cq.options,
            correctAnswers: [cq.correctAnswer],
            imageUrl: cq.logoUrl,
            difficulty: 'medium' as const,
          }));
          
          startQuiz(quizQuestions, 'car_recognition');
        }
      } catch (error) {
        console.error('Error initializing quiz:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!quizState.currentQuiz) {
      initializeQuiz();
    } else {
      setIsLoading(false);
    }
  }, [mode, startQuiz, navigate, quizState.currentQuiz]);
  
  // Reset selected answers when question changes
  useEffect(() => {
    if (currentQuestion) {
      const currentAnswers = quizState.userAnswers[currentQuestion.id] || [];
      setSelectedAnswers(currentAnswers);
    }
  }, [currentQuestion, quizState.userAnswers]);
  
  const handleAnswerSelect = (option: string) => {
    if (!currentQuestion) return;
    
    const isMultipleChoice = currentQuestion.correctAnswers.length > 1;
    let newAnswers: string[];
    
    if (isMultipleChoice) {
      // Toggle answer for multiple choice
      if (selectedAnswers.includes(option)) {
        newAnswers = selectedAnswers.filter(a => a !== option);
      } else {
        newAnswers = [...selectedAnswers, option];
      }
    } else {
      // Single choice
      newAnswers = [option];
    }
    
    setSelectedAnswers(newAnswers);
    answerQuestion(currentQuestion.id, newAnswers);
  };
  
  const handleNextQuestion = () => {
    if (progress.current === progress.total) {
      handleCompleteQuiz();
    } else {
      nextQuestion();
      setSelectedAnswers([]);
    }
  };
  
  const handleTimeUp = () => {
    // Auto-submit current answers and move to next question
    handleNextQuestion();
  };
  
  const handleCompleteQuiz = () => {
    if (!quizState.currentQuiz || !quizState.startTime) return;
    
    completeQuiz();
    
    // Create quiz attempt record
    const attempt: QuizAttempt = {
      id: generateId(),
      date: new Date(),
      mode: quizState.mode || 'examen_blanc',
      score: quizState.score || 0,
      totalQuestions: quizState.currentQuiz.length,
      timeSpent: Math.floor((Date.now() - quizState.startTime.getTime()) / 1000),
      thematicBreakdown: {} as any,
      answers: quizState.currentQuiz.map(q => {
        const userAnswers = quizState.userAnswers[q.id] || [];
        const isCorrect = userAnswers.length === q.correctAnswers.length &&
          userAnswers.every(answer => q.correctAnswers.includes(answer));
        
        return {
          questionId: q.id,
          userAnswers,
          correctAnswers: q.correctAnswers,
          isCorrect,
          timeSpent: QUIZ_CONSTANTS.QUESTION_TIME_LIMIT, // Approximate
        };
      }),
    };
    
    // Calculate thematic breakdown
    const thematicStats: Record<string, { correct: number; total: number }> = {};
    attempt.answers.forEach(answer => {
      const question = quizState.currentQuiz!.find(q => q.id === answer.questionId);
      if (question) {
        const theme = question.theme;
        if (!thematicStats[theme]) {
          thematicStats[theme] = { correct: 0, total: 0 };
        }
        thematicStats[theme].total++;
        if (answer.isCorrect) {
          thematicStats[theme].correct++;
        }
      }
    });
    
    attempt.thematicBreakdown = thematicStats as any;
    
    addAttempt(attempt);
    navigate('/results');
  };
  
  if (isLoading) {
    return (
      <QuizContainer>
        <Container>
          <LoadingContainer>
            <Clock size={48} color="#00D4FF" />
            <LoadingText>Préparation du quiz...</LoadingText>
          </LoadingContainer>
        </Container>
      </QuizContainer>
    );
  }
  
  if (!currentQuestion) {
    return (
      <QuizContainer>
        <Container>
          <LoadingContainer>
            <LoadingText>Quiz terminé</LoadingText>
            <Button onClick={() => navigate('/results')}>
              Voir les résultats
            </Button>
          </LoadingContainer>
        </Container>
      </QuizContainer>
    );
  }
  
  const isMultipleChoice = currentQuestion.correctAnswers.length > 1;
  const quizTitle = mode === 'examen-blanc' ? 'Examen Blanc' : 'Reconnaissance de Marques';
  
  return (
    <QuizContainer>
      <Container>
        <QuizHeader>
          <QuizTitle>{quizTitle}</QuizTitle>
          
          <Flex align="center" gap="2rem">
            <ProgressGauge
              current={progress.current}
              total={progress.total}
              variant="linear"
              showLabel={false}
            />
            
            <Timer
              initialTime={QUIZ_CONSTANTS.QUESTION_TIME_LIMIT}
              onTimeUp={handleTimeUp}
              isRunning={true}
            />
          </Flex>
        </QuizHeader>
        
        <QuestionCard>
          <QuestionHeader>
            <QuestionText>{currentQuestion.question}</QuestionText>
            
            {isMultipleChoice && (
              <div style={{ fontSize: '0.875rem', color: '#888', fontStyle: 'italic' }}>
                Plusieurs réponses possibles
              </div>
            )}
          </QuestionHeader>
          
          {currentQuestion.imageUrl && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img 
                src={currentQuestion.imageUrl} 
                alt="Question illustration"
                style={{ maxWidth: '200px', height: 'auto', borderRadius: '8px' }}
              />
            </div>
          )}
          
          <OptionsContainer>
            {currentQuestion.options.map((option, index) => (
              <OptionButton
                key={index}
                isSelected={selectedAnswers.includes(option)}
                onClick={() => handleAnswerSelect(option)}
              >
                {String.fromCharCode(65 + index)}. {option}
              </OptionButton>
            ))}
          </OptionsContainer>
          
          <NavigationBar>
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
            >
              <ChevronLeft size={20} />
              Quitter
            </Button>
            
            <div>
              Question {progress.current} sur {progress.total}
            </div>
            
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswers.length === 0}
            >
              {progress.current === progress.total ? 'Terminer' : 'Suivant'}
              <ChevronRight size={20} />
            </Button>
          </NavigationBar>
        </QuestionCard>
      </Container>
    </QuizContainer>
  );
}