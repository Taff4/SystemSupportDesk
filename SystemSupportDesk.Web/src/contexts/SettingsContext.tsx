import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; // <--- CORREÇÃO: import type separado
import i18n from '../lib/i18n';

interface SettingsData {
    language: string;
    timezone: string;
    notifications: boolean;
}

interface SettingsContextType {
    settings: SettingsData;
    updateSettings: (newSettings: SettingsData) => void;
    formatDate: (date: Date) => string;
}

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SettingsData>(() => {
        const saved = localStorage.getItem('ssd_settings');
        return saved ? JSON.parse(saved) : {
            language: 'pt-BR',
            timezone: 'America/Sao_Paulo',
            notifications: true
        };
    });

    useEffect(() => {
        i18n.changeLanguage(settings.language);
        localStorage.setItem('ssd_settings', JSON.stringify(settings));
        localStorage.setItem('ssd_language', settings.language);
    }, [settings]);

    function updateSettings(newSettings: SettingsData) {
        setSettings(newSettings);
        if (newSettings.notifications) {
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.volume = 0.2;
            audio.play().catch(() => { });
        }
    }

    function formatDate(date: Date) {
        return new Intl.DateTimeFormat(settings.language, {
            timeZone: settings.timezone,
            dateStyle: 'short',
            timeStyle: 'medium'
        }).format(date);
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, formatDate }}>
            {children}
        </SettingsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext);