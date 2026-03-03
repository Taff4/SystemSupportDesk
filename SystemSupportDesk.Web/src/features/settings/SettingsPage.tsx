import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
// Adicionado ArrowLeft
import { Bell, Moon, Globe, Monitor, Save, X, Clock, ArrowLeft } from 'lucide-react';

// Nova Interface
interface SettingsPageProps {
    onNavigate: (tab: string) => void;
}

// Recebe a prop
export function SettingsPage({ onNavigate }: SettingsPageProps) {
    const { theme, toggleTheme } = useTheme();
    const { settings, updateSettings, formatDate } = useSettings();
    const { t } = useTranslation();

    const [draft, setDraft] = useState(settings);
    const [draftTheme, setDraftTheme] = useState(theme);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hasChanges =
        JSON.stringify(draft) !== JSON.stringify(settings) ||
        draftTheme !== theme;

    const handleSave = () => {
        updateSettings(draft);
        if (draftTheme !== theme) {
            toggleTheme();
        }
        alert(t('success'));
    };

    const handleCancel = () => {
        setDraft(settings);
        setDraftTheme(theme);
    };

    return (
        <div className="p-6 md:p-10 h-full overflow-y-auto bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text pb-24">
            <div className="max-w-4xl mx-auto">

                {/* --- BOTÃO VOLTAR ADICIONADO --- */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => onNavigate('home')}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        title="Voltar para o Início"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">{t('settings')}</h1>
                        <p className="text-gray-500">Gerencie preferências do sistema.</p>
                    </div>
                </div>
                {/* -------------------------------- */}

                <div className="space-y-6">
                    {/* APARÊNCIA */}
                    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-light-border dark:border-dark-border pb-4">
                            <Monitor className="text-primary" size={24} />
                            <h2 className="text-lg font-bold">{t('appearance')}</h2>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{t('dark_mode')}</p>
                                <p className="text-xs text-gray-500 mt-1">Aplique salvando as alterações.</p>
                            </div>

                            <button
                                onClick={() => setDraftTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                                className={`relative w-14 h-8 rounded-full transition-colors ${draftTheme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${draftTheme === 'dark' ? 'translate-x-6' : 'translate-x-0'} flex items-center justify-center`}>
                                    {draftTheme === 'dark' ? <Moon size={14} className="text-primary" /> : <Monitor size={14} className="text-gray-400" />}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* GERAL */}
                    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-light-border dark:border-dark-border pb-4">
                            <Globe className="text-blue-500" size={24} />
                            <h2 className="text-lg font-bold">{t('general')}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">{t('language')}</label>
                                <select
                                    value={draft.language}
                                    onChange={(e) => setDraft({ ...draft, language: e.target.value })}
                                    className="w-full p-2.5 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg outline-none focus:border-primary transition-colors"
                                >
                                    <option value="pt-BR">Português (Brasil)</option>
                                    <option value="en-US">English (US)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">{t('timezone')}</label>
                                <select
                                    value={draft.timezone}
                                    onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
                                    className="w-full p-2.5 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg outline-none focus:border-primary transition-colors"
                                >
                                    <option value="America/Sao_Paulo">Brasília (GMT-03)</option>
                                    <option value="America/Manaus">Manaus (GMT-04)</option>
                                    <option value="America/New_York">New York (GMT-05)</option>
                                    <option value="Europe/London">London (GMT+0)</option>
                                </select>

                                <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary/10 p-2 rounded border border-primary/20">
                                    <Clock size={14} />
                                    <span>Preview: {formatDate(currentTime)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NOTIFICAÇÕES */}
                    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-light-border dark:border-dark-border pb-4">
                            <Bell className="text-orange-500" size={24} />
                            <h2 className="text-lg font-bold">{t('notifications')}</h2>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="font-medium">{t('alerts')}</p>
                            <button
                                onClick={() => setDraft({ ...draft, notifications: !draft.notifications })}
                                className={`relative w-14 h-8 rounded-full transition-colors ${draft.notifications ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${draft.notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BARRA FLUTUANTE */}
            <div className={`fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white dark:bg-[#1e1e20] border-t border-light-border dark:border-dark-border flex justify-end gap-4 transition-transform duration-300 z-50 ${hasChanges ? 'translate-y-0' : 'translate-y-full'}`}>
                <button
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold flex items-center gap-2"
                >
                    <X size={18} /> {t('cancel')}
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg flex items-center gap-2 animate-pulse"
                >
                    <Save size={18} /> {t('save')}
                </button>
            </div>
        </div>
    );
}