import React, { useEffect, useRef } from "react";

interface ChemStructureProps {
  smiles: string;
}

export default function ChemStructure({ smiles }: ChemStructureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 1. Nettoyage de sécurité de la chaîne SMILES (enlève espaces, retours à la ligne cachés d'Excel)
    const cleanSmiles = smiles
      .replace(/\s+/g, "") // Supprime les espaces et sauts de ligne
      .trim();

    // @ts-ignore
    if (window.ChemDoodle && canvasRef.current && cleanSmiles) {
      try {
        const canvas = canvasRef.current;

        // 2. Création du Viewer en lui passant directement l'élément HTML Canvas (pas un ID string !)
        // @ts-ignore
        const viewer = new window.ChemDoodle.ViewerCanvas(canvas, 250, 120);
        
        // 3. Configuration stricte pour le rendu semi-développé étendu
        viewer.styles.atoms_displayLabels_X = true; // Afficher les Carbones (C)
        viewer.styles.atoms_labels_all = true;      // Forcer l'affichage des CH3, CH2, NH...
        viewer.styles.bonds_width_2D = 1.6;         // Épaisseur des liaisons
        viewer.styles.atoms_font_size_2D = 13;      // Taille de la police
        viewer.styles.bonds_saturationWidth_2D = 2; // Doubles liaisons (=O) bien visibles
        viewer.styles.bonds_length_2D = 20;         // Longueur des liaisons pour étendre la formule
        
        // 4. Lecture et application de la molécule
        // @ts-ignore
        const molecule = window.ChemDoodle.readSMILES(cleanSmiles);
        
        if (molecule) {
          viewer.loadMolecule(molecule);
        } else {
          console.error("❌ ChemDoodle n'a pas pu parser le SMILES :", cleanSmiles);
        }
      } catch (error) {
        console.error("❌ Erreur d'initialisation ChemDoodle :", error);
      }
    }
  }, [smiles]);

  return (
    <div className="bg-white p-2 rounded-xl inline-block border border-gray-300 shadow-sm align-middle my-1">
      {/* Plus besoin d'attribut ID ici, la ref suffit à ChemDoodle */}
      <canvas ref={canvasRef} width={250} height={120} />
    </div>
  );
}