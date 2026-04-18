import { useState, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatients } from '../contexts/PatientContext';
import { useEvolutions } from '../contexts/EvolutionContext';


import { logger } from '../utils/logger';
const HistoricoEvolucoes = () => {
    const navigate = useNavigate();
    const { pacienteId } = useParams();
    const { patients } = usePatients();
    const { evolutions } = useEvolutions();
    const historyRef = useRef(null);

    const paciente = useMemo(() => {
        const cleanId = pacienteId?.startsWith('#') ? pacienteId : `#${pacienteId}`;
        return patients.find(p => p.id === cleanId) || null;
    }, [pacienteId, patients]);

    const evolucoesDoPaciente = useMemo(() => {
        if (!paciente) return [];
        return evolutions
            .filter(e => e.pacienteId === paciente.id)
            .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    }, [paciente, evolutions]);

    const [filtro, setFiltro] = useState('todos');

    const humoresMap = {
        muito_baixo: { icon: 'sentiment_very_dissatisfied', label: 'Muito Baixo', color: 'text-red-500' },
        baixo: { icon: 'sentiment_dissatisfied', label: 'Baixo', color: 'text-orange-500' },
        neutro: { icon: 'sentiment_neutral', label: 'Neutro', color: 'text-slate-500' },
        bom: { icon: 'sentiment_satisfied', label: 'Bom', color: 'text-emerald-500' },
        muito_bom: { icon: 'sentiment_very_satisfied', label: 'Muito Bom', color: 'text-green-500' },
    };

    const riscoMap = {
        baixo: { label: 'Baixo', color: 'bg-green-100 text-green-700' },
        moderado: { label: 'Moderado', color: 'bg-amber-100 text-amber-700' },
        alto: { label: 'Alto', color: 'bg-orange-100 text-orange-700' },
        critico: { label: 'Crítico', color: 'bg-red-100 text-red-700' },
    };

    const formatarData = (str) => {
        if (!str) return '';
        const dt = new Date(str);
        return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatarHora = (str) => {
        if (!str) return '';
        const dt = new Date(str);
        return dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleExportPDF = async () => {
        const confirm = window.confirm("Deseja gerar o relatório em PDF com todo o histórico de evoluções deste paciente?");
        if (!confirm) return;
        
        try {
            await exportToPDF(historyRef.current, `Historico_Evolucoes_${paciente.nome.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            logger.error('Erro ao exportar histórico:', error);
        }
    };

    if (!paciente) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">person_off</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Paciente não encontrado</h2>
                <p className="text-slate-500 mb-6">O ID informado não corresponde a nenhum paciente cadastrado.</p>
                <button onClick={() => navigate('/prontuarios')} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold">Voltar aos Prontuários</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/prontuarios')} className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white">Evoluções do Paciente</h1>
                        <p className="text-sm text-slate-500">Histórico completo de sessões</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {/* {evolucoesDoPaciente.length > 0 && (
                        <button 
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                        >
                            <span className="material-symbols-outlined text-base">picture_as_pdf</span> Exportar PDF
                        </button>
                    )} */}
                    <button onClick={() => navigate('/prontuarios/evolucao/novo')} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        <span className="material-symbols-outlined text-base">add</span> Nova Evolução
                    </button>
                </div>
            </div>

            {/* Patient Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-center gap-4">
                    <div className={`size-14 rounded-full flex items-center justify-center text-lg font-black ${paciente.cor || 'bg-primary/10 text-primary'}`}>
                        {paciente.iniciais}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">{paciente.nome}</h2>
                        <p className="text-sm text-slate-500">{paciente.id} · {paciente.email} · {paciente.telefone}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-primary">{evolucoesDoPaciente.length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evoluções</p>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            {evolucoesDoPaciente.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">clinical_notes</span>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhuma evolução registrada</h3>
                    <p className="text-sm text-slate-400 mb-6">Este paciente ainda não possui registros de evolução de sessão.</p>
                    <button onClick={() => navigate('/prontuarios/evolucao/novo')} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        <span className="material-symbols-outlined text-base mr-1 align-middle">add</span> Registrar Primeira Evolução
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {evolucoesDoPaciente.map((ev, idx) => {
                        const humor = humoresMap[ev.humorPaciente] || humoresMap.neutro;
                        const risco = riscoMap[ev.nivelRisco] || riscoMap.baixo;
                        const tecnicasUsadas = (ev.tecnicas || []).filter(t => t.checked);

                        return (
                            <div key={ev.id}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                                onClick={() => navigate(`/prontuarios/evolucao/${ev.id}`)}
                            >
                                {/* Card Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{formatarData(ev.criadoEm)}</span>
                                        </div>
                                        <span className="text-slate-300">·</span>
                                        <span className="text-xs text-slate-500">{formatarHora(ev.criadoEm)}</span>
                                        <span className="text-slate-300">·</span>
                                        <span className="text-xs text-slate-500">{ev.tipoAtendimento}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${risco.color}`}>{risco.label}</span>
                                        <span className={`material-symbols-outlined text-xl ${humor.color}`}>{humor.icon}</span>
                                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="px-6 py-4">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 mb-3">
                                        {typeof ev.conteudo === 'object' 
                                            ? (ev.conteudo?.subjetivo || ev.conteudo?.S || 'Registro estruturado...') 
                                            : (ev.evolucao || ev.subjetivo || <span className="italic text-slate-400">Sem evolução registrada</span>)}
                                    </p>

                                    {/* Técnicas + Meta */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {tecnicasUsadas.slice(0, 3).map(t => (
                                            <span key={t.id} className="px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold">{t.nome}</span>
                                        ))}
                                        {tecnicasUsadas.length > 3 && (
                                            <span className="text-[10px] text-slate-400 font-bold">+{tecnicasUsadas.length - 3} mais</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Versão para Impressão (Oculta na tela) */}
            <div className="hidden print:block" ref={historyRef} style={{ padding: '20px', background: 'white' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: '0 0 10px' }}>Histórico Clínico de Evoluções</h1>
                    <p style={{ fontSize: '14pt', margin: 0 }}>{paciente.nome} ({paciente.id})</p>
                </div>

                <div style={{ marginBottom: '40px' }}>
                    {evolucoesDoPaciente.map((ev, idx) => (
                        <div key={ev.id} style={{ marginBottom: '30px', pageBreakInside: 'avoid', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '12pt' }}>{formatarData(ev.criadoEm)} às {formatarHora(ev.criadoEm)}</span>
                                <span style={{ fontSize: '10pt', color: '#666' }}>{ev.tipoAtendimento}</span>
                            </div>
                            <div style={{ fontSize: '11pt', lineHeight: '1.6', textAlign: 'justify' }}>
                                {typeof ev.conteudo === 'object' 
                                    ? (ev.conteudo?.subjetivo || ev.conteudo?.S || 'Registro estruturado...') 
                                    : (ev.evolucao || ev.subjetivo || 'Registro clínico...')}
                            </div>
                            {ev.tecnicas && ev.tecnicas.some(t => t.checked) && (
                                <div style={{ marginTop: '10px', fontSize: '9pt', color: '#666' }}>
                                    <strong>Técnicas:</strong> {ev.tecnicas.filter(t => t.checked).map(t => t.nome).join(', ')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '10pt', color: '#999' }}>
                    Documento gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} via Meu Sistema PSI
                </div>
            </div>
        </div>
    );
};

export default HistoricoEvolucoes;



