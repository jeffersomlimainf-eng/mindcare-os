/**
 * Converte um valor numérico em sua representação por extenso em Português-BR.
 * @param {number} valor - Valor monetário (ex: 1250.50)
 * @returns {string} - Valor por extenso (ex: "mil duzentos e cinquenta reais e cinquenta centavos")
 */
export function valorPorExtenso(valor) {
    if (!valor || valor <= 0) return '';

    const unidades = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezena_especial = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    const formatarParte = (n) => {
        let output = '';
        if (n === 100) return 'cem';
        
        let c = Math.floor(n / 100);
        let d = Math.floor((n % 100) / 10);
        let u = n % 10;

        if (c > 0) output += centenas[c];
        
        if (d > 0 || u > 0) {
            if (output !== '') output += ' e ';
            
            if (d === 1) {
                output += dezena_especial[u];
            } else {
                if (d > 1) {
                    output += dezenas[d];
                    if (u > 0) output += ' e ' + unidades[u];
                } else if (u > 0) {
                    output += unidades[u];
                }
            }
        }
        return output;
    };

    const reais = Math.floor(valor);
    const centavos = Math.round((valor - reais) * 100);

    let extenso = '';

    if (reais > 0) {
        if (reais < 1000) {
            extenso = formatarParte(reais);
        } else if (reais < 1000000) {
            let m = Math.floor(reais / 1000);
            let r = reais % 1000;
            extenso = (m === 1 ? 'mil' : formatarParte(m) + ' mil');
            if (r > 0) {
                extenso += (r <= 100 || r % 100 === 0 ? ' e ' : ' ') + formatarParte(r);
            }
        } else {
            // Suporte básico até 999.999.999, para recibos comuns é suficiente
            extenso = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            return extenso;
        }
        extenso += (reais === 1 ? ' real' : ' reais');
    }

    if (centavos > 0) {
        if (extenso !== '') extenso += ' e ';
        extenso += formatarParte(centavos) + (centavos === 1 ? ' centavo' : ' centavos');
    }

    return extenso.charAt(0).toUpperCase() + extenso.slice(1);
}

/**
 * Formata um valor numérico ou string para o padrão de moeda brasileiro (BRL) para inputs.
 * @param {string|number} valor 
 * @returns {string} - Ex: "1.250,50"
 */
export function formatCurrencyBRL(valor) {
    if (valor === null || valor === undefined) return '';
    
    // Remove tudo que não é dígito
    let v = String(valor).replace(/\D/g, '');
    
    // Converte para centavos
    v = (Number(v) / 100).toFixed(2).replace('.', ',');
    
    // Adiciona separador de milhar
    return v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Converte uma string formatada em BRL de volta para um número decimal.
 * @param {string} valor - Ex: "1.250,50"
 * @returns {number} - Ex: 1250.50
 */
export function parseCurrencyBRL(valor) {
    if (!valor) return 0;
    return parseFloat(String(valor).replace(/\./g, '').replace(',', '.')) || 0;
}
/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export function maskCPF(value) {
    if (!value) return '';
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

/**
 * Aplica máscara de Telefone celular ( (11) 99999-0000 )
 */
export function maskPhone(value) {
    if (!value) return '';
    let r = value.replace(/\D/g, '');
    r = r.replace(/^0/, '');
    if (r.length > 10) {
        r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (r.length > 5) {
        r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (r.length > 2) {
        r = r.replace(/^(\d\d)(\d{0,5})/, '($1) $2');
    } else if (r.length > 0) {
        r = r.replace(/^(\d*)/, '($1');
    }
    return r;
}

/**
 * Aplica máscara de CEP (00000-000)
 */
export function maskCEP(value) {
    if (!value) return '';
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
}

/**
 * Formata um nome para Title Case, ignorando preposições.
 * Ex: "JOÃO DA SILVA" -> "João da Silva"
 */
export function formatNameCase(str) {
    if (!str) return '';
    const preposicoes = ['da', 'de', 'do', 'das', 'dos', 'e'];
    return str.toLowerCase().split(' ').map((word, index) => {
        if (word.length <= 3 && preposicoes.includes(word) && index !== 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

/**
 * Calcula a idade a partir de uma data de nascimento.
 */
export function calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date();
    const bDay = new Date(birthDate);
    let age = today.getFullYear() - bDay.getFullYear();
    const m = today.getMonth() - bDay.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDay.getDate())) {
        age--;
    }
    return age;
}
