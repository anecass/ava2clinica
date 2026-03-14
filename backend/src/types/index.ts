// src/types/index.ts
// Interfaces e tipos TypeScript do sistema

export interface IUsuario {
  _id?: string;
  nome: string;
  email: string;
  senha: string;
  perfil: 'paciente' | 'secretario' | 'admin';
  telefone?: string;
  cep?: string;
  endereco?: IEndereco;
  createdAt?: Date;
}

export interface IEndereco {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface IAgendamento {
  _id?: string;
  pacienteId: string;
  pacienteNome?: string;
  medico: string;
  especialidade: string;
  data: string;
  hora: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
  observacoes?: string;
  alertaChuva?: boolean;
  previsaoClima?: string;
  createdAt?: Date;
}

export interface ILoginPayload {
  email: string;
  senha: string;
}

export interface ICadastroPayload {
  nome: string;
  email: string;
  senha: string;
  perfil?: 'paciente' | 'secretario';
  telefone?: string;
  cep?: string;
}

export interface IJwtPayload {
  id: string;
  email: string;
  perfil: string;
}

export interface IRespostaErro {
  erro: string;
  detalhes?: string[];
}

export interface IRespostaSucesso<T = unknown> {
  mensagem: string;
  dados?: T;
}

export interface IViaCepResposta {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
