import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, empresaSchema } from "../lib/validations/auth";
import { z } from "zod";
import { signIn, signUp } from "./auth";
import { supabase } from '../supabaseClient';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AuthError } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Toast } from "../components/ui/toast";
import { useToast } from "../components/ui/use-toast";

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type EmpresaFormValues = z.infer<typeof empresaSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const empresaForm = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: "",
      ramo: "",
      email: "",
      password: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { user, error } = await signIn(data.email, data.password);
      if (user) {
        console.log("Login bem-sucedido:", user);
        navigate('/dashboard');
      } else {
        toast({
          title: "Erro no login",
          description: error || "Falha no login. Verifique suas credenciais.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro inesperado no login:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado durante o login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onEmpresaSubmit = async (data: EmpresaFormValues) => {
    setIsLoading(true);
    try {
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .insert({ 
          nome: data.nome,
          ramo: data.ramo
        })
        .select()
        .single();

      if (empresaError) throw empresaError;

      const { user, error: userError } = await signUp(data.email, data.password, {
        empresa_id: empresaData.id,
        nome: data.nome,
        cargo: 'Administrador'
      });

      if (userError) throw new Error(userError);

      setEmpresaId(empresaData.id);
      console.log("Empresa e usuário administrador registrados com sucesso");
      toast({
        title: "Sucesso",
        description: "Empresa e usuário administrador registrados com sucesso. Por favor, faça login.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro no registro da empresa e usuário:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? `Erro no registro: ${error.message}` : "Ocorreu um erro desconhecido durante o registro.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8 shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold mb-2">Autenticação</CardTitle>
        <CardDescription>Faça login ou cadastre sua empresa.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="empresa">Cadastro</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@exemplo.com"
                    {...loginForm.register("email")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    {...loginForm.register("password")}
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="text-base">
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="empresa">
            <form onSubmit={empresaForm.handleSubmit(onEmpresaSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome da Empresa</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Nome da Empresa"
                    {...empresaForm.register("nome")}
                  />
                  {empresaForm.formState.errors.nome && (
                    <p className="text-red-500">{empresaForm.formState.errors.nome.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ramo">Ramo de Atividade</Label>
                  <select
                    id="ramo"
                    {...empresaForm.register("ramo")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Selecione o ramo de atividade</option>
                    <option value="psiquiatria">Psiquiatria</option>
                    <option value="psicologia">Psicologia</option>
                    <option value="odontologia">Odontologia</option>
                    <option value="fisioterapia">Fisioterapia</option>
                    <option value="nutrição">Nutrição</option>
                    <option value="fonoaudiologia">Fonoaudiologia</option>
                    <option value="terapia_ocupacional">Terapia Capilar</option>
                    <option value="estetica">Estética</option>
                    <option value="dermatologia">Dermatologia</option>
                    <option value="acupuntura">Acupuntura</option>
                    <option value="outro">Outro</option>
                  </select>
                  {empresaForm.formState.errors.ramo && (
                    <p className="text-red-500">{empresaForm.formState.errors.ramo.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email do Administrador</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@exemplo.com"
                    {...empresaForm.register("email")}
                  />
                  {empresaForm.formState.errors.email && (
                    <p className="text-red-500">{empresaForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha do Administrador</Label>
                  <Input
                    id="password"
                    type="password"
                    {...empresaForm.register("password")}
                  />
                  {empresaForm.formState.errors.password && (
                    <p className="text-red-500">{empresaForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading} className="text-base">
                  {isLoading ? "Registrando..." : "Registrar Empresa e Administrador"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
      </CardFooter>
    </Card>
  );
}

export default LoginForm;
