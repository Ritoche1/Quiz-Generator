import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { TimerProps } from '../../types';
import { useTimer } from '../../hooks/useTimer';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CircularTimer = styled.div<{ progress: number; isLow: boolean }>`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.backgroundLight};
  ${({ theme }) => theme.effects.insetShadow}
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${({ isLow }) => isLow ? pulse : 'none'} 1s infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: conic-gradient(
      ${({ theme }) => theme.colors.electricBlue} 0deg,
      ${({ theme }) => theme.colors.electricBlue} ${({ progress }) => progress * 3.6}deg,
      transparent ${({ progress }) => progress * 3.6}deg,
      transparent 360deg
    );
    z-index: -1;
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const TimeDisplay = styled.div<{ isLow: boolean }>`
  font-size: ${({ theme }) => theme.typography.lg};
  font-weight: ${({ theme }) => theme.typography.bold};
  color: ${({ isLow, theme }) => 
    isLow ? theme.colors.error : theme.colors.textPrimary};
  font-variant-numeric: tabular-nums;
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.base};
  }
`;

const TimerLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export function Timer({ initialTime, onTimeUp, isRunning }: TimerProps) {
  const { timeRemaining, start, stop, reset } = useTimer(initialTime, onTimeUp);
  
  useEffect(() => {
    if (isRunning) {
      start();
    } else {
      stop();
    }
  }, [isRunning, start, stop]);
  
  useEffect(() => {
    reset();
  }, [initialTime, reset]);
  
  const progress = (timeRemaining / initialTime) * 100;
  const isLow = timeRemaining <= 5;
  
  return (
    <TimerContainer>
      <CircularTimer progress={progress} isLow={isLow}>
        <TimeDisplay isLow={isLow}>
          {timeRemaining}
        </TimeDisplay>
      </CircularTimer>
      
      <TimerLabel>
        Temps restant
      </TimerLabel>
    </TimerContainer>
  );
}