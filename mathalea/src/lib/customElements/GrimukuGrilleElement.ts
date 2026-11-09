import { context } from '../../modules/context'
import { orangeMathalea, vertMathalea } from '../colors'
import { miseEnEvidence } from '../outils/embellissements'
import {
  formatGrimuku,
  type DirectionGrimuku,
  type FlecheGrimuku,
} from '../outils/grimuku'
import type { IExercice } from '../types'
import {
  ajouteResultatCheck,
  cleDeLaCase as cleDeLaCasePartagee,
  creeChampDeSaisie,
  deplacementDuClavier,
  deplaceLeFocus,
  filtreLaSaisie,
  verifieLesCases,
  type GrilleDeChiffres,
  type ResultatVerification,
} from './grilleDeChiffres'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * La grille d'un grimuku : un damier de cases blanches à remplir, entrecoupé de
 * cases grises qui portent les flèches.
 *
 * Une case grise se lit en deux moitiés : celle du haut porte la flèche
 * horizontale, celle du bas la flèche verticale. Le nombre écrit avant la
 * flèche est le produit des chiffres qu'elle désigne.
 *
 * Le composant rend les trois sorties attendues d'un composant d'évaluation :
 * HTML interactif, LaTeX (tikz) et Typst. La grille ne reçoit sa solution que
 * dans la correction : l'énoncé ne la contient jamais, pour ne pas la livrer
 * dans le DOM.
 *
 * @author Rémi Angot
 */

export type GrimukuGrilleOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  lignes: number
  colonnes: number
  /** Cases grises, dans l'ordre de lecture. */
  grises: boolean[]
  fleches: FlecheGrimuku[]
  /** Chiffres écrits d'avance : couples `[index de case, chiffre]`. */
  donnees?: [number, number][]
  /** Solution complète : à ne transmettre que pour la correction. */
  solution?: number[]
  interactivityOn?: boolean
}

/** Côté d'une case, en em pour suivre le zoom des vues (voir `construitInterface`). */
const TAILLE_CASE = '2.8em'
/** Épaisseur d'un trait entre deux cases. */
const TRAIT_FIN = '0.06em'
/** Épaisseur du cadre de la grille. */
const TRAIT_EPAIS = '0.16em'
/** Les mêmes épaisseurs pour la sortie imprimable. */
const TRAIT_FIN_TEX = '0.4pt'
const TRAIT_EPAIS_TEX = '1.2pt'

const FLECHES_HTML: Record<DirectionGrimuku, string> = {
  droite: '→',
  gauche: '←',
  haut: '↑',
  bas: '↓',
}
const FLECHES_LATEX: Record<DirectionGrimuku, string> = {
  droite: '\\rightarrow',
  gauche: '\\leftarrow',
  haut: '\\uparrow',
  bas: '\\downarrow',
}
const FLECHES_TYPST: Record<DirectionGrimuku, string> = {
  droite: 'arrow.r',
  gauche: 'arrow.l',
  haut: 'arrow.t',
  bas: 'arrow.b',
}

/** L'état métier dont dépendent les trois rendus. */
type EtatGrimuku = {
  lignes: number
  colonnes: number
  grises: boolean[]
  fleches: FlecheGrimuku[]
  /** Chiffres écrits d'avance, par index de case. */
  donnees: Map<number, number>
  /** Solution complète, ou `null` pour un énoncé. */
  solution: number[] | null
}

function ligneDe(index: number, colonnes: number): number {
  return Math.floor(index / colonnes)
}

function colonneDe(index: number, colonnes: number): number {
  return index % colonnes
}

/** La clé de réponse d'une case, à la convention des tableaux MathALÉA. */
export function cleDeLaCase(index: number, colonnes: number): string {
  return cleDeLaCasePartagee(
    ligneDe(index, colonnes),
    colonneDe(index, colonnes),
  )
}

/** Les cases grises tiennent dans une suite de 0 et de 1, plus courte qu'un JSON. */
export function serialiseGrises(grises: boolean[]): string {
  return grises.map((grise) => (grise ? '1' : '0')).join('')
}

function parseGrises(valeur: unknown, nbCases: number): boolean[] {
  if (Array.isArray(valeur)) return valeur.map((grise) => grise === true)
  if (typeof valeur !== 'string') return new Array<boolean>(nbCases).fill(false)
  const grises = new Array<boolean>(nbCases).fill(false)
  for (let index = 0; index < Math.min(nbCases, valeur.length); index++) {
    grises[index] = valeur[index] === '1'
  }
  return grises
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

function parseFleches(valeur: unknown): FlecheGrimuku[] {
  const brut = parseJson(valeur)
  if (!Array.isArray(brut)) return []
  return brut.filter(
    (fleche): fleche is FlecheGrimuku =>
      fleche != null &&
      Array.isArray((fleche as FlecheGrimuku).cases) &&
      typeof (fleche as FlecheGrimuku).produit === 'number',
  )
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
  return brut.map((chiffre) => Number(chiffre))
}

/** La flèche horizontale portée par une case grise, s'il y en a une. */
function flecheHorizontale(
  fleches: FlecheGrimuku[],
  indice: number,
): FlecheGrimuku | undefined {
  return fleches.find(
    (fleche) =>
      fleche.indice === indice &&
      (fleche.direction === 'droite' || fleche.direction === 'gauche'),
  )
}

/** La flèche verticale portée par une case grise, s'il y en a une. */
function flecheVerticale(
  fleches: FlecheGrimuku[],
  indice: number,
): FlecheGrimuku | undefined {
  return fleches.find(
    (fleche) =>
      fleche.indice === indice &&
      (fleche.direction === 'bas' || fleche.direction === 'haut'),
  )
}

/** Le chiffre à afficher dans une case blanche, ou `undefined` si elle est à remplir. */
function chiffreAffiche(etat: EtatGrimuku, index: number): number | undefined {
  const donnee = etat.donnees.get(index)
  if (donnee !== undefined) return donnee
  if (etat.solution === null) return undefined
  return etat.solution[index]
}

/* -------------------------------------------------------------------------- */
/* Sorties imprimables                                                         */
/* -------------------------------------------------------------------------- */

/** La grille en tikz. */
export function renderLatexGrille(etat: EtatGrimuku): string {
  const { lignes, colonnes } = etat
  const traces: string[] = []
  const textes: string[] = []
  for (let index = 0; index < lignes * colonnes; index++) {
    const ligne = ligneDe(index, colonnes)
    const colonne = colonneDe(index, colonnes)
    const gauche = colonne
    const haut = -ligne
    if (etat.grises[index]) {
      traces.push(
        `\\fill[black!15] (${gauche},${haut}) rectangle (${gauche + 1},${haut - 1});`,
      )
    }
    traces.push(
      `\\draw[line width=${TRAIT_FIN_TEX}] (${gauche},${haut}) rectangle (${gauche + 1},${haut - 1});`,
    )
    if (etat.grises[index]) {
      const horizontale = flecheHorizontale(etat.fleches, index)
      const verticale = flecheVerticale(etat.fleches, index)
      if (horizontale !== undefined || verticale !== undefined) {
        traces.push(
          `\\draw[line width=${TRAIT_FIN_TEX}] (${gauche},${haut - 0.5}) -- (${gauche + 1},${haut - 0.5});`,
        )
      }
      if (horizontale !== undefined) {
        textes.push(
          `\\node[font=\\tiny, inner sep=2pt] at (${gauche + 0.5},${haut - 0.25}) {${etiquetteLatex(horizontale)}};`,
        )
      }
      if (verticale !== undefined) {
        textes.push(
          `\\node[font=\\tiny, inner sep=2pt] at (${gauche + 0.5},${haut - 0.75}) {${etiquetteLatex(verticale)}};`,
        )
      }
      continue
    }
    const chiffre = chiffreAffiche(etat, index)
    if (chiffre === undefined) continue
    // Un chiffre trouvé est le résultat de l'élève : il est mis en évidence,
    // tandis qu'un chiffre donné par l'énoncé reste en noir.
    const texte = etat.donnees.has(index)
      ? `${chiffre}`
      : miseEnEvidence(chiffre)
    textes.push(
      `\\node[font=\\large] at (${gauche + 0.5},${haut - 0.5}) {$${texte}$};`,
    )
  }
  return [
    '\\begin{center}',
    '\\begin{tikzpicture}[x=1cm,y=1cm]',
    ...traces,
    `\\draw[line width=${TRAIT_EPAIS_TEX}] (0,0) rectangle (${colonnes},${-lignes});`,
    ...textes,
    '\\end{tikzpicture}',
    '\\end{center}',
  ].join('\n')
}

function etiquetteLatex(fleche: FlecheGrimuku): string {
  const symbole = `$${FLECHES_LATEX[fleche.direction]}$`
  return fleche.direction === 'gauche'
    ? `${symbole} ${fleche.produit}`
    : `${fleche.produit} ${symbole}`
}

function etiquetteTypst(fleche: FlecheGrimuku): string {
  const symbole = `#sym.${FLECHES_TYPST[fleche.direction]}`
  return fleche.direction === 'gauche'
    ? `${symbole} ${fleche.produit}`
    : `${fleche.produit} ${symbole}`
}

/** La grille en Typst : un `table` dont chaque case grise se lit en deux moitiés. */
export function renderTypstGrille(etat: EtatGrimuku): string {
  const { lignes, colonnes } = etat
  const cellules: string[] = []
  for (let index = 0; index < lignes * colonnes; index++) {
    if (etat.grises[index]) {
      const horizontale = flecheHorizontale(etat.fleches, index)
      const verticale = flecheVerticale(etat.fleches, index)
      const separateur =
        horizontale === undefined && verticale === undefined
          ? ''
          : '#place(horizon + left, line(length: 100%, stroke: 0.4pt))'
      const haut =
        horizontale === undefined
          ? ''
          : `#place(top + right, dx: -2pt, dy: 2pt, text(size: 6pt)[${etiquetteTypst(horizontale)}])`
      const bas =
        verticale === undefined
          ? ''
          : `#place(bottom + right, dx: -2pt, dy: -2pt, text(size: 6pt)[${etiquetteTypst(verticale)}])`
      cellules.push(`table.cell(fill: luma(220))[${separateur}${haut}${bas}]`)
      continue
    }
    const chiffre = chiffreAffiche(etat, index)
    if (chiffre === undefined) {
      cellules.push('[]')
      continue
    }
    const couleur = etat.donnees.has(index)
      ? ''
      : `, fill: rgb("${orangeMathalea}"), weight: "bold"`
    cellules.push(
      `[#align(center + horizon)[#text(size: 12pt${couleur})[$${chiffre}$]]]`,
    )
  }
  return `#align(center, table(columns: (1cm,) * ${colonnes}, rows: (1cm,) * ${lignes}, inset: 0pt, stroke: ${TRAIT_FIN_TEX}, ${cellules.join(', ')}))`
}

/* -------------------------------------------------------------------------- */
/* Le composant                                                                */
/* -------------------------------------------------------------------------- */

export class GrimukuGrilleElement
  extends MathaleaCustomElement
  implements GrilleDeChiffres
{
  static readonly elementTag = 'grimuku-grille'

  private etat: EtatGrimuku = {
    lignes: 5,
    colonnes: 5,
    grises: [],
    fleches: [],
    donnees: new Map(),
    solution: null,
  }
  private numeroExercice = 0
  private questionIndex = 0
  private champs = new Map<number, HTMLInputElement>()
  private zoneMessage: HTMLElement | null = null

  static create(options: GrimukuGrilleOptions): string {
    const interactivityOn = options.interactivityOn ?? true
    const etat: EtatGrimuku = {
      lignes: options.lignes,
      colonnes: options.colonnes,
      grises: options.grises,
      fleches: options.fleches,
      donnees: new Map(options.donnees ?? []),
      solution: interactivityOn ? null : (options.solution ?? null),
    }
    // La vue Typst régénère l'exercice avec `isHtml` encore vrai : ce cas doit
    // donc être traité avant la branche HTML.
    if (context.isTypst) {
      return `<mathalea-typst>${renderTypstGrille(etat)}</mathalea-typst>`
    }
    if (!context.isHtml) return renderLatexGrille(etat)
    const numeroExercice = options.numeroExercice ?? 0
    const questionIndex = options.questionIndex ?? 0
    const id =
      options.id ??
      `${GrimukuGrilleElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    const elementHtml = super.create({
      id,
      lignes: options.lignes,
      colonnes: options.colonnes,
      grises: serialiseGrises(options.grises),
      fleches: options.fleches,
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
    const lignes = Number(this.getAttribute('lignes')) || 5
    const colonnes = Number(this.getAttribute('colonnes')) || 5
    this.etat = {
      lignes,
      colonnes,
      grises: parseGrises(this.getAttribute('grises'), lignes * colonnes),
      fleches: parseFleches(this.getAttribute('fleches')),
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
    const valeurs: Record<string, string> = {}
    for (const [index, champ] of this.champs) {
      valeurs[cleDeLaCase(index, this.etat.colonnes)] = champ.value.trim()
    }
    return valeurs
  }

  set value(prochaineValeur: unknown) {
    this.update(prochaineValeur)
  }

  update(prochaineValeur: unknown): void {
    const brut = parseJson(prochaineValeur)
    if (brut == null || typeof brut !== 'object') return
    const saisies = brut as Record<string, unknown>
    for (const [index, champ] of this.champs) {
      const saisie = saisies[cleDeLaCase(index, this.etat.colonnes)]
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
    return renderLatexGrille(this.etatAffiche())
  }

  protected renderTypst(): string {
    return renderTypstGrille(this.etatAffiche())
  }

  /** L'énoncé n'affiche jamais la solution, seule la correction la montre. */
  private etatAffiche(): EtatGrimuku {
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

    const grille = document.createElement('div')
    grille.className =
      'grid w-fit border-coopmaths-corpus dark:border-coopmathsdark-corpus'
    grille.style.gridTemplateColumns = `repeat(${this.etat.colonnes}, ${TAILLE_CASE})`
    grille.style.borderStyle = 'solid'
    grille.style.borderWidth = TRAIT_EPAIS
    grille.addEventListener('keydown', this.toucheEnfoncee)
    grille.addEventListener('input', this.saisie)

    for (
      let index = 0;
      index < this.etat.lignes * this.etat.colonnes;
      index++
    ) {
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
    const { colonnes } = this.etat
    const cellule = document.createElement('div')
    cellule.className =
      'relative flex items-center justify-center ' +
      'border-coopmaths-corpus dark:border-coopmathsdark-corpus'
    cellule.dataset.case = String(index)
    cellule.style.width = TAILLE_CASE
    cellule.style.height = TAILLE_CASE
    cellule.style.borderStyle = 'solid'
    // Chaque case ne trace que son bord haut et son bord gauche : le cadre de
    // la grille ferme les deux autres côtés, et deux bordures superposées
    // doubleraient l'épaisseur du trait intérieur.
    cellule.style.borderWidth = '0'
    cellule.style.borderTopWidth =
      ligneDe(index, colonnes) === 0 ? '0' : TRAIT_FIN
    cellule.style.borderLeftWidth =
      colonneDe(index, colonnes) === 0 ? '0' : TRAIT_FIN

    if (this.etat.grises[index]) {
      cellule.classList.add(
        'bg-coopmaths-canvas-darkest',
        'dark:bg-coopmathsdark-canvas-darkest',
      )
      cellule.style.flexDirection = 'column'
      const horizontale = flecheHorizontale(this.etat.fleches, index)
      const verticale = flecheVerticale(this.etat.fleches, index)
      // Le trait de séparation n'a de sens que si la case porte une flèche :
      // une case grise vide reste unie.
      const separee = horizontale !== undefined || verticale !== undefined
      cellule.appendChild(this.construitMoitie(horizontale, true, separee))
      cellule.appendChild(this.construitMoitie(verticale, false, false))
      return cellule
    }

    const chiffre = chiffreAffiche(this.etat, index)
    if (chiffre !== undefined) {
      const valeur = document.createElement('span')
      valeur.className = 'font-bold'
      valeur.style.fontSize = '1.2em'
      // Un chiffre donné par l'énoncé reste en noir ; la solution affichée dans
      // la correction est mise en évidence.
      if (!this.etat.donnees.has(index)) valeur.style.color = orangeMathalea
      valeur.textContent = String(chiffre)
      cellule.appendChild(valeur)
      return cellule
    }

    const champ = creeChampDeSaisie({
      index,
      chiffreMax: 9,
      ariaLabel: `Ligne ${ligneDe(index, colonnes) + 1}, colonne ${colonneDe(index, colonnes) + 1}`,
    })
    cellule.appendChild(champ)
    this.champs.set(index, champ)
    return cellule
  }

  /** Une moitié de case grise : le nombre et sa flèche, ou rien. */
  private construitMoitie(
    fleche: FlecheGrimuku | undefined,
    enHaut: boolean,
    separee: boolean,
  ): HTMLElement {
    const moitie = document.createElement('div')
    moitie.dataset.moitie = enHaut ? 'haut' : 'bas'
    if (separee) moitie.style.borderBottom = `${TRAIT_FIN} solid currentColor`
    moitie.style.width = '100%'
    moitie.style.height = '50%'
    moitie.style.display = 'flex'
    moitie.style.alignItems = 'center'
    moitie.style.gap = '0.15em'
    moitie.style.padding = '0 0.2em'
    moitie.style.fontSize = '0.68em'
    moitie.style.lineHeight = '1'
    if (fleche === undefined) return moitie
    // La flèche vers la gauche se lit à rebours : elle précède son nombre.
    const versLaGauche = fleche.direction === 'gauche'
    moitie.style.justifyContent = versLaGauche ? 'flex-start' : 'flex-end'
    moitie.style.flexDirection = versLaGauche ? 'row-reverse' : 'row'
    const nombre = document.createElement('span')
    nombre.textContent = String(fleche.produit)
    const symbole = document.createElement('span')
    symbole.textContent = FLECHES_HTML[fleche.direction]
    moitie.appendChild(nombre)
    moitie.appendChild(symbole)
    return moitie
  }

  /**
   * Seuls les chiffres de 1 à 9 ont un sens, et le focus reste sur la case
   * saisie : une grille de grimuku ne se remplit pas dans l'ordre de lecture.
   */
  private readonly saisie = filtreLaSaisie

  /** Les flèches du clavier déplacent le curseur d'une case à l'autre. */
  private readonly toucheEnfoncee = (evenement: KeyboardEvent): void => {
    const champ = evenement.target
    if (!(champ instanceof HTMLInputElement)) return
    const deplacement = deplacementDuClavier(evenement.key)
    if (deplacement === undefined) return
    evenement.preventDefault()
    deplaceLeFocus(
      this.champs,
      Number(champ.dataset.case),
      this.etat.lignes,
      this.etat.colonnes,
      deplacement[0],
      deplacement[1],
    )
  }

  /** Colore chaque case selon que sa valeur est juste ou non. */
  marqueLesCases(etats: Map<string, boolean>): void {
    for (const [index, champ] of this.champs) {
      const etat = etats.get(cleDeLaCase(index, this.etat.colonnes))
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
    this.zoneMessage.textContent = `${nbBonnesReponses} case${pluriel} correctement remplie${pluriel} sur ${nbReponses}.`
  }

  /**
   * Vérification interactive : la note est la proportion de cases
   * correctement remplies, multipliée par le barème de la grille et arrondie
   * à l'entier inférieur. Les chiffres écrits d'avance ne comptent pas : ils
   * ne figurent pas dans les réponses attendues construites par l'exercice.
   */
  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): ResultatVerification {
    const id = `${GrimukuGrilleElement.elementTag}Ex${exercice.numeroExercice ?? 0}Q${questionIndex}`
    return verifieLesCases(
      exercice,
      questionIndex,
      document.getElementById(id) as GrimukuGrilleElement | null,
      formatGrimuku(exercice.sup).points,
    )
  }

  static pointsMaxQuestion(exercice: IExercice, _questionIndex: number): number {
    return formatGrimuku(exercice.sup).points
  }
}

registerMathaleaCustomElement(GrimukuGrilleElement)

/** Helper d'injection depuis l'exercice. */
export function ajouteGrimuku(
  exercice: IExercice,
  questionIndex: number,
  options: GrimukuGrilleOptions,
): string {
  return GrimukuGrilleElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}
