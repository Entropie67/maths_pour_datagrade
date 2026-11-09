import type { Keys } from '../types/keyboardContent'
import type { KeyCap } from '../types/keycap'
import { ajouteTouche } from './keycaps'

/**
 * Touches ajoutées question par question par un exercice, en plus des blocs
 * habituels du clavier (voir `KeyboardType.clavierPersonnalisable`).
 *
 * Un exercice décrit ses touches par de simples chaînes :
 *
 * - un nom de raccourci (`POW`, `SQRT`, `VECT`…) donne la touche prédéfinie
 *   correspondante ;
 * - toute autre chaîne est du LaTeX inséré tel quel (`a`, `\\pi`, `u_n`,
 *   `f(#0)`…), affiché sur la touche entre `$…$`.
 *
 * Les touches peuvent être groupées en plusieurs blocs, séparés à l'écran comme
 * les blocs habituels du clavier : `[['a', 'b'], ['+', '-']]` donne deux blocs.
 * Une liste plate (`['a', 'b']`) donne un seul bloc.
 *
 * Les emplacements MathLive (`#0`, `#1`, `#@`, `#?`) sont remplacés par un
 * carré dans l'affichage de la touche, mais conservés à l'insertion : le
 * curseur se place donc dans le trou après l'appui.
 */

/** Titre des blocs de touches propres à la question. */
export const TITRE_BLOC_PERSONNALISE = 'Pour cette question'

/** Touches d'une question : une liste plate (un bloc) ou une liste de blocs. */
export type ToucheDeQuestion = string[] | string[][]

/** Préfixe des noms de touches personnalisées dans la table `keys`. */
const PREFIXE = 'perso:'

/**
 * Raccourcis nommés, repris de l'app « questions de cours » pour que sa banque
 * de questions soit utilisable telle quelle.
 */
const RACCOURCIS: Record<string, KeyCap> = {
  COS: { display: 'cos', insert: '\\cos(#0)' },
  COSVIRGULE: { display: 'cos', insert: '\\cos(#0,#1)' },
  EXCPOINT: { display: '!', insert: '{\\:\\text{!}\\:}' },
  EXP: { display: '$e^{\\square}$', insert: 'e^{#0}' },
  FRAC: { display: '$\\frac{\\square}{\\square}$', insert: '\\frac{#@}{#1}' },
  INDICE: { display: '$\\square_\\square$', insert: '#@_{#0}' },
  LN: { display: '$\\ln(\\square)$', insert: '\\ln(#0)' },
  NORM: { display: '$\\lVert\\square\\rVert$', insert: '\\lVert#0\\rVert' },
  PMATRIX11: {
    display: '$\\begin{pmatrix}\\square\\\\\\square\\end{pmatrix}$',
    insert: '\\begin{pmatrix}#0\\\\#1\\end{pmatrix}',
  },
  POW: { display: '$\\square^\\square$', insert: '#@^{#0}' },
  SIGMA: {
    display: '$\\sum\\limits_{\\square}^{\\square}$',
    insert: '\\sum_{#0}^{#1}',
  },
  SIN: { display: 'sin', insert: '\\sin(#0)' },
  SQ: { display: '$\\square^2$', insert: '^2' },
  SQRT: { display: '$\\sqrt{\\square}$', insert: '\\sqrt{#1}' },
  VECT: {
    display: '$\\overrightarrow{\\square}$',
    insert: '\\overrightarrow{#0}',
  },
}

/** L'affichage d'une touche décrite par le LaTeX qu'elle insère. */
function affichageDepuisInsertion(insertion: string): string {
  return `$${insertion.replaceAll(/#[@?0-9]/g, '\\square')}$`
}

/** La touche correspondant à une chaîne d'exercice. */
export function toucheDepuisCle(cle: string): KeyCap {
  return (
    RACCOURCIS[cle] ?? {
      display: affichageDepuisInsertion(cle),
      insert: cle,
    }
  )
}

/**
 * Enregistre les touches demandées et retourne leurs noms, à utiliser comme
 * n'importe quelle autre touche dans un `KeyboardBlock`.
 */
export function enregistreTouchesPersonnalisees(cles: string[]): Keys[] {
  const noms: Keys[] = []
  for (const cle of cles) {
    if (cle === '') continue
    // `Keys` couvre aussi les touches numériques, dont le nom est un nombre :
    // on construit le nom en chaîne avant de le convertir.
    const nom = `${PREFIXE}${cle}`
    if (noms.includes(nom as Keys)) continue
    ajouteTouche(nom, toucheDepuisCle(cle))
    noms.push(nom as Keys)
  }
  return noms
}

/**
 * Un pavé numérique complet suit l'ordre 1…9, 0 en mode réduit.
 * Les autres touches gardent leur place, ainsi que les sélections de chiffres
 * qui ne constituent pas un pavé complet.
 */
export function ordonneChiffresEnLigne(noms: Keys[]): Keys[] {
  const chiffres = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(
    (chiffre) => `${PREFIXE}${chiffre}` as Keys,
  )
  if (!chiffres.every((chiffre) => noms.includes(chiffre))) return [...noms]
  let index = 0
  return noms.map((nom) => (chiffres.includes(nom) ? chiffres[index++] : nom))
}

/**
 * Les touches d'une question sous forme de blocs : une liste plate de chaînes
 * forme un seul bloc, une liste de listes donne un bloc par sous-liste.
 * Les blocs vides sont ignorés.
 */
export function blocsDeTouches(touches: ToucheDeQuestion): string[][] {
  const blocs = touches.every((element) => typeof element === 'string')
    ? [touches as string[]]
    : (touches as string[][])
  return blocs.filter((bloc) => bloc.length > 0)
}

/**
 * Relit les blocs de touches stockés sur un champ de saisie
 * (attribut `data-keys`, écrit par `ajouteChampTexteMathLive`).
 */
export function litTouchesPersonnalisees(
  valeur: string | undefined,
): string[][] {
  if (valeur == null || valeur === '') return []
  try {
    const touches: unknown = JSON.parse(valeur)
    if (!Array.isArray(touches)) return []
    const estChaine = (cle: unknown): cle is string => typeof cle === 'string'
    const blocs = touches.some(Array.isArray) ? touches : [touches]
    return blocs
      .filter(Array.isArray)
      .map((bloc: unknown[]) => bloc.filter(estChaine))
      .filter((bloc) => bloc.length > 0)
  } catch {
    // Un attribut illisible ne doit pas empêcher le clavier de s'afficher.
    return []
  }
}
