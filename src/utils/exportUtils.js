import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { 
  Document, Packer, Paragraph, TextRun, AlignmentType, 
  Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';

// Cores Institucionais Exatas
const COLORS = {
  primary: "8b5cf6",     // Violet 500 (Marca)
  textDark: "0f172a",    // Slate 900 (Títulos/Corpo)
  textMuted: "64748b",   // Slate 500 (Labels de Identificação)
  textLight: "94a3b8",   // Slate 400 (Labels discretas e rodapé)
  bgCard: "f8fafc",      // Slate 50 (Fundo dos cartões)
  borderCard: "f1f5f9"   // Slate 100 (Bordas dos cartões)
};

export const exportToPDF = async (originalElement, filename = 'documento.pdf') => {
  if (!originalElement) return;

  console.log('Iniciando exportação PDF via Sandbox...');

  // 1. Criar Sandbox (Container visível mas fora da tela)
  const sandbox = document.createElement('div');
  
  // Adicionar fontes do Google no sandbox para garantir renderização de ícones
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block';
  document.head.appendChild(fontLink);

  Object.assign(sandbox.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: '794px',
    backgroundColor: 'white',
    zIndex: '9999',
    padding: '50px', // Aumentado para margens A4 mais elegantes
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    textRendering: 'optimizeLegibility',
    webkitFontSmoothing: 'antialiased'
  });

  // 2. Clonar o elemento
  const clone = originalElement.cloneNode(true);
  
  // 3. Forçar visibilidade no clone e remover classes que ocultam
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.opacity = '1';
  clone.classList.remove('hidden', 'invisible', 'opacity-0');

  // NOVO: Forçar exibição de elementos que são "print only" no Tailwind
  const printOnly = clone.querySelectorAll('.print\\:block, .print\\:flex, .print\\:grid, .print\\:inline-block');
  printOnly.forEach(el => {
    el.classList.remove('hidden');
    if (el.classList.contains('print:block')) el.style.setProperty('display', 'block', 'important');
    if (el.classList.contains('print:flex')) el.style.setProperty('display', 'flex', 'important');
    if (el.classList.contains('print:grid')) el.style.setProperty('display', 'grid', 'important');
    if (el.classList.contains('print:inline-block')) el.style.setProperty('display', 'inline-block', 'important');
  });
  
  // 4. Tratamento especial para INPUTS e TEXTAREAS (Capturar valores)
  // html-to-image muitas vezes não captura o valor atual de inputs clonados
  const originalInputs = originalElement.querySelectorAll('input, textarea, select');
  const clonedInputs = clone.querySelectorAll('input, textarea, select');
  
  clonedInputs.forEach((input, i) => {
    const val = originalInputs[i].value;
    const parent = input.parentNode;
    const span = document.createElement('span');
    
    // Copiar estilos básicos para o span manter o layout
    const style = window.getComputedStyle(originalInputs[i]);
    span.textContent = val || '';
    span.style.fontWeight = style.fontWeight; // Manter o peso original (Evitar bold forçado)
    span.style.borderBottom = input.style.borderBottom;
    span.style.paddingLeft = '4px';
    span.style.paddingRight = '4px';
    span.style.display = 'inline-block';
    if (input.style.width) span.style.width = input.style.width;
    
    parent.replaceChild(span, input);
  });

  // Remover elementos indesejados no PDF (botões, etc)
  const toRemove = clone.querySelectorAll('.print\\:hidden, button, .no-print');
  toRemove.forEach(el => el.remove());

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    // 5. Correção Global de Cores OKLCH (Incompatibilidade Tailwind 4)
    const allElems = [clone, ...clone.querySelectorAll('*')];
    allElems.forEach(el => {
      const style = window.getComputedStyle(el);
      
      const fixProp = (prop, fallback) => {
        const val = style[prop];
        // Se a cor for oklch ou se o canvas estiver falhando, forçamos RGB
        if (val && (val.includes('oklch') || val === 'rgba(0, 0, 0, 0)' || val === 'transparent')) {
          if (prop === 'backgroundColor') {
             // Se for fundo transparente em um div que deveria ter cor de card
             if (el.classList.contains('bg-slate-50')) el.style.backgroundColor = '#f8fafc';
             else if (el.classList.contains('bg-primary')) el.style.backgroundColor = '#8b5cf6';
             else if (el.classList.contains('bg-white')) el.style.backgroundColor = '#ffffff';
          }
          if (prop === 'color') {
             if (el.classList.contains('text-primary')) el.style.color = '#8b5cf6';
             else el.style.color = '#1e293b'; // Slate 800 padrão
          }
          if (prop === 'borderColor') el.style.borderColor = '#e2e8f0';
        }
      };

      fixProp('backgroundColor');
      fixProp('color');
      fixProp('borderColor');
      
      // Garantir fontes (Sem sobrescrever ícones)
      if (el instanceof HTMLElement && !el.classList.contains('material-symbols-outlined')) {
        el.style.fontFamily = "'Inter', ui-sans-serif, system-ui, sans-serif";
      }
    });

    // Esperar renderização e fontes
    await new Promise(resolve => setTimeout(resolve, 800));

    // 6. Captura Real
    const dataUrl = await toPng(clone, {
      pixelRatio: 2, // Aumentado para nitidez
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: {
        transform: 'none',
        margin: '0',
        width: '800px'
      }
    });

    // 7. Gerar PDF com suporte a múltiplas páginas
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Proporção: Largura do clone (794px) vs Largura do PDF (210mm)
    // 794px / 210mm = 3.78 px/mm
    const imgWidth = 794;
    const imgHeight = clone.offsetHeight;
    
    // Altura total do conteúdo em mm no PDF
    const totalPdfHeightMM = (imgHeight * pdfWidth) / imgWidth;
    
    let heightLeft = totalPdfHeightMM;
    let position = 0;

    // Adicionar primeira página
    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, totalPdfHeightMM);
    heightLeft -= pdfHeight;

    // Adicionar páginas extras se necessário
    while (heightLeft > 0) {
      position = heightLeft - totalPdfHeightMM;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, totalPdfHeightMM);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
    
    console.log('PDF gerado com sucesso.');

  } catch (error) {
    console.error('Erro crítico na exportação PDF:', error);
    throw new Error('Não foi possível gerar o PDF. Tente salvar pela função de impressão (Ctrl+P).');
  } finally {
    if (document.body.contains(sandbox)) {
      document.body.removeChild(sandbox);
    }
  }
};

/**
 * Exporta dados de um documento para Word (.docx) com Visual de Alta Fidelidade (Paridade PDF)
 */
export const exportToWord = async (data, filename = 'documento.docx') => {
  const { titulo, subtitulo, paciente, secoes, profissional, dataEmissao } = data;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            size: 20, // 10pt
            font: "Arial",
            color: COLORS.textDark,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 900, right: 900, bottom: 900, left: 900 },
          },
        },
        children: [
          // --- CABEÇALHO SUPERIOR (Marca + Categoria) ---
          // --- CABEÇALHO SUPERIOR (Categoria do Documento) ---
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: titulo.toUpperCase(), bold: true, size: 28, color: COLORS.textDark }),
            ],
          }),

          new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),

          // --- CARTÃO DE IDENTIFICAÇÃO (Estilo Card PDF) ---
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: "f8fafc", type: "clear" },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "e2e8f0" },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "e2e8f0" },
              left: { style: BorderStyle.SINGLE, size: 2, color: "e2e8f0" },
              right: { style: BorderStyle.SINGLE, size: 2, color: "e2e8f0" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "f1f5f9" },
              insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "f1f5f9" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 200, bottom: 100, left: 300, right: 200 },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "PACIENTE", size: 14, color: COLORS.textMuted, bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: paciente.nome.toUpperCase(), bold: true, size: 20 })] }),
                    ],
                  }),
                  new TableCell({
                    margins: { top: 200, bottom: 100, left: 300, right: 200 },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "CPF", size: 14, color: COLORS.textMuted, bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: paciente.cpf || "—", bold: true, size: 20 })] }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 100, bottom: 200, left: 300, right: 200 },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "DATA DE NASCIMENTO", size: 14, color: COLORS.textMuted, bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: paciente.nascimento || "—", bold: true, size: 20 })] }),
                    ],
                  }),
                  new TableCell({
                    margins: { top: 100, bottom: 200, left: 300, right: 200 },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "DATA DE EMISSÃO", size: 14, color: COLORS.textMuted, bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: dataEmissao || new Date().toLocaleDateString('pt-BR'), bold: true, size: 20 })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // --- TÍTULO CENTRAL (Destaque Principal) ---
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 400 },
            children: [
              new TextRun({ 
                text: titulo.split('')[0] === 'A' ? 'ATESTADO' : titulo.toUpperCase(), 
                bold: true, 
                size: 28, 
                color: COLORS.textDark, 
                characterSpacing: 10 
              }),
            ],
          }),

          // --- CONTEÚDO (Com barra lateral colorida) ---
          ...secoes.flatMap(secao => {
            const lines = secao.conteudo.split('\n').filter(l => l.trim());
            return [
              new Paragraph({
                children: [
                  new TextRun({ text: secao.titulo.toUpperCase(), bold: true, size: 24, color: COLORS.textDark }),
                ],
                spacing: { before: 300, after: 150 },
                border: {
                  left: { color: COLORS.primary, space: 15, style: "single", size: 36 },
                },
              }),
              ...lines.map(line => new Paragraph({
                text: line,
                alignment: AlignmentType.JUSTIFY,
                spacing: { after: 150, line: 320 },
              }))
            ];
          }),

          // --- ASSINATURA ---
          new Paragraph({ text: "", spacing: { before: 1000 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `____________________, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, size: 18, color: COLORS.textDark }),
            ],
            spacing: { after: 1200 },
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: "f8fafc", type: "clear" },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "e2e8f0" },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "e2e8f0" },
              left: { style: BorderStyle.SINGLE, size: 2, color: "e2e8f0" },
              right: { style: BorderStyle.SINGLE, size: 2, color: "e2e8f0" },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "__________________________________________", color: COLORS.textDark }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: profissional.nome, bold: true, size: 24 }),
                        ],
                        spacing: { before: 100 },
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: `${profissional.especialidade ? profissional.especialidade + ' | ' : ''}CRP ${profissional.crp}`, size: 16, color: COLORS.textMuted, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "Assinado digitalmente via Meu Sistema Psi", bold: true, size: 12, color: COLORS.primary }),
                        ],
                        spacing: { before: 150 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // --- RODAPÉ ---
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 1000 },
            children: [
              new TextRun({
                text: "Este atestado é um documento sigiloso. Sua divulgação não autorizada constitui infração ética.",
                size: 14,
                color: COLORS.textLight,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Emitido conforme a Lei nº 4.119/62, Resolução CFP nº 06/2019 e Código de Ética do Psicólogo (Resolução CFP nº 010/2005).",
                size: 14,
                color: COLORS.textLight,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};

/**
 * Exporta dados de relatório estatístico para Word (.docx) estruturado
 */
export const exportRelatorioToWord = async (stats, filename = 'relatorio_desempenho.docx') => {
  const { consultasMes, taxaComparecimento, novosPacientes, receitaMedia, historicoConsultas, distribuicaoTipo } = stats;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { size: 20, font: "Segoe UI", color: COLORS.textDark },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } },
        },
        children: [
          // Título
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({ text: "RELATÓRIO DE DESEMPENHO CLÍNICO", bold: true, size: 32, color: COLORS.primary }),
            ],
          }),

          // Data de Emissão
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 600 },
            children: [
              new TextRun({ text: `Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, size: 16, color: COLORS.textLight }),
            ],
          }),

          // Métrica Principais
          new Paragraph({
            children: [new TextRun({ text: "MÉTRICAS DO MÊS", bold: true, size: 22, color: COLORS.textDark })],
            spacing: { after: 200 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: COLORS.bgCard },
            borders: BorderStyle.NONE,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ margins: { top: 200, bottom: 200, left: 200 }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Consultas no Mês", size: 16, color: COLORS.textMuted, bold: true })] }),
                    new Paragraph({ children: [new TextRun({ text: String(consultasMes), bold: true, size: 28 })] }),
                  ] }),
                  new TableCell({ margins: { top: 200, bottom: 200, left: 200 }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Taxa de Comparecimento", size: 16, color: COLORS.textMuted, bold: true })] }),
                    new Paragraph({ children: [new TextRun({ text: String(taxaComparecimento), bold: true, size: 28 })] }),
                  ] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ margins: { top: 200, bottom: 200, left: 200 }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Novos Pacientes", size: 16, color: COLORS.textMuted, bold: true })] }),
                    new Paragraph({ children: [new TextRun({ text: String(novosPacientes), bold: true, size: 28 })] }),
                  ] }),
                  new TableCell({ margins: { top: 200, bottom: 200, left: 200 }, children: [
                    new Paragraph({ children: [new TextRun({ text: "Receita Média/Sessão", size: 16, color: COLORS.textMuted, bold: true })] }),
                    new Paragraph({ children: [new TextRun({ text: String(receitaMedia), bold: true, size: 28 })] }),
                  ] }),
                ]
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),

          // Seção 2: Crescimento de Consultas
          new Paragraph({
            children: [new TextRun({ text: "CRESCIMENTO DE CONSULTAS", bold: true, size: 22, color: COLORS.textDark })],
            spacing: { after: 200 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ 
                    shading: { fill: COLORS.primary }, 
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MÊS", bold: true, color: "ffffff" })] })] 
                  }),
                  new TableCell({ 
                    shading: { fill: COLORS.primary }, 
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "QUANTIDADE", bold: true, color: "ffffff" })] })] 
                  }),
                ]
              }),
              ...historicoConsultas.map(v => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: v.label.toUpperCase(), alignment: AlignmentType.CENTER, bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: String(v.value), alignment: AlignmentType.CENTER })] }),
                ]
              }))
            ]
          }),

          new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),

          // Seção 3: Mix de Atendimento
          new Paragraph({
            children: [new TextRun({ text: "MIX DE ATENDIMENTO", bold: true, size: 22, color: COLORS.textDark })],
            spacing: { after: 200 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ 
                    shading: { fill: COLORS.primary }, 
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MODALIDADE", bold: true, color: "ffffff" })] })] 
                  }),
                  new TableCell({ 
                    shading: { fill: COLORS.primary }, 
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PORCENTUAL", bold: true, color: "ffffff" })] })] 
                  }),
                ]
              }),
              ...distribuicaoTipo.map(t => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: t.label.toUpperCase(), alignment: AlignmentType.CENTER, bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: `${t.pct}%`, alignment: AlignmentType.CENTER })] }),
                ]
              }))
            ]
          }),
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};


