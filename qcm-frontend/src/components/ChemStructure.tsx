import { useEffect, useRef } from "react";
import SmilesDrawer from "smiles-drawer";

interface Props {
  smiles: string;
}

export default function ChemStructure({ smiles }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!smiles || !canvasRef.current) return;

    const drawer = new SmilesDrawer.Drawer({
      width: 320,
      height: 220,

      bondThickness: 1.2,
      bondLength: 28,

      shortBondLength: 0.8,

      atomVisualization: "default",

      isometric: false,

      compactDrawing: false,

      explicitHydrogens: false,

      padding: 20,

      fontSizeLarge: 16,
      fontSizeSmall: 10,

      terminalCarbons: false,

      overlapSensitivity: 0.42,

      debug: false,
    });

    SmilesDrawer.parse(
      smiles,
      (tree: any) => {
        drawer.draw(tree, canvasRef.current!, "light", false);
      },
      (err: any) => {
        console.error("SMILES parse error:", err);
      }
    );
  }, [smiles]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={220}
      className="bg-white rounded"
    />
  );
}