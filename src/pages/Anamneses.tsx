import React, { useState } from 'react';
import { AnamneseForm } from '../components/AnamneseForm';
import { AnamneseList } from '../components/AnamneseList';
import { Anamnese } from '../types/supabase-types';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ModoFormulario = 'lista' | 'novo' | 'visualizar';

export function AnamnesesPage() {
  const [modo, setModo] = useState<ModoFormulario>('lista');
  const [anamneseParaVisualizar, setAnamneseParaVisualizar] = useState<Anamnese | undefined>();
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pacienteNome = location.state?.pacienteNome;

  const handleNovaAnamnese = () => {
    setAnamneseParaVisualizar(undefined);
    setModo('novo');
  };

  const handleVerAnamnese = (anamnese: Anamnese) => {
    setAnamneseParaVisualizar(anamnese);
    setModo('visualizar');
  };

  const handleAnamnaseSalva = () => {
    setTriggerRefetch(!triggerRefetch);
    setModo('lista');
  };

  const handleVoltar = () => {
    setModo('lista');
  };

  const handleVoltarParaPacientes = () => {
    navigate('/pacientes');
  };

  if (!pacienteId || !pacienteNome) {
    return <div className="p-6">Paciente não identificado</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Anamneses</h1>
      <div className="space-y-6">
        {modo === 'lista' ? (
          <AnamneseList
            pacienteId={pacienteId}
            pacienteNome={pacienteNome}
            onNovaAnamnese={handleNovaAnamnese}
            onVerAnamnese={handleVerAnamnese}
            triggerRefetch={triggerRefetch}
            onVoltar={handleVoltarParaPacientes}
          />
        ) : (
          <AnamneseForm
            pacienteId={pacienteId}
            pacienteNome={pacienteNome}
            onAnamnaseSalva={handleAnamnaseSalva}
            onVoltar={handleVoltar}
          />
        )}
      </div>
    </div>
  );
} 