import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { showToast } from '../components/Toast';

const maskCPF = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value) => {
    let r = value.replace(/\D/g, '');
    if (r.length > 10) r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (r.length > 5) r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (r.length > 2) r = r.replace(/^(\d\d)(\d{0,5})/, '($1) $2');
    else if (r.length > 0) r = r.replace(/^(\d*)/, '($1');
    return r;
};

const maskCEP = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
};

const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const bDay = new Date(birthDate);
    let age = today.getFullYear() - bDay.getFullYear();
    const m = today.getMonth() - bDay.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDay.getDate())) age--;
    return age;
};

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Field = ({ label, value, onChange, type = 'text', placeholder = '', required = false, error = false, success = false, detail = null }) => (
    <div className="animate-in relative">
        <div className="flex justify-between items-center mb-2 ml-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{label} {required && '*'}</label>
            {detail && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">{detail}</span>}
        </div>
        <div className="relative group">
            <input
                type={type}
                required={required}
                className={`w-full h-14 px-6 rounded-2xl bg-white dark:bg-slate-800 border-2 outline-none text-slate-800 dark:text-slate-100 font-semibold transition-all shadow-sm group-hover:border-slate-200 ${error ? 'border-rose-200 bg-rose-50/10 pr-12' : success ? 'border-emerald-200 pr-12' : 'border-slate-100 dark:border-slate-700 focus:border-primary focus:shadow-primary/10'}`}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
            />
            {success && <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">check_circle</span>}
            {error && <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-rose-500">error</span>}
        </div>
    </div>
);

const SelfRegister = () => {
    const [searchParams] = useSearchParams();
    const ownerId = searchParams.get('owner');
    const [step, setStep] = useState(1);
    const [loadingCEP, setLoadingCEP] = useState(false);
    const [form, setForm] = useState({
        nome: '', cpf: '', dataNascimento: '', genero: '', telefone: '', email: '',
        cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '',
        isMenor: false,
        dadosResponsavel: { nome: '', cpf: '', dataNascimento: '', telefone: '' },
        plano: '',
        estadoCivil: '', profissao: '', queixa: '', historico: '',
        historicoPessoal: '', historicoFamiliar: '', historicoMedico: '', expectativas: '', tcleAceito: false
    });

    const [submitting, setSubmitting] = useState(false);
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    useEffect(() => {
        document.title = "Cadastro de Paciente | Ambiente Seguro — Meu Sistema Psi";
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Página de cadastro seguro para pacientes. Preencha seus dados para iniciar o atendimento psicológico. Ambiente criptografado e em conformidade com a LGPD.');

        // Add canonical tag
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', window.location.origin + '/self-register');
    }, []);

    useEffect(() => {
        const cepLimpo = form.cep.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            setLoadingCEP(true);
            fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (!data.erro) {
                        setForm(prev => ({
                            ...prev,
                            rua: data.logradouro || prev.rua,
                            bairro: data.bairro || prev.bairro,
                            cidade: data.localidade || prev.cidade,
                            estado: data.uf || prev.estado
                        }));
                    }
                })
                .finally(() => setLoadingCEP(false));
        }
    }, [form.cep]);

    const handleNext = (e) => {
        e.preventDefault();
        if (step === 1 && !form.nome) {
            showToast('O nome é obrigatório.', 'error');
            return;
        }
        setStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFinish = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            // Chamar a função RPC que insere diretamente na tabela patients
            // sem necesidade de autenticação (SECURITY DEFINER)
            const { data, error } = await supabase.rpc('self_register_patient_v2', {
                p_name: form.nome,
                p_email: form.email || null,
                p_phone: form.telefone || null,
                p_cpf: form.cpf || null,
                p_birth_date: form.dataNascimento || null,
                p_gender: form.genero || null,
                p_address_zip: form.cep || null,
                p_address_street: form.rua || null,
                p_address_number: form.numero || null,
                p_address_neighborhood: form.bairro || null,
                p_address_city: form.cidade || null,
                p_address_state: form.estado || null,
                p_health_plan: form.plano || null,
                p_is_minor: form.isMenor,
                p_responsible_data: form.isMenor ? form.dadosResponsavel : null,
                p_owner_id: ownerId || null,
                p_marital_status: form.estadoCivil || null,
                p_profession: form.profissao || null,
                p_complaint: form.queixa || null,
                p_history: form.historico || null,
                p_personal_history: form.historicoPessoal || null,
                p_family_history: form.historicoFamiliar || null,
                p_medical_history: form.historicoMedico || null,
                p_expectations: form.expectativas || null,
                p_tcle_accepted: form.tcleAceito
            });

            if (error) throw error;
            
            showToast('Cadastro realizado com sucesso!', 'success');
            setStep(5);
        } catch (error) {
            console.error('[SelfRegister] Erro ao cadastrar:', error);
            showToast('Erro ao enviar dados: ' + error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 5) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-2xl shadow-slate-200 dark:shadow-none text-center border border-slate-100 dark:border-slate-800">
                    <div className="size-24 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <span className="material-symbols-outlined text-5xl text-emerald-600 dark:text-emerald-400">task_alt</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Tudo Pronto!</h1>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-10 text-lg">Seus dados foram enviados com segurança para o profissional.<br/><br/><strong>Você já pode fechar esta aba.</strong></p>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 py-16 px-6">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-5 py-2.5 rounded-2xl mb-6 backdrop-blur-sm border border-primary/10">
                        <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary">Ambiente seguro e criptografado</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Cadastro de Paciente — Primeiro Acesso</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg font-medium">Preencha seus dados para agilizar seu atendimento.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-14 rounded-[48px] shadow-2xl shadow-indigo-200/50 dark:shadow-none border border-white dark:border-slate-800">
                    <div className="flex justify-between items-center mb-12 px-2 gap-3">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className="flex-1">
                                <div className={`h-2 rounded-full transition-all ${step >= s ? 'bg-primary shadow-sm shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800'}`} />
                                <p className={`text-[10px] font-black uppercase tracking-widest mt-3 ${step >= s ? 'text-primary' : 'text-slate-300'}`}>
                                    {s === 1 ? 'Dados Pessoais' : s === 2 ? 'Endereço' : s === 3 ? 'Clínicos' : 'TCLE'}
                                </p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={step < 4 ? handleNext : handleFinish} className="space-y-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <Field label="Nome Completo" required value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome completo" success={form.nome.length > 5} />
                                <Field label="E-mail de Contato" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="exemplo@email.com" success={validateEmail(form.email)} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Data de Nascimento" type="date" value={form.dataNascimento} detail={form.dataNascimento ? `${calculateAge(form.dataNascimento)} anos` : null} onChange={e => set('dataNascimento', e.target.value)} />
                                    <Field label="WhatsApp / Celular" required value={form.telefone} onChange={e => set('telefone', maskPhone(e.target.value))} placeholder="(11) 90000-0000" success={form.telefone.replace(/\D/g, '').length >= 10} />
                                </div>
                                <Field label="CPF" value={form.cpf} onChange={e => set('cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" success={form.cpf.replace(/\D/g, '').length === 11} />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Gênero</label>
                                        <select className="w-full h-14 px-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100 font-semibold focus:border-primary focus:shadow-primary/10 transition-all" value={form.genero} onChange={e => set('genero', e.target.value)}>
                                            <option value="">Selecionar...</option>
                                            <option>Feminino</option><option>Masculino</option><option>Não-binário</option><option>Prefiro não informar</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Estado Civil</label>
                                        <select className="w-full h-14 px-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100 font-semibold focus:border-primary focus:shadow-primary/10 transition-all" value={form.estadoCivil} onChange={e => set('estadoCivil', e.target.value)}>
                                            <option value="">Selecionar...</option>
                                            <option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option><option>União Estável</option>
                                        </select>
                                    </div>
                                </div>

                                <Field label="Profissão" value={form.profissao} onChange={e => set('profissao', e.target.value)} placeholder="Ex: Engenheiro, Professor..." />

                                <label className={`flex items-start gap-5 p-6 rounded-[32px] border-2 transition-all cursor-pointer ${form.isMenor ? 'border-primary/30 bg-primary/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                                    <div className={`mt-1 size-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.isMenor ? 'bg-primary border-primary' : 'bg-white dark:bg-slate-800 border-slate-200'}`}>
                                        {form.isMenor && <span className="material-symbols-outlined text-white text-base">check</span>}
                                    </div>
                                    <input type="checkbox" className="sr-only" checked={form.isMenor} onChange={e => set('isMenor', e.target.checked)} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-slate-800 dark:text-slate-200">Sou menor de idade</p>
                                            <span className="material-symbols-outlined text-slate-400 text-lg">child_care</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Marque se este cadastro for para um filho ou dependente.</p>
                                    </div>
                                </label>

                                {form.isMenor && (
                                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] space-y-6 border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="material-symbols-outlined text-primary">supervisor_account</span>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Informações do Responsável</h4>
                                        </div>
                                        <Field label="Nome do Responsável *" value={form.dadosResponsavel.nome} onChange={e => set('dadosResponsavel', { ...form.dadosResponsavel, nome: e.target.value })} placeholder="Pai, Mãe ou Tutor" />
                                        <Field label="CPF do Responsável" value={form.dadosResponsavel.cpf} onChange={e => set('dadosResponsavel', { ...form.dadosResponsavel, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" />
                                        <Field label="WhatsApp do Responsável" value={form.dadosResponsavel.telefone} onChange={e => set('dadosResponsavel', { ...form.dadosResponsavel, telefone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" />
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-5 gap-6">
                                    <div className="col-span-2">
                                        <Field label="CEP" value={form.cep} onChange={e => set('cep', maskCEP(e.target.value))} placeholder="00000-000" success={form.cep.replace(/\D/g, '').length === 8} />
                                    </div>
                                    <div className="col-span-3">
                                        <Field label="Rua / Logradouro" value={form.rua} onChange={e => set('rua', e.target.value)} placeholder="Aguardando CEP..." detail={loadingCEP ? 'Buscando...' : null} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="col-span-1">
                                        <Field label="Número" value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="123" />
                                    </div>
                                    <div className="col-span-3">
                                        <Field label="Bairro" value={form.bairro} onChange={e => set('bairro', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="col-span-3">
                                        <Field label="Cidade" value={form.cidade} onChange={e => set('cidade', e.target.value)} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Estado</label>
                                        <select className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100 font-semibold focus:border-primary focus:shadow-primary/10 transition-all" value={form.estado} onChange={e => set('estado', e.target.value)}>
                                            <option value="">UF</option>
                                            {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => <option key={uf}>{uf}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <Field 
                                    label="Plano de Saúde / Convênio" 
                                    value={form.plano} 
                                    onChange={e => set('plano', e.target.value)} 
                                    placeholder="Ex: Unimed, Bradesco, Particular..."
                                />
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Queixa Principal / Motivo da Consulta</label>
                                    <textarea
                                        className="w-full p-6 rounded-[32px] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100 font-semibold focus:border-primary focus:shadow-primary/10 transition-all resize-none"
                                        rows={3}
                                        placeholder="O que te trouxe à terapia hoje?"
                                        value={form.queixa}
                                        onChange={e => set('queixa', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Histórico Pessoal e Emocional</label>
                                    <textarea
                                        className="w-full p-6 rounded-[32px] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100 font-semibold focus:border-primary focus:shadow-primary/10 transition-all resize-none"
                                        rows={2}
                                        placeholder="Resumo da sua história de vida e momentos importantes..."
                                        value={form.historicoPessoal}
                                        onChange={e => set('historicoPessoal', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Histórico Familiar</label>
                                    <textarea
                                        className="w-full p-6 rounded-[32px] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100 font-semibold focus:border-primary focus:shadow-primary/10 transition-all resize-none"
                                        rows={2}
                                        placeholder="Hereditariedade, dinâmica familiar e relacionamentos..."
                                        value={form.historicoFamiliar}
                                        onChange={e => set('historicoFamiliar', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Histórico Médico / Medicações</label>
                                        <textarea
                                            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold focus:border-primary transition-all resize-none"
                                            rows={2}
                                            placeholder="Problemas de saúde, remédios em uso..."
                                            value={form.historicoMedico}
                                            onChange={e => set('historicoMedico', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Expectativas com a Terapia</label>
                                        <textarea
                                            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold focus:border-primary transition-all resize-none"
                                            rows={2}
                                            placeholder="O que você espera alcançar?"
                                            value={form.expectativas}
                                            onChange={e => set('expectativas', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-primary">description</span>
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Termo de Consentimento (TCLE)</h4>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 max-h-[160px] overflow-y-auto text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed scrollbar-thin">
                                        <p className="font-bold mb-2">TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO</p>
                                        <p className="mb-2">Ao continuar com o cadastro, declaro estar ciente de que o atendimento psicológico seguirá as normas do Conselho Federal de Psicologia (CFP).</p>
                                        <p className="mb-2"><strong>Sigilo Profissional:</strong> Todas as informações compartilhadas em sessão são estritamente confidenciais, resguardados os casos de risco de vida do paciente ou de terceiros, conforme o Código de Ética Profissional.</p>
                                        <p className="mb-2"><strong>Atendimento Online:</strong> O atendimento mediado por tecnologias exige conexão estável e local privativo escolhido pelo paciente para garantir a privacidade da sessão.</p>
                                        <p><strong>Aceite:</strong> Ao marcar a caixa de seleção abaixo, concordo voluntariamente com a prestação de serviços psicológicos na modalidade e horários combinados com o profissional.</p>
                                    </div>
                                </div>

                                <label className={`flex items-start gap-5 p-6 rounded-[32px] border-2 transition-all cursor-pointer ${form.tcleAceito ? 'border-primary/30 bg-primary/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                                    <div className={`mt-1 size-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.tcleAceito ? 'bg-primary border-primary' : 'bg-white dark:bg-slate-800 border-slate-200'}`}>
                                        {form.tcleAceito && <span className="material-symbols-outlined text-white text-base">check</span>}
                                    </div>
                                    <input type="checkbox" className="sr-only" checked={form.tcleAceito} onChange={e => set('tcleAceito', e.target.checked)} />
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800 dark:text-slate-200 text-sm">Li e concordo com o Termo de Consentimento</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Obrigatório para prosseguir</p>
                                    </div>
                                </label>
                            </div>
                        )}

                        <div className="pt-6">
                            <button type="submit" disabled={submitting || (step === 4 && !form.tcleAceito)} className={`w-full h-18 bg-primary text-white rounded-[28px] font-black text-xl shadow-2xl shadow-primary/40 hover:shadow-primary/50 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group ${(submitting || (step === 4 && !form.tcleAceito)) ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                {submitting ? (
                                    <><span className="material-symbols-outlined animate-spin">autorenew</span> Enviando...</>
                                ) : (
                                    <>{step < 4 ? 'Continuar' : 'Finalizar Cadastro'}<span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span></>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-xs">lock</span> Dados protegidos pela LGPD
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SelfRegister;
