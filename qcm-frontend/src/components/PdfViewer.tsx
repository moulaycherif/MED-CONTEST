import { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";

import { pdfjs } from "react-pdf";

// 🔥 HARD FIX (version exacte)
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.296/pdf.worker.min.js";

interface Props {
  url: string;
}

const PdfViewer: React.FC<Props> = ({ url }) => {
  const [file, setFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        console.log("🔗 Fetch PDF:", url);

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("HTTP error " + res.status);
        }

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        setFile(blobUrl);
      } catch (err) {
        console.error("❌ Erreur chargement PDF:", err);
      }
    };

    loadPdf();
  }, [url]);

  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(file);
    };
  }, [file]);

  if (!file) return <p>Chargement du PDF...</p>;

  return (
    <div className="flex flex-col items-center">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(err) => console.error("❌ PDF error:", err)}
      >
        {Array.from(new Array(numPages), (_, i) => (
          <Page key={i} pageNumber={i + 1} />
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;