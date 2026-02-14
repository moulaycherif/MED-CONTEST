import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { convertMathMLToLatex } from "../utils/mathConverter";


interface Props {
  value: string;
  onChange: (html: string) => void;
}

const TipTapEditor: React.FC<Props> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
    ],
    content: value,
   onUpdate: ({ editor }) => {
  const html = editor.getHTML();
  const converted = convertMathMLToLatex(html);
  onChange(converted);
}

  });

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `${API_BASE_URL}/upload/image`,
      formData
    );

    editor?.chain().focus().setImage({ src: res.data.url }).run();
  };

  if (!editor) return null;

  return (
    <div className="border rounded-lg">
      <div className="flex gap-2 p-2 border-b bg-gray-50">
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files && uploadImage(e.target.files[0])
          }
        />
      </div>

      <EditorContent className="p-4 min-h-[150px]" editor={editor} />
    </div>
  );
};

export default TipTapEditor;
