import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

interface Props {
  url: string;
  page?: number;
}

const PdfViewer: React.FC<Props> = ({ url, page = 1 }) => {
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);

  return (
    <div className="bg-white p-4 rounded-xl shadow">

      {/* 🔥 CONTROLS */}
      <div className="flex gap-3 mb-3">
        <button onClick={() => setScale(s => s + 0.2)}>➕</button>
        <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))}>➖</button>
      </div>

      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page pageNumber={page} scale={scale} />
      </Document>

    </div>
  );
};

export default PdfViewer;