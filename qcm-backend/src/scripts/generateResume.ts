import { PDFDocument, StandardFonts } from "pdf-lib";

export default async function generateResumeBuffer(
  subject: string,
  chapter: string,
  content: string
): Promise<Uint8Array> {

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSize = 12;
  const maxWidth = page.getWidth() - 80; // marges

  let y = page.getHeight() - 40;

  // ---- TITRE MATIÈRE ----
  page.drawText(subject, {
    x: 40,
    y,
    size: 22,
    font,
  });

  y -= 40;

  // ---- TITRE CHAPITRE ----
  page.drawText(`Chapitre : ${chapter}`, {
    x: 40,
    y,
    size: 18,
    font,
  });

  y -= 50;

  // ---- Découpage manuel du contenu ----
  const words = content.split(" ");
  let currentLine = "";

  for (let word of words) {
    const testLine = currentLine + word + " ";

    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth) {
      // écrire la ligne actuelle
      page.drawText(currentLine, {
        x: 40,
        y,
        size: fontSize,
        font,
      });
      y -= 16;

      currentLine = word + " ";
    } else {
      currentLine = testLine;
    }
  }

  // écrire la dernière ligne
  if (currentLine.trim() !== "") {
    page.drawText(currentLine, {
      x: 40,
      y,
      size: fontSize,
      font,
    });
  }

  return await pdfDoc.save();
}
