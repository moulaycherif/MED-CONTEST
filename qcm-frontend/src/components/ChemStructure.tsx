import React, { useEffect, useRef } from "react";
// @ts-ignore
import SmilesDrawer from "smiles-drawer";

interface ChemStructureProps {
  excelLine: string; // Reçoit la ligne brute : "(A) :<smiles>CCCC(=O)..."
  width?: number;
  height?: number;
}

export default function ChemStructure({ excelLine, width = 300, height = 200 }: ChemStructureProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!excelLine || !svgRef.current) return;

    // 1. Extraction chirurgicale du SMILES à l'intérieur des balises <smiles>
    const startIdx = excelLine.indexOf("<smiles>");
    const endIdx = excelLine.indexOf("</smiles>");
    
    if (startIdx === -1 || endIdx === -1) return;

    const rawSmiles = excelLine.substring(startIdx + 8, endIdx);
    const cleanSmiles = rawSmiles.replace(/[\r\n\t\s]/g, "").trim();

    try {
      // 2. Configuration professionnelle du moteur de rendu
      const options = {
        width: width,
        height: height,
        bondThickness: 2,
        bondLength: 30,
        fontSizeLarge: 14,
        fontSizeSmall: 10,
        padding: 15,
        // Enclenche le mode "Semi-développé" académique
        explicitHydrogens: true, 
        drawHydrogen: true,
        terminalCarbons: true,
        // Palette de couleurs (Noir et blanc pro pour examen, ou couleur)
        themes: {
          dark: {
            C: "#1f2937",
            O: "#dc2626", // Rouge discret pour l'oxygène si souhaité, sinon mettez #1f2937
            H: "#4b5563",
            LINE: "#1f2937"
          }
        },
        defaultTheme: "dark"
      };

      // 3. Initialisation du Drawer
      const drawer = new SmilesDrawer.SvgDrawer(options);

      // 4. Analyse du SMILES et rendu vectoriel immédiat
      SmilesDrawer.parse(cleanSmiles, (tree: any) => {
        drawer.draw(tree, svgRef.current, "dark", false);
      }, (err: any) => {
        console.error("❌ Erreur de parsing du SMILES :", err);
      });

    } catch (error) {
      console.error("❌ Erreur lors de la génération de la structure :", error);
    }
  }, [excelLine, width, height]);

  return (
    <div className="flex items-center justify-center bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
      <svg 
        ref={svgRef} 
        style={{ width, height }} 
        viewBox={`0 0 ${width} ${height}`}
      />
    </div>
  );
}