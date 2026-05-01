import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

const [scale, setScale] = useState(1);
const isClient = typeof window !== "undefined";

// 🔥 IMPORTANT
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface Props {
  url: string;
}

const PdfViewer: React.FC<Props> = ({ url }) => {
  const [numPages, setNumPages] = useState<number>(0);

  return (
    <div className="flex flex-col items-center">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<p>Chargement du PDF...</p>}
      >
        {Array.from(new Array(numPages), (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1} scale={scale}
            width={800} // 🔥 ajuste selon ton layout
          />
        ))}
      </Document>
      <div className="flex gap-2 mb-4">
  <button onClick={() => setScale(scale - 0.2)}>➖</button>
  <button onClick={() => setScale(scale + 0.2)}>➕</button>
</div>
if (!isClient) return null;
    </div>
    
  );
};

export default PdfViewer;