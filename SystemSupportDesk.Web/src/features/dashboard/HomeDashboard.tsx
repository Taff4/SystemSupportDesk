import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
    Ticket, CheckCircle, Clock, TrendingUp, AlertTriangle,
    PlusCircle, Search, FileText, Target, Activity, Users, Server, ShieldCheck,
    ArrowRight, DollarSign, BarChart3, HelpCircle, Zap,
} from 'lucide-react';
import type { DashboardData, StatusChamadoType, Usuario } from '../../types/types';

// --- UTILITÁRIOS VISUAIS ---
const getStatusColor = (status: StatusChamadoType) => {
    switch (status) {
        case 'Novo': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
        case 'EmAndamento': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800';
        case 'Aguardando': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
        case 'Resolvido': return 'text-green-600 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
        case 'Cancelado': return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        default: return 'text-gray-500';
    }
};

const getPriorityColor = (id: number) => {
    switch (id) {
        case 1: return 'bg-red-500'; // Alta
        case 2: return 'bg-yellow-500'; // Média
        default: return 'bg-green-500'; // Baixa
    }
};

// Definição das Props para os Sub-componentes
interface ViewProps {
    data: DashboardData | null;
    onNavigate: (tab: string) => void;
}

// --- VISÃO DO MESTRE (SAAS OWNER) ---
const MasterView = ({ data, onNavigate }: ViewProps) => (
    <div className="p-4 md:p-8 w-full max-w-[1920px] mx-auto animate-fadeIn space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text">Dashboard Master</h1>
                <p className="text-sm md:text-base text-gray-500">Visão global da infraestrutura Kovia.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-bold border border-green-200 dark:border-green-900">
                <Activity size={16} /> Sistema Operacional
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black text-white shadow-xl relative overflow-hidden min-h-[160px] flex flex-col justify-center">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <DollarSign size={18} /> <span className="text-xs font-bold uppercase tracking-wider">Receita (MRR)</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold">R$ 42.5k</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <TrendingUp size={12} className="text-green-400" /> +12% vs mês anterior
                    </p>
                </div>
                <div className="absolute right-[-10px] bottom-[-20px] opacity-10 rotate-12"><DollarSign size={140} /></div>
            </div>

            {[
                { icon: ShieldCheck, label: "Empresas Ativas", value: data?.totalEmpresas, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
                { icon: Users, label: "Total de Usuários", value: data?.totalUsuarios, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
                { icon: Ticket, label: "Tickets Processados", value: data?.totalTicketsSistema, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20", action: 'tickets_inbox' }
            ].map((item, idx) => (
                <div
                    key={idx}
                    onClick={item.action ? () => onNavigate(item.action) : undefined}
                    className={`p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col justify-between min-h-[160px] hover:border-primary/30 transition-all ${item.action ? 'cursor-pointer' : ''}`}
                >
                    <div className="flex justify-between items-start">
                        <div className={`p-3 ${item.bg} ${item.color} rounded-xl`}><item.icon size={24} /></div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-light-text dark:text-dark-text mt-4">{item.value || 0}</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">{item.label}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-light-text dark:text-dark-text">
                <Server size={20} className="text-gray-400" /> Saúde dos Serviços
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['API Core', 'Database Cluster', 'File Storage'].map((service) => (
                    <div key={service} className="flex items-center justify-between p-4 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl">
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{service}</span>
                        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400">100% Uptime</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- VISÃO DO ADMINISTRADOR (GESTOR DE TI) ---
const AdminView = ({ data, onNavigate }: ViewProps) => (
    <div className="p-4 md:p-8 w-full max-w-[1920px] mx-auto animate-fadeIn space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text">Gestão de TI</h1>
                <p className="text-sm md:text-base text-gray-500">Visão macro da operação.</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-500 px-4 py-2 rounded-xl flex items-center gap-2 font-bold border border-yellow-200 dark:border-yellow-900/30">
                <Target size={20} /> CSAT: {data?.csat || 0} / 5.0
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                onClick={() => onNavigate('tickets_inbox')}
                className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer hover:shadow-md transition-all"
            >
                <div className="flex justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Volume Total</span>
                    <BarChart3 size={20} className="text-gray-300" />
                </div>
                <div className="flex items-end gap-3 mt-4">
                    <h3 className="text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text">{data?.volumeTotal || 0}</h3>
                    <div className="text-xs font-bold text-green-500 mb-2 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded flex items-center">
                        <TrendingUp size={12} className="mr-1" /> 5%
                    </div>
                </div>
            </div>

            <div
                onClick={() => onNavigate('tickets_inbox')}
                className="p-6 rounded-2xl bg-white dark:bg-dark-surface border-l-4 border-l-blue-500 border-y border-r border-light-border dark:border-dark-border shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer hover:shadow-md transition-all"
            >
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fila de Espera</span>
                <div className="mt-4">
                    <h3 className="text-4xl md:text-5xl font-bold text-blue-500">{data?.emAberto || 0}</h3>
                    <p className="text-xs text-gray-500 mt-1">Tickets aguardando ação</p>
                </div>
            </div>

            <div
                onClick={() => onNavigate('tickets_sla')}
                className="p-6 rounded-2xl bg-white dark:bg-dark-surface border-l-4 border-l-red-500 border-y border-r border-light-border dark:border-dark-border shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer hover:shadow-md transition-all"
            >
                <div className="flex justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Críticos (SLA)</span>
                    <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div className="mt-4">
                    <h3 className="text-4xl md:text-5xl font-bold text-red-500">{data?.criticos || 0}</h3>
                    <p className="text-xs text-gray-500 mt-1">Necessitam atenção imediata</p>
                </div>
            </div>
        </div>

        {/* Seção Inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border p-6 shadow-sm">
                <h3 className="font-bold mb-6 text-lg text-light-text dark:text-dark-text">Eficiência por Categoria</h3>
                <div className="space-y-6">
                    {[
                        { label: 'Hardware', val: 40, color: 'bg-blue-500' },
                        { label: 'Acesso & Login', val: 35, color: 'bg-purple-500' },
                        { label: 'Software', val: 25, color: 'bg-green-500' }
                    ].map((cat) => (
                        <div key={cat.label} className="flex items-center justify-between text-sm">
                            <span className="w-20 md:w-24 text-gray-600 dark:text-gray-400 truncate">{cat.label}</span>
                            <div className="flex-1 mx-4 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.val}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-light-text dark:text-dark-text">{cat.val}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-purple-800 rounded-2xl p-8 text-white flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden min-h-[200px]">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="p-3 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                        <Zap size={32} className="text-yellow-300" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Produtividade em Alta</h3>
                    <p className="opacity-90 text-sm max-w-sm leading-relaxed">Sua equipe resolveu 15% mais chamados essa semana comparado à média mensal.</p>
                </div>
                <div className="absolute left-0 top-0 opacity-10"><Zap size={200} /></div>
            </div>
        </div>
    </div>
);

// --- VISÃO DO ANALISTA (SUPORTE TÉCNICO) ---
const AnalystView = ({ user, data, onNavigate }: { user: Usuario } & ViewProps) => (
    <div className="p-4 md:p-8 w-full max-w-[1920px] mx-auto animate-fadeIn space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text">
                    Olá, {user.nome.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-500 text-sm md:text-base">Vamos zerar essa fila hoje?</p>
            </div>
            <div className="text-center px-4 py-2 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Meu CSAT</p>
                <p className="text-xl font-bold text-yellow-500">4.9</p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                onClick={() => onNavigate('tickets')}
                className="p-6 rounded-2xl bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg transform hover:scale-[1.01] transition-transform cursor-pointer min-h-[160px]"
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="p-2 bg-white/20 rounded-lg"><Ticket size={24} /></div>
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded backdrop-blur-sm">MINHA FILA</span>
                </div>
                <h3 className="text-5xl font-bold mb-1">{data?.minhaFila || 0}</h3>
                <p className="text-sm opacity-90 font-medium">Tickets aguardando você</p>
            </div>

            <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col justify-between min-h-[160px]">
                <div>
                    <div className="flex justify-between">
                        <p className="text-sm font-bold text-gray-500 uppercase">Metas do Dia</p>
                        <CheckCircle size={20} className="text-green-500" />
                    </div>
                    <h3 className="text-4xl font-bold text-green-500 mt-2">{data?.resolvidosHoje || 0}<span className="text-lg text-gray-400 font-normal">/10</span></h3>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.min(((data?.resolvidosHoje || 0) / 10) * 100, 100)}%` }}></div>
                </div>
            </div>

            <div
                onClick={() => onNavigate('tickets_sla')}
                className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm relative overflow-hidden min-h-[160px] flex flex-col justify-center cursor-pointer hover:border-orange-500/50 transition-all"
            >
                <div className="absolute right-0 top-0 p-6 opacity-10"><Clock size={80} className="text-orange-500" /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold">
                        <AlertTriangle size={20} />
                        <span>Atenção SLA</span>
                    </div>
                    <h3 className="text-4xl font-bold text-light-text dark:text-dark-text">{data?.slaRisco || 0}</h3>
                    <p className="text-xs text-gray-500 mt-2">Tickets próximos do vencimento</p>
                </div>
            </div>
        </div>

        {/* Fila de Prioridade */}
        <div>
            <h3 className="font-bold text-lg mb-4 ml-1 flex items-center gap-2 text-light-text dark:text-dark-text">
                <Zap size={18} className="text-yellow-500" />
                Próximos da Fila
            </h3>
            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border overflow-hidden shadow-sm">
                {data?.ticketsPendentes && data.ticketsPendentes.length > 0 ? (
                    <div className="divide-y divide-light-border dark:divide-dark-border">
                        {data.ticketsPendentes.map((t) => (
                            <div
                                key={t.id}
                                onClick={() => onNavigate('tickets')}
                                className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-1.5 h-10 rounded-full hidden sm:block ${getPriorityColor(t.idPrioridade)}`}></div>
                                    <div>
                                        <p className="font-bold text-sm text-light-text dark:text-dark-text group-hover:text-primary transition-colors">
                                            {t.titulo}
                                        </p>
                                        <p className="text-xs text-gray-500">#{t.id} • Alta Prioridade</p>
                                    </div>
                                </div>
                                <button className="w-full sm:w-auto px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all">
                                    Assumir
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                        <CheckCircle size={48} className="text-green-500 mb-4 opacity-50" />
                        <p className="font-medium text-lg">Tudo limpo por aqui!</p>
                        <p className="text-sm mt-1">Nenhum ticket pendente com alta prioridade.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// --- VISÃO DO SOLICITANTE (CLIENTE) ---
// Ajuste aqui: removi as classes de min-height e justify-center que causavam a barra
const ClientView = ({ data, onNavigate }: ViewProps) => (
    <div className="p-6 md:p-10 flex flex-col items-center animate-fadeIn w-full">
        <div className="w-full max-w-6xl">

            {/* Hero Section */}
            <div className="text-center mb-12 mt-8 md:mt-12">
                {/* ... (Título e Logo mantidos) ... */}

                {/* CORREÇÃO DA LUPA: */}
                <div className="relative max-w-2xl mx-auto group">
                    {/* Ícone Absolute - Ajustado top e left para centralizar */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none">
                        <Search size={24} />
                    </div>

                    <input
                        type="text"
                        placeholder="Pesquise por dúvidas (ex: VPN, Senha, Boleto)..."
                        className="w-full pl-14 pr-6 py-4 rounded-full border-2 border-light-border dark:border-dark-border bg-white dark:bg-dark-surface shadow-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-base md:text-lg transition-all"
                    />
                </div>
            </div>
            {/* Ações Rápidas - LINKS CONECTADOS AQUI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">

                <button
                    onClick={() => onNavigate('ia_support')} // <--- A ÚNICA ALTERAÇÃO REAL AQUI (Chat-First)
                    className="p-6 md:p-8 rounded-3xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 group text-left relative overflow-hidden min-h-[180px] flex flex-col justify-center"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><PlusCircle size={100} /></div>
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PlusCircle size={28} />
                    </div>
                    <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">Abrir Chamado</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Relatar problema via Assistente Inteligente.</p>
                </button>

                <button
                    onClick={() => onNavigate('tickets')}
                    className="p-6 md:p-8 rounded-3xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/50 transition-all duration-300 group text-left relative overflow-hidden min-h-[180px] flex flex-col justify-center"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><FileText size={100} /></div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText size={28} />
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="font-bold text-xl mb-1 group-hover:text-blue-500 transition-colors">Meus Tickets</h3>
                            <p className="text-sm text-gray-500">Acompanhar solicitações.</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-3xl font-bold text-light-text dark:text-dark-text">{data?.totalAbertos || 0}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Abertos</span>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => onNavigate('kb_artigos')} // Rota futura para base de conhecimento
                    className="p-6 md:p-8 rounded-3xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-green-500/50 transition-all duration-300 group text-left relative overflow-hidden min-h-[180px] flex flex-col justify-center"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><HelpCircle size={100} /></div>
                    <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/20 text-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <HelpCircle size={28} />
                    </div>
                    <h3 className="font-bold text-xl mb-1 group-hover:text-green-500 transition-colors">Autoatendimento</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Tutoriais e manuais.</p>
                </button>
            </div>

            {/* Lista de Atividades Recentes */}
            {data?.ultimosTickets && data.ultimosTickets.length > 0 && (
                <div className="w-full">
                    <h3 className="font-bold text-lg mb-4 ml-2 text-gray-500 uppercase text-xs tracking-wider">Histórico Recente</h3>
                    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden">
                        <div className="divide-y divide-light-border dark:divide-dark-border">
                            {data.ultimosTickets.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => onNavigate('tickets')} // Link para a lista
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group gap-4"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500">
                                            <Ticket size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-base text-light-text dark:text-dark-text group-hover:text-primary transition-colors">
                                                {t.titulo}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Ticket #{t.id} • {new Date(t.data).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(t.status)}`}>
                                            {t.status}
                                        </span>
                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL ---

// Adicionei a tipagem correta da prop aqui
export function HomeDashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    // Função segura para navegação (caso a prop não seja passada)
    const safeNavigate = (tab: string) => {
        if (onNavigate) onNavigate(tab);
    };

    useEffect(() => {
        async function loadData() {
            try {
                const response = await api.get('/dashboard/summary');
                setDashboardData(response.data);
            } catch (error) {
                console.error("Erro ao carregar dashboard", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full bg-light-bg dark:bg-dark-bg">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    <p className="text-sm text-gray-500 animate-pulse">Carregando métricas...</p>
                </div>
            </div>
        );
    }

    switch (user.perfil) {
        case 'Mestre':
            return <MasterView data={dashboardData} onNavigate={safeNavigate} />;
        case 'Administrador':
            return <AdminView data={dashboardData} onNavigate={safeNavigate} />;
        case 'Analista':
            return <AnalystView user={user} data={dashboardData} onNavigate={safeNavigate} />;
        default:
            return <ClientView data={dashboardData} onNavigate={safeNavigate} />;
    }
}