/**
 * Utilitários para formatação de IDs na interface.
 * Converte UUIDs longos em identificadores curtos e amigáveis.
 */

/**
 * Formata um ID (UUID ou string longa) para exibição amigável na UI.
 * Exemplos:
 *   "6A121BAB-E58E-4E15-AB04-..." → "#6A121B"
 *   "TCLE-M1234ABC" → "TCLE-M1234ABC" (já amigável, retorna como está)
 *   null/undefined → "Novo"
 * 
 * @param {string} id - O ID original (UUID ou string qualquer)
 * @param {string} prefix - Prefixo opcional (ex: "LAU", "DEC", "ANA")
 * @param {number} length - Quantidade de caracteres a exibir (default: 6)
 * @returns {string} ID formatado para exibição
 */
export const formatDisplayId = (id, prefix = '', length = 6) => {
    if (!id) return 'Novo';

    const idStr = String(id);

    // Se já é um ID curto/amigável (menos de 15 chars), retorna como está
    if (idStr.length <= 15) return prefix ? `${prefix}-${idStr}` : idStr;

    // Para UUIDs longos, pega os primeiros N caracteres alfanuméricos
    const cleaned = idStr.replace(/-/g, '').toUpperCase();
    const shortId = cleaned.substring(0, length);

    return prefix ? `${prefix}-${shortId}` : `#${shortId}`;
};

/**
 * Formata um ID para uso em nomes de arquivo (sem caracteres especiais).
 * @param {string} id - O ID original
 * @param {number} length - Quantidade de caracteres (default: 8)
 * @returns {string} ID seguro para nomes de arquivo
 */
export const formatFileId = (id, length = 8) => {
    if (!id) return 'novo';
    const idStr = String(id);
    if (idStr.length <= 15) return idStr.toLowerCase().replace(/\s+/g, '_');
    return idStr.replace(/-/g, '').substring(0, length).toLowerCase();
};

/**
 * Retorna o prefixo adequado para cada tipo de documento.
 * @param {string} tipo - O tipo do documento
 * @returns {string} Prefixo (ex: "EVO", "LAU", "ATE")
 */
export const getDocumentPrefix = (tipo) => {
    if (!tipo) return '';
    const t = tipo.toLowerCase();
    if (t.includes('evolução') || t.includes('evolucao')) return 'EVO';
    if (t.includes('laudo')) return 'LAU';
    if (t.includes('atestado')) return 'ATE';
    if (t.includes('declaração') || t.includes('declaracao')) return 'DEC';
    if (t.includes('anamnese')) return 'ANA';
    if (t.includes('encaminhamento')) return 'ENC';
    if (t.includes('termo') || t.includes('tcle')) return 'TCL';
    return 'DOC';
};
