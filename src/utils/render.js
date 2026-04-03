/**
 * Utilitário para renderização segura de valores dinâmicos no React.
 * Evita o erro "Objects are not valid as a React child" ao extrair automaticamente
 * o campo de texto mais provável de um objeto retornado pelo banco de dados.
 */
export const safeRender = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    
    // Se for string ou número, retorna diretamente
    if (typeof val !== 'object') return val;
    
    // Se for um objeto (comum em joins do Supabase), tenta achar campos conhecidos
    const camposComuns = ['nome', 'name', 'full_name', 'titulo', 'title', 'label', 'email', 'description', 'conteudo'];
    
    for (const campo of camposComuns) {
        if (val[campo] !== undefined && typeof val[campo] !== 'object') {
            return val[campo];
        }
    }
    
    // Caso seja um objeto desconhecido, tenta converter para string JSON ou retorna fallback
    try {
        return JSON.stringify(val);
    } catch (e) {
        return fallback;
    }
};


