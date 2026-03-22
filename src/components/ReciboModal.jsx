import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { usePatients } from '../contexts/PatientContext';

const ReciboModal = ({ isOpen, onClose, transacao }) => {
    if (!isOpen || !transacao) return null;

    const { user } = useUser();
    const { patients } = usePatients();

    // Extrair dados do paciente se a descrição estiver no formato "Sessão — Nome"
    const partesDesc = transacao.desc ? transacao.desc.split(' — ') : [];
    const nomePaciente = partesDesc[1] || partesDesc[0] || 'Paciente';

    const pacienteEncontrado = patients?.find(p => p.name?.toLowerCase() === nomePaciente.toLowerCase() || p.nome?.toLowerCase() === nomePaciente.toLowerCase());

    const [referente, setReferente] = useState('');

    const formatarMoeda = (valor) => {
        return Math.abs(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return '—';
        const parts = dataStr.split('-');
        if (parts.length !== 3) return dataStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const handleImprimir = () => {
        window.print();
    };

    const handleCompartilharWhatsApp = () => {
        const texto = `Olá! Segue o seu recibo de pagamento emitido por ${user.nome}.\n\n` +
                      `💵 Valor: ${formatarMoeda(transacao.valor)}\n` +
                      `📖 Referente a: ${referente || 'Honorários de Atendimento'}\n` +
                      `📅 Emitido em: ${new Date().toLocaleDateString('pt-BR')}`;
        
        let fone = pacienteEncontrado?.phone || '';
        fone = fone.replace(/\D/g, '');
        if (fone.length === 11 || fone.length === 10) {
            fone = `55${fone}`;
        }

        const url = fone 
            ? `https://wa.me/${fone}?text=${encodeURIComponent(texto)}` 
            : `https://wa.me/?text=${encodeURIComponent(texto)}`;
            
        window.open(url, '_blank');
    };



    useEffect(() => {
        if (transacao) {
            setReferente(transacao.subcategoria || transacao.desc || 'Honorários de Atendimento Psicológico');
        }
    }, [transacao, isOpen]);

    return (
        <>
            <style>{`
                @media print {
                    @page { size: A4; margin: 20mm; }
                    body {
                        visibility: hidden !important;
                        background: white !important;
                    }
                    #recibo-corpo-print, #recibo-corpo-print * {
                        visibility: visible !important;
                    }
                    #recibo-corpo-print {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 0px !important;
                        border: none !important;
                        box-shadow: none !important;
                        color: black !important;
                    }
                    .print-hidden-element {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div id="recibo-corpo-print" className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-settle">
                    
                    {/* Header (Escondido na impressao) */}
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 print-hidden-element">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500">receipt_long</span>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">Recibo de Pagamento</h3>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-full">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Corpo do Recibo */}
                    <div className="p-8 space-y-8 flex flex-col items-stretch print:p-0 print:text-black">
                        
                        {/* Cabeçalho da Clínica/Profissional */}
                        <div className="text-center space-y-1">
                            {user.clinic_name && (
                                <p className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{user.clinic_name}</p>
                            )}
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.nome}</p>
                            <p className="text-xs text-slate-400">{user.especialidade || 'Psicólogo(a)'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {user.clinic_cnpj && `CPF/CNPJ: ${user.clinic_cnpj}`} 
                                {user.crp && ` · CRP: ${user.crp}`}
                            </p>
                        </div>

                        {/* Divisor Visual */}
                        <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-700 my-4" />

                        {/* Valor em Destaque */}
                        <div className="flex justify-end">
                            <div className="border-2 border-emerald-500 rounded-xl px-6 py-2 bg-emerald-50/50 dark:bg-emerald-950/20 font-black text-xl text-emerald-600">
                                {formatarMoeda(transacao.valor)}
                            </div>
                        </div>
                        {/* Texto Principal do Recibo */}
                        <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-4">
                            <p>
                                Recebi(emos) de <span className="font-bold text-slate-900 dark:text-white uppercase">{nomePaciente}</span>, 
                                a quantia supra de <span className="font-bold text-slate-900 dark:text-white">{formatarMoeda(transacao.valor)}</span>, 
                                referente a <input 
                                    type="text" 
                                    value={referente} 
                                    onChange={(e) => setReferente(e.target.value)} 
                                    className="font-bold underline text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 outline-none focus:border-emerald-500 transition-all cursor-text print:p-0 print:border-none print:bg-transparent print:text-black print:no-underline w-auto min-w-[200px] inline-block mx-1" 
                                    title="Clique para editar"
                                />.
                            </p>
                            <p>
                                Para clareza e firmeza do recebimento, firmo(amos) o presente recibo.
                            </p>
                        </div>
                        {/* Espaço para Assinatura */}
                        <div className="mt-16 text-center space-y-1 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="mx-auto w-64 h-12 border-b border-slate-400 mb-2" />
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Assinatura do Profissional</p>
                            <p className="text-[10px] text-slate-400">Emitido em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>

                    {/* Footer (Escondido na impressao) */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3 justify-end border-t border-slate-100 dark:border-slate-800 print-hidden-element">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                            Fechar
                        </button>
                        <button
                            onClick={handleCompartilharWhatsApp}
                            className="px-6 py-2 bg-green-500 text-white text-xs font-bold rounded-xl shadow-md shadow-green-500/25 hover:bg-green-600 transition-all flex items-center gap-2 uppercase tracking-widest"
                        >
                            <span className="material-symbols-outlined text-sm">send</span>
                            WhatsApp
                        </button>
                        <button
                            onClick={handleImprimir}
                            className="px-6 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/25 hover:bg-emerald-600 transition-all flex items-center gap-2 uppercase tracking-widest"
                        >
                            <span className="material-symbols-outlined text-sm">print</span>
                            Imprimir Recibo
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReciboModal;
