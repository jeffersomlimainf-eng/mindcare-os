import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { toast } from 'react-hot-toast';
import { 
    Trash2, 
    RotateCcw, 
    Search, 
    Calendar, 
    User, 
    DollarSign, 
    FileText, 
    AlertCircle,
    Info
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
            toast.error('Erro ao carregar itens da lixeira');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            await db.restoreFromTrash(id);
            toast.success('Registro restaurado com sucesso!');
            loadTrash();
        } catch (error) {
            console.error('Erro ao restaurar:', error);
            toast.error('Erro ao restaurar registro. Verifique se não há duplicatas.');
        }
    };

    const handleDeletePermanent = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este item permanentemente? Esta ação não pode ser desfeita.')) return;
        
        try {
            await db.emptyTrash(id);
            toast.success('Item excluído permanentemente.');
            loadTrash();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            toast.error('Erro ao excluir item.');
        }
    };

    const handleEmptyAll = async () => {
        if (!window.confirm('Tem certeza que deseja esvaziar toda a lixeira? Todos os itens serão perdidos para sempre.')) return;
        
        try {
            await db.emptyTrash();
            toast.success('Lixeira esvaziada!');
            loadTrash();
        } catch (error) {
            console.error('Erro ao esvaziar:', error);
            toast.error('Erro ao esvaziar lixeira.');
        }
    };

    const getTableIcon = (tableName) => {
        switch (tableName) {
            case 'patients': return <User className="w-4 h-4" />;
            case 'appointments': return <Calendar className="w-4 h-4" />;
            case 'finance': return <DollarSign className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
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
        const matchesSearch = getItemName(item).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTable = filterTable === 'all' || item.table_name === filterTable;
        return matchesSearch && matchesTable;
    });

    const tablesInTrash = [...new Set(trashItems.map(item => item.table_name))];

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <Trash2 className="w-7 h-7 text-rose-500" />
                        Lixeira do Sistema
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Recupere registros excluídos ou limpe o espaço permanentemente.</p>
                </div>
                
                {trashItems.length > 0 && (
                    <button 
                        onClick={handleEmptyAll}
                        className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-rose-100"
                    >
                        <Trash2 className="w-4 h-4" />
                        Esvaziar Lixeira
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou descrição..." 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="relative">
                    <select 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none transition-all shadow-sm cursor-pointer text-slate-600"
                        value={filterTable}
                        onChange={(e) => setFilterTable(e.target.value)}
                    >
                        <option value="all">Todas as Categorias</option>
                        {tablesInTrash.map(table => (
                            <option key={table} value={table}>{getTableLabel(table)}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[11px] text-amber-700 font-medium leading-tight">
                        Itens na lixeira ainda ocupam espaço. Registros restaurados voltam com todos os vínculos originais.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Consultando arquivos deletados...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Lixeira Vazia</h3>
                        <p className="text-slate-500 max-w-xs mt-2">
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
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Item</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Excluído em</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50 transition-all">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg w-fit text-[11px] font-bold uppercase tracking-tight">
                                                {getTableIcon(item.table_name)}
                                                {getTableLabel(item.table_name)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{getItemName(item)}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">ID Original: {item.original_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-slate-600">
                                                    {format(new Date(item.deleted_at), "dd 'de' MMMM", { locale: ptBR })}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    às {format(new Date(item.deleted_at), 'HH:mm')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleRestore(item.id)}
                                                    className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
                                                    title="Restaurar"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    <span className="hidden md:inline">Restaurar</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeletePermanent(item.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Excluir Permanente"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            <div className="mt-8 flex items-start gap-4 bg-blue-50 border border-blue-100 p-6 rounded-[2rem]">
                <div className="bg-blue-600 text-white p-2 rounded-xl">
                    <Info className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-blue-900 font-bold text-sm">Como funciona a restauração?</h4>
                    <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                        Ao restaurar um item, o sistema tenta reinseri-lo na tabela original. Se o item depender de outro que também foi excluído (ex: uma evolução de um paciente deletado), você precisará restaurar o item principal primeiro.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Lixeira;
