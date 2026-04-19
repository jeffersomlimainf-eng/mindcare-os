import { useMemo } from 'react';

export function useDashboardStats({
  evolutions,
  laudos,
  atestados,
  declaracoes,
  anamneses,
  encaminhamentos,
  patients
}) {
  const totalDocumentos = useMemo(() => 
    (evolutions?.length || 0) + 
    (laudos?.length || 0) + 
    (atestados?.length || 0) + 
    (declaracoes?.length || 0) + 
    (anamneses?.length || 0) + 
    (encaminhamentos?.length || 0),
  [evolutions, laudos, atestados, declaracoes, anamneses, encaminhamentos]);

  const stats = useMemo(() => [
    { title: 'Total de Prontuários', value: totalDocumentos.toLocaleString(), trend: '+12.5%', icon: 'folder_shared', color: 'text-primary', bgColor: 'bg-primary/10', rota: '/prontuarios' },
    { title: 'Pacientes Ativos', value: (patients || []).length.toString(), trend: 'Total', icon: 'group', color: 'text-amber-500', bgColor: 'bg-amber-500/10', rota: '/pacientes' },
    { title: 'Laudos Emitidos', value: laudos.length.toString(), trend: '+5.2%', icon: 'history_edu', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', rota: '/laudos' },
    { title: 'Declarações', value: declaracoes.length.toString(), trend: '-2.4%', icon: 'assignment_ind', color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', rota: '/declaracoes' },
  ], [totalDocumentos, patients, laudos, declaracoes]);

  const quickActions = useMemo(() => [
    { title: 'Criar Novo Laudo', desc: 'Relatório psicológico', icon: 'article', color: 'text-primary', bgColor: 'bg-primary/10', count: laudos.length, path: '/laudos/novo', categoria: 'Laudos' },
    { title: 'Nova Declaração', desc: 'Comprovante de comparecimento', icon: 'verified', color: 'text-emerald-500', bgColor: 'bg-emerald-100', count: declaracoes.length, path: '/declaracoes/novo', categoria: 'Declarações' },
    { title: 'Emitir Atestado', desc: 'Certificado clínico', icon: 'medical_information', color: 'text-orange-500', bgColor: 'bg-orange-100', count: atestados.length, path: '/atestados/novo', categoria: 'Atestados' },
    { title: 'Ficha de Anamnese', desc: 'Formulário detalhado', icon: 'patient_list', color: 'text-purple-500', bgColor: 'bg-purple-100', count: anamneses.length, path: '/anamneses/novo', categoria: 'Anamneses' },
    { title: 'Novo Encaminhamento', desc: 'Encaminhar paciente', icon: 'send', color: 'text-sky-500', bgColor: 'bg-sky-100', count: encaminhamentos.length, path: '/encaminhamentos/novo', categoria: 'Encaminhamentos' },
  ], [laudos.length, declaracoes.length, atestados.length, anamneses.length, encaminhamentos.length]);

  const todosDocumentosRecentes = useMemo(() => [
    ...(evolutions || []).map(ev => ({
      id: ev.id,
      type: 'evolucao',
      name: `Evolução_${(ev.pacienteNome || '').split(' ')[0]}.pdf`,
      patient: ev.pacienteNome,
      status: ev.status || 'Finalizado',
      statusColor: 'bg-green-100 text-green-700',
      date: ev.criadoEm ? new Date(ev.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
      icon: 'clinical_notes'
    })),
    ...(laudos || []).map(doc => ({
      id: doc.id,
      type: 'laudo',
      name: `Laudo_${(doc.pacienteNome || '').split(' ')[0]}.pdf`,
      patient: doc.pacienteNome,
      status: doc.status || 'Finalizado',
      statusColor: doc.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary',
      date: doc.criadoEm ? new Date(doc.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
      icon: 'description'
    })),
    ...(atestados || []).map(doc => ({
      id: doc.id,
      type: 'atestado',
      name: `Atestado_${(doc.pacienteNome || '').split(' ')[0]}.pdf`,
      patient: doc.pacienteNome,
      status: doc.status || 'Finalizado',
      statusColor: doc.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary',
      date: doc.criadoEm ? new Date(doc.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
      icon: 'medical_information'
    }))
  ].sort((a, b) => {
    const dateA = a.date === 'Hoje' ? new Date() : new Date(a.date.split('/').reverse().join('-') || a.date);
    const dateB = b.date === 'Hoje' ? new Date() : new Date(b.date.split('/').reverse().join('-') || b.date);
    return dateB - dateA;
  }).slice(0, 5), [evolutions, laudos, atestados]);

  return {
    totalDocumentos,
    stats,
    quickActions,
    todosDocumentosRecentes
  };
}
