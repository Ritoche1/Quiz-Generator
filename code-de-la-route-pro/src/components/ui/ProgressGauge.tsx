import React from 'react';
import styled from 'styled-components';
import { ProgressGaugeProps } from '../../types';

const GaugeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const LinearProgress = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: 4px;
  overflow: hidden;
  ${({ theme }) => theme.effects.insetShadow}
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.electricBlue},
    ${({ theme }) => theme.colors.electricBlueLight}
  );
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.electricBlue}40;
`;

const CircularGauge = styled.div<{ size: number }>`
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.backgroundLight};
  ${({ theme }) => theme.effects.insetShadow}
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CircularProgress = styled.svg<{ size: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  transform: rotate(-90deg);
`;

const CircularTrack = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.colors.backgroundMedium};
  stroke-width: 8;
`;

const CircularFill = styled.circle<{ progress: number; circumference: number }>`
  fill: none;
  stroke: ${({ theme }) => theme.colors.electricBlue};
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: ${({ circumference }) => circumference};
  stroke-dashoffset: ${({ progress, circumference }) => 
    circumference - (progress / 100) * circumference};
  transition: stroke-dashoffset 0.5s ease;
  filter: drop-shadow(0 0 6px ${({ theme }) => theme.colors.electricBlue}60);
`;

const ProgressText = styled.div`
  text-align: center;
`;

const PercentageText = styled.div`
  font-size: ${({ theme }) => theme.typography['2xl']};
  font-weight: ${({ theme }) => theme.typography.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1;
`;

const LabelText = styled.div`
  font-size: ${({ theme }) => theme.typography.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: ${({ theme }) => theme.typography.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface Props extends ProgressGaugeProps {
  size?: number;
  showLabel?: boolean;
  label?: string;
}

export function ProgressGauge({ 
  current, 
  total, 
  variant = "linear",
  size = 120,
  showLabel = true,
  label = "Progression"
}: Props) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  if (variant === "circular") {
    const radius = (size - 16) / 2; // Account for stroke width
    const circumference = 2 * Math.PI * radius;
    
    return (
      <GaugeContainer>
        <CircularGauge size={size}>
          <CircularProgress size={size}>
            <CircularTrack
              cx={size / 2}
              cy={size / 2}
              r={radius}
            />
            <CircularFill
              cx={size / 2}
              cy={size / 2}
              r={radius}
              progress={percentage}
              circumference={circumference}
            />
          </CircularProgress>
          
          <ProgressText>
            <PercentageText>{percentage}%</PercentageText>
            {showLabel && <LabelText>{label}</LabelText>}
          </ProgressText>
        </CircularGauge>
      </GaugeContainer>
    );
  }
  
  return (
    <GaugeContainer>
      <LinearProgress>
        <ProgressFill percentage={percentage} />
      </LinearProgress>
      
      {showLabel && (
        <ProgressLabel>
          <span>{label}</span>
          <span>{current} / {total}</span>
        </ProgressLabel>
      )}
    </GaugeContainer>
  );
}