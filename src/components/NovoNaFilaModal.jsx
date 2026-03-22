import React, { useState } from 'react';
import Modal from './Modal';
import { useAppointments } from '../contexts/AppointmentContext';
import { showToast } from './Toast';

const NovoNaFilaModal = ({ isOpen, onClose }) => {
    const { addToWaitingList } = useAppointments();
    const [nome, setNome] = useState('');
    const [prioridade, setPrioridade] = useState('ROTINA');
    const [preferencia, setPreferencia] = useState('Indiferente');
    const [duracao, setDuracao] = useState('50min');

    if (!isOpen) return null;

    const handleSalvar = () => {
        if (!nome) {
            showToast('Informe o nome do paciente', 'warning');
            return;
        }

        const bgBadge = prioridade === 'URGENTE' ? 'bg-red-500' : prioridade === 'RETORNO' ? 'bg-blue-500' : 'bg-slate-500';

        addToWaitingList({
            nome,
            prioridade,
            preferencia,
            duracao,
            bgBadge
        });

        showToast(`${nome} adicionado à fila!`, 'success');
        setNome('');
        setPrioridade('ROTINA');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Novo na Fila de Espera"
            icon="group_add"
            maxWidth="max-w-md"
        >
            <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nome do Paciente</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Ex: João Silva"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Prioridade</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['ROTINA', 'URGENTE', 'RETORNO'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPrioridade(p)}
                                className={`py-2 px-3 rounded-xl border text-[10px] font-black transition-all ${prioridade === p ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' : 'bg-white border-slate-200 text-slate-500 hover:border-primary/50'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Preferência</label>
                        <select
                            value={preferencia}
                            onChange={e => setPreferencia(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                        >
                            <option>Indiferente</option>
                            <option>Manhã</option>
                            <option>Tarde</option>
                            <option>Noite</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Duração</label>
                        <select
                            value={duracao}
                            onChange={e => setDuracao(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                        >
                            <option>30min</option>
                            <option>50min</option>
                            <option>60min</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex items-center gap-3 justify-end border-t border-slate-100">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-700 transition-all font-bold"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSalvar}
                    className="px-6 py-2 bg-primary text-white text-xs font-black rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                    Adicionar Paciente
                </button>
            </div>
        </Modal>
    );
};

export default NovoNaFilaModal;
