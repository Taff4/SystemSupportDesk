import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, Lock, Mail, Loader2 } from 'lucide-react';

export function Login() {
    const { signIn, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        try {
            await signIn(email, senha);
        } catch {
            setError('Falha no login. Verifique suas credenciais.');
        }
    }

    const isDark = theme === 'dark';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300 bg-light-bg dark:bg-dark-bg">

            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-3 rounded-full transition-all bg-light-surface dark:bg-dark-surface text-gray-600 dark:text-yellow-400 shadow-sm hover:opacity-80"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl transition-all duration-300 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">

                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-purple-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <span className="text-3xl font-bold text-white tracking-tighter">KV</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-light-text dark:text-dark-text">Acesse o Kovia</h1>
                    <p className="text-sm text-gray-500">Gestão inteligente de atendimento</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                placeholder="E-mail corporativo"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border text-light-text dark:text-dark-text"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                placeholder="Senha de acesso"
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border text-light-text dark:text-dark-text"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar na Plataforma'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    &copy; 2025 Kovia Systems. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
}