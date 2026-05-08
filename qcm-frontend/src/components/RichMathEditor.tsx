import ReactQuill from "react-quill";

import "react-quill/dist/quill.snow.css";

import katex from "katex";
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

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
      ["formula"],
    ],
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