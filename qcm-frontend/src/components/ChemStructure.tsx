
import { useEffect, useRef, useState } from "react";

interface Props {
  smiles: string;
}

declare global {
  interface Window {
    initRDKitModule: any;
    RDKit: any;
  }
}

export default function ChemStructure({ smiles }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Chargement UNIQUE de RDKit
  useEffect(() => {
    async function loadRDKit() {
      try {
        // Déjà chargé
        if (window.RDKit) {
          setReady(true);
          return;
        }

        // Attendre que le script CDN soit disponible
        if (!window.initRDKitModule) {
          console.error("RDKit script absent");
          return;
        }

        const RDKit = await window.initRDKitModule({
          locateFile: () => "/RDKit_minimal.wasm",
        });

        window.RDKit = RDKit;

        setReady(true);
      } catch (e) {
        console.error("RDKit init error:", e);
      }
    }

    loadRDKit();
  }, []);

  // Génération molécule
  useEffect(() => {
    if (!ready) return;
    if (!smiles) return;

    try {
      const mol = window.RDKit.get_mol(smiles);

      if (!mol) {
        console.error("Molécule invalide");
        return;
      }

      const svg = mol.get_svg(450, 220);

      if (ref.current) {
        ref.current.innerHTML = svg;

        // Style SVG
        const svgEl = ref.current.querySelector("svg");

        if (svgEl) {
          svgEl.style.width = "100%";
          svgEl.style.height = "auto";
          svgEl.style.display = "block";
          svgEl.style.background = "white";
        }
      }

      mol.delete();
    } catch (e) {
      console.error("SVG render error:", e);
    }
  }, [ready, smiles]);

  return (
    <div
      ref={ref}
      className="w-full flex justify-center items-center bg-white rounded-xl p-2"
      style={{
        minHeight: "180px",
      }}
    />
  );
}
