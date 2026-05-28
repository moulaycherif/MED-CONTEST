import { useEffect, useRef } from "react";
import * as SmilesDrawer from "smiles-drawer";

interface Props {
  smiles: string;
}

export default function ChemStructure({ smiles }: Props) {
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !smiles) return;

    // Nettoyage complet avant redraw
    svgRef.current.innerHTML = "";

    const drawer = new SmilesDrawer.Drawer({
      width: 320,
      height: 220,

      // ✅ Style semi-développé propre
      compactDrawing: false,
      explicitHydrogens: false,

      // ✅ Meilleure géométrie
      overlapSensitivity: 0.4,
      overlapResolutionIterations: 3,

      // ✅ Taille des liaisons
      bondThickness: 1.4,
      bondLength: 28,

      // ✅ Taille des lettres
      fontSizeLarge: 16,
      fontSizeSmall: 12,

      // ✅ SVG propre
      padding: 20,

      // ✅ Thème
      isometric: false,
      terminalCarbons: false,
    });

    SmilesDrawer.parse(
      smiles,
      (tree) => {
        if (!svgRef.current) return;

        drawer.draw(
          tree,
          svgRef.current,
          "light",
          false
        );
      },
      (err) => {
        console.error("Erreur SMILES :", err);
      }
    );
  }, [smiles]);

  return (
    <div
      ref={svgRef}
      className="flex justify-center items-center bg-white"
    />
  );
}