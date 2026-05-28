import { useEffect, useRef } from "react";
import SmilesDrawer from "smiles-drawer";

interface Props {
  smiles: string;
}

export default function ChemStructure({ smiles }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!smiles || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Nettoyage
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawer = new SmilesDrawer.Drawer({
      width: 420,
      height: 220,

      bondThickness: 2,
      shortBondLength: 0.9,

      compactDrawing: false,

      terminalCarbons: true,

      explicitHydrogens: false,

      overlapSensitivity: 0.42,

      padding: 25,
    });

    SmilesDrawer.parse(
      smiles,
      (tree: any) => {
        try {
          drawer.draw(tree, canvas, "light", false);
        } catch (err) {
          console.error("DRAW ERROR:", err);
        }
      },
      (err: any) => {
        console.error("SMILES parse error:", err);
      }
    );
  }, [smiles]);

  return (
    <canvas
      ref={canvasRef}
      width={420}
      height={220}
      style={{
        width: "100%",
        maxWidth: "420px",
        height: "220px",
        background: "white",
      }}
    />
  );
}