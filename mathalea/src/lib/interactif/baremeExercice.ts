/*
 * Barème d'un exercice interactif.
 *
 * Deux notions distinctes :
 * - le nombre de points maximum que l'exercice peut rapporter, déduit de
 *   `autoCorrection` (voir `pointsMaxExercice()`) ;
 * - le coefficient multiplicateur choisi par l'enseignant dans les paramètres
 *   de l'exercice, qui multiplie la note obtenue comme la note maximale
 *   (voir `coeffBaremeExercice()` et son application dans `afficheScore()`).
 *
 * Les fonctions de barème question par question sont dans `fonctionsBaremes.ts`.
 */

import { mathaleaCustomElementsRegistry } from '../customElements/MathaleaCustomElement'
import {
  interactivityTypeToCustomElementFormat,
  type IExercice,
  type ValeurNormalized,
} from '../types'
import { toutPourUnPoint } from './fonctionsBaremes'

export const COEFF_BAREME_MIN = 1
export const COEFF_BAREME_MAX = 20
export const COEFF_BAREME_DEFAUT = 1

export type FonctionBareme = (listePoints: number[]) => [number, number]

/**
 * Ramène une valeur quelconque (saisie, paramètre d'URL...) à un coefficient
 * de barème utilisable : un entier compris entre `COEFF_BAREME_MIN` et
 * `COEFF_BAREME_MAX`.
 */
export function normaliseCoeffBareme(valeur: unknown): number {
  const coeff = typeof valeur === 'string' ? Number(valeur) : valeur
  if (typeof coeff !== 'number' || !Number.isFinite(coeff)) {
    return COEFF_BAREME_DEFAUT
  }
  return Math.min(
    COEFF_BAREME_MAX,
    Math.max(COEFF_BAREME_MIN, Math.round(coeff)),
  )
}

/** Coefficient multiplicateur du barème d'un exercice (1 par défaut). */
export function coeffBaremeExercice(exercice?: IExercice | null): number {
  return normaliseCoeffBareme(exercice?.coeffBareme)
}

/**
 * Nombre de points maximum d'une question dont le score est calculé par une
 * fonction de barème appliquée à `nbChamps` champs de saisie.
 *
 * Les fonctions de barème ne dépendent que du nombre de champs et de leurs
 * points : les appeler avec une liste de champs tous justes donne donc le
 * maximum atteignable sans connaître les réponses de l'élève.
 */
export function pointsMaxDuBareme(
  bareme: FonctionBareme | undefined,
  nbChamps: number,
  baremeParDefaut: FonctionBareme = toutPourUnPoint,
): number {
  const nbChampsUtile = Math.max(nbChamps, 1)
  const fonction = bareme ?? baremeParDefaut
  try {
    const [, max] = fonction(new Array(nbChampsUtile).fill(1))
    return Number.isFinite(max) && max > 0 ? max : nbChampsUtile
  } catch {
    return nbChampsUtile
  }
}

/** Compte les champs de réponse d'une question dont la clé passe le filtre. */
export function compteChampsDeReponse(
  valeur: ValeurNormalized | undefined,
  filtre: (cle: string) => boolean = () => true,
): number {
  if (valeur == null) return 0
  return Object.keys(valeur).filter(
    (cle) =>
      cle !== 'bareme' &&
      cle !== 'feedback' &&
      cle !== 'callback' &&
      filtre(cle),
  ).length
}

/**
 * Nombre de points maximum d'une question interactive.
 *
 * La question est corrigée par le custom element correspondant à son
 * `formatInteractif` : c'est donc lui qui sait combien de points elle peut
 * rapporter, via son hook statique `pointsMaxQuestion()`. Une question dont le
 * format est inconnu (ou dont le composant n'est pas encore chargé) vaut
 * 1 point, ce qui est le cas de la grande majorité des formats.
 */
export function pointsMaxQuestion(exercice: IExercice, i: number): number {
  const questionAutoCorrection = exercice.autoCorrection?.[i]
  if (questionAutoCorrection == null) return 0
  const format = questionAutoCorrection.formatInteractif ?? 'mathlive'
  if (format === 'custom') return 1
  const customElementFormat =
    interactivityTypeToCustomElementFormat(format) ?? format
  const classe = mathaleaCustomElementsRegistry.get(customElementFormat)
  const points = classe?.pointsMaxQuestion(exercice, i) ?? 1
  return Number.isFinite(points) && points > 0 ? points : 1
}

/**
 * Nombre de points maximum qu'un exercice interactif peut rapporter, avant
 * application du coefficient de barème.
 */
export function pointsMaxExercice(exercice?: IExercice | null): number {
  if (exercice == null) return 0
  if (!Array.isArray(exercice.autoCorrection)) return 0
  const nbQuestions = exercice.autoCorrection.length
  let total = 0
  for (let i = 0; i < nbQuestions; i++) {
    total += pointsMaxQuestion(exercice, i)
  }
  return total
}
