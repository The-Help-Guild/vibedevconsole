import { useEffect, useState, useRef } from "react";

interface ScrambleTextProps {
  text: string;
  scrambleDuration?: number;
  scrambleSpeed?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

export const ScrambleText = ({ 
  text, 
  scrambleDuration = 2000,
  scrambleSpeed = 50
}: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(
    text.split("").map((char) => 
      char === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]
    )
  );
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let iteration = 0;
    const totalIterations = Math.floor(scrambleDuration / scrambleSpeed);
    const charsArray = text.split("");

    intervalRef.current = setInterval(() => {
      setDisplayText(
        charsArray.map((char, index) => {
          if (char === " ") return " ";
          
          const revealPoint = (index / charsArray.length) * totalIterations;
          
          if (iteration > revealPoint) {
            return char;
          }
          
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
      );

      iteration++;

      if (iteration >= totalIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(charsArray);
      }
    }, scrambleSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, scrambleDuration, scrambleSpeed]);

  return (
    <span className="text-white font-mono">
      {displayText.join("")}
    </span>
  );
};

