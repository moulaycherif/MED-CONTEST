import React, { useEffect, useRef, useId } from "react";

interface ChemStructureProps {
  smiles: string;
}

export default function ChemStructure({ smiles }: ChemStructureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // ✨ Génère un ID unique interne auto-géré par React (ex: :r1:, :r2:)
  const uniqueId = useId(); 

  useEffect(() => {
    // Petit hack pour enlever les caractères ":" de useId qui déplaisent parfois à l'HTML5
    const cleanId = uniqueId.replace(/:/g, "-");

    // @ts-ignore
    if (window.ChemDoodle && canvasRef.current) {
      try {
        // 1. On initialise le canvas avec l'ID nettoyé
        // @ts-ignore
        const viewer = new window.ChemDoodle.ViewerCanvas(cleanId, 220, 130);
        
        // 2. Paramétrage structurel (Semi-développé étendu)
        viewer.styles.atoms_displayLabels_X = true; // Afficher les Carbones
        viewer.styles.atoms_labels_all = true;      // Afficher les H (CH3, CH2...)
        viewer.styles.bonds_width_2D = 1.6;         // Épaisseur des liaisons
        viewer.styles.atoms_font_size_2D = 12;      // Taille de la police
        viewer.styles.bonds_saturationWidth_2D = 2; // Doubles liaisons nettes (=O)
        
        // 3. Rendu de la molécule
        // @ts-ignore
        const molecule = window.ChemDoodle.readSMILES(smiles.trim());
        viewer.loadMolecule(molecule);
      } catch (error) {
        console.error("❌ Échec du rendu ChemDoodle pour :", smiles, error);
      }
    }
  }, [smiles, uniqueId]);

  return (
    <div className="bg-white p-1 rounded-lg inline-block border border-gray-200 shadow-sm align-middle my-1">
      {/* 🛠️ On applique l'ID nettoyé directement sur la balise */}
      <canvas id={uniqueId.replace(/:/g, "-")} ref={canvasRef} width={220} height={130} />
    </div>
  );
}