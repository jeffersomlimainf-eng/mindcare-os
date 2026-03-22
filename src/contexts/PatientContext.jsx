import { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { db } from '../utils/db';
import { useUser } from './UserContext';
import { supabase } from '../lib/supabase';

const PatientContext = createContext();

export const usePatients = () => {
    const context = useContext(PatientContext);
    if (!context) {
        throw new Error('usePatients must be used within a PatientProvider');
    }
    return context;
};

export const PatientProvider = ({ children }) => {
    const { addNotification } = useNotifications();
    const { user } = useUser();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Carregar pacientes isolados pelo tenant atual
    useEffect(() => {
        const loadPatients = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    const tenantPatients = await db.list('patients');
                    setPatients(tenantPatients);
                } catch (error) {
                    console.error('[PatientContext] Erro ao carregar:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadPatients();

        if (user && user.id !== 'guest') {
            const channel = supabase
                .channel('patients_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, (payload) => {
                    console.log('[PatientContext] Mudança em tempo real:', payload);
                    loadPatients(); 
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const addPatient = async (dados) => {
        const iniciais = (dados.nome || 'P').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
        const cores = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-indigo-500', 'bg-violet-500'];
        const corAleatoria = cores[Math.floor(Math.random() * cores.length)];

        try {
            const payload = {
                ...dados,
                iniciais: dados.iniciais || iniciais,
                cor: dados.cor || corAleatoria,
                userId: user?.id,        // Satisfy new RLS USING (user_id = auth.uid())
                status: 'Ativo',
                created_at: new Date().toISOString()
            };
            
            // Note: we removed tenantId per explicit user request
            const novo = await db.insert('patients', payload);

            setPatients(prev => [...prev, novo]);
            
            addNotification({
                title: 'Novo Paciente Cadastrado',
                message: `${novo.name || novo.nome} foi adicionado(a) ao diretório.`,
                type: 'success',
                icon: 'person_add'
            });
            return novo;
        } catch (error) {
            console.error('[PatientContext] Erro ao adicionar paciente - Detalhes do DB:', JSON.stringify(error, null, 2));
            throw error;
        }
    };

    const updatePatient = async (id, dados) => {
        try {
            const updated = await db.update('patients', id, dados);
            setPatients(prev => prev.map(p => p.id === id ? updated : p));
        } catch (error) {
            console.error('[PatientContext] Erro ao atualizar paciente:', error);
            throw error;
        }
    };

    const deletePatient = async (id) => {
        try {
            await db.delete('patients', id);
            setPatients(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('[PatientContext] Erro ao deletar paciente:', error);
            throw error;
        }
    };

    return (
        <PatientContext.Provider value={{ patients, loading, addPatient, updatePatient, deletePatient }}>
            {children}
        </PatientContext.Provider>
    );
};
