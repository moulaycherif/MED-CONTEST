import React, { useEffect, useRef } from "react";

interface ChemStructureProps {
  smiles: string;
  id: string;
}

export default function ChemStructure({ smiles, id }: ChemStructureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // @ts-ignore
    if (window.ChemDoodle && canvasRef.current) {
      try {
        // 1. Initialisation du canevas de rendu (ID unique, Largeur, Hauteur)
        // @ts-ignore
        const viewer = new window.ChemDoodle.ViewerCanvas(id, 160, 130);
        
        // 2. Configuration pour forcer le rendu textuel semi-développé (CH3, CH2...)
        viewer.styles.atoms_displayLabels_X = true; // Affiche les Carbones
        viewer.styles.atoms_labels_all = true;      // Force l'affichage des H et des groupements
        viewer.styles.bonds_width_2D = 1.5;         // Épaisseur des liaisons
        viewer.styles.atoms_font_size_24 = 11;      // Taille de la police
        viewer.styles.bonds_saturationWidth_2D = 2; // Visibilité des doubles liaisons (=O)
        
        // 3. Dessiner la structure à partir du code SMILES
        // @ts-ignore
        const molecule = window.ChemDoodle.readSMILES(smiles);
        viewer.loadMolecule(molecule);
      } catch (error) {
        console.error("❌ Erreur de rendu ChemDoodle pour la molécule :", smiles, error);
      }
    }
  }, [smiles, id]);

  return (
    <div className="bg-white p-1 rounded-lg inline-block border border-gray-100 shadow-sm align-middle my-1">
      <canvas id={id} ref={canvasRef} width={160} height={130} />
    </div>
  );
}