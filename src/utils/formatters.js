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


