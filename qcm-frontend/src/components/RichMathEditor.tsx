import ReactQuill from "react-quill";
import katex from "katex";
import { useRef } from "react";

import { API_BASE_URL } from "../config";

import "react-quill/dist/quill.snow.css";
import "katex/dist/katex.min.css";

(window as any).katex = katex;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function RichMathEditor({
  value,
  onChange,
}: Props) {
  const quillRef = useRef<ReactQuill | null>(null);

  const imageHandler = () => {
    const input = document.createElement("input");

    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");

    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `${API_BASE_URL}/api/exercises/upload-editor-image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      const quill = quillRef.current?.getEditor();

      const range = quill?.getSelection();

      quill?.insertEmbed(
        range?.index || 0,
        "image",
        `${API_BASE_URL}${data.url}`
      );
    };
  };

  const modules = {
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
        image: imageHandler,
      },
    },
  };

  return (
    <div className="bg-white mb-10">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Écrire ici..."
      />

      <style>
        {`
          .ql-editor {
            min-height: 220px;
            font-size: 16px;
          }

          .ql-container {
            min-height: 220px;
          }
        `}
      </style>
    </div>
  );
}