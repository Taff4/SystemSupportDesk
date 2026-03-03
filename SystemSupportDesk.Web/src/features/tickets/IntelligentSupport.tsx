import { useState, useRef, useEffect } from 'react';
import { Send, Bot, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// --- TIPAGEM CORRETA ---
interface ChatMessage {
    author: 'me' | 'ia';
    text: string;
}

// Interface para resposta da API (ajuste conforme seu DTO real)
interface InteracaoAPI {
    id: number;
    mensagem: string;
    autor: { id: number; nome: string };
}

interface IntelligentSupportProps {
    onNavigate: (tab: string) => void;
}

export function IntelligentSupport({ onNavigate }: IntelligentSupportProps) {
    const { user } = useAuth();

    // Estados
    const [step, setStep] = useState<'welcome' | 'chat'>('welcome');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [ticketId, setTicketId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, loading]);

    // 1. Iniciar o Chat (Cria o ticket "Rascunho/IA")
    const handleStartChat = async (msgInicial: string) => {
        setStep('chat');
        setMessages([{ author: 'me', text: msgInicial }]);
        setLoading(true);

        try {
            // Cria o ticket. O Backend deve tratar 'Chatbot' para colocar status EmAnaliseIA
            const res = await api.post('/chamados', {
                titulo: "Atendimento via Chat IA",
                descricao: msgInicial,
                idCategoria: 1, // Geral/Hardware (Ajuste conforme seus IDs)
                idPrioridade: 2,
                tipoAtendimento: 'Chatbot'
            });

            setTicketId(res.data.id);

            // Simulação de espera da resposta inicial (Polling simples para MVP)
            // O ideal futuro é conectar o SignalR aqui também
            setTimeout(async () => {
                try {
                    const msgs = await api.get(`/interacoes/chamado/${res.data.id}`);
                    // Procura resposta do Robô (ID 99)
                    const respostaIA = msgs.data.find((m: InteracaoAPI) => m.autor.id === 99);

                    if (respostaIA) {
                        setMessages(prev => [...prev, { author: 'ia', text: respostaIA.mensagem }]);
                    }
                } catch (err) {
                    console.error("Erro ao buscar resposta IA", err);
                } finally {
                    setLoading(false);
                }
            }, 3000);

        } catch (err) {
            console.error(err);
            alert("Erro ao iniciar chat.");
            setStep('welcome');
        }
    };

    // 2. Enviar nova mensagem
    const handleSendMessage = async () => {
        if (!inputText.trim() || !ticketId) return;

        const text = inputText;
        setInputText('');
        setMessages(prev => [...prev, { author: 'me', text }]);
        setLoading(true);

        try {
            await api.post('/interacoes', { idChamado: ticketId, mensagem: text });

            // Polling simples (aguarda a IA processar e responder)
            setTimeout(async () => {
                try {
                    const msgs = await api.get(`/interacoes/chamado/${ticketId}`);
                    // Pega a última mensagem do Robô
                    const ultimasIA = msgs.data.filter((m: InteracaoAPI) => m.autor.id === 99);
                    const lastIA = ultimasIA[ultimasIA.length - 1];

                    // Se a última mensagem for diferente da que já temos, adiciona
                    if (lastIA && lastIA.mensagem !== messages[messages.length - 1]?.text) {
                        setMessages(prev => [...prev, { author: 'ia', text: lastIA.mensagem }]);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }, 3000);

        } catch {
            setLoading(false);
            alert("Erro de conexão.");
        }
    };

    // 3. Botão "Falar com Humano"
    const handleHumanHandover = async () => {
        if (!ticketId) return;
        try {
            // Envia comando para o Backend interceptar e transferir
            await api.post('/interacoes', { idChamado: ticketId, mensagem: "Quero falar com humano [HANDOFF]" });

            alert("Sua solicitação foi enviada para a fila de analistas!");
            onNavigate('tickets'); // Usa a navegação do Dashboard
        } catch {
            alert("Erro ao transferir.");
        }
    };

    // 4. Botão "Resolvido"
    const handleResolved = async () => {
        if (!ticketId) return;
        try {
            await api.patch(`/chamados/${ticketId}/resolver`);
            alert("Fico feliz em ter ajudado! Atendimento encerrado.");
            onNavigate('home'); // Volta para o início
        } catch {
            alert("Erro ao finalizar.");
        }
    };

    // --- TELA DE BOAS VINDAS ---
    if (step === 'welcome') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg p-6 h-full">
                <div className="max-w-md w-full bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden border border-light-border dark:border-dark-border">
                    <div className="bg-primary p-6 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Bot size={32} />
                        </div>
                        <h2 className="text-2xl font-bold">Olá, {user?.nome.split(' ')[0]}!</h2>
                        <p className="text-white/80 text-sm mt-1">Sou o Kovia AI. Como posso te ajudar hoje?</p>
                    </div>

                    <div className="p-6 space-y-3">
                        <button onClick={() => handleStartChat("Minha impressora parou")} className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group">
                            <span className="font-bold text-sm block group-hover:text-primary dark:text-gray-200">Problema com Hardware</span>
                            <span className="text-xs text-gray-500">Impressora, Mouse, Monitor...</span>
                        </button>
                        <button onClick={() => handleStartChat("Não consigo acessar o sistema")} className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group">
                            <span className="font-bold text-sm block group-hover:text-primary dark:text-gray-200">Acesso e Senhas</span>
                            <span className="text-xs text-gray-500">Login, VPN, Erro de senha...</span>
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-dark-surface px-2 text-gray-400">Ou digite abaixo</span></div>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black/20 outline-none focus:border-primary text-sm dark:text-white"
                                placeholder="Descreva seu problema..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleStartChat(e.currentTarget.value);
                                }}
                            />
                            <button onClick={() => {
                                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                if (input.value) handleStartChat(input.value);
                            }} className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Opção Manual */}
                <button onClick={() => onNavigate('novo_ticket')} className="mt-6 text-sm text-gray-500 hover:text-primary underline">
                    Prefiro abrir um formulário tradicional
                </button>
            </div>
        );
    }

    // --- TELA DO CHAT ---
    return (
        <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-[#0b141a] relative">
            {/* Header Chat */}
            <div className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border p-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-800 dark:text-white">Kovia AI</h3>
                        <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleResolved} className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1">
                        <CheckCircle size={14} /> Resolvido
                    </button>
                    <button onClick={handleHumanHandover} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-300 transition-colors">
                        Falar com Humano
                    </button>
                </div>
            </div>

            {/* Lista de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.author === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.author === 'me' ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-tl-none shadow-sm dark:text-gray-200'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-dark-surface p-3 rounded-2xl rounded-tl-none shadow-sm border border-light-border dark:border-dark-border">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-dark-surface border-t border-light-border dark:border-dark-border">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black/20 outline-none focus:border-primary text-sm dark:text-white"
                        placeholder="Digite sua mensagem..."
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage} className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}