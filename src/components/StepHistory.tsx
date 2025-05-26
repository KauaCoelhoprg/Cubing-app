
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Download, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import jsPDF from 'jspdf';

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

interface StepHistoryProps {
  entries: StepEntry[];
  onDeleteEntry: (id: number) => void;
  onClearAll: () => void;
}

const StepHistory = ({ entries, onDeleteEntry, onClearAll }: StepHistoryProps) => {
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = milliseconds / 1000;
    return totalSeconds.toFixed(2);
  };

  const formatTimestamp = (timestamp: Date | string): string => {
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
    pdf.text('Histórico de Tempos por Etapas - CFOP', 20, 30);
    
    // Data de geração
    pdf.setFontSize(12);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 45);
    
    // Estatísticas
    const bestTotal = entries.length > 0 ? Math.min(...entries.map(e => e.totalTime)) : 0;
    const avgTotal = entries.length > 0 ? entries.reduce((sum, e) => sum + e.totalTime, 0) / entries.length : 0;
    
    pdf.setFontSize(14);
    pdf.text('Estatísticas Gerais:', 20, 65);
    pdf.setFontSize(12);
    pdf.text(`Total de soluções: ${entries.length}`, 20, 80);
    pdf.text(`Melhor tempo total: ${formatTime(bestTotal)}s`, 20, 95);
    pdf.text(`Tempo médio total: ${formatTime(avgTotal)}s`, 20, 110);
    
    // Médias por etapa
    if (entries.length > 0) {
      const stepAverages = ['Cruz', 'F2L', 'OLL', 'PLL'].map(stepName => {
        const stepTimes = entries.flatMap(e => e.stepTimes.filter(s => s.step === stepName).map(s => s.time));
        const avg = stepTimes.length > 0 ? stepTimes.reduce((sum, time) => sum + time, 0) / stepTimes.length : 0;
        return { step: stepName, average: avg };
      });
      
      pdf.text('Médias por Etapa:', 20, 130);
      let yPos = 145;
      stepAverages.forEach(({ step, average }) => {
        pdf.text(`${step}: ${formatTime(average)}s`, 20, yPos);
        yPos += 15;
      });
    }
    
    pdf.save('cubo-timer-etapas-historico.pdf');
  };

  const getStepAverage = (stepName: string): string => {
    const stepTimes = entries.flatMap(e => e.stepTimes.filter(s => s.step === stepName).map(s => s.time));
    if (stepTimes.length === 0) return '--';
    const avg = stepTimes.reduce((sum, time) => sum + time, 0) / stepTimes.length;
    return formatTime(avg);
  };

  return (
    <div className="space-y-4">
      {/* Médias por etapa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-speedcube-400">Médias por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Cruz', 'F2L', 'OLL', 'PLL'].map(step => (
              <div key={step} className="text-center p-3 rounded-lg bg-card/30 border border-border/50">
                <div className="text-sm text-muted-foreground">{step}</div>
                <div className="text-lg font-mono font-bold text-speedcube-400">
                  {getStepAverage(step)}s
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico detalhado */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-speedcube-400">Histórico Detalhado</CardTitle>
            <div className="flex space-x-2">
              {entries.length > 0 && (
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
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma solução por etapas registrada ainda
            </p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Cruz</TableHead>
                    <TableHead>F2L</TableHead>
                    <TableHead>OLL</TableHead>
                    <TableHead>PLL</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, index) => (
                    <TableRow key={entry.id} className="group">
                      <TableCell className="font-medium">
                        #{entries.length - index}
                      </TableCell>
                      {['Cruz', 'F2L', 'OLL', 'PLL'].map(stepName => {
                        const stepTime = entry.stepTimes.find(s => s.step === stepName);
                        return (
                          <TableCell key={stepName} className="font-mono">
                            {stepTime ? `${formatTime(stepTime.time)}s` : '--'}
                          </TableCell>
                        );
                      })}
                      <TableCell className={`font-mono font-semibold ${
                        entry.isPB ? 'text-success-400' : 'text-foreground'
                      }`}>
                        {formatTime(entry.totalTime)}s
                        {entry.isPB && (
                          <Badge className="ml-2 bg-success-500/20 text-success-400 border-success-500/30">
                            PB
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatTimestamp(entry.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => onDeleteEntry(entry.id)}
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StepHistory;
