import { PDFDocument, StandardFonts } from "pdf-lib";

export default async function generateResumeBuffer(
  subject: string,
  chapter: string,
  content: string
): Promise<Buffer> {
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = page.getHeight() - 60;

  // ---- Titre ----
  page.drawText(subject, {
    x: 40,
    y,
    size: 24,
    font: bold,
  });

  y -= 40;

  // ---- Chapitre ----
  page.drawText(`Chapitre : ${chapter}`, {
    x: 40,
    y,
    size: 18,
    font: bold,
  });

  y -= 50;

  // ---- Texte multi-lignes ----
  const maxWidth = page.getWidth() - 80;
  const lineHeight = 14;

  const lines = content.split("\n");

  for (const line of lines) {
    const wrapped = font.splitTextIntoLines(line, maxWidth);
    for (const sub of wrapped) {
      if (y < 60) {
        // Nouvelle page
        const newPage = pdfDoc.addPage();
        y = newPage.getHeight() - 60;
      }
      page.drawText(sub, { x: 40, y, size: 12, font });
      y -= lineHeight;
    }
  }

  const uint8 = await pdfDoc.save();
  return Buffer.from(uint8);
}
