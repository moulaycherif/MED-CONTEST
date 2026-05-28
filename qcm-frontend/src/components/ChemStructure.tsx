import { useEffect, useRef, useState } from "react";

interface ChemStructureProps {
  smiles: string;
  width?: number;
  height?: number;
}

export default function ChemStructure({ smiles, width = 160, height = 120 }: ChemStructureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  useEffect(() => {
    if ((window as any).ChemDoodle) {
      setIsLibraryLoaded(true);
      return;
    }

    // 🌟 URLs de secours sur le CDN mondial Cloudflare (cdnjs)
    if (!document.getElementById("chemdoodle-cdnjs-css")) {
      const link = document.createElement("link");
      link.id = "chemdoodle-cdnjs-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/ChemDoodle/9.5.0/ChemDoodleWeb.css";
      link.type = "text/css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("chemdoodle-cdnjs-js")) {
      const script = document.createElement("script");
      script.id = "chemdoodle-cdnjs-js";
      script.type = "text/javascript";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/ChemDoodle/9.5.0/ChemDoodleWeb.js";
      script.async = true;
      script.onload = () => {
        console.log("✅ ChemDoodle chargé depuis cdnjs !");
        setIsLibraryLoaded(true);
      };
      script.onerror = () => {
        console.error("❌ Impossible de charger ChemDoodle depuis cdnjs");
      };
      document.body.appendChild(script);
    }
  }, []);

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

      viewer.specs.atoms_displayLabels_O = true;
      viewer.specs.atoms_displayLabels_N = true;
      viewer.specs.bonds_width_2d = 2;
      viewer.specs.atoms_font_size_2d = 12;
      viewer.specs.backgroundColor = "transparent";

      const molecule = cd.readSMILES(smiles);

      if (molecule && molecule.atoms.length > 0) {
        if (cd.CoordGen && typeof cd.CoordGen.generate2DCoordinates === "function") {
          cd.CoordGen.generate2DCoordinates(molecule);
        }
        viewer.loadMolecule(molecule);
      } else {
        console.warn(`⚠️ SMILES vide ou non reconnu : ${smiles}`);
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