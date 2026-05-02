import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = ({ url }: { url: string }) => {
  const [file, setFile] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const res = await fetch(url);
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
    <div className="flex justify-center">
      <Document file={file}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
};

export default PdfViewer;