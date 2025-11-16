const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = function generateResume(subject, chapter, content) {
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
};
