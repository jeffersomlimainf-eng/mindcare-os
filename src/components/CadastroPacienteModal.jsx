import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from './Modal';
import { showToast } from './Toast';
import { patientSchema } from '../schemas/patientSchema';
import { logger } from '../utils/logger';
import { maskCPF, maskPhone, maskCEP, formatNameCase, calculateAge } from '../utils/formatters';

const TABS = ['Dados Pessoais', 'Endereço', 'Dados Clínicos'];


const Field = ({ label, value, onChange, onBlur, type = 'text', placeholder = '', error = null, success = false, detail = null, name, register }) => {
    const registered = register ? register(name) : {};
    
    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                {detail && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{detail}</span>}
            </div>
            <div className="relative">
                <input
                    {...registered}
                    type={type}
                    className={`w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm text-slate-900 dark:text-slate-100 transition-all ${error ? 'border-rose-300 ring-rose-100' : success ? 'border-emerald-300' : 'border-slate-200 dark:border-slate-700'}`}
                    {...(value !== undefined ? { value } : {})}
                    placeholder={placeholder}
                    onChange={(e) => {
                        // Chama o onChange do register (importante para o react-hook-form)
                        if (registered.onChange) registered.onChange(e);
                        // Chama o onChange personalizado (máscaras, etc)
                        if (onChange) onChange(e);
                    }}
                    onBlur={(e) => {
                        if (registered.onBlur) registered.onBlur(e);
                        if (onBlur) onBlur(e);
                    }}
                />
                {success && <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-lg">check_circle</span>}
                {error && <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 text-lg">error</span>}
            </div>
            {error && <p className="mt-1 text-[10px] text-rose-500 font-bold uppercase">{error}</p>}
        </div>
    );
};

const CadastroPacienteModal = ({ isOpen, onClose, onSave, paciente = null }) => {
    const [tab, setTab] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(patientSchema),
        defaultValues: {
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
        }
    });

    const formValues = watch();

    // Busca de CEP
    useEffect(() => {
        const cepLimpo = (formValues.cep || '').replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (data.erro) {
                        showToast('CEP não encontrado', 'warning');
                        return;
                    }
                    setValue('rua', data.logradouro || formValues.rua);
                    setValue('bairro', data.bairro || formValues.bairro);
                    setValue('cidade', data.localidade || formValues.cidade);
                    setValue('estado', data.uf || formValues.estado);
                })
                .catch(() => showToast('Erro ao buscar CEP', 'error'));
        }
    }, [formValues.cep, setValue]);

    // Carregar dados do paciente ao editar
    useEffect(() => {
        if (paciente && isOpen) {
            reset({
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
        } else if (isOpen) {
            reset({
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
    }, [paciente, isOpen, reset]);

    const onSubmit = async (data) => {
        setIsSaving(true);
        try {
            if (onSave) {
                // Converte precoSessao de string (com vírgula) para número antes de salvar
                const sanitizedData = {
                    ...data,
                    precoSessao: data.precoSessao ? parseFloat(String(data.precoSessao).replace(',', '.')) : 0
                };
                await onSave(sanitizedData);
            }
            showToast(paciente ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!', 'success');
            onClose();
            setTab(0);
        } catch (error) {
            logger.error('[CadastroPacienteModal] Erro ao salvar:', error);
            showToast('Erro ao salvar paciente. Tente novamente.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const onInvalid = (errors) => {
        const errorPaths = Object.keys(errors);
        if (errorPaths.length > 0) {
            const firstError = errorPaths[0];
            
            const tab0Fields = ['nome', 'cpf', 'dataNascimento', 'genero', 'telefone', 'email', 'status', 'estadoCivil', 'profissao', 'isMenor', 'dadosResponsavel'];
            const tab1Fields = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
            
            if (tab0Fields.some(f => firstError.startsWith(f))) {
                setTab(0);
            } else if (tab1Fields.some(f => firstError.startsWith(f))) {
                setTab(1);
            } else {
                setTab(2);
            }
            
            showToast('Verifique os campos obrigatórios ou inválidos.', 'warning');
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

            <div className="p-4 md:p-6">
                {tab === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Field
                                label="Nome Completo *"
                                name="nome"
                                register={register}
                                onBlur={e => setValue('nome', formatNameCase(e.target.value))}
                                placeholder="Nome do paciente"
                                error={errors.nome?.message}
                            />
                        </div>
                        <Field
                            label="CPF *"
                            name="cpf"
                            register={register}
                            onChange={e => setValue('cpf', maskCPF(e.target.value))}
                            placeholder="000.000.000-00"
                            success={formValues.cpf?.length === 14 && !errors.cpf}
                            error={errors.cpf?.message}
                        />
                        <Field
                            label="Data de Nascimento"
                            name="dataNascimento"
                            register={register}
                            detail={formValues.dataNascimento ? `${calculateAge(formValues.dataNascimento)} anos` : null}
                            onChange={e => {
                                const birthDate = e.target.value;
                                setValue('dataNascimento', birthDate);
                                
                                if (birthDate) {
                                    const age = calculateAge(birthDate);
                                    if (age < 18) {
                                        setValue('isMenor', true);
                                    } else {
                                        setValue('isMenor', false);
                                    }
                                }
                            }}
                            type="date"
                            error={errors.dataNascimento?.message}
                        />
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gênero</label>
                            <select 
                                {...register('genero')}
                                className={`w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:ring-2 focus:ring-primary/30 outline-none text-sm text-slate-900 dark:text-slate-100 transition-all font-medium ${errors.genero ? 'border-rose-300' : 'border-slate-200 dark:border-slate-700'}`}
                            >
                                <option value="">Selecionar...</option>
                                <option>Feminino</option><option>Masculino</option><option>Não-binário</option><option>Prefiro não informar</option>
                            </select>
                            {errors.genero && <p className="mt-1 text-[10px] text-rose-500 font-bold uppercase">{errors.genero.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status do Paciente</label>
                            <select 
                                {...register('status')}
                                className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 outline-none text-sm text-slate-900 dark:text-slate-100 transition-all font-bold"
                            >
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado Civil</label>
                            <select 
                                {...register('estadoCivil')}
                                className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 outline-none text-sm text-slate-900 dark:text-slate-100 transition-all font-medium"
                            >
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
                            name="profissao"
                            register={register}
                            placeholder="Ex: Engenheiro, Professor..."
                            error={errors.profissao?.message}
                        />
                        <Field
                            label="Telefone / WhatsApp *"
                            name="telefone"
                            register={register}
                            onChange={e => setValue('telefone', maskPhone(e.target.value))}
                            type="tel"
                            placeholder="(11) 99999-0000"
                            success={formValues.telefone?.replace(/\D/g, '').length >= 10 && !errors.telefone}
                            error={errors.telefone?.message}
                        />
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary/40 transition-all bg-slate-50/50 dark:bg-slate-800/50">
                                <div className={`size-5 rounded border-2 flex items-center justify-center transition-all ${formValues.isMenor ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                                    {formValues.isMenor && <span className="material-symbols-outlined text-white text-xs">check</span>}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    {...register('isMenor')}
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Paciente Menor de Idade</p>
                                    <p className="text-[11px] text-slate-500">Exibir campos para cadastro do responsável legal</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">child_care</span>
                            </label>
                        </div>

                        {formValues.isMenor && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                <div className="md:col-span-2 flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-primary text-base">supervisor_account</span>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Dados do Responsável Legal</h4>
                                </div>
                                <div className="md:col-span-2">
                                    <Field
                                        label="Nome do Responsável *"
                                        name="dadosResponsavel.nome"
                                        register={register}
                                        onBlur={e => setValue('dadosResponsavel.nome', formatNameCase(e.target.value))}
                                        placeholder="Nome completo do pai, mãe ou tutor"
                                        error={errors.dadosResponsavel?.nome?.message}
                                    />
                                </div>
                                <Field
                                    label="CPF do Responsável"
                                    name="dadosResponsavel.cpf"
                                    register={register}
                                    onChange={e => setValue('dadosResponsavel.cpf', maskCPF(e.target.value))}
                                    placeholder="000.000.000-00"
                                    success={formValues.dadosResponsavel?.cpf?.length === 14 && !errors.dadosResponsavel?.cpf}
                                    error={errors.dadosResponsavel?.cpf?.message}
                                />
                                <Field
                                    label="Telefone do Responsável"
                                    name="dadosResponsavel.telefone"
                                    register={register}
                                    onChange={e => setValue('dadosResponsavel.telefone', maskPhone(e.target.value))}
                                    placeholder="(00) 00000-0000"
                                    error={errors.dadosResponsavel?.telefone?.message}
                                />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <Field
                                label="E-mail"
                                name="email"
                                register={register}
                                type="email"
                                placeholder="paciente@email.com"
                                success={formValues.email?.length > 0 && !errors.email}
                                error={errors.email?.message}
                            />
                        </div>
                    </div>
                )}

                {tab === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="CEP"
                            name="cep"
                            register={register}
                            onChange={e => setValue('cep', maskCEP(e.target.value))}
                            placeholder="00000-000"
                            error={errors.cep?.message}
                        />
                        <div />
                        <div className="md:col-span-2">
                            <Field
                                label="Logradouro / Rua"
                                name="rua"
                                register={register}
                                placeholder="Rua, Avenida..."
                                error={errors.rua?.message}
                            />
                        </div>
                        <Field
                            label="Número"
                            name="numero"
                            register={register}
                            placeholder="Ex: 123"
                            error={errors.numero?.message}
                        />
                        <Field
                            label="Bairro"
                            name="bairro"
                            register={register}
                            error={errors.bairro?.message}
                        />
                        <Field
                            label="Cidade"
                            name="cidade"
                            register={register}
                            error={errors.cidade?.message}
                        />
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado</label>
                            <select 
                                {...register('estado')}
                                className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 outline-none text-sm text-slate-900 dark:text-slate-100 transition-all"
                            >
                                <option value="">UF</option>
                                {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => <option key={uf}>{uf}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {tab === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Queixa Principal</label>
                            <textarea
                                {...register('queixa')}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm resize-none"
                                rows={3}
                                placeholder="Descreva o motivo principal da consulta..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Histórico Clínico Relevante</label>
                            <textarea
                                {...register('historico')}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm resize-none"
                                rows={3}
                                placeholder="Diagnósticos anteriores, medicações, tratamentos..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Preço da Sessão Combinado (R$)</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">R$</span>
                                    <input
                                        type="text"
                                        className={`w-full h-14 pl-10 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 focus:ring-4 focus:ring-primary/10 outline-none text-xl font-bold text-slate-700 dark:text-slate-100 transition-all ${errors.precoSessao ? 'border-rose-300' : 'border-slate-100 dark:border-slate-700/50 focus:border-primary'}`}
                                        placeholder="0,00"
                                        value={watch('precoSessao') || ''}
                                        onChange={e => {
                                            let val = e.target.value.replace(/[^\d,.]/g, '').replace('.', ',');
                                            const parts = val.split(',');
                                            if (parts.length > 2) val = parts[0] + ',' + parts.slice(1).join('');
                                            
                                            // Atualiza o valor visual (string com vírgula) no estado do formulário
                                            setValue('precoSessao', val);
                                        }}
                                        onBlur={() => {
                                            // No desfoque, podemos garantir que o valor está limpo
                                            const val = watch('precoSessao');
                                            if (val) {
                                                const numeric = parseFloat(String(val).replace(',', '.'));
                                                if (!isNaN(numeric)) {
                                                    setValue('precoSessao', numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                                                }
                                            }
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
                                    name="emergency_contact"
                                    register={register}
                                    onBlur={e => setValue('emergency_contact', formatNameCase(e.target.value))}
                                    placeholder="Ex: Maria (Mãe) - (11) 99999-0000"
                                    error={errors.emergency_contact?.message}
                                />
                            </div>

                            <div className="md:col-span-1">
                                <Field
                                    label="💊 Medicamentos em Uso"
                                    name="medications"
                                    register={register}
                                    placeholder="Ex: Rivotril, Fluoxetina..."
                                    error={errors.medications?.message}
                                />
                            </div>

                            <div className="md:col-span-1">
                                <Field
                                    label="⚠️ Alergias Conhecidas"
                                    name="allergies"
                                    register={register}
                                    placeholder="Ex: Dipirona, Corantes..."
                                    error={errors.allergies?.message}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Como conheceu a clínica? (Indicação)</label>
                                <input
                                    {...register('referral_source')}
                                    className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 outline-none text-sm"
                                    placeholder="Ex: Instagram, Indicação de Amigo, Google..."
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 shrink-0">
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
                            
                            const foneLimpo = (formValues.telefone || '').replace(/\D/g, '');
                            if (foneLimpo.length >= 10) {
                                const mensagem = encodeURIComponent(`Olá ${formValues.nome?.split(' ')[0] || 'paciente'}, aqui é da clínica. Para agilizarmos seu atendimento, você poderia preencher seus dados básicos através deste link seguro? ${link}`);
                                window.open(`https://wa.me/55${foneLimpo}?text=${mensagem}`, '_blank');
                                showToast('Link copiado e WhatsApp aberto!', 'success');
                            } else {
                                showToast('Link de autocadastro copiado!', 'success');
                            }
                        }}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg border ${(formValues.telefone || '').replace(/\D/g, '').length >= 10 ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}
                        title={(formValues.telefone || '').replace(/\D/g, '').length >= 10 ? "Enviar link via WhatsApp" : "Gerar link para o paciente preencher os dados"}
                    >
                        <span className="material-symbols-outlined text-sm">{(formValues.telefone || '').replace(/\D/g, '').length >= 10 ? 'send' : 'link'}</span>
                        {(formValues.telefone || '').replace(/\D/g, '').length >= 10 ? 'Enviar no Whats' : 'Gerar Link'}
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
                        <button 
                            onClick={handleSubmit(onSubmit, onInvalid)} 
                            disabled={isSaving} 
                            className={`flex items-center gap-2 px-7 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
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



