import { Hand, PauseCircle, CheckCircle, ArrowRightLeft } from 'lucide-react';
import type { Chamado, Usuario } from '../../../types/types';

interface ActionToolbarProps {
    chamado: Chamado;
    user: Usuario | null;
    onAssumir: () => void;
    onResolver: () => void;
    onTransferir: () => void; // <--- NOVA PROP
}

export function ActionToolbar({ chamado, user, onAssumir, onResolver, onTransferir }: ActionToolbarProps) {
    const isAnalista = ['Analista', 'Administrador', 'Mestre'].includes(user?.perfil || '');
    const souResponsavel = chamado.responsavel?.id === user?.id;
    const estaResolvido = chamado.status === 'Resolvido' || chamado.status === 'Cancelado';

    return (
        <div className="bg-light-surface dark:bg-[#18181b] border-b border-light-border dark:border-dark-border px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 shadow-sm z-10">
            {/* Responsável */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Responsável:</span>
                {chamado.responsavel ? (
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg border border-light-border dark:border-dark-border">
                        <div className="w-5 h-5 rounded-full bg-primary text-[10px] text-white flex items-center justify-center font-bold">
                            {chamado.responsavel.nome.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-light-text dark:text-dark-text">{chamado.responsavel.nome}</span>
                    </div>
                ) : (
                    <span className="text-sm italic text-gray-400">Nenhum analista assumiu</span>
                )}
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2">
                {/* 1. ASSUMIR */}
                {isAnalista && !chamado.responsavel && !estaResolvido && (
                    <button
                        onClick={onAssumir}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md active:scale-95"
                    >
                        <Hand size={16} /> Assumir Ticket
                    </button>
                )}

                {/* 2. AÇÕES DO DONO */}
                {souResponsavel && !estaResolvido && (
                    <>
                        <button
                            onClick={onTransferir}
                            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                        >
                            <ArrowRightLeft size={16} /> Transferir
                        </button>

                        <button className="hidden md:flex items-center gap-2 border border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                            <PauseCircle size={16} /> Pausar
                        </button>

                        <button
                            onClick={onResolver}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md shadow-green-500/20 active:scale-95"
                        >
                            <CheckCircle size={16} /> Resolver
                        </button>
                    </>
                )}

                {estaResolvido && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-bold cursor-not-allowed">
                        <CheckCircle size={14} /> Finalizado
                    </div>
                )}
            </div>
        </div>
    );
}