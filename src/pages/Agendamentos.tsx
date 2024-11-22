import React, { useState } from 'react';
import { AgendamentoCalendario } from '../components/AgendamentoCalendario';
import { AgendamentoList } from '../components/AgendamentoList';
import { Button } from '../components/ui/button';

type ModoVisualizacao = 'lista' | 'calendario';

export function AgendamentosPage() {
  const [modo, setModo] = useState<ModoVisualizacao>('calendario');
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const handleAgendamentoSalvo = () => {
    setTriggerRefetch(!triggerRefetch);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Agendamentos</h1>
        <div className="flex gap-2">
          <Button
            variant={modo === 'calendario' ? 'secondary' : 'ghost'}
            onClick={() => setModo('calendario')}
          >
            Calendário
          </Button>
          <Button
            variant={modo === 'lista' ? 'secondary' : 'ghost'}
            onClick={() => setModo('lista')}
          >
            Lista
          </Button>
        </div>
      </div>
      
      {modo === 'calendario' ? (
        <AgendamentoCalendario onAgendamentoSalvo={handleAgendamentoSalvo} />
      ) : (
        <AgendamentoList 
          onEditAgendamento={() => {}}
          onNovoAgendamento={() => setModo('calendario')}
          triggerRefetch={triggerRefetch}
        />
      )}
    </div>
  );
}
