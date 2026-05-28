import { useEffect, useRef, useState } from "react";

interface ChemStructureProps {
  smiles: string;
  width?: number;
  height?: number;
}

export default function ChemStructure({ smiles, width = 160, height = 120 }: ChemStructureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  // 1. CHARGEMENT DYNAMIQUE EN LIGNE (Injecte les scripts directement dans la page active)
  useEffect(() => {
    // Si la librairie est déjà présente en mémoire, pas besoin de la recharger
    if ((window as any).ChemDoodle) {
      setIsLibraryLoaded(true);
      return;
    }

    // Injection automatique du fichier CSS de ChemDoodle
    if (!document.getElementById("chemdoodle-css")) {
      const link = document.createElement("link");
      link.id = "chemdoodle-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/chemdoodle@9.5.0/install/ChemDoodleWeb.css";
      link.type = "text/css";
      document.head.appendChild(link);
    }

    // Injection automatique du fichier JS de ChemDoodle
    if (!document.getElementById("chemdoodle-js")) {
      const script = document.createElement("script");
      script.id = "chemdoodle-js";
      script.type = "text/javascript";
      script.src = "https://unpkg.com/chemdoodle@9.5.0/install/ChemDoodleWeb.js";
      script.async = true;
      script.onload = () => {
        console.log("✅ ChemDoodle chargé dynamiquement avec succès !");
        setIsLibraryLoaded(true);
      };
      script.onerror = () => {
        console.error("❌ Échec du chargement du script de secours ChemDoodle");
      };
      document.body.appendChild(script);
    }
  }, []);

  // 2. RENDU DE LA MOLÉCULE (Une fois que le script est chargé et actif)
  useEffect(() => {
    if (!isLibraryLoaded || !containerRef.current || !smiles) return;

    const cd = (window as any).ChemDoodle;
    if (!cd) return;

    try {
      const uniqueCanvasId = `canvas-${Math.random().toString(36).substring(2, 9)}`;

      // Nettoyage complet du conteneur pour éviter les doublons de canvas
      containerRef.current.innerHTML = "";

      // Création dynamique du canvas HTML
      const canvasEl = document.createElement("canvas");
      canvasEl.id = uniqueCanvasId;
      canvasEl.width = width;
      canvasEl.height = height;
      containerRef.current.appendChild(canvasEl);

      // Initialisation du visualiseur ChemDoodle
      const viewer = new cd.ViewerCanvas(uniqueCanvasId, width, height);

      // Paramètres esthétiques
      viewer.specs.atoms_displayLabels_O = true;
      viewer.specs.atoms_displayLabels_N = true;
      viewer.specs.bonds_width_2d = 2;
      viewer.specs.atoms_font_size_2d = 12;
      viewer.specs.backgroundColor = "transparent";

      // Interprétation de la chaîne SMILES issue de votre fichier Excel
      const molecule = cd.readSMILES(smiles);

      if (molecule && molecule.atoms.length > 0) {
        // Génération obligatoire des coordonnées 2D (les structures SMILES n'ont pas de coordonnées de base)
        if (cd.CoordGen && typeof cd.CoordGen.generate2DCoordinates === "function") {
          cd.CoordGen.generate2DCoordinates(molecule);
        }
        
        // Dessin final
        viewer.loadMolecule(molecule);
      } else {
        console.warn(`⚠️ SMILES invalide ou vide : ${smiles}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors du rendu de la structure chimique :", error);
    }
  }, [smiles, isLibraryLoaded, width, height]);

  return (
    <div 
      ref={containerRef} 
      className="chemdoodle-canvas-wrapper flex items-center justify-center bg-white rounded-lg p-1" 
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      {!isLibraryLoaded && (
        <span className="text-xs text-gray-400 animate-pulse">Chargement molécule...</span>
      )}
    </div>
  );
}