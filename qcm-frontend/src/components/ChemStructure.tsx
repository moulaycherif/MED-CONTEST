import React, { useEffect, useRef } from "react";

interface ChemStructureProps {
  smiles: string;
  id: string;
}

export default function ChemStructure({ smiles, id }: ChemStructureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // On s'assure que le script CDN est bien chargé globalement et que le canvas est prêt dans le DOM
    // @ts-ignore
    if (window.ChemDoodle && canvasRef.current) {
      try {
        // 1. Initialiser le canvas via son ID unique
        // @ts-ignore
        const viewer = new window.ChemDoodle.ViewerCanvas(id, 240, 140);
        
        // 2. Options de rendu spécifiques pour le SEMI-DÉVELOPPÉ (ex: CCCCCCOCCCC)
        viewer.styles.atoms_displayLabels_X = true; // Afficher tous les Carbones (C)
        viewer.styles.atoms_labels_all = true;      // Forcer l'affichage de tous les H (CH3, CH2...)
        viewer.styles.bonds_width_2D = 1.6;         // Épaisseur des traits de liaisons
        viewer.styles.atoms_font_size_2D = 12;      // Taille de la police du texte chimique
        viewer.styles.bonds_saturationWidth_2D = 2; // Visibilité des doubles liaisons (=O)
        
        // 3. Charger et dessiner la molécule SMILES
        // @ts-ignore
        const molecule = window.ChemDoodle.readSMILES(smiles.trim());
        viewer.loadMolecule(molecule);
      } catch (error) {
        console.error("❌ Erreur d'initialisation ChemDoodle sur l'ID :", id, error);
      }
    }
  }, [smiles, id]);

  return (
    // On applique l'ID unique sur la balise HTML canvas pour que ChemDoodle la trouve
    <div className="bg-white p-2 rounded-xl inline-block border border-gray-200 shadow-sm my-2 align-middle">
      <canvas id={id} ref={canvasRef} width={240} height={140} />
    </div>
  );
}