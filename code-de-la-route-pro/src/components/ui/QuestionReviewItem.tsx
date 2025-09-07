import React, { useState } from 'react';
import styled from 'styled-components';
import { Check, X, ChevronDown, ChevronUp } from 'react-feather';
import { QuestionReviewItemProps } from '../../types';
import { THEME_LABELS } from '../../types';

const ReviewItemContainer = styled.div`
  ${({ theme }) => theme.effects.glassMorphism}
  border-radius: 12px;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  overflow: hidden;
`;

const ItemHeader = styled.div<{ isCorrect: boolean }>`
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ isCorrect, theme }) => 
    isCorrect 
      ? `${theme.colors.success}20` 
      : `${theme.colors.error}20`};
  border-left: 4px solid ${({ isCorrect, theme }) => 
    isCorrect ? theme.colors.success : theme.colors.error};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ isCorrect, theme }) => 
      isCorrect 
        ? `${theme.colors.success}30` 
        : `${theme.colors.error}30`};
  }
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const StatusIcon = styled.div<{ isCorrect: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  color: ${({ isCorrect, theme }) => 
    isCorrect ? theme.colors.success : theme.colors.error};
  font-weight: ${({ theme }) => theme.typography.medium};
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ThemeTag = styled.span`
  background: ${({ theme }) => theme.colors.electricBlue}20;
  color: ${({ theme }) => theme.colors.electricBlue};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: 16px;
  font-size: ${({ theme }) => theme.typography.xs};
  font-weight: ${({ theme }) => theme.typography.medium};
`;

const QuestionText = styled.div`
  font-size: ${({ theme }) => theme.typography.base};
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.5;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sm};
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.electricBlue};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DetailsSection = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.glassBorder};
`;

const AnswersSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const SectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.sm};
  font-weight: ${({ theme }) => theme.typography.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const AnswerItem = styled.div<{ isCorrect?: boolean; isUserAnswer?: boolean }>`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.typography.sm};
  
  ${({ isCorrect, isUserAnswer, theme }) => {
    if (isCorrect) {
      return `
        background: ${theme.colors.success}20;
        border: 1px solid ${theme.colors.success};
        color: ${theme.colors.success};
      `;
    }
    if (isUserAnswer) {
      return `
        background: ${theme.colors.error}20;
        border: 1px solid ${theme.colors.error};
        color: ${theme.colors.error};
      `;
    }
    return `
      background: ${theme.colors.backgroundLight};
      color: ${theme.colors.textSecondary};
    `;
  }}
`;

const ExplanationSection = styled.div`
  background: ${({ theme }) => theme.colors.backgroundLight};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: 8px;
  border-left: 3px solid ${({ theme }) => theme.colors.electricBlue};
`;

const ExplanationText = styled.p`
  font-size: ${({ theme }) => theme.typography.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

export function QuestionReviewItem({
  question,
  userAnswers,
  isCorrect,
  showExplanation = true
}: QuestionReviewItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const themeLabel = THEME_LABELS[question.theme] || question.theme;
  
  return (
    <ReviewItemContainer>
      <ItemHeader 
        isCorrect={isCorrect}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <HeaderTop>
          <StatusIcon isCorrect={isCorrect}>
            {isCorrect ? <Check /> : <X />}
            <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
          </StatusIcon>
          
          <ThemeTag>{themeLabel}</ThemeTag>
        </HeaderTop>
        
        <QuestionText>{question.question}</QuestionText>
        
        <ToggleButton>
          {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </ToggleButton>
      </ItemHeader>
      
      {isExpanded && (
        <DetailsSection>
          <AnswersSection>
            <SectionTitle>Réponses</SectionTitle>
            
            {question.options.map((option, index) => {
              const isCorrectOption = question.correctAnswers.includes(option);
              const isUserAnswerOption = userAnswers.includes(option);
              
              return (
                <AnswerItem
                  key={index}
                  isCorrect={isCorrectOption}
                  isUserAnswer={isUserAnswerOption && !isCorrectOption}
                >
                  {option}
                  {isCorrectOption && ' ✓'}
                  {isUserAnswerOption && !isCorrectOption && ' (Votre réponse)'}
                </AnswerItem>
              );
            })}
          </AnswersSection>
          
          {showExplanation && question.explanation && (
            <ExplanationSection>
              <SectionTitle>Explication</SectionTitle>
              <ExplanationText>{question.explanation}</ExplanationText>
            </ExplanationSection>
          )}
        </DetailsSection>
      )}
    </ReviewItemContainer>
  );
}