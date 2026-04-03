import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { showToast } from '../components/Toast';

const runDbTest = async () => {
    console.log("=== INICIANDO TESTE DB ===");
    try {
        const payload = {
            name: 'Paciente Teste DB',
            tenant_id: 'd7a1240e-5401-44bb-9a99-b13c77d63a92', // Exemplo
            status: 'Ativo',
            phone: '11999999999'
        };
        const { data, error } = await supabase.from('patients').insert([payload]).select().single();
        if (error) {
            console.error("ERRO SUPABASE:", JSON.stringify(error, null, 2));
            showToast('Erro no DB, olhe o console', 'error');
        } else {
            console.log("SUCESSO:", data);
            showToast('Sucesso!', 'success');
        }
    } catch(e) {
        console.error("CATCH ERRO:", e);
    }
};

const AdminDashboard = () => {
    const { user } = useUser();
    
    // Dados Mockados Avançados para o Painel Admin
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Carregar clientes reais do Supabase
    const fetchClientes = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Mapear dados do banco para o formato esperado pelo componente
                const mappedClientes = data.map(profile => ({
                    id: profile.id,
                    nome: profile.full_name || 'Sem Nome',
                    email: profile.email,
                    fone: profile.phone || profile.clinic_cnpj || 'N/A',
                    clinica: profile.clinic_name || 'Clínica não definida',
                    plano: profile.role === 'admin' ? 'Premium' : 'Essencial',
                    mrr: profile.role === 'admin' ? 72.90 : 39.90,
                    status: profile.plan_status || 'Ativo',
                    is_trial: profile.is_trial ?? false,
                    trial_end_date: profile.trial_end_date,
                    consumoIA: 0,
                    inadimplente: profile.plan_status === 'Inadimplente',
                    limiteIA: profile.role === 'admin' ? 1000000 : 0,
                    anotacoes: profile.role === 'admin' ? 'Administrador do Sistema' : 'Cadastro via plataforma',
                    ultimoAcesso: profile.created_at,
                    storageUsed: 0,
                    faturas: [],
                    auditLog: [
                        { data: new Date(profile.created_at).toISOString().split('T')[0], acao: 'Conta Identificada no Banco', admin: 'Sistema' }
                    ]
                }));

                setClientes(mappedClientes);
            } catch (err) {
                console.error('[AdminDashboard] Erro ao buscar clientes:', err);
            } finally {
                setLoading(false);
            }
        };

    React.useEffect(() => {
        fetchClientes();
    }, []);

    const [selectedClient, setSelectedClient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('config'); // 'config', 'finance', 'audit'

    const [newClient, setNewClient] = useState({
        nome: '',
        email: '',
        fone: '',
        clinica: '',
        plano: 'Essencial'
    });

    const stats = {
        mrrTotal: clientes.reduce((acc, current) => acc + (current.status === 'Ativo' ? current.mrr : 0), 0),
        psicologosAtivos: clientes.filter(c => c.status === 'Ativo').length,
        consumoIAAcumulado: '1.2M tokens',
        churnRate: '2.4%'
    };

    const filteredClientes = clientes.filter(c => 
        c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clinica.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUpdateClient = (id, updates) => {
        setClientes(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        if (selectedClient && selectedClient.id === id) {
            setSelectedClient(prev => ({ ...prev, ...updates }));
        }
    };


    const handleToggleStatus = (id) => {
        const cliente = clientes.find(c => c.id === id);
        const novoStatus = cliente.status === 'Ativo' ? 'Suspenso' : 'Ativo';
        handleUpdateClient(id, { status: novoStatus });
        // Simular Log de Auditoria
        const logEntry = { data: new Date().toISOString().split('T')[0], acao: `Status alterado para ${novoStatus}`, admin: user?.nome || 'Admin' };
        setClientes(prev => prev.map(c => c.id === id ? { ...c, auditLog: [logEntry, ...(c.auditLog || [])] } : c));
    };

    const handleSaveTenancy = async (id) => {
        if (!selectedClient) return;
        setActionLoading(true);

        try {
            // 1. Verificar se o e-mail mudou para atualizar no Auth
            const originalClient = clientes.find(c => c.id === id);
            const emailChanged = originalClient && originalClient.email !== selectedClient.email;

            if (emailChanged) {
                const payload = {
                    action: 'update',
                    userData: { 
                        id: id,
                        email: selectedClient.email 
                    }
                };

                const { data: authData, error: authError } = await supabase.functions.invoke('admin_manage_users', {
                    body: payload
                });

                if (authError) throw authError;
                if (!authData.success) throw new Error(authData.error);
                showToast('E-mail de login atualizado com sucesso!', 'success');
            }

            // 2. Atualizar dados no Supabase (tabela profiles)
            // Note: tenant_id não deve ser mudado aqui
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: selectedClient.nome,
                    email: selectedClient.email,
                    phone: selectedClient.fone,
                    clinic_name: selectedClient.clinica,
                    role: selectedClient.plano === 'Premium' ? 'admin' : 'user', // Lógica do mapeamento
                    plan_id: selectedClient.plano === 'Premium' ? 'PREMIUM' : selectedClient.plano === 'Profissional' ? 'PROFISSIONAL' : 'ESSENCIAL',
                    is_trial: selectedClient.is_trial,
                    trial_end_date: selectedClient.trial_end_date,
                    configurations: {
                        ...selectedClient.configurations,
                        limiteIA: selectedClient.limiteIA,
                        mrr: selectedClient.mrr,
                        notes: selectedClient.anotacoes
                    }
                })
                .eq('id', id);

            if (profileError) throw profileError;

            // 3. Atualizar estado local
            setClientes(prev => prev.map(c => c.id === id ? selectedClient : c));
            showToast('Alterações salvas no banco de dados!', 'success');
            
            // Log de Auditoria
            const logEntry = { data: new Date().toISOString().split('T')[0], acao: `Dados da tenancy atualizados`, admin: user?.nome || 'Admin' };
            setClientes(prev => prev.map(c => c.id === id ? { ...c, auditLog: [logEntry, ...(c.auditLog || [])] } : c));

        } catch (error) {
            console.error("[AdminDashboard] Erro ao salvar tenancy:", error);
            showToast(`Erro ao salvar: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClient = async (userId) => {
        const confirmacao = window.confirm("CUIDADO: Tem certeza que deseja apagar esse cliente e TODOS os seus pacientes para sempre? A ação é irreversível.");
        if (!confirmacao) return;
        
        setActionLoading(true);
        try {
            const payload = {
                action: 'delete',
                userData: { id: userId }
            };

            const { data, error } = await supabase.functions.invoke('admin_manage_users', {
                body: payload
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            alert(`Sucesso: ${data.message}`);
            setIsModalOpen(false);
            setClientes(prev => prev.filter(c => c.id !== userId));
            
        } catch (error) {
            console.error("[AdminDashboard] Erro ao deletar usuário:", error);
            alert(`Falha ao deletar: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            const payload = {
                action: 'create',
                userData: {
                    nome: newClient.nome,
                    email: newClient.email,
                    password: 'Meu Sistema PSI@123', // Senha padrão temporária
                    fone: newClient.fone,
                    clinica: newClient.clinica,
                    plano: newClient.plano,
                    role: 'user' // Por padrão, os clientes criados não são admins
                }
            };

            const { data, error } = await supabase.functions.invoke('admin_manage_users', {
                body: payload
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            alert(`Sucesso! Cliente registrado: ${data.message}`);
            setIsAddModalOpen(false);
            setNewClient({ nome: '', email: '', fone: '', clinica: '', plano: 'Essencial' });
            
            // Recarrega a tabela para pegar os UUIDs reais do banco
            fetchClientes();
            
        } catch (error) {
            console.error("[AdminDashboard] Erro ao criar usuário:", error);
            alert(`Falha ao criar usuário. Certifique-se de que a Edge Function está rodando. Detalhe: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const formatData = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="space-y-8 relative pb-20">
            {/* Modal de Gerenciamento Avançado */}
            {isModalOpen && selectedClient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                        {/* Header do Modal */}
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Gestão da Tenancy</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedClient.clinica} • {selectedClient.nome}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>

                            {/* Tabs do Modal */}
                            <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl w-fit">
                                {[
                                    { id: 'config', label: 'Configurações', icon: 'settings' },
                                    { id: 'finance', label: 'Financeiro', icon: 'payments' },
                                    { id: 'audit', label: 'Auditoria', icon: 'security' }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conteúdo das Tabs */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                            {activeTab === 'config' && (
                                <div className="space-y-8">
                                    {/* Contatos e Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2 group focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">E-mail de Acesso</label>
                                            <input 
                                                type="email"
                                                value={selectedClient.email}
                                                onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})}
                                                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-slate-100 w-full"
                                                placeholder="nome@exemplo.com"
                                            />
                                        </div>
                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2 group focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all shadow-sm">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp / Telefone</label>
                                            <input 
                                                type="tel"
                                                value={selectedClient.fone}
                                                onChange={(e) => setSelectedClient({...selectedClient, fone: e.target.value})}
                                                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-slate-100 w-full"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>

                                    {/* Armazenamento */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end px-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Armazenamento (Storage)</label>
                                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">{selectedClient.storageUsed}MB / 1024MB</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                            <div 
                                                className={`h-full rounded-full transition-all ${selectedClient.storageUsed > 800 ? 'bg-rose-500' : 'bg-primary'}`}
                                                style={{ width: `${Math.min((selectedClient.storageUsed / 1024) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Anotações Internas */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">history_edu</span>
                                            Anotações Internas
                                        </label>
                                        <textarea 
                                            value={selectedClient.anotacoes || ''}
                                            onChange={(e) => setSelectedClient({...selectedClient, anotacoes: e.target.value})}
                                            className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-primary/30 transition-all text-xs font-medium resize-none italic"
                                        />
                                    </div>

                                    {/* Gestão de Período de Testes (Trial) */}
                                    <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 mb-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Período de Testes (Trial)</h4>
                                                <p className="text-[10px] text-slate-400 font-bold">Ative ou estenda o tempo do usuário</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={selectedClient.is_trial || false}
                                                    onChange={(e) => setSelectedClient({...selectedClient, is_trial: e.target.checked})}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        {selectedClient.is_trial && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Expiração</label>
                                                    <input 
                                                        type="date"
                                                        value={selectedClient.trial_end_date ? selectedClient.trial_end_date.split('T')[0] : ''}
                                                        onChange={(e) => setSelectedClient({...selectedClient, trial_end_date: e.target.value ? new Date(e.target.value).toISOString() : null})}
                                                        className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-bold"
                                                    />
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const current = selectedClient.trial_end_date ? new Date(selectedClient.trial_end_date) : new Date();
                                                            current.setDate(current.getDate() + 15);
                                                            setSelectedClient({...selectedClient, trial_end_date: current.toISOString()});
                                                        }}
                                                        className="h-10 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest transition-all"
                                                    >
                                                        +15 Dias
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const current = selectedClient.trial_end_date ? new Date(selectedClient.trial_end_date) : new Date();
                                                            current.setDate(current.getDate() + 30);
                                                            setSelectedClient({...selectedClient, trial_end_date: current.toISOString()});
                                                        }}
                                                        className="h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        +30 Dias
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Controles de Plano */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assinatura</label>
                                            <select 
                                                value={selectedClient.plano}
                                                onChange={(e) => handleUpdateClient(selectedClient.id, { plano: e.target.value, mrr: e.target.value === 'Premium' ? 72.90 : e.target.value === 'Profissional' ? 44.90 : 39.90 })}
                                                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-primary/30 text-xs font-bold"
                                            >
                                                <option value="Essencial">Plano Essencial</option>
                                                <option value="Profissional">Plano Profissional</option>
                                                <option value="Premium">Plano Premium</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cota Mensal IA</label>
                                            <input 
                                                type="number"
                                                value={selectedClient.limiteIA}
                                                onChange={(e) => handleUpdateClient(selectedClient.id, { limiteIA: parseInt(e.target.value) })}
                                                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-primary/30 text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'finance' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico de Faturamentos</h4>
                                        {selectedClient.inadimplente && (
                                            <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[9px] font-black uppercase italic animate-pulse">Inadimplente</span>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {selectedClient.faturas?.map(fat => (
                                            <div key={fat.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className={`size-10 rounded-xl flex items-center justify-center ${fat.status === 'Paga' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        <span className="material-symbols-outlined text-sm">{fat.status === 'Paga' ? 'check_circle' : 'warning'}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{fat.id}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold">{fat.data}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">R$ {fat.valor.toFixed(2)}</span>
                                                    {fat.status === 'Pendente' ? (
                                                        <button className="px-4 py-2 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Copiar PIX</button>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Liquidada</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'audit' && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Log de Auditoria Administrativa</h4>
                                    <div className="space-y-4">
                                        {selectedClient.auditLog?.length > 0 ? selectedClient.auditLog.map((log, idx) => (
                                            <div key={idx} className="flex gap-4 items-start pl-2">
                                                <div className="mt-1 size-2 rounded-full bg-primary/30" />
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{log.acao}</p>
                                                    <div className="flex gap-3 mt-1">
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase">{log.data}</span>
                                                        <span className="text-[9px] text-primary/60 font-black uppercase tracking-widest italic">Por: {log.admin}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-xs text-slate-400 p-8 text-center italic">Nenhuma ação administrativa registrada.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer do Modal */}
                        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-4">
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleToggleStatus(selectedClient.id)}
                                    className={`px-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedClient.status === 'Ativo' ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                >
                                    {selectedClient.status === 'Ativo' ? 'Suspender Acesso' : 'Ativar Acesso'}
                                </button>
                                <button 
                                    onClick={() => handleUpdateClient(selectedClient.id, { inadimplente: !selectedClient.inadimplente })}
                                    className={`px-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!selectedClient.inadimplente ? 'bg-slate-100 text-slate-400' : 'bg-amber-500 text-white'}`}
                                >
                                    {selectedClient.inadimplente ? 'Marcar como Em Dia' : 'Marcar Inadimplência'}
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleDeleteClient(selectedClient.id)} 
                                    disabled={actionLoading}
                                    className="px-6 h-12 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? 'Deletando...' : 'Excluir Tenancy'}
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="px-6 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-slate-300 transition-all">Fechar</button>
                                <button 
                                    onClick={() => handleSaveTenancy(selectedClient.id)} 
                                    disabled={actionLoading}
                                    className="px-8 h-12 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Adição de Novo Cliente */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Novo Cliente Manual</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cadastro manual de tenancy</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="size-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddClient} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
                                    <input 
                                        required
                                        type="text"
                                        value={newClient.nome}
                                        onChange={(e) => setNewClient({...newClient, nome: e.target.value})}
                                        placeholder="Ex: Dr. Fulano de Tal"
                                        className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-primary/30 text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Clínica / Razão</label>
                                    <input 
                                        required
                                        type="text"
                                        value={newClient.clinica}
                                        onChange={(e) => setNewClient({...newClient, clinica: e.target.value})}
                                        placeholder="Ex: Clínica Saúde"
                                        className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-primary/30 text-xs font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail Principal</label>
                                    <input 
                                        required
                                        type="email"
                                        value={newClient.email}
                                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                                        placeholder="email@exemplo.com"
                                        className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-primary/30 text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp</label>
                                    <input 
                                        required
                                        type="tel"
                                        value={newClient.fone}
                                        onChange={(e) => setNewClient({...newClient, fone: e.target.value})}
                                        placeholder="11912345678"
                                        className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-primary/30 text-xs font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Plano de Assinatura</label>
                                <select 
                                    value={newClient.plano}
                                    onChange={(e) => setNewClient({...newClient, plano: e.target.value})}
                                    className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-primary/30 text-xs font-bold"
                                >
                                    <option value="Essencial">Plano Essencial (R$ 39,90)</option>
                                    <option value="Profissional">Plano Profissional (R$ 44,90)</option>
                                    <option value="Premium">Plano Premium (R$ 72,90)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-slate-300 transition-all">Cancelar</button>
                                <button type="submit" disabled={actionLoading} className="px-10 h-12 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100">
                                    {actionLoading ? 'Criando Conta...' : 'Criar Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header com KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'MRR Total', value: `R$ ${stats.mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: 'payments', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Psicólogos Ativos', value: stats.psicologosAtivos, icon: 'groups', color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Consumo IA (Mês)', value: stats.consumoIAAcumulado, icon: 'psychology', color: 'text-violet-600', bg: 'bg-violet-50' },
                    { label: 'Taxa de Churn', value: stats.churnRate, icon: 'trending_down', color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabela de Clientes */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 dark:bg-slate-800/50 gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-1">Gerenciamento de Clientes (SaaS)</h2>
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Controle de tenancies, assinaturas e métricas avançadas</p>
                            <button 
                                onClick={runDbTest}
                                className="px-4 py-1.5 bg-red-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-xs">bug_report</span>
                                DEBUG SUPABASE
                            </button>
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-xs">person_add</span>
                                Novo Cliente
                            </button>
                        </div>
                    </div>
                    <div className="relative w-full md:w-72">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 select-none">search</span>
                        <input 
                            type="text" 
                            placeholder="Pesquisar psicólogo, clínica ou e-mail..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-bold"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Psicólogo / Clínica</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Plano / MRR</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Último Acesso</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status / IA</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredClientes.length > 0 ? filteredClientes.map((c) => (
                                <tr 
                                    key={c.id} 
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                                    onClick={() => { setSelectedClient(c); setIsModalOpen(true); setActiveTab('config'); }}
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{c.nome}</span>
                                            <span className="text-[9px] text-primary/60 font-black uppercase tracking-widest">{c.email}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{c.clinica}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase italic ${c.plano === 'Premium' ? 'text-violet-600' : c.plano === 'Profissional' ? 'text-primary' : 'text-slate-500'}`}>{c.plano}</span>
                                            <span className="text-[10px] text-slate-400 font-bold tracking-widest">R$ {c.mrr.toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatData(c.ultimoAcesso)}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`size-1.5 rounded-full ${c.status === 'Ativo' ? (c.inadimplente ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500') : 'bg-rose-500'}`}></div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${c.status === 'Ativo' ? (c.inadimplente ? 'text-amber-500' : 'text-emerald-500') : 'text-rose-500'}`}>
                                                    {c.status === 'Ativo' ? (c.inadimplente ? 'Atrasado' : 'Ativo') : 'Suspenso'}
                                                </span>
                                            </div>
                                            <div className="w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${c.consumoIA}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleDeleteClient(c.id)}
                                                className="size-10 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-500 transition-all flex items-center justify-center text-slate-400"
                                                title="Apagar permanentemente"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete_forever</span>
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedClient(c); setIsModalOpen(true); setActiveTab('config'); }}
                                                className="size-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center text-slate-400 hover:text-slate-600"
                                                title="Gerenciar"
                                            >
                                                <span className="material-symbols-outlined text-xl">manage_accounts</span>
                                            </button>
                                            <button 
                                                onClick={() => handleToggleStatus(c.id)}
                                                className={`size-10 rounded-xl transition-all flex items-center justify-center ${c.status === 'Ativo' ? 'text-slate-300 hover:text-rose-500 hover:bg-rose-50' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'}`}
                                                title={c.status === 'Ativo' ? 'Suspender' : 'Ativar'}
                                            >
                                                <span className="material-symbols-outlined text-xl">{c.status === 'Ativo' ? 'block' : 'lock_open'}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">person_search</span>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum psicólogo encontrado para "{searchQuery}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;


