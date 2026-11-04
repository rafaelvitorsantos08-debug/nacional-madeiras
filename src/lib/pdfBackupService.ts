import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Company Branding Colors
const BRAND_GREEN: [number, number, number] = [22, 101, 52];     // #166534
const BRAND_DARK: [number, number, number] = [15, 23, 42];       // #0f172a
const ACCENT_ORANGE: [number, number, number] = [234, 88, 12];   // #ea580c
const ACCENT_BLUE: [number, number, number] = [37, 99, 235];     // #2563eb
const GRAY_BG: [number, number, number] = [248, 250, 252];       // #f8fafc

const DIAS_SEMANA_MAP: Record<number, string> = {
  0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb'
};

const MESES_NOMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Adds an official Nacional Madeiras branded header to any PDF.
 */
function addDocumentHeader(
  doc: jsPDF,
  title: string,
  subtitle?: string,
  orientation: 'p' | 'l' = 'l'
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Top header banner background
  doc.setFillColor(...BRAND_GREEN);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Accent thin stripe
  doc.setFillColor(...ACCENT_ORANGE);
  doc.rect(0, 24, pageWidth, 2, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('NACIONAL MADEIRAS - KIT PORTA', 14, 11);

  // Subtitle / Document Title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title.toUpperCase(), 14, 18);

  // Timestamp & Metadata (Right Aligned)
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(8);
  doc.text(`Backup Oficial Emitido em: ${dateStr} às ${timeStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.text('Sistema de Gestão & Sincronização em Tempo Real', pageWidth - 14, 18, { align: 'right' });

  // Optional subtitle banner below header
  if (subtitle) {
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(subtitle, 14, 33);
  }
}

/**
 * Adds footer with page numbering and security notice on all pages.
 */
function addDocumentFooter(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Nacional Madeiras - Kit Porta | Documento para fins de backup e conferência interna', 14, pageHeight - 7);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }
}

/**
 * 1. BACKUP PDF: CONTROLE DE SAÍDAS (Formatado em A4 Paisagem)
 */
export function exportControleSaidasPdf(
  saidasData: Record<string, any>,
  options?: { filterMonth?: number; filterYear?: number; titleSuffix?: string }
): boolean {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const safeData = (saidasData && typeof saidasData === 'object') ? saidasData : {};

    // Sort dates chronologically
    let sortedDates = Object.keys(safeData).sort();

    if (options?.filterYear !== undefined && options?.filterMonth !== undefined) {
      const prefix = `${options.filterYear}-${String(options.filterMonth + 1).padStart(2, '0')}`;
      sortedDates = sortedDates.filter(d => d.startsWith(prefix));
    }

    const docTitle = 'Relatório & Backup Oficial: Controle de Saídas de Materiais';
    const subTitle = options?.filterMonth !== undefined && options?.filterYear !== undefined
      ? `Período: ${MESES_NOMES[options.filterMonth]} de ${options.filterYear} (Total de ${sortedDates.length} dias)`
      : `Período Completo no Sistema (Total de ${sortedDates.length} dias registrados)`;

    addDocumentHeader(doc, docTitle, subTitle, 'l');

    // Totals counters
    let totKits = 0;
    let totAlizares = 0;
    let totFolhas = 0;
    let totAduelas = 0;
    let totRodapes = 0;
    let totPaineis = 0;

    const tableRows = sortedDates.map(dateStr => {
      const row = safeData[dateStr] || {};
      const [ano, mes, dia] = dateStr.split('-').map(Number);
      const dObj = new Date(ano, mes - 1, dia);
      const ds = DIAS_SEMANA_MAP[dObj.getDay()] || '';
      const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;
      const dateDisplay = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;

      const e1_desc = String(row.e1_desc || '').trim();
      const e1_kits = parseInt(row.e1_kits || '0') || 0;
      const e1_aliz = parseInt(row.e1_alizares || '0') || 0;
      const e1_folhas = parseInt(row.e1_folhas || '0') || 0;
      const e1_aduelas = parseInt(row.e1_aduelas || '0') || 0;
      const e1_rod = parseInt(row.e1_rodapes || '0') || 0;
      const e1_pain = parseInt(row.e1_paineis || '0') || 0;

      const e2_desc = String(row.e2_desc || '').trim();
      const e2_kits = parseInt(row.e2_kits || '0') || 0;
      const e2_aliz = parseInt(row.e2_alizares || '0') || 0;
      const e2_folhas = parseInt(row.e2_folhas || '0') || 0;
      const e2_aduelas = parseInt(row.e2_aduelas || '0') || 0;
      const e2_rod = parseInt(row.e2_rodapes || '0') || 0;
      const e2_pain = parseInt(row.e2_paineis || '0') || 0;

      if (!isWeekend) {
        totKits += (e1_kits + e2_kits);
        totAlizares += (e1_aliz + e2_aliz);
        totFolhas += (e1_folhas + e2_folhas);
        totAduelas += (e1_aduelas + e2_aduelas);
        totRodapes += (e1_rod + e2_rod);
        totPaineis += (e1_pain + e2_pain);
      }

      // Collect comments
      const comments: string[] = [];
      Object.entries(row).forEach(([k, v]) => {
        if (k.startsWith('comm_') && v) {
          const fieldName = k.replace('comm_', '');
          comments.push(`${fieldName}: ${v}`);
        }
      });
      const obsStr = comments.join(' | ');

      return [
        ds,
        dateDisplay,
        isWeekend ? (dObj.getDay() === 6 ? 'SÁBADO' : 'DOMINGO') : (e1_desc || '-'),
        isWeekend ? '' : (e1_kits > 0 ? e1_kits : ''),
        isWeekend ? '' : (e1_aliz > 0 ? e1_aliz : ''),
        isWeekend ? '' : (e1_folhas > 0 ? e1_folhas : ''),
        isWeekend ? '' : (e1_aduelas > 0 ? e1_aduelas : ''),
        isWeekend ? '' : (e1_rod > 0 ? e1_rod : ''),
        isWeekend ? '' : (e1_pain > 0 ? e1_pain : ''),
        isWeekend ? (dObj.getDay() === 6 ? 'SÁBADO' : 'DOMINGO') : (e2_desc || '-'),
        isWeekend ? '' : (e2_kits > 0 ? e2_kits : ''),
        isWeekend ? '' : (e2_aliz > 0 ? e2_aliz : ''),
        isWeekend ? '' : (e2_folhas > 0 ? e2_folhas : ''),
        isWeekend ? '' : (e2_aduelas > 0 ? e2_aduelas : ''),
        isWeekend ? '' : (e2_rod > 0 ? e2_rod : ''),
        isWeekend ? '' : (e2_pain > 0 ? e2_pain : ''),
        obsStr
      ];
    });

    // Summary KPI Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 38, 269, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`TOTAIS ACUMULADOS:   Kits: ${totKits}   |   Alizares: ${totAlizares}   |   Folhas: ${totFolhas}   |   Aduelas: ${totAduelas}   |   Rodapés: ${totRodapes}   |   Painéis: ${totPaineis}`, 18, 47);

    autoTable(doc, {
      startY: 56,
      head: [
        [
          { content: 'D/S', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [30, 41, 59] } },
          { content: 'DATA', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [30, 41, 59] } },
          { content: 'ENTREGA 1', colSpan: 7, styles: { halign: 'center', fillColor: [234, 88, 12] } },
          { content: 'ENTREGA 2', colSpan: 7, styles: { halign: 'center', fillColor: [22, 101, 52] } },
          { content: 'OBSERVAÇÕES', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [71, 85, 105] } },
        ],
        [
          // Entrega 1 subheaders
          { content: 'Obra / Descrição', styles: { fillColor: [249, 115, 22] } },
          { content: 'Kit', styles: { halign: 'center', fillColor: [249, 115, 22] } },
          { content: 'Aliz', styles: { halign: 'center', fillColor: [249, 115, 22] } },
          { content: 'Folh', styles: { halign: 'center', fillColor: [249, 115, 22] } },
          { content: 'Adu', styles: { halign: 'center', fillColor: [249, 115, 22] } },
          { content: 'Rod', styles: { halign: 'center', fillColor: [249, 115, 22] } },
          { content: 'Pain', styles: { halign: 'center', fillColor: [249, 115, 22] } },
          // Entrega 2 subheaders
          { content: 'Obra / Descrição', styles: { fillColor: [34, 197, 94] } },
          { content: 'Kit', styles: { halign: 'center', fillColor: [34, 197, 94] } },
          { content: 'Aliz', styles: { halign: 'center', fillColor: [34, 197, 94] } },
          { content: 'Folh', styles: { halign: 'center', fillColor: [34, 197, 94] } },
          { content: 'Adu', styles: { halign: 'center', fillColor: [34, 197, 94] } },
          { content: 'Rod', styles: { halign: 'center', fillColor: [34, 197, 94] } },
          { content: 'Pain', styles: { halign: 'center', fillColor: [34, 197, 94] } },
        ]
      ],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        valign: 'middle',
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      },
      headStyles: {
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7,
        cellPadding: 1.5
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 16, halign: 'center' },
        2: { cellWidth: 32 },
        3: { cellWidth: 8, halign: 'center' },
        4: { cellWidth: 8, halign: 'center' },
        5: { cellWidth: 8, halign: 'center' },
        6: { cellWidth: 8, halign: 'center' },
        7: { cellWidth: 8, halign: 'center' },
        8: { cellWidth: 8, halign: 'center' },
        9: { cellWidth: 32 },
        10: { cellWidth: 8, halign: 'center' },
        11: { cellWidth: 8, halign: 'center' },
        12: { cellWidth: 8, halign: 'center' },
        13: { cellWidth: 8, halign: 'center' },
        14: { cellWidth: 8, halign: 'center' },
        15: { cellWidth: 8, halign: 'center' },
        16: { cellWidth: 'auto' }
      },
      didParseCell: (data) => {
        // Highlight weekends in light red
        const row = data.row.raw as any[];
        if (row && (row[0] === 'Sáb' || row[0] === 'Dom')) {
          if (data.section === 'body') {
            data.cell.styles.fillColor = [254, 242, 242];
            data.cell.styles.textColor = [185, 28, 28];
          }
        }
      }
    });

    addDocumentFooter(doc);

    const filename = options?.filterMonth !== undefined && options?.filterYear !== undefined
      ? `Nacional_Madeiras_Controle_Saidas_${options.filterYear}_${String(options.filterMonth + 1).padStart(2, '0')}.pdf`
      : `Nacional_Madeiras_Controle_Saidas_Completo.pdf`;

    doc.save(filename);
    return true;
  } catch (err) {
    console.error('Erro ao exportar PDF de Controle de Saídas:', err);
    return false;
  }
}

/**
 * 2. BACKUP PDF: OPERAÇÃO DA PRODUÇÃO (Formatado em A4 Paisagem)
 */
export function exportOperacaoProducaoPdf(
  operacaoData: Record<string, any>,
  colaboradoresList: string[] = [],
  options?: { filterMonth?: number; filterYear?: number }
): boolean {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const safeData = (operacaoData && typeof operacaoData === 'object') ? operacaoData : {};

    let sortedDates = Object.keys(safeData).sort();

    if (options?.filterYear !== undefined && options?.filterMonth !== undefined) {
      const prefix = `${options.filterYear}-${String(options.filterMonth + 1).padStart(2, '0')}`;
      sortedDates = sortedDates.filter(d => d.startsWith(prefix));
    }

    const docTitle = 'Relatório & Backup Oficial: Operação da Produção & Efetivo Diário';
    const subTitle = options?.filterMonth !== undefined && options?.filterYear !== undefined
      ? `Período: ${MESES_NOMES[options.filterMonth]} de ${options.filterYear} (Total de ${sortedDates.length} dias)`
      : `Período Completo no Sistema (Total de ${sortedDates.length} dias registrados)`;

    addDocumentHeader(doc, docTitle, subTitle, 'l');

    let totalProduzido = 0;
    let diasTrabalhados = 0;

    const tableRows = sortedDates.map(dateStr => {
      const row = safeData[dateStr] || {};
      const [ano, mes, dia] = dateStr.split('-').map(Number);
      const dObj = new Date(ano, mes - 1, dia);
      const ds = DIAS_SEMANA_MAP[dObj.getDay()] || '';
      const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;
      const dateDisplay = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;

      const qtd = parseInt(row.quantidade || '0') || 0;
      if (!isWeekend && qtd > 0) {
        totalProduzido += qtd;
        diasTrabalhados++;
      }

      // Efetivo count
      let efetivoNum = row.efetivo || '';
      const assignments: string[] = [];

      // Check colaborador statuses
      (colaboradoresList || []).forEach(colab => {
        const status = row[`efetivo_colab_${colab}`];
        if (status) {
          assignments.push(`${colab}: ${status}`);
        }
      });

      // Sector numeric counts
      const SETORES = ['Separação', 'Aplicação de Perfil', 'Usinagem de Porta', 'Embalagem', 'CNC', 'Marcenaria', 'Usinagem de Aduelas', 'Montagem', 'Entrega', 'Pintura', 'Almoxarife'];
      SETORES.forEach(sec => {
        const val = row[`efetivo_${sec}`];
        if (val && parseInt(val) > 0) {
          assignments.push(`${sec}: ${val}`);
        }
      });

      return [
        ds,
        dateDisplay,
        isWeekend ? (dObj.getDay() === 6 ? 'SÁBADO' : 'DOMINGO') : (qtd > 0 ? qtd : '-'),
        isWeekend ? '-' : (efetivoNum || (assignments.length > 0 ? assignments.length : '-')),
        isWeekend ? '-' : (assignments.length > 0 ? assignments.join(' | ') : 'Sem anotações detalhadas de efetivo')
      ];
    });

    // Summary Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 38, 269, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const media = diasTrabalhados > 0 ? Math.round(totalProduzido / diasTrabalhados) : 0;
    doc.text(`TOTAIS DA PRODUÇÃO:   Total de Kits Montados: ${totalProduzido}   |   Dias com Produção: ${diasTrabalhados}   |   Média Diária: ${media} kits/dia`, 18, 47);

    autoTable(doc, {
      startY: 56,
      head: [
        [
          { content: 'D/S', styles: { halign: 'center', fillColor: [30, 41, 59], cellWidth: 14 } },
          { content: 'DATA', styles: { halign: 'center', fillColor: [30, 41, 59], cellWidth: 22 } },
          { content: 'KITS MONTADOS', styles: { halign: 'center', fillColor: [37, 99, 235], cellWidth: 30 } },
          { content: 'EFETIVO TOTAL', styles: { halign: 'center', fillColor: [16, 185, 129], cellWidth: 26 } },
          { content: 'DISTRIBUIÇÃO POR SETOR / COLABORADORES', styles: { fillColor: [71, 85, 105] } },
        ]
      ],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        valign: 'middle',
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      },
      headStyles: {
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 2
      },
      didParseCell: (data) => {
        const row = data.row.raw as any[];
        if (row && (row[0] === 'Sáb' || row[0] === 'Dom')) {
          if (data.section === 'body') {
            data.cell.styles.fillColor = [254, 242, 242];
            data.cell.styles.textColor = [185, 28, 28];
          }
        }
      }
    });

    addDocumentFooter(doc);

    const filename = options?.filterMonth !== undefined && options?.filterYear !== undefined
      ? `Nacional_Madeiras_Operacao_Producao_${options.filterYear}_${String(options.filterMonth + 1).padStart(2, '0')}.pdf`
      : `Nacional_Madeiras_Operacao_Producao_Completo.pdf`;

    doc.save(filename);
    return true;
  } catch (err) {
    console.error('Erro ao exportar PDF de Operação da Produção:', err);
    return false;
  }
}

/**
 * 3. BACKUP PDF: ENTRADA / SAÍDA DE OBRAS - OBRA POR OBRA (Formatado em A4 Paisagem)
 */
export function exportEntradaSaidaObrasPdf(
  obrasData: Record<string, any>,
  options?: { obraId?: string }
): boolean {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const safeData = (obrasData && typeof obrasData === 'object') ? obrasData : {};

    let obrasEntries = Object.entries(safeData);
    if (options?.obraId) {
      obrasEntries = obrasEntries.filter(([id]) => id === options.obraId);
    }

    if (obrasEntries.length === 0) {
      alert('Nenhuma obra encontrada para exportação.');
      return false;
    }

    // Sort obras alphabetically by name
    obrasEntries.sort((a, b) => {
      const nomeA = (a[1]?.nome || a[0]).toLowerCase();
      const nomeB = (b[1]?.nome || b[0]).toLowerCase();
      return nomeA.localeCompare(nomeB);
    });

    const docTitle = 'Relatório & Backup Oficial: Entrada e Saída de Materiais por Obra';
    const subTitle = `Controle Completo Obra por Obra - Folhas, Aduelas, Alizares e Correr (${obrasEntries.length} obras cadastradas)`;

    let isFirstPage = true;

    obrasEntries.forEach(([obraId, obra], obraIdx) => {
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      const obraNome = String(obra?.nome || obraId).toUpperCase();
      addDocumentHeader(doc, docTitle, `OBRA [${obraIdx + 1} de ${obrasEntries.length}]: ${obraNome}`, 'l');

      let currentY = 40;

      // Helper to render a category table (Folhas, Aduelas, Alizares, Correr)
      const renderCategoryTable = (
        categoryTitle: string,
        categoryColor: [number, number, number],
        items: any[] = [],
        cargasEntrada: any[] = [],
        cargasSaida: any[] = [],
        isFolhas: boolean = false
      ) => {
        if (!items || items.length === 0) return;

        // Subheader for Category
        doc.setFillColor(...categoryColor);
        doc.rect(14, currentY, doc.internal.pageSize.getWidth() - 28, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(`${categoryTitle.toUpperCase()} - ${obraNome}`, 18, currentY + 4.2);
        currentY += 8;

        // Table headers
        const headRow1: any[] = [
          { content: 'ESPECIFICAÇÃO DO PRODUTO', colSpan: isFolhas ? 4 : 2, styles: { halign: 'center', fillColor: [30, 41, 59] } },
        ];

        const headRow2: any[] = [];
        if (isFolhas) {
          headRow2.push({ content: 'Dimensão', styles: { fillColor: [51, 65, 85] } });
          headRow2.push({ content: 'Cor', styles: { fillColor: [51, 65, 85] } });
          headRow2.push({ content: 'Modelo', styles: { fillColor: [51, 65, 85] } });
          headRow2.push({ content: 'Enchimento', styles: { fillColor: [51, 65, 85] } });
        } else {
          headRow2.push({ content: 'Medida / Tipo', styles: { fillColor: [51, 65, 85] } });
          headRow2.push({ content: 'Cor / Acabamento', styles: { fillColor: [51, 65, 85] } });
        }

        // Entradas headers
        if (cargasEntrada.length > 0) {
          headRow1.push({ content: 'ENTRADAS (CARGAS RECEBIDAS)', colSpan: cargasEntrada.length, styles: { halign: 'center', fillColor: [22, 101, 52] } });
          cargasEntrada.forEach(c => {
            headRow2.push({ content: `${c.nome || 'Carga'}\n${c.data ? c.data.split('-').reverse().join('/') : ''}`, styles: { halign: 'center', fillColor: [34, 197, 94] } });
          });
        } else {
          headRow1.push({ content: 'ENTRADAS', styles: { halign: 'center', fillColor: [22, 101, 52] } });
          headRow2.push({ content: 'Qtd Total', styles: { halign: 'center', fillColor: [34, 197, 94] } });
        }

        // Saídas headers
        if (cargasSaida.length > 0) {
          headRow1.push({ content: 'SAÍDAS (EXPEDIÇÕES REALIZADAS)', colSpan: cargasSaida.length, styles: { halign: 'center', fillColor: [234, 88, 12] } });
          cargasSaida.forEach(c => {
            headRow2.push({ content: `${c.nome || 'Saída'}\n${c.data ? c.data.split('-').reverse().join('/') : ''}`, styles: { halign: 'center', fillColor: [249, 115, 22] } });
          });
        } else {
          headRow1.push({ content: 'SAÍDAS', styles: { halign: 'center', fillColor: [234, 88, 12] } });
          headRow2.push({ content: 'Qtd Total', styles: { halign: 'center', fillColor: [249, 115, 22] } });
        }

        // Saldo and comments headers
        headRow1.push({ content: 'SALDO', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [30, 41, 59] } });
        headRow1.push({ content: 'APARTAMENTOS / OBSERVAÇÕES', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [71, 85, 105] } });

        // Build data rows
        let totEntradasCat = 0;
        let totSaidasCat = 0;
        let totSaldoCat = 0;

        const bodyRows = items.map(item => {
          const rowData: any[] = [];
          if (isFolhas) {
            rowData.push(item.dimensao || '-');
            rowData.push(item.cor || '-');
            rowData.push(item.modelo || '-');
            rowData.push(item.enchimento || '-');
          } else {
            rowData.push(item.medidaAduela || item.medidaAlizar || item.dimensao || '-');
            rowData.push(item.cor || '-');
          }

          let itemTotEntradas = 0;
          if (cargasEntrada.length > 0) {
            cargasEntrada.forEach(c => {
              const val = parseInt(item.entradas?.[c.id] || '0') || 0;
              itemTotEntradas += val;
              rowData.push(val > 0 ? val : '-');
            });
          } else {
            const val = ((Object.values(item.entradas || {}) as any[]).reduce((acc: number, v: any) => acc + (parseInt(String(v)) || 0), 0)) as number;
            itemTotEntradas += val;
            rowData.push(val > 0 ? val : '-');
          }

          let itemTotSaidas = 0;
          if (cargasSaida.length > 0) {
            cargasSaida.forEach(c => {
              const val = parseInt(item.saidas?.[c.id] || '0') || 0;
              itemTotSaidas += val;
              rowData.push(val > 0 ? val : '-');
            });
          } else {
            const val = ((Object.values(item.saidas || {}) as any[]).reduce((acc: number, v: any) => acc + (parseInt(String(v)) || 0), 0)) as number;
            itemTotSaidas += val;
            rowData.push(val > 0 ? val : '-');
          }

          const saldo = itemTotEntradas - itemTotSaidas;
          totEntradasCat += itemTotEntradas;
          totSaidasCat += itemTotSaidas;
          totSaldoCat += saldo;

          rowData.push(saldo);

          // Comments / Aptos
          const commList: string[] = [];
          Object.entries(item.comentarios || {}).forEach(([cid, val]) => {
            if (val && String(val).trim()) {
              commList.push(String(val).trim());
            }
          });
          rowData.push(commList.join(' | ') || '-');

          return rowData;
        });

        // Totals Footer Row
        const footRow: any[] = [];
        const specSpan = isFolhas ? 4 : 2;
        footRow.push({ content: 'TOTAL DA CATEGORIA:', colSpan: specSpan, styles: { halign: 'right', fontStyle: 'bold' } });

        if (cargasEntrada.length > 0) {
          cargasEntrada.forEach(c => {
            const colSum = items.reduce((acc, it) => acc + (parseInt(it.entradas?.[c.id] || '0') || 0), 0);
            footRow.push({ content: colSum > 0 ? colSum : '-', styles: { halign: 'center', fontStyle: 'bold' } });
          });
        } else {
          footRow.push({ content: totEntradasCat, styles: { halign: 'center', fontStyle: 'bold' } });
        }

        if (cargasSaida.length > 0) {
          cargasSaida.forEach(c => {
            const colSum = items.reduce((acc, it) => acc + (parseInt(it.saidas?.[c.id] || '0') || 0), 0);
            footRow.push({ content: colSum > 0 ? colSum : '-', styles: { halign: 'center', fontStyle: 'bold' } });
          });
        } else {
          footRow.push({ content: totSaidasCat, styles: { halign: 'center', fontStyle: 'bold' } });
        }

        footRow.push({ content: totSaldoCat, styles: { halign: 'center', fontStyle: 'bold', textColor: totSaldoCat > 0 ? [22, 101, 52] : [100, 116, 139] } });
        footRow.push({ content: '', styles: { halign: 'center' } });

        autoTable(doc, {
          startY: currentY,
          head: [headRow1, headRow2],
          body: bodyRows,
          foot: [footRow],
          theme: 'grid',
          styles: {
            fontSize: 6.5,
            cellPadding: 1.5,
            valign: 'middle',
            lineColor: [226, 232, 240],
            lineWidth: 0.1
          },
          headStyles: {
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 6.5,
            cellPadding: 1.5
          },
          footStyles: {
            fillColor: [241, 245, 249],
            textColor: [30, 41, 59],
            fontStyle: 'bold',
            fontSize: 7
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      };

      // 1. Folhas de Porta
      renderCategoryTable(
        '1. Folhas de Porta',
        [22, 101, 52],
        obra.itensFolhas || [],
        obra.cargasEntradaFolhas || [],
        obra.cargasSaidaFolhas || [],
        true
      );

      // 2. Aduelas
      renderCategoryTable(
        '2. Aduelas',
        [180, 83, 9],
        obra.itensAduelas || [],
        obra.cargasEntradaAduelas || [],
        obra.cargasSaidaAduelas || [],
        false
      );

      // 3. Alizares
      renderCategoryTable(
        '3. Alizares',
        [2, 132, 199],
        obra.itensAlizares || [],
        obra.cargasEntradaAlizares || [],
        obra.cargasSaidaAlizares || [],
        false
      );

      // 4. Correr
      if (obra.itensCorrer && obra.itensCorrer.length > 0) {
        renderCategoryTable(
          '4. Portas de Correr',
          [109, 40, 217],
          obra.itensCorrer || [],
          obra.cargasEntradaCorrer || [],
          obra.cargasSaidaCorrer || [],
          false
        );
      }
    });

    addDocumentFooter(doc);

    const filename = options?.obraId
      ? `Nacional_Madeiras_Obra_${options.obraId}.pdf`
      : `Nacional_Madeiras_Entrada_Saida_Obras_Completo.pdf`;

    doc.save(filename);
    return true;
  } catch (err) {
    console.error('Erro ao exportar PDF de Entrada/Saída de Obras:', err);
    return false;
  }
}

/**
 * 4. BACKUP PDF: FERRAGENS - OBRA POR OBRA (Formatado em A4 Retrato ou Paisagem)
 */
export function exportFerragensPdf(
  obrasList: any[] = [],
  ferragensObrasData: Record<string, any> = {},
  historyData: any[] = []
): boolean {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const docTitle = 'Relatório & Backup Oficial: Ferragens Obra por Obra';
    const subTitle = `Controle Completo de Ferragens Necessárias, Enviadas e Saldos (${obrasList.length} obras cadastradas)`;

    let isFirstPage = true;

    // Default Ferragens Catalog
    const ITENS_PADRAO = [
      'Fechadura Externa',
      'Fechadura Interna',
      'Fechadura Banheiro (WC)',
      'Fechadura Rolete',
      'Dobradiça 3x2.5 Inox',
      'Dobradiça 3.5x3 Inox',
      'Dobradiça com Anel',
      'Pino Guia Porta de Correr',
      'Batedor de Porta',
      'Trinco Embutido',
      'Cilindro Avulso',
      'Puxador Barra',
      'Parafusos para Dobradiça'
    ];

    obrasList.forEach((obraObj, idx) => {
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      const obraNome = typeof obraObj === 'string' ? obraObj : (obraObj?.nome || obraObj?.id || `Obra ${idx + 1}`);
      const obraId = typeof obraObj === 'string' ? obraObj : (obraObj?.id || obraNome);
      const obraData = ferragensObrasData[obraId] || ferragensObrasData[obraNome] || {};

      addDocumentHeader(doc, docTitle, `OBRA [${idx + 1} de ${obrasList.length}]: ${String(obraNome).toUpperCase()}`, 'p');

      const tableRows = ITENS_PADRAO.map(itemNome => {
        const itemInfo = obraData[itemNome] || {};
        const nec = parseInt(itemInfo.necessario || itemInfo.qtd || '0') || 0;
        const env = parseInt(itemInfo.enviado || itemInfo.saida || '0') || 0;
        const saldo = nec - env;
        const status = nec === 0 ? 'Não Requerido' : (saldo <= 0 ? 'Entregue (100%)' : (env > 0 ? 'Parcial' : 'Pendente'));

        return [
          itemNome,
          nec > 0 ? nec : '-',
          env > 0 ? env : '-',
          nec > 0 ? saldo : '-',
          status,
          itemInfo.obs || itemInfo.observacao || '-'
        ];
      });

      autoTable(doc, {
        startY: 38,
        head: [
          [
            { content: 'ITEM DE FERRAGEM', styles: { fillColor: [30, 41, 59] } },
            { content: 'NECESSÁRIO', styles: { halign: 'center', fillColor: [37, 99, 235], cellWidth: 26 } },
            { content: 'JÁ ENVIADO', styles: { halign: 'center', fillColor: [234, 88, 12], cellWidth: 26 } },
            { content: 'SALDO A ENVIAR', styles: { halign: 'center', fillColor: [22, 101, 52], cellWidth: 28 } },
            { content: 'STATUS', styles: { halign: 'center', fillColor: [71, 85, 105], cellWidth: 28 } },
            { content: 'OBSERVAÇÕES', styles: { fillColor: [71, 85, 105], cellWidth: 35 } },
          ]
        ],
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          valign: 'middle',
          lineColor: [226, 232, 240],
          lineWidth: 0.1
        },
        headStyles: {
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 2
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const val = String(data.cell.raw);
            if (val.includes('Entregue')) {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('Parcial')) {
              data.cell.styles.textColor = [194, 65, 12];
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('Pendente')) {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      // Recent history for this obra
      let finalY = (doc as any).lastAutoTable.finalY + 8;
      const obraHistory = (Array.isArray(historyData) ? historyData : []).filter(h => {
        const hObra = (h.obra || h.obraDestino || h.obraNome || '').toLowerCase();
        return hObra.includes(obraNome.toLowerCase()) || obraNome.toLowerCase().includes(hObra);
      });

      if (obraHistory.length > 0 && finalY < 230) {
        doc.setFillColor(241, 245, 249);
        doc.rect(14, finalY, doc.internal.pageSize.getWidth() - 28, 5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text('HISTÓRICO RECENTE DE ENVIOS DESTA OBRA:', 18, finalY + 3.8);
        finalY += 6;

        const histRows = obraHistory.slice(0, 8).map(h => [
          h.data ? h.data.split('-').reverse().join('/') : '-',
          h.tipo || 'Saída',
          h.item || h.descricao || '-',
          h.quantidade || '-',
          h.responsavel || h.motorista || '-'
        ]);

        autoTable(doc, {
          startY: finalY,
          head: [
            [
              { content: 'Data', styles: { halign: 'center', fillColor: [71, 85, 105], cellWidth: 20 } },
              { content: 'Tipo', styles: { halign: 'center', fillColor: [71, 85, 105], cellWidth: 20 } },
              { content: 'Item / Descrição', styles: { fillColor: [71, 85, 105] } },
              { content: 'Quantidade', styles: { halign: 'center', fillColor: [71, 85, 105], cellWidth: 25 } },
              { content: 'Responsável', styles: { fillColor: [71, 85, 105], cellWidth: 35 } },
            ]
          ],
          body: histRows,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 1.5 }
        });
      }
    });

    addDocumentFooter(doc);
    doc.save('Nacional_Madeiras_Ferragens_Obra_Por_Obra.pdf');
    return true;
  } catch (err) {
    console.error('Erro ao exportar PDF de Ferragens:', err);
    return false;
  }
}

/**
 * 5. BACKUP PDF: ESTOQUE GERAL (Portas, Aduelas, Alizares, Rodapés)
 */
export function exportEstoqueGeralPdf(
  portas: any[] = [],
  aduelas: any[] = [],
  alizares: any[] = [],
  rodapes: any[] = []
): boolean {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const docTitle = 'Relatório & Backup Oficial: Posição do Estoque Geral';
    const subTitle = `Folhas de Porta, Aduelas, Alizares e Rodapés em Armazém`;

    addDocumentHeader(doc, docTitle, subTitle, 'p');

    let currentY = 38;

    const renderStockSection = (title: string, color: [number, number, number], items: any[], isPorta: boolean) => {
      doc.setFillColor(...color);
      doc.rect(14, currentY, doc.internal.pageSize.getWidth() - 28, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(title.toUpperCase(), 18, currentY + 4.2);
      currentY += 8;

      const rows = (items || []).map(it => {
        if (isPorta) {
          return [
            it.dimensao || '-',
            it.cor || '-',
            it.modelo || '-',
            it.enchimento || '-',
            it.quantidade || 0,
            it.localizacao || '-'
          ];
        } else {
          return [
            it.medida || it.medidaAduela || it.medidaAlizar || it.dimensao || '-',
            it.cor || '-',
            it.tipo || it.face || '-',
            it.quantidade || 0,
            it.localizacao || '-'
          ];
        }
      });

      const head = isPorta
        ? [['Dimensão', 'Cor', 'Modelo', 'Enchimento', 'Quantidade', 'Localização']]
        : [['Medida', 'Cor', 'Tipo / Detalhes', 'Quantidade', 'Localização']];

      autoTable(doc, {
        startY: currentY,
        head,
        body: rows,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          [isPorta ? 4 : 3]: { halign: 'center', fontStyle: 'bold' }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    };

    renderStockSection('1. Folhas de Porta em Estoque', [22, 101, 52], portas, true);
    renderStockSection('2. Aduelas em Estoque', [180, 83, 9], aduelas, false);
    renderStockSection('3. Alizares em Estoque', [2, 132, 199], alizares, false);
    renderStockSection('4. Rodapés em Estoque', [109, 40, 217], rodapes, false);

    addDocumentFooter(doc);
    doc.save('Nacional_Madeiras_Estoque_Geral.pdf');
    return true;
  } catch (err) {
    console.error('Erro ao exportar PDF de Estoque Geral:', err);
    return false;
  }
}
