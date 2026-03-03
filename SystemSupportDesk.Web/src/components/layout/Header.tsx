import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
// ADICIONADO: Import do Contexto de Notificações para controlar a bolinha vermelha
import { useNotifications } from '../../contexts/NotificationContext';
import {
    Menu, HelpCircle, Bell, User,
    LogOut, ChevronDown, Moon, Sun, Settings
} from 'lucide-react';

import { NotificationDropdown } from './NotificationDropdown';
import { HelpDropdown } from './HelpDropdown';
import { ShortcutsModal } from './ShortcutsModal';

const API_URL = 'https://localhost:7275';

interface HeaderProps {
    onMenuClick: () => void;
    onNavigate: (tab: string) => void;
}

export function Header({ onMenuClick, onNavigate }: HeaderProps) {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation();

    // Lendo a contagem de não lidas
    const { unreadCount } = useNotifications();

    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    const isDark = theme === 'dark';
    const nomeEmpresa = user?.empresa || t('menu.company');
    const nomeCargo = user?.cargo || t('menu.role');

    const getAvatarUrl = () => {
        if (!user?.fotoUrl || imgError) return null;
        const path = user.fotoUrl.startsWith('/') ? user.fotoUrl : `/${user.fotoUrl}`;
        return `${API_URL}${path}`;
    };

    const avatarUrl = getAvatarUrl();

    const closeAll = () => setActiveMenu(null);

    const toggleMenu = (menuName: string) => {
        if (activeMenu === menuName) {
            setActiveMenu(null);
        } else {
            setActiveMenu(menuName);
        }
    };

    const handleNavigate = (tab: string) => {
        closeAll();
        onNavigate(tab);
    };

    const handleSignOut = () => {
        closeAll();
        signOut();
    };

    return (
        <>
            {/* 1. MODAL DE ATALHOS (Z-INDEX 60) */}
            {isShortcutsOpen && (
                <ShortcutsModal onClose={() => setIsShortcutsOpen(false)} />
            )}

            {/* 2. BACKDROP (Z-INDEX 40) */}
            {activeMenu && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={closeAll}></div>
            )}

            {/* 3. CABEÇALHO (Z-INDEX 50) */}
            <header className="h-14 bg-header flex items-center justify-between px-4 shrink-0 shadow-md z-50 text-white relative">

                {/* --- LADO ESQUERDO --- */}
                <div className="flex items-center gap-4">
                    <button onClick={onMenuClick} className="md:hidden p-1 hover:bg-white/10 rounded transition-colors">
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center font-bold text-sm tracking-tighter bg-primary rounded border-2 border-white/20 shadow-sm">
                            KV
                        </div>
                        <span className="font-bold tracking-[0.2em] text-sm hidden md:block mt-0.5">KOVIA</span>
                    </div>
                </div>

                {/* --- LADO DIREITO --- */}
                <div className="flex items-center">

                    <div className="flex items-center gap-1 sm:gap-2 border-r border-white/10 pr-2 sm:pr-4 mr-2 sm:mr-4">

                        {/* TEMA */}
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors">
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* AJUDA (?) */}
                        <div className="relative">
                            <button
                                onClick={() => toggleMenu('help')}
                                className={`p-2 rounded-full transition-colors hidden sm:block ${activeMenu === 'help' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                            >
                                <HelpCircle size={18} />
                            </button>
                            {activeMenu === 'help' && (
                                <HelpDropdown
                                    onClose={closeAll}
                                    onNavigate={handleNavigate}
                                    onOpenShortcuts={() => {
                                        closeAll();
                                        setIsShortcutsOpen(true);
                                    }}
                                />
                            )}
                        </div>

                        {/* NOTIFICAÇÕES (SINO) */}
                        <div className="relative">
                            <button
                                onClick={() => toggleMenu('notifications')}
                                className={`p-2 rounded-full transition-colors hidden sm:block ${activeMenu === 'notifications' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                            >
                                <Bell size={18} />
                                {/* BOLINHA VERMELHA CONDICIONAL (DADOS REAIS) */}
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-header animate-pulse"></span>
                                )}
                            </button>
                            {activeMenu === 'notifications' && (
                                <NotificationDropdown onClose={closeAll}
                                    onNavigate={handleNavigate}
                                />
                            )}
                        </div>
                    </div>

                    {/* DADOS DO USUÁRIO */}
                    <div className="hidden md:flex flex-col items-end mr-3 max-w-[160px]">
                        <span className="text-xs font-bold text-gray-200 truncate w-full text-right leading-tight">
                            {nomeEmpresa}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium tracking-wide truncate w-full text-right">
                            {nomeCargo}
                        </span>
                    </div>

                    {/* PERFIL (Avatar) */}
                    <div className="relative">
                        <button
                            onClick={() => toggleMenu('profile')}
                            className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors focus:outline-none ${activeMenu === 'profile' ? 'bg-white/10' : 'hover:bg-white/10'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-xs font-bold border border-gray-500 shadow-sm shrink-0 uppercase text-white overflow-hidden relative">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    user?.nome ? user.nome.substring(0, 2).toUpperCase() : 'US'
                                )}
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${activeMenu === 'profile' ? 'rotate-180' : ''}`} />
                        </button>

                        {/* MENU DROPDOWN DE PERFIL */}
                        {activeMenu === 'profile' && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border py-1 transform origin-top-right animate-fadeIn bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text dark:text-dark-text z-[60]">
                                <div className="px-4 py-3 border-b border-light-border dark:border-dark-border mb-1">
                                    <p className="text-sm font-bold truncate">{user?.nome}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <button onClick={() => handleNavigate('perfil')} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                                    <User size={16} className="text-primary" />
                                    {t('menu.profile')}
                                </button>
                                <button onClick={() => handleNavigate('configuracoes')} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                                    <Settings size={16} className="text-primary" />
                                    {t('menu.settings')}
                                </button>
                                <div className="h-px bg-light-border dark:bg-dark-border my-1"></div>
                                <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
                                    <LogOut size={16} />
                                    {t('menu.logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}