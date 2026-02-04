"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Props = {
  text: string;
  speed?: number; // milliseconds per character
  delay?: number;
  className?: string;
  onComplete?: () => void;
};

export function TypingText({ text, speed = 20, delay = 0, className, onComplete }: Props) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (text.length === 0) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const startDelay = setTimeout(() => {
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeoutId = setTimeout(typeNextChar, speed);
        } else {
          setIsComplete(true);
          onComplete?.();
        }
      };
      typeNextChar();
    }, delay);

    return () => {
      clearTimeout(startDelay);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-[1em] bg-foreground ml-0.5 align-middle"
        />
      )}
    </span>
  );
}
