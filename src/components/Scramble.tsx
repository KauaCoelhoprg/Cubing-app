
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RefreshCw, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MOVES = ['R', 'L', 'U', 'D', 'F', 'B'];
const MODIFIERS = ['', "'", '2'];

const Scramble = () => {
  const [scramble, setScramble] = useState<string>('');
  const { toast } = useToast();

  const generateScramble = (): string => {
    const moves: string[] = [];
    let lastMove = '';
    let lastAxis = '';

    // Gerar 20-25 movimentos para um embaralhamento adequado
    const scrambleLength = Math.floor(Math.random() * 6) + 20;

    for (let i = 0; i < scrambleLength; i++) {
      let move: string;
      let axis: string;

      do {
        move = MOVES[Math.floor(Math.random() * MOVES.length)];
        
        // Determinar o eixo do movimento
        if (move === 'R' || move === 'L') axis = 'x';
        else if (move === 'U' || move === 'D') axis = 'y';
        else axis = 'z'; // F ou B

        // Evitar movimentos consecutivos na mesma face ou eixo
      } while (move === lastMove || (axis === lastAxis && Math.random() < 0.7));

      const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
      moves.push(move + modifier);
      
      lastMove = move;
      lastAxis = axis;
    }

    return moves.join(' ');
  };

  const handleGenerateScramble = () => {
    const newScramble = generateScramble();
    setScramble(newScramble);
    console.log('Novo embaralhamento gerado:', newScramble);
  };

  const handleCopyScramble = async () => {
    if (scramble) {
      try {
        await navigator.clipboard.writeText(scramble);
        toast({
          title: "Embaralhamento copiado!",
          description: "O embaralhamento foi copiado para a área de transferência.",
        });
      } catch (error) {
        console.error('Erro ao copiar embaralhamento:', error);
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o embaralhamento.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-speedcube-400">Embaralhamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Área do embaralhamento */}
        <div className="min-h-[80px] p-4 bg-muted rounded-lg">
          {scramble ? (
            <div className="text-lg font-mono text-center leading-relaxed">
              {scramble}
            </div>
          ) : (
            <div className="text-muted-foreground text-center">
              Clique em "Gerar Embaralhamento" para começar
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleGenerateScramble}
            className="bg-speedcube-500 hover:bg-speedcube-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar Embaralhamento
          </Button>
          
          {scramble && (
            <Button
              onClick={handleCopyScramble}
              variant="outline"
              className="text-speedcube-400 border-speedcube-400 hover:bg-speedcube-400 hover:text-white"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
          )}
        </div>

        {/* Legenda dos movimentos */}
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="text-center font-medium">Legenda dos Movimentos:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><strong>R, L, U, D, F, B:</strong> Rotação horária</div>
            <div><strong>':</strong> Rotação anti-horária</div>
            <div><strong>2:</strong> Rotação dupla (180°)</div>
            <div><strong>R = Right, L = Left, U = Up</strong></div>
            <div><strong>D = Down, F = Front, B = Back</strong></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Scramble;
