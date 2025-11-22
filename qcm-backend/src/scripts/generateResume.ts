import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export default function generateResume(subject: string, chapter: string, content: string): string {
  // 📌 1. Nom du fichier
  const fileName = `${subject}_${chapter}_${Date.now()}.pdf`;

  // 📌 2. Dossier uploads (autogénéré si absent)
  const uploadDir = path.join(__dirname, "..", "uploads");

  // 🔥 Création automatique du dossier si absent (évite crash sur Render)
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 📌 3. Chemin complet du PDF
  const filePath = path.join(uploadDir, fileName);

  // 📌 4. Génération PDF avec gestion d’erreurs
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc.fontSize(22).text(subject, { underline: true });
  doc.moveDown();
  doc.fontSize(18).text("Chapitre : " + chapter);
  doc.moveDown();
  doc.fontSize(14).text(content, { align: "justify" });

  doc.end();

  // 📌 5. Log pour Render (optionnel mais utile)
  stream.on("finish", () => {
    console.log("📄 PDF généré avec succès :", filePath);
  });

  stream.on("error", (err) => {
    console.error("❌ Erreur lors de la génération du PDF :", err);
  });

  // 📌 6. URL renvoyée au frontend
  return "/uploads/" + fileName;
}
