import { Document, Page } from "react-pdf";
import { useState } from "react";
import { pdfjs } from "react-pdf";

// ✅ Worker stable (Vite-safe)

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  url: string;
}

const PdfViewer = ({ url }: Props) => {
  // 🚨 SAFE GUARD
  if (!url) return null;

  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);

  return (
    <div className="bg-gray-100 py-10 flex flex-col items-center min-h-[500px]">

      {/* 🔥 SKELETON LOADING */}
      {loading && (
        <div className="w-[800px] space-y-4 animate-pulse">
          <div className="h-10 bg-gray-300 rounded" />
          <div className="h-[600px] bg-gray-300 rounded-xl" />
        </div>
      )}

      <Document
        file={url}
        loading={null}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          setLoading(false);
        }}
        onLoadError={(err) => {
          console.error("❌ PDF ERROR:", err);
          setLoading(false);
        }}
      >
        {Array.from(new Array(numPages), (_, i) => (
          <div
            key={i}
            className="mb-6 bg-white rounded-xl shadow-md overflow-hidden"
          >
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