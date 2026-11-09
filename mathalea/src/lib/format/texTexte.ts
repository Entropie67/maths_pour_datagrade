/**
 * Écrit du texte en mode mathématiques
 * @author Rémi Angot
 */
export function texTexte(texte: string): string {
  return '~\\text{' + texte + '}'
}

/**
 * Écrit du texte gras en mode mathématiques
 * @author Éric Elter
 */
export function texTexteGras(texte: string): string {
  return '~\\textbf{' + texte + '}'
}
