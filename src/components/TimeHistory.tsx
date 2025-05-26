import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';

interface TimeEntry {
  id: number;
  time: number;
  timestamp: Date;
  isPB?: boolean;
}

interface TimeHistoryProps {
  times: TimeEntry[];
  onDeleteTime: (id: number) => void;
  onClearAll: () => void;
}

const TimeHistory = ({ times, onDeleteTime, onClearAll }: TimeHistoryProps) => {
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
    }
    return seconds.toFixed(2);
  };

  const formatTimestamp = (timestamp: Date | string): string => {
    // Convert to Date object if it's a string (from localStorage)
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    
    // Título
    pdf.setFontSize(20);
    pdf.text('Histórico de Tempos - Cubo Timer', 20, 30);
    
    // Data de geração
    pdf.setFontSize(12);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 45);
    
    // Estatísticas
    const bestTime = times.length > 0 ? Math.min(...times.map(t => t.time)) : 0;
    const avgTime = times.length > 0 ? times.reduce((sum, t) => sum + t.time, 0) / times.length : 0;
    
    pdf.setFontSize(14);
    pdf.text('Estatísticas:', 20, 65);
    pdf.setFontSize(12);
    pdf.text(`Total de resoluções: ${times.length}`, 20, 80);
    pdf.text(`Melhor tempo: ${formatTime(bestTime)}`, 20, 95);
    pdf.text(`Tempo médio: ${formatTime(avgTime)}`, 20, 110);
    
    // Lista de tempos
    pdf.setFontSize(14);
    pdf.text('Histórico Completo:', 20, 130);
    
    let yPosition = 150;
    pdf.setFontSize(10);
    
    times.forEach((entry, index) => {
      const line = `#${times.length - index} - ${formatTime(entry.time)}${entry.isPB ? ' (PB)' : ''} - ${formatTimestamp(entry.timestamp)}`;
      
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.text(line, 20, yPosition);
      yPosition += 15;
    });
    
    pdf.save('cubo-timer-historico.pdf');
  };

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-speedcube-400">Histórico de Tempos</CardTitle>
          <div className="flex space-x-2">
            {times.length > 0 && (
              <>
                <Button
                  onClick={generatePDF}
                  size="sm"
                  variant="outline"
                  className="text-speedcube-400 border-speedcube-400 hover:bg-speedcube-400 hover:text-white"
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button
                  onClick={onClearAll}
                  size="sm"
                  variant="destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              </>
            )}
          </div>
        </div>
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
                className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card/80 transition-colors animate-fade-in group"
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
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground text-sm">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <Button
                    onClick={() => onDeleteTime(entry.id)}
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeHistory;
