import { useState, useEffect } from 'react';
import { Clock, Filter, MoreHorizontal, LayoutList } from 'lucide-react';
// REMOVIDO: import { useAuth } ... pois não estava sendo usado
import api from '../../services/api';
import type { Chamado } from '../../types/types';
import { getStatusColor, getPriorityColor } from '../../utils/ticketUtils';

export function TicketQueue() {
    // REMOVIDO: const { user } = useAuth();

    const [chamados, setChamados] = useState<Chamado[]>([]);

    useEffect(() => {
        api.get('/chamados').then(res => setChamados(res.data));
    }, []);

    // Lógica de SLA Simplificada
    const getSlaText = (data: string) => {
        const diff = (new Date().getTime() - new Date(data).getTime()) / (1000 * 60 * 60);
        return diff > 24 ? `${Math.floor(diff / 24)} dias` : `${Math.floor(diff)}h`;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-light-bg dark:bg-dark-bg p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                        <LayoutList className="text-primary" /> Fila de Gestão
                    </h1>
                    <p className="text-sm text-gray-500">Visão tabular de todos os chamados.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg text-sm hover:bg-gray-50 transition shadow-sm">
                    <Filter size={16} /> Filtros Avançados
                </button>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-[#18181b] border-b border-light-border dark:border-dark-border uppercase text-[10px] font-bold text-gray-500 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Assunto</th>
                                <th className="px-6 py-4">Solicitante</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Prioridade</th>
                                <th className="px-6 py-4">Tempo</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                            {chamados.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500">#{ticket.id}</td>
                                    <td className="px-6 py-4 font-bold text-light-text dark:text-dark-text">{ticket.titulo}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                                                {ticket.autor?.nome.charAt(0)}
                                            </div>
                                            <span className="text-gray-600 dark:text-gray-300">{ticket.autor?.nome}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.prioridade?.nome || 'Baixa')}`}></span>
                                            {ticket.prioridade?.nome}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 flex items-center gap-1">
                                        <Clock size={14} /> {getSlaText(ticket.dataAbertura)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}