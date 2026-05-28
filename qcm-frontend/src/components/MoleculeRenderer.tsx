import React, { useEffect, useRef } from "react";
import SmilesDrawer from "smiles-drawer";

interface MoleculeRendererProps {
  smiles: string;
}

export default function MoleculeRenderer({ smiles }: MoleculeRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && smiles) {
      // Configuration optionnelle du design du schéma
      const options = {
        width: 300,
        height: 300,
        bondThickness: 1.5,
        bondLength: 15,
        theme: "light", // ou 'dark'
      };

      const smilesDrawer = new SmilesDrawer.Drawer(options);
      
      // Parse et dessine la molécule sur le canvas
      SmilesDrawer.parse(smiles, (tree) => {
        smilesDrawer.draw(tree, canvasRef.current!, "light", false);
      }, (err) => {
        console.error("❌ Erreur de parsing SMILES :", err);
      });
    }
  }, [smiles]);

  return (
    <div className="flex justify-center my-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm max-w-xs mx-auto">
      <canvas ref={canvasRef} />
    </div>
  );
}