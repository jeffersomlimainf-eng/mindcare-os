import { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { db } from '../utils/db';
import { useUser } from './UserContext';
import { supabase } from '../lib/supabase';

import { logger } from '../utils/logger';
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
        let isMounted = true;

        const loadPatients = async () => {
            if (user && user.id !== 'guest') {
                if (isMounted) setLoading(true);
                try {
                    const tenantPatients = await db.list('patients');
                    if (isMounted) setPatients(tenantPatients);
                } catch (error) {
                    logger.error('[PatientContext] Erro ao carregar:', error);
                } finally {
                    if (isMounted) setLoading(false);
                }
            }
        };

        loadPatients();

        let channel;
        if (user && user.id !== 'guest') {
            channel = supabase
                .channel('patients_changes')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'patients',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    if (isMounted && payload.new?.id) {
                        setPatients(prev => {
                            // Evita duplicata caso o registro já exista (ex: otimismo local)
                            if (prev.some(p => p.id === payload.new.id)) return prev;
                            return [...prev, payload.new];
                        });
                    }
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'patients',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    if (isMounted && payload.new?.id) {
                        setPatients(prev =>
                            prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
                        );
                    }
                })
                .on('postgres_changes', {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'patients',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    if (isMounted && payload.old?.id) {
                        setPatients(prev => prev.filter(p => p.id !== payload.old.id));
                    }
                })
                .subscribe();
        }

        return () => {
            isMounted = false;
            if (channel) supabase.removeChannel(channel);
        };
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

            // Auto-criar conta de acesso ao portal do paciente (fire-and-forget)
            if (dados.email) {
                supabase.functions.invoke('create-patient-auth', {
                    body: { email: dados.email, patient_id: novo.id }
                }).catch(err => logger.error('[PatientContext] Erro ao criar auth do paciente:', err));
            }

            addNotification({
                title: 'Novo Paciente Cadastrado',
                message: `${novo.name || novo.nome} foi adicionado(a) ao diretório.`,
                type: 'success',
                icon: 'person_add'
            });
            return novo;
        } catch (error) {
            logger.error('[PatientContext] Erro ao adicionar paciente - Detalhes do DB:', JSON.stringify(error, null, 2));
            throw error;
        }
    };

    const updatePatient = async (id, dados) => {
        try {
            const updated = await db.update('patients', id, dados);
            setPatients(prev => prev.map(p => p.id === id ? updated : p));
        } catch (error) {
            logger.error('[PatientContext] Erro ao atualizar paciente:', error);
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
                    logger.error(`[PatientContext] Erro ao verificar tabela ${table}:`, error);
                    continue;
                }

                if (data && data.length > 0) {
                    return { hasData: true, table };
                }
            }

            return { hasData: false };
        } catch (error) {
            logger.error('[PatientContext] Erro na verificação clínica:', error);
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
            logger.error('[PatientContext] Erro ao deletar paciente:', error);
            throw error;
        }
    };

    return (
        <PatientContext.Provider value={{ patients, loading, addPatient, updatePatient, deletePatient }}>
            {children}
        </PatientContext.Provider>
    );
};



