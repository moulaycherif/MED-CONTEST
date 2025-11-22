import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default async function generateResumeBuffer(subject: string, chapter: string, content: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  const fontSizeTitle = 22;
  const fontSizeHeader = 18;
  const fontSizeText = 14;

  page.drawText(subject, {
    x: 50,
    y: height - 50,
    size: fontSizeTitle,
    font,
    color: rgb(0, 0, 0)
  });

  page.drawText(`Chapitre : ${chapter}`, {
    x: 50,
    y: height - 100,
    size: fontSizeHeader,
    font,
  });

  page.drawText(content, {
    x: 50,
    y: height - 150,
    size: fontSizeText,
    font,
    maxWidth: width - 100,
    lineHeight: 16,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
