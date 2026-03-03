import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Bot, CheckCheck } from 'lucide-react';
import type { Chamado, Usuario } from '../../../types/types';
import api from '../../../services/api';
// Importações do SignalR
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';

interface ChatAreaProps {
    chamado: Chamado;
    user: Usuario | null;
}

interface Interacao {
    id: number;
    mensagem: string;
    dataCriacao: string;
    autor: { id: number; nome: string; };
}

export function ChatArea({ chamado, user }: ChatAreaProps) {
    const [mensagens, setMensagens] = useState<Interacao[]>([]);
    const [novoTexto, setNovoTexto] = useState('');
    const [enviando, setEnviando] = useState(false);

    // Referências para a conexão e scroll
    const connectionRef = useRef<HubConnection | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Carga Inicial do Histórico (Via API REST)
    // Isso garante que você veja as mensagens antigas antes de conectar no real-time
    useEffect(() => {
        loadMensagens();
    }, [chamado.id]);

    // 2. Conexão Real-Time (SignalR)
    useEffect(() => {
        const token = localStorage.getItem('ssd_token');

        // Configura a conexão com o Hub
        const newConnection = new HubConnectionBuilder()
            // ATENÇÃO: A porta deve ser a mesma do Backend HTTP (5090)
            .withUrl('http://localhost:5090/hubs/chat', {
                accessTokenFactory: () => token || ''
            })
            .withAutomaticReconnect() // Tenta reconectar se a internet cair
            .configureLogging(LogLevel.Information)
            .build();

        // Configura o "Ouvinte" (Listener)
        // Quando o Backend disser "ReceberMensagem", executamos isso:
        newConnection.on('ReceberMensagem', (msg: Interacao) => {
            setMensagens(prev => {
                // Evita duplicar a mensagem se ela já estiver na lista (ex: delay de rede)
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        });

        // Inicia a conexão
        newConnection.start()
            .then(() => {
                console.log('🟢 SignalR Conectado!');
                // Entra na "Sala" específica deste ticket
                newConnection.invoke('EntrarNoTicket', chamado.id.toString());
            })
            .catch(err => console.error('Erro ao conectar SignalR:', err));

        connectionRef.current = newConnection;

        // Cleanup: Desconecta ao sair da tela para não gastar recursos
        return () => {
            newConnection.stop();
        };
    }, [chamado.id]);

    // Scroll automático para o fim sempre que chegar mensagem nova
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [mensagens]);

    async function loadMensagens() {
        try {
            const response = await api.get(`/interacoes/chamado/${chamado.id}`);
            setMensagens(response.data);
        } catch (error) {
            console.error("Erro ao carregar histórico", error);
        }
    }

    async function handleEnviar() {
        if (!novoTexto.trim()) return;
        setEnviando(true);

        try {
            // Enviamos via API REST (Post)
            // O Backend vai salvar no banco e disparar o aviso via SignalR
            await api.post('/interacoes', { idChamado: chamado.id, mensagem: novoTexto });

            // Apenas limpamos o input. 
            // A mensagem vai aparecer na lista quando o SignalR devolver o evento 'ReceberMensagem'
            setNovoTexto('');
        } catch {
            alert('Erro ao enviar mensagem.');
        } finally {
            setEnviando(false);
        }
    }

    const estaEncerrado = chamado.status === 'Encerrado' || chamado.status === 'Resolvido';

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#e5ddd5] dark:bg-[#0b141a]">
            {/* Pattern de fundo opcional */}
            <div className="absolute inset-0 opacity-5 dark:opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-20 md:pb-4 z-10">
                {/* Card do Chamado Original */}
                <div className="flex justify-center mb-6">
                    <div className="max-w-[90%] md:max-w-[70%] bg-white dark:bg-dark-surface border-l-4 border-l-primary rounded-r-lg shadow-md p-4 text-sm">
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 font-bold uppercase tracking-wider">
                            <Bot size={14} className="text-primary" /> Descrição do Ticket
                        </div>
                        <p className="whitespace-pre-wrap text-light-text dark:text-dark-text leading-relaxed">
                            {chamado.descricao}
                        </p>
                    </div>
                </div>

                {/* Mensagens */}
                {mensagens.map((msg, index) => {
                    const souEu = msg.autor.id === user?.id;
                    return (
                        // Key usa ID ou Index para evitar erro, animação de fadeIn adicionada
                        <div key={msg.id || index} className={`flex ${souEu ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                            <div className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 shadow-sm relative text-sm 
                                ${souEu
                                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-white rounded-tr-none'
                                    : 'bg-white dark:bg-dark-surface text-gray-900 dark:text-white rounded-tl-none'}`}
                            >
                                {!souEu && <p className="text-[10px] font-bold text-orange-500 mb-1">{msg.autor.nome}</p>}
                                <p className="whitespace-pre-wrap leading-snug">{msg.mensagem}</p>
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[9px] text-gray-500 dark:text-gray-300 opacity-80">
                                        {new Date(msg.dataCriacao).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {souEu && <CheckCheck size={12} className="text-blue-500" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            {!estaEncerrado ? (
                <div className="p-3 bg-gray-100 dark:bg-dark-surface border-t border-light-border dark:border-dark-border z-20">
                    <div className="flex items-end gap-2 max-w-4xl mx-auto">
                        <button className="p-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <Paperclip size={20} />
                        </button>
                        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl border border-transparent focus-within:border-primary transition-all flex items-center px-4 py-2">
                            <textarea
                                value={novoTexto}
                                onChange={e => setNovoTexto(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className="flex-1 max-h-32 min-h-[24px] bg-transparent outline-none text-sm resize-none text-gray-900 dark:text-white"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleEnviar();
                                    }
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleEnviar}
                            disabled={enviando || !novoTexto.trim()}
                            className="p-3 rounded-full bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-all shadow-md active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4 text-center bg-gray-100 dark:bg-dark-surface border-t border-light-border dark:border-dark-border z-20">
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                        <CheckCheck size={16} /> Este atendimento foi encerrado.
                    </p>
                </div>
            )}
        </div>
    );
}