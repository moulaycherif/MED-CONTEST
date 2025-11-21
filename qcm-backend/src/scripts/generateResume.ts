import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export default function generateResume(subject: string, chapter: string, content: string): string {
  const fileName = `${subject}_${chapter}_${Date.now()}.pdf`;
  const filePath = path.join(__dirname, "..", "uploads", fileName);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(22).text(subject, { underline: true });
  doc.moveDown();
  doc.fontSize(18).text("Chapitre : " + chapter);
  doc.moveDown();
  doc.fontSize(14).text(content, { align: "justify" });

  doc.end();

  return "/uploads/" + fileName;
}
