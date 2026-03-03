import { useState } from 'react';
import { Wrench } from 'lucide-react';
import type { Chamado } from '../types/types';

// Layout Global
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';

// Módulos (Features)
import { HomeDashboard } from '../features/dashboard/HomeDashboard';
import { TicketQueuePro } from '../features/tickets/TicketQueuePro';
import { NewTicketForm } from '../features/tickets/NewTicketForm';
import { TicketDetail } from '../features/tickets/TicketDetail';
import { SupportHub } from '../features/tickets/SupportHub';
import { SlaReports } from '../features/tickets/SlaReports';
import { UserManagement } from '../features/users/UserManagement';
import { UserProfile } from '../features/users/UserProfile';
import { SettingsPage } from '../features/settings/SettingsPage';
import { IntelligentSupport } from '../features/tickets/IntelligentSupport';

// NOVO: Importe o Widget Flutuante
import { IAWidget } from '../features/tickets/components/IAWidget';

export function Dashboard() {
    const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
    const [activeTab, setActiveTab] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

    const handleTicketSelect = (chamado: Chamado) => {
        setSelectedChamado(chamado);
        setMobileView('detail');
    };

    const getQueueMode = () => {
        if (activeTab === 'tickets') return 'meus';
        if (activeTab === 'tickets_inbox') return 'geral';
        return 'meus';
    };

    const isTicketView = activeTab === 'tickets' || activeTab === 'tickets_inbox';

    return (
        <div className="flex flex-col h-screen font-sans overflow-hidden bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text relative">

            <Header
                onMenuClick={() => setIsSidebarOpen(true)}
                onNavigate={setActiveTab}
            />

            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={(tab) => {
                        setActiveTab(tab);
                        setMobileView('list');
                        setSelectedChamado(null);
                    }}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <main className="flex-1 flex flex-col min-w-0 bg-light-bg dark:bg-dark-bg h-full relative">

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">

                        {isTicketView ? (
                            <div className="flex flex-1 h-full overflow-hidden">
                                <div className={`
                                    flex-col h-full w-full md:w-80 lg:w-96 min-w-0 border-r border-light-border dark:border-dark-border 
                                    ${mobileView === 'detail' ? 'hidden md:flex' : 'flex'}
                                `}>
                                    <TicketQueuePro
                                        viewMode={getQueueMode()}
                                        onSelectTicket={handleTicketSelect}
                                        selectedId={selectedChamado?.id}
                                    />
                                </div>

                                <div className={`
                                    flex-1 flex-col h-full min-w-0 bg-white dark:bg-[#0b141a]
                                    ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
                                `}>
                                    <TicketDetail
                                        chamado={selectedChamado}
                                        onBack={() => setMobileView('list')}
                                        onNavigate={setActiveTab}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 h-full flex flex-col">
                                    {activeTab === 'home' && <HomeDashboard onNavigate={setActiveTab} />}
                                    {activeTab === 'atendimento_home' && <SupportHub onNavigate={setActiveTab} />}
                                    {activeTab === 'tickets_sla' && <SlaReports onNavigate={setActiveTab} />}
                                    {activeTab === 'contatos_lista' && <UserManagement />}
                                    {activeTab === 'perfil' && <UserProfile onNavigate={setActiveTab} />}
                                    {activeTab === 'configuracoes' && <SettingsPage onNavigate={setActiveTab} />}

                                    {/* Tela Cheia da IA (via Menu) */}
                                    {activeTab === 'ia_support' && <IntelligentSupport onNavigate={setActiveTab} />}

                                    {activeTab === 'novo_ticket' && (
                                        <NewTicketForm
                                            onCancel={() => setActiveTab('atendimento_home')}
                                            onSuccess={() => setActiveTab('tickets')}
                                        />
                                    )}

                                    {!['home', 'atendimento_home', 'tickets', 'tickets_inbox', 'tickets_sla', 'novo_ticket', 'contatos_lista', 'configuracoes', 'perfil', 'ia_support'].includes(activeTab) && (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 h-full min-h-[500px]">
                                            <div className="p-6 rounded-full bg-light-surface dark:bg-dark-surface mb-4 shadow-sm border border-light-border dark:border-dark-border animate-pulse">
                                                <Wrench size={48} className="text-primary opacity-50" />
                                            </div>
                                            <h2 className="text-xl font-bold mb-2">Módulo em Desenvolvimento</h2>
                                            <p className="text-sm">A funcionalidade <span className="font-mono text-primary font-bold">{activeTab}</span> será liberada em breve.</p>
                                        </div>
                                    )}
                                </div>

                                <Footer />
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* === AQUI ESTÁ O WIDGET FLUTUANTE === */}
            {/* Ele fica por cima de tudo (z-index alto definido no componente) */}
            <IAWidget />

        </div>
    );
}