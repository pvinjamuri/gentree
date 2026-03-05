import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export type PaperSize = 'a4' | 'a3' | 'letter' | 'poster';

const PAPER_DIMENSIONS: Record<PaperSize, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  a3: { width: 297, height: 420 },
  letter: { width: 216, height: 279 },
  poster: { width: 610, height: 914 }, // 24x36 inches
};

export async function generatePdf(
  element: HTMLElement,
  paperSize: PaperSize = 'a3',
  familyName = 'Sharma'
): Promise<void> {
  const dims = PAPER_DIMENSIONS[paperSize];

  // Capture the element as PNG
  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });

  const pdf = new jsPDF({
    orientation: dims.width > dims.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [dims.width, dims.height],
  });

  // Add header
  pdf.setFontSize(28);
  pdf.setTextColor(79, 70, 229); // indigo
  pdf.text(`${familyName} Family Tree`, dims.width / 2, 20, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128); // gray
  pdf.text('Generated with Gentree', dims.width / 2, 28, { align: 'center' });

  // Add the tree image
  const margin = 15;
  const headerHeight = 35;
  const footerHeight = 15;
  const imgWidth = dims.width - margin * 2;
  const imgHeight = dims.height - headerHeight - footerHeight - margin;

  pdf.addImage(dataUrl, 'PNG', margin, headerHeight, imgWidth, imgHeight);

  // Add footer
  pdf.setFontSize(8);
  pdf.setTextColor(156, 163, 175);
  const today = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  pdf.text(
    `Generated on ${today} • gentree.app`,
    dims.width / 2,
    dims.height - 8,
    { align: 'center' }
  );

  pdf.save(`${familyName}_Family_Tree.pdf`);
}
