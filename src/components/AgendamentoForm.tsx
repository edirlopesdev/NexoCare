import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea"
import { useToast } from "./ui/use-toast";
import { supabase } from '../supabaseClient';
import { Agendamento } from '../types/supabase-types';
import { SaveIcon, ArrowLeft } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

const agendamentoSchema = z.object({
  empresa_id: z.string().uuid("ID da empresa inválido"),
  usuario_id: z.string().uuid("ID do usuário inválido"),
  cliente_id: z.string().uuid("ID do cliente inválido"),
  data_agendamento: z.string().min(1, "Data do agendamento é obrigatória"),
  tipo_servico: z.string().min(1, "Tipo de serviço é obrigatório"),
  status: z.enum(['pendente', 'confirmado', 'cancelado']),
  observacoes: z.string().nullable(),
});

type AgendamentoFormValues = z.infer<typeof agendamentoSchema>;

interface AgendamentoFormProps {
  agendamentoParaEditar?: Agendamento;
  onAgendamentoSalvo: () => void;
  onVoltar: () => void;
}

export function AgendamentoForm({ agendamentoParaEditar, onAgendamentoSalvo, onVoltar }: AgendamentoFormProps) {
  const { toast } = useToast();
  const { empresaId, user } = useAuth();
  
  const form = useForm<AgendamentoFormValues>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      empresa_id: empresaId || "",
      usuario_id: user?.id || "",
      status: 'pendente',
      cliente_id: '',
      tipo_servico: '',
      observacoes: '',
      data_agendamento: '',
    },
  });

  // Este useEffect mantém o empresa_id e usuario_id atualizados
  useEffect(() => {
    if (empresaId) {
      form.setValue('empresa_id', empresaId);
    }
    if (user?.id) {
      form.setValue('usuario_id', user.id);
    }
  }, [empresaId, user, form]);

  // Este useEffect lida com a edição de agendamentos
  useEffect(() => {
    if (agendamentoParaEditar) {
      const dataAgendamento = new Date(agendamentoParaEditar.data_agendamento);
      const formattedDate = dataAgendamento.toISOString().slice(0, 16);

      form.reset({
        empresa_id: empresaId || "",
        usuario_id: user?.id || "",
        cliente_id: agendamentoParaEditar.cliente_id,
        data_agendamento: formattedDate,
        tipo_servico: agendamentoParaEditar.tipo_servico || '',
        status: agendamentoParaEditar.status as 'pendente' | 'confirmado' | 'cancelado',
        observacoes: agendamentoParaEditar.observacoes || '',
      });
    }
  }, [agendamentoParaEditar, empresaId, user, form]);

  const onSubmit = async (data: AgendamentoFormValues) => {
    if (!empresaId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      const agendamentoData = {
        ...data,
        empresa_id: empresaId,
        usuario_id: user?.id,
      };

      let result;
      if (agendamentoParaEditar) {
        result = await supabase
          .from('agendamentos')
          .update(agendamentoData)
          .eq('id', agendamentoParaEditar.id)
          .single();
      } else {
        result = await supabase
          .from('agendamentos')
          .insert(agendamentoData)
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: agendamentoParaEditar ? "Agendamento atualizado" : "Agendamento criado",
        description: agendamentoParaEditar ? "O agendamento foi atualizado com sucesso." : "O agendamento foi criado com sucesso.",
      });

      // Não resetar o formulário completamente, apenas os campos de dados
      form.reset({
        empresa_id: empresaId,
        usuario_id: user?.id || "",
        cliente_id: "",
        data_agendamento: "",
        tipo_servico: "",
        status: "pendente",
        observacoes: "",
      });
      
      onAgendamentoSalvo();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao ${agendamentoParaEditar ? 'atualizar' : 'criar'} o agendamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{agendamentoParaEditar ? 'Editar Agendamento' : 'Novo Agendamento'}</CardTitle>
          <CardDescription>{agendamentoParaEditar ? 'Edite os dados do agendamento.' : 'Crie um novo agendamento.'}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="hidden" {...form.register("empresa_id")} />
            <Input type="hidden" {...form.register("usuario_id")} />
            <div>
              <Label htmlFor="cliente_id">Cliente</Label>
              <Input id="cliente_id" {...form.register("cliente_id")} />
              {form.formState.errors.cliente_id && (
                <p className="text-red-500">{form.formState.errors.cliente_id.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="data_agendamento">Data do Agendamento</Label>
              <Input id="data_agendamento" type="datetime-local" {...form.register("data_agendamento")} />
              {form.formState.errors.data_agendamento && (
                <p className="text-red-500">{form.formState.errors.data_agendamento.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="tipo_servico">Tipo de Serviço</Label>
              <Input id="tipo_servico" {...form.register("tipo_servico")} />
              {form.formState.errors.tipo_servico && (
                <p className="text-red-500">{form.formState.errors.tipo_servico.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.status && (
                <p className="text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" {...form.register("observacoes")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="destructive" onClick={onVoltar}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button type="submit">
              <SaveIcon className="w-4 h-4 mr-2" />
              {agendamentoParaEditar ? 'Atualizar Agendamento' : 'Cadastrar Agendamento'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
