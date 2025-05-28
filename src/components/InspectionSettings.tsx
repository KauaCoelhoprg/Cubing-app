
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';

export interface InspectionConfig {
  enabled: boolean;
  duration: number; // em segundos
  showWarnings: boolean;
  warningAt: number; // segundos restantes para mostrar aviso
}

const DEFAULT_INSPECTION_CONFIG: InspectionConfig = {
  enabled: false,
  duration: 15,
  showWarnings: true,
  warningAt: 3,
};

const InspectionSettings = () => {
  const [config, setConfig] = useLocalStorage<InspectionConfig>(
    'cubeTimer_inspectionConfig',
    DEFAULT_INSPECTION_CONFIG
  );
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleConfigChange = (key: keyof InspectionConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    console.log('Configuração de inspeção atualizada:', newConfig);
    
    toast({
      title: "Configuração atualizada",
      description: "As configurações de inspeção foram salvas.",
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="mb-4"
      >
        <Settings className="mr-2 h-4 w-4" />
        Configurar Inspeção
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl text-speedcube-400 flex items-center justify-between">
          <span className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Configurações de Inspeção
          </span>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ativar/Desativar inspeção */}
        <div className="flex items-center space-x-2">
          <Switch
            id="inspection-enabled"
            checked={config.enabled}
            onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
          />
          <Label htmlFor="inspection-enabled">
            Ativar período de inspeção
          </Label>
        </div>

        {config.enabled && (
          <>
            {/* Duração da inspeção */}
            <div className="space-y-2">
              <Label htmlFor="inspection-duration">
                Duração da inspeção (segundos)
              </Label>
              <Select
                value={config.duration.toString()}
                onValueChange={(value) => handleConfigChange('duration', parseInt(value))}
              >
                <SelectTrigger id="inspection-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 segundos</SelectItem>
                  <SelectItem value="15">15 segundos (padrão WCA)</SelectItem>
                  <SelectItem value="20">20 segundos</SelectItem>
                  <SelectItem value="30">30 segundos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Avisos de tempo */}
            <div className="flex items-center space-x-2">
              <Switch
                id="inspection-warnings"
                checked={config.showWarnings}
                onCheckedChange={(checked) => handleConfigChange('showWarnings', checked)}
              />
              <Label htmlFor="inspection-warnings">
                Mostrar avisos de tempo restante
              </Label>
            </div>

            {config.showWarnings && (
              <div className="space-y-2">
                <Label htmlFor="warning-time">
                  Avisar quando restarem (segundos)
                </Label>
                <Select
                  value={config.warningAt.toString()}
                  onValueChange={(value) => handleConfigChange('warningAt', parseInt(value))}
                >
                  <SelectTrigger id="warning-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 segundos</SelectItem>
                    <SelectItem value="3">3 segundos</SelectItem>
                    <SelectItem value="5">5 segundos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {/* Informações sobre a inspeção */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Como funciona a inspeção:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pressione ESPAÇO para iniciar a inspeção</li>
            <li>Analise o cubo durante o período configurado</li>
            <li>Pressione ESPAÇO novamente para iniciar o timer</li>
            <li>Se o tempo de inspeção acabar, será aplicada penalidade (+2s)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InspectionSettings;
