export interface Cliente {
  id: string;
  empresa_id: string;
  nome: string;
  data_nascimento: string;
  cpf: string;
  rg: string | null;
  sexo: "masculino" | "feminino";
  estado_civil: "solteiro" | "casado" | "divorciado" | "viuvo" | null;
  profissao: string | null;
  telefone: string;
  telefone_secundario: string | null;
  email: string | null;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  convenio: string | null;
  numero_carteirinha: string | null;
  validade_carteirinha: string | null;
  contato_emergencia: string | null;
  telefone_emergencia: string | null;
  observacoes: string | null;
  criado_em: string;
}

export interface Agendamento {
  id: string; // UUID
  empresa_id: string; // UUID
  usuario_id: string; // UUID
  cliente_id: string; // UUID
  data_agendamento: string; // timestamp with time zone
  tipo_servico: string | null;
  status: 'pendente' | 'confirmado' | 'cancelado' | string | null; // Assumindo que 'pendente' é o valor padrão
  observacoes: string | null;
  criado_em: string; // timestamp with time zone
}

export interface Perfil {
  id: string; // UUID
  empresa_id: string; // UUID
  nome: string;
  cargo: string;
  criado_em: string | null; // timestamp with time zone
}

export interface Plano {
  id: string; // UUID
  nome: string;
  max_usuarios: number;
  recursos: Record<string, any>; // jsonb
  preco: number;
  criado_em: string | null; // timestamp with time zone
}

export interface Produto {
  id: string; // UUID
  empresa_id: string; // UUID
  nome: string;
  marca: string;
  tipo: string;
  codigo_cor: string | null;
  criado_em: string | null; // timestamp with time zone
}

export interface Anamnese {
  id: string;
  empresa_id: string;
  paciente_id: string;
  queixa_principal: string;
  historia_doenca: string;
  antecedentes_pessoais: string | null;
  antecedentes_familiares: string | null;
  medicamentos: string | null;
  alergias: string | null;
  sinais_vitais: {
    pressao_arterial: string | null;
    frequencia_cardiaca: string | null;
    temperatura: string | null;
  };
  exame_fisico: string | null;
  criado_em: string;
}

export interface Empresa {
  id: string;
  nome: string;
  ramo: string;
  criado_em: string;
}

// Adicione outras interfaces para as demais tabelas do seu banco de dados
