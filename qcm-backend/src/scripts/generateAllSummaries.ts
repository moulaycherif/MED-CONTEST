import { generateSummaryPDF } from "../generators/generateSummary";

const data = {
  "Mathématique": {
    "Chapitre I : Suites & Sommes": `
Résumé du chapitre sur les suites :
- Définitions des suites
- Suite arithmétique : u(n) = u0 + n*r
- Suite géométrique : u(n) = u0 * q^n
- Sommes de termes consécutifs
`,
    "Chapitre II : Limites, Continuité & Dérivabilité": `
- Définition d'une limite
- Croissances comparées
- Continuité sur un intervalle
- Dérivabilité et interprétation graphique
`,
  }
};

Object.entries(data).forEach(([matiere, chapitres]) => {
  Object.entries(chapitres).forEach(([chapitre, texte]) => {
    const filePath = generateSummaryPDF(chapitre, matiere, texte as string);
    console.log("📄 PDF généré :", filePath);
  });
});
