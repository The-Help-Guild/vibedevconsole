import { useEffect, useState, useRef } from "react";

interface ScrambleTextProps {
  text: string;
  scrambleDuration?: number;
  scrambleSpeed?: number;
}

const CYBER_CHARS = "█▓▒░01※◆◇◈◉○●★☆♦♢▪▫■□";

export const ScrambleText = ({ 
  text, 
  scrambleDuration = 3000,
  scrambleSpeed = 30
}: ScrambleTextProps) => {
  // Start with random cyber characters
  const [displayText, setDisplayText] = useState(
    text.split("").map((char) => 
      char === " " ? " " : CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)]
    )
  );
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let iteration = 0;
    const totalIterations = Math.floor(scrambleDuration / scrambleSpeed);
    const charsArray = text.split("");

    intervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        charsArray.map((char, index) => {
          if (char === " ") return " ";
          
          // Calculate when this character should be revealed with stagger
          const revealPoint = (index / charsArray.length) * totalIterations * 0.7;
          
          if (iteration > revealPoint) {
            setRevealedIndices(prev => new Set(prev).add(index));
            return char;
          }
          
          // Show random cyber characters
          return CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)];
        })
      );

      iteration++;

      if (iteration >= totalIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(charsArray);
        setRevealedIndices(new Set(charsArray.map((_, i) => i)));
      }
    }, scrambleSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, scrambleDuration, scrambleSpeed]);

  return (
    <>
      <style>{`
        @keyframes glitch {
          0%, 100% { 
            transform: translateX(0) translateY(0);
            filter: hue-rotate(0deg);
          }
          25% { 
            transform: translateX(-2px) translateY(1px);
            filter: hue-rotate(20deg);
          }
          50% { 
            transform: translateX(2px) translateY(-1px);
            filter: hue-rotate(-20deg);
          }
          75% { 
            transform: translateX(-1px) translateY(-2px);
            filter: hue-rotate(10deg);
          }
        }
      `}</style>
      <span className="inline-block relative">
        {displayText.map((char, index) => {
          const isRevealed = revealedIndices.has(index);
          return (
            <span
              key={index}
              className={`inline-block transition-all duration-300 ${
                isRevealed 
                  ? 'text-shadow-glow scale-100 opacity-100' 
                  : 'opacity-70 scale-95 blur-[1px]'
              }`}
              style={{
                textShadow: isRevealed 
                  ? '0 0 20px currentColor, 0 0 40px currentColor' 
                  : '0 0 5px currentColor',
                animation: !isRevealed ? 'glitch 0.3s infinite' : 'none',
                animationDelay: `${index * 0.05}s`,
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    </>
  );
};

