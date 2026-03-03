import { useState, useCallback, useEffect } from 'react';

interface ResizablePanelProps {
    leftContent: React.ReactNode;
    rightContent: React.ReactNode;
    mobileView: 'list' | 'detail';
}

export function ResizablePanel({ leftContent, rightContent, mobileView }: ResizablePanelProps) {
    // Largura inicial fixa para evitar calculos errados na renderização
    const [leftWidth, setLeftWidth] = useState(350);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            // 256px é a largura da Sidebar principal. Ajustamos o offset.
            const newWidth = mouseMoveEvent.clientX - 256;
            if (newWidth > 250 && newWidth < 600) {
                setLeftWidth(newWidth);
            }
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

    return (
        <div className="flex w-full h-full overflow-hidden relative">

            {/* PAINEL ESQUERDO (LISTA) */}
            <div
                className={`flex-col h-full border-r border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface z-10 
                ${mobileView === 'detail' ? 'hidden md:flex' : 'flex w-full md:w-auto'}`}
                style={window.innerWidth >= 768 ? { width: leftWidth } : {}}
            >
                {leftContent}
            </div>

            {/* BARRA DE ARRASTAR (Apenas Desktop) */}
            <div
                onMouseDown={startResizing}
                className={`hidden md:block w-1 cursor-col-resize hover:bg-primary transition-colors z-20 h-full
                ${isResizing ? 'bg-primary' : 'bg-transparent'}`}
            />

            {/* PAINEL DIREITO (DETALHES) */}
            <div className={`flex-1 flex-col h-full min-w-0 bg-light-bg dark:bg-dark-bg ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
                {rightContent}
            </div>

            {/* Overlay transparente durante o drag */}
            {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}
        </div>
    );
}