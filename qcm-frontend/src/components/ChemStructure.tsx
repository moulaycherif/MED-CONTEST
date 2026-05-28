import { useEffect, useRef } from "react";
import SmilesDrawer from "smiles-drawer";

interface Props {
  smiles: string;
}

export default function ChemStructure({ smiles }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!smiles || !svgRef.current) return;

    // Nettoyage ancien rendu
    svgRef.current.innerHTML = "";

    const drawer = new SmilesDrawer.Drawer({
      width: 420,
      height: 220,

      bondThickness: 2,
      shortBondLength: 0.85,

      atomVisualization: "default",

      compactDrawing: false,

      terminalCarbons: true,

      explicitHydrogens: false,

      overlapSensitivity: 0.42,

      padding: 25,
    });

    SmilesDrawer.parse(
      smiles,
      (tree: any) => {
        drawer.draw(tree, svgRef.current!, "light", false);
      },
      (err: any) => {
        console.error("SMILES parse error:", err);
      }
    );
  }, [smiles]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: "220px",
        overflow: "visible",
      }}
    />
  );
}