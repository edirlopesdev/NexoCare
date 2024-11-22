import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Edit, Trash2, PlusCircle, FileText } from 'lucide-react';
import { Button } from "./ui/button";
import { Cliente as Paciente } from '../types/supabase-types';
import { useToast } from "./ui/use-toast";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PacienteListProps {
  onEditPaciente: (paciente: Paciente) => void;
  onNovoPaciente: () => void;
  triggerRefetch: boolean;
}

export function PacienteList({ onEditPaciente, onNovoPaciente, triggerRefetch }: PacienteListProps) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { empresaId, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && empresaId) {
      fetchPacientes();
    }
  }, [triggerRefetch, empresaId, authLoading]);

  async function fetchPacientes() {
    if (!empresaId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('nome');

      if (error) throw error;
      setPacientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar os pacientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Paciente excluído",
        description: "O paciente foi excluído com sucesso.",
      });

      fetchPacientes();
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o paciente.",
        variant: "destructive",
      });
    }
  };

  const handleVerAnamneses = (paciente: Paciente) => {
    navigate(`/pacientes/${paciente.id}/anamneses`, {
      state: { pacienteNome: paciente.nome }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lista de Pacientes</CardTitle>
        <Button onClick={onNovoPaciente} disabled={!empresaId}>
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
          <p>Carregando pacientes...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">CPF</TableHead>
                  <TableHead className="font-semibold">Telefone</TableHead>
                  <TableHead className="font-semibold">Convênio</TableHead>
                  <TableHead className="font-semibold text-right pr-9">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientes.map((paciente) => (
                  <TableRow key={paciente.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{paciente.nome}</TableCell>
                    <TableCell>{paciente.cpf || '-'}</TableCell>
                    <TableCell>{paciente.telefone || '-'}</TableCell>
                    <TableCell>{paciente.convenio || '-'}</TableCell>
                    <TableCell className="text-right pr-2">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerAnamneses(paciente)}
                        >
                          <FileText size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditPaciente(paciente)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(paciente.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {pacientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      Nenhum paciente cadastrado
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
