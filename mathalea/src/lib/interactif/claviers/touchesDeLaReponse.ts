/**
 * Touches à ajouter au clavier pour pouvoir écrire une réponse littérale :
 * les lettres qu'elle contient (hors commandes LaTeX comme \dfrac ou \pi),
 * la lettre \ell, la racine carrée et l'indice (`m_1`) si elle en contient.
 * À utiliser avec `optionsChampTexte.dataKeys`.
 */
export function touchesDeLaReponse(reponse: unknown): string[] {
  const textes = (Array.isArray(reponse) ? reponse : [reponse]).map(String)
  const lettres = new Set<string>()
  let avecRacine = false
  let avecEll = false
  let avecIndice = false
  for (const texte of textes) {
    if (texte.includes('_')) avecIndice = true
    if (texte.includes('\\sqrt')) avecRacine = true
    if (texte.includes('\\ell')) avecEll = true
    for (const lettre of texte.replace(/\\[a-zA-Z]+/g, '').match(/[a-zA-Z]/g) ??
      [])
      lettres.add(lettre)
  }
  return [
    ...lettres,
    ...(avecEll ? ['\\ell'] : []),
    ...(avecRacine ? ['SQRT'] : []),
    ...(avecIndice ? ['INDICE'] : []),
  ]
}
