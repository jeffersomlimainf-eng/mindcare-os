import { useState, useEffect } from 'react';
import Modal from './Modal';
import { showToast } from './Toast';

const TABS = ['Dados Pessoais', 'Endereço', 'Dados Clínicos'];

const maskCPF = (value) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

const validateCPF = (cpf) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
};

const maskPhone = (value) => {
    let r = value.replace(/\D/g, '');
    r = r.replace(/^0/, '');
    if (r.length > 10) {
        r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (r.length > 5) {
        r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (r.length > 2) {
        r = r.replace(/^(\d\d)(\d{0,5})/, '($1) $2');
    } else if (r.length > 0) {
        r = r.replace(/^(\d*)/, '($1');
    }
    return r;
};

const maskCEP = (value) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
};

const formatNameCase = (str) => {
    if (!str) return '';
    const preposicoes = ['da', 'de', 'do', 'das', 'dos', 'e'];
    return str.toLowerCase().split(' ').map((word, index) => {
        if (word.length <= 3 && preposicoes.includes(word) && index !== 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
};

const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const bDay = new Date(birthDate);
    let age = today.getFullYear() - bDay.getFullYear();
    const m = today.getMonth() - bDay.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDay.getDate())) {
        age--;
    }
    return age;
};

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Field = ({ label, value, onChange, onBlur, type = 'text', placeholder = '', error = false, success = false, detail = null }) => (
    <div className="relative">
        <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
            {detail && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{detail}</span>}
        </div>
        <div className="relative">
            <input
                type={type}
                className={`w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm text-slate-900 dark:text-slate-100 transition-all ${error ? 'border-rose-300 ring-rose-100' : success ? 'border-emerald-300' : 'border-slate-200 dark:border-slate-700'}`}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                onBlur={onBlur}
            />
            {success && <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-lg">check_circle</span>}
            {error && <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 text-lg">error</span>}
        </div>
    </div>
);

const CadastroPacienteModal = ({ isOpen, onClose, onSave, paciente = null }) => {
    const [tab, setTab] = useState(0);
    const [form, setForm] = useState({
        nome: '', cpf: '', dataNascimento: '', genero: '', telefone: '', email: '',
        cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '',
        queixa: '', historico: '', responsavel: '', plano: '',
        status: 'Ativo',
        isMenor: false,
        dadosResponsavel: { nome: '', cpf: '', dataNascimento: '', telefone: '' },
        precoSessao: '',
        estadoCivil: '',
        profissao: '',
        emergency_contact: '',
        allergies: '',
        medications: '',
        referral_source: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const cepLimpo = form.cep.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (data.erro) {
                        showToast('CEP não encontrado', 'warning');
                        return;
                    }
                    setForm(prev => ({
                        ...prev,
                        rua: data.logradouro || prev.rua,
                        bairro: data.bairro || prev.bairro,
                        cidade: data.localidade || prev.cidade,
                        estado: data.uf || prev.estado
                    }));
                })
                .catch(() => showToast('Erro ao buscar CEP', 'error'));
        }
    }, [form.cep]);

    useEffect(() => {
        if (paciente) {
            setForm({
                nome: paciente.nome || '',
                dataNascimento: paciente.dataNascimento || paciente.nascimento || '',
                genero: paciente.genero || '',
                cpf: paciente.cpf || '',
                telefone: paciente.telefone || '',
                email: paciente.email || '',
                cep: paciente.cep || '',
                rua: paciente.rua || '',
                numero: paciente.numero || '',
                bairro: paciente.bairro || '',
                cidade: paciente.cidade || '',
                estado: paciente.estado || '',
                queixa: paciente.queixa || '',
                historico: paciente.historico || '',
                responsavel: paciente.responsavel || '',
                status: paciente.status || 'Ativo',
                isMenor: !!paciente.isMenor,
                dadosResponsavel: paciente.dadosResponsavel || (typeof paciente.responsavel === 'object' ? paciente.responsavel : { nome: paciente.responsavel || '', cpf: '', dataNascimento: '', telefone: '' }),
                precoSessao: paciente.precoSessao || '',
                estadoCivil: paciente.estadoCivil || '',
                profissao: paciente.profissao || '',
                plano: paciente.plano || '',
                emergency_contact: paciente.emergency_contact || '',
                allergies: paciente.allergies || '',
                medications: paciente.medications || '',
                referral_source: paciente.referral_source || '',
            });
        } else {
            setForm({ 
                nome: '', cpf: '', dataNascimento: '', genero: '', telefone: '', email: '', 
                cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '', 
                queixa: '', historico: '', responsavel: '', plano: '', status: 'Ativo',
                isMenor: false,
                dadosResponsavel: { nome: '', cpf: '', dataNascimento: '', telefone: '' },
                precoSessao: '',
                estadoCivil: '',
                profissao: '',
                emergency_contact: '',
                allergies: '',
                medications: '',
                referral_source: ''
            });
        }
    }, [paciente, isOpen]);

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleSalvar = async () => {
        if (!form.nome || !form.telefone || !form.cpf) { 
            showToast('Preencha Nome, CPF e Telefone (campos obrigatórios)', 'warning'); 
            return; 
        }

        if (form.cpf && !validateCPF(form.cpf)) {
            showToast('O CPF informado é inválido.', 'error');
            return;
        }

        if (form.isMenor && form.dadosResponsavel?.cpf && !validateCPF(form.dadosResponsavel.cpf)) {
            showToast('O CPF do responsável é inválido.', 'error');
            return;
        }
        
        setIsSaving(true);
        try {
            if (onSave) {
                await onSave(form);
            }
            showToast(paciente ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!', 'success');
            onClose();
            setTab(0);
        } catch (error) {
            console.error('[CadastroPacienteModal] Erro ao salvar:', error);
            showToast('Erro ao salvar paciente. Tente novamente.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={paciente ? "Editar Paciente" : "Cadastrar Novo Paciente"} icon={paciente ? "edit" : "person_add"} closeOnBackdropClick={false}>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 overflow-x-auto scrollbar-none">
                {TABS.map((t, i) => (
                    <button
                        key={i}
                        onClick={() => setTab(i)}
                        className={`py-3.5 px-4 text-sm font-bold border-b-2 transition-colors ${tab === i ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="p-4 md:p-8">
                {tab === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <Field
                                label="Nome Completo *"
                                value={form.nome}
                                onChange={e => set('nome', e.target.value)}
                                onBlur={e => set('nome', formatNameCase(e.target.value))}
                                placeholder="Nome do paciente"
                            />
                        </div>
                        <Field
                            label="CPF *"
                            value={form.cpf}
                            onChange={e => set('cpf', maskCPF(e.target.value))}
                            placeholder="000.000.000-00"
                            success={form.cpf.length === 14 && validateCPF(form.cpf)}
                            error={form.cpf.length > 0 && form.cpf.length < 14}
                        />
                        <Field
                            label="Data de Nascimento"
                            value={form.dataNascimento}
                            detail={form.dataNascimento ? `${calculateAge(form.dataNascimento)} anos` : null}
                            onChange={e => {
                                const birthDate = e.target.value;
                                set('dataNascimento', birthDate);
                                
                                if (birthDate) {
                                    const age = calculateAge(birthDate);
                                    if (age < 18) {
                                        set('isMenor', true);
                                    } else {
                                        set('isMenor', false);
                                    }
                                }
                            }}
                            type="date"
                        />
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gênero</label>
                            <select className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 outline-none text-sm text-slate-900 dark:text-slate-100 transition-all font-medium" value={form.genero} onChange={e => set('genero', e.target.value)}>
                                <option value="">Selecionar...</option>
                                <option>Feminino</option><option>Masculino</option><option>Não-binário</option><option>Prefiro não informar</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status do Paciente</label>
                            <select className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 outline-none text-sm text-slate-900 dark:text-slate-100 transition-all font-bold" value={form.status} onChange={e => set('status', e.target.value)}>
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estado Civil</label>
                            <select className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 outline-none text-sm text-slate-900 dark:text-slate-100 transition-all font-medium" value={form.estadoCivil} onChange={e => set('estadoCivil', e.target.value)}>
                                <option value="">Selecionar...</option>
                                <option>Solteiro(a)</option>
                                <option>Casado(a)</option>
                                <option>Divorciado(a)</option>
                                <option>Viúvo(a)</option>
                                <option>União Estável</option>
                            </select>
                        </div>
                        <Field
                            label="Profissão"
                            value={form.profissao}
                            onChange={e => set('profissao', e.target.value)}
                            placeholder="Ex: Engenheiro, Professor..."
                        />
                        <Field
                            label="Telefone / WhatsApp *"
                            value={form.telefone}
                            onChange={e => set('telefone', maskPhone(e.target.value))}
                            type="tel"
                            placeholder="(11) 99999-0000"
                            success={form.telefone.replace(/\D/g, '').length >= 10}
                        />
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary/40 transition-all bg-slate-50/50 dark:bg-slate-800/50">
                                <div className={`size-5 rounded border-2 flex items-center justify-center transition-all ${form.isMenor ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                                    {form.isMenor && <span className="material-symbols-outlined text-white text-xs">check</span>}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={form.isMenor} 
                                    onChange={e => set('isMenor', e.target.checked)} 
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Paciente Menor de Idade</p>
                                    <p className="text-[11px] text-slate-500">Exibir campos para cadastro do responsável legal</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">child_care</span>
                            </label>
                        </div>

                        {form.isMenor && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-primary/5 border border-primary/10 rounded-2xl">
                                <div className="md:col-span-2 flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-primary text-base">supervisor_account</span>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Dados do Responsável Legal</h4>
                                </div>
                                <div className="md:col-span-2">
                                    <Field
                                        label="Nome do Responsável *"
                                        value={form.dadosResponsavel.nome}
                                        onChange={e => set('dadosResponsavel', { ...form.dadosResponsavel, nome: e.target.value })}
                                        onBlur={e => set('dadosResponsavel', { ...form.dadosResponsavel, nome: formatNameCase(e.target.value) })}
                                        placeholder="Nome completo do pai, mãe ou tutor"
                                    />
                                </div>
                                <Field
                                    label="CPF do Responsável"
                                    value={form.dadosResponsavel.cpf}
                                    onChange={e => set('dadosResponsavel', { ...form.dadosResponsavel, cpf: maskCPF(e.target.value) })}
                                    placeholder="000.000.000-00"
                                    success={form.dadosResponsavel.cpf.length === 14 && validateCPF(form.dadosResponsavel.cpf)}
                                    error={form.dadosResponsavel.cpf.length > 0 && form.dadosResponsavel.cpf.length < 14}
                                />
                                <Field
                                    label="Telefone do Responsável"
                                    value={form.dadosResponsavel.telefone}
                                    onChange={e => set('dadosResponsavel', { ...form.dadosResponsavel, telefone: maskPhone(e.target.value) })}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <Field
                                label="E-mail"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                type="email"
                                placeholder="paciente@email.com"
                                success={form.email.length > 0 && validateEmail(form.email)}
                                error={form.email.length > 0 && !validateEmail(form.email)}
                            />
                        </div>
                    </div>
                )}

                {tab === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field
                            label="CEP"
                            value={form.cep}
                            onChange={e => set('cep', maskCEP(e.target.value))}
                            placeholder="00000-000"
                        />
                        <div />
                        <div className="md:col-span-2">
                            <Field
                                label="Logradouro / Rua"
                                value={form.rua}
                                onChange={e => set('rua', e.target.value)}
                                placeholder="Rua, Avenida..."
                            />
                        </div>
                        <Field
                            label="Número"
                            value={form.numero}
                            onChange={e => set('numero', e.target.value)}
                            placeholder="Ex: 123"
                        />
                        <Field
                            label="Bairro"
                            value={form.bairro}
                            onChange={e => set('bairro', e.target.value)}
                        />
                        <Field
                            label="Cidade"
                            value={form.cidade}
                            onChange={e => set('cidade', e.target.value)}
                        />
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estado</label>
                            <select className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 outline-none text-sm text-slate-900 dark:text-slate-100" value={form.estado} onChange={e => set('estado', e.target.value)}>
                                <option value="">UF</option>
                                {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => <option key={uf}>{uf}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {tab === 2 && (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Queixa Principal</label>
                            <textarea
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm resize-none"
                                rows={3}
                                placeholder="Descreva o motivo principal da consulta..."
                                value={form.queixa}
                                onChange={e => set('queixa', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Histórico Clínico Relevante</label>
                            <textarea
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm resize-none"
                                rows={3}
                                placeholder="Diagnósticos anteriores, medicações, tratamentos..."
                                value={form.historico}
                                onChange={e => set('historico', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Preço da Sessão Combinado (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm text-primary">R$</span>
                                    <input
                                        type="text"
                                        className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-bold text-primary transition-all"
                                        placeholder="0,00"
                                        value={form.precoSessao}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            const formatted = (Number(val) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                                            set('precoSessao', formatted);
                                        }}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40">
                                        <span className="material-symbols-outlined text-sm">payments</span>
                                    </div>
                                </div>
                                <p className="mt-1.5 text-[10px] text-slate-400 italic">Valor específico acordado para este paciente.</p>
                            </div>

                            <div className="md:col-span-2">
                                <Field
                                    label="Contato de Emergência (Nome e Telefone)"
                                    value={form.emergency_contact}
                                    onChange={e => set('emergency_contact', e.target.value)}
                                    onBlur={e => {
                                        const val = e.target.value;
                                        // Apenas capitaliza o início e deixa o restante (telefone) como o usuário digitou
                                        // ou tenta um ajuste fino se houver um padrão claro
                                        set('emergency_contact', formatNameCase(val));
                                    }}
                                    placeholder="Ex: Maria (Mãe) - (11) 99999-0000"
                                />
                            </div>

                            <div className="md:col-span-1">
                                <Field
                                    label="💊 Medicamentos em Uso"
                                    value={form.medications}
                                    onChange={e => set('medications', e.target.value)}
                                    placeholder="Ex: Rivotril, Fluoxetina..."
                                />
                            </div>

                            <div className="md:col-span-1">
                                <Field
                                    label="⚠️ Alergias Conhecidas"
                                    value={form.allergies}
                                    onChange={e => set('allergies', e.target.value)}
                                    placeholder="Ex: Dipirona, Corantes..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Como conheceu a clínica? (Indicação)</label>
                                <input
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 outline-none text-sm"
                                    value={form.referral_source}
                                    onChange={e => set('referral_source', e.target.value)}
                                    placeholder="Ex: Instagram, Indicação de Amigo, Google..."
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        {TABS.map((_, i) => (
                            <button key={i} onClick={() => setTab(i)} className={`size-2 rounded-full transition-all ${tab === i ? 'bg-primary w-6' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        ))}
                    </div>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                    <button 
                        onClick={async () => {
                            const { supabase } = await import('../lib/supabase');
                            const { data } = await supabase.auth.getUser();
                            const userId = data?.user?.id || '';
                            const link = `${window.location.origin}/self-register?owner=${userId}`;
                            navigator.clipboard.writeText(link);
                            
                            const foneLimpo = form.telefone.replace(/\D/g, '');
                            if (foneLimpo.length >= 10) {
                                const mensagem = encodeURIComponent(`Olá ${form.nome.split(' ')[0] || 'paciente'}, aqui é da clínica. Para agilizarmos seu atendimento, você poderia preencher seus dados básicos através deste link seguro? ${link}`);
                                window.open(`https://wa.me/55${foneLimpo}?text=${mensagem}`, '_blank');
                                showToast('Link copiado e WhatsApp aberto!', 'success');
                            } else {
                                showToast('Link de autocadastro copiado!', 'success');
                            }
                        }}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg border ${form.telefone.replace(/\D/g, '').length >= 10 ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}
                        title={form.telefone.replace(/\D/g, '').length >= 10 ? "Enviar link via WhatsApp" : "Gerar link para o paciente preencher os dados"}
                    >
                        <span className="material-symbols-outlined text-sm">{form.telefone.replace(/\D/g, '').length >= 10 ? 'send' : 'link'}</span>
                        {form.telefone.replace(/\D/g, '').length >= 10 ? 'Enviar no Whats' : 'Gerar Link'}
                    </button>
                </div>
                <div className="flex gap-3">
                    {tab > 0 && (
                        <button onClick={() => setTab(t => t - 1)} className="px-5 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:border-primary transition-all">
                            Voltar
                        </button>
                    )}
                    {tab < TABS.length - 1 ? (
                        <button onClick={() => setTab(t => t + 1)} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all">
                            Próximo <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    ) : (
                        <button onClick={handleSalvar} disabled={isSaving} className={`flex items-center gap-2 px-7 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {isSaving ? (
                                <>
                                    <span className="material-symbols-outlined text-base animate-spin">sync</span>
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-base">save</span>
                                    <span>{paciente ? 'Salvar Alterações' : 'Salvar Paciente'}</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default CadastroPacienteModal;


