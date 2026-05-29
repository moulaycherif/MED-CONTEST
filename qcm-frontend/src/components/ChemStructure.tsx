import React from "react";

interface ChemStructureProps {
  id: "A" | "B" | "C" | "D" | "E" | string; // L'identifiant de la molécule dans votre Excel
  width?: number;
  height?: number;
}

export default function ChemStructure({ id, width = 280, height = 180 }: ChemStructureProps) {
  
  // Style commun pour aligner les textes et les liaisons
  const cellStyle = "flex items-center justify-center font-mono text-sm font-bold text-gray-800 select-none";

  // Rendu de la Molécule A : Anhydride butyrique
  if (id === "A") {
    return (
      <div className="relative flex items-center justify-center bg-white p-2" style={{ width, height }}>
        <div className="grid grid-cols-[auto_15px_15px] grid-rows-2 gap-y-4">
          <div className={cellStyle}>CH₃—CH₂—CH₂—C</div>
          <div className={`${cellStyle} justify-start`}>═O</div>
          <div className={`${cellStyle} row-span-2 text-xl font-light`}>O</div>
          <div className={cellStyle}>CH₃—CH₂—CH₂—C</div>
          <div className={`${cellStyle} justify-start`}>═O</div>
        </div>
        {/* Liaisons obliques de l'anhydride dessinées en SVG absolu */}
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="68%" y1="36%" x2="74%" y2="46%" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="68%" y1="64%" x2="74%" y2="54%" stroke="#1f2937" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // Rendu de la Molécule B : Butanoate de propyl
  if (id === "B") {
    return (
      <div className="relative flex items-center justify-center bg-white p-2" style={{ width, height }}>
        <div className="grid grid-cols-[auto_15px_auto] grid-rows-2 gap-y-4">
          <div className={cellStyle}>CH₃—CH₂—CH₂—C</div>
          <div className={`${cellStyle} justify-start`}>═O</div>
          <div className={`${cellStyle} row-span-2 text-xl font-light pl-1`}>O</div>
          <div className={`${cellStyle} col-span-2 justify-start pl-8`}>CH₃—CH₂—CH₂</div>
        </div>
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="59%" y1="36%" x2="64%" y2="45%" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="64%" y1="55%" x2="59%" y2="64%" stroke="#1f2937" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // Rendu de la Molécule C : Anhydride isovallérique (ramification en position 3)
  if (id === "C") {
    return (
      <div className="relative flex items-center justify-center bg-white p-2" style={{ width, height }}>
        <div className="flex flex-col gap-1 items-start">
          {/* Chaîne du haut */}
          <div className="flex flex-col items-center pl-8">
            <span className="text-xs font-bold font-mono">CH₃</span>
            <span className="text-xs font-mono leading-3">│</span>
            <span className="text-sm font-bold font-mono">CH₃—CH—CH₂—C═O</span>
          </div>
          {/* Chaîne du bas */}
          <div className="flex flex-col items-center pl-8 mt-2">
            <span className="text-sm font-bold font-mono">CH₃—CH—CH₂—C═O</span>
            <span className="text-xs font-mono leading-3">│</span>
            <span className="text-xs font-bold font-mono">CH₃</span>
          </div>
        </div>
        {/* Atome d'oxygène central et ponts */}
        <div className="absolute right-6 font-mono text-xl font-bold">O</div>
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="74%" y1="34%" x2="84%" y2="46%" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="74%" y1="67%" x2="84%" y2="54%" stroke="#1f2937" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // Rendu de la Molécule D : Anhydride 2-méthylbutanoïque (ramification en position 2)
  if (id === "D") {
    return (
      <div className="relative flex items-center justify-center bg-white p-2" style={{ width, height }}>
        <div className="flex flex-col gap-1 items-start">
          {/* Chaîne du haut */}
          <div className="flex flex-col items-center pl-16">
            <span className="text-xs font-bold font-mono">CH₃</span>
            <span className="text-xs font-mono leading-3">│</span>
            <span className="text-sm font-bold font-mono">CH₃—CH₂—CH—C═O</span>
          </div>
          {/* Chaîne du bas */}
          <div className="flex flex-col items-center pl-16 mt-2">
            <span className="text-sm font-bold font-mono">CH₃—CH₂—CH—C═O</span>
            <span className="text-xs font-mono leading-3">│</span>
            <span className="text-xs font-bold font-mono">CH₃</span>
          </div>
        </div>
        <div className="absolute right-4 font-mono text-xl font-bold">O</div>
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="77%" y1="34%" x2="88%" y2="46%" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="77%" y1="67%" x2="88%" y2="54%" stroke="#1f2937" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // Rendu de la Molécule E : Oxyde de butyle (Éther)
  if (id === "E") {
    return (
      <div className="relative flex items-center justify-center bg-white p-2" style={{ width, height }}>
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

  // Secours si aucune molécule ne correspond
  return <div className="text-xs text-gray-400">Structure non répertoriée ({id})</div>;
}