import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { supabase } from '../supabaseClient';
import { Cliente } from '../types/supabase-types';
import { SaveIcon, ArrowLeft } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

const pacienteSchema = z.object({
  empresa_id: z.string().uuid(),
  nome: z.string().min(1, "O nome é obrigatório"),
  data_nascimento: z.string().min(1, "A data de nascimento é obrigatória"),
  cpf: z.string().min(1, "O CPF é obrigatório"),
  rg: z.string().nullable(),
  sexo: z.enum(["masculino", "feminino"]),
  estado_civil: z.enum(["solteiro", "casado", "divorciado", "viuvo"]).nullable(),
  profissao: z.string().nullable(),
  telefone: z.string().min(1, "O telefone é obrigatório"),
  telefone_secundario: z.string().nullable(),
  email: z.string().email().nullable(),
  cep: z.string().min(1, "O CEP é obrigatório"),
  endereco: z.string().min(1, "O endereço é obrigatório"),
  numero: z.string().min(1, "O número é obrigatório"),
  complemento: z.string().nullable(),
  bairro: z.string().min(1, "O bairro é obrigatório"),
  cidade: z.string().min(1, "A cidade é obrigatória"),
  convenio: z.string().nullable(),
  numero_carteirinha: z.string().nullable(),
  validade_carteirinha: z.string().nullable(),
  contato_emergencia: z.string().nullable(),
  telefone_emergencia: z.string().nullable(),
  observacoes: z.string().nullable(),
});

type PacienteFormValues = Omit<Cliente, 'id' | 'criado_em'>;

interface PacienteFormProps {
  pacienteParaEditar?: Cliente;
  onPacienteSalvo: () => void;
  onVoltar: () => void;
}

export function PacienteForm({ pacienteParaEditar, onPacienteSalvo, onVoltar }: PacienteFormProps) {
  const { toast } = useToast();
  const { empresaId } = useAuth();
  const [activeTab, setActiveTab] = useState('dados');
  
  const form = useForm<PacienteFormValues>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      empresa_id: empresaId || "",
      nome: "",
      data_nascimento: "",
      cpf: "",
      rg: null,
      sexo: "masculino",
      estado_civil: null,
      profissao: null,
      telefone: "",
      telefone_secundario: null,
      email: null,
      cep: "",
      endereco: "",
      numero: "",
      complemento: null,
      bairro: "",
      cidade: "",
      convenio: null,
      numero_carteirinha: null,
      validade_carteirinha: null,
      contato_emergencia: null,
      telefone_emergencia: null,
      observacoes: null,
    },
  });

  // Este useEffect mantém o empresa_id atualizado
  useEffect(() => {
    if (empresaId) {
      form.setValue('empresa_id', empresaId);
    }
  }, [empresaId, form]);

  // Este useEffect lida com a edição de pacientes
  useEffect(() => {
    if (pacienteParaEditar) {
      form.reset({
        empresa_id: empresaId || "",
        nome: pacienteParaEditar.nome,
        data_nascimento: pacienteParaEditar.data_nascimento,
        cpf: pacienteParaEditar.cpf,
        rg: pacienteParaEditar.rg,
        sexo: pacienteParaEditar.sexo,
        estado_civil: pacienteParaEditar.estado_civil,
        profissao: pacienteParaEditar.profissao,
        telefone: pacienteParaEditar.telefone,
        telefone_secundario: pacienteParaEditar.telefone_secundario,
        email: pacienteParaEditar.email,
        cep: pacienteParaEditar.cep,
        endereco: pacienteParaEditar.endereco,
        numero: pacienteParaEditar.numero,
        complemento: pacienteParaEditar.complemento,
        bairro: pacienteParaEditar.bairro,
        cidade: pacienteParaEditar.cidade,
        convenio: pacienteParaEditar.convenio,
        numero_carteirinha: pacienteParaEditar.numero_carteirinha,
        validade_carteirinha: pacienteParaEditar.validade_carteirinha,
        contato_emergencia: pacienteParaEditar.contato_emergencia,
        telefone_emergencia: pacienteParaEditar.telefone_emergencia,
        observacoes: pacienteParaEditar.observacoes,
      });
    }
  }, [pacienteParaEditar, empresaId, form]);

  const onSubmit = async (data: PacienteFormValues) => {
    if (!empresaId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      const pacienteData = {
        ...data,
        empresa_id: empresaId,
      };

      let result;
      if (pacienteParaEditar) {
        result = await supabase
          .from('pacientes')
          .update(pacienteData)
          .eq('id', pacienteParaEditar.id)
          .single();
      } else {
        result = await supabase
          .from('pacientes')
          .insert(pacienteData)
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: pacienteParaEditar ? "Paciente atualizado" : "Paciente criado",
        description: pacienteParaEditar ? "O paciente foi atualizado com sucesso." : "O paciente foi criado com sucesso.",
      });

      form.reset({
        empresa_id: empresaId || "",
        nome: "",
        data_nascimento: "",
        cpf: "",
        rg: null,
        sexo: "masculino",
        estado_civil: null,
        profissao: null,
        telefone: "",
        telefone_secundario: null,
        email: null,
        cep: "",
        endereco: "",
        numero: "",
        complemento: null,
        bairro: "",
        cidade: "",
        convenio: null,
        numero_carteirinha: null,
        validade_carteirinha: null,
        contato_emergencia: null,
        telefone_emergencia: null,
        observacoes: null,
      });
      
      onPacienteSalvo();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao ${pacienteParaEditar ? 'atualizar' : 'criar'} o paciente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{pacienteParaEditar ? 'Editar Paciente' : 'Novo Paciente'}</CardTitle>
          <CardDescription>{pacienteParaEditar ? 'Edite os dados do paciente.' : 'Adicione um novo paciente.'}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
              <TabsTrigger value="complementar">Dados Complementares</TabsTrigger>
            </TabsList>

            <TabsContent value="dados">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" {...form.register("nome")} />
                  {form.formState.errors.nome && (
                    <p className="text-red-500">{form.formState.errors.nome.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                  <Input type="date" id="data_nascimento" {...form.register("data_nascimento")} />
                  {form.formState.errors.data_nascimento && (
                    <p className="text-red-500">{form.formState.errors.data_nascimento.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input id="cpf" {...form.register("cpf")} />
                  {form.formState.errors.cpf && (
                    <p className="text-red-500">{form.formState.errors.cpf.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="rg">RG</Label>
                  <Input id="rg" {...form.register("rg")} />
                </div>
                <div>
                  <Label htmlFor="sexo">Sexo *</Label>
                  <select
                    id="sexo"
                    {...form.register("sexo")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="estado_civil">Estado Civil</Label>
                  <select
                    id="estado_civil"
                    {...form.register("estado_civil")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Selecione</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input id="profissao" {...form.register("profissao")} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contato">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone Principal *</Label>
                  <Input id="telefone" {...form.register("telefone")} />
                  {form.formState.errors.telefone && (
                    <p className="text-red-500">{form.formState.errors.telefone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="telefone_secundario">Telefone Secundário</Label>
                  <Input id="telefone_secundario" {...form.register("telefone_secundario")} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" {...form.register("email")} />
                </div>
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input id="cep" {...form.register("cep")} />
                  {form.formState.errors.cep && (
                    <p className="text-red-500">{form.formState.errors.cep.message}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input id="endereco" {...form.register("endereco")} />
                  {form.formState.errors.endereco && (
                    <p className="text-red-500">{form.formState.errors.endereco.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="numero">Número *</Label>
                  <Input id="numero" {...form.register("numero")} />
                  {form.formState.errors.numero && (
                    <p className="text-red-500">{form.formState.errors.numero.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input id="complemento" {...form.register("complemento")} />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input id="bairro" {...form.register("bairro")} />
                  {form.formState.errors.bairro && (
                    <p className="text-red-500">{form.formState.errors.bairro.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input id="cidade" {...form.register("cidade")} />
                  {form.formState.errors.cidade && (
                    <p className="text-red-500">{form.formState.errors.cidade.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="complementar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="convenio">Convênio</Label>
                  <Input id="convenio" {...form.register("convenio")} />
                </div>
                <div>
                  <Label htmlFor="numero_carteirinha">Número da Carteirinha</Label>
                  <Input id="numero_carteirinha" {...form.register("numero_carteirinha")} />
                </div>
                <div>
                  <Label htmlFor="validade_carteirinha">Validade</Label>
                  <Input type="date" id="validade_carteirinha" {...form.register("validade_carteirinha")} />
                </div>
                <div>
                  <Label htmlFor="contato_emergencia">Contato de Emergência</Label>
                  <Input id="contato_emergencia" {...form.register("contato_emergencia")} />
                </div>
                <div>
                  <Label htmlFor="telefone_emergencia">Telefone de Emergência</Label>
                  <Input id="telefone_emergencia" {...form.register("telefone_emergencia")} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" {...form.register("observacoes")} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onVoltar}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit">
              <SaveIcon className="w-4 h-4 mr-2" />
              {pacienteParaEditar ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
