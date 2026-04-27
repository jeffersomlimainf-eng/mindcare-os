import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { showToast } from '../components/Toast';

const Lixeira = () => {
    const [trashItems, setTrashItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTable, setFilterTable] = useState('all');

    useEffect(() => {
        loadTrash();
    }, []);

    const loadTrash = async () => {
        try {
            setLoading(true);
            const data = await db.listTrash();
            setTrashItems(data || []);
        } catch (error) {
            console.error('Erro ao carregar lixeira:', error);
            showToast('Erro ao carregar itens da lixeira', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            await db.restoreFromTrash(id);
            showToast('Registro restaurado com sucesso!', 'success');
            loadTrash();
        } catch (error) {
            console.error('Erro ao restaurar:', error);
            showToast('Erro ao restaurar registro. Verifique se não há duplicatas.', 'error');
        }
    };

    const handleDeletePermanent = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este item permanentemente? Esta ação não pode ser desfeita.')) return;
        
        try {
            await db.emptyTrash(id);
            showToast('Item excluído permanentemente.', 'success');
            loadTrash();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            showToast('Erro ao excluir item.', 'error');
        }
    };

    const handleEmptyAll = async () => {
        if (!window.confirm('Tem certeza que deseja esvaziar toda a lixeira? Todos os itens serão perdidos para sempre.')) return;
        
        try {
            await db.emptyTrash();
            showToast('Lixeira esvaziada!', 'success');
            loadTrash();
        } catch (error) {
            console.error('Erro ao esvaziar:', error);
            showToast('Erro ao esvaziar lixeira.', 'error');
        }
    };

    const getTableIcon = (tableName) => {
        switch (tableName) {
            case 'patients': return 'group';
            case 'appointments': return 'calendar_month';
            case 'finance': return 'account_balance_wallet';
            default: return 'description';
        }
    };

    const getTableLabel = (tableName) => {
        const labels = {
            'patients': 'Paciente',
            'appointments': 'Agendamento',
            'finance': 'Financeiro',
            'evolutions': 'Evolução',
            'docs_laudo': 'Laudo',
            'docs_atestado': 'Atestado',
            'docs_declaracao': 'Declaração',
            'docs_anamnese': 'Anamnese',
            'docs_encaminhamento': 'Encaminhamento',
            'docs_tcle': 'TCLE'
        };
        return labels[tableName] || tableName;
    };

    const getItemName = (item) => {
        const data = item.data;
        return data.name || data.patient_name || data.description || data.nome || data.paciente_nome || 'Registro sem nome';
    };

    const filteredItems = trashItems.filter(item => {
        const itemName = getItemName(item).toLowerCase();
        const matchesSearch = itemName.includes(searchTerm.toLowerCase());
        const matchesTable = filterTable === 'all' || item.table_name === filterTable;
        return matchesSearch && matchesTable;
    });

    const tablesInTrash = [...new Set(trashItems.map(item => item.table_name))];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(date);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tight text-slate-800 flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl text-rose-500">delete</span>
                        Lixeira do Sistema
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Recupere registros excluídos ou limpe o espaço permanentemente.</p>
                </div>
                
                {trashItems.length > 0 && (
                    <button 
                        onClick={handleEmptyAll}
                        className="px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-rose-100 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">delete_forever</span>
                        Esvaziar Lixeira
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-2 relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou descrição..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm font-semibold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="relative">
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    <select 
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none appearance-none transition-all shadow-sm cursor-pointer text-sm font-semibold text-slate-600"
                        value={filterTable}
                        onChange={(e) => setFilterTable(e.target.value)}
                    >
                        <option value="all">Todas as Categorias</option>
                        {tablesInTrash.map(table => (
                            <option key={table} value={table}>{getTableLabel(table)}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-[1.5rem] p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-500">info</span>
                    <p className="text-[11px] text-amber-700 font-bold uppercase leading-tight tracking-tight">
                        Itens na lixeira ainda ocupam espaço. Registros restaurados voltam com todos os vínculos.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Consultando lixeira...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                            <span className="material-symbols-outlined text-4xl">delete_sweep</span>
                        </div>
                        <h3 className="text-lg font-black italic text-slate-700 uppercase">Lixeira Vazia</h3>
                        <p className="text-slate-400 text-xs font-medium max-w-xs mt-2">
                            {searchTerm || filterTable !== 'all' 
                                ? 'Nenhum item excluído corresponde aos seus filtros.' 
                                : 'Parece que você não deletou nada recentemente ou a lixeira já foi limpa.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exclusão</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl w-fit text-[9px] font-black uppercase tracking-widest">
                                                <span className="material-symbols-outlined text-sm">{getTableIcon(item.table_name)}</span>
                                                {getTableLabel(item.table_name)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800 tracking-tight">{getItemName(item)}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-50">Ref: {item.original_id.substring(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-600 uppercase tracking-tight">
                                                    {formatDate(item.deleted_at)}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    às {formatTime(item.deleted_at)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={() => handleRestore(item.id)}
                                                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                                    title="Restaurar"
                                                >
                                                    <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
                                                    Restaurar
                                                </button>
                                                <button 
                                                    onClick={() => handleDeletePermanent(item.id)}
                                                    className="size-9 bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center"
                                                    title="Excluir Permanentemente"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-8 flex items-start gap-4 bg-primary/5 border border-primary/10 p-7 rounded-[2.5rem]">
                <div className="bg-primary text-white size-10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">help_center</span>
                </div>
                <div>
                    <h4 className="text-primary font-black italic uppercase text-sm">Como funciona a restauração?</h4>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">
                        Ao restaurar um item, o sistema tenta reinseri-lo na tabela original. Se o item depender de outro que também foi excluído (ex: uma evolução de um paciente deletado), você precisará restaurar o paciente principal primeiro para manter a integridade dos dados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Lixeira;
