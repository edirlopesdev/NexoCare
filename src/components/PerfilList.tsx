import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from "./ui/button";
import { Perfil } from '../types/supabase-types';
import { useToast } from "./ui/use-toast";

interface PerfilListProps {
  onEditPerfil: (perfil: Perfil) => void;
  onNovoPerfil: () => void;
  triggerRefetch: boolean;
}

export function PerfilList({ onEditPerfil, onNovoPerfil, triggerRefetch }: PerfilListProps) {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPerfis();
  }, [triggerRefetch]);

  async function fetchPerfis() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('perfis')
        .select('*');

      if (error) throw error;
      setPerfis(data || []);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar os perfis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('perfis')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Perfil excluído",
        description: "O perfil foi excluído com sucesso.",
      });

      fetchPerfis();
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o perfil.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lista de Perfis</CardTitle>
        <Button onClick={onNovoPerfil}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Incluir
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando perfis...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Cargo</TableHead>
                  <TableHead className="font-semibold">Criado em</TableHead>
                  <TableHead className="font-semibold text-right pr-9">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perfis.map((perfil) => (
                  <TableRow key={perfil.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{perfil.nome}</TableCell>
                    <TableCell>{perfil.cargo}</TableCell>
                    <TableCell>{perfil.criado_em ? new Date(perfil.criado_em).toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-right pr-2">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditPerfil(perfil)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(perfil.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {perfis.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      Nenhum perfil cadastrado
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
