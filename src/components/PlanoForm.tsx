import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { supabase } from '../supabaseClient';
import { Plano } from '../types/supabase-types';
import { MultiSelect } from "./ui/multi-select";
import { SaveIcon, ArrowLeft } from "lucide-react";

const recursosDisponiveis = [
  { value: "agendamentos", label: "Agendamentos" },
  { value: "clientes", label: "Gerenciamento de Clientes" },
  { value: "historico_coloracao", label: "Histórico de Coloração" },
  { value: "relatorios", label: "Relatórios" },
  { value: "multiplas_unidades", label: "Suporte a Múltiplas Unidades" },
];

const planoSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  max_usuarios: z.number().int().positive("O número máximo de usuários deve ser positivo"),
  recursos: z.array(z.string()).min(1, "Selecione pelo menos um recurso"),
  preco: z.number().positive("O preço deve ser positivo"),
});

type PlanoFormValues = Omit<Plano, 'id' | 'criado_em'> & { recursos: string[] };

interface PlanoFormProps {
  planoParaEditar?: Plano;
  onPlanoSalvo: () => void;
  onVoltar: () => void;
}

export function PlanoForm({ planoParaEditar, onPlanoSalvo, onVoltar }: PlanoFormProps) {
  const { toast } = useToast();
  const form = useForm<PlanoFormValues>({
    resolver: zodResolver(planoSchema),
    defaultValues: planoParaEditar 
      ? { ...planoParaEditar, recursos: Object.keys(planoParaEditar.recursos) }
      : {
          nome: "",
          max_usuarios: 1,
          recursos: [],
          preco: 0,
        },
  });

  const onSubmit = async (data: PlanoFormValues) => {
    console.log("Dados do formulário:", data);
    try {
      const dataToSubmit = {
        ...data,
        recursos: data.recursos.reduce<Record<string, boolean>>((acc, val) => {
          acc[val] = true;
          return acc;
        }, {}),
      };

      let result;
      if (planoParaEditar) {
        result = await supabase
          .from('planos')
          .update(dataToSubmit)
          .eq('id', planoParaEditar.id)
          .single();
      } else {
        result = await supabase
          .from('planos')
          .insert(dataToSubmit)
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: planoParaEditar ? "Plano atualizado" : "Plano criado",
        description: planoParaEditar ? "O plano foi atualizado com sucesso." : "O plano foi criado com sucesso.",
      });

      form.reset();
      onPlanoSalvo();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao ${planoParaEditar ? 'atualizar' : 'criar'} o plano: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{planoParaEditar ? 'Editar Plano' : 'Novo Plano'}</CardTitle>
          <CardDescription>{planoParaEditar ? 'Edite os dados do plano.' : 'Crie um novo plano de assinatura.'}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Plano</Label>
              <Input id="nome" {...form.register("nome")} />
            </div>
            <div>
              <Label htmlFor="max_usuarios">Máximo de Usuários</Label>
              <Input id="max_usuarios" type="number" {...form.register("max_usuarios", { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="preco">Preço</Label>
              <Input id="preco" type="number" step="0.01" {...form.register("preco", { valueAsNumber: true })} />
            </div>
          </div>
          <div>
            <Label htmlFor="recursos">Recursos</Label>
            <Controller
              name="recursos"
              control={form.control}
              render={({ field }) => (
                <MultiSelect
                  options={recursosDisponiveis}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="destructive" onClick={onVoltar}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button type="submit">
              <SaveIcon className="w-4 h-4 mr-2" />
              {planoParaEditar ? 'Atualizar Plano' : 'Cadastrar Plano'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
