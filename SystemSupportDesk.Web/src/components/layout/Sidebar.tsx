import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard, Send, Ticket,
    Bot, BarChart2, Users, Wrench,
    ChevronDown, X, BookOpen, MessageSquare
} from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    itemKey?: string;
    hasSub?: boolean;
    onClick?: () => void;
    activeTab?: string;
    menuOpen?: { [key: string]: boolean };
    children?: React.ReactNode;
}

const MenuItem = ({ icon: Icon, label, itemKey, hasSub, onClick, activeTab, menuOpen, children }: MenuItemProps) => {
    const isOpen = itemKey && menuOpen ? menuOpen[itemKey] : false;
    const isActive = itemKey && activeTab?.startsWith(itemKey || '');

    return (
        <div className="mb-1 px-3">
            <button
                onClick={onClick}
                className={`w-full flex items-center justify-between p-3 text-sm font-medium transition-all duration-200 rounded-xl
                ${isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? 'text-primary' : 'opacity-70'} />
                    <span>{label}</span>
                </div>
                {hasSub && (
                    <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                )}
            </button>

            {hasSub && isOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-gray-100 dark:border-gray-800 space-y-1 animate-fadeIn">
                    {children}
                </div>
            )}
        </div>
    );
};

const SubMenuLink = ({ label, onClick, isActive }: { label: string, onClick?: () => void, isActive?: boolean }) => (
    <button
        onClick={onClick}
        className={`block w-full text-left py-2 px-3 text-sm rounded-lg transition-colors relative
        ${isActive
                ? 'text-primary font-bold bg-primary/5'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
    >
        {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[13px] w-1.5 h-1.5 rounded-full bg-primary"></span>}
        {label}
    </button>
);

export function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
    const { user } = useAuth();
    const { t } = useTranslation();

    const [menuOpen, setMenuOpen] = useState<{ [key: string]: boolean }>({
        suporte: true,
        ferramentas: false,
        analises: false,
        chatbot: false,
        contatos: false,
        disparos: false,
        conhecimento: false
    });

    const toggleMenu = (key: string) => {
        setMenuOpen(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubClick = (tabName: string) => {
        setActiveTab(tabName);
        if (window.innerWidth < 768) onClose();
    };

    const checkPermission = (allowedRoles: string[]) => {
        if (!user) return false;
        if (user.perfil === 'Mestre') return true;
        return allowedRoles.includes(user.perfil);
    };

    const sidebarClasses = `
        flex flex-col border-r border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface
        transition-transform duration-300 ease-in-out z-40
        fixed inset-y-0 left-0 w-72 h-full transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex md:h-auto
    `;

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={onClose}></div>
            )}

            <aside className={sidebarClasses}>
                <div className="md:hidden p-4 flex justify-between items-center border-b border-light-border dark:border-dark-border">
                    <span className="font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs">KV</div>
                        Kovia
                    </span>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="py-6 space-y-1 overflow-y-auto flex-1 custom-scrollbar">

                    <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Principal</div>
                    <MenuItem icon={LayoutDashboard} label={t('sidebar.home')} onClick={() => handleSubClick('home')} activeTab={activeTab} />

                    {/* ITEM NOVO: CHAT INTELIGENTE */}
                    <MenuItem
                        icon={MessageSquare}
                        label="Falar com IA"
                        onClick={() => handleSubClick('ia_support')}
                        activeTab={activeTab === 'ia_support' ? 'ia_support' : ''}
                    />

                    <div className="mt-6 px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Operação</div>
                    <MenuItem icon={Ticket} label={t('sidebar.support')} itemKey="tickets" hasSub onClick={() => toggleMenu('tickets')} menuOpen={menuOpen} activeTab={activeTab}>
                        <SubMenuLink label={t('sidebar.overview')} onClick={() => handleSubClick('atendimento_home')} isActive={activeTab === 'atendimento_home'} />
                        <SubMenuLink label={t('sidebar.new_ticket')} isActive={activeTab === 'novo_ticket'} onClick={() => handleSubClick('novo_ticket')} />
                        <SubMenuLink label={t('sidebar.my_tickets')} isActive={activeTab === 'tickets'} onClick={() => handleSubClick('tickets')} />
                        {checkPermission(['Analista', 'Administrador']) && (
                            <SubMenuLink label={t('sidebar.inbox')} onClick={() => handleSubClick('tickets_inbox')} />
                        )}
                        {checkPermission(['Administrador']) && (
                            <SubMenuLink label={t('sidebar.sla_reports')} onClick={() => handleSubClick('tickets_sla')} />
                        )}
                    </MenuItem>

                    {checkPermission(['Analista', 'Administrador']) && (
                        <MenuItem icon={Users} label={t('sidebar.contacts')} itemKey="contatos" hasSub onClick={() => toggleMenu('contatos')} menuOpen={menuOpen} activeTab={activeTab}>
                            <SubMenuLink label={t('sidebar.all_contacts')} onClick={() => handleSubClick('contatos_lista')} />
                            <SubMenuLink label={t('sidebar.groups')} onClick={() => handleSubClick('contatos_grupos')} />
                        </MenuItem>
                    )}

                    {checkPermission(['Analista', 'Administrador']) && (
                        <MenuItem icon={Send} label={t('sidebar.broadcasts')} itemKey="disparos" hasSub onClick={() => toggleMenu('disparos')} menuOpen={menuOpen} activeTab={activeTab}>
                            <SubMenuLink label={t('sidebar.new_broadcast')} onClick={() => handleSubClick('disparos_novo')} />
                            <SubMenuLink label={t('sidebar.history')} onClick={() => handleSubClick('disparos_hist')} />
                        </MenuItem>
                    )}

                    <div className="mt-6 px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Inteligência</div>
                    <MenuItem icon={BookOpen} label={t('sidebar.knowledge')} itemKey="conhecimento" hasSub onClick={() => toggleMenu('conhecimento')} menuOpen={menuOpen} activeTab={activeTab}>
                        <SubMenuLink label={t('sidebar.articles')} onClick={() => handleSubClick('kb_artigos')} />
                        {checkPermission(['Analista', 'Administrador']) && (
                            <SubMenuLink label={t('sidebar.train_ai')} onClick={() => handleSubClick('kb_ia')} />
                        )}
                    </MenuItem>

                    {checkPermission(['Administrador']) && (
                        <MenuItem icon={Bot} label={t('sidebar.chatbot')} itemKey="chatbot" hasSub onClick={() => toggleMenu('chatbot')} menuOpen={menuOpen} activeTab={activeTab}>
                            <SubMenuLink label={t('sidebar.flows')} onClick={() => handleSubClick('chat_fluxos')} />
                            <SubMenuLink label={t('sidebar.ai_config')} onClick={() => handleSubClick('chat_ia')} />
                        </MenuItem>
                    )}

                    {checkPermission(['Administrador']) && (
                        <>
                            <div className="mt-6 px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Gestão</div>
                            <MenuItem icon={BarChart2} label={t('sidebar.analytics')} itemKey="analises" hasSub onClick={() => toggleMenu('analises')} menuOpen={menuOpen} activeTab={activeTab}>
                                <SubMenuLink label={t('sidebar.general_dash')} onClick={() => handleSubClick('ana_dash')} />
                                <SubMenuLink label={t('sidebar.team_performance')} onClick={() => handleSubClick('ana_team')} />
                            </MenuItem>

                            <MenuItem icon={Wrench} label={t('sidebar.tools')} itemKey="ferramentas" hasSub onClick={() => toggleMenu('ferramentas')} menuOpen={menuOpen} activeTab={activeTab}>
                                <SubMenuLink label={t('sidebar.channels')} onClick={() => handleSubClick('ferr_canais')} />
                                <SubMenuLink label={t('sidebar.privacy')} onClick={() => handleSubClick('ferr_lgpd')} />
                                <SubMenuLink label={t('sidebar.api')} onClick={() => handleSubClick('ferr_api')} />
                            </MenuItem>
                        </>
                    )}
                </div>
            </aside>
        </>
    );
}