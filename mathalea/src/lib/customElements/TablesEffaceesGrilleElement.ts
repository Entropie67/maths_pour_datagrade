import { context } from '../../modules/context'
import { orangeMathalea, vertMathalea } from '../colors'
import { miseEnEvidence } from '../outils/embellissements'
import type { IExercice } from '../types'
import {
  ajouteResultatCheck,
  cleDeLaCase as cleDeLaCasePartagee,
  deplacementDuClavier,
  deplaceLeFocus,
  pointsMaxDesCases,
  verifieLesCases,
  type GrilleDeChiffres,
  type ResultatVerification,
} from './grilleDeChiffres'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * La grille d'un exercice de « tables de multiplication effacées ».
 *
 * Un tableau de multiplication de côté `taille` : la première ligne et la
 * première colonne portent les facteurs, chaque case intérieure porte leur
 * produit, le coin porte le signe `×`. Certaines cases sont données par
 * l'énoncé, les autres attendent une saisie.
 *
 * Le composant rend les trois sorties attendues d'un composant d'évaluation :
 * HTML interactif, LaTeX (tikz) et Typst. La grille ne reçoit sa solution que
 * dans la correction : l'énoncé ne la contient jamais, pour ne pas la livrer
 * dans le DOM.
 *
 * @author Rémi Angot
 */

export type TablesEffaceesGrilleOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  /** Côté du tableau : nombre de facteurs de lignes et de colonnes. */
  taille: number
  /** Cases données : couples `[index de case, valeur]`. */
  donnees: [number, number][]
  /**
   * Solution complète, indexée comme la grille de côté `taille + 1` (le coin
   * vaut `0`). À ne transmettre que pour la correction.
   */
  solution?: number[]
  interactivityOn?: boolean
}

/** Côté d'une case, en em pour suivre le zoom des vues (voir `construitInterface`). */
const TAILLE_CASE = '2.8em'
/** Épaisseur d'un trait intérieur. */
const TRAIT_FIN = '0.06em'
/** Épaisseur du cadre et de la bande d'en-têtes. */
const TRAIT_EPAIS = '0.16em'
/** Les mêmes épaisseurs pour la sortie imprimable. */
const TRAIT_FIN_TEX = '0.4pt'
const TRAIT_EPAIS_TEX = '1.2pt'

/** L'état métier dont dépendent les trois rendus. */
type EtatTables = {
  taille: number
  /** Valeurs données, par index de case. */
  donnees: Map<number, number>
  /** Solution complète, ou `null` pour un énoncé. */
  solution: number[] | null
}

function coteComplet(taille: number): number {
  return taille + 1
}

function ligneDe(index: number, cote: number): number {
  return Math.floor(index / cote)
}

function colonneDe(index: number, cote: number): number {
  return index % cote
}

/** La clé de réponse d'une case, à la convention des tableaux MathALÉA. */
export function cleDeLaCase(index: number, cote: number): string {
  return cleDeLaCasePartagee(ligneDe(index, cote), colonneDe(index, cote))
}

/** Accepte aussi bien un objet qu'une chaîne JSON (attribut du DOM). */
function parseJson(valeur: unknown): unknown {
  if (typeof valeur !== 'string') return valeur
  try {
    return JSON.parse(valeur)
  } catch {
    return null
  }
}

function parseDonnees(valeur: unknown): Map<number, number> {
  const brut = parseJson(valeur)
  const donnees = new Map<number, number>()
  if (!Array.isArray(brut)) return donnees
  for (const couple of brut) {
    if (!Array.isArray(couple) || couple.length !== 2) continue
    donnees.set(Number(couple[0]), Number(couple[1]))
  }
  return donnees
}

function parseSolution(valeur: unknown): number[] | null {
  const brut = parseJson(valeur)
  if (!Array.isArray(brut)) return null
  return brut.map((nombre) => Number(nombre))
}

/** La valeur à afficher dans une case, ou `undefined` si elle est à remplir. */
function valeurAffichee(etat: EtatTables, index: number): number | undefined {
  const donnee = etat.donnees.get(index)
  if (donnee !== undefined) return donnee
  if (etat.solution === null) return undefined
  return etat.solution[index]
}

/** Vrai pour une case de la première ligne ou de la première colonne. */
function estEntete(index: number, cote: number): boolean {
  return ligneDe(index, cote) === 0 || colonneDe(index, cote) === 0
}

/* -------------------------------------------------------------------------- */
/* Sorties imprimables                                                         */
/* -------------------------------------------------------------------------- */

/** La grille en tikz. */
export function renderLatexGrilleTables(etat: EtatTables): string {
  const cote = coteComplet(etat.taille)
  const traces: string[] = []
  const textes: string[] = []
  for (let index = 0; index < cote * cote; index++) {
    const ligne = ligneDe(index, cote)
    const colonne = colonneDe(index, cote)
    const gauche = colonne
    const haut = -ligne
    if (estEntete(index, cote)) {
      traces.push(
        `\\fill[black!8] (${gauche},${haut}) rectangle (${gauche + 1},${haut - 1});`,
      )
    }
    traces.push(
      `\\draw[line width=${TRAIT_FIN_TEX}] (${gauche},${haut}) rectangle (${gauche + 1},${haut - 1});`,
    )
    if (ligne === 0 && colonne === 0) {
      textes.push(
        `\\node[font=\\large] at (${gauche + 0.5},${haut - 0.5}) {$\\times$};`,
      )
      continue
    }
    const valeur = valeurAffichee(etat, index)
    if (valeur === undefined) continue
    // Une valeur trouvée est le résultat de l'élève : elle est mise en
    // évidence, une valeur donnée par l'énoncé reste en noir.
    const texte = etat.donnees.has(index)
      ? `${valeur}`
      : miseEnEvidence(valeur)
    textes.push(
      `\\node[font=\\large] at (${gauche + 0.5},${haut - 0.5}) {$${texte}$};`,
    )
  }
  return [
    '\\begin{center}',
    '\\begin{tikzpicture}[x=1cm,y=1cm]',
    ...traces,
    `\\draw[line width=${TRAIT_EPAIS_TEX}] (0,0) rectangle (${cote},${-cote});`,
    `\\draw[line width=${TRAIT_EPAIS_TEX}] (0,-1) -- (${cote},-1);`,
    `\\draw[line width=${TRAIT_EPAIS_TEX}] (1,0) -- (1,${-cote});`,
    ...textes,
    '\\end{tikzpicture}',
    '\\end{center}',
  ].join('\n')
}

/** La grille en Typst : un `table` avec une bande d'en-têtes plus épaisse. */
export function renderTypstGrilleTables(etat: EtatTables): string {
  const cote = coteComplet(etat.taille)
  const cellules: string[] = []
  for (let index = 0; index < cote * cote; index++) {
    const ligne = ligneDe(index, cote)
    const colonne = colonneDe(index, cote)
    const fond = estEntete(index, cote) ? 'fill: luma(238), ' : ''
    if (ligne === 0 && colonne === 0) {
      cellules.push(
        `table.cell(${fond}align: center + horizon)[#text(size: 12pt)[$times$]]`,
      )
      continue
    }
    const valeur = valeurAffichee(etat, index)
    if (valeur === undefined) {
      cellules.push(`table.cell(${fond})[]`)
      continue
    }
    const couleur = etat.donnees.has(index)
      ? ''
      : `, fill: rgb("${orangeMathalea}"), weight: "bold"`
    cellules.push(
      `table.cell(${fond}align: center + horizon)[#text(size: 12pt${couleur})[$${valeur}$]]`,
    )
  }
  return `#align(center, table(columns: (1cm,) * ${cote}, rows: (1cm,) * ${cote}, inset: 0pt, stroke: ${TRAIT_FIN_TEX}, table.hline(y: 1, stroke: ${TRAIT_EPAIS_TEX}), table.vline(x: 1, stroke: ${TRAIT_EPAIS_TEX}), ${cellules.join(', ')}))`
}

/* -------------------------------------------------------------------------- */
/* Le composant                                                                */
/* -------------------------------------------------------------------------- */

export class TablesEffaceesGrilleElement
  extends MathaleaCustomElement
  implements GrilleDeChiffres
{
  static readonly elementTag = 'tables-effacees-grille'

  private etat: EtatTables = { taille: 4, donnees: new Map(), solution: null }
  private numeroExercice = 0
  private questionIndex = 0
  private champs = new Map<number, HTMLInputElement>()
  private zoneMessage: HTMLElement | null = null

  static create(options: TablesEffaceesGrilleOptions): string {
    const interactivityOn = options.interactivityOn ?? true
    const etat: EtatTables = {
      taille: options.taille,
      donnees: new Map(options.donnees ?? []),
      solution: interactivityOn ? null : (options.solution ?? null),
    }
    // La vue Typst régénère l'exercice avec `isHtml` encore vrai : ce cas doit
    // donc être traité avant la branche HTML.
    if (context.isTypst) {
      return `<mathalea-typst>${renderTypstGrilleTables(etat)}</mathalea-typst>`
    }
    if (!context.isHtml) return renderLatexGrilleTables(etat)
    const numeroExercice = options.numeroExercice ?? 0
    const questionIndex = options.questionIndex ?? 0
    const id =
      options.id ??
      `${TablesEffaceesGrilleElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    const elementHtml = super.create({
      id,
      taille: options.taille,
      donnees: options.donnees ?? [],
      solution: etat.solution,
      interactivityOn,
      numeroExercice,
      questionIndex,
    })
    return ajouteResultatCheck(
      elementHtml,
      interactivityOn,
      numeroExercice,
      questionIndex,
    )
  }

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    const taille = Number(this.getAttribute('taille')) || 4
    this.etat = {
      taille,
      donnees: parseDonnees(this.getAttribute('donnees')),
      solution: parseSolution(this.getAttribute('solution')),
    }
    this.numeroExercice = Number(this.getAttribute('numero-exercice')) || 0
    this.questionIndex = Number(this.getAttribute('question-index')) || 0
    this.construitInterface()
    this.render()
  }

  disconnectedCallback(): void {
    this.champs.clear()
    this.zoneMessage = null
    this.innerHTML = ''
  }

  get value(): Record<string, string> {
    const cote = coteComplet(this.etat.taille)
    const valeurs: Record<string, string> = {}
    for (const [index, champ] of this.champs) {
      valeurs[cleDeLaCase(index, cote)] = champ.value.trim()
    }
    return valeurs
  }

  set value(prochaineValeur: unknown) {
    this.update(prochaineValeur)
  }

  update(prochaineValeur: unknown): void {
    const brut = parseJson(prochaineValeur)
    if (brut == null || typeof brut !== 'object') return
    const cote = coteComplet(this.etat.taille)
    const saisies = brut as Record<string, unknown>
    for (const [index, champ] of this.champs) {
      const saisie = saisies[cleDeLaCase(index, cote)]
      if (saisie == null) continue
      champ.value = String(saisie)
    }
    this.render()
  }

  protected onInteractivityChanged(isOn: boolean): void {
    for (const champ of this.champs.values()) {
      champ.readOnly = !isOn
      champ.tabIndex = isOn ? 0 : -1
      champ.style.cursor = isOn ? 'text' : 'default'
    }
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) return this.renderLatex()
    // La grille est construite une fois pour toutes : l'affichage ne dépend
    // ensuite que des saisies, que le navigateur tient à jour lui-même.
    return ''
  }

  protected renderLatex(): string {
    return renderLatexGrilleTables(this.etatAffiche())
  }

  protected renderTypst(): string {
    return renderTypstGrilleTables(this.etatAffiche())
  }

  /** L'énoncé n'affiche jamais la solution, seule la correction la montre. */
  private etatAffiche(): EtatTables {
    return this.interactivityOn ? { ...this.etat, solution: null } : this.etat
  }

  /**
   * Toutes les longueurs sont en `em`, jamais en `rem` ni en classe Tailwind de
   * taille fixe : le zoom des vues prof, élève et TBI pose une `font-size` en
   * rem sur le conteneur de l'énoncé, donc seul le relatif suit
   * l'agrandissement demandé par l'enseignant.
   */
  private construitInterface(): void {
    this.innerHTML = ''
    this.champs.clear()
    this.classList.add('block', 'not-prose')
    this.style.margin = '1em 0'

    const cadre = document.createElement('div')
    cadre.style.maxWidth = '100%'
    cadre.style.overflowX = 'auto'
    cadre.style.padding = '0.2em'

    const cote = coteComplet(this.etat.taille)
    const grille = document.createElement('div')
    grille.className =
      'grid w-fit border-coopmaths-corpus dark:border-coopmathsdark-corpus'
    grille.style.gridTemplateColumns = `repeat(${cote}, ${TAILLE_CASE})`
    grille.addEventListener('keydown', this.toucheEnfoncee)
    grille.addEventListener('input', this.saisie)

    for (let index = 0; index < cote * cote; index++) {
      grille.appendChild(this.construitCase(index))
    }
    cadre.appendChild(grille)
    this.appendChild(cadre)

    this.zoneMessage = document.createElement('div')
    this.zoneMessage.style.marginTop = '0.5em'
    this.zoneMessage.style.fontSize = '0.875em'
    this.zoneMessage.setAttribute('aria-live', 'polite')
    this.appendChild(this.zoneMessage)

    this.onInteractivityChanged(this.interactivityOn)
  }

  private construitCase(index: number): HTMLElement {
    const cote = coteComplet(this.etat.taille)
    const ligne = ligneDe(index, cote)
    const colonne = colonneDe(index, cote)
    const cellule = document.createElement('div')
    cellule.className =
      'relative flex items-center justify-center ' +
      'border-coopmaths-corpus dark:border-coopmathsdark-corpus'
    cellule.dataset.case = String(index)
    cellule.style.width = TAILLE_CASE
    cellule.style.height = TAILLE_CASE
    cellule.style.borderStyle = 'solid'
    // Chaque case ne trace que son bord haut et son bord gauche ; les cases du
    // bas et de la droite ferment la grille. La première ligne de cases sous
    // les en-têtes et la première colonne après eux portent un trait épais,
    // comme le cadre.
    cellule.style.borderTopWidth =
      ligne === 0 || ligne === 1 ? TRAIT_EPAIS : TRAIT_FIN
    cellule.style.borderLeftWidth =
      colonne === 0 || colonne === 1 ? TRAIT_EPAIS : TRAIT_FIN
    cellule.style.borderBottomWidth = ligne === cote - 1 ? TRAIT_EPAIS : '0'
    cellule.style.borderRightWidth = colonne === cote - 1 ? TRAIT_EPAIS : '0'

    if (estEntete(index, cote)) {
      cellule.classList.add(
        'bg-coopmaths-canvas-darkest',
        'dark:bg-coopmathsdark-canvas-darkest',
      )
    }

    if (ligne === 0 && colonne === 0) {
      const signe = document.createElement('span')
      signe.className = 'font-bold'
      signe.style.fontSize = '1.2em'
      signe.textContent = '×'
      cellule.appendChild(signe)
      return cellule
    }

    const valeur = valeurAffichee(this.etat, index)
    if (valeur !== undefined) {
      const affichage = document.createElement('span')
      affichage.className = 'font-bold'
      affichage.style.fontSize = '1.2em'
      // Une valeur donnée par l'énoncé reste en noir ; la solution affichée
      // dans la correction est mise en évidence.
      if (!this.etat.donnees.has(index)) affichage.style.color = orangeMathalea
      affichage.textContent = String(valeur)
      cellule.appendChild(affichage)
      return cellule
    }

    const champ = this.creeChamp(index, ligne, colonne)
    cellule.appendChild(champ)
    this.champs.set(index, champ)
    return cellule
  }

  /** Un champ de saisie acceptant un entier de une à trois chiffres. */
  private creeChamp(
    index: number,
    ligne: number,
    colonne: number,
  ): HTMLInputElement {
    const champ = document.createElement('input')
    champ.type = 'text'
    champ.inputMode = 'numeric'
    champ.autocomplete = 'off'
    champ.maxLength = 3
    champ.dataset.case = String(index)
    champ.setAttribute(
      'aria-label',
      `Ligne ${ligne + 1}, colonne ${colonne + 1}`,
    )
    champ.className =
      'text-center bg-transparent focus:outline-none font-bold'
    champ.style.width = '100%'
    champ.style.height = '100%'
    champ.style.fontSize = '1.2em'
    champ.style.border = 'none'
    return champ
  }

  /**
   * Seuls les chiffres ont un sens, et le focus reste sur la case saisie : une
   * grille de multiplication ne se remplit pas dans l'ordre de lecture.
   */
  private readonly saisie = (evenement: Event): void => {
    const champ = evenement.target
    if (!(champ instanceof HTMLInputElement)) return
    const nettoye = champ.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
    if (nettoye !== champ.value) champ.value = nettoye
  }

  /** Les flèches du clavier déplacent le curseur d'une case à l'autre. */
  private readonly toucheEnfoncee = (evenement: KeyboardEvent): void => {
    const champ = evenement.target
    if (!(champ instanceof HTMLInputElement)) return
    const deplacement = deplacementDuClavier(evenement.key)
    if (deplacement === undefined) return
    evenement.preventDefault()
    const cote = coteComplet(this.etat.taille)
    deplaceLeFocus(
      this.champs,
      Number(champ.dataset.case),
      cote,
      cote,
      deplacement[0],
      deplacement[1],
    )
  }

  /** Colore chaque case selon que sa valeur est juste ou non. */
  marqueLesCases(etats: Map<string, boolean>): void {
    const cote = coteComplet(this.etat.taille)
    for (const [index, champ] of this.champs) {
      const etat = etats.get(cleDeLaCase(index, cote))
      if (etat === undefined) continue
      champ.style.color = etat ? vertMathalea : orangeMathalea
      champ.parentElement?.style.setProperty(
        'background-color',
        `${etat ? vertMathalea : orangeMathalea}33`,
      )
    }
  }

  afficheLeScore(nbBonnesReponses: number, nbReponses: number): void {
    if (this.zoneMessage == null) return
    this.zoneMessage.style.color = orangeMathalea
    const pluriel = nbBonnesReponses > 1 ? 's' : ''
    this.zoneMessage.textContent = `${nbBonnesReponses} case${pluriel} correctement complétée${pluriel} sur ${nbReponses}.`
  }

  /**
   * Vérification interactive : chaque case correctement remplie rapporte un
   * point. Les valeurs données ne comptent pas : elles ne figurent pas dans
   * les réponses attendues construites par l'exercice.
   */
  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): ResultatVerification {
    const id = `${TablesEffaceesGrilleElement.elementTag}Ex${exercice.numeroExercice ?? 0}Q${questionIndex}`
    return verifieLesCases(
      exercice,
      questionIndex,
      document.getElementById(id) as TablesEffaceesGrilleElement | null,
    )
  }

  static pointsMaxQuestion(exercice: IExercice, questionIndex: number): number {
    return pointsMaxDesCases(exercice, questionIndex)
  }
}

registerMathaleaCustomElement(TablesEffaceesGrilleElement)

/** Helper d'injection depuis l'exercice. */
export function ajouteTablesEffacees(
  exercice: IExercice,
  questionIndex: number,
  options: TablesEffaceesGrilleOptions,
): string {
  return TablesEffaceesGrilleElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}
