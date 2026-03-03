import { useState } from 'react';
import { Heart, X, FileText, Shield } from 'lucide-react';

export function Footer() {
    const [modalContent, setModalContent] = useState<'terms' | 'privacy' | null>(null);

    const legalText = {
        terms: {
            title: "Termos de Uso",
            icon: FileText,
            content: `1. Aceitação dos Termos\nAo acessar e utilizar o sistema Kovia Desk, você concorda em cumprir estes termos de serviço e todas as leis e regulamentos aplicáveis.\n\n2. Uso da Licença\nÉ concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Kovia Desk, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título.\n\n3. Isenção de Responsabilidade\nOs materiais no site da Kovia Desk são fornecidos "no estado em que se encontram". O Kovia Desk não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias.`
        },
        privacy: {
            title: "Política de Privacidade",
            icon: Shield,
            content: `1. Coleta de Dados\nSolicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemos isso por meios justos e legais, com o seu conhecimento e consentimento.\n\n2. Retenção de Dados\nApenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos.\n\n3. Compartilhamento\nNão compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.`
        }
    };

    return (
        <>
            {/* --- MODAL JURÍDICO --- */}
            {modalContent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalContent(null)}></div>
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e20] rounded-2xl shadow-2xl border border-light-border dark:border-dark-border flex flex-col max-h-[80vh]">

                        <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-surface rounded-t-2xl">
                            <h3 className="font-bold text-lg text-light-text dark:text-dark-text flex items-center gap-2">
                                {modalContent === 'terms' ? <FileText size={18} className="text-primary" /> : <Shield size={18} className="text-primary" />}
                                {legalText[modalContent].title}
                            </h3>
                            <button onClick={() => setModalContent(null)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {legalText[modalContent].content}
                            </p>
                        </div>

                        <div className="p-4 border-t border-light-border dark:border-dark-border bg-gray-50 dark:bg-dark-surface rounded-b-2xl text-right">
                            <button
                                onClick={() => setModalContent(null)}
                                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-colors"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FOOTER SLIM --- */}
            {/* Ajuste: py-3 (12px) para ficar fino e elegante */}
            <footer className="w-full py-3 px-6 border-t border-gray-200 dark:border-gray-800 bg-light-bg dark:bg-dark-bg transition-colors shrink-0 z-10">
                <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-2">

                    {/* Lado Esquerdo */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                        <span>&copy; {new Date().getFullYear()}</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">Kovia Desk</span>
                        <span className="hidden sm:inline text-gray-400">•</span>
                        <span className="hidden sm:flex items-center gap-1">
                            Feito com <Heart size={9} className="text-rose-500 fill-rose-500" /> para performance.
                        </span>
                    </div>

                    {/* Lado Direito */}
                    <div className="flex items-center gap-4 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        <button
                            onClick={() => setModalContent('terms')}
                            className="hover:text-primary dark:hover:text-primary transition-colors outline-none"
                        >
                            Termos
                        </button>
                        <button
                            onClick={() => setModalContent('privacy')}
                            className="hover:text-primary dark:hover:text-primary transition-colors outline-none"
                        >
                            Privacidade
                        </button>

                        <div className="h-3 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>

                        <span className="font-mono text-[10px] opacity-60 tracking-wide">v1.2.0</span>
                    </div>
                </div>
            </footer>
        </>
    );
}