import { createGlobalStyle } from 'styled-components'
import { Theme } from './theme'

export const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    height: 100%;
    font-size: 16px;
  }

  body {
    height: 100%;
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.base};
    font-weight: ${({ theme }) => theme.typography.regular};
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.backgroundDark};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100%;
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.typography.semibold};
    line-height: 1.3;
    margin: 0;
  }

  h1 {
    font-size: ${({ theme }) => theme.typography['4xl']};
  }

  h2 {
    font-size: ${({ theme }) => theme.typography['3xl']};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography['2xl']};
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.xl};
  }

  h5 {
    font-size: ${({ theme }) => theme.typography.lg};
  }

  h6 {
    font-size: ${({ theme }) => theme.typography.base};
  }

  p {
    margin: 0;
    line-height: 1.6;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    
    &:focus {
      outline: none;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    background: transparent;
    border: none;
    
    &:focus {
      outline: none;
    }
  }

  a {
    color: ${({ theme }) => theme.colors.electricBlue};
    text-decoration: none;
    
    &:hover {
      color: ${({ theme }) => theme.colors.electricBlueLight};
    }
  }

  ul, ol {
    list-style: none;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundMedium};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.electricBlue};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.electricBlueLight};
  }

  /* Selection */
  ::selection {
    background: ${({ theme }) => theme.colors.electricBlue};
    color: ${({ theme }) => theme.colors.backgroundDark};
  }

  /* Focus styles for accessibility */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.electricBlue};
    outline-offset: 2px;
  }
`