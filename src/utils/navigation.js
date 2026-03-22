/**
 * Centraliza a lógica de navegação para diferentes tipos de documentos clínicos.
 * @param {Object} item - O objeto do documento (deve conter tipo e id)
 * @param {Function} navigate - Função navigate do react-router-dom
 */
export const handleNavegacaoDocumento = (item, navigate) => {
    if (!item || !item.id) return;

    // Normalização básica do tipo
    const tipo = (item.tipo || item.type || '').toLowerCase();
    
    // Tratamento de IDs que podem vir nulos ou com prefixos
    if (!item.id) return;
    const docId = item.id.toString().replace('#', '');
    
    if (tipo.includes('evolução') || tipo.includes('evolucao')) {
        navigate(`/prontuarios/evolucao/${docId}`);
    } else if (tipo.includes('laudo')) {
        navigate(`/laudos/${docId}`);
    } else if (tipo.includes('atestado')) {
        navigate(`/atestados/${docId}`);
    } else if (tipo.includes('declaração') || tipo.includes('declaracao')) {
        navigate(`/declaracoes/${docId}`);
    } else if (tipo.includes('anamnese')) {
        navigate(`/anamneses/${docId}`);
    } else if (tipo.includes('encaminhamento')) {
        navigate(`/encaminhamentos/${docId}`);
    } else if (item.pacienteId) {
        // Fallback para o prontuário do paciente se o tipo for desconhecido
        navigate(`/prontuarios/paciente/${formatPatientIdForUrl(item.pacienteId)}`);
    }
};

/**
 * Formata IDs de pacientes para uso em URLs (remove o #).
 * @param {string} id 
 * @returns {string}
 */
export const formatPatientIdForUrl = (id) => {
    if (!id) return '';
    return id.toString().replace('#', '');
};
