import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { showToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { exportData } from '../utils/backup';
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

// Padrão reutilizável para cabeçalho de seção
const SectionHeader = ({ icon, iconBg, iconColor, title, children }) => (
    <div className="px-6 md:px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 flex items-center justify-between gap-4">
        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-base">
            <div className={`size-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined ${iconColor} text-[18px]`}>{icon}</span>
            </div>
            {title}
        </h2>
        {children}
    </div>
);

// Padrão reutilizável para rodapé de seção (botão salvar)
const SectionFooter = ({ children }) => (
    <div className="px-6 md:px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-transparent flex justify-end">
        {children}
    </div>
);

// Padrão de label para campos
const FieldLabel = ({ children }) => (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {children}
    </label>
);

// Input padronizado
const inputCls = "w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none transition-all text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600";

const PortalPacienteSection = () => {
    const { user } = useUser();
    const [copied, setCopied] = useState(false);

    const code = user?.id
        ? user.id.split('-').slice(-1)[0].substring(0, 8).toUpperCase()
        : '--------';

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            showToast('Código copiado!', 'success');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <SectionHeader icon="supervised_user_circle" iconBg="bg-violet-500/10" iconColor="text-violet-600" title="Área do Paciente (Conexão)" />
            <div className="p-6 md:p-8 flex flex-col gap-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Compartilhe seu <strong>código único</strong> com os pacientes para que eles se conectem ao seu portal. Quando um paciente fizer login no Portal do Paciente com o e-mail cadastrado por você, ele terá acesso às tarefas e ao monitoramento de humor.
                </p>

                {/* Unique code display */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-violet-50 dark:bg-violet-900/20 border-2 border-dashed border-violet-200 dark:border-violet-800 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Seu Código</p>
                            <p className="text-2xl font-black text-violet-700 dark:text-violet-300 tracking-[0.2em] font-mono">
                                {code}
                            </p>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">
                                {copied ? 'check' : 'content_copy'}
                            </span>
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                </div>

                {/* Benefits list */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { icon: 'mood', label: 'Monitor de Humor', desc: 'Paciente registra humor diário' },
                        { icon: 'task_alt', label: 'Tarefas', desc: 'Envie atividades entre sessões' },
                        { icon: 'assignment', label: 'Escalas', desc: 'Envie escalas para responder' },
                    ].map(({ icon, label, desc }) => (
                        <div key={icon} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                            <div className="size-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-violet-600 text-[18px]">{icon}</span>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-700 dark:text-slate-200">{label}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <a
                        href="/paciente/login"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border-2 border-violet-200 text-violet-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Visualizar Portal do Paciente
                    </a>
                </div>
            </div>
        </div>
    );
};

const Configuracoes = () => {
    const navigate = useNavigate();
    const { darkMode, setDarkMode } = useTheme();
    const { user, updateUser, updateConfigs, changePassword, logout } = useUser();
    const fileInputRef = useRef(null);

    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            showToast('Formato inválido. Use JPG, PNG, WebP ou GIF.', 'error');
            return;
        }
        if (file.size > MAX_SIZE_BYTES) {
            showToast('Imagem muito grande. Tamanho máximo: 5MB.', 'error');
            return;
        }
        try {
            const safeExt = file.type.split('/')[1];
            const fileName = `${user.id}_${Date.now()}.${safeExt}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            await updateUser({ avatar_url: publicUrl });
            showToast('Foto de perfil atualizada!', 'success');
        } catch (error) {
            logger.error('Erro ao enviar foto:', error.message);
            showToast('Erro ao enviar foto.', 'error');
        }
    };

    const [formData, setFormData] = useState({
        nome: user.nome,
        email: user.email,
        crp: user.crp,
        telefone: user.telefone,
        clinic_name: user.clinic_name || user.clinica?.nome || '',
        clinic_cnpj: maskCpfCnpj(user.clinic_cnpj || user.clinica?.cnpjCpf || '')
    });

    const [passwordData, setPasswordData] = useState({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    const [changingPassword, setChangingPassword] = useState(false);
    const [configs, setConfigs] = useState(user.configuracoes);

    const [pixData, setPixData] = useState({
        tipoChavePix: user.configuracoes?.tipoChavePix || 'cpf',
        chavePix: user.configuracoes?.chavePix || '',
    });

    const [referralContact, setReferralContact] = useState('');
    const [submittingReferral, setSubmittingReferral] = useState(false);
    const [referrals, setReferrals] = useState([]);
    const [loadingReferrals, setLoadingReferrals] = useState(true);

    const handleDeleteReferral = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover esta indicação do seu histórico?')) return;
        try {
            const { error } = await supabase.from('referrals').delete().eq('id', id);
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

    useEffect(() => { fetchReferrals(); }, [user?.id]);

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

    const handleSaveProfile = () => { updateUser(formData); showToast('Perfil atualizado com sucesso!', 'success'); };
    const handleSaveClinic = () => { updateUser(formData); showToast('Dados da clínica atualizados!', 'success'); };
    const handleSavePix = () => { updateConfigs(pixData); showToast('Chave Pix salva com sucesso!', 'success'); };

    const handleConfigToggle = (key, value) => {
        setConfigs(prev => {
            const newConfigs = { ...prev, [key]: value };
            updateConfigs({ [key]: value });
            return newConfigs;
        });
    };

    const handleChangePassword = async () => {
        const { novaSenha, confirmarSenha } = passwordData;
        if (!novaSenha || !confirmarSenha) { showToast('Preencha os campos de nova senha.', 'error'); return; }
        if (novaSenha !== confirmarSenha) { showToast('As novas senhas não coincidem.', 'error'); return; }
        if (novaSenha.length < 6) { showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error'); return; }
        setChangingPassword(true);
        const result = await changePassword(passwordData.senhaAtual, novaSenha);
        setChangingPassword(false);
        if (result.success) {
            showToast('Senha atualizada com sucesso!', 'success');
            setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
        } else {
            showToast(result.message || 'Erro ao alterar senha.', 'error');
        }
    };

    const handleReferral = async () => {
        if (!referralContact) { showToast('Por favor, informe um e-mail ou WhatsApp do indicado.', 'error'); return; }
        setSubmittingReferral(true);
        try {
            const { data: existing, error: checkError } = await supabase
                .from('referrals').select('id').eq('referrer_id', user.id)
                .eq('referral_contact', referralContact.trim()).maybeSingle();
            if (checkError) throw checkError;
            if (existing) { showToast('Você já indicou este contato anteriormente!', 'warning'); setSubmittingReferral(false); return; }

            const { error: dbError } = await supabase.from('referrals').insert([{
                referrer_id: user.id, referral_contact: referralContact.trim(), status: 'Pendente'
            }]);
            if (dbError) throw dbError;

            if (referralContact.includes('@')) {
                const profNome = user.clinic_name || user.nome || 'Um colega psicólogo';
                const referralLink = `${window.location.origin}/cadastrar?ref=${user.id}`;
                const { data, error: functionError } = await supabase.functions.invoke('send-invoice-email', {
                    body: {
                        to: referralContact, subject: `Convite Especial: Conheça o Meu Sistema PSI 🚀`,
                        replyTo: user.email, fromName: profNome,
                        html: referralInviteTemplate({ profNome, referralLink })
                    }
                });
                if (functionError) throw functionError;
                if (data?.success === false) throw new Error(data.error?.message || 'Erro no Resend');
                showToast('Indicação enviada com sucesso por e-mail!', 'success');
            } else if (referralContact.match(/^\+?[0-9\s-]{8,}$/)) {
                const referralLink = `${window.location.origin}/cadastrar?ref=${user.id}`;
                const message = encodeURIComponent(`Olá! Estou usando o Meu Sistema PSI para gerenciar minha clínica e recomendo muito. Dá uma olhada: ${referralLink}`);
                window.open(`https://wa.me/${referralContact.replace(/\D/g, '')}?text=${message}`, '_blank');
                showToast('Indicação registrada! Abrindo WhatsApp...', 'success');
            } else {
                showToast('Contato inválido. Informe um e-mail ou telefone válido.', 'error');
                setSubmittingReferral(false);
                return;
            }
            setReferralContact('');
            fetchReferrals();
        } catch (error) {
            logger.error('Erro ao enviar indicação:', error.message);
            showToast(`Erro: ${error.message}`, 'error');
        } finally {
            setSubmittingReferral(false);
        }
    };

    const handlePhoneFormat = (v) => {
        let cleaned = v.replace(/\D/g, '');
        if (cleaned.length > 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
        if (cleaned.length > 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
        if (cleaned.length > 2) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        return cleaned;
    };

    const handleCrpFormat = (v) => {
        let cleaned = v.replace(/\D/g, '');
        return cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 9)}` : cleaned;
    };

    return (
        <div className="space-y-5 max-w-3xl pb-20">

            {/* ── Cabeçalho da Página ── */}
            <div className="pt-1 pb-3">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined text-[15px]">settings</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Sistema</span>
                </div>
                <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black italic tracking-tight leading-none">
                    Configurações
                </h1>
                <p className="text-slate-400 text-sm font-medium mt-2">
                    Gerencie suas preferências e dados do sistema
                </p>
            </div>

            {/* ── Perfil Profissional ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <SectionHeader icon="person" iconBg="bg-primary/10" iconColor="text-primary" title="Perfil Profissional" />

                <div className="p-6 md:p-8 space-y-7">
                    {/* Avatar + nome */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        <div className="size-[72px] rounded-full flex-shrink-0 overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 shadow-lg">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="Perfil" className="size-full object-cover" />
                            ) : (
                                <div className="size-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-black text-3xl">
                                    {formData.nome ? formData.nome.charAt(formData.nome.startsWith('Dr.') ? 4 : 0) : '?'}
                                </div>
                            )}
                        </div>
                        <div className="text-center sm:text-left">
                            <p className="font-black text-xl text-slate-900 dark:text-white leading-tight">
                                {formData.nome}
                            </p>
                            <p className="text-sm text-slate-400 font-medium mt-0.5">
                                {user.especialidade || 'Psicólogo(a)'}{formData.crp ? ` · CRP ${formData.crp}` : ''}
                            </p>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-primary font-black uppercase tracking-widest hover:underline transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">photo_camera</span>
                                Alterar foto
                            </button>
                        </div>
                    </div>

                    {/* Campos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            { label: 'Nome Completo', key: 'nome', type: 'text', placeholder: 'Digite seu nome completo...' },
                            { label: 'E-mail Profissional', key: 'email', type: 'email', placeholder: 'Digite seu e-mail...' },
                            { label: 'Registro Profissional (CRP)', key: 'crp', type: 'text', placeholder: 'Ex: 06/123456' },
                            { label: 'Telefone de Contato', key: 'telefone', type: 'tel', placeholder: 'Ex: (11) 99999-9999' },
                        ].map((f) => (
                            <div key={f.key}>
                                <FieldLabel>{f.label}</FieldLabel>
                                <input
                                    type={f.type}
                                    value={formData[f.key] || ''}
                                    onChange={(e) => {
                                        let v = e.target.value;
                                        if (f.key === 'crp') v = handleCrpFormat(v);
                                        else if (f.key === 'telefone') v = handlePhoneFormat(v);
                                        setFormData({ ...formData, [f.key]: v });
                                    }}
                                    className={inputCls}
                                    placeholder={f.placeholder}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <SectionFooter>
                    <button onClick={handleSaveProfile} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0">
                        <span className="material-symbols-outlined text-sm">save</span>
                        Salvar Alterações
                    </button>
                </SectionFooter>
            </div>

            {/* ── Dados da Clínica ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <SectionHeader icon="domain" iconBg="bg-emerald-500/10" iconColor="text-emerald-500" title="Dados da Clínica" />

                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <FieldLabel>Nome da Clínica</FieldLabel>
                            <input
                                type="text"
                                value={formData.clinic_name}
                                onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                                className={inputCls.replace('focus:ring-primary/10 focus:border-primary', 'focus:ring-emerald-500/10 focus:border-emerald-500')}
                                placeholder="Ex: Clínica Equilíbrio..."
                            />
                        </div>
                        <div>
                            <FieldLabel>CNPJ ou CPF (Principal)</FieldLabel>
                            <input
                                type="text"
                                value={formData.clinic_cnpj}
                                onChange={(e) => setFormData({ ...formData, clinic_cnpj: maskCpfCnpj(e.target.value) })}
                                className={inputCls.replace('focus:ring-primary/10 focus:border-primary', 'focus:ring-emerald-500/10 focus:border-emerald-500')}
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                    </div>
                </div>

                <SectionFooter>
                    <button onClick={handleSaveClinic} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:-translate-y-0.5 active:translate-y-0">
                        <span className="material-symbols-outlined text-sm">save</span>
                        Salvar Dados da Clínica
                    </button>
                </SectionFooter>
            </div>

            {/* ── Dados para Recebimento (Pix) ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <SectionHeader icon="qr_code_2" iconBg="bg-teal-500/10" iconColor="text-teal-500" title="Dados para Recebimento (Pix)" />

                <div className="p-6 md:p-8 space-y-5">
                    <p className="text-sm text-slate-400 font-medium">
                        Sua chave Pix é usada para gerar o link de cobrança enviado ao paciente.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <FieldLabel>Tipo de Chave</FieldLabel>
                            <select
                                value={pixData.tipoChavePix}
                                onChange={(e) => setPixData({ ...pixData, tipoChavePix: e.target.value })}
                                className={inputCls.replace('focus:ring-primary/10 focus:border-primary', 'focus:ring-teal-500/10 focus:border-teal-500') + ' cursor-pointer appearance-none'}
                            >
                                <option value="cpf">CPF</option>
                                <option value="cnpj">CNPJ</option>
                                <option value="telefone">Telefone</option>
                                <option value="email">E-mail</option>
                                <option value="aleatoria">Chave Aleatória</option>
                            </select>
                        </div>
                        <div>
                            <FieldLabel>Chave Pix</FieldLabel>
                            <input
                                type="text"
                                name="pix-key-field"
                                autoComplete="off"
                                value={pixData.chavePix}
                                onChange={(e) => setPixData({ ...pixData, chavePix: e.target.value })}
                                className={inputCls.replace('focus:ring-primary/10 focus:border-primary', 'focus:ring-teal-500/10 focus:border-teal-500')}
                                placeholder="Digite sua chave Pix..."
                            />
                        </div>
                    </div>
                </div>

                <SectionFooter>
                    <button onClick={handleSavePix} className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all hover:-translate-y-0.5 active:translate-y-0">
                        <span className="material-symbols-outlined text-sm">save</span>
                        Salvar Chave Pix
                    </button>
                </SectionFooter>
            </div>

            {/* ── Comunicações e Aparência ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <SectionHeader icon="notifications" iconBg="bg-primary/10" iconColor="text-primary" title="Comunicações e Aparência">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">dark_mode</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Modo Escuro</span>
                        </div>
                        <Toggle value={darkMode} onChange={setDarkMode} />
                    </div>
                </SectionHeader>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    {/* Coluna esquerda: toggles */}
                    <div className="space-y-7">
                        {[
                            {
                                label: 'Notificações de Sistema',
                                desc: 'Alertas sobre novos agendamentos e atualizações no seu e-mail profissional.',
                                key: 'notifEmail',
                                icon: 'alternate_email',
                                color: 'text-blue-500',
                                bg: 'bg-blue-500/10'
                            },
                            {
                                label: 'Lembretes de Sessão',
                                desc: 'Lembretes automáticos para seus pacientes via e-mail e WhatsApp.',
                                key: 'reminders_enabled',
                                icon: 'notifications_active',
                                color: 'text-amber-500',
                                bg: 'bg-amber-500/10'
                            },
                            {
                                label: 'Cobrança Automática',
                                desc: 'Lembretes de pagamento para sessões com status pendente.',
                                key: 'debt_reminders_enabled',
                                icon: 'payments',
                                color: 'text-emerald-500',
                                bg: 'bg-emerald-500/10'
                            },
                        ].map((n) => (
                            <div key={n.key} className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3.5">
                                    <div className={`size-10 rounded-xl ${n.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                        <span className={`material-symbols-outlined ${n.color} text-base`}>{n.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black text-slate-800 dark:text-slate-100 leading-tight">{n.label}</p>
                                        <p className="text-[11px] font-medium text-slate-400 mt-1 leading-relaxed">{n.desc}</p>
                                    </div>
                                </div>
                                <div className="shrink-0 pt-0.5">
                                    <Toggle value={configs[n.key]} onChange={(val) => handleConfigToggle(n.key, val)} />
                                </div>
                            </div>
                        ))}

                        <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="material-symbols-outlined text-indigo-500 text-base">restart_alt</span>
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black text-slate-800 dark:text-slate-100 leading-tight">Tutoriais e Dicas</p>
                                        <p className="text-[11px] font-medium text-slate-400 mt-1 leading-relaxed">
                                            Reativa os tours guiados em todas as páginas do sistema.
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <button
                                        onClick={async () => {
                                            Object.keys(localStorage).forEach(key => {
                                                if (key.startsWith('psi_tour_') || key.startsWith('psi_visited_')) localStorage.removeItem(key);
                                            });
                                            await updateConfigs({ completed_tours: {} });
                                            showToast('Tutoriais reativados! Eles aparecerão ao visitar as páginas.', 'success');
                                        }}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 rounded-xl hover:bg-primary hover:text-white transition-all"
                                    >
                                        Reativar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna direita: sub-configurações */}
                    <div className="space-y-5">
                        {configs.reminders_enabled && (
                            <div className="bg-slate-50/60 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                                            className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                                configs.reminders_before_minutes === opt.value
                                                    ? 'border-primary bg-primary/5 text-primary'
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
                            <div className="bg-slate-50/60 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-sm text-teal-500">rule</span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                                                handleConfigToggle('debt_reminder_stages', { ...currentStages, [stage.key]: !currentStages[stage.key] });
                                            }}
                                            className={`h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-1.5 ${
                                                configs.debt_reminder_stages?.[stage.key]
                                                    ? 'border-teal-500 bg-teal-500/5 text-teal-600'
                                                    : 'border-white dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:border-teal-500/30'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[13px]">
                                                {configs.debt_reminder_stages?.[stage.key] ? 'check_circle' : 'radio_button_unchecked'}
                                            </span>
                                            {stage.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!configs.reminders_enabled && !configs.debt_reminders_enabled && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/40 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 min-h-[160px]">
                                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-3">auto_fix_high</span>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px] leading-relaxed">
                                    Ative as automações ao lado para ver mais configurações
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Segurança e Acesso ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <SectionHeader icon="lock" iconBg="bg-orange-500/10" iconColor="text-orange-500" title="Segurança e Acesso" />

                <div className="p-6 md:p-8 space-y-5">
                    <div>
                        <FieldLabel>Senha Atual</FieldLabel>
                        <input
                            type="password"
                            autoComplete="current-password"
                            value={passwordData.senhaAtual}
                            onChange={(e) => setPasswordData({ ...passwordData, senhaAtual: e.target.value })}
                            className={inputCls.replace('focus:ring-primary/10 focus:border-primary', 'focus:ring-orange-500/10 focus:border-orange-500')}
                            placeholder="Digite sua senha atual..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            { label: 'Nova Senha', key: 'novaSenha' },
                            { label: 'Confirmar Nova Senha', key: 'confirmarSenha' },
                        ].map((f) => (
                            <div key={f.key}>
                                <FieldLabel>{f.label}</FieldLabel>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    value={passwordData[f.key]}
                                    onChange={(e) => setPasswordData({ ...passwordData, [f.key]: e.target.value })}
                                    className={inputCls.replace('focus:ring-primary/10 focus:border-primary', 'focus:ring-orange-500/10 focus:border-orange-500')}
                                    placeholder={`Digite ${f.label.toLowerCase()}...`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <SectionFooter>
                    <button
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                        className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <span className="material-symbols-outlined text-sm">update</span>
                        {changingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                    </button>
                </SectionFooter>
            </div>

            {/* ── Indique e Ganhe ── */}
            <div className="bg-gradient-to-br from-indigo-500 to-primary rounded-[2rem] p-7 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className="material-symbols-outlined text-sm">redeem</span>
                            Programa de Recompensas
                        </div>
                        <h2 className="text-3xl font-black italic tracking-tighter mb-2">Indique e Ganhe</h2>
                        <p className="text-white/75 font-medium text-sm max-w-md leading-relaxed">
                            Indique o Meu Sistema PSI para colegas e ganhe 1 mês de desconto por cada indicação que assinar o plano profissional!
                        </p>
                    </div>

                    <div className="w-full md:w-[360px] bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-white/60">
                            E-mail ou WhatsApp do indicado
                        </label>
                        <input
                            type="text"
                            value={referralContact}
                            onChange={(e) => setReferralContact(e.target.value)}
                            placeholder="(11) 99999-9999 ou email@exemplo.com"
                            className="w-full h-11 px-4 rounded-xl bg-white text-slate-900 font-semibold text-sm focus:ring-4 focus:ring-white/20 outline-none transition-all placeholder:text-slate-300"
                        />
                        <button
                            onClick={handleReferral}
                            disabled={submittingReferral}
                            className="w-full h-11 bg-white text-primary rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <span className={`material-symbols-outlined text-sm ${submittingReferral ? 'animate-spin' : ''}`}>
                                {submittingReferral ? 'sync' : 'send'}
                            </span>
                            {submittingReferral ? 'Enviando...' : 'Indicar Agora'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Suas Indicações ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <SectionHeader icon="group_add" iconBg="bg-indigo-500/10" iconColor="text-indigo-500" title="Suas Indicações">
                    <div className="px-3 py-1.5 bg-indigo-500/10 rounded-full">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                            {referrals.filter(r => r.status === 'Assinou').length} Bônus Coletados
                        </span>
                    </div>
                </SectionHeader>

                <div className="p-6 md:p-8">
                    {loadingReferrals ? (
                        <div className="flex flex-col items-center justify-center py-12 opacity-30">
                            <div className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
                            <p className="text-xs font-bold uppercase tracking-widest">Carregando histórico...</p>
                        </div>
                    ) : referrals.length > 0 ? (
                        <div className="overflow-x-auto -mx-2">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                        <th className="text-center py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="text-right py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {referrals.map((ref) => (
                                        <tr key={ref.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-8 rounded-lg flex items-center justify-center ${ref.referral_contact.includes('@') ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        <span className="material-symbols-outlined text-base">
                                                            {ref.referral_contact.includes('@') ? 'mail' : 'chat_bubble'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{ref.referral_contact}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="text-xs font-medium text-slate-400">
                                                    {new Date(ref.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    ref.status === 'Assinou' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    ref.status === 'Cadastrado' ? 'bg-blue-500/10 text-blue-600' :
                                                    'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                }`}>
                                                    {ref.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteReferral(ref.id)}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
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
                        <div className="text-center py-14">
                            <div className="size-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 opacity-50">
                                <span className="material-symbols-outlined text-slate-400 text-2xl">diversity_3</span>
                            </div>
                            <p className="text-sm font-bold text-slate-500 mb-1">Nenhuma indicação ainda</p>
                            <p className="text-xs text-slate-400">Suas indicações aparecerão aqui assim que você enviar os primeiros convites.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Equipe e Acessos ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <SectionHeader icon="manage_accounts" iconBg="bg-blue-500/10" iconColor="text-blue-500" title="Equipe e Acessos">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {user.role === 'admin' ? 'Administrador' : 'Acesso Restrito'}
                    </span>
                </SectionHeader>

                <div className="p-6 md:p-8 flex flex-col items-center text-center gap-5">
                    <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">group_add</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 max-w-sm leading-relaxed">
                        Convide secretárias ou outros psicólogos para colaborar na sua clínica com diferentes níveis de acesso.
                    </p>

                    {user.role !== 'admin' ? (
                        <span className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/10 px-4 py-2 rounded-xl">
                            Você não tem permissão para gerenciar a equipe.
                        </span>
                    ) : (['profissional', 'anual', 'premium'].includes(user.plan_id?.toLowerCase())) ? (
                        <button
                            onClick={() => navigate('/equipe')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-xl text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
                        >
                            <span className="material-symbols-outlined text-sm">settings_account_box</span>
                            Gerenciar Minha Equipe
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <span className="block text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/10 px-4 py-2 rounded-xl">
                                Exclusivo para planos Profissional, Premium e Anual.
                            </span>
                            <button
                                onClick={() => {
                                    showToast('Redirecionando para as opções de upgrade...', 'info');
                                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                }}
                                className="px-6 py-3 bg-amber-500 text-white font-black rounded-xl text-[11px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all hover:-translate-y-0.5"
                            >
                                Fazer Upgrade de Plano
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Plano e Assinatura ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <SectionHeader icon="workspace_premium" iconBg="bg-primary/10" iconColor="text-primary" title="Plano e Assinatura">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:inline">Gerencie seu acesso</span>
                        {user.is_trial && (
                            <div className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white animate-pulse">
                                Teste: {Math.max(0, Math.ceil((new Date(user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))}d restantes
                            </div>
                        )}
                        {user.plan_status !== 'Ativo' && !user.is_trial && (
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse ${user.plan_status === 'Inadimplente' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {user.plan_status}
                            </div>
                        )}
                    </div>
                </SectionHeader>

                <div className="p-6 md:p-8 space-y-7">
                    {/* Card de bônus */}
                    {referrals.filter(r => r.status === 'Assinou').length > 0 && (
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">🎁</div>
                                <div>
                                    <h3 className="text-lg font-black italic">Saldo de Prêmios</h3>
                                    <p className="text-emerald-50/75 text-sm font-medium">Meses grátis por indicar colegas!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-7">
                                <div className="text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Total Ganho</p>
                                    <p className="text-3xl font-black">{referrals.filter(r => r.status === 'Assinou').length}m</p>
                                </div>
                                <div className="w-px h-10 bg-white/20" />
                                <div className="text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Disponível</p>
                                    <p className="text-3xl font-black">{referrals.filter(r => r.status === 'Assinou' && !r.bonus_applied).length}m</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cards de planos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            {
                                id: 'essencial',
                                nome: 'Essencial',
                                preco: user.plan_id?.toLowerCase() === 'essencial' ? user.plan_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '39,90',
                                cor: 'border-slate-200 dark:border-slate-800',
                                icon: 'auto_awesome_mosaic',
                                vantagens: ['Agenda inteligente', 'Prontuário eletrônico', 'Pacientes ilimitados', 'Gestão financeira'],
                                ai: false,
                                link: 'https://chk.eduzz.com/Q9N2YYZ101'
                            },
                            {
                                id: 'profissional',
                                nome: 'Profissional',
                                preco: user.plan_id?.toLowerCase() === 'profissional' ? user.plan_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '44,90',
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
                                cor: 'border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10',
                                icon: 'calendar_month',
                                badge: 'Melhor Valor',
                                vantagens: ['Tudo do Profissional', 'Desconto Especial (55%)', '1 Ano de Acesso Total', 'Suporte Prioritário'],
                                ai: true,
                                link: 'https://chk.eduzz.com/89AXVP5G0D'
                            }
                        ].map((p) => (
                            <div key={p.id} className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${p.cor}`}>
                                {p.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                        Mais Popular
                                    </div>
                                )}
                                {p.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                        {p.badge}
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-5">
                                    <div className={`size-11 rounded-xl flex items-center justify-center ${p.id === 'anual' ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                                        <span className={`material-symbols-outlined text-lg ${p.id === 'anual' ? 'text-amber-500' : 'text-primary'}`}>{p.icon}</span>
                                    </div>
                                    {p.ai && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                                            AI
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-black italic tracking-tight text-slate-900 dark:text-white mb-1">{p.nome}</h3>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-[10px] font-bold text-slate-400">R$</span>
                                    <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">{p.preco}</span>
                                    <span className="text-[10px] font-bold text-slate-400">/mês</span>
                                </div>
                                {p.preco_info ? (
                                    <p className="text-[10px] font-bold text-slate-400 mb-5 uppercase tracking-wide">{p.preco_info}</p>
                                ) : (
                                    <div className="mb-5 h-4" />
                                )}

                                <div className="flex-1 space-y-2.5 mb-6">
                                    {p.vantagens.map((v, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-emerald-500">check_circle</span>
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{v}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    disabled={user.plan_id?.toLowerCase() === p.id && user.plan_status === 'Ativo' && !(user.is_trial && new Date(user.trial_end_date) < new Date())}
                                    onClick={() => {
                                        showToast(`Redirecionando para o checkout do plano ${p.nome}...`, 'info');
                                        window.open(p.link, '_blank');
                                    }}
                                    className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                        user.plan_id?.toLowerCase() === p.id && user.plan_status === 'Ativo' && !(user.is_trial && new Date(user.trial_end_date) < new Date())
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                                            : p.id === 'anual'
                                            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg'
                                            : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02]'
                                    }`}
                                >
                                    {user.plan_id?.toLowerCase() === p.id && !(user.is_trial && new Date(user.trial_end_date) < new Date())
                                        ? (user.plan_status === 'Ativo' ? 'Plano Atual' : 'Regularizar Agora 💳')
                                        : (user.is_trial && new Date(user.trial_end_date) < new Date() ? 'Assinar Plano' : 'Fazer Upgrade')}
                                </button>

                                {user.plan_id?.toLowerCase() === p.id && (
                                    <p className="mt-3 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-60">
                                        {user.plan_billing_type} · {user.plan_payment_method}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Gerenciamento de Dados ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <SectionHeader icon="database" iconBg="bg-primary/10" iconColor="text-primary" title="Gerenciamento de Dados" />

                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-xl">cloud_download</span>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="font-black text-slate-800 dark:text-slate-200 mb-1">Exportar Tudo (Backup de Segurança)</p>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Baixe uma cópia completa dos seus dados: Pacientes, Evoluções, Prontuários e Financeiro.
                                Seus dados também contam com <strong>backup automático diário</strong> nos servidores.
                            </p>
                        </div>
                        <button
                            onClick={async () => {
                                const success = await exportData();
                                if (success) showToast('Backup gerado com sucesso!', 'success');
                            }}
                            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border-2 border-primary text-primary rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            Gerar Backup
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400 text-lg">delete_outline</span>
                            <div className="text-left">
                                <p className="font-bold text-[13px] text-slate-600 dark:text-slate-300">Lixeira do Sistema</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Acesse registros excluídos recentemente.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/lixeira')}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            Acessar Lixeira
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Área do Paciente (Conexão) ── */}
            <PortalPacienteSection />

            {/* ── Zona de Segurança ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-red-100 dark:border-red-900/20 shadow-sm overflow-hidden">
                <div className="px-6 md:px-8 py-5 border-b border-red-100 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5 flex items-center justify-between">
                    <h2 className="font-black text-red-600 dark:text-red-400 flex items-center gap-3 text-base">
                        <div className="size-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-red-500 text-[18px]">warning_amber</span>
                        </div>
                        Zona de Segurança
                    </h2>
                </div>
                <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
                    <p className="text-sm font-medium text-slate-500 text-center sm:text-left">
                        Ações irreversíveis que afetam permanentemente sua conta.
                    </p>
                    <button
                        onClick={async () => {
                            if (confirm('Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
                                showToast('Processando exclusão...', 'info');
                                try {
                                    const { error } = await supabase.from('profiles').update({ plan_status: 'Inativo' }).eq('id', user.id);
                                    if (error) throw error;
                                    showToast('Conta desativada com sucesso. Saindo...', 'success');
                                    setTimeout(() => logout(), 1500);
                                } catch (error) {
                                    logger.error('Erro ao excluir conta:', error.message);
                                    showToast('Erro ao processar exclusão.', 'error');
                                }
                            }
                        }}
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 border-2 border-red-200 dark:border-red-900/40 text-red-500 dark:text-red-400 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">person_remove</span>
                        Excluir minha conta
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Configuracoes;
