import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { gerarCadeiaPix } from '../utils/pix';

// Gerador de QR Code via API pública (sem dependências)
const QRCodeImage = ({ text, size = 180 }) => {
    const encoded = encodeURIComponent(text);
    return (
        <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=1a1a2e&bgcolor=ffffff&margin=2`}
            alt="QR Code Pix"
            width={size}
            height={size}
            className="rounded-xl shadow-md"
        />
    );
};

const VisualizarCobranca = () => {
    const { id } = useParams();
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(false);
    const [copiado, setCopiado] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState('pix');

    useEffect(() => {
        document.title = "Visualizar Cobrança | Meu Sistema Psi";
        
        // Noindex for privacy
        let rob = document.querySelector('meta[name="robots"]');
        if (!rob) {
            rob = document.createElement('meta');
            rob.setAttribute('name', 'robots');
            document.head.appendChild(rob);
        }
        rob.setAttribute('content', 'noindex, nofollow');

        // Canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://meusistemapsi.com.br' + window.location.pathname);

        const carregar = async () => {
            setLoading(true);
            try {
                const ids = id ? id.split(',') : [];
                const { data: items, error: finError } = await supabase
                    .from('finance')
                    .select('*')
                    .in('id', ids);

                if (finError || !items || items.length === 0) {
                    setErro(true);
                    return;
                }

                const prim = items[0];
                const valueTotal = items.reduce((sum, t) => sum + (t.value || t.valor || 0), 0);

                const refs = items.map(t => {
                    const match = (t.description || t.desc || '').match(/\(Ref\. (.*?)\)/);
                    if (match && match[1]) return match[1];
                    const dv = t.due_date || t.dataVencimento;
                    const p = dv ? dv.split('-') : [];
                    return p.length === 3 ? `${p[2]}/${p[1]}` : '';
                }).filter(Boolean);
                const uniqueRefs = [...new Set(refs)].join(', ');

                const nomePaciente = prim.patient_name || prim.pacienteNome || 'Paciente';
                const descAgrupada = ids.length === 1 
                    ? (prim.description || prim.desc || 'Sessão/Consulta') 
                    : `Sessões — ${nomePaciente} (Ref. ${uniqueRefs || 'Período'})`;

                const dates = items.map(t => t.due_date || t.dataVencimento).filter(Boolean);
                const maxDate = dates.length > 0 ? dates.sort().reverse()[0] : null;

                // Busca dados do profissional
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('configurations, clinic_name, full_name, email, phone')
                    .eq('id', prim.user_id || prim.userId)
                    .single();

                const qParams = new URLSearchParams(window.location.search);
                const overrideVenc = qParams.get('venc');
                const overrideDesc = qParams.get('desc');
                const overrideVal = qParams.get('valor');

                setDados({
                    ...prim,
                    description: overrideDesc || descAgrupada,
                    value: overrideVal ? parseFloat(overrideVal) : valueTotal,
                    due_date: overrideVenc || maxDate,
                    status: items.some(t => t.status === 'Pendente') ? 'Pendente' : 'Pago',
                    pix_key: profile?.configurations?.chavePix || prim.pix_key,
                    pix_key_type: profile?.configurations?.tipoChavePix || prim.pix_key_type,
                    professional_name: profile?.clinic_name || profile?.full_name || prim.professional_name || 'Profissional',
                    professional_email: profile?.email || prim.professional_email || '',
                    professional_phone: profile?.phone || prim.professional_phone || '',
                    patient_name: nomePaciente
                });
            } catch (e) {
                console.error(e);
                setErro(true);
            } finally {
                setLoading(false);
            }
        };
        carregar();
    }, [id]);

    const formatarData = (dateStr) => {
        if (!dateStr) return '—';
        return dateStr.split('-').reverse().join('/');
    };

    const formatarValor = (val) =>
        Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const calcularVencimento = (dateStr) => {
        if (!dateStr) return null;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const venc = new Date(dateStr + 'T00:00:00');
        const diff = Math.round((venc - hoje) / (1000 * 60 * 60 * 24));
        if (diff === 0) return { label: 'Vence hoje', cor: 'text-amber-600' };
        if (diff > 0) return { label: `Vence em ${diff} dia${diff > 1 ? 's' : ''}`, cor: 'text-slate-500' };
        return { label: 'Vencida', cor: 'text-red-600' };
    };

    const handleCopiarPix = (chave) => {
        navigator.clipboard.writeText(chave).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2500);
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="flex flex-col items-center gap-4 text-slate-500">
                    <div className="size-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                    <p className="text-sm font-bold">Carregando cobrança...</p>
                </div>
            </div>
        );
    }

    if (erro || !dados) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-sm">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">receipt_long</span>
                    <h2 className="text-lg font-black text-slate-800 mb-2">Cobrança não encontrada</h2>
                    <p className="text-sm text-slate-500">O link pode ter expirado ou é inválido.</p>
                </div>
            </div>
        );
    }

    // Dados vêm direto da tabela finance (gravados ao gerar o link)
    const chavePix = dados.pix_key;
    const tipoChavePix = dados.pix_key_type;
    const nomeProfissional = dados.professional_name || 'Profissional';
    const cnpjCpf = dados.professional_cpf_cnpj || '';
    const emailProf = dados.professional_email || '';
    const telefoneProf = dados.professional_phone || '';
    const pacienteNome = dados.patient_name;
    const vencInfo = calcularVencimento(dados.due_date);

    const copiaCola = gerarCadeiaPix({
        chave: dados.pix_key,
        valor: dados.value,
        recebedor: dados.professional_name || 'Profissional',
        cidade: 'MARINGA', // Fallback estático para preenchimento obrigatório
        txid: 'MINDCARE'
    });

    const tipoLabel = {
        cpf: 'CPF',
        cnpj: 'CNPJ',
        telefone: 'Telefone',
        email: 'E-mail',
        aleatoria: 'Chave Aleatória',
    }[tipoChavePix] || 'Chave Pix';

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            {/* Cabeçalho do Profissional */}
            <header className="bg-blue-700 text-white">
                <div className="max-w-2xl mx-auto px-6 py-6">
                    <p className="text-xl font-black leading-tight">{nomeProfissional}</p>
                    {cnpjCpf && <p className="text-sm opacity-80 mt-0.5 font-medium">{cnpjCpf}</p>}
                    {emailProf && <p className="text-sm opacity-70 mt-0.5">{emailProf}</p>}
                    {telefoneProf && <p className="text-sm opacity-70">{telefoneProf}</p>}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-sm font-bold text-slate-600">Aguardando Pagamento</span>
                    </div>
                    {vencInfo && (
                        <span className={`text-xs font-bold ${vencInfo.cor}`}>{vencInfo.label}</span>
                    )}
                </div>

                {/* Card: Dados da Fatura */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-black text-slate-700">Dados da fatura</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor total</p>
                                <p className="text-2xl font-black text-blue-700">{formatarValor(dados.value)}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data de vencimento</p>
                                <p className="text-xl font-black text-blue-700">{formatarData(dados.due_date)}</p>
                                {vencInfo && (
                                    <p className={`text-[10px] font-bold mt-0.5 ${vencInfo.cor}`}>({vencInfo.label.toLowerCase()})</p>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Descrição</p>
                            <p className="text-sm font-bold text-slate-700">{dados.description || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Card: Dados do Comprador */}
                {pacienteNome && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-black text-slate-700">Dados do comprador</h2>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome</p>
                            <p className="font-black text-slate-800 text-base">{pacienteNome}</p>
                        </div>
                    </div>
                )}

                {/* Card: Pagamento */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-black text-slate-700">Selecione a forma de pagamento</h2>
                    </div>
                    {/* Abas */}
                    <div className="flex gap-3 px-6 pt-5">
                        <button
                            onClick={() => setAbaAtiva('pix')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black border-2 transition-all ${abaAtiva === 'pix' ? 'bg-blue-700 text-white border-blue-700 shadow-lg shadow-blue-700/20' : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}
                        >
                            <span className="material-symbols-outlined text-base">qr_code</span>
                            Pix
                        </button>
                        <button
                            onClick={() => setAbaAtiva('cartao')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black border-2 transition-all ${abaAtiva === 'cartao' ? 'bg-blue-700 text-white border-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}
                        >
                            <span className="material-symbols-outlined text-base">credit_card</span>
                            Cartão
                        </button>
                    </div>

                    <div className="p-6">
                        {abaAtiva === 'pix' ? (
                            chavePix ? (
                                <div className="space-y-5">
                                    <p className="text-sm text-slate-600 font-medium">Escaneie o QR Code ou copie a chave Pix abaixo:</p>

                                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                                        <div className="shrink-0 p-3 border border-slate-200 rounded-2xl bg-white shadow-sm">
                                            <QRCodeImage text={copiaCola} size={160} />
                                        </div>
                                        <div className="flex-1 space-y-4 w-full">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cópia e Cola (Valor automático)</p>
                                                <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
                                                    <span className="text-xs font-mono font-bold text-slate-700 break-all flex-1">{copiaCola}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCopiarPix(copiaCola)}
                                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black transition-all shadow-lg ${copiado ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-blue-700 text-white hover:bg-blue-800 shadow-blue-700/30'}`}
                                            >
                                                <span className="material-symbols-outlined text-base">
                                                    {copiado ? 'check_circle' : 'content_copy'}
                                                </span>
                                                {copiado ? 'Código Copiado! ✓' : 'Copiar Código Pix'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-start gap-2 border border-blue-100">
                                        <span className="material-symbols-outlined text-blue-500 text-base mt-0.5 shrink-0">info</span>
                                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                            Após realizar o pagamento, o profissional receberá uma confirmação. O pagamento pode levar alguns instantes para ser processado.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">qr_code</span>
                                    <p className="text-sm font-bold text-slate-500">Chave Pix não disponível.</p>
                                    <p className="text-xs text-slate-400 mt-1">Entre em contato com o profissional para combinar o pagamento.</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-10 space-y-3">
                                <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                                    <span className="material-symbols-outlined text-2xl text-slate-400">credit_card</span>
                                </div>
                                <p className="font-black text-slate-600 text-sm">Pagamento por Cartão</p>
                                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest">Em Breve</span>
                                <p className="text-xs text-slate-400">Esta modalidade estará disponível em breve.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rodapé */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-xs text-slate-500 leading-relaxed text-center">
                        Esta cobrança é de responsabilidade exclusiva de{' '}
                        <strong className="text-slate-700">{nomeProfissional}</strong>
                        {cnpjCpf ? ` · ${cnpjCpf}` : ''}.
                        Em caso de dúvidas, entre em contato diretamente com o profissional.
                    </p>
                </div>

                <div className="text-center py-2">
                    <p className="text-[10px] text-slate-400">
                        Cobrança intermediada por{' '}
                        <span className="font-black" style={{ color: '#6366f1' }}>Meu Sistema Psi</span>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default VisualizarCobranca;
