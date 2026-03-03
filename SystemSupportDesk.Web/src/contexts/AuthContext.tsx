import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { AuthContextData, Usuario } from '../types/types';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    nameid: string;
    unique_name: string;
    email: string;
    role: string;
    Empresa: string;
    Cargo: string;
    FotoUrl: string;
    // === NOVOS CAMPOS DO TOKEN ===
    Telefone: string;
    LinkedIn: string;
    Bio: string;
    // =============================
    exp: number;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);

    function signOut() {
        localStorage.removeItem('ssd_user');
        localStorage.removeItem('ssd_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    }

    async function signIn(email: string, senha: string) {
        try {
            const response = await api.post('/auth/login', { email, senha });
            const { token } = response.data;

            const decoded = jwtDecode<JwtPayload>(token);

            const usuarioFormatado: Usuario = {
                id: Number(decoded.nameid),
                nome: decoded.unique_name,
                email: decoded.email,
                perfil: decoded.role,
                empresa: decoded.Empresa,
                cargo: decoded.Cargo,
                fotoUrl: decoded.FotoUrl,
                // === LENDO NOVOS CAMPOS ===
                telefone: decoded.Telefone,
                linkedIn: decoded.LinkedIn,
                bio: decoded.Bio
                // ==========================
            };

            localStorage.setItem('ssd_user', JSON.stringify(usuarioFormatado));
            localStorage.setItem('ssd_token', token);

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(usuarioFormatado);
        } catch (error) {
            console.error("Erro no login", error);
            throw error;
        }
    }

    useEffect(() => {
        const loadStorageData = async () => {
            const storedUser = localStorage.getItem('ssd_user');
            const storedToken = localStorage.getItem('ssd_token');

            if (storedUser && storedToken) {
                try {
                    const decoded = jwtDecode<JwtPayload>(storedToken);
                    const currentTime = Date.now() / 1000;

                    if (decoded.exp < currentTime) {
                        signOut();
                        setLoading(false);
                        return;
                    }

                    // Reconstrói o usuário a partir do Token para garantir dados frescos
                    const usuarioRecuperado: Usuario = {
                        id: Number(decoded.nameid),
                        nome: decoded.unique_name,
                        email: decoded.email,
                        perfil: decoded.role,
                        empresa: decoded.Empresa,
                        cargo: decoded.Cargo,
                        fotoUrl: decoded.FotoUrl,
                        // === LENDO NOVOS CAMPOS ===
                        telefone: decoded.Telefone,
                        linkedIn: decoded.LinkedIn,
                        bio: decoded.Bio
                        // ==========================
                    };

                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    setUser(usuarioRecuperado);
                } catch {
                    signOut();
                }
            }
            setLoading(false);
        };

        loadStorageData();
    }, []);

    return (
        <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}