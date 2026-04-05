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
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'patients',
                    // BUG-06 FIX: filtrar por user_id para evitar N+1 queries (um disparo por qualquer usuário)
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
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

    const checkPatientClinicalData = async (id) => {
        try {
            // Tabelas criticas que bloqueiam a deleção do paciente
            const tables = [
                'evolutions', 
                'docs_laudo', 
                'docs_atestado', 
                'docs_declaracao', 
                'docs_anamnese', 
                'docs_encaminhamento',
                'docs_tcle',
                'appointments'
            ];

            for (const table of tables) {
                const { data, error } = await supabase
                    .from(table)
                    .select('id')
                    .eq('patient_id', id)
                    .limit(1);

                if (error) {
                    console.error(`[PatientContext] Erro ao verificar tabela ${table}:`, error);
                    continue;
                }

                if (data && data.length > 0) {
                    return { hasData: true, table };
                }
            }

            return { hasData: false };
        } catch (error) {
            console.error('[PatientContext] Erro na verificação clínica:', error);
            return { hasData: false };
        }
    };

    const deletePatient = async (id) => {
        try {
            // Auditoria preventiva: Verificar se há documentos órfãos
            const clinicalStatus = await checkPatientClinicalData(id);
            if (clinicalStatus.hasData) {
                const error = new Error('Paciente possui registros clínicos vinculados.');
                error.code = 'CLINICAL_DATA_EXISTS';
                error.table = clinicalStatus.table;
                throw error;
            }

            await db.delete('patients', id);
            setPatients(prev => prev.filter(p => p.id !== id));
            
            addNotification({
                title: 'Paciente Excluído',
                message: 'O cadastro foi removido com sucesso.',
                type: 'info',
                icon: 'delete_sweep'
            });
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


