export function calcularCRC16(payload) {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) > 0) crc = (crc << 1) ^ 0x1021;
            else crc = crc << 1;
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

export function formatarTamanho(valor) {
    if (!valor) return "00";
    const len = String(valor).length;
    return len.toString().padStart(2, '0') + valor;
}

export function gerarCadeiaPix({ chave, valor, recebedor, cidade = "MARINGA", txid = "Meu Sistema PSI" }) {
    if (!chave) return '';
    
    // Remove espaços, traços, etc da chave.
    const chaveLimpa = String(chave).replace(/[^\w]/g, ''); 
    const valorNum = parseFloat(valor).toFixed(2);

    let payloadFormat = "000201";
    
    // 26 indica arranjo de pagamento (br.gov.bcb.pix)
    let merchantAccount = "26" + formatarTamanho("0014br.gov.bcb.pix01" + formatarTamanho(chaveLimpa));
    let merchantCategCode = "52040000";
    let transactionCurrency = "5303986";
    let transactionAmount = "54" + formatarTamanho(valorNum);
    let countryCode = "5802BR";
    
    // Normalizar nome (remover acentos)
    const nomeNorm = recebedor 
        ? recebedor.substring(0, 25).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        : "PROFISSIONAL";
    let merchantName = "59" + formatarTamanho(nomeNorm);
    
    const cidadeNorm = cidade 
        ? cidade.substring(0, 15).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        : "MARINGA";
    let merchantCity = "60" + formatarTamanho(cidadeNorm);
    
    let addDataField = "62" + formatarTamanho("05" + formatarTamanho(txid.substring(0, 25).toUpperCase()));
    
    let payload = payloadFormat + merchantAccount + merchantCategCode + transactionCurrency + transactionAmount + countryCode + merchantName + merchantCity + addDataField + "6304";
    
    return payload + calcularCRC16(payload);
}


