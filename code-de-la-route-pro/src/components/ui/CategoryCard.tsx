import React from 'react';
import styled from 'styled-components';
import { CategoryCardProps } from '../../types';

const CardContainer = styled.div<{ backgroundColor?: string }>`
  ${({ theme }) => theme.effects.glassMorphism}
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ backgroundColor, theme }) => 
    backgroundColor || theme.colors.glassBackground};
  
  &:hover {
    transform: translateY(-4px);
    ${({ theme }) => theme.effects.electricGlow}
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  
  svg {
    width: 48px;
    height: 48px;
    color: ${({ theme }) => theme.colors.electricBlue};
  }
  
  @media (max-width: 768px) {
    svg {
      width: 40px;
      height: 40px;
    }
  }
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.xl};
  font-weight: ${({ theme }) => theme.typography.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  text-align: center;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  line-height: 1.5;
`;

export function CategoryCard({ 
  title, 
  description, 
  icon, 
  onClick, 
  disabled = false,
  backgroundColor 
}: CategoryCardProps) {
  return (
    <CardContainer 
      onClick={disabled ? undefined : onClick}
      style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      backgroundColor={backgroundColor}
    >
      <IconContainer>
        {icon}
      </IconContainer>
      
      <Title>{title}</Title>
      
      <Description>{description}</Description>
    </CardContainer>
  );
}