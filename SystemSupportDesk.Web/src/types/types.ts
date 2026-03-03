// === ENUMS E TIPOS AUXILIARES ===
export type StatusChamadoType = 'Novo' | 'EmAndamento' | 'Aguardando' | 'Resolvido' | 'Cancelado';

// === ENTIDADES BÁSICAS ===
export interface Categoria {
    id: number;
    nome: string;
}

export interface Prioridade {
    id: number;
    nome: string;
    corExibicao: string;
}

export interface Autor {
    id: number;
    nome: string;
    email: string;
    perfil?: string;
    cargo?: string;
}

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    perfil: string;
    cargo?: string;
    empresa?: string;
    telefone?: string;
    fotoUrl?: string;
    linkedIn?: string;
    bio?: string;
}

export interface Chamado {
    id: number;
    titulo: string;
    descricao: string;
    dataAbertura: string;
    status: string; // O backend retorna string, mas podemos tratar como StatusChamadoType no front
    categoria?: Categoria;
    prioridade?: Prioridade;
    autor?: Autor;
    responsavel?: Autor;
}

// === DASHBOARD (Home) ===
export interface DashboardData {
    // Mestre
    totalEmpresas?: number;
    totalUsuarios?: number;
    totalTicketsSistema?: number;
    statusSistema?: string;
    receitaMensal?: number;

    // Admin
    volumeTotal?: number;
    emAberto?: number;
    criticos?: number;
    csat?: number;
    departamentos?: Array<{ nome: string; volume: number }>;

    // Analista
    minhaFila?: number;
    resolvidosHoje?: number;
    slaRisco?: number;
    ticketsPendentes?: Array<{ id: number; titulo: string; idPrioridade: number; tempoFila?: string }>;

    // Cliente
    totalAbertos?: number;
    totalResolvidos?: number;
    ultimosTickets?: Array<{ id: number; titulo: string; status: StatusChamadoType; data: string }>;
}

// === CONTEXTOS ===
export interface AuthContextData {
    user: Usuario | null;
    signed: boolean;
    signIn: (email: string, senha: string) => Promise<void>;
    signOut: () => void;
    loading: boolean;
}

export interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export interface NotificationItem {
    id: number;
    titulo: string;
    mensagem: string;
    tipo: 'info' | 'success' | 'warning' | 'error' | 'ai';
    lida: boolean;
    dataCriacao: string;
    linkAction?: string;
}