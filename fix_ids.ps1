$files = @{
    'src\pages\TermoConsentimento.jsx' = 'TCLE'
    'src\pages\EncaminhamentoProfissional.jsx' = 'ENC'
    'src\pages\DeclaracaoComparecimento.jsx' = 'DEC'
    'src\pages\AtestadoSaudeMental.jsx' = 'ATE'
}

foreach ($entry in $files.GetEnumerator()) {
    $f = $entry.Key
    $pfx = $entry.Value
    $c = Get-Content $f -Raw -Encoding UTF8
    
    # Add import if not present
    if ($c -notmatch 'formatDisplayId') {
        $c = $c -replace "(import \{ exportToPDF, exportToWord \} from '../utils/exportUtils';)", "`$1`nimport { formatDisplayId, formatFileId } from '../utils/formatId';"
    }
    
    # Fix filenames: dados.documentoId || 'novo' -> formatFileId(dados.documentoId)
    $c = $c -replace '\$\{dados\.documentoId \|\| ''novo''\}', '${formatFileId(dados.documentoId)}'
    
    # Fix document headers: Documento ID: #${dados.documentoId || 'Novo'} -> Documento: ${formatDisplayId(...)}
    $c = $c -replace "Documento ID: #\`$\{dados\.documentoId \|\| 'Novo'\}", "Documento: `${formatDisplayId(dados.documentoId, '$pfx')}"
    $c = $c -replace "Documento ID: \`$\{dados\.documentoId \|\| 'Novo'\}", "Documento: `${formatDisplayId(dados.documentoId, '$pfx')}"
    
    # Fix WhatsApp text: (dados.documentoId || 'novo') -> (formatDisplayId(...))
    $c = $c -replace "\(dados\.documentoId \|\| 'novo'\)", "(formatDisplayId(dados.documentoId, '$pfx'))"
    
    # Fix subtitle: Documento ${dados.documentoId || ''} -> Documento ${formatDisplayId(...)}
    $c = $c -replace "Documento \`$\{dados\.documentoId \|\| ''\}", "Documento `${formatDisplayId(dados.documentoId, '$pfx')}"
    
    # Fix patient ID in dropdown: {p.id} -> {formatDisplayId(p.id, 'PAC')}  
    $c = $c -replace '\{p\.id\} ', '{formatDisplayId(p.id, ''PAC'')} '
    
    # Fix patient ID display: {dados.pacienteId} in JSX
    $c = $c -replace '>\{dados\.pacienteId\}', '>{formatDisplayId(dados.pacienteId, ''PAC'')}'
    
    Set-Content $f $c -Encoding UTF8 -NoNewline
    Write-Host "Updated: $f with prefix $pfx"
}
