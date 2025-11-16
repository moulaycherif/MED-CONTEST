import { useState } from "react";
import { generateResumePDF } from "../../api/summaryApi";

export default function SummaryEditor() {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [content, setContent] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!subject || !chapter || !content) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const url = await generateResumePDF(subject, chapter, content);
    setPdfUrl(url);
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">📝 Création d’un Résumé</h2>

      <div className="mb-3">
        <label className="font-semibold">Matière :</label>
        <input
          type="text"
          className="border px-2 py-1 ml-2"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="font-semibold">Chapitre :</label>
        <input
          type="text"
          className="border px-2 py-1 ml-2"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
        />
      </div>

      <textarea
        className="border w-full h-64 p-3"
        placeholder="Écris ton résumé ici..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>

      <button
        onClick={handleGenerate}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700"
      >
        📄 Générer PDF
      </button>

      {pdfUrl && (
        <div className="mt-4">
          <p className="font-semibold">PDF généré :</p>
          <a href={pdfUrl} className="text-blue-600 underline" target="_blank">
            📥 Télécharger / Voir le PDF
          </a>
        </div>
      )}
    </div>
  );
}
