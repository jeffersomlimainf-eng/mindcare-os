import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { showToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { exportData, importData } from '../utils/backup';

const maskCpfCnpj = (value) => {
    let r = value.replace(/\D/g, '');
    if (r.length > 14) r = r.substring(0, 14);
    if (r.length <= 11) {
        return r.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return r.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})/, '$1-$2');
};

const Configuracoes = () => {
    const navigate = useNavigate();
    const { darkMode, setDarkMode } = useTheme();
    const { user, updateUser, updateConfigs, changePassword, logout } = useUser();
    const fileInputRef = useRef(null);
    
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            await updateUser({ avatar_url: publicUrl });
            showToast('Foto de perfil atualizada!', 'success');
        } catch (error) {
            console.error('Erro ao enviar foto:', error.message);
            showToast('Erro ao enviar foto.', 'error');
        }
    };

    // Estado local para o formulário (para não salvar a cada tecla se não quiser, mas aqui vamos usar real-time ou botão)
    const [formData, setFormData] = useState({
        nome: user.nome,
        email: user.email,
        crp: user.crp,
        telefone: user.telefone,
        clinic_name: user.clinic_name || user.clinica?.nome || '',
        clinic_cnpj: maskCpfCnpj(user.clinic_cnpj || user.clinica?.cnpjCpf || '')
    });

    const [passwordData, setPasswordData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);


    const [configs, setConfigs] = useState(user.configuracoes);

    // Estado para chave Pix
    const [pixData, setPixData] = useState({
        tipoChavePix: user.configuracoes?.tipoChavePix || 'cpf',
        chavePix: user.configuracoes?.chavePix || '',
    });

    useEffect(() => {
        setFormData({
            nome: user.nome,
            email: user.email,
            crp: user.crp,
            telefone: user.telefone,
            clinic_name: user.clinic_name || user.clinica?.nome || '',
            clinic_cnpj: maskCpfCnpj(user.clinic_cnpj || user.clinica?.cnpjCpf || '')
        });
        setConfigs(user.configuracoes);
        setPixData({
            tipoChavePix: user.configuracoes?.tipoChavePix || 'cpf',
            chavePix: user.configuracoes?.chavePix || '',
        });
    }, [user]);

    const handleSaveProfile = () => {
        updateUser(formData);
        showToast('Perfil atualizado com sucesso!', 'success');
    };

    const handleSaveClinic = () => {
        updateUser(formData);
        showToast('Dados da clínica atualizados com sucesso!', 'success');
    };

    const handleSavePix = () => {
        updateConfigs(pixData);
        showToast('Chave Pix salva com sucesso!', 'success');
    };

    const handleConfigToggle = (key, value) => {
        const newConfigs = { ...configs, [key]: value };
        setConfigs(newConfigs);
        updateConfigs({ [key]: value });
    };

    const handleChangePassword = async () => {
        const { novaSenha, confirmarSenha } = passwordData;

        if (!novaSenha || !confirmarSenha) {
            showToast('Preencha os campos de nova senha.', 'error');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            showToast('As novas senhas não coincidem.', 'error');
            return;
        }

        if (novaSenha.length < 6) {
            showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        setChangingPassword(true);
        const result = await changePassword(null, novaSenha); // Passed null for currentPassword
        setChangingPassword(false);

        if (result.success) {
            showToast('Senha atualizada com sucesso!', 'success');
            setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
        } else {
            showToast(result.message || 'Erro ao alterar senha.', 'error');
        }
    };



    const Toggle = ({ value, onChange }) => (
        <button
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
            <span className={`inline-block size-4 transform rounded-full bg-white shadow-md transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    return (
        <div className="space-y-6 max-w-3xl pb-20">
            <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                    <span className="material-symbols-outlined text-sm">settings</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Sistema</span>
                </div>
                <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black italic tracking-tight">Configurações</h1>
                <p className="text-slate-500 font-medium">Gerencie suas preferências e dados do sistema</p>
            </div>

            {/* Perfil */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">person</span>
                        </div>
                        Perfil Profissional
                    </h2>
                </div>
                <div className="p-4 md:p-8 space-y-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 mb-4 text-center md:text-left">
                        <div className="size-20 rounded-full flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="Perfil" className="size-full object-cover" />
                            ) : (
                                <div className="size-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-black text-3xl">
                                    {formData.nome ? formData.nome.charAt(formData.nome.startsWith('Dr.') ? 4 : 0) : '?'}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-black text-2xl text-slate-900 dark:text-white mb-0.5">{formData.nome}</p>
                            <p className="text-sm font-bold text-slate-500">{user.especialidade} · CRP {formData.crp}</p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageChange} 
                                className="hidden" 
                                accept="image/*" 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-primary font-black uppercase tracking-widest hover:underline mt-2 flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-sm">photo_camera</span>
                                Alterar foto
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: 'Nome Completo', key: 'nome', type: 'text', icon: 'badge', placeholder: 'Digite seu nome completo...' },
                            { label: 'E-mail Profissional', key: 'email', type: 'email', icon: 'mail', placeholder: 'Digite seu e-mail...' },
                            { label: 'Registro Profissional (CRP)', key: 'crp', type: 'text', icon: 'verified', placeholder: 'Digite seu CRP...' },
                            { label: 'Telefone de Contato', key: 'telefone', type: 'tel', icon: 'call', placeholder: 'Digite seu telefone...' },
                        ].map((f) => (
                            <div key={f.key} className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    <span className="material-symbols-outlined text-sm">{f.icon}</span>
                                    {f.label}
                                </label>
                                <input
                                    type={f.type}
                                    value={formData[f.key] || ''}
                                    onChange={(e) => {
                                        let v = e.target.value;
                                        if (f.key === 'crp') {
                                            let cleaned = v.replace(/\D/g, '');
                                            v = cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 9)}` : cleaned;
                                        } else if (f.key === 'telefone') {
                                            let cleaned = v.replace(/\D/g, '');
                                            if (cleaned.length > 10) {
                                                v = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
                                            } else if (cleaned.length > 6) {
                                                v = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
                                            } else if (cleaned.length > 2) {
                                                v = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
                                            } else {
                                                v = cleaned;
                                            }
                                        }
                                        setFormData({ ...formData, [f.key]: v });
                                    }}
                                    className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 dark:text-slate-100 font-bold outline-none transition-all shadow-sm"
                                    placeholder={f.placeholder}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSaveProfile}
                            className="px-8 py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">save</span>
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>

            {/* Dados da Clínica */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-500 text-xl">domain</span>
                        </div>
                        Dados da Clínica
                    </h2>
                </div>
                <div className="p-4 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <span className="material-symbols-outlined text-sm">apartment</span>
                                Nome da Clínica
                            </label>
                            <input
                                type="text"
                                value={formData.clinic_name}
                                onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                                className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-slate-900 dark:text-slate-100 font-bold outline-none transition-all shadow-sm"
                                placeholder="Ex: Clínica Equilíbrio..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <span className="material-symbols-outlined text-sm">payments</span>
                                CNPJ ou CPF (Principal)
                            </label>
                            <input
                                type="text"
                                value={formData.clinic_cnpj}
                                onChange={(e) => setFormData({ ...formData, clinic_cnpj: maskCpfCnpj(e.target.value) })}
                                className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-slate-900 dark:text-slate-100 font-bold outline-none transition-all shadow-sm"
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSaveClinic}
                            className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">save</span>
                            Salvar Dados da Clínica
                        </button>
                    </div>
                </div>
            </div>

            {/* Dados para Recebimento Pix */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-teal-500 text-xl">qr_code_2</span>
                        </div>
                        Dados para Recebimento (Pix)
                    </h2>
                </div>
                <div className="p-4 md:p-8 space-y-6">
                    <p className="text-sm text-slate-500 font-medium">Sua chave Pix é usada para gerar o link de cobrança enviado ao paciente.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <span className="material-symbols-outlined text-sm">key</span>
                                Tipo de Chave
                            </label>
                            <select
                                value={pixData.tipoChavePix}
                                onChange={(e) => setPixData({ ...pixData, tipoChavePix: e.target.value })}
                                className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-slate-900 dark:text-slate-100 font-bold outline-none transition-all shadow-sm"
                            >
                                <option value="cpf">CPF</option>
                                <option value="cnpj">CNPJ</option>
                                <option value="telefone">Telefone</option>
                                <option value="email">E-mail</option>
                                <option value="aleatoria">Chave Aleatória</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <span className="material-symbols-outlined text-sm">qr_code</span>
                                Chave Pix
                            </label>
                            <input
                                type="text"
                                name="pix-key-field"
                                autoComplete="off"
                                value={pixData.chavePix}
                                onChange={(e) => setPixData({ ...pixData, chavePix: e.target.value })}
                                className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-slate-900 dark:text-slate-100 font-bold outline-none transition-all shadow-sm"
                                placeholder="Digite sua chave Pix..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSavePix}
                            className="px-8 py-4 bg-teal-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-teal-500/20 hover:bg-teal-600 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">save</span>
                            Salvar Chave Pix
                        </button>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notificações */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">notifications</span>
                            </div>
                            Notificações
                        </h2>
                    </div>
                    <div className="p-4 md:p-8 space-y-6">
                        {[
                            { label: 'E-mail Clínico', desc: 'Avisos de novas consultas', key: 'notifEmail' },
                            { label: 'WhatsApp', desc: 'Lembretes para pacientes', key: 'notifWhatsapp' },
                            { label: 'Lembrete Inteligente', desc: 'Aviso 24h antes da sessão', key: 'notifLembrete' },
                        ].map((n) => (
                            <div key={n.key} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{n.label}</p>
                                    <p className="text-[11px] font-bold text-slate-400">{n.desc}</p>
                                </div>
                                <Toggle value={configs[n.key]} onChange={(val) => handleConfigToggle(n.key, val)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Aparência */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">palette</span>
                            </div>
                            Personalização
                        </h2>
                    </div>
                    <div className="p-4 md:p-8 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">Modo Escuro</p>
                                <p className="text-[11px] font-bold text-slate-400">Alternar tema do sistema</p>
                            </div>
                            <Toggle value={darkMode} onChange={setDarkMode} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Segurança */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-orange-500 text-xl">lock</span>
                        </div>
                        Segurança e Acesso
                    </h2>
                </div>
                <div className="p-4 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: 'Nova Senha', key: 'novaSenha', icon: 'key' },
                            { label: 'Confirmar Nova Senha', key: 'confirmarSenha', icon: 'key' },
                        ].map((f) => (

                            <div key={f.key} className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    <span className="material-symbols-outlined text-sm">{f.icon}</span>
                                    {f.label}
                                </label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    value={passwordData[f.key]}
                                    onChange={(e) => setPasswordData({ ...passwordData, [f.key]: e.target.value })}
                                    className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-slate-900 dark:text-slate-100 font-bold outline-none transition-all shadow-sm"
                                    placeholder={`Digite ${f.label.toLowerCase()}...`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className="px-8 py-4 bg-orange-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">update</span>
                            {changingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                        </button>
                    </div>
                </div>
            </div>


            {/* Planos e Assinatura */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
                        </div>
                        Plano e Assinatura
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gerencie seu acesso</span>
                        {user.is_trial && (
                            <div className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white animate-pulse">
                                Teste Grátis: {Math.max(0, Math.ceil((new Date(user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))} dias restantes
                            </div>
                        )}
                        {user.plan_status !== 'Ativo' && !user.is_trial && (
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse ${user.plan_status === 'Inadimplente' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                                Conta {user.plan_status}
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                id: 'essencial',
                                nome: 'Essencial',
                                preco: user.plan_id?.toLowerCase() === 'essencial' ? user.plan_value?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '39,90',
                                cor: 'border-slate-200 dark:border-slate-800',
                                icon: 'auto_awesome_mosaic',
                                vantagens: ['Agenda inteligente', 'Prontuário eletrônico', 'Pacientes ilimitados', 'Gestão financeira'],
                                ai: false,
                                link: 'https://chk.eduzz.com/Q9N2YYZ101'
                            },
                            {
                                id: 'profissional',
                                nome: 'Profissional',
                                preco: user.plan_id?.toLowerCase() === 'profissional' ? user.plan_value?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '44,90',
                                cor: 'border-primary ring-4 ring-primary/5',
                                icon: 'rocket_launch',
                                popular: true,
                                vantagens: ['Tudo do Essencial', 'IA: Resumos de Sessão', 'IA: Sugestão de Temas', 'Lembretes WhatsApp'],
                                ai: true,
                                link: 'https://chk.eduzz.com/G96RKK6QW1'
                            },
                            {
                                id: 'anual',
                                nome: 'Plano Anual',
                                preco: '28,91',
                                preco_info: '12x de R$ 28,91 ou R$ 346,92 à vista',
                                cor: 'border-amber-100 bg-amber-50 dark:bg-amber-900/10 text-slate-900 dark:text-white',
                                icon: 'calendar_month',
                                vantagens: ['Tudo do Profissional', 'Desconto Especial (55%)', '1 Ano de Acesso Total', 'Suporte Prioritário'],
                                badge: 'Melhor Valor',
                                ai: true,
                                link: 'https://chk.eduzz.com/89AXVP5G0D'
                            }
                        ].map((p) => (
                            <div key={p.id} className={`relative flex flex-col p-6 rounded-[2rem] border-2 transition-all hover:scale-[1.02] ${p.cor} ${p.id === 'anual' ? 'shadow-2xl shadow-amber-500/10' : ''}`}>
                                {p.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                        Mais Popular
                                    </div>
                                )}
                                {p.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                        {p.badge}
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`size-12 rounded-2xl flex items-center justify-center ${p.id === 'anual' ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                                        <span className={`material-symbols-outlined ${p.id === 'anual' ? 'text-amber-500' : 'text-primary'}`}>{p.icon}</span>
                                    </div>
                                    {p.ai && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                                            AI Ativa
                                        </div>
                                    )}
                                </div>

                                <h3 className={`text-xl font-black italic tracking-tight mb-1 text-slate-900 dark:text-white`}>{p.nome}</h3>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className={`text-[10px] font-black opacity-60 text-slate-500`}>R$</span>
                                    <span className={`text-3xl font-black tracking-tighter text-slate-900 dark:text-white`}>{p.preco}</span>
                                    <span className={`text-[10px] font-black opacity-60 text-slate-500`}>/mês</span>
                                </div>
                                {p.preco_info && (
                                    <div className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-wider">
                                        {p.preco_info}
                                    </div>
                                )}
                                {!p.preco_info && <div className="mb-6 h-4" />}

                                <div className="flex-1 space-y-3 mb-8">
                                    {p.vantagens.map((v, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className={`material-symbols-outlined text-sm text-emerald-500`}>check_circle</span>
                                            <span className={`text-xs font-bold leading-tight text-slate-500 dark:text-slate-400`}>{v}</span>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    disabled={user.plan_id?.toLowerCase() === p.id && user.plan_status === 'Ativo' && !(user.is_trial && new Date(user.trial_end_date) < new Date())}
                                    onClick={() => {
                                        showToast(`Redirecionando para o checkout do plano ${p.nome}...`, 'info');
                                        window.open(p.link, '_blank');
                                    }}
                                    className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                        user.plan_id?.toLowerCase() === p.id && user.plan_status === 'Ativo' && !(user.is_trial && new Date(user.trial_end_date) < new Date())
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                                            : p.id === 'anual'
                                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-xl'
                                                : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02]'
                                    }`}
                                >
                                    {user.plan_id?.toLowerCase() === p.id && !(user.is_trial && new Date(user.trial_end_date) < new Date())
                                        ? (user.plan_status === 'Ativo' ? 'Plano Atual' : 'Regularizar Agora 💳') 
                                        : (user.is_trial && new Date(user.trial_end_date) < new Date() ? 'Assinar Plano' : 'Fazer Upgrade')}
                                </button>
                                {user.plan_id?.toLowerCase() === p.id && (
                                    <div className="mt-4 flex flex-col items-center gap-1 opacity-60 text-center">
                                        <p className="text-[9px] font-black uppercase tracking-widest">
                                            {user.plan_billing_type} • {user.plan_payment_method}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gerenciamento de Dados */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">database</span>
                        </div>
                        Gerenciamento de Dados (Backup)
                    </h2>
                </div>
                <div className="p-4 md:p-8">
                    <div className="grid grid-cols-1 gap-8">
                        <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary text-2xl">download</span>
                                <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg">Exportar Tudo (Backup de Segurança)</h3>
                            </div>
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-lg mx-auto">
                                Baixe uma cópia de segurança completa de todos os seus dados salvos na nuvem (Pacientes, Evoluções, Prontuários, Financeiro). 
                                <strong> Os seus dados também já contam com backup automático diário nos servidores.</strong>
                            </p>
                            <button 
                                onClick={async () => {
                                    const success = await exportData();
                                    if (success) showToast('Backup gerado com sucesso!', 'success');
                                }}
                                className="w-full max-w-md mx-auto py-4 bg-white dark:bg-slate-900 border-2 border-primary text-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                                Gerar Arquivo de Backup (.json)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zona de Perigo */}
            <div className="bg-red-50/50 dark:bg-red-900/5 rounded-[2rem] border border-red-100 dark:border-red-900/20 p-4 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h2 className="font-black text-red-600 dark:text-red-400 flex items-center gap-2 justify-center md:justify-start mb-1">
                        <span className="material-symbols-outlined">warning_amber</span>
                        Zona de Segurança
                    </h2>
                    <p className="text-sm font-bold text-slate-500">Ações irreversíveis que afetam permanentemente sua conta.</p>
                </div>
                <button 
                    onClick={async () => {
                        if (confirm('Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
                            showToast('Processando exclusão...', 'info');
                            try {
                                const { error } = await supabase
                                    .from('profiles')
                                    .update({ plan_status: 'Inativo' })
                                    .eq('id', user.id);

                                if (error) throw error;
                                
                                showToast('Conta desativada com sucesso. Saindo...', 'success');
                                setTimeout(() => {
                                    logout();
                                }, 1500);
                            } catch (error) {
                                console.error('Erro ao excluir conta:', error.message);
                                showToast('Erro ao processar exclusão.', 'error');
                            }
                        }
                    }}
                    className="px-6 py-3 border-2 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-black hover:bg-red-600 hover:text-white hover:border-red-600 transition-all uppercase tracking-widest shadow-sm"
                >
                    Excluir minha conta
                </button>
            </div>
        </div>
    );
};

export default Configuracoes;
