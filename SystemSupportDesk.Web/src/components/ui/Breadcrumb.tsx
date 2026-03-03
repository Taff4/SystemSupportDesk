import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    action?: () => void;
    active?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    onHome?: () => void; // <--- NOVA PROP: Ação ao clicar na casinha
}

export function Breadcrumb({ items, onHome }: BreadcrumbProps) {
    return (
        <nav className="flex items-center text-xs text-gray-500 mb-4 px-1 animate-fadeIn">
            {/* Botão Início (Home) agora é funcional */}
            <button
                onClick={onHome}
                className={`flex items-center transition-colors ${onHome ? 'hover:text-primary' : 'cursor-default'}`}
            >
                <Home size={14} className="mr-1" /> Início
            </button>

            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight size={14} className="mx-2 text-gray-300" />
                    <button
                        onClick={item.action}
                        disabled={!item.action || item.active}
                        className={`transition-colors text-xs ${item.active
                            ? 'font-bold text-primary cursor-default'
                            : item.action ? 'hover:text-gray-900 dark:hover:text-gray-300 hover:underline' : 'cursor-default'}`}
                    >
                        {item.label}
                    </button>
                </div>
            ))}
        </nav>
    );
}