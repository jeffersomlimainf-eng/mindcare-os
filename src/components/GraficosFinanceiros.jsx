import React, { useState, useMemo, useRef, useEffect } from 'react';

const PERIODOS = [
    { id: 'dia', label: 'Hoje', desc: 'Fluxo financeiro das últimas 24 horas', icon: 'today' },
    { id: 'semana', label: 'Semana', desc: 'Fluxo financeiro dos últimos 7 dias', icon: 'date_range' },
    { id: 'mes', label: 'Mês Atual', desc: 'Fluxo financeiro do mês atual', icon: 'calendar_month' },
    { id: 'ano', label: 'Ano Atual', desc: `Fluxo financeiro do ano de ${new Date().getFullYear()}`, icon: 'calendar_today' },
];

const NOMES_MESES_CURTO = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
const NOMES_MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const NOMES_DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const getNiceTicks = (maxValue, tickCount = 5) => {
    if (maxValue <= 0) return [0, 250, 500, 750, 1000];
    const rawStep = maxValue / (tickCount - 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceSteps = [1, 2, 2.5, 5, 10];
    let niceStep = niceSteps.find(s => s * magnitude >= rawStep) * magnitude;
    if (!niceStep || !isFinite(niceStep)) niceStep = 250;
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
        ticks.push(Math.round(niceStep * i));
    }
    return ticks;
};

const GraficosFinanceiros = ({ transacoes }) => {
    const [periodo, setPeriodo] = useState('mes');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const periodoAtual = PERIODOS.find(p => p.id === periodo) || PERIODOS[2];

    const { chartLabels, receitaValues, despesaValues, transacaoValues } = useMemo(() => {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const mesAtual = agora.getMonth();
        const diaAtual = agora.getDate();

        let labels = [];
        let receitas = [];
        let despesas = [];
        let transacoesCont = [];

        const safe = Array.isArray(transacoes) ? transacoes.filter(Boolean) : [];

        if (periodo === 'dia') {
            const horas = ['00h', '04h', '08h', '12h', '16h', '20h'];
            const hojeStr = fmtDate(agora);
            const transHoje = safe.filter(t => t.data === hojeStr);
            const totalRec = transHoje.filter(t => t.tipo?.toLowerCase() === 'receita').reduce((a, t) => a + (Number(t.valor) || 0), 0);
            const totalDesp = transHoje.filter(t => t.tipo?.toLowerCase() === 'despesa').reduce((a, t) => a + Math.abs(Number(t.valor) || 0), 0);
            const totalCount = transHoje.length;

            horas.forEach((h, idx) => {
                const isAtual = agora.getHours() >= idx * 4 && agora.getHours() < (idx + 1) * 4;
                labels.push(h + (isAtual ? '*' : ''));
                receitas.push(idx === 0 ? totalRec : 0);
                despesas.push(idx === 0 ? totalDesp : 0);
                transacoesCont.push(idx === 0 ? totalCount : 0);
            });

        } else if (periodo === 'semana') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(anoAtual, mesAtual, diaAtual - i);
                const dStr = fmtDate(d);
                const isHoje = i === 0;
                labels.push(`${d.getDate()} de ${NOMES_MESES_CURTO[d.getMonth()]}` + (isHoje ? '*' : ''));

                const dayTrans = safe.filter(t => t.data === dStr);
                receitas.push(dayTrans.filter(t => t.tipo?.toLowerCase() === 'receita').reduce((a, t) => a + (Number(t.valor) || 0), 0));
                despesas.push(dayTrans.filter(t => t.tipo?.toLowerCase() === 'despesa').reduce((a, t) => a + Math.abs(Number(t.valor) || 0), 0));
                transacoesCont.push(dayTrans.length);
            }

        } else if (periodo === 'mes') {
            const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
            const totalDiasMes = ultimoDia.getDate();

            for (let d = 1; d <= totalDiasMes; d++) {
                const isHoje = d === diaAtual;
                labels.push(`${d} de ${NOMES_MESES_CURTO[mesAtual]}` + (isHoje ? '*' : ''));

                const dStr = fmtDate(new Date(anoAtual, mesAtual, d));
                const dayTrans = safe.filter(t => t.data === dStr);
                receitas.push(dayTrans.filter(t => t.tipo?.toLowerCase() === 'receita').reduce((a, t) => a + (Number(t.valor) || 0), 0));
                despesas.push(dayTrans.filter(t => t.tipo?.toLowerCase() === 'despesa').reduce((a, t) => a + Math.abs(Number(t.valor) || 0), 0));
                transacoesCont.push(dayTrans.length);
            }

        } else if (periodo === 'ano') {
            for (let m = 0; m < 12; m++) {
                const isAtual = m === mesAtual;
                labels.push(NOMES_MESES[m] + (isAtual ? '*' : ''));

                const monthTrans = safe.filter(t => {
                    const tData = new Date(t.data);
                    return tData.getMonth() === m && tData.getFullYear() === anoAtual;
                });
                receitas.push(monthTrans.filter(t => t.tipo?.toLowerCase() === 'receita').reduce((a, t) => a + (Number(t.valor) || 0), 0));
                despesas.push(monthTrans.filter(t => t.tipo?.toLowerCase() === 'despesa').reduce((a, t) => a + Math.abs(Number(t.valor) || 0), 0));
                transacoesCont.push(monthTrans.length);
            }
        }

        return { chartLabels: labels, receitaValues: receitas, despesaValues: despesas, transacaoValues: transacoesCont };
    }, [transacoes, periodo]);

    const padding = { top: 20, right: 20, bottom: 40, left: 55 };
    const svgW = 700;
    const svgH = 280;
    const chartW = svgW - padding.left - padding.right;
    const chartH = svgH - padding.top - padding.bottom;

    const allMax = Math.max(...receitaValues, ...despesaValues, 100);
    const yTicks = getNiceTicks(allMax);
    const yMax = yTicks[yTicks.length - 1] || 1000;
    const numPontos = chartLabels.length;

    const makePoints = (values) => values.map((val, i) => ({
        x: padding.left + (numPontos > 1 ? i * (chartW / (numPontos - 1)) : chartW / 2),
        y: padding.top + chartH - (val / yMax) * chartH,
    }));

    const makePath = (points) => points.reduce((acc, p, i) =>
        i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, ""
    );

    const receitaPontos = makePoints(receitaValues);
    const despesaPontos = makePoints(despesaValues);
    const transacaoPontos = makePoints(transacaoValues.map(v => (v / Math.max(...transacaoValues, 1)) * yMax));

    const receitaPath = makePath(receitaPontos);
    const despesaPath = makePath(despesaPontos);
    const transacaoPath = makePath(transacaoPontos);

    const receitaArea = receitaPontos.length > 0
        ? `${receitaPath} L ${receitaPontos[receitaPontos.length - 1].x},${padding.top + chartH} L ${padding.left},${padding.top + chartH} Z`
        : '';

    const totalReceita = receitaValues.reduce((a, b) => a + b, 0);
    const totalDespesa = despesaValues.reduce((a, b) => a + b, 0);
    const totalTransacoes = transacaoValues.reduce((a, b) => a + b, 0);

    const labelStep = numPontos > 15 ? Math.ceil(numPontos / 15) : numPontos > 8 ? 2 : 1;

    const distribuicao = useMemo(() => {
        const safe = Array.isArray(transacoes) ? transacoes.filter(Boolean) : [];
        const totalReceita = safe
            .filter(t => t.tipo?.toLowerCase() === 'receita')
            .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

        if (totalReceita === 0) {
            return [{ label: 'Sem dados', perc: 0, cor: 'bg-slate-200' }];
        }

        const agrupado = safe
            .filter(t => t.tipo?.toLowerCase() === 'receita')
            .reduce((acc, t) => {
                const subcat = t.subcategoria || 'outras_receitas';
                acc[subcat] = (acc[subcat] || 0) + (Number(t.valor) || 0);
                return acc;
            }, {});

        const cores = ['bg-primary', 'bg-emerald-400', 'bg-violet-500', 'bg-amber-400', 'bg-pink-500'];
        const labelsMap = {
            'sessao': 'Psicoterapia Individual',
            'avaliacao': 'Avaliação Psicológica',
            'consultoria': 'Consultoria',
            'curso': 'Curso / Workshop',
            'outras_receitas': 'Outras Receitas'
        };

        return Object.entries(agrupado)
            .map(([key, val], i) => ({
                label: labelsMap[key] || key,
                perc: Math.round((val / totalReceita) * 100),
                cor: cores[i % cores.length]
            }))
            .sort((a, b) => b.perc - a.perc);
    }, [transacoes]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Fluxo de Caixa */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Performance</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Fluxo de Caixa</h3>
                            <p className="text-[11px] text-slate-400 font-medium uppercase mt-1">{periodoAtual.desc}</p>
                        </div>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="h-11 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs font-bold text-slate-600 dark:text-slate-300"
                            >
                                <span className="material-symbols-outlined text-primary text-lg">{periodoAtual.icon}</span>
                                <span className="uppercase tracking-widest">{periodoAtual.label}</span>
                                <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-20 py-1">
                                    {PERIODOS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { setPeriodo(p.id); setIsDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${periodo === p.id ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 mb-8 px-1">
                        <div className="flex items-center gap-2">
                            <div className="size-2.5 rounded-full bg-green-500"></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Entradas</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{totalReceita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-2.5 rounded-full bg-red-500"></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Saídas</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{totalDespesa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-2.5 rounded-full bg-blue-500"></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Transações</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{totalTransacoes}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full overflow-x-auto custom-scrollbar">
                        <svg
                            viewBox={`0 0 ${svgW} ${svgH}`}
                            className="w-full overflow-visible"
                            style={{ minWidth: numPontos > 15 ? `${numPontos * 28}px` : '100%' }}
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <defs>
                                <linearGradient id="gradientReceita" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08" />
                                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {yTicks.map((tick, i) => {
                                const y = padding.top + chartH - (tick / yMax) * chartH;
                                return (
                                    <g key={`ytick-${i}`}>
                                        <line
                                            x1={padding.left}
                                            y1={y}
                                            x2={svgW - padding.right}
                                            y2={y}
                                            stroke="currentColor"
                                            className="text-slate-100 dark:text-slate-800"
                                            strokeWidth="1"
                                            strokeDasharray={i === 0 ? '0' : '4,4'}
                                        />
                                        <text
                                            x={padding.left - 8}
                                            y={y + 4}
                                            textAnchor="end"
                                            className="fill-slate-400"
                                            fontSize="11"
                                            fontWeight="600"
                                        >
                                            {tick >= 1000 ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k` : tick}
                                        </text>
                                    </g>
                                );
                            })}

                            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" />
                            <line x1={padding.left} y1={padding.top + chartH} x2={svgW - padding.right} y2={padding.top + chartH} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" />
                            <path d={receitaArea} fill="url(#gradientReceita)" />
                            <path d={receitaPath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d={despesaPath} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d={transacaoPath} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6,3" />

                            {receitaPontos.map((p, i) => (
                                <circle key={`rec-${i}`} cx={p.x} cy={p.y} r={numPontos <= 12 ? '4' : '3'} fill="#22c55e" stroke="white" strokeWidth="2" className="cursor-pointer">
                                    <title>{chartLabels[i].replace('*', '')}: {receitaValues[i].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</title>
                                </circle>
                            ))}

                            {despesaPontos.map((p, i) => despesaValues[i] > 0 && (
                                <circle key={`desp-${i}`} cx={p.x} cy={p.y} r={numPontos <= 12 ? '4' : '3'} fill="#ef4444" stroke="white" strokeWidth="2" className="cursor-pointer">
                                    <title>{chartLabels[i].replace('*', '')}: {despesaValues[i].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</title>
                                </circle>
                            ))}

                            {chartLabels.map((label, idx) => {
                                if (idx % labelStep !== 0 && idx !== numPontos - 1) return null;
                                const x = padding.left + (numPontos > 1 ? idx * (chartW / (numPontos - 1)) : chartW / 2);
                                return (
                                    <text key={`xlabel-${idx}`} x={x} y={svgH - 5} textAnchor="middle" fontSize={numPontos > 15 ? '9' : '10'} fontWeight="700" className={label.includes('*') ? 'fill-primary' : 'fill-slate-400'}>
                                        {label.replace('*', '')}
                                    </text>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* Distribuição de Serviços */}
                <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <span className="material-symbols-outlined text-sm">pie_chart</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Composição</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight mb-8">Receita por Serviço</h3>

                    <div className="flex-1 space-y-6 overflow-y-auto max-h-[300px] pr-2 no-scrollbar">
                        {distribuicao.map((item, i) => (
                            <div key={item.label}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.perc}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.cor} rounded-full transition-all`} style={{ width: `${item.perc}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-start gap-4">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-xl">insights</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            {distribuicao[0]?.perc > 50 ? (
                                <>Domínio de receita via <span className="text-primary font-bold">{distribuicao[0].label}</span> identificado este mês.</>
                            ) : (
                                <>Equilíbrio saudável entre serviços, com destaque para <span className="text-primary font-bold">{distribuicao[0]?.label || 'novos atendimentos'}</span>.</>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraficosFinanceiros;


