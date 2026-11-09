import { lettreDepuisChiffre } from '../../../lib/outils/outilString'
import type { IExercice } from '../../../lib/types'
import {
  reponsesMisesEnEvidence,
  type ReponseMiseEnEvidence,
} from '../typst/minimalCorrection'

/**
 * Extrait d'une correction les réponses courtes mises en évidence en orange
 * (`miseEnEvidence()` dans une formule, `texteEnCouleurEtGras()` hors formule),
 * prêtes à afficher : voir `formuleReponseCourte`. Les doublons sont
 * supprimés, l'ordre d'apparition est conservé.
 *
 * Pour un QCM (`avecTextes` à `false`), les textes orange sont ignorés : ce
 * sont les lettres des bonnes propositions, déjà affichées par `lettresQcm`.
 */
export function extraitReponsesCourtes(
  correction: string,
  avecTextes = true,
  shortAnswer?: string | null,
): string[] {
  if (shortAnswer === null) return []
  if (shortAnswer?.trim()) return [shortAnswer]
  const reponses: string[] = []
  for (const { nature, contenu } of reponsesMisesEnEvidence(correction)) {
    if (nature === 'texte' && !avecTextes) continue
    const reponse = formuleReponseCourte(contenu, nature)
    if (!reponses.includes(reponse)) reponses.push(reponse)
  }
  return reponses
}

/**
 * Réécrit une réponse courte extraite en gras, sous forme de formule LaTeX
 * autonome ou de texte HTML. La couleur d'origine n'est volontairement pas
 * reprise : dans le tableau des réponses, seule la lettre du QCM est mise en
 * orange.
 */
export function formuleReponseCourte(
  reponse: string,
  nature: ReponseMiseEnEvidence['nature'] = 'formule',
): string {
  return nature === 'formule'
    ? `$\\boldsymbol{${reponse}}$`
    : `<b>${reponse}</b>`
}

/**
 * Indique s'il faut afficher la formule complète de la correction plutôt que
 * les réponses courtes séparées.
 *
 * C'est le cas des questions à plusieurs blancs (ex : `remplisLesBlancs()`
 * avec plusieurs `%{champ}`) : lister chaque réponse isolément (ex : « 83 »,
 * « 100 », « 83 ») est moins compréhensible que de réafficher l'expression
 * complète dans laquelle elles s'insèrent (ex : « 0,83 = 83/100 = 83 % »).
 * Les QCM, qui affichent déjà leur(s) lettre(s) dans `lettresQcm`, ne sont
 * pas concernés.
 */
export function doitAfficherFormuleComplete(
  lettresQcm: string[],
  reponsesCourtes: string[],
): boolean {
  return lettresQcm.length === 0 && reponsesCourtes.length > 1
}

/**
 * Renvoie les lettres des bonnes réponses du QCM de la question `questionIndex`
 * (tableau vide si la question n'est pas un QCM).
 *
 * L'ordre des propositions est celui déjà mélangé par `propositionsQcm()`, donc
 * les lettres correspondent à ce qui a été affiché pendant le diaporama.
 */
export function extraitLettresQcm(
  exercice: IExercice,
  questionIndex: number,
): string[] {
  const propositions = exercice.autoCorrection?.[questionIndex]?.propositions
  if (propositions === undefined || propositions.length < 2) return []
  const lettres: string[] = []
  propositions.forEach((proposition, index) => {
    if (proposition.statut) lettres.push(lettreDepuisChiffre(index + 1))
  })
  return lettres
}

/**
 * Largeurs (en pixels) sous lesquelles on affiche respectivement 2 ou 3
 * mini-tableaux côte à côte. Au-delà, on en affiche 4. Pensé pour un
 * vidéoprojecteur de classe : on privilégie l'occupation de la largeur plutôt
 * qu'un unique tableau tout en hauteur.
 */
const LARGEUR_SEUIL_2_COLONNES = 900
const LARGEUR_SEUIL_3_COLONNES = 1400

/**
 * Détermine le nombre de mini-tableaux à afficher côte à côte en fonction de
 * la largeur disponible, sans jamais dépasser le nombre de questions (pour ne
 * pas produire de tableaux vides).
 */
export function calculeNombreDeColonnes(
  largeurDisponible: number,
  nombreDeQuestions: number,
): number {
  const colonnesSouhaitees =
    largeurDisponible < LARGEUR_SEUIL_2_COLONNES
      ? 2
      : largeurDisponible < LARGEUR_SEUIL_3_COLONNES
        ? 3
        : 4
  // Avec quatre questions, trois ou quatre mini-tableaux compressent trop la
  // dernière colonne dans le panneau d'aperçu. Deux colonnes de deux lignes
  // conservent toutes les réponses visibles sans défilement horizontal.
  const colonnesAffichees = nombreDeQuestions === 4 ? 2 : colonnesSouhaitees
  return Math.max(1, Math.min(colonnesAffichees, nombreDeQuestions))
}

export type ColonneDeReponses = {
  /** Index (dans `order`, donc numéro de question - 1) de la première ligne de la colonne. */
  indexDeDepart: number
  /** Sous-ensemble de `order` affiché dans cette colonne. */
  lignes: number[]
}

/**
 * Répartit les questions en `nombreDeColonnes` mini-tableaux de tailles aussi
 * égales que possible (comme un multi-colonnage équilibré), la première
 * colonne recevant les premières questions, de gauche à droite.
 */
export function repartisEnColonnes(
  order: number[],
  nombreDeColonnes: number,
): ColonneDeReponses[] {
  const total = order.length
  if (total === 0 || nombreDeColonnes <= 0) return []
  const tailleDeBase = Math.floor(total / nombreDeColonnes)
  const reste = total % nombreDeColonnes
  const colonnes: ColonneDeReponses[] = []
  let indexDeDepart = 0
  for (let colonne = 0; colonne < nombreDeColonnes; colonne++) {
    const taille = tailleDeBase + (colonne < reste ? 1 : 0)
    if (taille === 0) break
    colonnes.push({
      indexDeDepart,
      lignes: order.slice(indexDeDepart, indexDeDepart + taille),
    })
    indexDeDepart += taille
  }
  return colonnes
}
