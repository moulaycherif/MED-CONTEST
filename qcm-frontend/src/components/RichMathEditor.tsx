import React, { useRef, useMemo } from "react";
import ReactQuill from "react-quill";
import katex from "katex";
import { API_BASE_URL } from "../config";

import "react-quill/dist/quill.snow.css";
import "katex/dist/katex.min.css";

// Injection de KaTeX dans l'objet window pour que Quill puisse interpréter les formules
(window as any).katex = katex;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function RichMathEditor({ value, onChange }: Props) {
  const quillRef = useRef<ReactQuill | null>(null);

  // 🔹 L'utilisation de useMemo est OBLIGATOIRE ici avec ReactQuill.
  // Sinon, l'éditeur perd le focus à chaque fois que l'utilisateur tape une touche.
  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["formula"],
          ["clean"],
        ],
        handlers: {
          image: () => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("image", file);

              try {
                // ⚠️ Attention : Si cette route API est protégée, n'oubliez pas d'ajouter 
                // les headers d'autorisation (ex: Authorization: `Bearer ${adminToken}`)
                const res = await fetch(
                  `${API_BASE_URL}/api/exercises/upload-editor-image`,
                  {
                    method: "POST",
                    body: formData,
                  }
                );

                if (!res.ok) {
                  throw new Error("Erreur serveur lors de l'upload");
                }

                const data = await res.json();
                const quill = quillRef.current?.getEditor();
                const range = quill?.getSelection();

                quill?.insertEmbed(
                  range?.index || 0,
                  "image",
                  `${API_BASE_URL}${data.url}`
                );
              } catch (error) {
                console.error("Erreur lors de l'upload de l'image :", error);
                alert("❌ Impossible d'importer l'image. Veuillez réessayer.");
              }
            };
          },
        },
      },
    };
  }, []); // Le tableau de dépendances vide garantit que les modules ne sont créés qu'une seule fois au montage.

  return (
    <div className="bg-white mb-10">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Rédigez votre question ou explication ici..."
      />

      <style>
        {`
          .ql-toolbar {
            background: white;
            border: 1px solid #ccc;
            border-top-left-radius: 0.375rem;
            border-top-right-radius: 0.375rem;
          }

          .ql-container {
            min-height: 220px;
            background: white;
            border: 1px solid #ccc;
            border-bottom-left-radius: 0.375rem;
            border-bottom-right-radius: 0.375rem;
            cursor: text;
          }

          .ql-editor {
            min-height: 220px;
            font-size: 16px;
            color: black;
            cursor: text;
            user-select: text;
            pointer-events: auto;
          }

          .ql-editor p {
            color: black;
          }
            
          /* Ajustement optionnel pour l'affichage des formules KaTeX dans l'éditeur */
          .ql-editor .ql-formula {
            margin: 0 4px;
          }
        `}
      </style>
    </div>
  );
}