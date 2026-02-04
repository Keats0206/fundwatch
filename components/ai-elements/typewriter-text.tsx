"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per chunk (default: 8ms for very fast)
  delay?: number; // ms delay before starting
  className?: string;
  onComplete?: () => void;
  skipAnimation?: boolean; // Skip animation entirely
  skipThreshold?: number; // Character count threshold to skip animation (default: 500)
  chunkSize?: number; // Number of characters per chunk (default: 3-5 based on text length)
}

export function TypewriterText({
  text,
  speed = 8,
  delay = 0,
  className,
  onComplete,
  skipAnimation = false,
  skipThreshold = 500,
  chunkSize,
}: TypewriterTextProps) {
  const [displayedChunks, setDisplayedChunks] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  
  // Update ref when callback changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Skip animation if text is too long or skipAnimation is true
    if (skipAnimation || text.length > skipThreshold) {
      setDisplayedChunks([text]);
      setIsComplete(true);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
      return;
    }

    // Reset state when text changes
    setDisplayedChunks([]);
    setIsComplete(false);

    // Calculate chunk size based on text length (smaller chunks for shorter text, larger for longer)
    const calculatedChunkSize = chunkSize || (text.length < 50 ? 2 : text.length < 150 ? 3 : 5);
    
    // Split text into chunks, preserving words when possible
    const chunks: string[] = [];
    let currentChunk = "";
    const words = text.split(/(\s+)/); // Split by whitespace but keep it
    
    for (const word of words) {
      if ((currentChunk + word).length <= calculatedChunkSize) {
        currentChunk += word;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        // If word itself is longer than chunk size, split it
        if (word.length > calculatedChunkSize) {
          for (let i = 0; i < word.length; i += calculatedChunkSize) {
            chunks.push(word.slice(i, i + calculatedChunkSize));
          }
        } else {
          currentChunk = word;
        }
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }

    // Start revealing chunks after delay
    const startTimeout = setTimeout(() => {
      let currentIndex = 0;

      const revealNextChunk = () => {
        if (currentIndex < chunks.length) {
          setDisplayedChunks(chunks.slice(0, currentIndex + 1));
          currentIndex++;
          timeoutRef.current = setTimeout(revealNextChunk, speed);
        } else {
          setIsComplete(true);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
        }
      };

      revealNextChunk();
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, delay, skipAnimation, skipThreshold, chunkSize]);

  // Render chunks with fade-in animation
  return (
    <span className={cn("inline-block", className)}>
      {displayedChunks.map((chunk, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.15,
            ease: "easeOut"
          }}
          className="inline"
        >
          {chunk}
        </motion.span>
      ))}
    </span>
  );
}
