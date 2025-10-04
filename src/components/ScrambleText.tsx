import { useEffect, useState, useRef } from "react";

interface ScrambleTextProps {
  text: string;
  scrambleDuration?: number;
  scrambleSpeed?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

export const ScrambleText = ({ 
  text, 
  scrambleDuration = 2500,
  scrambleSpeed = 40
}: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(
    text.split("").map((char) => 
      char === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]
    )
  );
  const [revealProgress, setRevealProgress] = useState<number[]>(
    text.split("").map(() => 0)
  );
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let iteration = 0;
    const totalIterations = Math.floor(scrambleDuration / scrambleSpeed);
    const charsArray = text.split("");

    intervalRef.current = setInterval(() => {
      const newProgress = charsArray.map((char, index) => {
        if (char === " ") return 1;
        const revealPoint = (index / charsArray.length) * totalIterations;
        return Math.min(1, Math.max(0, (iteration - revealPoint) / 20));
      });
      
      setRevealProgress(newProgress);
      
      setDisplayText(
        charsArray.map((char, index) => {
          if (char === " ") return " ";
          
          if (newProgress[index] >= 1) {
            return char;
          }
          
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
      );

      iteration++;

      if (iteration >= totalIterations + 20) {
        clearInterval(intervalRef.current);
        setDisplayText(charsArray);
        setRevealProgress(charsArray.map(() => 1));
      }
    }, scrambleSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, scrambleDuration, scrambleSpeed]);

  return (
    <span className="inline-block" style={{ color: '#f0f8ff' }}>
      {displayText.map((char, index) => {
        const progress = revealProgress[index];
        const blur = Math.max(0, 8 - progress * 8);
        const opacity = 0.3 + progress * 0.7;
        
        return (
          <span
            key={index}
            className="inline-block transition-all duration-300"
            style={{
              filter: `blur(${blur}px)`,
              opacity: opacity,
              textShadow: progress > 0.5 
                ? `0 0 10px rgba(240, 248, 255, ${progress}), 0 0 20px rgba(100, 200, 255, ${progress * 0.5}), 0 0 30px rgba(100, 200, 255, ${progress * 0.3})`
                : 'none',
              transform: `scale(${0.95 + progress * 0.05})`,
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

