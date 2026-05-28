import { useEffect, useRef, useState } from "react";

interface ChemStructureProps {
  smiles: string;
  width?: number;
  height?: number;
}

export default function ChemStructure({ smiles, width = 160, height = 120 }: ChemStructureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  // 1. CHARGEMENT DYNAMIQUE DEPUIS LE SERVEUR OFFICIEL DE CHEMDOODLE
  useEffect(() => {
    if ((window as any).ChemDoodle) {
      setIsLibraryLoaded(true);
      return;
    }

    // Injection du CSS officiel
    if (!document.getElementById("chemdoodle-core-css")) {
      const link = document.createElement("link");
      link.id = "chemdoodle-core-css";
      link.rel = "stylesheet";
      link.href = "https://hub.chemdoodle.com/cwc/latest/ChemDoodleWeb.css";
      link.type = "text/css";
      document.head.appendChild(link);
    }

    // Injection du JavaScript officiel
    if (!document.getElementById("chemdoodle-core-js")) {
      const script = document.createElement("script");
      script.id = "chemdoodle-core-js";
      script.type = "text/javascript";
      script.src = "https://hub.chemdoodle.com/cwc/latest/ChemDoodleWeb.js";
      script.async = true;
      script.onload = () => {
        console.log("✅ ChemDoodle Web Components chargé dynamiquement !");
        setIsLibraryLoaded(true);
      };
      script.onerror = () => {
        console.error("❌ Impossible de charger ChemDoodle depuis le hub officiel");
      };
      document.body.appendChild(script);
    }
  }, []);

  // 2. RENDU DE LA FORMULE CHIMIQUE EXCEL
  useEffect(() => {
    if (!isLibraryLoaded || !containerRef.current || !smiles) return;

    const cd = (window as any).ChemDoodle;
    if (!cd) return;

    try {
      const uniqueCanvasId = `canvas-${Math.random().toString(36).substring(2, 9)}`;
      containerRef.current.innerHTML = "";

      const canvasEl = document.createElement("canvas");
      canvasEl.id = uniqueCanvasId;
      canvasEl.width = width;
      canvasEl.height = height;
      containerRef.current.appendChild(canvasEl);

      const viewer = new cd.ViewerCanvas(uniqueCanvasId, width, height);

      // Personnalisation des atomes pour vos exercices d'orga
      viewer.specs.atoms_displayLabels_O = true;
      viewer.specs.atoms_displayLabels_N = true;
      viewer.specs.bonds_width_2d = 2;
      viewer.specs.atoms_font_size_2d = 12;
      viewer.specs.backgroundColor = "transparent";

      const molecule = cd.readSMILES(smiles);

      if (molecule && molecule.atoms.length > 0) {
        // Recalcul des coordonnées des liaisons (indispensable pour le SMILES)
        if (cd.CoordGen && typeof cd.CoordGen.generate2DCoordinates === "function") {
          cd.CoordGen.generate2DCoordinates(molecule);
        }
        viewer.loadMolecule(molecule);
      } else {
        console.warn(`⚠️ Chaîne SMILES vide ou non reconnue : ${smiles}`);
      }
    } catch (error) {
      console.error("❌ Erreur de rendu de la structure :", error);
    }
  }, [smiles, isLibraryLoaded, width, height]);

  return (
    <div 
      ref={containerRef} 
      className="chemdoodle-canvas-wrapper flex items-center justify-center bg-white rounded-lg p-1" 
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      {!isLibraryLoaded && (
        <span className="text-xs text-purple-500 animate-pulse font-medium">
          Chargement de la structure...
        </span>
      )}
    </div>
  );
}