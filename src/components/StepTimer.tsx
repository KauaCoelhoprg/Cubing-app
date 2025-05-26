
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Play, Square, RotateCcw } from 'lucide-react';

interface StepTime {
  step: string;
  time: number;
}

interface StepTimerProps {
  onStepComplete: (stepTimes: StepTime[]) => void;
}

const STEPS = [
  { name: 'Cruz', label: 'Cruz (Cross)' },
  { name: 'F2L', label: 'F2L (First Two Layers)' },
  { name: 'OLL', label: 'OLL (Orient Last Layer)' },
  { name: 'PLL', label: 'PLL (Permute Last Layer)' }
];

const StepTimer = ({ onStepComplete }: StepTimerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stepStartTime, setStepStartTime] = useState<number | null>(null);
  const [currentStepTime, setCurrentStepTime] = useState(0);
  const [stepTimes, setStepTimes] = useState<StepTime[]>([]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = milliseconds / 1000;
    return totalSeconds.toFixed(2);
  };

  const startStep = useCallback(() => {
    if (!isRunning) {
      const now = performance.now();
      setStepStartTime(now);
      setIsRunning(true);
      setCurrentStepTime(0);
    }
  }, [isRunning]);

  const completeStep = useCallback(() => {
    if (isRunning && stepStartTime) {
      const stepTime = performance.now() - stepStartTime;
      const newStepTime: StepTime = {
        step: STEPS[currentStep].name,
        time: stepTime
      };
      
      const updatedStepTimes = [...stepTimes, newStepTime];
      setStepTimes(updatedStepTimes);
      setIsRunning(false);
      setStepStartTime(null);
      setCurrentStepTime(0);
      
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Solução completa
        onStepComplete(updatedStepTimes);
        resetTimer();
      }
    }
  }, [isRunning, stepStartTime, currentStep, stepTimes, onStepComplete]);

  const resetTimer = useCallback(() => {
    setCurrentStep(0);
    setIsRunning(false);
    setStepStartTime(null);
    setCurrentStepTime(0);
    setStepTimes([]);
  }, []);

  useEffect(() => {
    let animationFrame: number;
    
    if (isRunning && stepStartTime) {
      const updateTime = () => {
        const currentTime = performance.now() - stepStartTime;
        setCurrentStepTime(currentTime);
        animationFrame = requestAnimationFrame(updateTime);
      };
      animationFrame = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRunning, stepStartTime]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Enter') {
        event.preventDefault();
        if (isRunning) {
          completeStep();
        } else {
          startStep();
        }
      } else if (event.code === 'Escape') {
        event.preventDefault();
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, startStep, completeStep, resetTimer]);

  const getTotalTime = (): number => {
    return stepTimes.reduce((total, step) => total + step.time, 0) + (isRunning ? currentStepTime : 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-speedcube-400">Cronômetro por Etapas (CFOP)</CardTitle>
          <Button
            onClick={resetTimer}
            size="sm"
            variant="outline"
            className="text-speedcube-400 border-speedcube-400 hover:bg-speedcube-400 hover:text-white"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step, index) => (
            <div
              key={step.name}
              className={`p-2 rounded text-center text-sm ${
                index < currentStep
                  ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                  : index === currentStep
                  ? 'bg-speedcube-500/20 text-speedcube-400 border border-speedcube-500/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.name}
              {stepTimes[index] && (
                <div className="text-xs font-mono mt-1">
                  {formatTime(stepTimes[index].time)}s
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Current step display */}
        {currentStep < STEPS.length && (
          <div className="text-center space-y-4">
            <div>
              <Badge className="bg-speedcube-500/20 text-speedcube-400 border-speedcube-500/30 text-lg px-4 py-2">
                {STEPS[currentStep].label}
              </Badge>
            </div>
            
            <div className={`text-6xl font-bold font-mono transition-all duration-300 ${
              isRunning ? 'text-speedcube-400 timer-glow' : 'text-foreground'
            }`}>
              {formatTime(currentStepTime)}s
            </div>
            
            <div className="text-sm text-muted-foreground">
              Tempo total: {formatTime(getTotalTime())}s
            </div>
            
            <p className="text-muted-foreground">
              {isRunning 
                ? 'Pressione ENTER para completar esta etapa' 
                : 'Pressione ENTER para iniciar ou clique no botão'
              }
            </p>
            
            <Button
              onClick={isRunning ? completeStep : startStep}
              size="lg"
              className={`w-40 h-12 text-lg transition-all duration-300 ${
                isRunning 
                  ? 'bg-success-500 hover:bg-success-600' 
                  : 'bg-speedcube-500 hover:bg-speedcube-600'
              }`}
            >
              {isRunning ? (
                <>
                  <Square className="mr-2 h-5 w-5" />
                  Completar
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Iniciar
                </>
              )}
            </Button>
          </div>
        )}

        {/* Solution completed */}
        {currentStep >= STEPS.length && stepTimes.length === STEPS.length && (
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-success-400">
              ✅ Solução Completa!
            </div>
            <div className="text-3xl font-bold font-mono text-success-400">
              Tempo Total: {formatTime(getTotalTime())}s
            </div>
            <Button
              onClick={resetTimer}
              size="lg"
              className="bg-speedcube-500 hover:bg-speedcube-600"
            >
              Nova Solução
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <div>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">ENTER</kbd>
            <span className="ml-2">Iniciar/Completar etapa</span>
          </div>
          <div>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">ESC</kbd>
            <span className="ml-2">Reset</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepTimer;
