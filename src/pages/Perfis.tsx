import React, { useState } from 'react';
import { PerfilForm } from '../components/PerfilForm';
import { PerfilList } from '../components/PerfilList';
import { Perfil } from '../types/supabase-types';

type ModoFormulario = 'lista' | 'novo' | 'edicao';

export function PerfisPage() {
  const [perfilParaEditar, setPerfilParaEditar] = useState<Perfil | undefined>(undefined);
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const [modo, setModo] = useState<ModoFormulario>('lista');

  const handleEditPerfil = (perfil: Perfil) => {
    setPerfilParaEditar(perfil);
    setModo('edicao');
  };

  const handleNovoPerfil = () => {
    setPerfilParaEditar(undefined);
    setModo('novo');
  };

  const handlePerfilSalvo = () => {
    setPerfilParaEditar(undefined);
    setTriggerRefetch(!triggerRefetch);
    setModo('lista');
  };

  const handleVoltar = () => {
    setPerfilParaEditar(undefined);
    setModo('lista');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Perfis</h1>
      <div className="space-y-6">
        {modo === 'lista' ? (
          <PerfilList 
            onEditPerfil={handleEditPerfil}
            onNovoPerfil={handleNovoPerfil}
            triggerRefetch={triggerRefetch}
          />
        ) : (
          <PerfilForm 
            perfilParaEditar={perfilParaEditar} 
            onPerfilSalvo={handlePerfilSalvo}
            onVoltar={handleVoltar}
          />
        )}
      </div>
    </div>
  );
}
