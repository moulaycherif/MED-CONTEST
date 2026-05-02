import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// ✅ 🔥 SOLUTION VITE OFFICIELLE
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface Props {
  url: string;
}

const PdfViewer: React.FC<Props> = ({ url }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1);

  return (
    <div className="flex flex-col items-center">
      <Document
        file={{ url }}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<p>Chargement du PDF...</p>}
        options={{
          disableRange: true,
          disableStream: true,
          disableAutoFetch: true,
        }}
      >
        {Array.from(new Array(numPages), (_, i) => (
          <Page key={i} pageNumber={i + 1} scale={scale} />
        ))}
      </Document>

      <div className="flex gap-2 mt-4">
        <button onClick={() => setScale(scale - 0.2)}>➖</button>
        <button onClick={() => setScale(scale + 0.2)}>➕</button>
      </div>
    </div>
  );
};

export default PdfViewer;