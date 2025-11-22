import PDFDocument from "pdfkit";

export default function generateResumeBuffer(subject: string, chapter: string, content: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Uint8Array[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(22).text(subject, { underline: true });
      doc.moveDown();
      doc.fontSize(18).text("Chapitre : " + chapter);
      doc.moveDown();
      doc.fontSize(14).text(content, { align: "justify" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
