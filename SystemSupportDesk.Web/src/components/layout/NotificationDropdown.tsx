import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Info, AlertTriangle, MessageSquare, Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// CORREÇÃO 1: Importar o Hook do contexto
import { useNotifications } from '../../contexts/NotificationContext';
// CORREÇÃO 2: Importar o Tipo do arquivo de types
import type { NotificationItem } from '../../types/types';

import { NotificationDetailModal } from './NotificationDetailModal';

interface NotificationDropdownProps {
    onClose: () => void;
    onNavigate: (tab: string) => void;
}

export function NotificationDropdown({ onClose, onNavigate }: NotificationDropdownProps) {
    const { t } = useTranslation();
    const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
            case 'error': return <AlertTriangle size={16} className="text-red-500" />;
            case 'message': return <MessageSquare size={16} className="text-blue-500" />;
            case 'success': return <Check size={16} className="text-green-500" />;
            case 'ai': return <Bot size={16} className="text-purple-500" />;
            default: return <Info size={16} className="text-gray-500" />;
        }
    };

    const handleNotificationClick = (notif: NotificationItem) => {
        markAsRead(notif.id);

        if (notif.linkAction && notif.linkAction.length > 2) {
            onNavigate(notif.linkAction);
            onClose();
        } else {
            setSelectedNotification(notif);
        }
    };

    return (
        <>
            {selectedNotification && (
                <NotificationDetailModal
                    notification={selectedNotification}
                    onClose={() => setSelectedNotification(null)}
                />
            )}

            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-2xl border py-1 z-50 transform origin-top-right animate-fadeIn bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text dark:text-dark-text overflow-hidden">

                <div className="px-4 py-3 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <h3 className="text-sm font-bold">{t('header.notifications')}</h3>
                        <p className="text-xs text-gray-500">
                            {unreadCount > 0 ? `${unreadCount} não lidas` : t('header.no_notifications')}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wide"
                        >
                            {t('header.mark_all_read')}
                        </button>
                    )}
                </div>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                            <Bell size={32} className="opacity-20 mb-2" />
                            <p className="text-sm">{t('header.no_notifications')}</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`px-4 py-3 border-b border-light-border dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group relative ${!notif.lida ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.lida ? 'bg-white dark:bg-gray-700 shadow-sm' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        {getIcon(notif.tipo)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm ${!notif.lida ? 'font-bold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                                                {notif.titulo}
                                            </p>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(notif.dataCriacao), { addSuffix: true, locale: ptBR })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.mensagem}</p>

                                        {notif.tipo === 'ai' && (
                                            <span className="inline-block mt-1 text-[10px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-1.5 rounded">
                                                Kovia AI Insight
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!notif.lida && (
                                    <span className="absolute top-4 right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 text-center border-t border-light-border dark:border-dark-border">
                    <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        Fechar
                    </button>
                </div>
            </div>
        </>
    );
}