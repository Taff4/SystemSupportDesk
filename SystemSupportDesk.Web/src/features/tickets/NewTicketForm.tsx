import { useState, useMemo } from 'react';
import { Upload, Save, Wrench, Briefcase, FileText, AlertTriangle, Tag, Type, ListTree } from 'lucide-react';
import api from '../../services/api';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTranslation } from 'react-i18next';

interface NewTicketProps {
    onCancel: () => void;
    onSuccess: () => void;
}

const DATA_TECNICO: Record<string, { label: string, subs: string[] }> = {
    '1': { label: 'Hardware & Equipamentos', subs: ['Computador não liga', 'Monitor com defeito', 'Teclado/Mouse', 'Impressora', 'Solicitar novo equipamento'] },
    '2': { label: 'Software & Sistemas', subs: ['Erro/Bug no Sistema', 'Instalação de Software', 'Lentidão', 'Office/Excel', 'Outros'] },
    '3': { label: 'Rede & Conectividade', subs: ['Sem Internet', 'Wifi Lento', 'VPN não conecta', 'Queda de conexão'] },
    '4': { label: 'Acesso & Segurança', subs: ['Resetar Senha', 'Desbloquear Conta', 'Permissão de Pasta', 'Criar Usuário'] },
};

const DATA_COMERCIAL: Record<string, { label: string, subs: string[] }> = {
    '5': { label: 'Financeiro', subs: ['Segunda via de Boleto', 'Nota Fiscal Errada', 'Dúvidas sobre Fatura', 'Reembolso'] },
    '6': { label: 'Contratos & Planos', subs: ['Alteração de Plano', 'Renovação Contratual', 'Cancelamento', 'Dúvidas Contratuais'] },
    '7': { label: 'Dados Cadastrais', subs: ['Atualizar Endereço', 'Alterar Razão Social', 'Troca de Titularidade'] },
    '8': { label: 'Parcerias', subs: ['Proposta de Parceria', 'Indicação de Cliente', 'Outros Assuntos'] },
};

export function NewTicketForm({ onCancel, onSuccess }: NewTicketProps) {
    const { t } = useTranslation();

    const [tipo, setTipo] = useState<'Tecnico' | 'Comercial'>('Tecnico');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [categoria, setCategoria] = useState('');
    const [subcategoria, setSubcategoria] = useState('');
    const [prioridade, setPrioridade] = useState('2');
    const [loading, setLoading] = useState(false);

    const currentData = tipo === 'Tecnico' ? DATA_TECNICO : DATA_COMERCIAL;
    const categoriasOpcoes = Object.entries(currentData).map(([id, data]) => ({ id, label: data.label }));
    const subcategoriasOpcoes = useMemo(() => categoria ? currentData[categoria]?.subs || [] : [], [categoria, currentData]);

    const handleTypeChange = (newType: 'Tecnico' | 'Comercial') => {
        setTipo(newType);
        setCategoria('');
        setSubcategoria('');
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const descricaoFinal = `[Contexto: ${tipo} > ${subcategoria}]\n\n${descricao}`;
        try {
            await api.post('/chamados', {
                titulo,
                descricao: descricaoFinal,
                idCategoria: Number(categoria),
                idPrioridade: Number(prioridade),
                tipoAtendimento: tipo
            });
            alert('Ticket criado com sucesso!');
            onSuccess();
        } catch {
            alert('Erro ao criar ticket.');
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm";
    const labelClass = "block text-xs font-bold uppercase text-gray-500 mb-2 tracking-wide flex items-center gap-1.5";
    const cardClass = "bg-light-surface dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border shadow-sm";

    return (
        <div className="flex-1 flex flex-col h-full bg-light-bg dark:bg-dark-bg p-6 md:p-10 animate-fadeIn overflow-y-auto">

            {/* Navegação Corrigida */}
            <div className="mb-6 shrink-0">
                <Breadcrumb
                    // Se clicar na casa, vai pro Dashboard (Isso é controlado pelo onNavigate no componente pai se necessário, mas aqui o onCancel volta pro nível anterior)
                    onHome={onCancel}
                    items={[
                        // REMOVIDO "ATENDIMENTO" para simplificar e alinhar com o pedido
                        { label: t('sidebar.overview'), action: onCancel }, // Volta para Visão Geral
                        { label: t('ticket.new_title'), active: true }      // Novo Ticket
                    ]}
                />
            </div>

            <div className="w-full max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-1">{t('ticket.new_title')}</h1>
                    <p className="text-gray-500">{t('ticket.new_subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* COLUNA ESQUERDA: CONFIGURAÇÕES */}
                        <div className="lg:col-span-1 space-y-6">

                            <div className={cardClass}>
                                <label className={labelClass}>{t('ticket.type_label')}</label>
                                <div className="space-y-3">
                                    <button type="button" onClick={() => handleTypeChange('Tecnico')}
                                        className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${tipo === 'Tecnico' ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                        <Wrench size={20} />
                                        <div>
                                            <span className="block font-bold text-sm">{t('ticket.tech_support')}</span>
                                            <span className="text-[10px] opacity-70 block">{t('ticket.tech_desc')}</span>
                                        </div>
                                    </button>
                                    <button type="button" onClick={() => handleTypeChange('Comercial')}
                                        className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${tipo === 'Comercial' ? 'border-blue-500 bg-blue-500/5 text-blue-500 ring-1 ring-blue-500' : 'border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                        <Briefcase size={20} />
                                        <div>
                                            <span className="block font-bold text-sm">{t('ticket.commercial')}</span>
                                            <span className="text-[10px] opacity-70 block">{t('ticket.commercial_desc')}</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className={cardClass}>
                                <div className="space-y-5">
                                    <div>
                                        <label className={labelClass}><Tag size={14} /> {t('ticket.category')} *</label>
                                        <div className="relative">
                                            <select value={categoria} onChange={e => setCategoria(e.target.value)} className={inputClass} required>
                                                <option value="" disabled>{t('ticket.select_option')}</option>
                                                {categoriasOpcoes.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-4 text-gray-400 pointer-events-none text-xs">▼</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}><ListTree size={14} /> {t('ticket.subcategory')} *</label>
                                        <div className="relative">
                                            <select value={subcategoria} onChange={e => setSubcategoria(e.target.value)} className={inputClass} disabled={!categoria} required>
                                                <option value="" disabled>{t('ticket.select_option')}</option>
                                                {subcategoriasOpcoes.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-4 text-gray-400 pointer-events-none text-xs">▼</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}><AlertTriangle size={14} /> {t('ticket.priority')}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { val: '3', label: t('ticket.priority_low'), color: 'bg-green-500' },
                                                { val: '2', label: t('ticket.priority_medium'), color: 'bg-yellow-500' },
                                                { val: '1', label: t('ticket.priority_high'), color: 'bg-red-500' }
                                            ].map((p) => (
                                                <button key={p.val} type="button" onClick={() => setPrioridade(p.val)}
                                                    className={`py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all 
                                                    ${prioridade === p.val
                                                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                                                            : 'border-light-border dark:border-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${p.color}`}></span> {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUNA DIREITA: CONTEÚDO */}
                        <div className={`lg:col-span-2 ${cardClass} flex flex-col justify-between h-fit min-h-[600px]`}>
                            <div className="space-y-6">
                                <div>
                                    <label className={labelClass}><Type size={14} /> {t('ticket.subject')} *</label>
                                    <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className={inputClass} placeholder="..." required />
                                </div>

                                <div>
                                    <label className={labelClass}><FileText size={14} /> {t('ticket.description')} *</label>
                                    <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={12} className={inputClass} placeholder="..." required />
                                </div>

                                <div className="p-8 border-2 border-dashed border-light-border dark:border-dark-border rounded-xl text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="text-primary" size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('ticket.upload_text')}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-light-border dark:border-dark-border">
                                <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold transition">
                                    {t('ticket.cancel')}
                                </button>
                                <button type="submit" disabled={loading || !subcategoria || !categoria}
                                    className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                                    <Save size={20} />
                                    {loading ? t('ticket.sending') : t('ticket.create')}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}