import { useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRDKitScript() {
      // Déjà chargé
      if (window.RDKit) {
        renderMolecule();
        return;
      }

      // Charger dynamiquement le script
      const script = document.createElement("script");

      script.src =
        "https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js";

      script.async = true;

      script.onload = async () => {
        try {
          const RDKit = await window.initRDKitModule({
            locateFile: () => "/RDKit_minimal.wasm",
          });

          window.RDKit = RDKit;

          renderMolecule();
        } catch (err) {
          console.error("RDKit init error:", err);
        }
      };

      script.onerror = () => {
        console.error("Impossible de charger RDKit");
      };

      document.body.appendChild(script);
    }

    function renderMolecule() {
      try {
        if (!window.RDKit) return;

        const mol = window.RDKit.get_mol(smiles);

        if (!mol) {
          console.error("Molécule invalide");
          return;
        }

        const svg = mol.get_svg(420, 220);

        if (mounted && containerRef.current) {
          containerRef.current.innerHTML = svg;

          const svgEl =
            containerRef.current.querySelector("svg");

          if (svgEl) {
            svgEl.style.width = "100%";
            svgEl.style.height = "auto";
            svgEl.style.background = "white";
            svgEl.style.borderRadius = "12px";
          }
        }

        mol.delete();
      } catch (err) {
        console.error("RDKit render error:", err);
      }
    }

    loadRDKitScript();

    return () => {
      mounted = false;
    };
  }, [smiles]);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl p-2 flex justify-center items-center"
      style={{
        minHeight: "220px",
      }}
    />
  );
}
