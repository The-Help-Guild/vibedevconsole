import { useEffect, useState, useRef } from "react";

interface ScrambleTextProps {
  text: string;
  scrambleDuration?: number;
  scrambleSpeed?: number;
}

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

export const ScrambleText = ({ 
  text, 
  scrambleDuration = 2000,
  scrambleSpeed = 50
}: ScrambleTextProps) => {
  // Start with random characters instead of spaces
  const [displayText, setDisplayText] = useState(
    text.split("").map((char) => 
      char === " " ? " " : CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
    )
  );
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let iteration = 0;
    const totalIterations = Math.floor(scrambleDuration / scrambleSpeed);
    const charsArray = text.split("");

    intervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        charsArray.map((char, index) => {
          // Space should remain space
          if (char === " ") return " ";
          
          // Calculate when this character should be revealed
          const revealPoint = (index / charsArray.length) * totalIterations;
          
          // If we've passed this character's reveal point, show the correct character
          if (iteration > revealPoint) {
            return char;
          }
          
          // Otherwise, show a random character
          return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        })
      );

      iteration++;

      if (iteration >= totalIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(charsArray);
        setIsComplete(true);
      }
    }, scrambleSpeed);

    // Cleanup
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, scrambleDuration, scrambleSpeed]);

  return (
    <span className="inline-block">
      {displayText.map((char, index) => (
        <span key={index} className="inline-block">
          {char}
        </span>
      ))}
    </span>
  );
};

