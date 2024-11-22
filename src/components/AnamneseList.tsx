import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Eye, PlusCircle, ArrowLeft } from 'lucide-react';
import { Button } from "./ui/button";
import { Anamnese } from '../types/supabase-types';
import { useToast } from "./ui/use-toast";
import { useAuth } from '../contexts/AuthContext';

interface AnamneseListProps {
  pacienteId: string;
  pacienteNome: string;
  onNovaAnamnese: () => void;
  onVerAnamnese: (anamnese: Anamnese) => void;
  onVoltar: () => void;
  triggerRefetch: boolean;
}

export function AnamneseList({ 
  pacienteId, 
  pacienteNome,
  onNovaAnamnese, 
  onVerAnamnese,
  onVoltar,
  triggerRefetch 
}: AnamneseListProps) {
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { empresaId } = useAuth();

  useEffect(() => {
    if (empresaId && pacienteId) {
      fetchAnamneses();
    }
  }, [triggerRefetch, empresaId, pacienteId]);

  async function fetchAnamneses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('anamneses')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('paciente_id', pacienteId)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setAnamneses(data || []);
    } catch (error) {
      console.error('Erro ao buscar anamneses:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar as anamneses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Histórico de Anamneses</CardTitle>
          <CardDescription>Paciente: {pacienteNome}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onVoltar}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={onNovaAnamnese}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova Anamnese
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-4">Carregando anamneses...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold">Queixa Principal</TableHead>
                  <TableHead className="font-semibold">História da Doença</TableHead>
                  <TableHead className="font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anamneses.map((anamnese) => (
                  <TableRow key={anamnese.id} className="hover:bg-gray-50">
                    <TableCell>
                      {new Date(anamnese.criado_em).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{anamnese.queixa_principal}</TableCell>
                    <TableCell>{anamnese.historia_doenca}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVerAnamnese(anamnese)}
                      >
                        <Eye size={16} className="mr-2" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {anamneses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      Nenhuma anamnese registrada
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