import { useEffect, useRef, useState } from "react";

interface ChemStructureProps {
  smiles: string;
  width?: number;
  height?: number;
}

export default function ChemStructure({ smiles, width = 160, height = 120 }: ChemStructureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLibraryReady, setIsLibraryReady] = useState(false);

  // 1. Boucle de vérification : On attend que ChemDoodle apparaisse dans l'objet global window
  useEffect(() => {
    const checkGlobalLibrary = () => {
      if ((window as any).ChemDoodle) {
        setIsLibraryReady(true);
      } else {
        // Si pas encore là, on réessaye dans 100ms
        setTimeout(checkGlobalLibrary, 100);
      }
    };
    checkGlobalLibrary();
  }, []);

  // 2. Rendu de la molécule dès que la librairie est validée ET que le SMILES change
  useEffect(() => {
    if (!isLibraryReady || !containerRef.current || !smiles) return;

    const cd = (window as any).ChemDoodle;
    if (!cd) return;

    try {
      // Génération d'un ID unique à chaque rendu pour éviter les collisions de Canvas
      const uniqueCanvasId = `canvas-${Math.random().toString(36).substring(2, 9)}`;

      // Vidage du conteneur précédent (essentiel pour le cycle de vie de React)
      containerRef.current.innerHTML = "";

      // Création physique du nouvel élément HTML <canvas>
      const canvasEl = document.createElement("canvas");
      canvasEl.id = uniqueCanvasId;
      canvasEl.width = width;
      canvasEl.height = height;
      canvasEl.style.border = "none";
      containerRef.current.appendChild(canvasEl);

      // Initialisation du moteur visuel 2D de ChemDoodle sur ce canvas
      const viewer = new cd.ViewerCanvas(uniqueCanvasId, width, height);

      // Personnalisation des paramètres graphiques (police, taille, liaisons)
      viewer.specs.atoms_displayLabels_O = true;
      viewer.specs.atoms_displayLabels_N = true;
      viewer.specs.bonds_width_2d = 2;
      viewer.specs.atoms_font_size_2d = 12;
      viewer.specs.backgroundColor = "transparent";

      // Lecture de la chaîne textuelle SMILES
      const molecule = cd.readSMILES(smiles);

      if (molecule && molecule.atoms.length > 0) {
        // 🌟 ÉTAPE CRUCIALE : Un SMILES brut n'a pas de coordonnées X/Y.
        // On force le moteur à générer la structure 2D géométrique.
        if (cd.CoordGen && typeof cd.CoordGen.generate2DCoordinates === "function") {
          cd.CoordGen.generate2DCoordinates(molecule);
        }
        
        // Rendu final de la structure
        viewer.loadMolecule(molecule);
      } else {
        console.warn(`⚠️ Chaîne SMILES non interprétable par ChemDoodle : ${smiles}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors du dessin de la molécule :", error);
    }
  }, [smiles, isLibraryReady, width, height]);

  return (
    // Ce div sert d'ancrage stable. React gère le div, ChemDoodle gère le canvas à l'intérieur.
    <div 
      ref={containerRef} 
      className="chemdoodle-canvas-wrapper flex items-center justify-center bg-white rounded-lg" 
      style={{ width, height, minWidth: width, minHeight: height }}
    />
  );
}