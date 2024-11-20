import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { supabase } from '../supabaseClient';
import { Produto } from '../types/supabase-types';
import { SaveIcon, ArrowLeft } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

const produtoSchema = z.object({
  empresa_id: z.string().uuid(),
  nome: z.string().min(1, "O nome é obrigatório"),
  marca: z.string().min(1, "A marca é obrigatória"),
  tipo: z.string().min(1, "O tipo é obrigatório"),
  codigo_cor: z.string().nullable(),
});

type ProdutoFormValues = Omit<Produto, 'id' | 'criado_em'>;

interface ProdutoFormProps {
  produtoParaEditar?: Produto;
  onProdutoSalvo: () => void;
  onVoltar: () => void;
}

export function ProdutoForm({ produtoParaEditar, onProdutoSalvo, onVoltar }: ProdutoFormProps) {
  const { toast } = useToast();
  const { empresaId } = useAuth();
  
  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      empresa_id: empresaId || "",
      nome: "",
      marca: "",
      tipo: "",
      codigo_cor: "",
    },
  });

  // Este useEffect mantém o empresa_id atualizado
  useEffect(() => {
    if (empresaId) {
      form.setValue('empresa_id', empresaId);
    }
  }, [empresaId, form]);

  // Este useEffect lida com a edição de produtos
  useEffect(() => {
    if (produtoParaEditar) {
      form.reset({
        empresa_id: empresaId || "", // Usar o empresaId do contexto
        nome: produtoParaEditar.nome,
        marca: produtoParaEditar.marca,
        tipo: produtoParaEditar.tipo,
        codigo_cor: produtoParaEditar.codigo_cor || "",
      });
    }
  }, [produtoParaEditar, empresaId, form]);

  const onSubmit = async (data: ProdutoFormValues) => {
    if (!empresaId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      const produtoData = {
        ...data,
        empresa_id: empresaId, // Garantir que está usando o empresaId correto
      };

      let result;
      if (produtoParaEditar) {
        result = await supabase
          .from('produtos')
          .update(produtoData)
          .eq('id', produtoParaEditar.id)
          .single();
      } else {
        result = await supabase
          .from('produtos')
          .insert(produtoData)
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: produtoParaEditar ? "Produto atualizado" : "Produto criado",
        description: produtoParaEditar ? "O produto foi atualizado com sucesso." : "O produto foi criado com sucesso.",
      });

      // Não resetar o formulário completamente, apenas os campos de dados
      form.reset({
        empresa_id: empresaId,
        nome: "",
        marca: "",
        tipo: "",
        codigo_cor: "",
      });
      
      onProdutoSalvo();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao ${produtoParaEditar ? 'atualizar' : 'criar'} o produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{produtoParaEditar ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
          <CardDescription>{produtoParaEditar ? 'Edite os dados do produto.' : 'Adicione um novo produto ao catálogo.'}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="hidden" {...form.register("empresa_id")} />
            <div>
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input id="nome" {...form.register("nome")} />
            </div>
            <div>
              <Label htmlFor="marca">Marca</Label>
              <Input id="marca" {...form.register("marca")} />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Input id="tipo" {...form.register("tipo")} />
            </div>
            <div>
              <Label htmlFor="codigo_cor">Código da Cor</Label>
              <Input id="codigo_cor" {...form.register("codigo_cor")} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="destructive" onClick={onVoltar}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button type="submit">
              <SaveIcon className="w-4 h-4 mr-2" />
              {produtoParaEditar ? 'Atualizar Produto' : 'Cadastrar Produto'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
