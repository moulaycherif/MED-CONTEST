import { PDFDocument, StandardFonts } from "pdf-lib";

export default async function generateResumeBuffer(
  subject: string,
  chapter: string,
  content: string
): Promise<Buffer> {

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = page.getHeight() - 40;

  page.drawText(subject, {
    x: 40,
    y,
    size: 22,
    font,
  });

  y -= 40;

  page.drawText(`Chapitre : ${chapter}`, {
    x: 40,
    y,
    size: 18,
    font,
  });

  y -= 50;

  page.drawText(content, {
    x: 40,
    y,
    size: 12,
    font,
    lineHeight: 14,
    maxWidth: page.getWidth() - 80
  });

  // 👉 pdfDoc.save() renvoie un Uint8Array → on convertit en Buffer
  const uint8 = await pdfDoc.save();
  return Buffer.from(uint8);
}
