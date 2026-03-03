import React from 'react'; // Essencial para compatibilidade
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Login } from './features/auth/Login';
import { Dashboard } from './pages/Dashboard';
import './lib/i18n';

function Routes() {
    const { signed, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-[#121214] text-gray-500">
                Carregando...
            </div>
        );
    }

    return signed ? <Dashboard /> : <Login />;
}

export default function App() {
    return (
        <SettingsProvider>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        <Routes />
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </SettingsProvider>
    );
}