import { X, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// CORREÇÃO AQUI: Importar do arquivo central de tipos
import type { NotificationItem } from '../../types/types';

interface NotificationDetailModalProps {
    notification: NotificationItem;
    onClose: () => void;
}

export function NotificationDetailModal({ notification, onClose }: NotificationDetailModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-lg bg-white dark:bg-[#1e1e20] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all scale-100">

                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#252529]">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Info size={18} className="text-primary" />
                        Detalhes da Notificação
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                        {notification.titulo}
                    </h2>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {notification.mensagem}
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={14} />
                        Recebido em: {format(new Date(notification.dataCriacao), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 dark:bg-[#252529] border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}