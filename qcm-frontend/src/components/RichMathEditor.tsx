import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function RichMathEditor({ value, onChange }: Props) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
    />
  );
}