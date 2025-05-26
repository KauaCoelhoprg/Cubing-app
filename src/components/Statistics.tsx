
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimeEntry {
  id: number;
  time: number;
  timestamp: Date;
  isPB?: boolean;
}

interface StatisticsProps {
  times: TimeEntry[];
}

const Statistics = ({ times }: StatisticsProps) => {
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
    }
    return seconds.toFixed(2);
  };

  const calculateAverageOfN = (n: number): string => {
    if (times.length < n) return '--';
    
    const lastNTimes = times.slice(-n).map(t => t.time);
    
    if (n === 5 || n === 12) {
      // Para Ao5 e Ao12, remove o melhor e pior tempo
      const sorted = [...lastNTimes].sort((a, b) => a - b);
      const trimmed = sorted.slice(1, -1);
      const average = trimmed.reduce((sum, time) => sum + time, 0) / trimmed.length;
      return formatTime(average);
    } else {
      // Para média geral
      const average = lastNTimes.reduce((sum, time) => sum + time, 0) / lastNTimes.length;
      return formatTime(average);
    }
  };

  const getBestTime = (): string => {
    if (times.length === 0) return '--';
    const best = Math.min(...times.map(t => t.time));
    return formatTime(best);
  };

  const getWorstTime = (): string => {
    if (times.length === 0) return '--';
    const worst = Math.max(...times.map(t => t.time));
    return formatTime(worst);
  };

  const getTotalSolves = (): number => {
    return times.length;
  };

  const stats = [
    {
      label: 'Média de 5 (Ao5)',
      value: calculateAverageOfN(5),
      description: 'Últimas 5 resoluções (excl. melhor/pior)',
      color: 'text-speedcube-400'
    },
    {
      label: 'Média de 12 (Ao12)',
      value: calculateAverageOfN(12),
      description: 'Últimas 12 resoluções (excl. melhor/pior)',
      color: 'text-speedcube-300'
    },
    {
      label: 'Melhor Tempo (PB)',
      value: getBestTime(),
      description: 'Personal Best',
      color: 'text-success-400'
    },
    {
      label: 'Pior Tempo',
      value: getWorstTime(),
      description: 'Tempo mais alto',
      color: 'text-destructive'
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-speedcube-400">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="p-4 rounded-lg bg-card/30 border border-border/50"
              >
                <div className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </div>
                <div className={`text-2xl font-mono font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-speedcube-400">Resumo da Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total de Resoluções:</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {getTotalSolves()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
