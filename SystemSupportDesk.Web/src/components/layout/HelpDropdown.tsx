import { useTranslation } from 'react-i18next';
import { Book, LifeBuoy, Keyboard, ExternalLink, Info, MessageCircle } from 'lucide-react';

interface HelpDropdownProps {
    onClose: () => void;
    onNavigate: (tab: string) => void;
    onOpenShortcuts: () => void;
}

export function HelpDropdown({ onClose, onNavigate, onOpenShortcuts }: HelpDropdownProps) {
    const { t } = useTranslation();

    const items = [
        {
            icon: Book,
            label: t('header.docs'),
            desc: 'Guias e Tutoriais',
            action: () => onNavigate('kb_artigos')
        },
        {
            icon: LifeBuoy,
            label: t('header.support'),
            desc: 'Abrir chamado técnico',
            action: () => onNavigate('novo_ticket')
        },
        {
            icon: Keyboard,
            label: t('header.shortcuts'),
            desc: 'Teclas de atalho',
            action: onOpenShortcuts
        },
    ];

    const handleItemClick = (action: () => void) => {
        action();
        onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl border py-1 z-50 transform origin-top-right animate-fadeIn bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text dark:text-dark-text">

            <div className="px-4 py-3 border-b border-light-border dark:border-dark-border mb-1 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-sm font-bold">{t('header.help')}</h3>
                <p className="text-xs text-gray-500">Recursos e Suporte</p>
            </div>

            <div className="py-1">
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleItemClick(item.action)}
                        className="w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                        <item.icon size={18} className="text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">{item.label}</p>
                            <p className="text-[10px] text-gray-500">{item.desc}</p>
                        </div>
                        {item.label === t('header.docs') && (
                            <ExternalLink size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>
                ))}
            </div>

            <div className="px-2 pb-2">
                <button
                    onClick={() => handleItemClick(() => onNavigate('ia_support'))} // Redireciona para a tela cheia da IA
                    className="w-full py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:opacity-90 transition-all"
                >
                    <MessageCircle size={14} />
                    Falar com Kovia AI
                </button>
            </div>

            <div className="h-px bg-light-border dark:bg-dark-border my-1"></div>

            <div className="px-4 py-2 flex items-center justify-between text-[10px] text-gray-400">
                <div className="flex items-center gap-1">
                    <Info size={10} />
                    <span>{t('header.version')}</span>
                </div>
                <span>Build 2025.12</span>
            </div>
        </div>
    );
}