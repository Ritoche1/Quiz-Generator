'use client';

import { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function QuizRecap({ quiz, selectedAnswers, onRestart }) {
  const didMountRef = useRef(false);
  const [showingReport, setShowingReport] = useState(false);
  const [generateStatus, setGenerateStatus] = useState('');

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) {
        score++;
      }
    });
    return score;
  };

  const getScorePercentage = () => {
    return Math.round((calculateScore() / quiz.questions.length) * 100);
  };

  const getPerformanceColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return '🎉 Excellent! Outstanding performance!';
    if (percentage >= 80) return '👏 Great job! Well done!';
    if (percentage >= 60) return '👍 Good work! Keep it up!';
    if (percentage >= 40) return '💪 Not bad! Room for improvement!';
    return '📚 Keep studying! You can do better!';
  };

  const submitQuizAttempt = async () => {
    try {
      const response = await fetch(`${baseUrl}/quizzes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || null,
        },
        body: JSON.stringify({
          title : quiz.title,
          description : "Quiz about " + quiz.title + " with " + quiz.questions.length + " questions in "  + quiz.difficulty + " difficulty in " + quiz.language + " language",
          language : quiz.language,
          questions : quiz.questions,
          difficulty : quiz.difficulty,
        })
      });
      
      if (!response.ok) throw new Error('Failed to save attempt');
      const data = await response.json();
      submitUserScore(data.id);
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
    }
  };

  const submitUserScore = async (quiz_id, isUpdate = false) => {
    let response = { ok: false };
    let method = 'POST';

    // fetch GET /quizzes/:id to get the quiz details if it's an update
    if (isUpdate) {
      response = await fetch(`${baseUrl}/scores/${quiz_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || null,
        }
      });
      const data = await response.json();
      if (response.ok && response.status === 200 && data.quiz_id === quiz.id) {
        method = 'PUT';
      } else {
        submitQuizAttempt();
        return;
      }
    }

    try {
      const body = JSON.stringify({
        score : calculateScore(),
        max_score : quiz.questions.length,
        answers : selectedAnswers,
      });

      response = await fetch(`${baseUrl}/scores/${quiz_id}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || null,
        },
        body: body
      });

      if (!response.ok) throw new Error('Failed to save score');
    }
    catch (error) {
      console.error('Error submitting user score:', error);
    }
  }

  const generateQuizReport = async () => {
    setGenerateStatus('generating');
    try {
      // Create PDF using jsPDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 8;
      let yPosition = 30;

      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(quiz.title, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Quiz Report Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      
      // Score Circle (simulate with text)
      yPosition += 20;
      pdf.setFontSize(36);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${getScorePercentage()}%`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.text(`Score: ${calculateScore()}/${quiz.questions.length}`, pageWidth / 2, yPosition, { align: 'center' });

      // Performance Summary
      yPosition += 20;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Performance Summary', margin, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Language: ${quiz.language}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Difficulty: ${quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Total Questions: ${quiz.questions.length}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Correct Answers: ${calculateScore()}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Accuracy: ${getScorePercentage()}%`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Performance: ${getPerformanceMessage()}`, margin, yPosition);

      // Question Review
      yPosition += 20;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Question Review', margin, yPosition);
      
      quiz.questions.forEach((question, index) => {
        const isCorrect = selectedAnswers[index] === question.answer;
        
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 30;
        }
        
        yPosition += 15;
        
        // Question number and status
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Question ${index + 1}: ${isCorrect ? '✓' : '✗'}`, margin, yPosition);
        
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        // Question text (wrap if too long)
        const questionLines = pdf.splitTextToSize(question.question, pageWidth - 2 * margin);
        pdf.text(questionLines, margin, yPosition);
        yPosition += questionLines.length * lineHeight;
        
        // Your answer
        yPosition += 5;
        pdf.setTextColor(isCorrect ? 0 : 220, isCorrect ? 150 : 0, isCorrect ? 0 : 0);
        pdf.text(`Your answer: ${selectedAnswers[index] || 'No answer'}`, margin + 10, yPosition);
        
        yPosition += lineHeight;
        pdf.setTextColor(0, 150, 0);
        pdf.text(`Correct answer: ${question.answer}`, margin + 10, yPosition);
        
        yPosition += lineHeight;
        pdf.setTextColor(0, 0, 0);
        
        // Options
        yPosition += 5;
        pdf.setFontSize(9);
        const optionsText = `Options: ${question.options.join(', ')}`;
        const optionLines = pdf.splitTextToSize(optionsText, pageWidth - 2 * margin - 10);
        pdf.text(optionLines, margin + 10, yPosition);
        yPosition += optionLines.length * 6;
      });

      // Footer
      yPosition = pageHeight - 30;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by Quiz Generator - AI-Powered Learning Platform', pageWidth / 2, yPosition, { align: 'center' });
      pdf.text('Keep practicing to improve your knowledge!', pageWidth / 2, yPosition + 8, { align: 'center' });

      // Save the PDF
      pdf.save(`${quiz.title.replace(/[^a-z0-9]/gi, '_')}_report.pdf`);
      
      setGenerateStatus('success');
      setTimeout(() => setGenerateStatus(''), 3000);
    } catch (error) {
      setGenerateStatus('error');
      setTimeout(() => setGenerateStatus(''), 3000);
      console.error('Error generating PDF report:', error);
    }
  };

  const generateEmptyQuiz = async () => {
    setGenerateStatus('generating-empty');
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      let yPosition = 30;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(quiz.title, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Difficulty: ${quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)} | Language: ${quiz.language}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      pdf.text(`Total Questions: ${quiz.questions.length}`, pageWidth / 2, yPosition, { align: 'center' });

      // Instructions
      yPosition += 20;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Instructions:', margin, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const instructions = [
        '• Answer all questions by selecting the best option',
        '• Fill in the circle next to your chosen answer',
        '• Use pencil so you can erase and correct mistakes',
        '• Check your answers on the last page when complete'
      ];
      
      instructions.forEach(instruction => {
        pdf.text(instruction, margin, yPosition);
        yPosition += lineHeight;
      });

      // Name and Date fields
      yPosition += 10;
      pdf.text('Name: ________________________________   Date: ______________', margin, yPosition);
      yPosition += 20;

      // Questions
      quiz.questions.forEach((question, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 30;
        }

        // Question number and text
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Question ${index + 1}:`, margin, yPosition);
        
        yPosition += 8;
        pdf.setFont('helvetica', 'normal');
        const questionLines = pdf.splitTextToSize(question.question, pageWidth - 2 * margin);
        pdf.text(questionLines, margin, yPosition);
        yPosition += questionLines.length * lineHeight + 5;

        // Options with circles
        question.options.forEach((option, optIndex) => {
          // Draw circle
          pdf.circle(margin + 5, yPosition - 2, 2, 'D');
          
          // Option text
          pdf.text(`${String.fromCharCode(65 + optIndex)}. ${option}`, margin + 12, yPosition);
          yPosition += lineHeight + 2;
        });

        yPosition += 8; // Space between questions
      });

      // Answer Key on new page
      pdf.addPage();
      yPosition = 30;
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Answer Key', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.text('For Teacher/Self-Check Use Only', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      pdf.setFont('helvetica', 'normal');

      // Answer grid
      const answersPerRow = 3;
      let currentRow = 0;
      let currentCol = 0;
      
      quiz.questions.forEach((question, index) => {
        const correctIndex = question.options.indexOf(question.answer);
        const answerText = `Q${index + 1}: ${String.fromCharCode(65 + correctIndex)} - ${question.answer}`;
        
        const xPos = margin + (currentCol * (pageWidth - 2 * margin) / answersPerRow);
        
        // Draw box
        pdf.rect(xPos, yPosition - 8, (pageWidth - 2 * margin) / answersPerRow - 5, 12, 'D');
        
        // Add text
        pdf.setFontSize(8);
        const textLines = pdf.splitTextToSize(answerText, (pageWidth - 2 * margin) / answersPerRow - 10);
        pdf.text(textLines, xPos + 2, yPosition - 4);
        
        currentCol++;
        if (currentCol >= answersPerRow) {
          currentCol = 0;
          yPosition += 20;
        }
      });

      // Scoring guide
      yPosition += 30;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Scoring Guide:', margin, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const scoringGuide = [
        '• 90-100%: Excellent (A)',
        '• 80-89%: Good (B)', 
        '• 70-79%: Satisfactory (C)',
        '• 60-69%: Needs Improvement (D)',
        '• Below 60%: Additional Study Required (F)'
      ];
      
      scoringGuide.forEach(guide => {
        pdf.text(guide, margin, yPosition);
        yPosition += lineHeight;
      });

      // Footer
      yPosition = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by Quiz Generator - Educational Tools Platform', pageWidth / 2, yPosition, { align: 'center' });

      // Save the PDF
      pdf.save(`${quiz.title.replace(/[^a-z0-9]/gi, '_')}_worksheet.pdf`);
      
      setGenerateStatus('success');
      setTimeout(() => setGenerateStatus(''), 3000);
    } catch (error) {
      setGenerateStatus('error');
      setTimeout(() => setGenerateStatus(''), 3000);
      console.error('Error generating empty quiz PDF:', error);
    }
  };

  const generateReportContent = () => {
    const score = calculateScore();
    const percentage = getScorePercentage();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz Report - ${quiz.title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #f0f0f0; padding-bottom: 30px; }
        .score-circle { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; color: white; background: linear-gradient(135deg, #4ade80, #22c55e); }
        .score-details { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .question-review { margin: 20px 0; padding: 20px; border-radius: 12px; border-left: 4px solid #e5e7eb; }
        .correct { border-left-color: #22c55e; background: #f0fdf4; }
        .incorrect { border-left-color: #ef4444; background: #fef2f2; }
        .question-title { font-weight: bold; margin-bottom: 10px; color: #1f2937; }
        .answer { margin: 5px 0; }
        .correct-answer { color: #22c55e; font-weight: 600; }
        .incorrect-answer { color: #ef4444; font-weight: 600; }
        .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${quiz.title}</h1>
            <p>Quiz Report Generated on ${new Date().toLocaleDateString()}</p>
            <div class="score-circle">${percentage}%</div>
            <h2>Score: ${score}/${quiz.questions.length}</h2>
        </div>
        
        <div class="score-details">
            <h3>Performance Summary</h3>
            <p><strong>Language:</strong> ${quiz.language}</p>
            <p><strong>Difficulty:</strong> ${quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}</p>
            <p><strong>Total Questions:</strong> ${quiz.questions.length}</p>
            <p><strong>Correct Answers:</strong> ${score}</p>
            <p><strong>Accuracy:</strong> ${percentage}%</p>
            <p><strong>Performance:</strong> ${getPerformanceMessage()}</p>
        </div>

        <h3>Question Review</h3>
        ${quiz.questions.map((question, index) => {
          const isCorrect = selectedAnswers[index] === question.answer;
          return `
            <div class="question-review ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="question-title">Question ${index + 1}: ${question.question}</div>
                <div class="answer">Your answer: <span class="${isCorrect ? 'correct-answer' : 'incorrect-answer'}">${selectedAnswers[index] || 'No answer'}</span></div>
                <div class="answer">Correct answer: <span class="correct-answer">${question.answer}</span></div>
                <div style="margin-top: 10px;">
                    <strong>Options:</strong> ${question.options.join(', ')}
                </div>
            </div>
          `;
        }).join('')}

        <div class="footer">
            <p>Generated by Quiz Generator - AI-Powered Learning Platform</p>
            <p>Keep practicing to improve your knowledge!</p>
        </div>
    </div>
</body>
</html>`;
  };

  const generateEmptyQuizContent = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${quiz.title} - Worksheet</title>
    <style>
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 40px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .question { margin: 30px 0; page-break-inside: avoid; }
        .question-number { font-weight: bold; margin-bottom: 10px; }
        .options { margin: 15px 0; }
        .option { margin: 8px 0; display: flex; align-items: center; }
        .option-box { width: 15px; height: 15px; border: 2px solid #000; margin-right: 10px; display: inline-block; }
        .answer-space { margin-top: 20px; border-bottom: 1px solid #ccc; min-height: 25px; }
        .instructions { background: #f5f5f5; padding: 20px; margin-bottom: 30px; border-radius: 5px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        .answers-page { page-break-before: always; margin-top: 50px; }
        @media print { body { margin: 20px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${quiz.title}</h1>
            <p>Difficulty: ${quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)} | Language: ${quiz.language}</p>
            <p>Total Questions: ${quiz.questions.length}</p>
        </div>

        <div class="instructions">
            <h3>Instructions:</h3>
            <ul>
                <li>Answer all questions by selecting the best option</li>
                <li>Fill in the box next to your chosen answer</li>
                <li>Use pencil so you can erase and correct mistakes</li>
                <li>Check your answers on the last page when complete</li>
            </ul>
            <p><strong>Name:</strong> _________________________ <strong>Date:</strong> _____________</p>
        </div>

        ${quiz.questions.map((question, index) => `
            <div class="question">
                <div class="question-number">Question ${index + 1}:</div>
                <div style="margin-bottom: 15px; font-weight: 500;">${question.question}</div>
                <div class="options">
                    ${question.options.map((option, optIndex) => `
                        <div class="option">
                            <span class="option-box"></span>
                            <span>${String.fromCharCode(65 + optIndex)}. ${option}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}

        <div class="answers-page">
            <div class="header">
                <h2>Answer Key</h2>
                <p><em>For Teacher/Self-Check Use Only</em></p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                ${quiz.questions.map((question, index) => {
                  const correctIndex = question.options.indexOf(question.answer);
                  return `
                    <div style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                        <strong>Q${index + 1}:</strong> ${String.fromCharCode(65 + correctIndex)} - ${question.answer}
                    </div>
                  `;
                }).join('')}
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 5px;">
                <h3>Scoring Guide:</h3>
                <p>• 90-100%: Excellent (A)</p>
                <p>• 80-89%: Good (B)</p>
                <p>• 70-79%: Satisfactory (C)</p>
                <p>• 60-69%: Needs Improvement (D)</p>
                <p>• Below 60%: Additional Study Required (F)</p>
            </div>
        </div>

        <div class="footer">
            <p>Generated by Quiz Generator - Educational Tools Platform</p>
        </div>
    </div>
</body>
</html>`;
  };

  const downloadReport = (content, filename) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;

    if (quiz.difficulty === "redo") {
      submitUserScore(quiz.id, true);
      return;
    }

    if (quiz.questions.length > 0) {
      submitQuizAttempt();
    }
  }, []);

  if (showingReport) {
    return (
      <div className="w-full max-w-4xl glass-card p-8 rounded-2xl" role="region" aria-labelledby="detailed-report-heading">
        <div className="text-center mb-8">
          <h2 id="detailed-report-heading" className="text-3xl font-extrabold text-gray-900 mb-4">📊 Detailed Report</h2>
          <button
            onClick={() => setShowingReport(false)}
            className="btn-secondary mb-6 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Back to summary"
          >
            ← Back to Summary
          </button>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const isCorrect = selectedAnswers[index] === question.answer;
            return (
              <div
                key={index}
                className={`p-6 rounded-xl border-l-4 ${
                  isCorrect 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}
                role="group"
                aria-labelledby={`question-${index}-title`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 id={`question-${index}-title`} className="text-lg font-semibold text-gray-900">
                    Question {index + 1}
                  </h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`} aria-hidden="true">
                    {isCorrect ? '✓' : '✗'}
                  </div>
                </div>
                
                <p className="text-gray-800 mb-4 font-medium">{question.question}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">Your answer:</span>
                    <span className={`font-semibold ${
                      isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {selectedAnswers[index] || 'No answer provided'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">Correct answer:</span>
                    <span className="font-semibold text-green-700">
                      {question.answer}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl glass-card p-8 rounded-2xl" role="region" aria-labelledby="recap-heading">
      {/* Status Messages */}
      {generateStatus && (
        <div role="status" aria-live="polite" aria-atomic="true" className={`p-4 rounded-lg mb-6 ${
          generateStatus.includes('success') ? 'bg-green-100 text-green-800' :
          generateStatus.includes('error') ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {generateStatus === 'generating' && '📄 Generating PDF report...'}
          {generateStatus === 'generating-empty' && '📝 Generating PDF worksheet...'}
          {generateStatus === 'success' && '✅ PDF downloaded successfully!'}
          {generateStatus === 'error' && '❌ Error generating PDF. Please try again.'}
        </div>
      )}

      <div className="text-center mb-8">
        <h2 id="recap-heading" className="text-3xl font-extrabold text-gray-900 mb-2">Quiz Complete!</h2>
        <div className={`inline-flex items-center justify-center rounded-full p-6 mb-4 bg-white shadow-sm`}>
          <div className={`text-6xl font-extrabold ${getPerformanceColor()}`} aria-label={`Score percentage ${getScorePercentage()} percent`}>
            <span className="sr-only">Score percentage:</span>
            {getScorePercentage()}%
          </div>
        </div>
        <p className="text-xl text-gray-800 mb-2" aria-live="polite">{getPerformanceMessage()}</p>
        <p className="text-gray-800">
          You scored <span className="font-bold text-indigo-600">{calculateScore()}</span> out of <span className="font-bold">{quiz.questions.length}</span> questions
        </p>
      </div>

      {/* Quiz Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-green-700">{calculateScore()}</div>
          <div className="text-sm text-gray-700">Correct</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-red-700">{quiz.questions.length - calculateScore()}</div>
          <div className="text-sm text-gray-700">Incorrect</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-700">{quiz.questions.length}</div>
          <div className="text-sm text-gray-700">Total</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowingReport(true)}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="View detailed report"
          >
            <span aria-hidden="true">📊</span>
            <span className="text-sm text-black">View Detailed Report</span>
          </button>
          <button
            onClick={generateQuizReport}
            disabled={generateStatus === 'generating'}
            className="flex-1 btn-primary flex items-center justify-center gap-2 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Download PDF report"
          >
            {generateStatus === 'generating' ? (
              <>
                <div className="loading-spinner" aria-hidden="true"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">📄</span>
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={generateEmptyQuiz}
            disabled={generateStatus === 'generating-empty'}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Print PDF worksheet"
          >
            {generateStatus === 'generating-empty' ? (
              <>
                <div className="loading-spinner" aria-hidden="true"></div>
                <span className="text-sm text-black">Generating...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">📝</span>
                <span className="text-sm text-black">Print PDF Worksheet</span>
              </>
            )}
          </button>
          <button
            onClick={onRestart}
            className="flex-1 btn-ghost flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Start over"
          >
            <span aria-hidden="true">🔄</span>
            <span className="text-sm text-black">Start Over</span>
          </button>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-medium">Difficulty:</span> {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
          </div>
          <div>
            <span className="font-medium">Language:</span> {quiz.language}
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-600">
            Want to try more quizzes? <a href="/browse" className="text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Browse all quizzes</a>
          </p>
        </div>
      </div>
    </div>
  );
}