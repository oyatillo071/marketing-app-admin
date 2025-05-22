import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (
  data: any[] | any,
  columns: { header: string; accessor: string }[],
  title: string,
  fileName: string
) => {
  // Create a new jsPDF instance
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  // Add date
  doc.text(
    `Exported on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    14,
    30
  );

  // Prepare table data
  const tableColumn = columns.map((col) => col.header);
  const tableRows = data.map((item: any) => {
    return columns.map((col) => {
      // Handle nested properties like "user.name"
      if (col.accessor.includes(".")) {
        const props = col.accessor.split(".");
        let value = item;
        for (const prop of props) {
          value = value?.[prop];
        }
        return String(value || "");
      }

      const value =
        typeof item[col.accessor] === "object"
          ? JSON.stringify(item[col.accessor])
          : String(item[col.accessor] || "");
      return value;
    });
  });

  // Generate table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [78, 78, 78],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [41, 77, 97],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 35 },
  });

  // Save PDF
  doc.save(`${fileName}.pdf`);
};

export const exportStatsToPDF = (
  stats: any,
  title: string,
  fileName: string
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  // Add date
  doc.text(
    `Exported on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    14,
    30
  );

  let yPos = 40;

  // Add stats sections
  Object.entries(stats).forEach(([key, value]) => {
    if (typeof value === "object" && !Array.isArray(value)) {
      doc.setFontSize(14);
      doc.setTextColor(41, 77, 97);
      doc.text(key.charAt(0).toUpperCase() + key.slice(1), 14, yPos);
      yPos += 10;

      Object.entries(value as any).forEach(([subKey, subValue]) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`${subKey}: ${subValue}`, 20, yPos);
        yPos += 8;
      });

      yPos += 5;
    } else if (Array.isArray(value)) {
      // Skip arrays for now - they would be better represented as tables or charts
    } else {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`${key}: ${value}`, 14, yPos);
      yPos += 8;
    }

    // Add a new page if we're running out of space
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Save PDF
  doc.save(`${fileName}.pdf`);
};
