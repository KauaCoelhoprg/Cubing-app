import { useState, useCallback } from 'react';
import Timer from '@/components/Timer';
import TimeHistory from '@/components/TimeHistory';
import Statistics from '@/components/Statistics';
import useLocalStorage from '@/hooks/useLocalStorage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TimeEntry {
  id: number;
  time: number;
  timestamp: Date;
  isPB?: boolean;
}

const Index = () => {
  const [times, setTimes] = useLocalStorage<TimeEntry[]>('cubeTimer_times', []);
  const [nextId, setNextId] = useLocalStorage<number>('cubeTimer_nextId', 1);
  const [showClearDialog, setShowClearDialog] = useState(false);

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

  const handleClearAll = useCallback(() => {
    setTimes([]);
    setNextId(1);
    setShowClearDialog(false);
    console.log('Todos os tempos foram excluídos');
  }, [setTimes, setNextId]);

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

        {/* Main Timer Section */}
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

        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 text-muted-foreground">
            <kbd className="px-3 py-1 bg-muted rounded text-sm font-mono">SPACE</kbd>
            <span>para iniciar/parar o cronômetro</span>
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
