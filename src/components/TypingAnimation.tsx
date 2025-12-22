import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

const TypingAnimation = ({ text, className = '', speed = 80, delay = 0 }: TypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed, isStarted]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-[3px] h-[1em] bg-primary ml-1 animate-blink align-middle" />
      )}
    </span>
  );
};

export default TypingAnimation;
