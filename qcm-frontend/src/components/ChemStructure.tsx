import { useEffect, useRef } from "react";

interface ChemStructureProps {
  smiles: string;
  width?: number;
  height?: number;
}

export default function ChemStructure({ smiles, width = 150, height = 100 }: ChemStructureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasId = useRef(`chemdoodle-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // 1. Sécurité : Vérifier si la librairie globale ChemDoodle existe
    const ChemDoodleGlobal = (window as any).ChemDoodle;
    
    if (!ChemDoodleGlobal) {
      console.error("❌ ChemDoodle n'est pas chargé globalement dans window.");
      return;
    }

    if (!canvasRef.current) return;

    try {
      // 2. Nettoyer le canvas existant s'il a déjà été initialisé
      const container = canvasRef.current.parentElement;
      if (!container) return;
      
      // On recrée l'élément canvas à neuf pour éviter les conflits d'initialisation de la lib
      container.innerHTML = "";
      const newCanvas = document.createElement("canvas");
      newCanvas.id = canvasId.current;
      newCanvas.width = width;
      newCanvas.height = height;
      newCanvas.className = "chemdoodle-canvas";
      container.appendChild(newCanvas);

      // 3. Initialiser le composant visuel ChemDoodle Viewer 2D
      const viewer = new ChemDoodleGlobal.ViewerCanvas(canvasId.current, width, height);
      
      // Configuration visuelle minimale
      viewer.specs.atoms_displayLabels_O = true;
      viewer.specs.atoms_displayLabels_N = true;
      viewer.specs.bonds_width_2d = 2;
      viewer.specs.atoms_font_size_2d = 11;

      // 4. Décoder la chaîne SMILES via le parser natif de ChemDoodle
      const molecule = ChemDoodleGlobal.readSMILES(smiles);

      if (molecule && molecule.atoms.length > 0) {
        // Optionnel mais capital : Demander à ChemDoodle de générer les coordonnées 2D 
        // si le SMILES brut n'en contient pas (indispensable pour l'affichage !)
        if (typeof viewer.loadMolecule === "function") {
          ChemDoodleGlobal.CoordGen.generate2DCoordinates(molecule);
          viewer.loadMolecule(molecule);
        } else {
          // Alternative selon la version de votre package
          viewer.loadContent([molecule], []);
        }
      } else {
        console.warn(`⚠️ Molécule vide ou invalide pour le SMILES : ${smiles}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors du rendu de ChemDoodle :", error);
    }
  }, [smiles, width, height]);

  return (
    // Ce conteneur sert de point d'ancrage stable pour que React ne perde pas la main
    <div className="chemdoodle-container inline-block bg-white rounded" style={{ width, height }}>
      <canvas ref={canvasRef} id={canvasId.current} width={width} height={height} />
    </div>
  );
}