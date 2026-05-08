import ReactQuill from "react-quill";

import "react-quill/dist/quill.snow.css";

import katex from "katex";
import "katex/dist/katex.min.css";

import Quill from "quill";
import ImageUploader from "quill-image-uploader";
import { API_BASE_URL } from "../config";

Quill.register(
  "modules/imageUploader",
  ImageUploader
);

(window as any).katex = katex;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function RichMathEditor({
  value,
  onChange,
}: Props) {

  const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],

    ["bold", "italic", "underline"],

    [{ list: "ordered" }, { list: "bullet" }],

    ["link", "image"],

    ["formula"],

    ["clean"],
  ],

  clipboard: {
    matchVisual: false,
  },

  imageUploader: {
    upload: async (file: File) => {

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

      return `${API_BASE_URL}${data.url}`;
    },
  },
};

  return (
    <div className="bg-white mb-4">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Écrire ici..."
      />
    </div>
  );
}