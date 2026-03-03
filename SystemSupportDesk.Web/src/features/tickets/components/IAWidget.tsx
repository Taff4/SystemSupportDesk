import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, MessageSquare, Minimize2, Maximize2, Paperclip, FileText } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

interface ChatMessage {
    author: 'me' | 'ia';
    text: string;
    isFile?: boolean; // Flag para saber se é arquivo
}

interface InteracaoAPI {
    id: number;
    mensagem: string;
    autor: { id: number; nome: string };
}

export function IAWidget() {
    const { user } = useAuth();

    // --- ESTADOS COM PERSISTÊNCIA (localStorage) ---
    // A chave do storage inclui o ID do usuário para não misturar chats de contas diferentes
    const STORAGE_KEY = `kovia_widget_${user?.id}`;

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const [step, setStep] = useState<'welcome' | 'chat'>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved).step : 'welcome';
    });

    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved).messages : [];
    });

    const [ticketId, setTicketId] = useState<number | null>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved).ticketId : null;
    });

    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Salva no LocalStorage sempre que algo importante muda
    useEffect(() => {
        const stateToSave = { step, messages, ticketId };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [step, messages, ticketId, STORAGE_KEY]);

    // Scroll automático
    useEffect(() => {
        if (scrollRef.current && !isMinimized && isOpen) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading, isOpen, isMinimized]);

    // Limpar chat (se o usuário quiser resetar ou se o ticket for fechado)
    const clearChat = () => {
        localStorage.removeItem(STORAGE_KEY);
        setStep('welcome');
        setMessages([]);
        setTicketId(null);
    };

    const handleStartChat = () => {
        setStep('chat');
        // Só adiciona a msg inicial se não tiver histórico
        if (messages.length === 0) {
            setMessages([{ author: 'ia', text: `Olá ${user?.nome.split(' ')[0]}! Sou a Kovia AI. Como posso ajudar?` }]);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;
        const text = inputText;
        setInputText('');
        setMessages(prev => [...prev, { author: 'me', text }]);
        setLoading(true);

        try {
            let currentTicketId = ticketId;

            // Se não tem ticket, cria
            if (!currentTicketId) {
                const res = await api.post('/chamados', {
                    titulo: "Chat Widget Kovia AI",
                    descricao: text,
                    idCategoria: 1,
                    idPrioridade: 2,
                    tipoAtendimento: 'Chatbot'
                });
                currentTicketId = res.data.id;
                setTicketId(currentTicketId);
            } else {
                await api.post('/interacoes', { idChamado: currentTicketId, mensagem: text });
            }

            // Simulação de Polling para resposta (Ideal: SignalR)
            setTimeout(async () => {
                if (!currentTicketId) return;
                try {
                    const msgs = await api.get(`/interacoes/chamado/${currentTicketId}`);
                    const ultimasIA = msgs.data.filter((m: InteracaoAPI) => m.autor.id === 99);
                    const lastIA = ultimasIA[ultimasIA.length - 1];

                    if (lastIA && lastIA.mensagem !== messages[messages.length - 1]?.text) {
                        setMessages(prev => [...prev, { author: 'ia', text: lastIA.mensagem }]);
                    }
                } finally {
                    setLoading(false);
                }
            }, 3000);

        } catch {
            setLoading(false);
        }
    };

    // --- UPLOAD DE ARQUIVO ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Validação de Tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("O arquivo é muito grande. O limite é 5MB.");
            return;
        }

        // 2. Simulação de Envio (Já que o Backend ainda espera JSON)
        // Em produção: Usar FormData e endpoint de upload
        const fakeFileMsg = `📎 Arquivo enviado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

        setMessages(prev => [...prev, { author: 'me', text: fakeFileMsg, isFile: true }]);

        // Manda o nome do arquivo como texto pro backend saber que houve anexo
        // (Isso é provisório até termos endpoint de arquivo)
        if (ticketId) {
            api.post('/interacoes', { idChamado: ticketId, mensagem: `[ANEXO] ${file.name}` });
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50 animate-fadeIn"
            >
                <MessageSquare size={28} />
                {/* Indicador se tiver ticket ativo */}
                {ticketId && <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>}
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-80 md:w-96 bg-white dark:bg-[#1e1e20] rounded-2xl shadow-2xl border border-light-border dark:border-dark-border z-50 overflow-hidden flex flex-col transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>

            {/* Header */}
            <div className="bg-primary p-4 flex justify-between items-center text-white cursor-pointer" onClick={() => !isMinimized && setIsMinimized(true)}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Kovia AI</h3>
                        <p className="text-[10px] opacity-80">Assistente Virtual</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-white/10 rounded">
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    {/* Botão de Fechar com Reset opcional */}
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Conteúdo */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-dark-bg" ref={scrollRef}>
                        {step === 'welcome' ? (
                            <div className="text-center mt-10">
                                <Bot size={48} className="mx-auto text-primary mb-4" />
                                <h4 className="font-bold text-gray-800 dark:text-white">Olá!</h4>
                                <p className="text-sm text-gray-500 mb-6 px-4">Posso ajudar com dúvidas técnicas ou problemas no sistema.</p>
                                <button
                                    onClick={handleStartChat}
                                    className="px-6 py-2 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-dark transition-colors shadow-lg"
                                >
                                    Iniciar Conversa
                                </button>
                            </div>
                        ) : (
                            <>
                                {messages.map((m, idx) => (
                                    <div key={idx} className={`flex ${m.author === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm 
                                            ${m.author === 'me'
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-tl-none shadow-sm dark:text-gray-200'}
                                            ${m.isFile ? 'flex items-center gap-2 italic' : ''}
                                        `}>
                                            {m.isFile && <FileText size={16} />}
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-dark-surface p-3 rounded-2xl rounded-tl-none shadow-sm w-12">
                                            <div className="flex gap-1 justify-center"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span></div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {step === 'chat' && (
                        <div className="p-3 bg-white dark:bg-dark-surface border-t border-light-border dark:border-dark-border flex gap-2 items-center">

                            {/* Input de Arquivo Oculto */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                            />

                            {/* Botão de Clipe */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Anexar Arquivo (Max 5MB)"
                            >
                                <Paperclip size={20} />
                            </button>

                            <input
                                className="flex-1 p-2 bg-gray-100 dark:bg-black/20 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary dark:text-white"
                                placeholder="Digite..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button onClick={handleSendMessage} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                                <Send size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}