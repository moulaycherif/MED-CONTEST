import { convert } from "mathml-to-latex";

/**
 * Convertit les équations Word (MathML)
 * en LaTeX compatible KaTeX
 */
export function convertMathMLToLatex(html: string): string {
  return html.replace(
    /<math[\s\S]*?<\/math>/g,
    (mathml) => `$$ ${convert(mathml)} $$`
  );
}
