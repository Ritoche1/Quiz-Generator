import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Home, RefreshCw, BarChart, CheckCircle, XCircle } from 'react-feather';
import { Container, Section, Card, CardHeader, CardTitle, Grid, Flex } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { QuestionReviewItem } from '../components/ui/QuestionReviewItem';
import { useQuiz } from '../context/QuizContext';
import { useUser } from '../context/UserContext';
import { QUIZ_CONSTANTS, THEME_LABELS } from '../types';
import { calculatePercentage } from '../utils/quizUtils';

const ResultsContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.backgroundDark};
  padding: ${({ theme }) => theme.spacing[4]} 0;
`;

const HeroSection = styled(Section)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]} 0;
`;

const ScoreDisplay = styled.div<{ isPassing: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: ${({ isPassing, theme }) => 
    isPassing 
      ? `radial-gradient(circle, ${theme.colors.success}20, ${theme.colors.success}10)`
      : `radial-gradient(circle, ${theme.colors.error}20, ${theme.colors.error}10)`
  };
  border: 4px solid ${({ isPassing, theme }) => 
    isPassing ? theme.colors.success : theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  
  ${({ isPassing, theme }) => 
    isPassing 
      ? `box-shadow: 0 0 30px ${theme.colors.success}40;`
      : `box-shadow: 0 0 30px ${theme.colors.error}40;`
  }
  
  @media (max-width: 768px) {
    width: 160px;
    height: 160px;
  }
`;

const ScoreText = styled.div`
  text-align: center;
`;

const ScoreValue = styled.div<{ isPassing: boolean }>`
  font-size: ${({ theme }) => theme.typography['4xl']};
  font-weight: ${({ theme }) => theme.typography.bold};
  color: ${({ isPassing, theme }) => 
    isPassing ? theme.colors.success : theme.colors.error};
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography['3xl']};
  }
`;

const ScoreLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const StatusBanner = styled.div<{ isPassing: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  border-radius: 25px;
  background: ${({ isPassing, theme }) => 
    isPassing ? theme.colors.success : theme.colors.error};
  color: white;
  font-size: ${({ theme }) => theme.typography.lg};
  font-weight: ${({ theme }) => theme.typography.semibold};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatsGrid = styled(Grid)`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography['2xl']};
  font-weight: ${({ theme }) => theme.typography.bold};
  color: ${({ theme }) => theme.colors.electricBlue};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ThematicSection = styled(Section)`
  /* Specific styling for thematic breakdown */
`;

const ThemeBar = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ThemeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const ThemeName = styled.span`
  font-size: ${({ theme }) => theme.typography.base};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.typography.medium};
`;

const ThemeScore = styled.span`
  font-size: ${({ theme }) => theme.typography.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ThemeProgress = styled.div`
  width: 100%;
  height: 12px;
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: 6px;
  overflow: hidden;
`;

const ThemeProgressFill = styled.div<{ percentage: number; color: string }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background: ${({ color }) => color};
  border-radius: 6px;
  transition: width 0.5s ease;
`;

const ActionButtons = styled(Flex)`
  justify-content: center;
  margin: ${({ theme }) => theme.spacing[8]} 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    > * {
      width: 100%;
    }
  }
`;

const ReviewSection = styled(Section)`
  /* Question review styling */
`;

export function Results() {
  const navigate = useNavigate();
  const { state: quizState, resetQuiz } = useQuiz();
  const { getRecentAttempts } = useUser();
  
  // Get the most recent attempt (should be the one just completed)
  const recentAttempts = getRecentAttempts(1);
  const currentAttempt = recentAttempts[0];
  
  if (!currentAttempt || !quizState.currentQuiz) {
    return (
      <ResultsContainer>
        <Container>
          <Section>
            <Card>
              <CardHeader>
                <CardTitle>Aucun résultat disponible</CardTitle>
              </CardHeader>
              <Flex justify="center">
                <Button onClick={() => navigate('/')}>
                  <Home size={20} />
                  Retour à l'accueil
                </Button>
              </Flex>
            </Card>
          </Section>
        </Container>
      </ResultsContainer>
    );
  }
  
  const isPassing = currentAttempt.score >= QUIZ_CONSTANTS.PASS_THRESHOLD;
  const percentage = calculatePercentage(currentAttempt.score, currentAttempt.totalQuestions);
  
  const handleRetakeQuiz = () => {
    resetQuiz();
    const mode = currentAttempt.mode === 'examen_blanc' ? 'examen-blanc' : 'car-recognition';
    navigate(`/quiz/${mode}`);
  };
  
  const getThemeColor = (percentage: number) => {
    if (percentage >= 80) return '#00FF88'; // success
    if (percentage >= 60) return '#FFB800'; // warning
    return '#FF4444'; // error
  };
  
  return (
    <ResultsContainer>
      <Container>
        <HeroSection>
          <ScoreDisplay isPassing={isPassing}>
            <ScoreText>
              <ScoreValue isPassing={isPassing}>
                {currentAttempt.score}/{currentAttempt.totalQuestions}
              </ScoreValue>
              <ScoreLabel>{percentage}%</ScoreLabel>
            </ScoreText>
          </ScoreDisplay>
          
          <StatusBanner isPassing={isPassing}>
            {isPassing ? <CheckCircle /> : <XCircle />}
            {isPassing ? 'ADMIS' : 'RECALÉ'}
          </StatusBanner>
          
          <StatsGrid columns={3}>
            <StatCard>
              <StatValue>{currentAttempt.score}</StatValue>
              <StatLabel>Bonnes réponses</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{currentAttempt.totalQuestions - currentAttempt.score}</StatValue>
              <StatLabel>Erreurs</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{Math.floor(currentAttempt.timeSpent / 60)}'</StatValue>
              <StatLabel>Temps total</StatLabel>
            </StatCard>
          </StatsGrid>
          
          <ActionButtons gap="1rem">
            <Button onClick={() => navigate('/')}>
              <Home size={20} />
              Accueil
            </Button>
            
            <Button variant="secondary" onClick={handleRetakeQuiz}>
              <RefreshCw size={20} />
              Recommencer
            </Button>
            
            <Button variant="secondary" onClick={() => navigate('/statistics')}>
              <BarChart size={20} />
              Statistiques
            </Button>
          </ActionButtons>
        </HeroSection>
        
        {currentAttempt.mode === 'examen_blanc' && (
          <ThematicSection>
            <Card>
              <CardHeader>
                <CardTitle>Répartition par thème</CardTitle>
              </CardHeader>
              
              {Object.entries(currentAttempt.thematicBreakdown).map(([theme, stats]) => {
                const themePercentage = calculatePercentage(stats.correct, stats.total);
                const color = getThemeColor(themePercentage);
                
                return (
                  <ThemeBar key={theme}>
                    <ThemeHeader>
                      <ThemeName>{THEME_LABELS[theme as keyof typeof THEME_LABELS] || theme}</ThemeName>
                      <ThemeScore>{stats.correct}/{stats.total} ({themePercentage}%)</ThemeScore>
                    </ThemeHeader>
                    
                    <ThemeProgress>
                      <ThemeProgressFill percentage={themePercentage} color={color} />
                    </ThemeProgress>
                  </ThemeBar>
                );
              })}
            </Card>
          </ThematicSection>
        )}
        
        <ReviewSection>
          <Card>
            <CardHeader>
              <CardTitle>Révision détaillée</CardTitle>
            </CardHeader>
            
            {quizState.currentQuiz.map((question, index) => {
              const answer = currentAttempt.answers.find(a => a.questionId === question.id);
              if (!answer) return null;
              
              return (
                <QuestionReviewItem
                  key={question.id}
                  question={question}
                  userAnswers={answer.userAnswers}
                  isCorrect={answer.isCorrect}
                  showExplanation={true}
                />
              );
            })}
          </Card>
        </ReviewSection>
      </Container>
    </ResultsContainer>
  );
}