import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
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
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 1rem;
    font-weight: 400;
    color: #FFFFFF;
    background: #0A0A0B;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100%;
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
    margin: 0;
  }

  h1 {
    font-size: 2.25rem;
  }

  h2 {
    font-size: 1.875rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  h4 {
    font-size: 1.25rem;
  }

  h5 {
    font-size: 1.125rem;
  }

  h6 {
    font-size: 1rem;
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
    color: #00D4FF;
    text-decoration: none;
    
    &:hover {
      color: #33DDFF;
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
    background: #1A1A1B;
  }

  ::-webkit-scrollbar-thumb {
    background: #00D4FF;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #33DDFF;
  }

  /* Selection */
  ::selection {
    background: #00D4FF;
    color: #0A0A0B;
  }

  /* Focus styles for accessibility */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  a:focus-visible {
    outline: 2px solid #00D4FF;
    outline-offset: 2px;
  }
`