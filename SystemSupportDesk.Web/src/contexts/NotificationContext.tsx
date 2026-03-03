import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import type { NotificationItem } from '../types/types';

interface NotificationContextData {
    notifications: NotificationItem[];
    unreadCount: number;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { signed } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const unreadCount = notifications.filter(n => !n.lida).length;

    // Função MANUAL (chamada por botões ou ações do usuário)
    const refreshNotifications = useCallback(async () => {
        if (!signed) return;
        try {
            const response = await api.get('/notificacoes');
            setNotifications(response.data);
        } catch (error) {
            console.error("Falha ao buscar notificações", error);
        }
    }, [signed]);

    // Lógica de leitura de notificação
    async function markAsRead(id: number) {
        // Atualização Otimista (Visual instantâneo)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
        try {
            await api.post(`/notificacoes/ler/${id}`);
        } catch {
            refreshNotifications(); // Reverte se der erro no servidor
        }
    }

    async function markAllAsRead() {
        setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
        try {
            await api.post('/notificacoes/ler-todas');
        } catch (error) {
            console.error("Erro ao marcar todas", error);
        }
    }

    // CORREÇÃO DO ERRO DO USEEFFECT
    // Definimos a lógica de busca INTERNAMENTE para o ciclo automático (polling).
    // Isso evita conflitos de dependência com a função 'refreshNotifications'.
    useEffect(() => {
        let isMounted = true;

        if (signed) {
            const fetchInternal = async () => {
                try {
                    const response = await api.get('/notificacoes');
                    if (isMounted) {
                        setNotifications(response.data);
                    }
                } catch (error) {
                    console.error("Erro no polling de notificações", error);
                }
            };

            // 1. Chama imediatamente ao montar/logar
            fetchInternal();

            // 2. Configura o intervalo de 30 segundos
            const interval = setInterval(fetchInternal, 30000);

            return () => {
                isMounted = false;
                clearInterval(interval);
            };
        }
    }, [signed]); // Dependência limpa: só reinicia se o status de login mudar

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);