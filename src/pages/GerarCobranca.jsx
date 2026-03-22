import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';
import { supabase } from '../lib/supabase';


const GerarCobranca = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { transactions, updateTransaction } = useFinance();
    const { user } = useUser();

    const [pacienteEmail, setPacienteEmail] = useState('');

    const ids = id ? id.split(',') : [];
    const transacoesSel = transactions.filter(t => ids.includes(t.id));

    const [desc, setDesc] = useState('');
    const [valor, setValor] = useState('');
    const [vencimento, setVencimento] = useState('');
    const [copiado, setCopiado] = useState(false);
    const [enviandoEmail, setEnviandoEmail] = useState(false);
    const [marcandoPago, setMarcandoPago] = useState(false);


    // Dados do profissional
    const chavePix = user?.configuracoes?.chavePix || '';
    const tipoChavePix = user?.configuracoes?.tipoChavePix || 'cpf';
    const nomeProfissional = user?.clinic_name || user?.nome || '';
    const cnpjCpf = user?.clinic_cnpj || '';
    const emailProf = user?.email || '';
    const telefoneProf = user?.telefone || '';

    const paramsObj = new URLSearchParams();
    if (desc) paramsObj.set('desc', desc);
    if (valor) paramsObj.set('valor', valor);
    if (vencimento) paramsObj.set('venc', vencimento);
    const qs = paramsObj.toString();

    const linkPublico = `${window.location.origin}/cobranca/${id}${qs ? '?' + qs : ''}`;

    useEffect(() => {
        const carregarPaciente = async (patId) => {
            try {
                const { data, error } = await supabase
                    .from('patients')
                    .select('email')
                    .eq('id', patId)
                    .single();
                if (data?.email) setPacienteEmail(data.email);
            } catch (e) {
                console.error('[GerarCobranca] Erro ao carregar paciente:', e);
            }
        };

        if (transacoesSel.length > 0) {
            const prim = transacoesSel[0];
            const nomePaciente = prim.pacienteNome || prim.patient_name || 'Paciente';

            // Calcular descrição agrupada (mesma lógica)
            const refs = transacoesSel.map(t => {
                const match = t.desc?.match(/\(Ref\. (.*?)\)/);
                if (match && match[1]) return match[1];
                const dv = t.dataVencimento || t.due_date;
                if (dv && typeof dv === 'string') {
                    const p = dv.split('-');
                    if (p.length === 3) return `${p[2]}/${p[1]}`;
                }
                return '';
            }).filter(Boolean);
            const uniqueRefs = [...new Set(refs)].join(', ');

            const valueTotal = transacoesSel.reduce((sum, t) => sum + (t.valor || 0), 0);
            
            const defaultDesc = ids.length === 1 
                ? (prim.desc || 'Sessão/Consulta') 
                : `Sessões — ${nomePaciente} (Ref. ${uniqueRefs || 'Período'})`;

            setDesc(defaultDesc);
            setValor(valueTotal.toFixed(2));

            const dates = transacoesSel.map(t => t.dataVencimento || t.due_date).filter(Boolean);
            const maxDate = dates.length > 0 ? dates.sort().reverse()[0] : new Date().toISOString().split('T')[0];
            setVencimento(maxDate);

            const pId = prim.patient_id || prim.pacienteId;
            if (pId) carregarPaciente(pId);
        }
    }, [transacoesSel.length, transactions.length, id]);

    const handleUpdateLinkSent = () => {
        ids.forEach(childId => {
            const t = transacoesSel.find(x => x.id === childId);
            if (t && !t.link_sent) {
                updateTransaction(childId, { link_sent: true }).catch(console.error);
            }
        });
    };

    const handleCopiarLink = () => {
        navigator.clipboard.writeText(linkPublico).then(() => {
            setCopiado(true);
            showToast('Link copiado!', 'success');
            handleUpdateLinkSent();
            setTimeout(() => setCopiado(false), 2500);
        });
    };

    const handleWhatsApp = () => {
        const prim = transacoesSel[0] || {};
        const paciente = prim.pacienteNome || prim.patient_name || 'cliente';
        const valorFmt = Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const vencFmt = vencimento ? vencimento.split('-').reverse().join('/') : '';
        const profNome = nomeProfissional || user?.nome || '';

        const msg = encodeURIComponent(
            `Olá, ${paciente}!\n` +
            `${profNome} gerou uma cobrança para você no valor de *${valorFmt}*` +
            (vencFmt ? `, com vencimento em *${vencFmt}*` : '') + `.\n\n` +
            `Para efetuar o pagamento e visualizar mais informações da cobrança, acesse o link: ${linkPublico}\n\n` +
            `Se você não reconhece essa cobrança, ou tem alguma dúvida sobre o pagamento, entre em contato diretamente com o profissional.` +
            (telefoneProf ? `\nTelefone: ${telefoneProf}` : '') +
            (emailProf ? `\nE-mail: ${emailProf}` : '') + `\n\n` +
            `Caso você já tenha efetuado o pagamento nas últimas 48 horas, favor desconsiderar esta mensagem.`
        );
        handleUpdateLinkSent();
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    };

    const handleEmail = async () => {
        if (!pacienteEmail) {
            showToast('Paciente não possui e-mail cadastrado.', 'info');
            return;
        }

        setEnviandoEmail(true);
        const prim = transacoesSel[0] || {};
        const paciente = prim.pacienteNome || prim.patient_name || 'cliente';
        const valorFmt = Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const vencFmt = vencimento ? vencimento.split('-').reverse().join('/') : '';
        const profNome = nomeProfissional || user?.nome || 'Profissional';

        const subject = `Cobrança de ${profNome}`;
        
        // Template HTML premium para o e-mail
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
                <h2 style="color: #0d9488;">Olá, ${paciente}!</h2>
                <p>${profNome} gerou uma cobrança para você no valor de <strong>${valorFmt}</strong>${vencFmt ? `, com vencimento em ${vencFmt}` : ''}.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px;"><strong>Descrição:</strong> ${desc || 'Sessão/Consulta'}</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Valor:</strong> ${valorFmt}</p>
                    ${vencFmt ? `<p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Vencimento:</strong> ${vencFmt}</p>` : ''}
                </div>
                <p>Para visualizar as informações da cobrança e efetuar o pagamento via Pix, clique no botão abaixo:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${linkPublico}" style="background-color: #0d9488; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Visualizar Cobrança</a>
                </p>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 10px;">
                    Se você não reconhece essa cobrança, ou tem dúvidas, entre em contato diretamente com o profissional ${profNome}.
                    <br/>Caso já tenha pago, favor desconsiderar.
                </p>
            </div>
        `;

        try {
            const { data, error } = await supabase.functions.invoke('send-invoice-email', {
                body: {
                    to: pacienteEmail,
                    subject: subject,
                    replyTo: emailProf,
                    fromName: profNome,
                    html: html
                }
            });

            if (error) throw error;

            if (data?.success === false) {
                const resendErr = data.error;
                const msg = resendErr?.message || resendErr?.error?.message || JSON.stringify(resendErr);
                showToast(`Erro Resend: ${msg}`, 'error');
                return;
            }

            showToast('E-mail enviado com sucesso!', 'success');
            handleUpdateLinkSent();
        } catch (e) {
            console.error('[GerarCobranca] Erro ao enviar e-mail:', e);
            showToast(`Erro no E-mail: ${e.message}`, 'error');
        } finally {
            setEnviandoEmail(false);
        }

    };


    const handleMarcarPago = async () => {
        setMarcandoPago(true);
        try {
            await Promise.all(ids.map(childId => 
                updateTransaction(childId, { status: 'Pago' })
            ));
            showToast('Recebimento confirmado!', 'success');
        } catch (e) {
            showToast('Erro ao atualizar status.', 'error');
        } finally {
            setMarcandoPago(false);
        }
    };

    if (transacoesSel.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-slate-500">
                <span className="material-symbols-outlined text-5xl opacity-40">receipt_long</span>
                <p className="font-bold text-lg">Lançamento não encontrado.</p>
                <button onClick={() => navigate('/financeiro')} className="text-primary font-bold text-sm underline">Voltar ao Financeiro</button>
            </div>
        );
    }

    const prim = transacoesSel[0] || {};
    const pacienteNome = prim.pacienteNome || prim.patient_name || 'Paciente';
    const isPendente = transacoesSel.some(t => t.status === 'Pendente');
    const semPix = !chavePix;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/financeiro')} className="size-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <div className="flex items-center gap-2 text-primary mb-0.5">
                        <span className="material-symbols-outlined text-sm">qr_code</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Financeiro</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-black tracking-tight">Gerar Link de Cobrança</h1>
                </div>
            </div>

            {/* Alerta: sem chave Pix */}
            {semPix && (
                <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <span className="material-symbols-outlined text-amber-500 text-xl shrink-0">warning</span>
                    <div>
                        <p className="text-sm font-black text-amber-700 dark:text-amber-400">Chave Pix não configurada</p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                            O link será gerado, mas o paciente não verá o QR Code.{' '}
                            <button onClick={() => navigate('/configuracoes')} className="underline font-bold">Configure sua chave Pix em Configurações.</button>
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna Esquerda: Editar Dados */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-primary">edit_note</span>
                                Dados da Cobrança
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Ajuste antes de enviar o link.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descrição</label>
                                <input
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-bold text-slate-800 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Valor (R$)</label>
                                    <input
                                        type="number"
                                        value={valor}
                                        onChange={e => setValor(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-bold text-slate-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vencimento</label>
                                    <input
                                        type="date"
                                        value={vencimento}
                                        onChange={e => setVencimento(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-bold text-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                            {pacienteNome && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Paciente</label>
                                    <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-slate-400 text-base">person</span>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{pacienteNome}</span>
                                    </div>
                                </div>
                            )}
                            {chavePix && (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800">
                                    <span className="material-symbols-outlined text-teal-500 text-base">qr_code</span>
                                    <div>
                                        <p className="text-xs font-black text-teal-700 dark:text-teal-400">Chave Pix configurada</p>
                                        <p className="text-[10px] text-teal-600 dark:text-teal-500 font-mono">{chavePix}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Link Público */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-3">
                        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-lg text-teal-500">link</span>
                            Link Público da Cobrança
                        </h2>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                            <span className="text-xs text-slate-500 font-mono truncate flex-1">{linkPublico}</span>
                            <button
                                onClick={handleCopiarLink}
                                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copiado ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-sm">{copiado ? 'check' : 'content_copy'}</span>
                                {copiado ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Envio */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-emerald-500">send</span>
                                Enviar Cobrança
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Escolha como enviar o link ao paciente.</p>
                        </div>
                        <div className="p-6 space-y-3">
                            <button
                                onClick={handleWhatsApp}
                                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all group"
                            >
                                <div className="size-12 rounded-xl bg-emerald-500/10 group-hover:bg-white/20 flex items-center justify-center transition-all">
                                    <span className="material-symbols-outlined text-emerald-500 group-hover:text-white text-2xl">chat</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm">Enviar via WhatsApp</p>
                                    <p className="text-xs opacity-70">Mensagem com link gerada automaticamente</p>
                                </div>
                                <span className="material-symbols-outlined text-lg ml-auto opacity-50 group-hover:opacity-100">arrow_forward</span>
                            </button>

                            <button
                                onClick={handleEmail}
                                disabled={enviandoEmail}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all group ${enviandoEmail ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 cursor-wait' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500'}`}
                            >
                                <div className={`size-12 rounded-xl flex items-center justify-center transition-all ${enviandoEmail ? 'bg-slate-200 dark:bg-slate-800' : 'bg-blue-500/10 group-hover:bg-white/20'}`}>
                                    <span className={`material-symbols-outlined text-2xl ${enviandoEmail ? 'text-slate-400 animate-spin' : 'text-blue-500 group-hover:text-white'}`}>
                                        {enviandoEmail ? 'sync' : 'mail'}
                                    </span>
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm">{enviandoEmail ? 'Enviando...' : 'Enviar por E-mail'}</p>
                                    <p className="text-xs opacity-70">{enviandoEmail ? 'Disparando e-mail automático...' : 'E-mail automático via Resend'}</p>
                                </div>
                                {!enviandoEmail && <span className="material-symbols-outlined text-lg ml-auto opacity-50 group-hover:opacity-100">arrow_forward</span>}
                            </button>

                            <button
                                onClick={handleCopiarLink}

                                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all group"
                            >
                                <div className="size-12 rounded-xl bg-slate-500/10 group-hover:bg-white/20 flex items-center justify-center transition-all">
                                    <span className="material-symbols-outlined text-slate-500 group-hover:text-white text-2xl">content_copy</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm">Copiar Link</p>
                                    <p className="text-xs opacity-70">Cole onde preferir (chat, SMS, etc.)</p>
                                </div>
                                <span className="material-symbols-outlined text-lg ml-auto opacity-50 group-hover:opacity-100">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Botão Marcar como Pago */}
                    {isPendente && (
                        <button
                            onClick={handleMarcarPago}
                            disabled={marcandoPago}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 ${marcandoPago ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            <span className={`material-symbols-outlined text-xl ${marcandoPago ? 'animate-spin' : ''}`}>
                                {marcandoPago ? 'sync' : 'check_circle'}
                            </span>
                            {marcandoPago ? 'Confirmando...' : 'Confirmar Recebimento (Pago)'}
                        </button>
                    )}
                    {!isPendente && (
                        <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black cursor-not-allowed border border-slate-200">
                            <span className="material-symbols-outlined text-xl">check</span>
                            Esta fatura já está paga
                        </div>
                    )}

                    {/* Preview Card */}
                    <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl shadow-teal-500/30">
                        <div className="flex items-center gap-2 mb-4 opacity-80">
                            <span className="material-symbols-outlined text-sm">preview</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Preview da Fatura</span>
                        </div>
                        <div className="text-xl font-black tracking-tight mb-1">{desc || '—'}</div>
                        {pacienteNome && <div className="text-sm opacity-80 mb-3">Para: {pacienteNome}</div>}
                        <div className="text-3xl font-black tabular-nums mb-1">
                            {Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        {vencimento && (
                            <div className="text-xs opacity-70 font-bold">
                                Vencimento: {vencimento.split('-').reverse().join('/')}
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                            <div className="size-6 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xs">qr_code</span>
                            </div>
                            <span className="text-xs opacity-70 font-bold">
                                {chavePix ? `Pix: ${chavePix}` : 'Pix não configurado'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GerarCobranca;
