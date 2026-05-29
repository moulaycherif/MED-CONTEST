import React from "react";

interface ChemStructureProps {
  excelLine: string; // Reçoit la ligne brute d'Excel : "(A) :<smiles>CCCC(=O)..."
}

// Fonction utilitaire pour extraire et nettoyer le SMILES d'Excel
function extractSmiles(text: string): string {
  if (!text) return "";
  const startIdx = text.indexOf("<smiles>");
  const endIdx = text.indexOf("</smiles>");
  if (startIdx === -1 || endIdx === -1) return "";
  return text.substring(startIdx + 8, endIdx).replace(/[\r\n\t\s]/g, "").trim();
}

// Fonction de conversion d'une chaîne de carbone brute (ex: "CCCC") en formule semi-développée linéaire textuelle
function convertToSemiDeveloped(carbonChain: string): string {
  const len = carbonChain.length;
  if (len === 0) return "";
  if (len === 1) return "CH₃";
  
  const segments: string[] = [];
  for (let i = 0; i < len; i++) {
    if (i === 0 || i === len - 1) {
      segments.push("CH₃");
    } else {
      segments.push("CH₂");
    }
  }
  return segments.join("—");
}

export default function ChemStructure({ excelLine }: ChemStructureProps) {
  const smiles = extractSmiles(excelLine);

  if (!smiles) {
    return <span className="text-xs text-gray-400">Structure non lisible</span>;
  }

  const labelStyle = "font-mono text-base font-bold text-gray-800 tracking-wider select-none";

  // =========================================================================
  // 1. CAS DES ANHYDRIDES SYMÉTRIQUES OU RAMIFIÉS (Contiennent (=O)OC(=O))
  // =========================================================================
  if (smiles.includes("(=O)OC(=O)")) {
    // On sépare la partie gauche et la partie droite autour du cœur fonctionnel de l'anhydride
    const parts = smiles.split("(=O)OC(=O)");
    const leftChain = parts[0];  // Ex: "CCCC" ou "CC(C)CC"
    const rightChain = parts[1]; // Ex: "CCC" ou "CC(C)C"

    let topRadical = "";
    let bottomRadical = "";
    let topBranch: string | null = null;
    let bottomBranch: string | null = null;

    // Analyse et extraction des ramifications pour la chaîne du HAUT (gauche du SMILES)
    if (leftChain.includes("(C)")) {
      // Détecte si la ramification est sur le carbone 2 ou 3
      if (leftChain.startsWith("CCC(C)")) { 
        // Cas D : Ramification proche du groupement Carbonyle C=O
        topRadical = "CH₃—CH₂—CH";
        topBranch = "│";
      } else if (leftChain.startsWith("CC(C)CC")) {
        // Cas C : Ramification éloignée du groupement Carbonyle C=O
        topRadical = "CH₃—CH—CH₂";
        topBranch = "│";
      }
    } else {
      // Cas A : Chaîne linéaire normale (On enlève le dernier C car il porte le =O)
      const pureCarbons = leftChain.substring(0, leftChain.length - 1);
      topRadical = convertToSemiDeveloped(pureCarbons);
    }

    // Analyse et extraction des ramifications pour la chaîne du BAS (droite du SMILES)
    if (rightChain.includes("(C)")) {
      if (rightChain.startsWith("CC(C)CC") || rightChain.endsWith("C(C)CC")) {
        bottomRadical = "CH₃—CH—CH₂";
        bottomBranch = "│";
      } else if (rightChain.startsWith("C(C)C") || rightChain.includes("C(C)C")) {
        bottomRadical = "CH₃—CH₂—CH";
        bottomBranch = "│";
      }
    } else {
      // Cas linéaire normal
      bottomRadical = convertToSemiDeveloped(rightChain);
    }

    return (
      <div className="relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm inline-flex items-center justify-center min-w-[340px] min-h-[160px]">
        {/* Structure en Grille CSS pour aligner au millimètre les liaisons et radicaux */}
        <div className="flex flex-col gap-3 justify-center items-end pr-12">
          
          {/* BLOC SUPERIEUR */}
          <div className="flex flex-col items-center">
            {topBranch && <span className={`${labelStyle} text-sm leading-none text-purple-600 mb-1`}>CH₃</span>}
            {topBranch && <span className={`${labelStyle} text-xs leading-none mb-1`}>{topBranch}</span>}
            <span className={labelStyle}>{topRadical}—C═O</span>
          </div>

          {/* BLOC INFERIEUR */}
          <div className="flex flex-col items-center mt-2">
            <span className={labelStyle}>{bottomRadical}—C═O</span>
            {bottomBranch && <span className={`${labelStyle} text-xs leading-none mt-1`}>{bottomBranch}</span>}
            {bottomBranch && <span className={`${labelStyle} text-sm leading-none text-purple-600 mt-1`}>CH₃</span>}
          </div>
        </div>

        {/* Oxygène central faisant le pont de l'Anhydride */}
        <div className={`absolute right-10 ${labelStyle} text-xl font-light text-red-600`}>O</div>

        {/* Tracé géométrique vectoriel des liaisons obliques reliant les C═O à l'Oxygène */}
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="72%" y1="36%" x2="81%" y2="47%" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          <line x1="72%" y1="64%" x2="81%" y2="53%" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // 2. CAS DES ESTERS (Contiennent (=O)O)
  // =========================================================================
  if (smiles.includes("(=O)O")) {
    const parts = smiles.split("(=O)O");
    const acidPart = parts[0].substring(0, parts[0].length - 1); // Enlève le C du carbonyle
    const alcoholPart = parts[1];

    const leftRadical = convertToSemiDeveloped(acidPart);
    const rightRadical = convertToSemiDeveloped(alcoholPart);

    return (
      <div className="relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm inline-flex items-center justify-center min-w-[340px] min-h-[140px]">
        <div className="grid grid-cols-[auto_20px_auto] grid-rows-2 gap-y-4 items-center">
          <div className={labelStyle}>{leftRadical}—C</div>
          <div className={`${labelStyle} justify-start text-sm`}>═O</div>
          <div className={`${labelStyle} row-span-2 text-xl font-light text-red-600 pl-4`}>O</div>
          <div className={`${labelStyle} col-span-2 justify-start pl-12`}>{rightRadical}</div>
        </div>
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="57%" y1="36%" x2="62%" y2="45%" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          <line x1="62%" y1="55%" x2="57%" y2="64%" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // 3. CAS DES ÉTHERS (Contiennent "O" central simple)
  // =========================================================================
  if (smiles.includes("O") && !smiles.includes("=")) {
    const parts = smiles.split("O");
    const leftRadical = convertToSemiDeveloped(parts[0]);
    const rightRadical = convertToSemiDeveloped(parts[1]);

    return (
      <div className="relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm inline-flex items-center justify-center min-w-[340px] min-h-[140px]">
        <div className="grid grid-cols-[auto_20px] grid-rows-2 gap-y-6 items-center pr-8">
          <div className={labelStyle}>{leftRadical}</div>
          <div className={`${labelStyle} row-span-2 text-xl font-light text-red-600 pl-3`}>O</div>
          <div className={labelStyle}>{rightRadical}</div>
        </div>
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <line x1="74%" y1="34%" x2="83%" y2="46%" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          <line x1="74%" y1="66%" x2="83%" y2="54%" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Rendu de secours en texte si la formule n'entre dans aucune catégorie connue
  return <div className="text-xs text-gray-400 p-2">Formule non répertoriée</div>;
}