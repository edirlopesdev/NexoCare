import React, { useState } from 'react';
import { PlanoForm } from '../components/PlanoForm';
import { PlanoList } from '../components/PlanoList';
import { Plano } from '../types/supabase-types';

type ModoFormulario = 'lista' | 'novo' | 'edicao';

export function PlanosPage() {
  const [planoParaEditar, setPlanoParaEditar] = useState<Plano | undefined>(undefined);
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const [modo, setModo] = useState<ModoFormulario>('lista');

  const handleEditPlano = (plano: Plano) => {
    setPlanoParaEditar(plano);
    setModo('edicao');
  };

  const handleNovoPlano = () => {
    setPlanoParaEditar(undefined);
    setModo('novo');
  };

  const handlePlanoSalvo = () => {
    setPlanoParaEditar(undefined);
    setTriggerRefetch(!triggerRefetch);
    setModo('lista');
  };

  const handleVoltar = () => {
    setPlanoParaEditar(undefined);
    setModo('lista');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Planos</h1>
      <div className="space-y-6">
        {modo === 'lista' ? (
          <PlanoList 
            onEditPlano={handleEditPlano}
            onNovoPlano={handleNovoPlano}
            triggerRefetch={triggerRefetch}
          />
        ) : (
          <PlanoForm 
            planoParaEditar={planoParaEditar} 
            onPlanoSalvo={handlePlanoSalvo}
            onVoltar={handleVoltar}
          />
        )}
      </div>
    </div>
  );
}
