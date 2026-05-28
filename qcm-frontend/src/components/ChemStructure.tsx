interface Props {
  smiles: string;
}

export default function ChemStructure({ smiles }: Props) {
  // Exemple spécifique :
  if (smiles === "CCCC(=O)OC(=O)CCC") {
    return (
      <svg width="520" height="180">
        {/* Chaîne principale */}
        <text x="20" y="90" fontSize="24">CH3</text>
        <line x1="65" y1="82" x2="100" y2="82" stroke="black" />

        <text x="105" y="90" fontSize="24">CH2</text>
        <line x1="155" y1="82" x2="190" y2="82" stroke="black" />

        <text x="195" y="90" fontSize="24">CH2</text>
        <line x1="245" y1="82" x2="280" y2="82" stroke="black" />

        <text x="285" y="90" fontSize="24">C</text>

        {/* Double liaison O */}
        <line x1="300" y1="70" x2="300" y2="35" stroke="black" />
        <line x1="306" y1="70" x2="306" y2="35" stroke="black" />

        <text x="290" y="28" fontSize="24">O</text>

        {/* Oxygène ester */}
        <line x1="315" y1="82" x2="350" y2="82" stroke="black" />

        <text x="355" y="90" fontSize="24">O</text>

        <line x1="375" y1="82" x2="410" y2="82" stroke="black" />

        <text x="415" y="90" fontSize="24">C</text>

        {/* Deuxième O */}
        <line x1="430" y1="70" x2="430" y2="35" stroke="black" />
        <line x1="436" y1="70" x2="436" y2="35" stroke="black" />

        <text x="420" y="28" fontSize="24">O</text>

        {/* Suite */}
        <line x1="445" y1="82" x2="480" y2="82" stroke="black" />

        <text x="485" y="90" fontSize="24">CH2</text>
      </svg>
    );
  }

  return (
    <div className="p-4 border rounded bg-white">
      Structure non disponible
    </div>
  );
}
