import type { IExercice } from '../types'

/**
 * Ce que partagent les grilles de chiffres à remplir (KenKen, grimuku...).
 *
 * Ces composants affichent tous un damier dont certaines cases attendent un
 * chiffre, comparent case par case ce que l'élève a saisi à la solution, et
 * accordent un point par case juste. Seuls le dessin de la grille et les règles
 * du jeu leur sont propres.
 *
 * @author Rémi Angot
 */

/** Le résultat attendu par le moteur d'interactivité de MathALÉA. */
export type ResultatVerification = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

/**
 * Le contrat qu'une grille de chiffres doit remplir pour être corrigée par
 * `verifieLesCases()`.
 */
export interface GrilleDeChiffres {
  id: string
  /** Les saisies de l'élève, indexées par clé de case. */
  readonly value: Record<string, string>
  interactivityOn: boolean
  /** Colore chaque case selon que sa valeur est juste ou non. */
  marqueLesCases(etats: Map<string, boolean>): void
  /** Affiche le décompte des cases justes sous la grille. */
  afficheLeScore(nbBonnesReponses: number, nbReponses: number): void
}

/** La clé de réponse d'une case, à la convention des tableaux MathALÉA. */
export function cleDeLaCase(ligne: number, colonne: number): string {
  return `L${ligne + 1}C${colonne + 1}`
}

/** Les réponses attendues d'une question, c'est-à-dire ses cases à remplir. */
function casesAttendues(
  exercice: IExercice,
  questionIndex: number,
): [string, { value?: string | number }][] {
  const reponses = exercice.autoCorrection?.[questionIndex]?.valeur
  if (reponses == null) return []
  return Object.entries(reponses).filter(([cle]) => /^L\d+C\d+$/.test(cle)) as [
    string,
    { value?: string | number },
  ][]
}

/**
 * Compare les cases saisies aux réponses attendues.
 *
 * Les cases dont le chiffre est écrit d'avance dans l'énoncé ne comptent pas :
 * l'exercice ne les met pas dans les réponses attendues.
 *
 * Par défaut, chaque case juste rapporte un point. Quand `pointsMax` est
 * fourni, la note tient compte de la proportion de cases justes plutôt que de
 * leur nombre : elle vaut la proportion de cases justes multipliée par
 * `pointsMax`, arrondie à l'entier inférieur. Le message affiché sous la
 * grille compte toujours les cases, quel que soit le barème.
 */
export function verifieLesCases(
  exercice: IExercice,
  questionIndex: number,
  element: GrilleDeChiffres | null,
  pointsMax?: number,
): ResultatVerification {
  const attendues = casesAttendues(exercice, questionIndex)
  if (element == null || attendues.length === 0) {
    return {
      isOk: false,
      feedback: '',
      score: { nbBonnesReponses: 0, nbReponses: pointsMax ?? 1 },
    }
  }
  exercice.answers ??= {}
  exercice.answers[element.id] = JSON.stringify(element.value)
  const saisies = element.value
  const etats = new Map<string, boolean>()
  let nbCasesJustes = 0
  for (const [cle, attendue] of attendues) {
    const chiffre = attendue.value
    const isOk = chiffre != null && (saisies[cle] ?? '') === String(chiffre)
    if (isOk) nbCasesJustes++
    etats.set(cle, isOk)
  }
  element.marqueLesCases(etats)
  element.afficheLeScore(nbCasesJustes, attendues.length)
  element.interactivityOn = false
  const isOk = nbCasesJustes === attendues.length
  ecritLeSmiley(exercice, questionIndex, isOk)
  const nbReponses = pointsMax ?? attendues.length
  const nbBonnesReponses =
    pointsMax == null
      ? nbCasesJustes
      : Math.floor((nbCasesJustes / attendues.length) * pointsMax)
  return {
    isOk,
    feedback: '',
    score: { nbBonnesReponses, nbReponses },
  }
}

/**
 * Écrit le smiley 😎/☹️ dans le span que `ajouteResultatCheck()` a ajouté à la
 * suite de la grille, comme le font les autres éléments interactifs de
 * MathALÉA (voir par exemple `PointsCliquablesElement`).
 */
function ecritLeSmiley(
  exercice: IExercice,
  questionIndex: number,
  isOk: boolean,
): void {
  const resultatCheck = document.getElementById(
    `resultatCheckEx${exercice.numeroExercice ?? 0}Q${questionIndex}`,
  )
  if (resultatCheck != null) resultatCheck.innerHTML = isOk ? '😎' : '☹️'
}

/**
 * Ajoute, à la suite du HTML d'une grille, le span où `verifieLesCases()`
 * écrira le smiley. Absent de la correction (`interactivityOn` à `false`) pour
 * ne pas dupliquer l'id du span de l'énoncé.
 */
export function ajouteResultatCheck(
  elementHtml: string,
  interactivityOn: boolean,
  numeroExercice: number,
  questionIndex: number,
): string {
  if (elementHtml === '' || !interactivityOn) return elementHtml
  return `${elementHtml}<span id="resultatCheckEx${numeroExercice}Q${questionIndex}"></span>`
}

/** Le barème d'une question : autant de points que de cases à remplir. */
export function pointsMaxDesCases(
  exercice: IExercice,
  questionIndex: number,
): number {
  return Math.max(1, casesAttendues(exercice, questionIndex).length)
}

/**
 * Crée le champ de saisie d'une case.
 *
 * Le focus reste sur la case saisie : une grille ne se remplit pas dans l'ordre
 * de lecture, l'élève passe d'un endroit à l'autre au gré de ses déductions.
 * Les flèches du clavier servent à se déplacer.
 */
export function creeChampDeSaisie(options: {
  index: number
  chiffreMax: number
  ariaLabel: string
}): HTMLInputElement {
  const champ = document.createElement('input')
  champ.type = 'text'
  champ.inputMode = 'numeric'
  champ.autocomplete = 'off'
  champ.maxLength = 1
  champ.dataset.case = String(options.index)
  champ.dataset.chiffreMax = String(options.chiffreMax)
  champ.setAttribute('aria-label', options.ariaLabel)
  champ.className = 'text-center bg-transparent focus:outline-none font-bold'
  champ.style.width = '100%'
  champ.style.height = '100%'
  champ.style.fontSize = '1.2em'
  champ.style.border = 'none'
  return champ
}

/**
 * Filtre une saisie : seuls les chiffres de 1 au maximum de la grille ont un
 * sens. La case reste sélectionnée, pour qu'un autre chiffre la corrige sans
 * avoir à effacer d'abord.
 */
export function filtreLaSaisie(evenement: Event): void {
  const champ = evenement.target
  if (!(champ instanceof HTMLInputElement)) return
  const chiffreMax = Number(champ.dataset.chiffreMax) || 9
  const chiffre = Number(champ.value)
  if (
    champ.value !== '' &&
    (!Number.isInteger(chiffre) || chiffre < 1 || chiffre > chiffreMax)
  ) {
    champ.value = ''
    return
  }
  champ.select()
}

/** Le déplacement demandé par une touche fléchée, en (colonnes, lignes). */
export function deplacementDuClavier(
  touche: string,
): [number, number] | undefined {
  const deplacements: Record<string, [number, number]> = {
    ArrowRight: [1, 0],
    ArrowLeft: [-1, 0],
    ArrowDown: [0, 1],
    ArrowUp: [0, -1],
  }
  return deplacements[touche]
}

/** Donne le focus au prochain champ de saisie, en sautant les cases sans champ. */
export function deplaceLeFocus(
  champs: Map<number, HTMLInputElement>,
  depart: number,
  lignes: number,
  colonnes: number,
  pasColonne: number,
  pasLigne: number,
): void {
  let ligne = Math.floor(depart / colonnes)
  let colonne = depart % colonnes
  for (let essai = 0; essai < lignes * colonnes; essai++) {
    colonne += pasColonne
    ligne += pasLigne
    if (colonne >= colonnes) {
      colonne = 0
      ligne++
    }
    if (colonne < 0) {
      colonne = colonnes - 1
      ligne--
    }
    if (ligne < 0 || ligne >= lignes) return
    const suivant = champs.get(ligne * colonnes + colonne)
    if (suivant != null) {
      suivant.focus()
      suivant.select()
      return
    }
  }
}
