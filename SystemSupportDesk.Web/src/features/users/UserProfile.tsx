import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Camera, Save, Lock, User, Phone, Linkedin,
    FileText, Loader2, ArrowLeft, X, Pencil
} from 'lucide-react';
import api from '../../services/api';

interface UserProfileProps {
    onNavigate: (tab: string) => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
    const { user } = useAuth();

    // Estado de Edição
    const [isEditing, setIsEditing] = useState(false);

    // Dados Pessoais
    const [nome, setNome] = useState(user?.nome || '');
    const [telefone, setTelefone] = useState(user?.telefone || '');
    const [linkedIn, setLinkedIn] = useState(user?.linkedIn || '');
    const [bio, setBio] = useState(user?.bio || '');

    // Senha
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');

    // Imagem
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        resetForm();
    }, [user]);

    const resetForm = () => {
        if (user) {
            setNome(user.nome);
            setTelefone(user.telefone || '');
            setLinkedIn(user.linkedIn || '');
            setBio(user.bio || '');

            if (user.fotoUrl) {
                const urlLimpa = user.fotoUrl.startsWith('/') ? user.fotoUrl : `/${user.fotoUrl}`;
                setPreviewImage(`https://localhost:7275${urlLimpa}`);
            } else {
                setPreviewImage(null);
            }

            setFotoFile(null);
            setSenhaAtual('');
            setNovaSenha('');
            setIsEditing(false); // Sai do modo de edição ao resetar
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('Nome', nome);
            formData.append('Telefone', telefone);
            formData.append('LinkedIn', linkedIn);
            formData.append('Bio', bio);

            if (senhaAtual && novaSenha) {
                formData.append('SenhaAtual', senhaAtual);
                formData.append('NovaSenha', novaSenha);
            }

            if (fotoFile) {
                formData.append('Foto', fotoFile);
            }

            const res = await api.patch('/usuarios/perfil', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.fotoUrl) {
                setPreviewImage(`https://localhost:7275${res.data.fotoUrl}`);
            }

            alert('Perfil salvo com sucesso! \nPara refletir todas as alterações no cabeçalho, faça login novamente.');

            setSenhaAtual('');
            setNovaSenha('');
            setIsEditing(false); // Volta para modo leitura após salvar

        } catch (error: unknown) {
            console.error(error);
            const apiError = error as { response?: { data?: string | object } };

            let msg = 'Erro ao salvar.';
            if (apiError.response?.data) {
                msg = typeof apiError.response.data === 'object'
                    ? JSON.stringify(apiError.response.data)
                    : apiError.response.data;
            }
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    // Classe utilitária para inputs desabilitados
    const inputClass = `w-full p-2 rounded border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg outline-none transition-colors 
        ${isEditing ? 'focus:border-primary' : 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800'}`;

    return (
        <div className="p-6 h-full overflow-y-auto bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text relative pb-24">

            {/* CABEÇALHO */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onNavigate('home')}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        title="Voltar para o Início"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">Meu Perfil</h1>
                </div>

                {/* BOTÃO HABILITAR EDIÇÃO (Só aparece se NÃO estiver editando) */}
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
                    >
                        <Pencil size={16} />
                        Editar Perfil
                    </button>
                )}
            </div>

            <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* FOTO */}
                <div className="md:col-span-1">
                    <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border text-center">
                        <div className={`relative inline-block mb-4 ${isEditing ? 'cursor-pointer group' : 'cursor-default'}`}>
                            <div
                                onClick={() => isEditing && fileInputRef.current?.click()}
                                className={`w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mx-auto border-4 border-transparent shadow-md relative 
                                ${isEditing ? 'group-hover:border-primary transition-all' : ''}`}
                            >
                                {previewImage ? (
                                    <img src={previewImage} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-500">{user?.nome.charAt(0)}</span>
                                )}

                                {/* Overlay da Câmera só aparece se estiver editando */}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                                disabled={!isEditing}
                            />
                        </div>
                        <h2 className="text-xl font-bold">{user?.nome}</h2>
                        <p className="text-sm text-gray-500">{user?.cargo}</p>
                        <p className="text-xs text-primary mt-1 font-bold">{user?.empresa}</p>
                    </div>
                </div>

                {/* DADOS */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border">
                        <div className="flex items-center gap-2 mb-4 border-b border-light-border dark:border-dark-border pb-2">
                            <User size={20} className="text-primary" />
                            <h3 className="font-bold">Dados Pessoais</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                    disabled={!isEditing}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={telefone}
                                        onChange={e => setTelefone(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        disabled={!isEditing}
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">LinkedIn</label>
                                <div className="relative">
                                    <Linkedin size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={linkedIn}
                                        onChange={e => setLinkedIn(e.target.value)}
                                        placeholder="https://linkedin.com/in/..."
                                        disabled={!isEditing}
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / Sobre</label>
                                <div className="relative">
                                    <FileText size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                    <textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="Conte um pouco sobre você..."
                                        rows={3}
                                        disabled={!isEditing}
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border transition-opacity ${!isEditing ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="flex items-center gap-2 mb-4 border-b border-light-border dark:border-dark-border pb-2">
                            <Lock size={20} className="text-primary" />
                            <h3 className="font-bold">Alterar Senha</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Senha Atual</label>
                                <input
                                    type="password"
                                    value={senhaAtual}
                                    onChange={e => setSenhaAtual(e.target.value)}
                                    disabled={!isEditing}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nova Senha</label>
                                <input
                                    type="password"
                                    value={novaSenha}
                                    onChange={e => setNovaSenha(e.target.value)}
                                    disabled={!isEditing}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BARRA DE AÇÃO (SÓ APARECE SE ESTIVER EDITANDO) */}
            {isEditing && (
                <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white dark:bg-[#1e1e20] border-t border-light-border dark:border-dark-border flex justify-end gap-4 z-50 animate-fadeIn">
                    <button
                        onClick={resetForm}
                        className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                        <X size={18} /> Cancelar
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {loading ? <><Loader2 className="animate-spin" size={18} /> Salvando...</> : <><Save size={18} /> Salvar Alterações</>}
                    </button>
                </div>
            )}
        </div>
    );
}