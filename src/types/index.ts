export type TipoUsuario = "gestor" | "motorista";

export type StatusFrete =
  | "aberto"
  | "em_negociacao"
  | "motorista_aprovado"
  | "em_coleta"
  | "em_viagem"
  | "concluido"
  | "cancelado";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: TipoUsuario;
  criadoEm: Date;
}

export interface Motorista {
  userId: string;
  cidadeAtual: string;
  estadoAtual: string;
  disponivel: boolean;
  tipoCaminhao: string;
  carroceria: string;
  capacidade: string;
  whatsapp: string;
}

export interface Frete {
  id: string;
  gestorId: string;
  origemCidade: string;
  origemEstado: string;
  destinoCidade: string;
  destinoEstado: string;
  enderecoColeta: string;
  enderecoEntrega: string;
  carga: string;
  peso: string;
  valor: number;
  tipoCaminhao: string;
  carroceria: string;
  status: StatusFrete;
  motoristaAprovadoId?: string;
  criadoEm: Date;
}