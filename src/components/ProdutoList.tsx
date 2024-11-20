import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from "./ui/button";
import { Produto } from '../types/supabase-types';
import { useToast } from "./ui/use-toast";
import { useAuth } from '../contexts/AuthContext';

interface ProdutoListProps {
  onEditProduto: (produto: Produto) => void;
  onNovoProduto: () => void;
  triggerRefetch: boolean;
}

export function ProdutoList({ onEditProduto, onNovoProduto, triggerRefetch }: ProdutoListProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { empresaId, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && empresaId) {
      fetchProdutos();
    }
  }, [triggerRefetch, empresaId, authLoading]);

  async function fetchProdutos() {
    if (!empresaId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar os produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });

      fetchProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o produto.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lista de Produtos</CardTitle>
        <Button onClick={onNovoProduto} disabled={!empresaId}>
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
          <p>Carregando produtos...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Marca</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Código da Cor</TableHead>
                  <TableHead className="font-semibold text-right pr-9">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>{produto.marca}</TableCell>
                    <TableCell>{produto.tipo}</TableCell>
                    <TableCell>{produto.codigo_cor || '-'}</TableCell>
                    <TableCell className="text-right pr-2">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditProduto(produto)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(produto.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {produtos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      Nenhum produto cadastrado
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
