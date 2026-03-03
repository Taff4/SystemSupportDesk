import { useState, useEffect } from 'react';
import { Search, Inbox, User, Layers, FilterX } from 'lucide-react';
import api from '../../services/api';
import type { Chamado } from '../../types/types';
import { useAuth } from '../../contexts/AuthContext';
import { getStatusColor } from '../../utils/ticketUtils';

interface TicketQueueProProps {
    viewMode: 'meus' | 'geral' | 'setor';
    onSelectTicket: (chamado: Chamado) => void;
    selectedId?: number;
}

export function TicketQueuePro({ viewMode, onSelectTicket, selectedId }: TicketQueueProProps) {
    const { user } = useAuth();
    const [chamados, setChamados] = useState<Chamado[]>([]);
    const [loading, setLoading] = useState(false);
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroSetor, setFiltroSetor] = useState('Todos');
    const setores = ['Todos', 'Hardware', 'Software', 'Rede', 'Acesso'];

    useEffect(() => {
        carregarChamados();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, user]);

    async function carregarChamados() {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/chamados');
            let lista: Chamado[] = res.data;

            if (viewMode === 'meus') {
                const isStaff = ['Analista', 'Administrador', 'Mestre'].includes(user.perfil);

                if (isStaff) {
                    // CORREÇÃO CRÍTICA APLICADA:
                    // Mostra tickets onde sou Responsável OU onde sou Autor
                    lista = lista.filter(c => c.responsavel?.id === user.id || c.autor?.id === user.id);
                } else {
                    // Cliente só vê o que ele criou
                    lista = lista.filter(c => c.autor?.id === user.id);
                }
            }

            // Filtro Extra: Remover tickets que ainda estão "Em Analise IA" (se o backend mandar)
            // lista = lista.filter(c => c.status !== 'EmAnaliseIA');

            // Ordena mais recentes primeiro
            lista.sort((a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime());
            setChamados(lista);
        } catch (error) {
            console.error("Erro ao carregar fila", error);
        } finally {
            setLoading(false);
        }
    }

    const chamadosFiltrados = chamados.filter(t => {
        const matchTexto = t.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) || t.id.toString().includes(filtroTexto);
        const matchSetor = filtroSetor === 'Todos' || t.categoria?.nome === filtroSetor;
        return matchTexto && matchSetor;
    });

    return (
        <div className="w-full h-full flex flex-col bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border">
            {/* Header */}
            <div className="p-4 border-b border-light-border dark:border-dark-border shrink-0 space-y-3 bg-gray-50/50 dark:bg-dark-surface">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
                        {viewMode === 'meus' && <><User size={16} /> Meus Tickets</>}
                        {viewMode === 'geral' && <><Inbox size={16} /> Caixa de Entrada</>}
                        {viewMode === 'setor' && <><Layers size={16} /> Por Setor</>}
                    </h2>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {chamadosFiltrados.length}
                    </span>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar ID ou título..."
                        value={filtroTexto}
                        onChange={e => setFiltroTexto(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:ring-1 focus:ring-primary outline-none bg-white dark:bg-dark-bg border-light-border dark:border-dark-border text-light-text dark:text-dark-text transition-all"
                    />
                </div>

                {viewMode !== 'meus' && (
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {setores.map((setor) => (
                            <button
                                key={setor}
                                type="button"
                                onClick={() => setFiltroSetor(setor)}
                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full whitespace-nowrap transition-colors border
                                ${filtroSetor === setor
                                        ? 'bg-primary text-white border-primary'
                                        : 'border-light-border dark:border-dark-border text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                {setor}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Sincronizando...</div>
                ) : chamadosFiltrados.map((ticket) => (
                    <button
                        key={ticket.id}
                        type="button"
                        onClick={() => onSelectTicket(ticket)}
                        className={`w-full text-left p-4 border-b border-light-border dark:border-dark-border relative transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 group
                        ${selectedId === ticket.id ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary pl-[13px]' : 'pl-4 border-l-4 border-l-transparent'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`font-bold text-sm truncate w-40 ${selectedId === ticket.id ? 'text-primary' : 'text-light-text dark:text-dark-text'}`}>
                                {ticket.titulo}
                            </span>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                {new Date(ticket.dataAbertura).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 line-clamp-2 mb-2 h-8 leading-tight opacity-90">
                            {ticket.descricao}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-600">
                                    {ticket.autor?.nome.charAt(0)}
                                </div>
                                <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{ticket.autor?.nome.split(' ')[0]}</span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                        </div>
                    </button>
                ))}

                {chamadosFiltrados.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 opacity-50">
                        <FilterX size={32} className="mb-2" />
                        <p className="text-sm">Nada encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
}