import { useState } from 'react';
import { X, CheckCircle, ArrowRightLeft, Database, Lock, Globe } from 'lucide-react';

// Exportando a interface para o TicketDetail usar
export interface ResolutionData {
    tipo: string;
    causaRaiz: string;
    solucaoPublica: string;
    solucaoInterna: string;
    adicionarConhecimento: boolean;
}

// --- MODAL DE RESOLUÇÃO ---
interface ResolveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: ResolutionData) => void; // <--- Espera o objeto completo
}

export function ResolveModal({ isOpen, onClose, onConfirm }: ResolveModalProps) {
    // Removido o state 'step' que não estava sendo usado
    const [data, setData] = useState<ResolutionData>({
        tipo: 'Resolvido com Sucesso',
        causaRaiz: 'Configuração',
        solucaoPublica: '',
        solucaoInterna: '',
        adicionarConhecimento: true
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#1e1e20] w-full max-w-2xl rounded-2xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden flex flex-col max-h-[90vh]">

                <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-surface">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-green-600">
                        <CheckCircle size={22} /> Encerramento de Ticket
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Resultado Final</label>
                            <select
                                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 outline-none focus:border-green-500 text-light-text dark:text-dark-text"
                                value={data.tipo}
                                onChange={e => setData({ ...data, tipo: e.target.value })}
                            >
                                <option>Resolvido com Sucesso</option>
                                <option>Solução de Contorno (Workaround)</option>
                                <option>Parcialmente Resolvido</option>
                                <option>Não Reproduzível</option>
                                <option>Cancelado / Duplicado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Causa Raiz</label>
                            <select
                                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 outline-none focus:border-green-500 text-light-text dark:text-dark-text"
                                value={data.causaRaiz}
                                onChange={e => setData({ ...data, causaRaiz: e.target.value })}
                            >
                                <option>Erro de Configuração</option>
                                <option>Falha de Hardware</option>
                                <option>Bug de Software</option>
                                <option>Erro Operacional (Usuário)</option>
                                <option>Problema em Terceiros</option>
                                <option>Infraestrutura / Rede</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                            <Globe size={14} className="text-blue-500" /> Solução para o Cliente
                        </label>
                        <textarea
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 outline-none focus:ring-2 focus:ring-blue-500/20 h-24 resize-none text-sm text-light-text dark:text-dark-text"
                            placeholder="Descreva de forma clara e educada o que foi feito..."
                            value={data.solucaoPublica}
                            onChange={(e) => setData({ ...data, solucaoPublica: e.target.value })}
                        />
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                            <Lock size={14} className="text-orange-500" /> Detalhes Técnicos (Interno)
                        </label>
                        <textarea
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 outline-none focus:ring-2 focus:ring-orange-500/20 h-24 resize-none text-sm font-mono text-light-text dark:text-dark-text"
                            placeholder="Logs, comandos usados, passos técnicos..."
                            value={data.solucaoInterna}
                            onChange={(e) => setData({ ...data, solucaoInterna: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg text-purple-600 dark:text-purple-300">
                            <Database size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Treinar IA com esta solução?</p>
                            <p className="text-xs text-gray-500">O Kovia AI usará isso para aprender.</p>
                        </div>
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-purple-600 cursor-pointer"
                            checked={data.adicionarConhecimento}
                            onChange={(e) => setData({ ...data, adicionarConhecimento: e.target.checked })}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-surface border-t border-light-border dark:border-dark-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
                    <button
                        onClick={() => onConfirm(data)}
                        disabled={!data.solucaoPublica.trim()}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20 flex items-center gap-2"
                    >
                        <CheckCircle size={18} /> Encerrar Chamado
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- MODAL DE TRANSFERÊNCIA ---
interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (tipo: 'fila' | 'analista') => void;
}

export function TransferModal({ isOpen, onClose, onConfirm }: TransferModalProps) {
    const [tipo, setTipo] = useState<'fila' | 'analista'>('fila');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#1e1e20] w-full max-w-md rounded-2xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden">
                <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-surface">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-blue-600">
                        <ArrowRightLeft size={20} /> Encaminhar Ticket
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-500">Para onde deseja enviar este ticket?</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTipo('fila')}
                            className={`flex-1 p-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-2 ${tipo === 'fila' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'}`}
                        >
                            <ArrowRightLeft size={20} />
                            Devolver para Fila
                        </button>
                        <button
                            disabled
                            className="flex-1 p-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed text-gray-400"
                        >
                            <ArrowRightLeft size={20} />
                            Outro Analista
                        </button>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-surface border-t border-light-border dark:border-dark-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
                    <button
                        onClick={() => onConfirm(tipo)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}