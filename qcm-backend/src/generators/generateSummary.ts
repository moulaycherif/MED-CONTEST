import fs from "fs";
import PDFDocument from "pdfkit";

export function generateSummaryPDF(chapitre: string, matiere: string, contenu: string) {
  const safeChapitre = chapitre.replace(/[:&]/g, "").replace(/\s+/g, "_");

  const dir = `./pdf/${matiere}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = `${dir}/${safeChapitre}.pdf`;
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  // Titre
  doc.fontSize(26).text(`${chapitre}`, { align: "center" });
  doc.moveDown(1);

  // Sous-titre
  doc.fontSize(18).text(`Résumé – ${matiere}`, { align: "center" });
  doc.moveDown(2);

  // Contenu principal
  doc.fontSize(14).text(contenu, {
    align: "left",
    lineGap: 6,
  });

  doc.end();

  return filePath;
}
