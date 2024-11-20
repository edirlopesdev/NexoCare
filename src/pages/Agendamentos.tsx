import React, { useState } from 'react';
import { AgendamentoForm } from '../components/AgendamentoForm';
import { AgendamentoList } from '../components/AgendamentoList';
import { Agendamento } from '../types/supabase-types';

type ModoFormulario = 'lista' | 'novo' | 'edicao';

export function AgendamentosPage() {
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<Agendamento | undefined>(undefined);
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const [modo, setModo] = useState<ModoFormulario>('lista');

  const handleEditAgendamento = (agendamento: Agendamento) => {
    setAgendamentoParaEditar(agendamento);
    setModo('edicao');
  };

  const handleNovoAgendamento = () => {
    setAgendamentoParaEditar(undefined);
    setModo('novo');
  };

  const handleAgendamentoSalvo = () => {
    setAgendamentoParaEditar(undefined);
    setTriggerRefetch(!triggerRefetch);
    setModo('lista');
  };

  const handleVoltar = () => {
    setAgendamentoParaEditar(undefined);
    setModo('lista');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Agendamentos</h1>
      <div className="space-y-6">
        {modo === 'lista' ? (
          <AgendamentoList 
            onEditAgendamento={handleEditAgendamento}
            onNovoAgendamento={handleNovoAgendamento}
            triggerRefetch={triggerRefetch}
          />
        ) : (
          <AgendamentoForm 
            agendamentoParaEditar={agendamentoParaEditar} 
            onAgendamentoSalvo={handleAgendamentoSalvo}
            onVoltar={handleVoltar}
          />
        )}
      </div>
    </div>
  );
}
