/**
 * Barème à 3 paliers pour les exercices notés par `correctionInteractive`
 * (grilles ApiGeom en tracé libre, comme le shikaku ou le SquarO), qui ne peut
 * retourner qu'une liste de `'OK'`/`'KO'` comptés un par un plutôt qu'une note
 * continue.
 *
 * Le premier palier est acquis dès que le tiers de la grille est correct, le
 * deuxième aux deux tiers, le troisième seulement si la grille est
 * entièrement valide (une grille peut être aux trois quarts correcte en
 * proportion sans être valide, par exemple si elle ne respecte pas une
 * contrainte globale comme le nombre total de points à placer).
 *
 * @author Rémi Angot
 */
export const PALIERS_TROIS_POINTS = [1 / 3, 2 / 3, 1] as const

export function resultatParPaliers(
  proportion: number,
  estEntierementValide: boolean,
): ('OK' | 'KO')[] {
  return PALIERS_TROIS_POINTS.map((seuil, index) => {
    const dernierPalier = index === PALIERS_TROIS_POINTS.length - 1
    const seuilAtteint = proportion >= seuil
    return seuilAtteint && (!dernierPalier || estEntierementValide)
      ? 'OK'
      : 'KO'
  })
}
