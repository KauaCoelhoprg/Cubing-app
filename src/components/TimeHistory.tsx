
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimeEntry {
  id: number;
  time: number;
  timestamp: Date;
  isPB?: boolean;
}

interface TimeHistoryProps {
  times: TimeEntry[];
}

const TimeHistory = ({ times }: TimeHistoryProps) => {
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
    }
    return seconds.toFixed(2);
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="text-xl text-speedcube-400">Histórico de Tempos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {times.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum tempo registrado ainda
            </p>
          ) : (
            times.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card/80 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-muted-foreground text-sm font-medium w-8">
                    #{times.length - index}
                  </span>
                  <span className={`font-mono text-lg font-semibold ${
                    entry.isPB ? 'text-success-400 pb-glow' : 'text-foreground'
                  }`}>
                    {formatTime(entry.time)}
                  </span>
                  {entry.isPB && (
                    <Badge className="bg-success-500/20 text-success-400 border-success-500/30">
                      PB
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground text-sm">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeHistory;
