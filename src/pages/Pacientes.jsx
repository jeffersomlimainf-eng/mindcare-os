import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CadastroPacienteModal from '../components/CadastroPacienteModal';
import NovoAgendamentoModal from '../components/NovoAgendamentoModal';
import { usePatients } from '../contexts/PatientContext';
import { useUser } from '../contexts/UserContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { formatDateLocal, calcularIdade } from '../utils/date';
import { formatPatientIdForUrl } from '../utils/navigation';
import { safeRender } from '../utils/render';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';
import Modal from '../components/Modal';
import HelpModal from '../components/HelpModal';
import { HELP_CONTENT } from '../constants/helpContent';

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

const ModalCompartilharLink = ({ isOpen, onClose, user }) => {
    const [telefone, setTelefone] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setTelefone('');
        }
    }, [isOpen]);

    const link = `${window.location.origin}/self-register?owner=${user?.id || ''}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        import('../components/Toast').then(m => m.showToast('Link de autocadastro copiado!', 'success'));
    };

    const handleWhatsApp = () => {
        const foneLimpo = telefone.replace(/\D/g, '');
        const mensagem = encodeURIComponent(`Olá! Para agilizarmos seu atendimento, você poderia preencher seus dados básicos através deste link seguro? ${link}`);
        if (foneLimpo.length >= 10) {
            window.open(`https://wa.me/55${foneLimpo}?text=${mensagem}`, '_blank');
        } else {
            window.open(`https://wa.me/?text=${mensagem}`, '_blank');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Compartilhar Link de Autocadastro" icon="link" maxWidth="max-w-md">
            <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Envie este link para o paciente preencher os próprios dados.</p>
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Link de Cadastro</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={link}
                            readOnly
                            className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm text-slate-900 dark:text-slate-100"
                        />
                        <button onClick={handleCopy} className="size-11 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border border-primary/20" title="Copiar">
                            <span className="material-symbols-outlined text-lg">content_copy</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Telefone do Paciente (Opcional)</label>
                    <div className="relative">
                        <input
                            type="tel"
                            placeholder="(11) 99999-0000"
                            value={telefone}
                            onChange={e => setTelefone(maskPhone(e.target.value))}
                            className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm text-slate-900 dark:text-slate-100 transition-all"
                        />
                        {telefone.replace(/\D/g, '').length >= 10 && (
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-lg">check_circle</span>
                        )}
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">Se preenchido, o WhatsApp será aberto diretamente para o número.</p>
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={handleCopy} className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-lg">content_copy</span>
                        Copiar Link
                    </button>
                    <button onClick={handleWhatsApp} className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20">
                        <span className="material-symbols-outlined text-xl">send</span>
                        WhatsApp
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const Pacientes = () => {
    const navigate = useNavigate();
    const { patients, addPatient, updatePatient, deletePatient } = usePatients();
    const { user } = useUser();
    const { addAppointment } = useAppointments();
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos');
    const [modalAberto, setModalAberto] = useState(false);
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [modalAgendaAberto, setModalAgendaAberto] = useState(false);
    const [pacienteParaAgenda, setPacienteParaAgenda] = useState(null);
    const [pacienteParaExcluir, setPacienteParaExcluir] = useState(null);
    const [erroExclusao, setErroExclusao] = useState(null);
    const [vista, setVista] = useState('tabela'); 
    const [modalCompartilharAberto, setModalCompartilharAberto] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    // Fechar modais locais com Esc primeiro
    useGlobalShortcuts({
        isModalOpen: modalAberto || modalAgendaAberto || !!pacienteParaExcluir || helpOpen,
        closeModal: () => {
            if (modalAberto) setModalAberto(false);
            if (modalAgendaAberto) setModalAgendaAberto(false);
            if (pacienteParaExcluir) setPacienteParaExcluir(null);
            if (helpOpen) setHelpOpen(false);
        },
        priority: 1
    });

    const pacientesFiltrados = patients.filter(p => {
        const buscaLimpa = busca.replace(/\D/g, '');
        const cpfOk = p.cpf && p.cpf.replace(/\D/g, '').includes(buscaLimpa);
        const buscaOk = (p.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
            p.id.includes(busca) ||
            (p.email && p.email.toLowerCase().includes(busca.toLowerCase())) ||
            (buscaLimpa !== '' && cpfOk);

        const statusOk = filtroStatus === 'Todos' || p.status === filtroStatus;
        return buscaOk && statusOk;
    });

    const handleAbrirEdicao = (p) => {
        setPacienteSelecionado(p);
        setModalAberto(true);
    };

    const handleNovoPaciente = () => {
        setPacienteSelecionado(null);
        setModalAberto(true);
    };

    const handleVerProntuario = (p) => {
        navigate(`/prontuarios/paciente/${formatPatientIdForUrl(p.id)}`);
    };

    const handleAbrirAgenda = (p) => {
        setPacienteParaAgenda({ ...p, paciente: p.nome });
        setModalAgendaAberto(true);
    };

    const handleSalvarAgendamento = (dados) => {
        const horaNum = parseInt(dados.hora.split(':')[0]) + parseInt(dados.hora.split(':')[1]) / 60;
        const d = new Date(dados.ano, dados.mes, dados.dia);
        const dataISO = formatDateLocal(d);

        const payload = {
            paciente: dados.paciente,
            pacienteId: dados.pacienteId,
            tipo: dados.tipo,
            timeStart: horaNum,
            duracao: parseInt(dados.duracao),
            data: dataISO,
            obs: dados.obs,
            recorrencia: dados.recorrencia,
            status: 'confirmado'
        };

        addAppointment(payload);
        setModalAgendaAberto(false);
    };

    const handleSalvarPaciente = async (dados) => {
        try {
            if (pacienteSelecionado) {
                console.log(`[Pacientes] Atualizando paciente: ${pacienteSelecionado.id}`, dados);
                await updatePatient(pacienteSelecionado.id, dados);
            } else {
                console.log('[Pacientes] Adicionando novo paciente:', dados);
                await addPatient(dados);
            }
        } catch (error) {
            console.error('[Pacientes] Erro ao salvar paciente:', error);
            throw error;
        }
    };

    const handleConfirmarExclusao = async () => {
        if (pacienteParaExcluir) {
            try {
                setErroExclusao(null);
                console.log(`[Pacientes] Tentando excluir paciente: ${pacienteParaExcluir.id}`);
                await deletePatient(pacienteParaExcluir.id);
                setPacienteParaExcluir(null);
            } catch (error) {
                console.error('[Pacientes] Erro ao excluir paciente:', error);
                if (error.code === 'CLINICAL_DATA_EXISTS') {
                    setErroExclusao(`Este paciente não pode ser excluído porque possui registros clínicos vinculados (${error.table}). Por favor, remova os documentos do prontuário primeiro.`);
                } else {
                    setErroExclusao('Ocorreu um erro inesperado ao tentar excluir o paciente.');
                }
            }
        }
    };


    return (
        <div className="space-y-6">
            <HelpModal 
                isOpen={helpOpen} 
                onClose={() => setHelpOpen(false)} 
                content={HELP_CONTENT.pacientes} 
            />

            <CadastroPacienteModal
                isOpen={modalAberto}
                onClose={() => setModalAberto(false)}
                onSave={handleSalvarPaciente}
                paciente={pacienteSelecionado}
            />

            <ModalCompartilharLink
                isOpen={modalCompartilharAberto}
                onClose={() => setModalCompartilharAberto(false)}
                user={user}
            />

            <NovoAgendamentoModal
                isOpen={modalAgendaAberto}
                onClose={() => setModalAgendaAberto(false)}
                pacientePreSelecionado={pacienteParaAgenda}
                onSave={handleSalvarAgendamento}
            />

            {/* Modal de Confirmação de Exclusão */}
            {pacienteParaExcluir && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className={`size-16 rounded-full flex items-center justify-center mx-auto mb-4 ${erroExclusao ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-500' : 'bg-red-100 dark:bg-red-900/20 text-red-500'}`}>
                                <span className="material-symbols-outlined text-3xl">{erroExclusao ? 'warning' : 'delete_forever'}</span>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                                {erroExclusao ? 'Ação Bloqueada' : 'Excluir Cadastro?'}
                            </h3>
                            
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                {erroExclusao || `Esta ação removerá todos os dados básicos de ${pacienteParaExcluir.nome}. O histórico financeiro será mantido de forma anônima.`}
                            </p>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { setPacienteParaExcluir(null); setErroExclusao(null); }} 
                                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                                >
                                    {erroExclusao ? 'Entendi' : 'Cancelar'}
                                </button>
                                
                                {!erroExclusao && (
                                    <button 
                                        onClick={handleConfirmarExclusao} 
                                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-red-500/20"
                                    >
                                        Excluir Agora
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-sm">group</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Diretório</span>
                        </div>
                        <button 
                            onClick={() => setHelpOpen(true)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-all border border-primary/10"
                        >
                            <span className="material-symbols-outlined text-[14px]">help_outline</span>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Como funciona?</span>
                        </button>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">Pacientes</h1>
                    <p className="text-slate-500 font-medium mt-1">Gestão de prontuários e vínculos clínicos.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                     <button 
                        onClick={() => setModalCompartilharAberto(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl h-12 px-5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white transition-all group"
                        title="Gerar link para o paciente preencher os dados"
                    >
                        <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">link</span>
                        <span>Gerar Link</span>
                    </button>
                    <button
                        onClick={handleNovoPaciente}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        <span>Novo Paciente</span>
                    </button>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col lg:flex-row gap-4 items-center px-1">
                <div className="flex-1 w-full glass dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <label className="relative flex items-center w-full">
                        <span className="material-symbols-outlined absolute left-4 text-slate-400">search</span>
                        <input
                            className="w-full h-11 pl-12 pr-4 bg-transparent outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                            placeholder="Buscar por nome, CPF ou prontuário..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </label>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="flex glass dark:bg-slate-800/50 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        {['Todos', 'Ativo', 'Inativo'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFiltroStatus(s)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filtroStatus === s ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-primary'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="flex glass dark:bg-slate-800/50 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ml-auto lg:ml-0">
                        <button onClick={() => setVista('tabela')} className={`size-9 flex items-center justify-center rounded-lg transition-all ${vista === 'tabela' ? 'bg-primary text-white shadow-sm' : 'text-slate-400'}`}><span className="material-symbols-outlined text-lg">format_list_bulleted</span></button>
                        <button onClick={() => setVista('grade')} className={`size-9 flex items-center justify-center rounded-lg transition-all ${vista === 'grade' ? 'bg-primary text-white shadow-sm' : 'text-slate-400'}`}><span className="material-symbols-outlined text-lg">grid_view</span></button>
                    </div>
                </div>
            </div>

            {vista === 'grade' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
                    {pacientesFiltrados.map((p, i) => (
                        <div key={i} 
                            className="glass dark:bg-slate-800/50 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-all group relative cursor-pointer" 
                            style={{ animationDelay: `${i * 50}ms` }}
                            onClick={() => handleAbrirEdicao(p)}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`size-12 rounded-xl flex items-center justify-center font-bold text-base ${p.cor || 'bg-slate-100 text-slate-500'}`}>
                                        {p.iniciais}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase leading-tight tracking-tight">{safeRender(p.nome)}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            {calcularIdade(p.dataNascimento || p.nascimento)}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${p.status === 'Ativo' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {p.status}
                                </span>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button onClick={() => handleVerProntuario(p)} className="flex-1 h-10 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all">
                                    Prontuário
                                </button>
                                <button onClick={() => handleAbrirAgenda(p)} className="size-10 bg-slate-50 dark:bg-slate-700 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary transition-all">
                                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                                </button>
                                <button onClick={() => setPacienteParaExcluir(p)} className="size-10 bg-slate-50 dark:bg-slate-700 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 transition-all">
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>

                            <button onClick={() => handleAbrirEdicao(p)} className="absolute top-4 right-4 p-1 text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                                <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                        </div>
                    ))}
                    <button onClick={handleNovoPaciente} className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:bg-primary/5 hover:border-primary/20 transition-all text-slate-400">
                        <span className="material-symbols-outlined text-4xl">add</span>
                        <p className="text-xs font-bold uppercase tracking-widest">Novo Paciente</p>
                    </button>
                </div>
            ) : (
                <div className="glass dark:bg-slate-900/50 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 px-1 animate-settle">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Paciente</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Contato</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Idade</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                                </tr>
                            </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {pacientesFiltrados.map((p, i) => (
                                        <tr key={i} 
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer" 
                                            onClick={() => handleAbrirEdicao(p)}
                                        >
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-10 rounded-full flex items-center justify-center font-bold text-xs ${p.cor || 'bg-slate-100 text-slate-500'}`}>{p.iniciais}</div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase leading-tight">{safeRender(p.nome)}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">ID: {p.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{safeRender(p.email || p.telefone, '--')}</span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{calcularIdade(p.dataNascimento || p.nascimento)}</span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${p.status === 'Ativo' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{p.status}</span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); handleVerProntuario(p); }} className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all"><span className="material-symbols-outlined text-lg">visibility</span></button>
                                                <button onClick={(e) => { e.stopPropagation(); setPacienteParaExcluir(p); }} className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {pacientesFiltrados.length === 0 && (
                            <div className="py-12 text-center text-slate-400 font-medium">
                                <span className="material-symbols-outlined text-4xl mb-2">group</span>
                                <p>Nenhum paciente encontrado.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="px-1 text-xs text-slate-400 font-medium pt-2">
                Exibindo {pacientesFiltrados.length} de {patients.length} pacientes cadastrados
            </div>
        </div>
    );
};

export default Pacientes;


