import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from "./ui/button";
import { Agendamento } from '../types/supabase-types';
import { useToast } from "./ui/use-toast";
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentoListProps {
  onEditAgendamento: (agendamento: Agendamento) => void;
  onNovoAgendamento: () => void;
  triggerRefetch: boolean;
}

export function AgendamentoList({ onEditAgendamento, onNovoAgendamento, triggerRefetch }: AgendamentoListProps) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { empresaId, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && empresaId) {
      fetchAgendamentos();
    }
  }, [triggerRefetch, empresaId, authLoading]);

  async function fetchAgendamentos() {
    if (!empresaId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clientes (
            nome
          )
        `)
        .eq('empresa_id', empresaId)
        .order('data_agendamento', { ascending: true });

      if (error) throw error;
      setAgendamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso.",
      });

      fetchAgendamentos();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o agendamento.",
        variant: "destructive",
      });
    }
  };

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'text-green-600';
      case 'cancelado':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lista de Agendamentos</CardTitle>
        <Button onClick={onNovoAgendamento} disabled={!empresaId}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Incluir
        </Button>
      </CardHeader>
      <CardContent>
        {authLoading ? (
          <p>Carregando autenticação...</p>
        ) : !empresaId ? (
          <p>Empresa não identificada</p>
        ) : loading ? (
          <p>Carregando agendamentos...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Data/Hora</TableHead>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Serviço</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Observações</TableHead>
                  <TableHead className="font-semibold text-right pr-9">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendamentos.map((agendamento) => (
                  <TableRow key={agendamento.id} className="hover:bg-gray-50">
                    <TableCell>{formatarData(agendamento.data_agendamento)}</TableCell>
                    <TableCell className="font-medium">
                      {(agendamento as any).clientes?.nome || 'Cliente não encontrado'}
                    </TableCell>
                    <TableCell>{agendamento.tipo_servico}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(agendamento.status || '')}>
                        {agendamento.status ? agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1) : '-'}
                      </span>
                    </TableCell>
                    <TableCell>{agendamento.observacoes || '-'}</TableCell>
                    <TableCell className="text-right pr-2">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditAgendamento(agendamento)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(agendamento.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {agendamentos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      Nenhum agendamento cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
