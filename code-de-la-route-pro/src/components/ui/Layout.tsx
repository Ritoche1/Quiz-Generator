import styled from 'styled-components';

const ContainerBase = styled.div`
  ${({ theme }) => theme.effects.glassMorphism}
  border-radius: 16px;
  overflow: hidden;
`;

export const Card = styled(ContainerBase)`
  padding: ${({ theme }) => theme.spacing[6]};
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

export const CardHeader = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.glassBorder};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography['2xl']};
  font-weight: ${({ theme }) => theme.typography.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

export const CardDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: ${({ theme }) => theme.spacing[2]} 0 0 0;
  line-height: 1.5;
`;

export const CardContent = styled.div`
  /* Content styling handled by children */
`;

export const CardFooter = styled.div`
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.glassBorder};
  margin-top: ${({ theme }) => theme.spacing[4]};
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    > * {
      width: 100%;
    }
  }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[4]};
  
  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing[3]};
  }
`;

export const Section = styled.section`
  padding: ${({ theme }) => theme.spacing[8]} 0;
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing[6]} 0;
  }
`;

export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 2 }) => columns}, 1fr);
  gap: ${({ gap, theme }) => gap || theme.spacing[6]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing[4]};
  }
`;

export const Flex = styled.div<{
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};
  align-items: ${({ align = 'flex-start' }) => align};
  justify-content: ${({ justify = 'flex-start' }) => justify};
  gap: ${({ gap, theme }) => gap || theme.spacing[3]};
  flex-wrap: ${({ wrap = false }) => wrap ? 'wrap' : 'nowrap'};
`;

export const Spacer = styled.div<{ size?: string }>`
  height: ${({ size, theme }) => size || theme.spacing[4]};
  width: 100%;
`;

export const VisuallyHidden = styled.span`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;