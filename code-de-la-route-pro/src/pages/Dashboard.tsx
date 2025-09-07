import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { BookOpen, Truck, BarChart, Award } from 'react-feather';
import { Container, Grid, Card } from '../components/ui/Layout';
import { CategoryCard } from '../components/ui/CategoryCard';
import { ProgressGauge } from '../components/ui/ProgressGauge';
import { useUser } from '../context/UserContext';

const HeroSection = styled.section`
  text-align: center;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.backgroundDark} 0%,
    ${({ theme }) => theme.colors.backgroundMedium} 100%
  );
  padding: 4rem 0;
  
  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const HeroTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography['4xl']};
  font-weight: ${({ theme }) => theme.typography.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  
  .highlight {
    color: ${({ theme }) => theme.colors.electricBlue};
    text-shadow: 0 0 20px ${({ theme }) => theme.colors.electricBlue}60;
  }
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography['3xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing[8]} auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.lg};
  }
`;

const StatsGrid = styled(Grid)`
  margin-top: ${({ theme }) => theme.spacing[8]};
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography['3xl']};
  font-weight: ${({ theme }) => theme.typography.bold};
  color: ${({ theme }) => theme.colors.electricBlue};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ModesSection = styled.section`
  padding: 4rem 0;
  
  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography['3xl']};
  font-weight: ${({ theme }) => theme.typography.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const SectionSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

export function Dashboard() {
  const navigate = useNavigate();
  const { state: userState } = useUser();
  const { statistics } = userState.profile;
  
  const handleExamMode = () => {
    navigate('/quiz/examen-blanc');
  };
  
  const handleCarRecognition = () => {
    navigate('/quiz/car-recognition');
  };
  
  const handleStatistics = () => {
    navigate('/statistics');
  };
  
  const avgScore = statistics.averageScore || 0;
  
  return (
    <>
      <HeroSection>
        <Container>
          <HeroTitle>
            <span className="highlight">Code de la Route</span> Pro
          </HeroTitle>
          
          <HeroSubtitle>
            Préparez-vous efficacement à l'examen du permis de conduire avec notre simulateur 
            d'examen blanc et nos quiz interactifs.
          </HeroSubtitle>
          
          {statistics.totalAttempts > 0 && (
            <ProgressGauge
              current={Math.round(avgScore)}
              total={40}
              variant="circular"
              size={150}
              label="Score moyen"
            />
          )}
          
          <StatsGrid columns={4}>
            <StatCard>
              <StatValue>{statistics.totalAttempts}</StatValue>
              <StatLabel>Tentatives</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{statistics.bestScore}/40</StatValue>
              <StatLabel>Meilleur Score</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{statistics.currentStreak}</StatValue>
              <StatLabel>Série Actuelle</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{avgScore.toFixed(1)}</StatValue>
              <StatLabel>Moyenne</StatLabel>
            </StatCard>
          </StatsGrid>
        </Container>
      </HeroSection>
      
      <ModesSection>
        <Container>
          <SectionTitle>Modes d'Entraînement</SectionTitle>
          <SectionSubtitle>
            Choisissez votre mode d'entraînement pour progresser efficacement
          </SectionSubtitle>
          
          <Grid columns={2}>
            <CategoryCard
              title="Examen Blanc"
              description="40 questions chronométrées selon la répartition officielle ETG. Conditions réelles d'examen."
              icon={<BookOpen />}
              onClick={handleExamMode}
            />
            
            <CategoryCard
              title="Reconnaissance de Marques"
              description="Quiz de reconnaissance des logos automobiles pour tester vos connaissances."
              icon={<Truck />}
              onClick={handleCarRecognition}
            />
          </Grid>
          
          <Grid columns={2} style={{ marginTop: '2rem' }}>
            <CategoryCard
              title="Statistiques"
              description="Analysez vos performances et suivez votre progression dans le temps."
              icon={<BarChart />}
              onClick={handleStatistics}
            />
            
            <CategoryCard
              title="Historique"
              description="Consultez vos anciens examens et révisez vos erreurs."
              icon={<Award />}
              onClick={() => navigate('/history')}
              disabled={statistics.totalAttempts === 0}
            />
          </Grid>
        </Container>
      </ModesSection>
    </>
  );
}