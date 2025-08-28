'use client';
import { useEffect, useState, useRef } from 'react';

export default function AudioManager() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Check localStorage for audio preferences
    const saved = localStorage.getItem('quizAudioMuted');
    if (saved !== null) {
      setIsMuted(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set lower volume
      audioRef.current.loop = true;
      
      if (!isMuted && !isPlaying) {
        // Try to play audio (browsers may prevent autoplay)
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log('Autoplay prevented:', err);
        });
      } else if (isMuted && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isMuted, isPlaying]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('quizAudioMuted', JSON.stringify(newMuted));
    
    if (audioRef.current) {
      if (newMuted) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log('Play failed:', err);
        });
      }
    }
  };

  return (
    <>
      {/* Audio element - will need actual audio file */}
      <audio 
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        {/* Placeholder - would need actual audio file */}
        {/* <source src="/quiz-background-music.mp3" type="audio/mpeg" /> */}
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvW4iAzWM0ffKeFQODT+l4XC4tGN0m7mSLFVfTjTcqXMOAzOqKz1jVAAA" />
      </audio>

      {/* Audio control overlay button */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center shadow-lg"
        title={isMuted ? 'Unmute background music' : 'Mute background music'}
      >
        {isMuted ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>
    </>
  );
}