import React from 'react';
import { Mail, Shield, Tag, AlertCircle } from 'lucide-react';
import type { Chamado } from '../../../types/types';
import { getPriorityColor } from '../../../utils/ticketUtils';

interface InfoSidebarProps {
    chamado: Chamado;
    width: number;
    startResizing: () => void;
    sidebarRef: React.RefObject<HTMLDivElement | null>;
}

export function InfoSidebar({ chamado, width, startResizing, sidebarRef }: InfoSidebarProps) {
    return (
        <>
            <div
                onMouseDown={startResizing}
                className="hidden md:block w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-20 bg-transparent hover:w-1.5 active:bg-primary"
            />
            <div
                ref={sidebarRef}
                className="hidden md:flex flex-col gap-6 overflow-y-auto p-6 border-l border-light-border dark:border-dark-border bg-gray-50 dark:bg-[#121214]"
                style={{ width: width, minWidth: 250, maxWidth: 500 }}
            >
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Solicitante</h3>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-800 text-white flex items-center justify-center font-bold text-lg shadow-md">
                            {chamado.autor?.nome.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-light-text dark:text-dark-text">{chamado.autor?.nome}</p>
                            <p className="text-xs text-gray-500 truncate">{chamado.autor?.cargo || 'Colaborador'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-white dark:bg-dark-surface p-2 rounded border border-light-border dark:border-dark-border">
                        <Mail size={12} /> {chamado.autor?.email}
                    </div>
                </div>
                <div className="h-px bg-light-border dark:border-dark-border w-full"></div>
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Classificação</h3>
                    <div>
                        <span className="text-[10px] text-gray-500 mb-1 block flex items-center gap-1"><Tag size={10} /> Categoria</span>
                        <div className="p-2 rounded bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm font-medium text-light-text dark:text-dark-text">
                            {chamado.categoria?.nome}
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-500 mb-1 block flex items-center gap-1"><AlertCircle size={10} /> Prioridade</span>
                        <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border">
                            <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(chamado.prioridade?.nome || '')}`}></span>
                            <span className="text-sm font-bold text-light-text dark:text-dark-text">{chamado.prioridade?.nome}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-500 mb-1 block flex items-center gap-1"><Shield size={10} /> SLA</span>
                        <div className="p-2 rounded bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 text-xs font-bold text-green-600 dark:text-green-400">
                            Dentro do prazo
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}