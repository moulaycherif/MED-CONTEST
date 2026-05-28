interface ChemStructureProps {
  smiles: string;
  width?: number;
  height?: number;
}

export default function ChemStructure({ smiles, width = 160, height = 120 }: ChemStructureProps) {
  if (!smiles) return null;

  // On encode proprement le SMILES pour l'injecter de manière sécurisée dans l'URL
  const encodedSmiles = encodeURIComponent(smiles.trim());
  
  // URL de l'API officielle de PubChem pour générer le rendu 2D de la structure
  const imageUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodedSmiles}/PNG?record_type=2d&image_size=${width}x${height}`;

  return (
    <div 
      className="flex items-center justify-center bg-white rounded-xl p-2 border border-gray-100 shadow-sm transition-all hover:shadow-md"
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <img
        src={imageUrl}
        alt={`Structure chimique : ${smiles}`}
        className="object-contain max-w-full max-h-full"
        loading="lazy"
        onError={(e) => {
          // En cas de problème ou de SMILES mal nettoyé, on affiche un message propre au lieu d'un bug
          console.error(`Erreur de rendu PubChem pour le SMILES : ${smiles}`);
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}