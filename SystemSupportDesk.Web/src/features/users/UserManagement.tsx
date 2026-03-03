import { useState, useEffect } from 'react';
import { Trash2, UserPlus, Mail, Briefcase, Loader2, Shield, Building2 } from 'lucide-react';
import api from '../../services/api'; // <--- CORREÇÃO: ../../

interface UsuarioDTO {
    id: number;
    nome: string;
    email: string;
    cargo: string;
    perfil: string;
    empresa: string;
}

export function UserManagement() {
    const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estados do Formulário
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [cargo, setCargo] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [perfil, setPerfil] = useState('Solicitante');

    // 1. Buscar Usuários da API    
    async function loadUsuarios() {
        try {
            setLoading(true);
            const response = await api.get('/usuarios');
            setUsuarios(response.data);
        } catch (error) {
            console.error("Erro ao listar usuários", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsuarios();
    }, []);

    // 2. Criar Novo Usuário
    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            // Envia o payload completo para o backend
            await api.post('/usuarios', {
                nome,
                email,
                cargo,
                perfil,
                empresa
            });

            alert('Usuário criado com sucesso! Senha padrão: 123456');
            setIsModalOpen(false);

            // Limpa form
            setNome(''); setEmail(''); setCargo(''); setEmpresa('');

            loadUsuarios(); // Recarrega lista
        } catch (error) {
            console.error(error);
            alert('Erro ao criar usuário. Verifique se o e-mail já existe ou se o backend está rodando.');
        }
    }

    // 3. Excluir Usuário
    async function handleDelete(id: number) {
        if (!confirm("Tem certeza? Essa ação é irreversível.")) return;
        try {
            await api.delete(`/usuarios/${id}`);
            setUsuarios(prev => prev.filter(u => u.id !== id));
        } catch {
            alert('Erro ao excluir. O usuário pode ter chamados vinculados.');
        }
    }

    // Helper de Cores
    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'Mestre': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Administrador': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Analista': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="p-6 md:p-10 flex-1 overflow-y-auto bg-light-bg dark:bg-dark-bg h-full relative">

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Gestão de Acessos</h1>
                    <p className="text-gray-500 text-sm">Gerencie quem tem acesso à plataforma Kovia.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-transform active:scale-95"
                >
                    <UserPlus size={18} /> Novo Usuário
                </button>
            </div>

            {/* Lista de Cards */}
            {loading ? (
                <div className="flex justify-center items-center h-64 text-primary">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {usuarios.map(u => (
                        <div key={u.id} className="bg-light-surface dark:bg-dark-surface p-5 rounded-xl border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-3 group hover:border-primary transition-colors relative">

                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase">
                                        {u.nome.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-light-text dark:text-dark-text leading-tight">{u.nome}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                            <Briefcase size={10} /> {u.cargo}
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(u.perfil)}`}>
                                    {u.perfil}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Mail size={12} className="text-gray-400" /> {u.email}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Building2 size={12} className="text-gray-400" /> {u.empresa || 'Kovia Desk'}
                                </div>
                            </div>

                            <div className="border-t border-light-border dark:border-dark-border pt-3 mt-auto flex justify-end">
                                {u.perfil !== 'Mestre' && (
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                        title="Remover acesso"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DE CRIAÇÃO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#202024] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-fadeIn">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            <Shield className="text-primary" /> Novo Usuário
                        </h2>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label htmlFor="nome" className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome Completo</label>
                                <input
                                    id="nome"
                                    required
                                    type="text"
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-gray-600 dark:text-white outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold uppercase text-gray-500 mb-1">E-mail Corporativo</label>
                                <input
                                    id="email"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-gray-600 dark:text-white outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label htmlFor="empresa" className="block text-xs font-bold uppercase text-gray-500 mb-1">Empresa</label>
                                <input
                                    id="empresa"
                                    required
                                    type="text"
                                    value={empresa}
                                    onChange={e => setEmpresa(e.target.value)}
                                    placeholder="Ex: Kovia Enterprise"
                                    className="w-full p-2 rounded border dark:bg-black/20 dark:border-gray-600 dark:text-white outline-none focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="cargo" className="block text-xs font-bold uppercase text-gray-500 mb-1">Cargo</label>
                                    <input
                                        id="cargo"
                                        required
                                        type="text"
                                        value={cargo}
                                        onChange={e => setCargo(e.target.value)}
                                        className="w-full p-2 rounded border dark:bg-black/20 dark:border-gray-600 dark:text-white outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="perfil" className="block text-xs font-bold uppercase text-gray-500 mb-1">Perfil de Acesso</label>
                                    <select
                                        id="perfil"
                                        value={perfil}
                                        onChange={e => setPerfil(e.target.value)}
                                        className="w-full p-2 rounded border dark:bg-black/20 dark:border-gray-600 dark:text-white outline-none focus:border-primary"
                                    >
                                        <option value="Solicitante">Solicitante (Cliente)</option>
                                        <option value="Analista">Analista (Suporte)</option>
                                        <option value="Administrador">Administrador</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded border dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 rounded bg-primary hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/20 transition">Criar Acesso</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}