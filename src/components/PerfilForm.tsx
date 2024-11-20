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
import { Perfil } from '../types/supabase-types';
import { SaveIcon, ArrowLeft } from "lucide-react";

const perfilSchema = z.object({
  id: z.string().uuid(),
  empresa_id: z.string().uuid(),
  nome: z.string().min(1, "O nome é obrigatório"),
  cargo: z.string().min(1, "O cargo é obrigatório"),
});

type PerfilFormValues = Omit<Perfil, 'criado_em'>;

interface PerfilFormProps {
  perfilParaEditar?: Perfil;
  onPerfilSalvo: () => void;
  onVoltar: () => void;
}

export function PerfilForm({ perfilParaEditar, onPerfilSalvo, onVoltar }: PerfilFormProps) {
  const { toast } = useToast();
  const form = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      id: "",
      empresa_id: "",
      nome: "",
      cargo: "",
    },
  });

  useEffect(() => {
    if (perfilParaEditar) {
      form.reset({
        id: perfilParaEditar.id,
        empresa_id: perfilParaEditar.empresa_id,
        nome: perfilParaEditar.nome,
        cargo: perfilParaEditar.cargo,
      });
    } else {
      form.reset({
        id: "",
        empresa_id: "",
        nome: "",
        cargo: "",
      });
    }
  }, [perfilParaEditar, form]);

  const onSubmit = async (data: PerfilFormValues) => {
    try {
      let result;
      if (perfilParaEditar) {
        result = await supabase
          .from('perfis')
          .update(data)
          .eq('id', perfilParaEditar.id)
          .single();
      } else {
        result = await supabase
          .from('perfis')
          .insert(data)
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: perfilParaEditar ? "Perfil atualizado" : "Perfil criado",
        description: perfilParaEditar ? "O perfil foi atualizado com sucesso." : "O perfil foi criado com sucesso.",
      });

      form.reset();
      onPerfilSalvo();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao ${perfilParaEditar ? 'atualizar' : 'criar'} o perfil: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{perfilParaEditar ? 'Editar Perfil' : 'Novo Perfil'}</CardTitle>
          <CardDescription>{perfilParaEditar ? 'Edite os dados do perfil.' : 'Crie um novo perfil de usuário.'}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id">ID do Usuário</Label>
              <Input id="id" {...form.register("id")} />
              {form.formState.errors.id && (
                <p className="text-red-500">{form.formState.errors.id.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="empresa_id">Empresa</Label>
              <Input id="empresa_id" {...form.register("empresa_id")} />
              {form.formState.errors.empresa_id && (
                <p className="text-red-500">{form.formState.errors.empresa_id.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" {...form.register("nome")} />
              {form.formState.errors.nome && (
                <p className="text-red-500">{form.formState.errors.nome.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cargo">Cargo</Label>
              <Input id="cargo" {...form.register("cargo")} />
              {form.formState.errors.cargo && (
                <p className="text-red-500">{form.formState.errors.cargo.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="destructive" onClick={onVoltar}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button type="submit">
              <SaveIcon className="w-4 h-4 mr-2" />
              {perfilParaEditar ? 'Atualizar Perfil' : 'Cadastrar Perfil'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
