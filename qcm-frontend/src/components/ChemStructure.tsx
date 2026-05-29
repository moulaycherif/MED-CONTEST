import React from "react";

interface ChemStructureProps {
  excelLine: string; // Exemple reçu : "(A) :<smiles>CCCC(=O)OC(=O)CCC</smiles>"
  width?: number;
  height?: number;
}

export default function ChemStructure({ excelLine, width = 280, height = 180 }: ChemStructureProps) {
  if (!excelLine) return null;

  // 🔍 Extraction automatique de la lettre (A, B, C, D ou E) au début du texte d'Excel
  const match = excelLine.match(/^\s*\(([A-E])\)/i);
  const id = match ? match[1].toUpperCase() : "";

  // Styles CSS communs pour aligner les blocs textuels
  const cellStyle = "flex items-center justify-center font-mono text-sm font-bold text-gray-800 select-none";

  // 🧪 MOLÉCULE A : Anhydride butyrique
  if (id === "A") {
    return (
      <div className="relative flex items-center justify-center bg-white p-2 mx-auto" style={{ width, height }}>
        <div className="grid grid-cols-[auto_15px_15px] grid-rows-2 gap-y-4">
          <div className={cellStyle}>CH₃—CH₂—CH₂—C</div>
          <div className={`${cellStyle} justify-start`}>═O</div>
          <div className={`${cellStyle} row-span-2 text-xl font-light pl-1`}>O</div>
          <div className={cellStyle}>CH₃—CH₂—CH₂—C</div>
          <div className={`${cellStyle} justify-start`}>═O</div>
        </div>
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="68%" y1="36%" x2="74%" y2="46%" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="68%" y1="64%" x2="74%" y2="54%" stroke="#1f2937" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // 🧪 MOLÉCULE B : Butanoate de propyl
  if (id === "B") {
    return (
      <div className="relative flex items-center justify-center bg-white p-2 mx-auto" style={{ width, height }}>
        <div className="grid grid-cols-[auto_15px_auto] grid-rows-2 gap-y-4">
          <div className={cellStyle}>CH₃—CH₂—CH₂—C</div>
          <div className={`${cellStyle} justify-start`}>═O</div>
          <div className={`${cellStyle} row-span-2 text-xl font-light pl-2`}>O</div>
          <div className={`${cellStyle} col-span-2 justify-start pl-8`}>CH₃—CH₂—CH₂</div>
        </div>
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="59%" y1="36%" x2="64%" y2="45%" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="64%" y1="55%" x2="59%" y2="64%" stroke="#1f2937" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // 🧪 MOLÉCULE C : Anhydride isovalérique (Ramification CH3 sur le 2e carbone en partant de la gauche)
  if (id === "C") {
    return (
      <div className="relative flex items-center justify-center bg-white p-2 mx-auto" style={{ width, height }}>
        <div className="flex flex-col gap-1 items-start pr-6">
          {/* Chaîne supérieure */}
          <div className="flex flex-col items-center pl-8">
            <span className="text-xs font-bold font-mono">CH₃</span>
            <span className="text-xs font-mono leading-3">│</span>
            <span className="text-sm font-bold font-mono">CH₃—CH—CH₂—C═O</span>
          </div>
          {/* Chaîne inférieure */}
          <div className="flex flex-col items-center pl-8 mt-2">
            <span className="text-sm font-bold font-mono">CH₃—CH—CH₂—C═O</span>
            <span className="text-xs font-mono leading-3">│</span>
            <span className="text-xs font-bold font-mono">CH₃</span>
          </div>
        </div>
        <div className="absolute right-8 font-mono text-xl font-bold">O</div>
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="72%" y1="34%" x2="82%" y2="46%" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="72%" y1="67%" x2="82%" y2="54%" stroke="#1f2937" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // 🧪 MOLÉCULE D : Anhydride 2-méthylbutanoïque (Ramification CH3 collée au carbone du Carbonyle C=O)
  if (id === "D") {
    return (
      <div className="relative flex items-center justify-center bg-white p-2 mx-auto" style={{ width, height }}>
        <div className="flex flex-col gap-1 items-start pr-6">
          {/* Chaîne supérieure */}
          <div className="flex flex-col items-center pl-16">
            <span className="text-xs font-bold font-mono">CH₃</span>
            <span className="text-xs font-mono leading-3">│</span>
            <span className="text-sm font-bold font-mono">CH₃—CH₂—CH—C═O</span>
          </div>
          {/* Chaîne inférieure */}
          <div className="flex flex-col items-center pl-16 mt-2">
            <span className="text-sm font-bold font-mono">CH₃—CH₂—CH—C═O</span>
            <span className="text-xs font-mono leading-3">│</span>
            <span className="text-xs font-bold font-mono">CH₃</span>
          </div>
        </div>
        <div className="absolute right-6 font-mono text-xl font-bold">O</div>
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="76%" y1="34%" x2="86%" y2="46%" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="76%" y1="67%" x2="86%" y2="54%" stroke="#1f2937" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // 🧪 MOLÉCULE E : Oxyde de butyle (Éther)
  if (id === "E") {
    return (
      <div className="relative flex items-center justify-center bg-white p-2 mx-auto" style={{ width, height }}>
        <div className="grid grid-cols-[auto_20px] grid-rows-2 gap-y-6 pr-8">
          <div className={cellStyle}>CH₃—CH₂—CH₂—CH₂</div>
          <div className={`${cellStyle} row-span-2 text-xl font-light pl-2`}>O</div>
          <div className={cellStyle}>CH₃—CH₂—CH₂—CH₂</div>
        </div>
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="72%" y1="35%" x2="81%" y2="47%" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="72%" y1="65%" x2="81%" y2="53%" stroke="#1f2937" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  return <div className="text-xs text-gray-400 p-2">Structure indéterminée</div>;
}