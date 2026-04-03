/**
 * Formata uma data para o formato YYYY-MM-DD usado no sistema.
 * @param {Date} date 
 * @returns {string}
 */
export const formatDateLocal = (date) => {
    if (!date || !(date instanceof Date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Calcula a idade com base em uma data de nascimento.
 * @param {string|Date} dataNasc 
 * @returns {string}
 */
export const calcularIdade = (dataNasc) => {
    if (!dataNasc) return '--';
    try {
        const hoje = new Date();
        const nasc = new Date(dataNasc);
        if (isNaN(nasc.getTime())) return '--';
        
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return `${idade} anos`;
    } catch (e) {
        return '--';
    }
};


