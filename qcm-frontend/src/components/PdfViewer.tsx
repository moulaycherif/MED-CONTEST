import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// 🔥 IMPORTANT
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
            pageNumber={i + 1}
            width={800} // 🔥 ajuste selon ton layout
          />
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;