import React from 'react';
import styled from 'styled-components';

const ButtonBase = styled.button`
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-weight: ${({ theme }) => theme.typography.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  text-decoration: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.electricBlue};
    outline-offset: 2px;
  }
`;

export const PrimaryButton = styled(ButtonBase)`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.electricBlue}, 
    ${({ theme }) => theme.colors.electricBlueLight}
  );
  color: ${({ theme }) => theme.colors.backgroundDark};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.typography.base};
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.electricBlue}40;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.colors.electricBlue}60;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const SecondaryButton = styled(ButtonBase)`
  ${({ theme }) => theme.effects.glassMorphism}
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.typography.base};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    ${({ theme }) => theme.effects.electricGlow}
  }
`;

export const IconButton = styled(ButtonBase)`
  ${({ theme }) => theme.effects.glassMorphism}
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: 8px;
  
  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.electricBlue};
    ${({ theme }) => theme.effects.electricGlow}
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const DangerButton = styled(ButtonBase)`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.error}, 
    #ff6666
  );
  color: white;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.typography.base};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.colors.error}60;
  }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'icon' | 'danger';
  as?: React.ElementType;
  to?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  ...props 
}: ButtonProps) {
  const ButtonComponent = {
    primary: PrimaryButton,
    secondary: SecondaryButton,
    icon: IconButton,
    danger: DangerButton,
  }[variant];
  
  return (
    <ButtonComponent {...props}>
      {children}
    </ButtonComponent>
  );
}