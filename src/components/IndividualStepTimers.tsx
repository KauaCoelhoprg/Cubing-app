
import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCcw } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';

interface StepTimeRecord {
  step: string;
  time: number;
  timestamp: Date;
}

const CFOP_STEPS = [
  { id: 'cruz', name: 'Cruz', label: 'Cruz (Cross)', key: 'KeyC' },
  { id: 'f2l', name: 'F2L', label: 'F2L (First Two Layers)', key: 'KeyF' },
  { id: 'oll', name: 'OLL', label: 'OLL (Orient Last Layer)', key: 'KeyO' },
  { id: 'pll', name: 'PLL', label: 'PLL (Permute Last Layer)', key: 'KeyP' }
];

const IndividualStepTimers = () => {
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [stepRecords, setStepRecords] = useLocalStorage<StepTimeRecord[]>('cubeTimer_individualStepRecords', []);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = milliseconds / 1000;
    return totalSeconds.toFixed(2);
  };

  const startTimer = useCallback((stepId: string) => {
    if (activeTimer && activeTimer !== stepId) {
      // Parar timer ativo se outro for iniciado
      setActiveTimer(null);
      setStartTime(null);
      setCurrentTime(0);
    }

    const now = performance.now();
    setStartTime(now);
    setActiveTimer(stepId);
    setCurrentTime(0);
  }, [activeTimer]);

  const stopTimer = useCallback(() => {
    if (activeTimer && startTime) {
      const finalTime = performance.now() - startTime;
      const stepName = CFOP_STEPS.find(s => s.id === activeTimer)?.name || activeTimer;
      
      const newRecord: StepTimeRecord = {
        step: stepName,
        time: finalTime,
        timestamp: new Date()
      };

      setStepRecords(prev => [...prev, newRecord]);
      
      console.log(`Tempo registrado para ${stepName}: ${formatTime(finalTime)}s`);
    }

    setActiveTimer(null);
    setStartTime(null);
    setCurrentTime(0);
  }, [activeTimer, startTime, setStepRecords]);

  const resetTimer = useCallback(() => {
    setActiveTimer(null);
    setStartTime(null);
    setCurrentTime(0);
  }, []);

  const clearRecords = useCallback(() => {
    setStepRecords([]);
    console.log('Registros de etapas individuais limpos');
  }, [setStepRecords]);

  useEffect(() => {
    let animationFrame: number;
    
    if (activeTimer && startTime) {
      const updateTime = () => {
        const elapsed = performance.now() - startTime;
        setCurrentTime(elapsed);
        animationFrame = requestAnimationFrame(updateTime);
      };
      animationFrame = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [activeTimer, startTime]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const step = CFOP_STEPS.find(s => s.key === event.code);
      
      if (step) {
        event.preventDefault();
        if (activeTimer === step.id) {
          stopTimer();
        } else {
          startTimer(step.id);
        }
      } else if (event.code === 'Escape') {
        event.preventDefault();
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTimer, startTimer, stopTimer, resetTimer]);

  const getStepAverage = (stepName: string): string => {
    const stepTimes = stepRecords.filter(r => r.step === stepName).map(r => r.time);
    if (stepTimes.length === 0) return '--';
    const avg = stepTimes.reduce((sum, time) => sum + time, 0) / stepTimes.length;
    return formatTime(avg);
  };

  const getStepBest = (stepName: string): string => {
    const stepTimes = stepRecords.filter(r => r.step === stepName).map(r => r.time);
    if (stepTimes.length === 0) return '--';
    const best = Math.min(...stepTimes);
    return formatTime(best);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-speedcube-400">
            Cronômetros Individuais CFOP
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={resetTimer}
              size="sm"
              variant="outline"
              className="text-speedcube-400 border-speedcube-400 hover:bg-speedcube-400 hover:text-white"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            {stepRecords.length > 0 && (
              <Button
                onClick={clearRecords}
                size="sm"
                variant="destructive"
              >
                Limpar Registros
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer ativo */}
        {activeTimer && (
          <div className="text-center space-y-4 p-6 rounded-lg bg-speedcube-500/10 border border-speedcube-500/20">
            <Badge className="bg-speedcube-500/20 text-speedcube-400 border-speedcube-500/30 text-lg px-4 py-2">
              {CFOP_STEPS.find(s => s.id === activeTimer)?.label}
            </Badge>
            <div className="text-6xl font-bold font-mono text-speedcube-400 timer-glow">
              {formatTime(currentTime)}s
            </div>
            <p className="text-muted-foreground">
              Pressione a tecla da etapa novamente ou clique para parar
            </p>
            <Button
              onClick={stopTimer}
              size="lg"
              className="bg-success-500 hover:bg-success-600"
            >
              <Square className="mr-2 h-5 w-5" />
              Parar Timer
            </Button>
          </div>
        )}

        {/* Grid de etapas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CFOP_STEPS.map((step) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all ${
                activeTimer === step.id
                  ? 'border-speedcube-500 bg-speedcube-500/10'
                  : 'border-border bg-card hover:border-speedcube-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{step.label}</h3>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                  {step.key.replace('Key', '')}
                </kbd>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Melhor:</span>
                  <span className="font-mono">{getStepBest(step.name)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Média:</span>
                  <span className="font-mono">{getStepAverage(step.name)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tentativas:</span>
                  <span>{stepRecords.filter(r => r.step === step.name).length}</span>
                </div>
              </div>

              <Button
                onClick={() => startTimer(step.id)}
                className={`w-full mt-3 ${
                  activeTimer === step.id
                    ? 'bg-success-500 hover:bg-success-600'
                    : 'bg-speedcube-500 hover:bg-speedcube-600'
                }`}
                disabled={activeTimer && activeTimer !== step.id}
              >
                {activeTimer === step.id ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Parar
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Instruções */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p><strong>Atalhos de teclado:</strong></p>
          <div className="flex justify-center space-x-4 flex-wrap">
            {CFOP_STEPS.map((step) => (
              <div key={step.id} className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                  {step.key.replace('Key', '')}
                </kbd>
                <span>{step.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">ESC</kbd>
            <span className="ml-2">Reset timer ativo</span>
          </div>
        </div>

        {/* Últimos registros */}
        {stepRecords.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-muted-foreground">Últimos registros:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {stepRecords.slice(-10).reverse().map((record, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{record.step}</span>
                  <span className="font-mono">{formatTime(record.time)}s</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IndividualStepTimers;
