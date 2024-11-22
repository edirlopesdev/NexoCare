import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "./ui/use-toast";
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { SaveIcon, ArrowLeft } from "lucide-react";
import { Label } from "./ui/label";

const anamneseSchema = z.object({
  empresa_id: z.string().uuid(),
  paciente_id: z.string().uuid(),
  queixa_principal: z.string().min(1, "A queixa principal é obrigatória"),
  historia_doenca: z.string().min(1, "A história da doença é obrigatória"),
  antecedentes_pessoais: z.string().nullable(),
  antecedentes_familiares: z.string().nullable(),
  medicamentos: z.string().nullable(),
  alergias: z.string().nullable(),
  sinais_vitais: z.object({
    pressao_arterial: z.string().nullable(),
    frequencia_cardiaca: z.string().nullable(),
    temperatura: z.string().nullable(),
  }),
  exame_fisico: z.string().nullable(),
});

type AnamneseFormValues = Omit<z.infer<typeof anamneseSchema>, 'id' | 'criado_em'>;

interface AnamneseFormProps {
  pacienteId: string;
  pacienteNome: string;
  onAnamnaseSalva: () => void;
  onVoltar: () => void;
}

export function AnamneseForm({ pacienteId, pacienteNome, onAnamnaseSalva, onVoltar }: AnamneseFormProps) {
  const [activeStep, setActiveStep] = useState(1);
  const { toast } = useToast();
  const { empresaId } = useAuth();

  const form = useForm<AnamneseFormValues>({
    resolver: zodResolver(anamneseSchema),
    defaultValues: {
      empresa_id: empresaId || "",
      paciente_id: pacienteId,
      queixa_principal: "",
      historia_doenca: "",
      antecedentes_pessoais: null,
      antecedentes_familiares: null,
      medicamentos: null,
      alergias: null,
      sinais_vitais: {
        pressao_arterial: null,
        frequencia_cardiaca: null,
        temperatura: null,
      },
      exame_fisico: null,
    },
  });

  useEffect(() => {
    if (empresaId) {
      form.setValue('empresa_id', empresaId);
    }
    if (pacienteId) {
      form.setValue('paciente_id', pacienteId);
    }
  }, [empresaId, pacienteId, form]);

  const onSubmit = async (data: AnamneseFormValues) => {
    try {
      console.log('Dados do formulário:', data);

      if (!empresaId || !pacienteId) {
        toast({
          title: "Erro",
          description: "ID da empresa ou do paciente não encontrado",
          variant: "destructive",
        });
        return;
      }

      const anamneseData = {
        ...data,
        empresa_id: empresaId,
        paciente_id: pacienteId,
      };

      const { error } = await supabase
        .from('anamneses')
        .insert([anamneseData]);

      if (error) throw error;

      toast({
        title: "Anamnese salva",
        description: "A anamnese foi salva com sucesso.",
      });

      onAnamnaseSalva();
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a anamnese.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Anamnese</CardTitle>
          <CardDescription>Paciente: {pacienteNome}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center mb-8">
            <div className={`flex items-center ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2">Queixa Principal</span>
            </div>
            <div className={`w-16 h-0.5 mx-2 ${activeStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2">História Clínica</span>
            </div>
            <div className={`w-16 h-0.5 mx-2 ${activeStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2">Exame Físico</span>
            </div>
          </div>

          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="queixa_principal">Queixa Principal *</Label>
                <Textarea 
                  id="queixa_principal"
                  {...form.register("queixa_principal")}
                  rows={3}
                />
                {form.formState.errors.queixa_principal && (
                  <p className="text-red-500">{form.formState.errors.queixa_principal.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="historia_doenca">História da Doença Atual *</Label>
                <Textarea 
                  id="historia_doenca"
                  {...form.register("historia_doenca")}
                  rows={4}
                />
                {form.formState.errors.historia_doenca && (
                  <p className="text-red-500">{form.formState.errors.historia_doenca.message}</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => setActiveStep(2)}>Próximo</Button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="antecedentes_pessoais">Antecedentes Pessoais</Label>
                  <Textarea 
                    id="antecedentes_pessoais"
                    {...form.register("antecedentes_pessoais")}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="antecedentes_familiares">Antecedentes Familiares</Label>
                  <Textarea 
                    id="antecedentes_familiares"
                    {...form.register("antecedentes_familiares")}
                    rows={4}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
                <Textarea 
                  id="medicamentos"
                  {...form.register("medicamentos")}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="alergias">Alergias</Label>
                <Textarea 
                  id="alergias"
                  {...form.register("alergias")}
                  rows={2}
                />
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveStep(1)}>
                  Anterior
                </Button>
                <Button type="button" onClick={() => setActiveStep(3)}>
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Sinais Vitais</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Pressão Arterial"
                      {...form.register("sinais_vitais.pressao_arterial")}
                    />
                    <Input
                      placeholder="Frequência Cardíaca"
                      {...form.register("sinais_vitais.frequencia_cardiaca")}
                    />
                    <Input
                      placeholder="Temperatura"
                      {...form.register("sinais_vitais.temperatura")}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="exame_fisico">Exame Físico Geral</Label>
                  <Textarea 
                    id="exame_fisico"
                    {...form.register("exame_fisico")}
                    rows={6}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveStep(2)}>
                  Anterior
                </Button>
                <Button type="submit">
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Finalizar
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 