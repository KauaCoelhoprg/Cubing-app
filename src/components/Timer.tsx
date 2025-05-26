
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Eye } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { InspectionConfig } from './InspectionSettings';

interface TimerProps {
  onTimeComplete: (time: number, penalty?: number) => void;
}

const DEFAULT_INSPECTION_CONFIG: InspectionConfig = {
  enabled: false,
  duration: 15,
  showWarnings: true,
  warningAt: 3,
};

const Timer = ({ onTimeComplete }: TimerProps) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionTime, setInspectionTime] = useState(0);
  const [inspectionStartTime, setInspectionStartTime] = useState<number | null>(null);
  const [inspectionConfig] = useLocalStorage<InspectionConfig>(
    'cubeTimer_inspectionConfig',
    DEFAULT_INSPECTION_CONFIG
  );

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
    }
    return seconds.toFixed(2);
  };

  const formatInspectionTime = (seconds: number): string => {
    return seconds.toFixed(1);
  };

  const startInspection = useCallback(() => {
    if (inspectionConfig.enabled && !isInspecting && !isRunning) {
      const now = performance.now();
      setInspectionStartTime(now);
      setIsInspecting(true);
      setInspectionTime(0);
      console.log('Inspeção iniciada');
    }
  }, [inspectionConfig.enabled, isInspecting, isRunning]);

  const startTimer = useCallback(() => {
    if (!isRunning) {
      const now = performance.now();
      setStartTime(now);
      setIsRunning(true);
      setTime(0);
      setIsInspecting(false);
      setInspectionStartTime(null);
      console.log('Timer iniciado');
    }
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    if (isRunning && startTime) {
      const finalTime = performance.now() - startTime;
      setIsRunning(false);
      setTime(finalTime);
      
      // Verificar se houve penalidade por inspeção excessiva
      let penalty = 0;
      if (inspectionConfig.enabled && inspectionTime > inspectionConfig.duration) {
        penalty = 2000; // +2 segundos em milliseconds
        console.log('Penalidade aplicada: +2s por inspeção excessiva');
      }
      
      onTimeComplete(finalTime, penalty);
      setStartTime(null);
      setInspectionTime(0);
    }
  }, [isRunning, startTime, onTimeComplete, inspectionConfig, inspectionTime]);

  const handleSpacePress = useCallback(() => {
    if (inspectionConfig.enabled) {
      if (!isInspecting && !isRunning) {
        startInspection();
      } else if (isInspecting) {
        startTimer();
      } else if (isRunning) {
        stopTimer();
      }
    } else {
      if (isRunning) {
        stopTimer();
      } else {
        startTimer();
      }
    }
  }, [inspectionConfig.enabled, isInspecting, isRunning, startInspection, startTimer, stopTimer]);

  const handleButtonClick = useCallback(() => {
    handleSpacePress();
  }, [handleSpacePress]);

  // Atualizar timer principal
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

  // Atualizar timer de inspeção
  useEffect(() => {
    let animationFrame: number;
    
    if (isInspecting && inspectionStartTime) {
      const updateInspectionTime = () => {
        const elapsed = (performance.now() - inspectionStartTime) / 1000;
        setInspectionTime(elapsed);
        animationFrame = requestAnimationFrame(updateInspectionTime);
      };
      animationFrame = requestAnimationFrame(updateInspectionTime);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInspecting, inspectionStartTime]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleSpacePress();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSpacePress]);

  const getTimerColor = () => {
    if (isRunning) return 'text-speedcube-400 timer-glow';
    if (isInspecting) {
      if (inspectionConfig.showWarnings && inspectionTime > (inspectionConfig.duration - inspectionConfig.warningAt)) {
        return 'text-yellow-500';
      }
      if (inspectionTime > inspectionConfig.duration) {
        return 'text-red-500';
      }
      return 'text-blue-400';
    }
    return 'text-foreground';
  };

  const getStatusText = () => {
    if (isRunning) return 'Cronômetro em execução...';
    if (isInspecting) {
      const remaining = Math.max(0, inspectionConfig.duration - inspectionTime);
      if (inspectionTime > inspectionConfig.duration) {
        return `PENALIDADE! +2s - Pressione ESPAÇO para iniciar`;
      }
      return `Inspeção: ${remaining.toFixed(1)}s restantes - Pressione ESPAÇO para iniciar`;
    }
    if (inspectionConfig.enabled) {
      return 'Pressione ESPAÇO para iniciar inspeção';
    }
    return 'Pressione ESPAÇO ou clique para iniciar';
  };

  const getButtonText = () => {
    if (isRunning) return 'Parar';
    if (isInspecting) return 'Iniciar Timer';
    if (inspectionConfig.enabled) return 'Iniciar Inspeção';
    return 'Iniciar';
  };

  const getButtonIcon = () => {
    if (isRunning) return <Square className="mr-2 h-6 w-6" />;
    if (isInspecting) return <Play className="mr-2 h-6 w-6" />;
    if (inspectionConfig.enabled) return <Eye className="mr-2 h-6 w-6" />;
    return <Play className="mr-2 h-6 w-6" />;
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center">
        <div className={`text-8xl md:text-9xl font-bold font-mono transition-all duration-300 ${getTimerColor()}`}>
          {isInspecting ? formatInspectionTime(inspectionTime) : formatTime(time)}
        </div>
        <p className="text-muted-foreground mt-4 text-lg">
          {getStatusText()}
        </p>
      </div>
      
      <Button
        onClick={handleButtonClick}
        size="lg"
        className={`w-40 h-16 text-xl transition-all duration-300 ${
          isRunning 
            ? 'bg-destructive hover:bg-destructive/90'
            : isInspecting
            ? 'bg-green-500 hover:bg-green-600'
            : inspectionConfig.enabled
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-speedcube-500 hover:bg-speedcube-600'
        }`}
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>
    </div>
  );
};

export default Timer;
