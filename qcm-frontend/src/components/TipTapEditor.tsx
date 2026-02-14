import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "katex/dist/katex.min.css";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const TipTapEditor: React.FC<Props> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit, // ✅ SEULE extension
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="flex gap-2 p-2 border-b bg-gray-50 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="px-2 py-1 border rounded"
        >
          <b>B</b>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="px-2 py-1 border rounded"
        >
          <i>I</i>
        </button>

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent("$$ x^2 + y^2 = z^2 $$")
              .run()
          }
          className="px-2 py-1 border rounded"
        >
          ∑ Formule
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="p-4 min-h-[150px] prose max-w-none"
      />
    </div>
  );
};

export default TipTapEditor;
