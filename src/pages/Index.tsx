
import { useState, useCallback } from 'react';
import Timer from '@/components/Timer';
import TimeHistory from '@/components/TimeHistory';
import Statistics from '@/components/Statistics';
import StepTimer from '@/components/StepTimer';
import StepHistory from '@/components/StepHistory';
import Scramble from '@/components/Scramble';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TimeEntry {
  id: number;
  time: number;
  timestamp: Date;
  isPB?: boolean;
}

interface StepTime {
  step: string;
  time: number;
}

interface StepEntry {
  id: number;
  stepTimes: StepTime[];
  totalTime: number;
  timestamp: Date;
  isPB?: boolean;
}

const Index = () => {
  const [times, setTimes] = useLocalStorage<TimeEntry[]>('cubeTimer_times', []);
  const [nextId, setNextId] = useLocalStorage<number>('cubeTimer_nextId', 1);
  const [stepEntries, setStepEntries] = useLocalStorage<StepEntry[]>('cubeTimer_stepEntries', []);
  const [nextStepId, setNextStepId] = useLocalStorage<number>('cubeTimer_nextStepId', 1);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showClearStepsDialog, setShowClearStepsDialog] = useState(false);

  const handleTimeComplete = useCallback((time: number) => {
    const newEntry: TimeEntry = {
      id: nextId,
      time,
      timestamp: new Date(),
    };

    // Verificar se é um novo PB
    const currentBest = times.length > 0 ? Math.min(...times.map(t => t.time)) : Infinity;
    if (time < currentBest) {
      newEntry.isPB = true;
      
      // Remover flag PB de entradas anteriores
      setTimes(prevTimes => 
        prevTimes.map(entry => ({ ...entry, isPB: false }))
      );
    }

    setTimes(prevTimes => [...prevTimes, newEntry]);
    setNextId(prev => prev + 1);

    console.log(`Novo tempo registrado: ${(time / 1000).toFixed(2)}s`, { isPB: newEntry.isPB });
  }, [times, nextId, setTimes, setNextId]);

  const handleStepComplete = useCallback((stepTimes: StepTime[]) => {
    const totalTime = stepTimes.reduce((sum, step) => sum + step.time, 0);
    
    const newEntry: StepEntry = {
      id: nextStepId,
      stepTimes,
      totalTime,
      timestamp: new Date(),
    };

    // Verificar se é um novo PB para tempos por etapas
    const currentBest = stepEntries.length > 0 ? Math.min(...stepEntries.map(e => e.totalTime)) : Infinity;
    if (totalTime < currentBest) {
      newEntry.isPB = true;
      
      // Remover flag PB de entradas anteriores
      setStepEntries(prevEntries => 
        prevEntries.map(entry => ({ ...entry, isPB: false }))
      );
    }

    setStepEntries(prevEntries => [...prevEntries, newEntry]);
    setNextStepId(prev => prev + 1);

    console.log(`Nova solução por etapas registrada: ${(totalTime / 1000).toFixed(2)}s`, { isPB: newEntry.isPB });
  }, [stepEntries, nextStepId, setStepEntries, setNextStepId]);

  const handleDeleteTime = useCallback((id: number) => {
    setTimes(prevTimes => {
      const updatedTimes = prevTimes.filter(time => time.id !== id);
      
      // Recalcular PB após exclusão
      if (updatedTimes.length > 0) {
        const newBest = Math.min(...updatedTimes.map(t => t.time));
        return updatedTimes.map(entry => ({
          ...entry,
          isPB: entry.time === newBest
        }));
      }
      
      return updatedTimes;
    });
    
    console.log(`Tempo com ID ${id} foi excluído`);
  }, [setTimes]);

  const handleDeleteStepEntry = useCallback((id: number) => {
    setStepEntries(prevEntries => {
      const updatedEntries = prevEntries.filter(entry => entry.id !== id);
      
      // Recalcular PB após exclusão
      if (updatedEntries.length > 0) {
        const newBest = Math.min(...updatedEntries.map(e => e.totalTime));
        return updatedEntries.map(entry => ({
          ...entry,
          isPB: entry.totalTime === newBest
        }));
      }
      
      return updatedEntries;
    });
    
    console.log(`Entrada de etapas com ID ${id} foi excluída`);
  }, [setStepEntries]);

  const handleClearAll = useCallback(() => {
    setTimes([]);
    setNextId(1);
    setShowClearDialog(false);
    console.log('Todos os tempos foram excluídos');
  }, [setTimes, setNextId]);

  const handleClearAllSteps = useCallback(() => {
    setStepEntries([]);
    setNextStepId(1);
    setShowClearStepsDialog(false);
    console.log('Todas as entradas de etapas foram excluídas');
  }, [setStepEntries, setNextStepId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-speedcube-400 mb-4">
            ⚡ Cubo Timer
          </h1>
          <p className="text-xl text-muted-foreground">
            Cronômetro profissional para speedcubing
          </p>
        </div>

        {/* Scramble Generator */}
        <div className="mb-8">
          <Scramble />
        </div>

        {/* Tabs for different timer modes */}
        <Tabs defaultValue="standard" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="standard">Timer Padrão</TabsTrigger>
            <TabsTrigger value="steps">Timer por Etapas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="space-y-8">
            {/* Standard Timer */}
            <div className="mb-12">
              <Timer onTimeComplete={handleTimeComplete} />
            </div>

            {/* Statistics and History Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Statistics */}
              <div>
                <Statistics times={times} />
              </div>

              {/* Time History */}
              <div>
                <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                  <TimeHistory 
                    times={times} 
                    onDeleteTime={handleDeleteTime}
                    onClearAll={() => setShowClearDialog(true)}
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir todos os tempos? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Excluir todos
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="steps" className="space-y-8">
            {/* Step Timer */}
            <div className="mb-12">
              <StepTimer onStepComplete={handleStepComplete} />
            </div>

            {/* Step History */}
            <div>
              <AlertDialog open={showClearStepsDialog} onOpenChange={setShowClearStepsDialog}>
                <StepHistory 
                  entries={stepEntries}
                  onDeleteEntry={handleDeleteStepEntry}
                  onClearAll={() => setShowClearStepsDialog(true)}
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir todas as soluções por etapas? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllSteps} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir todos
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 text-muted-foreground">
            <kbd className="px-3 py-1 bg-muted rounded text-sm font-mono">SPACE</kbd>
            <span>para timer padrão</span>
            <span>•</span>
            <kbd className="px-3 py-1 bg-muted rounded text-sm font-mono">ENTER</kbd>
            <span>para timer por etapas</span>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--speedcube-500));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--speedcube-400));
        }
      `}</style>
    </div>
  );
};

export default Index;
