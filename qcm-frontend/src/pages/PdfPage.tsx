import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PdfViewer from "../components/PdfViewer";
import { API_BASE_URL } from "../config";

/* ===================== TYPES ===================== */

interface Tip {
  _id: string;
  pdfUrl?: string;
}

/* ===================== COMPONENT ===================== */

const PdfPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    if (!id) return;

    axios
      .get(`${API_BASE_URL}/api/astuces/detail/${id}`)
      .then((res) => setTip(res.data))
      .catch((err) => {
        console.error("❌ Erreur chargement PDF :", err);
      });
  }, [id]);

  if (!tip) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Chargement du PDF...
      </p>
    );
  }

  if (!tip.pdfUrl) {
    return (
      <p className="text-center mt-10 text-red-500">
        Aucun PDF disponible
      </p>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PdfViewer url={tip.pdfUrl} />
    </div>
  );
};

export default PdfPage;