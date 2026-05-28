import { useEffect, useRef } from "react";
import initRDKitModule from "@rdkit/rdkit";

interface Props {
  smiles: string;
}

export default function ChemStructure({ smiles }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function renderMol() {
      if (!containerRef.current || !smiles) return;

      try {
        const RDKit = await initRDKitModule();

        const mol = RDKit.get_mol(smiles);

        if (!mol) return;

        const svg = mol.get_svg_with_highlights(JSON.stringify({}));

        if (mounted && containerRef.current) {
          containerRef.current.innerHTML = svg;

          // amélioration visuelle
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

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl p-2"
    />
  );
}