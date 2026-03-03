import { Ticket, PlusCircle, Layers, ArrowRight, BarChart2 } from 'lucide-react';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface SupportHubProps {
    onNavigate: (tab: string) => void;
}

export function SupportHub({ onNavigate }: SupportHubProps) {
    const { user } = useAuth();
    const { t } = useTranslation();

    // Define quem é "Staff" (Equipe de Atendimento)
    const isStaff = ['Analista', 'Administrador', 'Mestre'].includes(user?.perfil || '');

    return (
        <div className="flex-1 flex flex-col h-full bg-light-bg dark:bg-dark-bg p-6 md:p-10 animate-fadeIn">

            <div className="mb-8 shrink-0">
                <Breadcrumb
                    onHome={() => onNavigate('home')}
                    items={[
                        { label: t('sidebar.overview'), active: true }
                    ]}
                />
            </div>

            <div className="w-full h-full flex flex-col">
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-3 tracking-tight">
                        {isStaff ? "Operação de Suporte" : "Central de Atendimento"}
                    </h1>
                    <p className="text-gray-500 text-lg">
                        {isStaff
                            ? "Gerencie a fila, assuma tickets e monitore métricas."
                            : "Selecione uma operação abaixo para iniciar."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">

                    {/* CARD 1: MEUS TICKETS (Contexto muda conforme o perfil) */}
                    <button
                        onClick={() => onNavigate('tickets')}
                        className="group relative p-8 rounded-3xl bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-xl transition-all duration-300 text-left min-h-[240px] flex flex-col justify-between hover:border-primary hover:ring-1 hover:ring-primary"
                    >
                        <div className="absolute right-0 top-0 p-10 bg-purple-50 dark:bg-purple-900/10 rounded-bl-[100px] opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-primary flex items-center justify-center mb-6 shadow-inner">
                                <Ticket size={28} />
                            </div>
                            <h3 className="font-bold text-2xl text-light-text dark:text-dark-text mb-2">
                                {isStaff ? "Meus Atendimentos" : "Meus Tickets"}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                                {isStaff ? "Tickets que você assumiu e está tratando." : "Acompanhe suas solicitações em aberto."}
                            </p>
                        </div>
                        <div className="relative z-10 flex items-center text-primary font-bold text-sm group-hover:translate-x-2 transition-transform mt-4">
                            Acessar Lista <ArrowRight size={16} className="ml-2" />
                        </div>
                    </button>

                    {/* CARD 2: VARIAVEL (Staff = Fila Geral / Cliente = Novo Ticket) */}
                    {isStaff ? (
                        <button
                            onClick={() => onNavigate('tickets_inbox')}
                            className="group relative p-8 rounded-3xl bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-xl transition-all duration-300 text-left min-h-[240px] flex flex-col justify-between hover:border-orange-500 hover:ring-1 hover:ring-orange-500"
                        >
                            <div className="absolute right-0 top-0 p-10 bg-orange-50 dark:bg-orange-900/10 rounded-bl-[100px] opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center mb-6 shadow-inner">
                                    <Layers size={28} />
                                </div>
                                <h3 className="font-bold text-2xl text-light-text dark:text-dark-text mb-2">Fila Geral (Inbox)</h3>
                                <p className="text-sm text-gray-500 font-medium">Visualize tickets pendentes de toda a equipe.</p>
                            </div>
                            <div className="relative z-10 flex items-center text-orange-500 font-bold text-sm group-hover:translate-x-2 transition-transform mt-4">
                                Gerenciar Fila <ArrowRight size={16} className="ml-2" />
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={() => onNavigate('novo_ticket')}
                            className="group relative p-8 rounded-3xl bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-xl transition-all duration-300 text-left min-h-[240px] flex flex-col justify-between hover:border-blue-500 hover:ring-1 hover:ring-blue-500"
                        >
                            <div className="absolute right-0 top-0 p-10 bg-blue-50 dark:bg-blue-900/10 rounded-bl-[100px] opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center mb-6 shadow-inner">
                                    <PlusCircle size={28} />
                                </div>
                                <h3 className="font-bold text-2xl text-light-text dark:text-dark-text mb-2">Novo Chamado</h3>
                                <p className="text-sm text-gray-500 font-medium">Relate problemas técnicos ou dúvidas.</p>
                            </div>
                            <div className="relative z-10 flex items-center text-blue-500 font-bold text-sm group-hover:translate-x-2 transition-transform mt-4">
                                Abrir Solicitação <ArrowRight size={16} className="ml-2" />
                            </div>
                        </button>
                    )}

                    {/* CARD 3: EXTRA (Só aparece para Staff - Relatórios) */}
                    {isStaff && (
                        <button
                            onClick={() => onNavigate('tickets_sla')}
                            className="group relative p-8 rounded-3xl bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-xl transition-all duration-300 text-left min-h-[240px] flex flex-col justify-between hover:border-red-500 hover:ring-1 hover:ring-red-500"
                        >
                            <div className="absolute right-0 top-0 p-10 bg-red-50 dark:bg-red-900/10 rounded-bl-[100px] opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mb-6 shadow-inner">
                                    <BarChart2 size={28} />
                                </div>
                                <h3 className="font-bold text-2xl text-light-text dark:text-dark-text mb-2">SLA e Métricas</h3>
                                <p className="text-sm text-gray-500 font-medium">Analise gargalos e tempos de resposta.</p>
                            </div>
                            <div className="relative z-10 flex items-center text-red-500 font-bold text-sm group-hover:translate-x-2 transition-transform mt-4">
                                Ver Relatórios <ArrowRight size={16} className="ml-2" />
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}