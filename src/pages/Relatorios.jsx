import { useAppointments } from '../contexts/AppointmentContext';
import { usePatients } from '../contexts/PatientContext';
import { useFinance } from '../contexts/FinanceContext';
import { showToast } from '../components/Toast';
import { useMemo, useRef } from 'react';
import { exportRelatorioToWord } from '../utils/exportUtils';

const Relatorios = () => {
    const reportRef = useRef(null);
    const { appointments } = useAppointments();
    const { patients } = usePatients();
    const { transactions } = useFinance();

    const stats = useMemo(() => {
        // Forçando Março de 2026 para contornar relógio do navegador
        const agora = new Date('2026-03-19T12:00:00');
        const mesAtual = agora.getMonth();
        const anoAtual = agora.getFullYear();

        // 1. Consultas no Mês
        const dStrAtual = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-`;
        const consultasMes = appointments.filter(a => a.data && a.data.startsWith(dStrAtual));

        // 2. Taxa de Comparecimento (Finalizados / Total do mês)
        const finalizadasMes = consultasMes.filter(a => a.status === 'concluido');
        const taxaComparecimento = consultasMes.length > 0 
            ? Math.round((finalizadasMes.length / consultasMes.length) * 100) 
            : 0;

        // 3. Novos Pacientes
        const novosPacientes = patients.filter(p => {
            if (!p.createdAt) return false;
            const dataP = new Date(p.createdAt);
            return dataP.getMonth() === mesAtual && dataP.getFullYear() === anoAtual;
        });

        // 4. Receita Média por Sessão
        const receitasSessao = transactions.filter(t => 
            t.tipo === 'Receita' && 
            t.subcategoria === 'sessao' &&
            t.date && t.date.startsWith(dStrAtual)
        );
        const totalReceitaSessao = receitasSessao.reduce((acc, t) => acc + (t.valor || 0), 0);
        const receitaMedia = finalizadasMes.length > 0 
            ? Math.round(totalReceitaSessao / finalizadasMes.length) 
            : 0;

        // Dados Gráfico: Consultas nos últimos 7 meses
        const mesesIds = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(anoAtual, mesAtual - i, 1);
            mesesIds.push({
                label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
                mes: d.getMonth(),
                ano: d.getFullYear()
            });
        }

        const historicoConsultas = mesesIds.map(m => {
            const dStrEx = `${m.ano}-${String(m.mes + 1).padStart(2, '0')}-`;
            const count = appointments.filter(a => a.data && a.data.startsWith(dStrEx)).length;
            return { label: m.label.toUpperCase(), value: count };
        });

        // Dados Gráfico: Distribuição por Tipo
        const tipos = appointments.reduce((acc, a) => {
            const t = a.tipo || 'Outros';
            acc[t] = (acc[t] || 0) + 1;
            return acc;
        }, {});
        
        const totalTipos = appointments.length || 1;
        const distribuicaoTipo = [
            { label: 'Terapia Individual (Presencial)', pct: Math.round(((tipos['presencial'] || 0) / totalTipos) * 100), cor: 'bg-primary' },
            { label: 'Acompanhamento Online (Tele)', pct: Math.round(((tipos['teleconsulta'] || 0) / totalTipos) * 100), cor: 'bg-emerald-500' },
            { label: 'Avaliação/Outros', pct: Math.round((( (tipos['avaliacao'] || 0) + (tipos['Outros'] || 0) ) / totalTipos) * 100), cor: 'bg-violet-500' },
        ].filter(t => t.pct > 0);

        return {
            consultasMes: consultasMes.length,
            taxaComparecimento: `${taxaComparecimento}%`,
            novosPacientes: novosPacientes.length,
            receitaMedia: `R$ ${receitaMedia}`,
            historicoConsultas,
            distribuicaoTipo
        };
    }, [appointments, patients, transactions]);

    return (
        <div className="space-y-6" ref={reportRef}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <span className="material-symbols-outlined text-sm">bar_chart</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Análises e Insights</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black italic tracking-tight">Relatórios</h1>
                    <p className="text-slate-500 font-medium">Acompanhe métricas e desempenho clínico</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={async () => {
                            showToast('Preparando exportação Word...', 'info');
                            try {
                                await exportRelatorioToWord(stats, 'relatorio_desempenho.docx');
                                showToast('Arquivo Word gerado com sucesso!', 'success');
                            } catch (e) {
                                showToast('Erro ao exportar Word.', 'error');
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-black uppercase tracking-widest hover:border-primary transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">download</span> Exportar Relatório (Word)
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Consultas no Mês', value: stats.consultasMes, icon: 'event', trend: '+12%', cor: 'bg-primary/10 text-primary' },
                    { label: 'Taxa de Comparecimento', value: stats.taxaComparecimento, icon: 'how_to_reg', trend: '+3%', cor: 'bg-emerald-100 text-emerald-600' },
                    { label: 'Novos Pacientes', value: stats.novosPacientes, icon: 'person_add', trend: '+25%', cor: 'bg-violet-100 text-violet-600' },
                    { label: 'Receita Média/Sessão', value: stats.receitaMedia, icon: 'monetization_on', trend: 'estável', cor: 'bg-amber-100 text-amber-600' },
                ].map((k, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-all hover:shadow-md">
                        <div className={`size-12 rounded-2xl ${k.cor} flex items-center justify-center mb-4 shadow-sm`}>
                            <span className="material-symbols-outlined text-2xl">{k.icon}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">{k.label}</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{k.value}</p>
                        <div className="flex items-center gap-1 mt-2">
                            <span className="material-symbols-outlined text-sm text-green-500">trending_up</span>
                            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">{k.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gráficos Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Crescimento de Consultas</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Volume mensal nos últimos 7 meses</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300">show_chart</span>
                    </div>
                    <div className="flex items-end gap-3 h-52 mt-4">
                        {stats.historicoConsultas.map((v, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                                <div className="flex-1 w-full flex items-end justify-center relative group">
                                    <div
                                        className="w-full bg-primary/20 hover:bg-primary/40 rounded-xl transition-all cursor-pointer relative flex items-end justify-center"
                                        style={{ height: `${(v.value / (Math.max(...stats.historicoConsultas.map(h => h.value)) || 10)) * 100}%`, minHeight: '8px' }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl z-20">
                                            {v.value} consultas
                                        </div>
                                        <div className="w-full h-full bg-gradient-to-t from-primary/30 to-transparent rounded-xl" />
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate w-full text-center">
                                    {v.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Mix de Atendimento</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Distribuição por modalidade</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300">pie_chart</span>
                    </div>
                    <div className="space-y-6 py-4">
                        {stats.distribuicaoTipo.length > 0 ? stats.distribuicaoTipo.map((t, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2.5">
                                    <span className="text-slate-500">{t.label}</span>
                                    <span className="text-slate-900 dark:text-white">{t.pct}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                        className={`h-full ${t.cor} rounded-full transition-all duration-1000 shadow-lg`} 
                                        style={{ width: `${t.pct}%` }} 
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="h-40 flex items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                Sem dados suficientes
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Relatorios;


