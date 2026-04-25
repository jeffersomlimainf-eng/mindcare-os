import React from 'react';
import { safeRender } from '../../utils/render';

const DashboardRecentDocs = ({ documents, navigate, onNewDoc }) => {
    const handleNavegacaoDocumento = (doc) => {
        const type = doc.type || '';
        const id = doc.id?.replace('#', '') || '';
        const patientId = doc.patientId?.replace('#', '') || doc.patient;

        if (type.includes('evolucao')) {
            navigate(`/prontuarios/paciente/${patientId}`);
        } else if (type.includes('financeiro') || type.includes('fatura')) {
            navigate('/financeiro');
        } else {
            navigate(`/prontuarios/paciente/${patientId}`);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 opacity-60">
                    <span className="material-symbols-outlined text-primary text-base">description</span>
                    <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Documentos Recentes</h3>
                </div>
                <button onClick={() => navigate('/prontuarios')} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline transition-all">
                    Ver todos
                </button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-4 md:px-6 py-3 md:py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {documents.length > 0 ? (
                                documents.map((doc, i) => (
                                    <tr 
                                        key={i} 
                                        onClick={() => handleNavegacaoDocumento(doc)} 
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                                    >
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                                                    <span className="material-symbols-outlined text-lg">{doc.icon}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white uppercase truncate max-w-[150px]">{doc.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{doc.date}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{safeRender(doc.patient)}</span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <span className={`px-2.5 py-1 inline-flex items-center rounded-full text-[10px] font-bold uppercase tracking-wide ${doc.status === 'Assinado' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-xs italic">Nenhuma atividade recente encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardRecentDocs;
