/**
 * AxioMaths (DataGrade) : garde le champ en cours de saisie visible au-dessus
 * du clavier virtuel. Le clavier est fixé en bas de la fenêtre ; sans cela, un
 * champ situé dans le bas de l'écran reste caché derrière lui et l'élève tape
 * sans voir ce qu'il écrit. Fichier propre à l'habillage DataGrade, absent du
 * dépôt MathALÉA amont.
 */

/** Espace laissé entre le bas du champ et le haut du clavier, en pixels. */
const MARGE = 24
/** Durée de l'apparition du clavier (transition `fly`), avant toute mesure. */
const DELAI = 450

/**
 * Calcule de combien faire défiler la page pour dégager le champ.
 * @param {number} basChamp ordonnée du bas du champ dans la fenêtre
 * @param {number} hautClavier ordonnée du haut du clavier dans la fenêtre
 * @returns {number} défilement nécessaire en pixels, 0 si le champ est déjà visible
 */
export function defilementPourDegager(
  basChamp: number,
  hautClavier: number,
): number {
  return Math.max(0, Math.ceil(basChamp + MARGE - hautClavier))
}

let minuterie: number | undefined

/**
 * Fait défiler la page, une fois le clavier affiché, si le champ est dessous.
 * @param {string} idChamp identifiant du champ lié au clavier
 */
export function gardeChampVisible(idChamp: string): void {
  window.clearTimeout(minuterie)
  minuterie = window.setTimeout(() => {
    const champ = document.getElementById(idChamp)
    const clavier = document.getElementById('mathalea-virtual-keyboard')
    if (champ == null || clavier == null) return
    const defilement = defilementPourDegager(
      champ.getBoundingClientRect().bottom,
      clavier.getBoundingClientRect().top,
    )
    if (defilement > 0) window.scrollBy({ top: defilement, behavior: 'smooth' })
  }, DELAI)
}
