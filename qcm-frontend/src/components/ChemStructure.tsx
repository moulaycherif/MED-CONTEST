import { useEffect, useRef } from "react";

interface Props {
  smiles: string;
}

declare global {
  interface Window {
    initRDKitModule: any;
  }
}

export default function ChemStructure({ smiles }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function renderMol() {
      try {
        if (!window.initRDKitModule) return;

        const RDKit = await window.initRDKitModule({
          locateFile: () => "/RDKit_minimal.wasm",
        });

        const mol = RDKit.get_mol(smiles);

        if (!mol) return;

        const svg = mol.get_svg();

        if (mounted && containerRef.current) {
          containerRef.current.innerHTML = svg;

          const svgEl = containerRef.current.querySelector("svg");

          if (svgEl) {
            svgEl.setAttribute("width", "420");
            svgEl.setAttribute("height", "220");
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
          }
        }

        mol.delete();
      } catch (err) {
        console.error("RDKit render error:", err);
      }
    }

    renderMol();

    return () => {
      mounted = false;
    };
  }, [smiles]);

  return <div ref={containerRef} className="bg-white p-2 rounded-xl" />;
}