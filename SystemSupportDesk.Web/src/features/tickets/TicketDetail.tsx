import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, PanelRightClose, PanelRightOpen, MoreVertical, CheckCircle, Clock, UserCheck, ShieldAlert, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { Chamado } from '../../types/types';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTranslation } from 'react-i18next';

// Sub-componentes
import { ActionToolbar } from './components/ActionToolbar';
import { ChatArea } from './components/ChatArea';
import { InfoSidebar } from './components/InfoSidebar';
// IMPORTAÇÃO ATUALIZADA:
import { ResolveModal, TransferModal, ResolutionData } from './components/TicketModals';

interface TicketDetailProps {
    chamado: Chamado | null;
    onBack: () => void;
    onNavigate: (tab: string) => void;
}

export function TicketDetail({ chamado, onBack, onNavigate }: TicketDetailProps) {
    const { user } = useAuth();
    const { t } = useTranslation();

    // UI States
    const [infoWidth, setInfoWidth] = useState(300);
    const [isInfoVisible, setIsInfoVisible] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    // Estados para Modais
    const [showResolve, setShowResolve] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);

    const sidebarRef = useRef<HTMLDivElement>(null);
    const [, setTick] = useState(0);
    const forceUpdate = () => setTick(t => t + 1);

    const isStaff = ['Analista', 'Administrador', 'Mestre'].includes(user?.perfil || '');

    // --- AÇÕES ---

    const handleAssumir = async () => {
        if (!chamado || !user) return;
        setIsMenuOpen(false);
        try {
            await api.patch(`/chamados/${chamado.id}/assumir`);
            Object.assign(chamado, {
                status: 'EmAndamento',
                responsavel: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil }
            });
            forceUpdate();
        } catch { alert("Erro ao assumir."); }
    };

    // CORREÇÃO AQUI: Agora recebe o objeto ResolutionData
    const handleResolverConfirmado = async (data: ResolutionData) => {
        if (!chamado) return;
        try {
            // Fecha o ticket na API
            await api.patch(`/chamados/${chamado.id}/resolver`);

            // Monta mensagem de sistema formatada
            const mensagemSistema = `✅ **TICKET ENCERRADO**
--------------------------------
**Motivo:** ${data.tipo}
**Causa:** ${data.causaRaiz}

📝 **Solução:**
${data.solucaoPublica}

${data.adicionarConhecimento ? "🧠 *Aprendizado registrado na IA*" : ""}
            `;

            // Envia para o chat
            await api.post('/interacoes', {
                idChamado: chamado.id,
                mensagem: mensagemSistema
            });

            // Se tiver nota interna, poderia salvar em outro lugar, mas por enquanto vai no chat mesmo ou ignoramos
            // (Para um sistema real, teríamos uma tabela de 'NotasInternas', mas aqui simplificamos)

            Object.assign(chamado, { status: 'Resolvido' });
            setShowResolve(false);
            forceUpdate();
        } catch (error) {
            console.error(error);
            alert("Erro ao resolver.");
        }
    };

    const handleTransferirConfirmado = async (tipo: 'fila' | 'analista') => {
        if (!chamado) return;
        try {
            if (tipo === 'fila') {
                await api.post('/interacoes', {
                    idChamado: chamado.id,
                    mensagem: `🔄 **Ticket devolvido para a fila**`
                });

                // Simulação visual da devolução (No backend, precisaria do endpoint de devolver/cancelar atribuição)
                Object.assign(chamado, { status: 'Novo', responsavel: null });
            }
            setShowTransfer(false);
            setIsMenuOpen(false);
            forceUpdate();
        } catch { alert("Erro ao transferir."); }
    };

    // --- REDIMENSIONAMENTO ---
    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 250 && newWidth < 500) setInfoWidth(newWidth);
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    if (!chamado) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-[#0b141a] text-gray-400">
                <div className="bg-white dark:bg-dark-surface p-8 rounded-full mb-4 shadow-sm">
                    <CheckCircle size={48} className="opacity-20" />
                </div>
                <p>Selecione um ticket ao lado para visualizar os detalhes.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-light-bg dark:bg-dark-bg relative overflow-hidden">

            <ResolveModal
                isOpen={showResolve}
                onClose={() => setShowResolve(false)}
                onConfirm={handleResolverConfirmado}
            />
            <TransferModal
                isOpen={showTransfer}
                onClose={() => setShowTransfer(false)}
                onConfirm={handleTransferirConfirmado}
            />

            {/* HEADER */}
            <div className="px-6 py-4 border-b border-light-border dark:border-dark-border bg-white dark:bg-dark-surface shrink-0 z-20 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="hidden md:block">
                        <Breadcrumb
                            onHome={() => onNavigate('home')}
                            items={[{ label: t('sidebar.support') }, { label: t('sidebar.overview'), action: () => onNavigate('atendimento_home') }, { label: `Ticket #${chamado.id}`, active: true }]}
                        />
                    </div>
                    <button onClick={onBack} className="md:hidden flex items-center text-sm text-gray-500"><ArrowLeft size={16} /> Voltar</button>

                    <div className="flex items-center gap-2 relative">
                        <button onClick={() => setIsInfoVisible(!isInfoVisible)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            {isInfoVisible ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
                        </button>

                        <div className="relative">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                <MoreVertical size={20} />
                            </button>

                            {isMenuOpen && isStaff && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e1e20] rounded-xl shadow-xl border border-light-border dark:border-dark-border z-20 py-1 animate-fadeIn overflow-hidden">
                                        {!chamado.responsavel && (
                                            <button onClick={handleAssumir} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-200">
                                                <UserCheck size={16} className="text-primary" /> Assumir Ticket
                                            </button>
                                        )}
                                        <button onClick={() => { setIsMenuOpen(false); setShowTransfer(true); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-200">
                                            <ArrowRightLeft size={16} /> Encaminhar
                                        </button>
                                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                                        <button className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 text-red-500">
                                            <ShieldAlert size={16} /> Bloquear Usuário
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <h1 className="text-xl font-bold text-light-text dark:text-dark-text flex items-center gap-3">
                        {chamado.titulo}
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${chamado.status === 'Resolvido' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>
                            {chamado.status}
                        </span>
                    </h1>
                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg border border-light-border dark:border-dark-border">
                        <Clock size={14} />
                        <span>Aberto em {new Date(chamado.dataAbertura).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <ActionToolbar
                chamado={chamado}
                user={user}
                onAssumir={handleAssumir}
                onResolver={() => setShowResolve(true)}
                onTransferir={() => setShowTransfer(true)}
            />

            <div className="flex-1 flex overflow-hidden relative">
                <ChatArea chamado={chamado} user={user} />
                {isInfoVisible && <InfoSidebar chamado={chamado} width={infoWidth} startResizing={startResizing} sidebarRef={sidebarRef} />}
            </div>
            {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}
        </div>
    );
}