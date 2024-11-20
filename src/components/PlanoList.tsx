import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from "./ui/button";
import { Plano } from '../types/supabase-types';
import { useToast } from "./ui/use-toast";

interface PlanoListProps {
  onEditPlano: (plano: Plano) => void;
  onNovoPlano: () => void;
  triggerRefetch: boolean;
}

export function PlanoList({ onEditPlano, onNovoPlano, triggerRefetch }: PlanoListProps) {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlanos();
  }, [triggerRefetch]);

  async function fetchPlanos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('planos')
        .select('*');

      if (error) throw error;
      setPlanos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar os planos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Plano excluído",
        description: "O plano foi excluído com sucesso.",
      });

      fetchPlanos();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o plano.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lista de Planos</CardTitle>
        <Button onClick={onNovoPlano}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Incluir
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando planos...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Máx. Usuários</TableHead>
                  <TableHead className="font-semibold">Preço</TableHead>
                  <TableHead className="font-semibold">Recursos</TableHead>
                  <TableHead className="font-semibold text-right pr-9">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planos.map((plano) => (
                  <TableRow key={plano.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{plano.nome}</TableCell>
                    <TableCell>{plano.max_usuarios}</TableCell>
                    <TableCell>R$ {plano.preco.toFixed(2)}</TableCell>
                    <TableCell>{Object.keys(plano.recursos).join(', ')}</TableCell>
                    <TableCell className="text-right pr-2">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditPlano(plano)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(plano.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {planos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      Nenhum plano cadastrado
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
