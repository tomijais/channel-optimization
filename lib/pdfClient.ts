import jsPDF from 'jspdf';

export function generatePDFClient(markdown: string, filename: string): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Helper to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper to add text with wrapping
  const addText = (text: string, fontSize: number, fontStyle: string, color: string, indent: number = 0) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);

    // Parse color
    const colorMap: any = {
      '#1a1a1a': [26, 26, 26],
      '#2563eb': [37, 99, 235],
      '#374151': [55, 65, 81],
      '#333': [51, 51, 51],
    };
    const rgb = colorMap[color] || [51, 51, 51];
    pdf.setTextColor(rgb[0], rgb[1], rgb[2]);

    const lines = pdf.splitTextToSize(text, contentWidth - indent);
    const lineHeight = fontSize * 0.5;

    for (const line of lines) {
      checkNewPage(lineHeight);
      pdf.text(line, margin + indent, yPos);
      yPos += lineHeight;
    }
  };

  // Helper to draw line
  const drawLine = (color: string, thickness: number) => {
    const colorMap: any = {
      '#3b82f6': [59, 130, 246],
      '#e5e7eb': [229, 231, 235],
    };
    const rgb = colorMap[color] || [229, 231, 235];
    pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
    pdf.setLineWidth(thickness);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += thickness + 2;
  };

  // Helper to render text with inline bold/italic
  const renderInlineFormatting = (text: string, fontSize: number, baseX: number, startY: number): number => {
    pdf.setFontSize(fontSize);
    let xPos = baseX;
    let currentY = startY;
    const lineHeight = fontSize * 0.5;

    // Split by ** for bold
    const parts = text.split('**');
    const maxWidth = pageWidth - margin - baseX + margin;

    parts.forEach((part, idx) => {
      if (!part) return;

      if (idx % 2 === 0) {
        // Normal text
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 51, 51);
      } else {
        // Bold text
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(26, 26, 26);
      }

      // Split part into words for proper wrapping
      const words = part.split(' ');
      words.forEach((word, wordIdx) => {
        if (wordIdx > 0) word = ' ' + word;
        const wordWidth = pdf.getTextWidth(word);

        // Check if word fits on current line
        if (xPos + wordWidth > pageWidth - margin && xPos > baseX) {
          // Move to next line
          currentY += lineHeight;
          xPos = baseX;
          checkNewPage(lineHeight);
          // Remove leading space if we wrapped
          if (word.startsWith(' ')) {
            word = word.substring(1);
          }
        }

        pdf.text(word, xPos, currentY);
        xPos += pdf.getTextWidth(word);
      });
    });

    return currentY;
  };

  // Parse markdown
  const lines = markdown.split('\n');
  let inTable = false;
  let tableData: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // H1
    if (line.startsWith('# ')) {
      checkNewPage(15);
      yPos += 8;
      addText(line.substring(2), 20, 'bold', '#1a1a1a');
      yPos += 1;
      drawLine('#3b82f6', 1);
      yPos += 5;
    }
    // H2
    else if (line.startsWith('## ')) {
      checkNewPage(12);
      yPos += 6;
      addText(line.substring(3), 16, 'bold', '#2563eb');
      yPos += 1;
      drawLine('#e5e7eb', 0.5);
      yPos += 4;
    }
    // H3
    else if (line.startsWith('### ')) {
      checkNewPage(10);
      yPos += 5;
      addText(line.substring(4), 13, 'bold', '#374151');
      yPos += 3;
    }
    // Table
    else if (line.startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableData = [];
      }
      const cells = line.split('|').filter(cell => cell.trim()).map(cell => cell.trim());
      if (!cells[0].match(/^[-:]+$/)) {
        tableData.push(cells);
      }
    }
    // End of table
    else if (inTable && !line.startsWith('|')) {
      inTable = false;
      if (tableData.length > 0) {
        checkNewPage(tableData.length * 10 + 10);

        // Draw table
        const colWidth = contentWidth / tableData[0].length;
        const rowHeight = 10;

        tableData.forEach((row, rowIndex) => {
          // Calculate required height for this row
          let maxLines = 1;
          row.forEach((cell) => {
            const fontSize = rowIndex === 0 ? 11 : 10;
            pdf.setFontSize(fontSize);
            const cellLines = pdf.splitTextToSize(cell, colWidth - 4);
            maxLines = Math.max(maxLines, cellLines.length);
          });
          const actualRowHeight = Math.max(rowHeight, maxLines * 5 + 4);

          if (checkNewPage(actualRowHeight)) {
            // Redraw header if new page
            if (rowIndex > 0) {
              pdf.setFillColor(243, 244, 246);
              pdf.rect(margin, yPos, contentWidth, rowHeight, 'F');
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(51, 51, 51);
              tableData[0].forEach((cell, colIndex) => {
                pdf.text(cell, margin + colIndex * colWidth + 2, yPos + 6);
              });
              yPos += rowHeight;
            }
          }

          // Header row (first row or after page break)
          if (rowIndex === 0) {
            pdf.setFillColor(243, 244, 246);
            pdf.rect(margin, yPos, contentWidth, actualRowHeight, 'F');
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
          } else {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
          }

          pdf.setTextColor(51, 51, 51);
          pdf.setDrawColor(209, 213, 219);

          row.forEach((cell, colIndex) => {
            pdf.rect(margin + colIndex * colWidth, yPos, colWidth, actualRowHeight);
            const cellLines = pdf.splitTextToSize(cell, colWidth - 4);
            let cellY = yPos + 6;
            cellLines.forEach((line: string) => {
              pdf.text(line, margin + colIndex * colWidth + 2, cellY);
              cellY += 5;
            });
          });

          yPos += actualRowHeight;
        });
        yPos += 5;
      }
      i--; // Reprocess current line
    }
    // Numbered list
    else if (line.trim().match(/^\d+\.\s/)) {
      checkNewPage(6);
      const match = line.trim().match(/^(\d+\.)\s(.+)$/);
      if (match) {
        const number = match[1];
        const listText = match[2];

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(26, 26, 26);
        pdf.text(number, margin + 2, yPos);

        // Handle inline formatting
        if (listText.includes('**')) {
          const finalY = renderInlineFormatting(listText, 11, margin + 12, yPos);
          yPos = finalY + 6.5;
        } else {
          pdf.setFont('helvetica', 'normal');
          const wrapped = pdf.splitTextToSize(listText, contentWidth - 12);
          wrapped.forEach((wLine: string, idx: number) => {
            if (idx > 0) {
              checkNewPage(5.5);
            }
            pdf.text(wLine, margin + 12, yPos);
            yPos += 5.5;
          });
        }
      }
    }
    // Bullet list
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      checkNewPage(6);
      const bulletText = line.trim().substring(2);

      // Determine indentation level
      const leadingSpaces = line.length - line.trimStart().length;
      const indentLevel = Math.floor(leadingSpaces / 2);
      const indent = indentLevel * 8;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 51, 51);
      pdf.text('•', margin + indent + 2, yPos);

      // Handle inline formatting
      if (bulletText.includes('**')) {
        const finalY = renderInlineFormatting(bulletText, 11, margin + indent + 8, yPos);
        yPos = finalY + 6;
      } else {
        const wrapped = pdf.splitTextToSize(bulletText, contentWidth - indent - 10);
        wrapped.forEach((wLine: string, idx: number) => {
          if (idx > 0) {
            checkNewPage(5.5);
          }
          pdf.text(wLine, margin + indent + 8, yPos);
          yPos += 5.5;
        });
      }
    }
    // Bold text on its own line
    else if (line.startsWith('**') && line.endsWith('**')) {
      checkNewPage(6);
      addText(line.substring(2, line.length - 2), 10, 'bold', '#1a1a1a');
      yPos += 1;
    }
    // Regular text
    else if (line.trim()) {
      checkNewPage(6);
      // Handle inline bold
      if (line.includes('**')) {
        const finalY = renderInlineFormatting(line, 11, margin, yPos);
        yPos = finalY + 6;
      } else {
        addText(line, 11, 'normal', '#333');
      }
    }
    // Empty line
    else {
      yPos += 3;
    }
  }

  pdf.save(filename);
}
