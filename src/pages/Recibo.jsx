import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import { useUser } from '../contexts/UserContext';
import { usePatients } from '../contexts/PatientContext';
import { valorPorExtenso } from '../utils/formatters';

import { showToast } from '../components/Toast';

import { logger } from '../utils/logger';
const Recibo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { transactions } = useFinance();
    const { user } = useUser();
    const { patients } = usePatients();
    const receiptRef = useRef();

    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState({
        paciente: '',
        cpf: '',
        valor: 0,
        valorExtenso: '',
        descricao: 'Sessão de Psicoterapia',
        data: new Date().toISOString().split('T')[0],
        numero: Math.floor(Math.random() * 9000 + 1000).toString()
    });

    const [buscaRapida, setBuscaRapida] = useState('');
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

    const pacientesFiltrados = patients.filter(p =>
        (p.nome || '').toLowerCase().includes(buscaRapida.toLowerCase()) ||
        (p.id || '').toLowerCase().includes(buscaRapida.toLowerCase())
    );

    useEffect(() => {
        if (id === 'novo') {
            if (location.state?.pacienteObjeto) {
                const p = location.state.pacienteObjeto;
                const valor = parseFloat(String(p.precoSessao || '0').replace('.', '').replace(',', '.')) || 0;
                setDados(prev => ({
                    ...prev,
                    pacienteId: p.id,
                    paciente: p.nome,
                    cpf: p.cpf || '',
                    valor: valor,
                    valorExtenso: `(${valorPorExtenso(valor)})`
                }));
            }
            setLoading(false);
            return;
        }

        const transacao = transactions.find(t => t.id === id || String(t.id) === id);
        if (transacao) {
            const p = patients.find(p => transacao.desc.includes(p.nome));
            const valorAbs = Math.abs(transacao.valor);

            setDados({
                pacienteId: p?.id || '',
                paciente: p?.nome || transacao.desc.split('—')[1]?.trim() || '___________________________',
                cpf: p?.cpf || '___.___.___---',
                valor: valorAbs,
                valorExtenso: `(${valorPorExtenso(valorAbs)})`,
                descricao: transacao.desc.split('—')[0]?.trim() || 'Sessão de Psicoterapia',
                data: transacao.data,
                numero: String(transacao.id).slice(-4).toUpperCase()
            });
        }
        setLoading(false);
    }, [id, transactions, location.state, patients]);

    // Sincronização Automática com o Cadastro do Paciente
    useEffect(() => {
        if (!dados.pacienteId || !patients.length) return;

        const normalize = (id) => id?.toString().replace('#', '');
        const p = patients.find(p => normalize(p.id) === normalize(dados.pacienteId));

        if (p) {
            const cpfVazio = !dados.cpf || dados.cpf === '___.___.___-__';
            
            if (cpfVazio && p.cpf) {
                setDados(prev => ({
                    ...prev,
                    cpf: p.cpf,
                    paciente: p.nome,
                }));
            }
        }
    }, [patients, dados.pacienteId]);

    // Atualiza extenso se o valor mudar manualmente (caso o usuário edite o input de valor futuro)
    const handleTrocarPaciente = (p) => {
        setDados(prev => ({
            ...prev,
            paciente: p.nome,
            cpf: p.cpf || '___.___.___-__'
        }));
        setBuscaRapida('');
        setMostrarSugestoes(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleWhatsApp = () => {
        const texto = `Olá ${dados.paciente}, segue o seu recibo referente à ${dados.descricao} no valor de R$ ${dados.valor.toFixed(2)}.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    const handleExportPDF = async () => {
        if (!receiptRef.current) return;
        try {
            const { exportToPDF } = await import('../utils/exportUtils');
            const filename = `recibo_${dados.paciente.replace(/\s+/g, '_').toLowerCase()}_${dados.numero}.pdf`;
            await exportToPDF(receiptRef.current, filename);
            showToast('PDF gerado com sucesso!', 'success');
        } catch (error) {
            logger.error('Erro na exportação PDF:', error);
            showToast(`Erro técnico: ${error.message}. Use a opção "Imprimir" → "Salvar como PDF".`, 'warning');
        }
    };

    const handleExportWord = async () => {
        try {
            const { exportToWord } = await import('../utils/exportUtils');
            const dataForWord = {
                titulo: 'Recibo de Pagamento',
                subtitulo: `Recibo nº ${new Date().getFullYear()}-${dados.numero}`,
                paciente: {
                    nome: dados.paciente,
                    cpf: dados.cpf,
                    nascimento: '—' // Recibos geralmente não exigem nascimento, mas o layout espera o campo
                },
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                secoes: [
                    { 
                        titulo: 'Detalhamento', 
                        conteudo: `Recebi de ${dados.paciente}, inscrito no CPF sob o nº ${dados.cpf}, a importância de R$ ${dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${dados.valorExtenso}, referente a ${dados.descricao}, realizada no dia ${new Date(dados.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.`
                    },
                    {
                        titulo: 'Quitação',
                        conteudo: 'Pelo que firmo o presente recibo dando plena e total quitação.'
                    }
                ],
                profissional: {
                    nome: user.nome,
                    crp: user.crp,
                    especialidade: user.especialidade
                }
            };
            
            const filename = `recibo_${dados.paciente.replace(/\s+/g, '_').toLowerCase()}_${dados.numero}.docx`;
            await exportToWord(dataForWord, filename);
            showToast('Word gerado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao gerar Word.', 'error');
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-500">Carregando recibo...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-20">
            {/* Header de Ações (Oculto na Impressão) */}
            <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors mb-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Gerar Recibo</h1>
                    <p className="text-sm text-slate-500">Visualize e emita o recibo oficial para o atendimento realizado.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visualização do Recibo (Papel A4) */}
                <div className="lg:col-span-2">
                    <div
                        ref={receiptRef}
                        className="bg-white text-slate-900 p-12 md:p-20 shadow-2xl rounded-sm min-h-[842px] documento-recibo relative flex flex-col print:shadow-none print:p-10"
                    >
                        {/* Marca d'água ou Logo superior */}
                        <div className="flex justify-between items-start mb-16">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-2xl">psychology</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-xl leading-tight uppercase tracking-tight">Meu Sistema Psi</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Gestão Clínica Inteligente</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Recibo nº {new Date().getFullYear()}-{dados.numero}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Via do Paciente</p>
                            </div>
                        </div>

                        {/* Dados da Clínica */}
                        <div className="text-[11px] text-slate-500 space-y-0.5 mb-16 border-l-2 border-primary/20 pl-4">
                            <p>Rua Dr. Exemplo, 123 - Sala 45, Jardim América</p>
                            <p>São José dos Pinhais, PR | CEP: 83000-000</p>
                            <p>CNPJ: 00.000.000/0001-00</p>
                        </div>

                        <div className="flex-1 flex flex-col items-center">
                            <h3 className="text-3xl font-black tracking-[0.2em] uppercase mb-20 border-b-4 border-slate-900 pb-2 px-8">Recibo</h3>

                            <div className="w-full text-lg leading-loose text-justify space-y-8">
                                <p>
                                    Recebi de <input
                                        type="text"
                                        value={dados.paciente}
                                        onChange={(e) => setDados({ ...dados, paciente: e.target.value })}
                                        className="font-black border-b border-dotted border-slate-300 focus:border-primary outline-none px-1 uppercase print:border-none"
                                        style={{ width: `${dados.paciente.length + 2}ch` }}
                                    />,
                                    inscrito no CPF sob o nº <input
                                        type="text"
                                        value={dados.cpf}
                                        onChange={(e) => setDados({ ...dados, cpf: e.target.value })}
                                        className="font-black border-b border-dotted border-slate-300 focus:border-primary outline-none px-1 print:border-none"
                                        style={{ width: '18ch' }}
                                    />,
                                    a importância de <span className="font-black whitespace-nowrap">R$ {dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <input
                                        type="text"
                                        value={dados.valorExtenso}
                                        onChange={(e) => setDados({ ...dados, valorExtenso: e.target.value })}
                                        className="font-bold text-slate-600 border-b border-dotted border-slate-300 focus:border-primary outline-none px-1 text-base ml-2 print:border-none"
                                        style={{ width: `${dados.valorExtenso.length + 2}ch` }}
                                    />.
                                </p>

                                <p>
                                    Referente a <input
                                        type="text"
                                        value={dados.descricao}
                                        onChange={(e) => setDados({ ...dados, descricao: e.target.value })}
                                        className="font-black border-b border-dotted border-slate-300 focus:border-primary outline-none px-1 print:border-none"
                                        style={{ width: `${dados.descricao.length + 2}ch` }}
                                    />, realizada no dia <span className="font-black">{new Date(dados.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>.
                                </p>

                                <p>
                                    Pelo que firmo o presente recibo dando plena e total quitação.
                                </p>
                            </div>
                        </div>

                        {/* Rodapé / Assinatura */}
                        <div className="mt-20 flex flex-col items-center">
                            <p className="text-sm mb-16 self-end">
                                Paraná, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>

                            <div className="w-80 border-t border-slate-900 pt-4 text-center">
                                <p className="font-black text-lg uppercase">{user.nome}</p>
                                <p className="text-sm text-slate-500 font-bold">{user.especialidade} - CRP {user.crp}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Painel Lateral de Ações (Oculto na Impressão) */}
                <div className="space-y-6 print:hidden">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">bolt</span>
                            Ações Disponíveis
                        </h4>

                        <div className="space-y-3">
                            <button
                                onClick={handlePrint}
                                className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                <span className="material-symbols-outlined">print</span>
                                Imprimir Recibo
                            </button>

                            {/* <button
                                onClick={handleExportPDF}
                                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                            >
                                <span className="material-symbols-outlined">picture_as_pdf</span>
                                Salvar em PDF
                            </button> */}

                            <button
                                onClick={handleExportWord}
                                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                            >
                                <span className="material-symbols-outlined">description</span>
                                Exportar para Word
                            </button>

                            <button
                                onClick={handleWhatsApp}
                                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-200/50 hover:scale-[1.02] transition-all"
                            >
                                <span className="material-symbols-outlined">send</span>
                                Enviar por WhatsApp
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Resumo dos Dados</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Paciente</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{dados.paciente}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">CPF</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{dados.cpf}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Valor</p>
                                    <p className="text-sm font-black text-primary">R$ {dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Data de Atendimento</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                    {new Date(dados.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                <span className="text-[10px] font-black uppercase tracking-wider">Assinatura Digital Ativa</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Trocar Paciente</h4>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={buscaRapida}
                                onChange={(e) => { setBuscaRapida(e.target.value); setMostrarSugestoes(true); }}
                                onFocus={() => setMostrarSugestoes(true)}
                                className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            {mostrarSugestoes && buscaRapida && (
                                <div className="absolute z-10 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                    {pacientesFiltrados.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleTrocarPaciente(p)}
                                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left border-b border-slate-50 dark:border-slate-800 last:border-0"
                                        >
                                            <div className={`size-6 rounded-full flex items-center justify-center text-[8px] font-black ${p.cor}`}>
                                                {p.iniciais}
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{p.nome}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-[9px] text-slate-400 italic">Preenche nome e CPF automaticamente no documento.</p>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 1cm; size: A4 portrait; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    
                    /* Desativar o Grid para evitar problemas de largura no Chrome Print */
                    .grid { display: block !important; }
                    .gap-8 { gap: 0 !important; }
                    
                    /* Ocupar a folha inteira na impressão, margens vêm do @page */
                    .max-w-5xl { max-width: none !important; margin: 0 !important; width: 100% !important; display: block !important; }
                    .lg\\:grid-cols-3 { grid-template-columns: 1fr !important; }
                    .lg\\:col-span-2 { grid-column: span 1 / span 1 !important; }
                    
                    .documento-recibo { 
                        width: auto !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        min-height: 0 !important;
                    }

                    .print-section {
                        page-break-inside: avoid !important;
                    }
                    input { border: none !important; text-decoration: none !important; }
                    * { color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
                }
                .documento-recibo {
                    width: 100%;
                    max-width: 794px; /* A4 width */
                    margin: 0 auto;
                }
            `}} />
        </div>
    );
};

export default Recibo;



