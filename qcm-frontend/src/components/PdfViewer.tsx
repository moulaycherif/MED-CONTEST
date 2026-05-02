import { useEffect, useState } from "react";

interface Props {
  url: string;
}

const PdfViewer = ({ url }: { url: string }) => {
  return (
    <div className="w-full flex justify-center">
      <iframe
        src={url}
        width="100%"
        height="800px"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default PdfViewer;