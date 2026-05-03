import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = ({ url }: { url: string }) => {
  const [numPages, setNumPages] = useState(0);

  return (
    <div className="bg-gray-100 py-10 flex flex-col items-center">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from(new Array(numPages), (_, i) => (
          <div key={i} className="mb-6 bg-white rounded-xl shadow-md">
            <Page
              pageNumber={i + 1}
              width={800}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;