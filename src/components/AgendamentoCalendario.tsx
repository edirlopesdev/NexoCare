import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Agendamento } from '../types/supabase-types';

interface AgendamentoCalendarioProps {
  onAgendamentoSalvo: () => void;
}

export function AgendamentoCalendario({ onAgendamentoSalvo }: AgendamentoCalendarioProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ data: Date; horario: string } | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const { toast } = useToast();
  const { empresaId, user } = useAuth();

  const horarios = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Gera os dias da semana a partir da data atual
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
    return addDays(startDate, i);
  });

  useEffect(() => {
    if (empresaId) {
      fetchAgendamentos();
    }
  }, [empresaId, currentDate]);

  const fetchAgendamentos = async () => {
    try {
      const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 0 });
      const endOfWeekDate = addDays(startOfWeekDate, 6);

      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clientes (
            nome
          )
        `)
        .eq('empresa_id', empresaId)
        .gte('data_agendamento', startOfWeekDate.toISOString())
        .lte('data_agendamento', endOfWeekDate.toISOString());

      if (error) throw error;
      setAgendamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const handleTimeClick = (data: Date, horario: string) => {
    setSelectedSlot({ data, horario });
    setIsModalOpen(true);
  };

  const handlePreviousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const getAgendamentosForSlot = (data: Date, horario: string) => {
    return agendamentos.filter(agendamento => {
      const agendamentoDate = new Date(agendamento.data_agendamento);
      return (
        isSameDay(agendamentoDate, data) &&
        format(agendamentoDate, 'HH:mm') === horario
      );
    });
  };

  return (
    <Card className="h-[calc(100vh-8rem)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <Button variant="ghost" className="px-3 py-1">Dia</Button>
            <Button variant="secondary" className="px-3 py-1">Semana</Button>
            <Button variant="ghost" className="px-3 py-1">Mês</Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + Novo Agendamento
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex h-[calc(100%-5rem)] pt-4">
        {/* Coluna de horários */}
        <div className="w-20 pt-14"> {/* pt-14 para alinhar com o cabeçalho dos dias */}
          {horarios.map((horario) => (
            <div
              key={horario}
              className="h-14 flex items-center justify-end pr-2 text-sm text-gray-500"
            >
              {horario}
            </div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div className="flex-1 border rounded-lg bg-white overflow-hidden">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 border-b">
            {diasSemana.map((dia, index) => (
              <div 
                key={index} 
                className="px-4 py-3 text-center border-r last:border-r-0"
              >
                <div className="font-medium">
                  {format(dia, 'EEE', { locale: ptBR })}
                </div>
                <div className="text-sm text-gray-500">
                  {format(dia, 'dd/MM')}
                </div>
              </div>
            ))}
          </div>

          {/* Grade de horários */}
          <div className="relative">
            {horarios.map((horario) => (
              <div key={horario} className="grid grid-cols-7">
                {diasSemana.map((dia, diaIndex) => {
                  const agendamentosDoHorario = getAgendamentosForSlot(dia, horario);
                  
                  return (
                    <div
                      key={`${dia}-${horario}`}
                      className="h-14 border-r border-b last:border-r-0 relative group cursor-pointer 
                        hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => handleTimeClick(dia, horario)}
                    >
                      {/* Indicador de hover */}
                      <div className="absolute inset-0 bg-blue-100/0 group-hover:bg-blue-100/10 
                        transition-colors duration-200 pointer-events-none" />
                      
                      {/* Ícone de adicionar no hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 
                        group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-blue-100/50 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>

                      {agendamentosDoHorario.map((agendamento) => (
                        <div
                          key={agendamento.id}
                          className="absolute inset-x-0 mx-1 p-1 text-xs bg-blue-100 text-blue-800 
                            rounded truncate hover:bg-blue-200 transition-colors duration-200
                            hover:shadow-md hover:-translate-y-[2px] transform cursor-pointer
                            z-10"
                          title={(agendamento as any).clientes?.nome || 'Cliente não encontrado'}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Aqui você pode adicionar a lógica para editar o agendamento existente
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{(agendamento as any).clientes?.nome || 'Cliente não encontrado'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Modal lateral */}
      {isModalOpen && (
        <div className="fixed right-0 top-0 h-screen w-96 border-l bg-white shadow-lg overflow-y-auto z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Novo Agendamento</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {selectedSlot && (
              <div>
                <Label>Horário Selecionado</Label>
                <div className="text-sm text-gray-600">
                  {format(selectedSlot.data, "dd/MM/yyyy")} às {selectedSlot.horario}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="cliente">Paciente</Label>
              <Input id="cliente" placeholder="Nome do paciente" />
            </div>

            <div>
              <Label htmlFor="tipo_consulta">Tipo de Consulta</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="z-[60] bg-white">
                  <SelectItem 
                    value="primeira_consulta"
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-100"
                  >
                    Primeira Consulta
                  </SelectItem>
                  <SelectItem 
                    value="retorno"
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-100"
                  >
                    Retorno
                  </SelectItem>
                  <SelectItem 
                    value="exame"
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-100"
                  >
                    Exame
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="especialidade">Especialidade</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent className="z-[60] bg-white">
                  <SelectItem 
                    value="clinico_geral"
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-100"
                  >
                    Clínico Geral
                  </SelectItem>
                  <SelectItem 
                    value="cardiologia"
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-100"
                  >
                    Cardiologia
                  </SelectItem>
                  <SelectItem 
                    value="dermatologia"
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-100"
                  >
                    Dermatologia
                  </SelectItem>
                  <SelectItem 
                    value="ortopedia"
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-100"
                  >
                    Ortopedia
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="profissional">Profissional</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent className="z-[60] bg-white">
                  <SelectItem 
                    value="dra_ana"
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-100"
                  >
                    Dra. Ana Silva
                  </SelectItem>
                  <SelectItem 
                    value="dr_carlos"
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-100"
                  >
                    Dr. Carlos Santos
                  </SelectItem>
                  <SelectItem 
                    value="dra_maria"
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-100"
                  >
                    Dra. Maria Oliveira
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes" 
                placeholder="Observações adicionais..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Confirmar Agendamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 