import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from '../../pages/Dashboard';
import { Quiz } from '../../pages/Quiz';
import { Results } from '../../pages/Results';
// import { Statistics } from '../../pages/Statistics';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/quiz/:mode" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        {/* <Route path="/statistics" element={<Statistics />} /> */}
        {/* <Route path="/history" element={<History />} /> */}
        
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}