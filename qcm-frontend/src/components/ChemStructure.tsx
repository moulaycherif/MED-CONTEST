import React from "react";

interface ChemStructureProps {
  excelLine: string; // Prend la ligne d'Excel complète, ex: "(E) :<smiles>CCCCOCCCC</smiles>"
}

// Nettoie et extrait le SMILES de la cellule Excel
function getCleanSmiles(text: string): string {
  if (!text) return "";
  const start = text.indexOf("<smiles>");
  const end = text.indexOf("</smiles>");
  if (start === -1 || end === -1) return "";
  return text.substring(start + 8, end).replace(/[\r\n\t\s]/g, "").trim();
}

// Calcule la chaîne de texte semi-développée linéaire
function makeSemiDevelopedChain(carbonCount: number): string {
  if (carbonCount <= 0) return "";
  if (carbonCount === 1) return "CH₃";
  const pieces = [];
  for (let i = 0; i < carbonCount; i++) {
    if (i === 0 || i === carbonCount - 1) pieces.push("CH₃");
    else pieces.push("CH₂");
  }
  return pieces.join("—");
}

export default function ChemStructure({ excelLine }: ChemStructureProps) {
  const smiles = getCleanSmiles(excelLine);

  if (!smiles) {
    return <span className="text-xs text-gray-400">Structure introuvable</span>;
  }

  // Dimensions fixes pour l'espace de dessin vectoriel
  const svgWidth = 380;
  const svgHeight = 180;

  // Styles typographiques pour correspondre exactement à une publication ou un examen
  const textProps = {
    fontFamily: "monospace, Courier, serif",
    fontSize: "15px",
    fontWeight: "bold" as const,
    fill: "#1f2937",
    textAnchor: "middle" as const,
    dominantBaseline: "central" as const,
  };

  // =========================================================================
  // CAS (E) : LES ÉTHERS (ex: CCCCOCCCC)
  // =========================================================================
  if (smiles.includes("O") && !smiles.includes("=")) {
    const parts = smiles.split("O");
    const leftLen = parts[0].length;
    const rightLen = parts[1].length;

    // Transformation en chaînes textuelles (ex: CH3—CH2—CH2—CH2)
    const topChain = makeSemiDevelopedChain(leftLen);
    const bottomChain = makeSemiDevelopedChain(rightLen);

    // Coordonnées calculées pour aligner les deux chaînes en parallèle
    const chainX = 140; 
    const topY = 50;
    const bottomY = 130;
    const oxygenX = 310;
    const oxygenY = 90;

    return (
      <div className="bg-white p-2 inline-block rounded-xl border border-gray-100 shadow-sm select-none">
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Chaîne supérieure */}
          <text x={chainX} y={topY} {...textProps}>{topChain}</text>
          
          {/* Chaîne inférieure */}
          <text x={chainX} y={bottomY} {...textProps}>{bottomChain}</text>
          
          {/* Atome d'oxygène central */}
          <text x={oxygenX} y={oxygenY} {...textProps} fontSize="20px" fill="#dc2626">O</text>

          {/* Liaisons inclinées depuis le dernier groupe CH2/CH3 des chaînes vers l'Oxygène */}
          {/* Les coordonnées de départ tiennent compte de la longueur du texte de la chaîne */}
          <line x1={chainX + (leftLen * 18)} y1={topY + 5} x2={oxygenX - 15} y2={oxygenY - 12} stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          <line x1={chainX + (rightLen * 18)} y1={bottomY - 5} x2={oxygenX - 15} y2={oxygenY + 12} stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // CAS (A), (C), (D) : LES ANHYDRIDES (Contiennent (=O)OC(=O))
  // =========================================================================
  if (smiles.includes("(=O)OC(=O)")) {
    const parts = smiles.split("(=O)OC(=O)");
    const leftPart = parts[0];
    const rightPart = parts[1];

    // Variables de configuration géométrique
    let topText = "";
    let bottomText = "";
    
    // Détecteurs de ramifications
    let topRamification: { x: number; y: number } | null = null;
    let bottomRamification: { x: number; y: number } | null = null;

    // 1. Analyse de la chaîne supérieure (gauche du cœur d'anhydride)
    if (leftPart.includes("(C)")) {
      if (leftPart.startsWith("CCC(C)")) {
        // Cas D : Ramification proche du carbonyle
        topText = "CH₃—CH₂—CH—C";
        topRamification = { x: 145, y: 20 }; // Position au-dessus du CH concerné
      } else {
        // Cas C : Ramification en bout de chaîne
        topText = "CH₃—CH—CH₂—C";
        topRamification = { x: 95, y: 20 };
      }
    } else {
      // Cas A : Chaîne linéaire
      const carbons = leftPart.substring(0, leftPart.length - 1);
      topText = makeSemiDevelopedChain(carbons) + "—C";
    }

    // 2. Analyse de la chaîne inférieure (droite du cœur d'anhydride)
    if (rightPart.includes("(C)")) {
      if (rightPart.startsWith("CC(C)C")) {
        bottomText = "CH₃—CH₂—CH—C";
        bottomRamification = { x: 145, y: 160 }; // Position en-dessous du CH concerné
      } else {
        bottomText = "CH₃—CH—CH₂—C";
        bottomRamification = { x: 95, y: 160 };
      }
    } else {
      bottomText = makeSemiDevelopedChain(rightPart) + "—C";
    }

    // Positions clés du squelette de l'Anhydride
    const topChainY = 50;
    const bottomChainY = 130;
    const oX = 320;
    const oY = 90;

    return (
      <div className="bg-white p-2 inline-block rounded-xl border border-gray-100 shadow-sm select-none">
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          
          {/* Ligne du haut : Radical + Carbonyle */}
          <text x={150} y={topChainY} {...textProps}>{topText}</text>
          {/* Double liaison Oxygène du haut (═O) inclinée à 45° ou verticale */}
          <text x={245} y={topChainY - 25} {...textProps}>O</text>
          <line x1={237} y1={topChainY - 12} x2={237} y2={topChainY - 2} stroke="#1f2937" strokeWidth="1.5" />
          <line x1={242} y1={topChainY - 12} x2={242} y2={topChainY - 2} stroke="#1f2937" strokeWidth="1.5" />

          {/* Ramification haute si existante */}
          {topRamification && (
            <>
              <line x1={topRamification.x} y1={topChainY - 10} x2={topRamification.x} y2={topRamification.y + 8} stroke="#1f2937" strokeWidth="2" />
              <text x={topRamification.x} y={topRamification.y} {...textProps} fill="#7c3aed">CH₃</text>
            </>
          )}

          {/* Ligne du bas : Radical + Carbonyle */}
          <text x={150} y={bottomChainY} {...textProps}>{bottomText}</text>
          {/* Double liaison Oxygène du bas (═O) */}
          <text x={245} y={bottomChainY + 25} {...textProps}>O</text>
          <line x1={237} y1={bottomChainY + 12} x2={237} y2={bottomChainY + 2} stroke="#1f2937" strokeWidth="1.5" />
          <line x1={242} y1={bottomChainY + 12} x2={242} y2={bottomChainY + 2} stroke="#1f2937" strokeWidth="1.5" />

          {/* Ramification basse si existante */}
          {bottomRamification && (
            <>
              <line x1={bottomRamification.x} y1={bottomChainY + 10} x2={bottomRamification.x} y2={bottomRamification.y - 8} stroke="#1f2937" strokeWidth="2" />
              <text x={bottomRamification.x} y={bottomRamification.y} {...textProps} fill="#7c3aed">CH₃</text>
            </>
          )}

          {/* Pont Oxygène central */}
          <text x={oX} y={oY} {...textProps} fontSize="20px" fill="#dc2626">O</text>

          {/* Liaisons obliques liant les Carbones des Carbonyles à l'Oxygène central */}
          <line x1={265} y1={topChainY} x2={oX - 15} y2={oY - 12} stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          <line x1={265} y1={bottomChainY} x2={oX - 15} y2={oY + 12} stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // =========================================================================
  // CAS (B) : LES ESTERS (Contiennent (=O)O)
  // =========================================================================
  if (smiles.includes("(=O)O")) {
    const parts = smiles.split("(=O)O");
    const acidCount = parts[0].length - 1; 
    const alcoholCount = parts[1].length;

    const leftChain = makeSemiDevelopedChain(acidCount) + "—C";
    const rightChain = makeSemiDevelopedChain(alcoholCount);

    return (
      <div className="bg-white p-2 inline-block rounded-xl border border-gray-100 shadow-sm select-none">
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Partie Acide à gauche */}
          <text x={110} y={70} {...textProps}>{leftChain}</text>
          
          {/* Double liaison Carbonyle du haut */}
          <text x={185} y={35} {...textProps}>O</text>
          <line x1={181} y1={45} x2={181} y2={58} stroke="#1f2937" strokeWidth="1.5" />
          <line x1={186} y1={45} x2={186} y2={58} stroke="#1f2937" strokeWidth="1.5" />

          {/* Oxygène simple liaison */}
          <text x={240} y={100} {...textProps} fontSize="20px" fill="#dc2626">O</text>

          {/* Liaison oblique vers l'oxygène */}
          <line x1={200} y1={75} x2={228} y2={92} stroke="#1f2937" strokeWidth="2" />

          {/* Liaison oblique sortant de l'oxygène vers la chaîne de droite */}
          <line x1={252} y1={108} x2={275} y2={125} stroke="#1f2937" strokeWidth="2" />

          {/* Partie Alcool décalée en bas à droite */}
          <text x={315} y={135} {...textProps}>{rightChain}</text>
        </svg>
      </div>
    );
  }

  return <div className="text-xs text-gray-400 p-2">Famille moléculaire non supportée</div>;
}