import type { ItemPondere } from './formulaireComplexe'

/**
 * Présentation « liste pondérée » des formulaires texte.
 *
 * La plupart des `besoinFormulaireTexte` (et `besoinFormulaire2Texte`, …) attendent
 * des numéros de cas séparés par des tirets, chaque cas étant décrit dans l'aide sous
 * la forme `1 : …`, `2 : …`. Saisir `1-1-1-2` demande alors trois questions du cas 1
 * pour une question du cas 2.
 *
 * Ce module extrait ces cas de l'aide pour les afficher comme une liste pondérée
 * (cases à cocher + poids d'apparition), à la manière de `besoinFormulaireComplexe`.
 * La valeur rangée dans `this.sup` et dans l'URL reste exactement la même chaîne
 * qu'auparavant : cocher le premier cas avec un poids de 3 et le deuxième cas produit
 * `1-1-1-2`.
 *
 * Les aides qui ne se résument pas à une énumération (valeurs décrites par un
 * intervalle, remarques diverses) ne sont pas converties : `parseCasFormulaireTexte`
 * renvoie `null` et l'interface conserve son champ texte libre.
 *
 * @author Rémi Angot
 */

/** Séparateur entre deux numéros de cas dans `this.sup`. */
const SEPARATEUR_CAS = '-'

/**
 * Ligne d'aide décrivant un cas : un numéro, un séparateur, un libellé.
 * Les auteurs écrivent aussi bien `1 : …` que `1: …`, `1- …` ou `1) …`.
 */
const LIGNE_CAS = /^\s*(\d+)\s*[:).-]\s*(\S.*?)\s*$/

/**
 * Consigne de saisie (« Nombres séparés par des tirets : ») : elle décrit le champ
 * texte qu'on remplace, donc on l'ignore au lieu de refuser la conversion.
 */
const LIGNE_CONSIGNE = /par des tirets/i

/** Libellé du cas « Mélange », qui vaut « tous les cas ». */
const LIBELLE_MELANGE = /^m[ée]langes?\b/i

/** Un cas proposé par l'aide d'un formulaire texte. */
export type OptionTexte = {
  /** Numéro écrit dans `this.sup`. */
  valeur: number
  label: string
}

/** Les cas énumérés par l'aide d'un formulaire texte. */
export type CasFormulaireTexte = {
  /** Cas à cocher, dans l'ordre de l'aide, hors « Mélange ». */
  cas: OptionTexte[]
  /**
   * Numéro du cas « Mélange », qui demande à l'exercice toutes les questions
   * possibles ; `null` quand l'aide n'en propose pas.
   */
  melange: number | null
}

/**
 * Repère le cas « Mélange » d'une énumération.
 *
 * Les exercices passent ce numéro à `gestionnaireFormulaireTexte()` (paramètre
 * `melange`) : le rencontrer dans `this.sup` remplace la saisie par tous les cas. Il
 * n'est donc pas affiché comme un cas à cocher, mais rendu par le raccourci « tout
 * cocher ».
 *
 * Ce numéro n'est déclaré nulle part ailleurs que dans l'aide : on le repère au
 * libellé, avec deux garde-fous contre un vrai type de question qui s'appellerait
 * « Mélange » :
 *
 * * un seul libellé de l'aide peut commencer par « Mélange » ;
 * * son numéro doit être en bordure de l'énumération (`0` ou `max + 1` en pratique),
 *   jamais encadré par les numéros des autres cas.
 *
 * Contre-exemple réel : `4C23` propose `5 : Mélange` **et** `7 : Mélange avec
 * quotient`, tous deux de vrais types de questions (sa sentinelle vaut `0`). Ses deux
 * cas restent donc des cases à cocher ordinaires.
 */
function indiceMelange(cas: OptionTexte[]): number | null {
  const melanges = cas.filter((option) => LIBELLE_MELANGE.test(option.label))
  if (melanges.length !== 1) return null
  const autres = cas
    .filter((option) => option !== melanges[0])
    .map((option) => option.valeur)
  if (autres.length < 2) return null
  const valeur = melanges[0].valeur
  if (valeur > Math.min(...autres) && valeur < Math.max(...autres)) return null
  return valeur
}

/**
 * Cas énumérés par l'aide d'un formulaire texte, ou `null` si l'aide décrit autre
 * chose qu'une énumération.
 *
 * Une seule ligne non reconnue suffit à renoncer : elle décrit souvent des valeurs
 * saisissables mais non énumérées (« Entre 1 et 12 : pour choisir un motif »), que
 * des cases à cocher ne sauraient pas exprimer.
 */
export function parseCasFormulaireTexte(
  aide: unknown,
): CasFormulaireTexte | null {
  if (typeof aide !== 'string') return null
  const options: OptionTexte[] = []
  const dejaVues = new Set<number>()
  for (const ligne of aide.split('\n')) {
    if (ligne.trim() === '') continue
    const correspondance = ligne.match(LIGNE_CAS)
    if (correspondance === null) {
      if (LIGNE_CONSIGNE.test(ligne)) continue
      return null
    }
    const valeur = Number.parseInt(correspondance[1])
    if (dejaVues.has(valeur)) return null
    dejaVues.add(valeur)
    options.push({ valeur, label: correspondance[2] })
  }
  const melange = indiceMelange(options)
  const cas = options.filter((option) => option.valeur !== melange)
  return cas.length >= 2 ? { cas, melange } : null
}

/**
 * Nombre d'occurrences de chaque numéro dans la valeur de `sup`, c'est-à-dire le
 * poids d'apparition de chaque cas. Tout ce qui n'est pas un entier est ignoré, à
 * l'image de `gestionnaireFormulaireTexte()`.
 */
function poidsParValeur(sup: unknown): Map<number, number> {
  const poids = new Map<number, number>()
  if (typeof sup !== 'number' && typeof sup !== 'string') return poids
  for (const morceau of String(sup).split(SEPARATEUR_CAS)) {
    const valeur = Number.parseInt(morceau)
    if (Number.isNaN(valeur)) continue
    poids.set(valeur, (poids.get(valeur) ?? 0) + 1)
  }
  return poids
}

/**
 * Items à afficher pour une liste de cas, dans l'ordre de l'aide. Un cas absent de
 * `sup` a un poids nul, c'est-à-dire une case décochée.
 *
 * Un `sup` qui contient le numéro de « Mélange » coche tous les cas avec le même
 * poids : c'est exactement ce que l'exercice génère dans ce cas.
 */
export function itemsFormulaireTexte(
  cas: CasFormulaireTexte,
  sup: unknown,
): ItemPondere[] {
  const poids = poidsParValeur(sup)
  const melange = cas.melange !== null && poids.has(cas.melange)
  return cas.cas.map((option) => ({
    nom: String(option.valeur),
    label: option.label,
    poids: melange ? 1 : (poids.get(option.valeur) ?? 0),
  }))
}

/**
 * Chaîne à ranger dans `this.sup` : chaque cas coché est répété autant de fois que
 * son poids, dans l'ordre de l'aide.
 *
 * Tous les cas cochés au même poids sont écrits avec le numéro de « Mélange » quand
 * l'aide en propose un : c'est la valeur historique, et la seule qui reste juste si
 * l'exercice écarte certains cas selon ses autres réglages (`exclus`).
 *
 * @example
 * // cas 1 de poids 3, cas 2 de poids 1
 * serialiseItemsFormulaireTexte(cas, items) // '1-1-1-2'
 * // les 6 cas cochés, aide proposant « 7 : Mélange »
 * serialiseItemsFormulaireTexte(cas, items) // '7'
 */
export function serialiseItemsFormulaireTexte(
  cas: CasFormulaireTexte,
  items: ItemPondere[],
): string {
  if (cas.melange !== null && items.every((item) => item.poids === 1)) {
    return String(cas.melange)
  }
  return items
    .flatMap((item) =>
      Array<string>(Math.max(0, Math.round(item.poids))).fill(item.nom),
    )
    .join(SEPARATEUR_CAS)
}
