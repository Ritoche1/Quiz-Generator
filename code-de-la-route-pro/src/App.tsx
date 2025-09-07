import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { QuizProvider } from './context/QuizContext';
import { UserProvider } from './context/UserContext';
import { Router } from './components/layout/Router';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <UserProvider>
        <QuizProvider>
          <Router />
        </QuizProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
