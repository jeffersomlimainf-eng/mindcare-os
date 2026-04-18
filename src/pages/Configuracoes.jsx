import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { showToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { exportData, importData } from '../utils/backup';
import Toggle from '../components/Toggle';
import { referralInviteTemplate } from '../constants/emailTemplates';
import { logger } from '../utils/logger';

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
    
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validação de tipo MIME real (não só extensão)
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            showToast('Formato inválido. Use JPG, PNG, WebP ou GIF.', 'error');
            return;
        }

        // Validação de tamanho
        if (file.size > MAX_SIZE_BYTES) {
            showToast('Imagem muito grande. Tamanho máximo: 5MB.', 'error');
            return;
        }

        try {
            // Nome seguro: usa tipo MIME real, não extensão informada pelo usuário
            const safeExt = file.type.split('/')[1];
            const fileName = `${user.id}_${Date.now()}.${safeExt}`;

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
            logger.error('Erro ao enviar foto:', error.message);
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

    // Estado para Indique e Ganhe
    const [referralContact, setReferralContact] = useState('');
    const [submittingReferral, setSubmittingReferral] = useState(false);
    const [referrals, setReferrals] = useState([]);
    const [loadingReferrals, setLoadingReferrals] = useState(true);

    const handleDeleteReferral = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover esta indicação do seu histórico?')) return;
        
        try {
            const { error } = await supabase
                .from('referrals')
                .delete()
                .eq('id', id);

            if (error) throw error;
            showToast('Indicação removida com sucesso.', 'success');
            fetchReferrals();
        } catch (error) {
            showToast('Erro ao remover indicação.', 'error');
        }
    };

    const fetchReferrals = async () => {
        if (!user?.id) return;
        setLoadingReferrals(true);
        try {
            const { data, error } = await supabase
                .from('referrals')
                .select('*')
                .eq('referrer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReferrals(data || []);
        } catch (error) {
            logger.error('Erro ao buscar indicações:', error.message);
        } finally {
            setLoadingReferrals(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, [user?.id]);

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
        setConfigs(prev => {
            const newConfigs = { ...prev, [key]: value };
            updateConfigs({ [key]: value });
            return newConfigs;
        });
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

    const handleReferral = async () => {
        if (!referralContact) {
            showToast('Por favor, informe um e-mail ou WhatsApp do indicado.', 'error');
            return;
        }

        setSubmittingReferral(true);
        try {
            // Verificar duplicatas
            const { data: existing, error: checkError } = await supabase
                .from('referrals')
                .select('id')
                .eq('referrer_id', user.id)
                .eq('referral_contact', referralContact.trim())
                .maybeSingle();

            if (checkError) throw checkError;

            if (existing) {
                showToast('Você já indicou este contato anteriormente!', 'warning');
                setSubmittingReferral(false);
                return;
            }

            const { error: dbError } = await supabase
                .from('referrals')
                .insert([{
                    referrer_id: user.id,
                    referral_contact: referralContact.trim(),
                    status: 'Pendente'
                }]);

            if (dbError) throw dbError;

            // Se for e-mail, enviar via Resend usando Edge Function
            if (referralContact.includes('@')) {
                const subject = `Convite Especial: Conheça o Meu Sistema PSI 🚀`;
                const profNome = user.clinic_name || user.nome || 'Um colega psicólogo';
                
                const referralLink = `${window.location.origin}/cadastrar?ref=${user.id}`;
                
                const { data, error: functionError } = await supabase.functions.invoke('send-invoice-email', {
                    body: {
                        to: referralContact,
                        subject: subject,
                        replyTo: user.email,
                        fromName: profNome,
                        html: referralInviteTemplate({
                            profNome: profNome,
                            referralLink: referralLink
                        })
                    }
                });

                if (functionError) throw functionError;
                if (data?.success === false) throw new Error(data.error?.message || 'Erro no Resend');

                showToast('Indicação enviada com sucesso por e-mail!', 'success');
            } 
            // Se for número de telefone, oferecer abrir WhatsApp
            else if (referralContact.match(/^\+?[0-9\s-]{8,}$/)) {
                const referralLink = `${window.location.origin}/cadastrar?ref=${user.id}`;
                const message = encodeURIComponent(`Olá! Estou usando o Meu Sistema PSI para gerenciar minha clínica e recomendo muito. Dá uma olhada: ${referralLink}`);
                const phone = referralContact.replace(/\D/g, '');
                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                showToast('Indicação registrada! Abrindo WhatsApp...', 'success');
            } else {
                showToast('Contato inválido. Informe um e-mail ou telefone válido.', 'error');
                setSubmittingReferral(false);
                return;
            }

            setReferralContact('');
            fetchReferrals(); // Atualizar lista
        } catch (error) {
            logger.error('Erro ao enviar indicação:', error.message);
            showToast(`Erro: ${error.message}`, 'error');
        } finally {
            setSubmittingReferral(false);
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


            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-4">
                    <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">notifications</span>
                        </div>
                        Comunicações e Aparência
                    </h2>
                    
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all shrink-0">
                         <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-base text-slate-400">dark_mode</span>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Modo Escuro</span>
                         </div>
                         <Toggle value={darkMode} onChange={setDarkMode} />
                    </div>
                </div>

                <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {/* Coluna de Opções Principais */}
                    <div className="space-y-8">
                        {[
                            { 
                                label: 'Notificações de Sistema (E-mail)', 
                                desc: 'Receba alertas sobre novos agendamentos e atualizações importantes diretamente no seu e-mail profissional.', 
                                key: 'notifEmail', 
                                icon: 'alternate_email',
                                color: 'text-blue-500',
                                bg: 'bg-blue-500/10'
                            },
                            { 
                                label: 'Lembretes de Sessão (Paciente)', 
                                desc: 'Envio automático de lembretes para seus pacientes via E-mail e WhatsApp para reduzir faltas.', 
                                key: 'reminders_enabled', 
                                icon: 'notifications_active',
                                color: 'text-amber-500',
                                bg: 'bg-amber-500/10'
                            },
                            { 
                                label: 'Cobrança Automática (Paciente)', 
                                desc: 'Ativa o envio de lembretes de pagamento para sessões com status pendente no seu financeiro.', 
                                key: 'debt_reminders_enabled', 
                                icon: 'payments',
                                color: 'text-emerald-500',
                                bg: 'bg-emerald-500/10'
                            },
                        ].map((n) => (
                            <div key={n.key} className="flex items-start justify-between gap-6 group">
                                <div className="flex gap-4">
                                    <div className={`size-12 rounded-2xl ${n.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                        <span className={`material-symbols-outlined ${n.color} text-xl`}>{n.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{n.label}</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1.5 leading-relaxed max-w-[320px]">{n.desc}</p>
                                    </div>
                                </div>
                                <div className="pt-1.5">
                                    <Toggle value={configs[n.key]} onChange={(val) => handleConfigToggle(n.key, val)} />
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex items-start justify-between gap-6 group">
                                <div className="flex gap-4">
                                    <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-indigo-500 text-xl">restart_alt</span>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">Tutoriais e Dicas</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1.5 leading-relaxed max-w-[320px]">
                                            Deseja rever os tours guiados das páginas? Isso reativará as explicações iniciais em todo o sistema.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-1.5">
                                    <button 
                                        onClick={async () => {
                                            // 1. Limpa Local
                                            Object.keys(localStorage).forEach(key => {
                                                if (key.startsWith('psi_tour_')) localStorage.removeItem(key);
                                                if (key.startsWith('psi_visited_')) localStorage.removeItem(key);
                                            });
                                            // 2. Limpa Nuvem
                                            await updateConfigs({ completed_tours: {} });
                                            
                                            import('../components/Toast').then(m => m.showToast('Tutoriais reativados! Eles aparecerão ao visitar as páginas.', 'success'));
                                        }}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 rounded-xl hover:bg-primary hover:text-white transition-all"
                                    >
                                        Reativar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna de Configurações Detalhadas */}
                    <div className="space-y-6">
                        {configs.reminders_enabled && (
                            <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Antecedência do Lembrete
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: '30 min', value: 30 },
                                        { label: '1 hora', value: 60 },
                                        { label: '2 horas', value: 120 },
                                        { label: '12 horas', value: 720 },
                                        { label: '24 horas', value: 1440 },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleConfigToggle('reminders_before_minutes', opt.value)}
                                            className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                                configs.reminders_before_minutes === opt.value
                                                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                    : 'border-white dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:border-primary/30'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {configs.debt_reminders_enabled && (
                            <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-sm text-teal-500">rule</span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Fases da Régua de Cobrança
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'No Vencimento', key: 'day0' },
                                        { label: '1 Dia Depois', key: 'day1' },
                                        { label: '3 Dias Depois', key: 'day3' },
                                        { label: 'Recorrente (3/3d)', key: 'recurring' },
                                    ].map((stage) => (
                                        <button
                                            key={stage.key}
                                            onClick={() => {
                                                const currentStages = configs.debt_reminder_stages || { day0: true, day1: true, day3: true, recurring: true };
                                                const newStages = { ...currentStages, [stage.key]: !currentStages[stage.key] };
                                                handleConfigToggle('debt_reminder_stages', newStages);
                                            }}
                                            className={`h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${
                                                configs.debt_reminder_stages?.[stage.key]
                                                    ? 'border-teal-500 bg-teal-500/5 text-teal-600 shadow-sm'
                                                    : 'border-white dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:border-teal-500/30'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[14px]">
                                                {configs.debt_reminder_stages?.[stage.key] ? 'check_circle' : 'radio_button_unchecked'}
                                            </span>
                                            {stage.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!configs.reminders_enabled && !configs.debt_reminders_enabled && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/30 dark:bg-slate-800/20 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-4">auto_fix_high</span>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ative as automações ao lado para ver mais configurações</p>
                            </div>
                        )}
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


            {/* Indique e Ganhe */}
            <div className="bg-gradient-to-br from-indigo-500 to-primary rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-20 -mb-20"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className="material-symbols-outlined text-sm">redeem</span>
                            Programa de Recompensas
                        </div>
                        <h2 className="text-3xl font-black italic tracking-tighter mb-2">Indique e Ganhe</h2>
                        <p className="text-white/80 font-bold max-w-md leading-relaxed">
                            Indique o Meu Sistema PSI para colegas e ganhe 1 mês de desconto em sua mensalidade por cada indicação que assinar o plano profissional!
                        </p>
                    </div>
                    
                    <div className="w-full md:w-[380px] bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">
                                E-mail ou WhatsApp do indicado
                            </label>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    value={referralContact}
                                    onChange={(e) => setReferralContact(e.target.value)}
                                    placeholder="ex: (11) 99999-9999 ou email@exemplo.com"
                                    className="w-full h-12 px-4 rounded-xl bg-white text-slate-900 font-bold focus:ring-4 focus:ring-white/20 outline-none transition-all placeholder:text-slate-400"
                                />
                                <button
                                    onClick={handleReferral}
                                    disabled={submittingReferral}
                                    className="w-full h-12 bg-white text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <span className={`material-symbols-outlined text-sm ${submittingReferral ? 'animate-spin' : ''}`}>
                                        {submittingReferral ? 'sync' : 'send'}
                                    </span>
                                    {submittingReferral ? 'Enviando...' : 'Indicar Agora'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Indicações */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-indigo-500 text-xl">group_add</span>
                        </div>
                        Suas Indicações
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                            {referrals.filter(r => r.status === 'Assinou').length} Bônus Coletados
                        </span>
                    </div>
                </div>
                <div className="p-4 md:p-8">
                    {loadingReferrals ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-30">
                            <div className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
                            <p className="text-xs font-bold uppercase tracking-widest">Carregando histórico...</p>
                        </div>
                    ) : referrals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato</th>
                                        <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                        <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="text-right py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {referrals.map((ref) => (
                                        <tr key={ref.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-8 rounded-lg flex items-center justify-center ${ref.referral_contact.includes('@') ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        <span className="material-symbols-outlined text-lg">
                                                            {ref.referral_contact.includes('@') ? 'mail' : 'chat_bubble'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{ref.referral_contact}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs font-medium text-slate-500">
                                                    {new Date(ref.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex justify-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        ref.status === 'Assinou' ? 'bg-emerald-500/10 text-emerald-600' :
                                                        ref.status === 'Cadastrado' ? 'bg-blue-500/10 text-blue-600' :
                                                        'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {ref.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button 
                                                    onClick={() => handleDeleteReferral(ref.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Remover indicação"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 opacity-50">
                                <span className="material-symbols-outlined text-slate-400 text-3xl">diversity_3</span>
                            </div>
                            <p className="text-sm font-bold text-slate-500 mb-1">Nenhuma indicação ainda</p>
                            <p className="text-xs text-slate-400">Suas indicações aparecerão aqui assim que você enviar os primeiros convites.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Gestão de Equipe */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-500 text-xl">manage_accounts</span>
                        </div>
                        Equipe e Acessos
                    </h2>
                    {user.role === 'admin' ? (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Administrador</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Acesso Restrito</span>
                        </div>
                    )}
                </div>
                <div className="p-4 md:p-8 space-y-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                         <span className="material-symbols-outlined text-4xl text-slate-300">group_add</span>
                    </div>
                    <p className="font-medium text-slate-500 text-sm max-w-sm mx-auto">
                        Convide secretárias ou outros psicólogos para colaborar na sua clínica com diferentes níveis de acesso.
                    </p>
                    
                    {user.role !== 'admin' ? (
                        <p className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/10 inline-block px-4 py-2 rounded-lg">
                            Você não tem permissão para gerenciar a equipe.
                        </p>
                    ) : (['profissional', 'anual', 'premium'].includes(user.plan_id?.toLowerCase())) ? (
                        <button
                            onClick={() => navigate('/equipe')}
                            className="py-3 px-6 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mx-auto"
                        >
                            <span className="material-symbols-outlined text-sm">settings_account_box</span>
                            Gerenciar Minha Equipe
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/10 inline-block px-4 py-2 rounded-lg">
                                Funcionalidade exclusiva para planos Profissional, Premium e Anual.
                            </p>
                            <button
                                onClick={() => {
                                    showToast('Redirecionando para as opções de upgrade...', 'info');
                                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                }}
                                className="block py-3 px-6 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all hover:scale-[1.02] mx-auto text-sm"
                            >
                                Fazer Upgrade de Plano
                            </button>
                        </div>
                    )}
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
                <div className="p-4 md:p-8 space-y-8">
                    {/* Card de Saldo de Prêmios */}
                    {referrals.filter(r => r.status === 'Assinou').length > 0 && (
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in duration-500">
                            <div className="flex items-center gap-6">
                                <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
                                    🎁
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic tracking-tight">Saldo de Prêmios Acumulado</h3>
                                    <p className="text-emerald-50/80 text-sm font-medium">Você ganhou meses grátis por indicar colegas!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Ganho</p>
                                    <p className="text-3xl font-black">{referrals.filter(r => r.status === 'Assinou').length} Meses</p>
                                </div>
                                <div className="size-px h-12 bg-white/20" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Disponível</p>
                                    <p className="text-3xl font-black">
                                        {referrals.filter(r => r.status === 'Assinou' && !r.bonus_applied).length} Meses
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                                logger.error('Erro ao excluir conta:', error.message);
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


