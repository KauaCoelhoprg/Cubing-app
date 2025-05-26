import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';

interface TimerProps {
  onTimeComplete: (time: number) => void;
}

const Timer = ({ onTimeComplete }: TimerProps) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
    }
    return seconds.toFixed(2);
  };

  const startTimer = useCallback(() => {
    if (!isRunning) {
      const now = performance.now();
      setStartTime(now);
      setIsRunning(true);
      setTime(0);
    }
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    if (isRunning && startTime) {
      const finalTime = performance.now() - startTime;
      setIsRunning(false);
      setTime(finalTime);
      onTimeComplete(finalTime);
      setStartTime(null);
    }
  }, [isRunning, startTime, onTimeComplete]);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  }, [isRunning, startTimer, stopTimer]);

  useEffect(() => {
    let animationFrame: number;
    
    if (isRunning && startTime) {
      const updateTime = () => {
        const currentTime = performance.now() - startTime;
        setTime(currentTime);
        animationFrame = requestAnimationFrame(updateTime);
      };
      animationFrame = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRunning, startTime]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        toggleTimer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTimer]);

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center">
        <div className={`text-8xl md:text-9xl font-bold font-mono transition-all duration-300 ${
          isRunning ? 'text-speedcube-400 timer-glow' : 'text-foreground'
        }`}>
          {formatTime(time)}
        </div>
        <p className="text-muted-foreground mt-4 text-lg">
          {isRunning ? 'Cronômetro em execução...' : 'Pressione ESPAÇO ou clique para iniciar'}
        </p>
      </div>
      
      <Button
        onClick={toggleTimer}
        size="lg"
        className={`w-32 h-16 text-xl transition-all duration-300 ${
          isRunning 
            ? 'bg-destructive hover:bg-destructive/90' 
            : 'bg-speedcube-500 hover:bg-speedcube-600'
        }`}
      >
        {isRunning ? (
          <>
            <Square className="mr-2 h-6 w-6" />
            Parar
          </>
        ) : (
          <>
            <Play className="mr-2 h-6 w-6" />
            Iniciar
          </>
        )}
      </Button>
    </div>
  );
};

export default Timer;
