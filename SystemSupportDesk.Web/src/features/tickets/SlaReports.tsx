import { useState, useEffect, useCallback } from 'react';
import {
    AlertTriangle, CheckCircle, Calendar,
    Zap, Activity, TrendingDown, TrendingUp, AlertOctagon,
    Download, ChevronDown, Filter, X, Eye, ArrowDownWideNarrow, ArrowUpNarrowWide
} from 'lucide-react';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

interface SlaReportsProps {
    onNavigate: (tab: string) => void;
}

// --- TIPAGEM ---
interface SlaMetrics {
    compliance: number;
    avgResponse: string;
    breached: number;
    totalTickets: number;
    deltaCompliance: string;
    deltaResponse: string;
}

interface ReportItem {
    ticket: number;
    categoria: string;
    agent: string;
    delay: string;
}

interface OffenderItem {
    id: number;
    categoria: string;
    breaches: number;
    avgDelay: string;
    avgDelayMinutes: number; // Campo auxiliar para ordenação
}

interface DashboardData {
    metrics: SlaMetrics;
    aging: { label: string; percent: number; color: string; count: number }[];
    offenders: OffenderItem[];
    fullReport: ReportItem[];
}

// --- MODAL RESPONSIVO ---
function DetailedReportModal({ onClose, data }: { onClose: () => void, data: ReportItem[] }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#1e1e20] rounded-2xl shadow-2xl border border-light-border dark:border-dark-border flex flex-col max-h-[90vh]">

                <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-surface rounded-t-2xl">
                    <div>
                        <h3 className="font-bold text-lg text-light-text dark:text-dark-text">Relatório Detalhado</h3>
                        <p className="text-xs text-gray-500">Lista completa de tickets fora do prazo.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* CORREÇÃO DE RESPONSIVIDADE: overflow-x-auto permite rolar a tabela horizontalmente no mobile */}
                <div className="flex-1 overflow-auto p-0 custom-scrollbar relative">
                    <div className="min-w-[700px]"> {/* Força largura mínima para não quebrar layout */}
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-dark-bg/50 text-xs uppercase text-gray-500 font-bold sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3">Ticket</th>
                                    <th className="px-6 py-3">Categoria</th>
                                    <th className="px-6 py-3">Responsável</th>
                                    <th className="px-6 py-3">Atraso</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-border dark:divide-dark-border text-light-text dark:text-dark-text">
                                {data.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors whitespace-nowrap">
                                        <td className="px-6 py-3 font-bold">#{item.ticket}</td>
                                        <td className="px-6 py-3">{item.categoria}</td>
                                        <td className="px-6 py-3 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                                                {item.agent.charAt(0)}
                                            </div>
                                            {item.agent}
                                        </td>
                                        <td className="px-6 py-3 text-rose-500 font-bold">{item.delay}</td>
                                        <td className="px-6 py-3">
                                            <span className="px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-900/20 text-rose-600 text-xs font-bold border border-rose-200 dark:border-rose-900">
                                                Violado
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button className="text-primary hover:underline text-xs font-bold flex items-center justify-end gap-1">
                                                <Eye size={14} /> Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL ---
export function SlaReports({ onNavigate }: SlaReportsProps) {

    // Estados de UI
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isOffenderFilterOpen, setIsOffenderFilterOpen] = useState(false); // Novo estado para o filtro de gargalos

    // Estados de Filtro e Dados
    const [selectedRange, setSelectedRange] = useState('Últimos 30 dias');
    const [offenderSort, setOffenderSort] = useState<'volume' | 'delay'>('volume'); // volume = qtd violações, delay = tempo medio
    const [loading, setLoading] = useState(true);

    const [data, setData] = useState<DashboardData>({
        metrics: { compliance: 0, avgResponse: '', breached: 0, totalTickets: 0, deltaCompliance: '', deltaResponse: '' },
        aging: [],
        offenders: [],
        fullReport: []
    });

    const fetchData = useCallback((range: string) => {
        setLoading(true);
        setSelectedRange(range);
        setIsDateMenuOpen(false);

        let factor = 1;
        if (range === 'Hoje') factor = 0.05;
        if (range === 'Últimos 7 dias') factor = 0.25;
        if (range === 'Este Ano') factor = 12;

        setTimeout(() => {
            const total = Math.floor(345 * factor);
            const breached = Math.floor(12 * factor);

            setData({
                metrics: {
                    compliance: range === 'Hoje' ? 100 : Number((94.2 - (Math.random() * 2)).toFixed(1)),
                    avgResponse: range === 'Hoje' ? '8m' : '1h 15m',
                    breached: breached,
                    totalTickets: total,
                    deltaCompliance: range === 'Hoje' ? '0%' : '+2.4%',
                    deltaResponse: range === 'Hoje' ? '-5m' : '-15m'
                },
                aging: [
                    { label: '< 4h', percent: 45, color: 'bg-emerald-500', count: Math.floor(total * 0.45) },
                    { label: '24h', percent: 30, color: 'bg-blue-500', count: Math.floor(total * 0.30) },
                    { label: '> 3 dias', percent: 10, color: 'bg-amber-500', count: Math.floor(total * 0.15) },
                    { label: '> 3 dias', percent: 10, color: 'bg-rose-500', count: Math.floor(total * 0.10) },
                ],
                offenders: [
                    { id: 1, categoria: "ERP / Integração", breaches: Math.max(1, Math.floor(breached * 0.6)), avgDelay: "4h", avgDelayMinutes: 240 },
                    { id: 2, categoria: "Infraestrutura", breaches: Math.max(0, Math.floor(breached * 0.3)), avgDelay: "1h 20m", avgDelayMinutes: 80 },
                    { id: 3, categoria: "Acesso & VPN", breaches: Math.max(0, Math.floor(breached * 0.1)), avgDelay: "30m", avgDelayMinutes: 30 },
                ],
                fullReport: Array.from({ length: Math.max(5, breached) }).map((_, i) => ({
                    ticket: 1000 + i,
                    categoria: ["ERP", "Rede", "Hardware", "Acesso"][i % 4],
                    agent: ["João Suporte", "Maria Silva", "Carlos Dev"][i % 3],
                    delay: `${Math.floor(Math.random() * 5) + 1}h ${Math.floor(Math.random() * 50)}m`
                }))
            });
            setLoading(false);
        }, 600);
    }, []);

    // --- CORREÇÃO DO ERRO DO REACT ---
    // Usamos setTimeout com 0ms para jogar a execução para o próximo ciclo de eventos
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData('Últimos 30 dias');
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchData]);

    // Lógica de Ordenação dos Gargalos
    const sortedOffenders = [...data.offenders].sort((a, b) => {
        if (offenderSort === 'volume') return b.breaches - a.breaches;
        if (offenderSort === 'delay') return b.avgDelayMinutes - a.avgDelayMinutes;
        return 0;
    });

    const handleExport = () => {
        alert("Download iniciado: sla_report.csv");
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-light-bg dark:bg-dark-bg p-6 md:p-10 animate-fadeIn overflow-y-auto">

            {isDetailModalOpen && <DetailedReportModal onClose={() => setIsDetailModalOpen(false)} data={data.fullReport} />}

            <div className="mb-6 shrink-0">
                <Breadcrumb
                    onHome={() => onNavigate('home')}
                    items={[
                        { label: 'Visão Geral', action: () => onNavigate('atendimento_home') },
                        { label: 'Relatórios SLA', active: true }
                    ]}
                />
            </div>

            <div className="w-full max-w-[1440px] mx-auto space-y-6 md:space-y-8 pb-8">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-light-border dark:border-dark-border pb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text mb-2 tracking-tight">Performance de Serviço</h1>
                        <p className="text-sm md:text-base text-gray-500">Análise de cumprimento de metas e eficiência.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleExport}
                            className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm shadow-sm"
                        >
                            <Download size={16} /> <span className="hidden sm:inline">Exportar CSV</span>
                        </button>

                        <div className="relative flex-1 md:flex-none">
                            <button onClick={() => setIsDateMenuOpen(!isDateMenuOpen)} className="w-full md:w-[180px] flex items-center justify-between gap-2 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm text-gray-700 dark:text-gray-200 hover:border-primary transition-colors">
                                <div className="flex items-center gap-2"><Calendar size={16} className="text-primary" /><span>{selectedRange}</span></div>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDateMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDateMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsDateMenuOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-full md:w-48 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-xl z-20 py-1 animate-fadeIn">
                                        {['Hoje', 'Últimos 7 dias', 'Últimos 30 dias', 'Este Ano'].map(range => (
                                            <button key={range} onClick={() => fetchData(range)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-light-text dark:text-dark-text">{range}</button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        <p className="text-sm text-gray-400 animate-pulse">Calculando métricas...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { label: "Cumprimento SLA", value: `${data.metrics.compliance}%`, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/20", delta: data.metrics.deltaCompliance, trend: 'good' },
                                { label: "Tempo 1ª Resposta", value: data.metrics.avgResponse, icon: Zap, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20", delta: data.metrics.deltaResponse, trend: 'good' },
                                { label: "Violações", value: data.metrics.breached, icon: AlertOctagon, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/20", delta: "+3", trend: 'bad' },
                                { label: "Tickets Totais", value: data.metrics.totalTickets, icon: Activity, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/20", delta: "+12", trend: 'neutral' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-5 md:p-6 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm flex flex-col justify-between h-36 md:h-40 hover:border-primary/30 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                                            <h3 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text group-hover:text-primary transition-colors">{item.value}</h3>
                                        </div>
                                        <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}><item.icon size={22} /></div>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs font-medium ${item.trend === 'good' ? 'text-emerald-500' : item.trend === 'bad' ? 'text-rose-500' : 'text-gray-500'}`}>
                                        {item.trend === 'good' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                        {item.delta} <span className="text-gray-400 font-normal">vs anterior</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">

                            {/* Aging */}
                            <div className="xl:col-span-2 bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl border border-light-border dark:border-dark-border shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="font-bold text-lg text-light-text dark:text-dark-text flex items-center gap-2">
                                        <Activity size={20} className="text-primary" /> Saúde do Backlog (Aging)
                                    </h3>
                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">Saudável</span>
                                </div>
                                <div className="w-full h-8 flex rounded-xl overflow-hidden mb-8 cursor-help shadow-inner bg-gray-100 dark:bg-gray-800">
                                    {data.aging.map((item, idx) => (
                                        <div key={idx} className={`${item.color} h-full transition-all duration-500 hover:brightness-110 relative group`} style={{ width: `${item.percent}%` }}></div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {data.aging.map((item, idx) => (
                                        <div key={idx} className="flex flex-col p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-light-border dark:hover:border-dark-border">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{item.label}</span>
                                            </div>
                                            <span className="text-xl font-bold text-light-text dark:text-dark-text">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Offenders & Filter */}
                            <div className="bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl border border-light-border dark:border-dark-border shadow-sm flex flex-col h-full relative">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-light-text dark:text-dark-text flex items-center gap-2">
                                        <AlertTriangle size={20} className="text-rose-500" /> Gargalos
                                    </h3>

                                    {/* BOTÃO FILTRO FUNCIONAL */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsOffenderFilterOpen(!isOffenderFilterOpen)}
                                            className="text-gray-400 hover:text-primary transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <Filter size={16} />
                                        </button>

                                        {isOffenderFilterOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setIsOffenderFilterOpen(false)}></div>
                                                <div className="absolute right-0 top-8 w-40 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-xl z-20 py-1 animate-fadeIn">
                                                    <button
                                                        onClick={() => { setOffenderSort('volume'); setIsOffenderFilterOpen(false); }}
                                                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800
                                                        ${offenderSort === 'volume' ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-300'}`}
                                                    >
                                                        <ArrowDownWideNarrow size={14} /> Por Volume
                                                    </button>
                                                    <button
                                                        onClick={() => { setOffenderSort('delay'); setIsOffenderFilterOpen(false); }}
                                                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800
                                                        ${offenderSort === 'delay' ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-300'}`}
                                                    >
                                                        <ArrowUpNarrowWide size={14} /> Por Tempo
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    {sortedOffenders.map((off, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-light-border dark:border-dark-border/50 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="font-mono text-xs font-bold text-gray-400 w-4">0{idx + 1}</div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors truncate">{off.categoria}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">Delay: {off.avgDelay}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-lg font-bold text-rose-500 block">{off.breaches}</span>
                                                <span className="text-[10px] text-gray-400">violações</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="w-full mt-6 py-3 rounded-xl border-2 border-dashed border-light-border dark:border-dark-border text-xs font-bold uppercase text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                                    onClick={() => setIsDetailModalOpen(true)}
                                >
                                    Ver Relatório Detalhado
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}