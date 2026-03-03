import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
    onClose: () => void;
}

export function ShortcutsModal({ onClose }: ShortcutsModalProps) {

    // Lista de Atalhos (Pode ser expandida futuramente)
    const shortcuts = [
        {
            category: "Navegação", items: [
                { label: "Ir para o Início", keys: ["Alt", "H"] },
                { label: "Meus Tickets", keys: ["Alt", "T"] },
                { label: "Configurações", keys: ["Alt", "S"] }
            ]
        },
        {
            category: "Ações", items: [
                { label: "Novo Ticket", keys: ["Alt", "N"] },
                { label: "Salvar Alterações", keys: ["Ctrl", "S"] },
                { label: "Fechar Menus/Modais", keys: ["Esc"] }
            ]
        },
        {
            category: "Sistema", items: [
                { label: "Alternar Tema", keys: ["Alt", "D"] },
                { label: "Busca Global", keys: ["Ctrl", "K"] }
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop Escuro */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e20] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all scale-100">

                {/* Cabeçalho */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#252529]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Keyboard size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Atalhos de Teclado</h2>
                            <p className="text-xs text-gray-500">Agilize seu fluxo de trabalho</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Corpo */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {shortcuts.map((section, idx) => (
                        <div key={idx}>
                            <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider flex items-center gap-2">
                                {section.category === "Sistema" && <Command size={12} />}
                                {section.category}
                            </h3>
                            <div className="space-y-3">
                                {section.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                                            {item.label}
                                        </span>
                                        <div className="flex gap-1">
                                            {item.keys.map((k, kIdx) => (
                                                <kbd
                                                    key={kIdx}
                                                    className="px-2 py-1 min-w-[24px] text-center text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-[0px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[0px_2px_0px_0px_rgba(255,255,255,0.05)]"
                                                >
                                                    {k}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Rodapé */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-[#252529] border-t border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-[10px] text-gray-400">
                        Dica: Pressione <kbd className="font-bold">?</kbd> em qualquer tela para abrir este menu (Em breve)
                    </p>
                </div>
            </div>
        </div>
    );
}