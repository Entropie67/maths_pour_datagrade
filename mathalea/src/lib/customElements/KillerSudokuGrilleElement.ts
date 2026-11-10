import { context } from '../../modules/context'
import { orangeMathalea, vertMathalea } from '../colors'
import { miseEnEvidence } from '../outils/embellissements'
import {
  blocDe,
  dimensionsBloc,
  tailleKiller,
  type CageKiller,
} from '../outils/killerSudoku'
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
 * La grille d'un Killer Sudoku : un sudoku découpé en cages pointillées.
 *
 * Chaque cage annonce, dans son coin supérieur gauche, la somme de ses
 * chiffres. Aucun chiffre n'est donné au départ : toutes les cases sont à
 * remplir, y compris celles des cages d'une seule case.
 *
 * Le composant rend les trois sorties attendues d'un composant d'évaluation :
 * HTML interactif, LaTeX (tikz) et Typst. La grille reçoit sa solution
 * uniquement dans la correction : l'énoncé ne la contient jamais, pour ne pas
 * la livrer dans le DOM.
 *
 * @author Rémi Angot
 */

export type KillerSudokuGrilleOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  /** Côté de la grille : 4, 6 ou 9. */
  taille: number
  cages: CageKiller[]
  /** Solution complète : à ne transmettre que pour la correction. */
  solution?: number[][]
  interactivityOn?: boolean
}

type Point = [number, number]

/** Côté d'une case, en em pour suivre le zoom des vues (voir `construitInterface`). */
const TAILLE_CASE = '2.6em'
/** Épaisseur d'un trait entre deux cases d'un même bloc. */
const TRAIT_FIN = '0.08em'
/** Épaisseur d'un trait à la frontière d'un bloc. */
const TRAIT_EPAIS = '0.22em'
/** Les mêmes épaisseurs pour la sortie imprimable. */
const TRAIT_FIN_TEX = '0.4pt'
const TRAIT_EPAIS_TEX = '1.6pt'
/** Retrait du contour pointillé d'une cage par rapport au bord de ses cases, en côtés de case. */
const RETRAIT_CAGE = 0.1

function ligneDe(index: number, taille: number): number {
  return Math.floor(index / taille)
}

function colonneDe(index: number, taille: number): number {
  return index % taille
}

/** La clé de réponse d'une case, à la convention des tableaux MathALÉA. */
export function cleDeLaCase(index: number, taille: number): string {
  return cleDeLaCasePartagee(ligneDe(index, taille), colonneDe(index, taille))
}

function normaliseTaille(valeur: unknown): number {
  const nombre = Math.round(Number(valeur))
  return nombre === 4 || nombre === 9 ? nombre : 6
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

function parseCages(valeur: unknown): CageKiller[] {
  const brut = parseJson(valeur)
  if (!Array.isArray(brut)) return []
  return brut.filter(
    (cage): cage is CageKiller =>
      cage != null &&
      Array.isArray((cage as CageKiller).cases) &&
      typeof (cage as CageKiller).somme === 'number',
  )
}

function parseSolution(valeur: unknown): number[][] | null {
  const brut = parseJson(valeur)
  if (!Array.isArray(brut)) return null
  if (!brut.every((ligne) => Array.isArray(ligne))) return null
  return brut as number[][]
}

/** La case qui porte l'étiquette : la plus haute, puis la plus à gauche. */
function coinDeLaCage(cage: CageKiller): number {
  return Math.min(...cage.cases)
}

/** Vrai quand le trait est à la frontière d'un bloc. */
function traitEpais(
  index: number,
  cote: 'haut' | 'bas' | 'gauche' | 'droite',
  taille: number,
): boolean {
  const ligne = ligneDe(index, taille)
  const colonne = colonneDe(index, taille)
  if (cote === 'haut' && ligne === 0) return true
  if (cote === 'bas' && ligne === taille - 1) return true
  if (cote === 'gauche' && colonne === 0) return true
  if (cote === 'droite' && colonne === taille - 1) return true
  const voisine =
    cote === 'haut'
      ? index - taille
      : cote === 'bas'
        ? index + taille
        : cote === 'gauche'
          ? index - 1
          : index + 1
  return blocDe(index, taille) !== blocDe(voisine, taille)
}

/* -------------------------------------------------------------------------- */
/* Contour pointillé des cages                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Les contours d'une cage, rentrés vers l'intérieur de `retrait` côtés de case.
 *
 * Les coordonnées sont celles de la grille, en côtés de case, l'axe vertical
 * pointant vers le bas. Une cage a un contour par « trou » en plus de son
 * contour extérieur ; deux cases de la même cage qui se touchent seulement par
 * un coin donnent deux contours distincts.
 */
export function contoursDeLaCage(
  cage: CageKiller,
  taille: number,
  retrait = RETRAIT_CAGE,
): Point[][] {
  const dans = new Set(cage.cases)
  // Les segments de la frontière, parcourus avec la cage à droite (sens horaire
  // à l'écran) : le haut de gauche à droite, la droite de haut en bas, etc.
  const segments: { depart: Point; arrivee: Point }[] = []
  for (const index of cage.cases) {
    const ligne = ligneDe(index, taille)
    const colonne = colonneDe(index, taille)
    const aDroite = colonne < taille - 1 && dans.has(index + 1)
    const aGauche = colonne > 0 && dans.has(index - 1)
    const enHaut = ligne > 0 && dans.has(index - taille)
    const enBas = ligne < taille - 1 && dans.has(index + taille)
    if (!enHaut) {
      segments.push({
        depart: [colonne, ligne],
        arrivee: [colonne + 1, ligne],
      })
    }
    if (!aDroite) {
      segments.push({
        depart: [colonne + 1, ligne],
        arrivee: [colonne + 1, ligne + 1],
      })
    }
    if (!enBas) {
      segments.push({
        depart: [colonne + 1, ligne + 1],
        arrivee: [colonne, ligne + 1],
      })
    }
    if (!aGauche) {
      segments.push({
        depart: [colonne, ligne + 1],
        arrivee: [colonne, ligne],
      })
    }
  }
  const cle = (point: Point): string => `${point[0]},${point[1]}`
  const departs = new Map<string, number[]>()
  segments.forEach((segment, rang) => {
    const liste = departs.get(cle(segment.depart)) ?? []
    liste.push(rang)
    departs.set(cle(segment.depart), liste)
  })
  const utilises = new Set<number>()
  const contours: Point[][] = []
  for (let premier = 0; premier < segments.length; premier++) {
    if (utilises.has(premier)) continue
    const boucle: number[] = []
    let courant = premier
    while (!utilises.has(courant)) {
      utilises.add(courant)
      boucle.push(courant)
      const candidats = (
        departs.get(cle(segments[courant].arrivee)) ?? []
      ).filter((rang) => !utilises.has(rang) || rang === premier)
      if (candidats.length === 0) break
      // Au point de contact de deux cases, on tourne à droite pour rester
      // collé à la même case : chaque contour reste ainsi un polygone simple.
      candidats.sort(
        (a, b) =>
          viragePrefere(segments[courant], segments[a]) -
          viragePrefere(segments[courant], segments[b]),
      )
      courant = candidats[0]
    }
    const points: Point[] = []
    boucle.forEach((rang, position) => {
      const entrant =
        segments[boucle[(position + boucle.length - 1) % boucle.length]]
      const sortant = segments[rang]
      const normaleEntrante = normaleInterieure(entrant)
      const normaleSortante = normaleInterieure(sortant)
      // Un point d'alignement n'est pas un sommet du contour.
      if (
        normaleEntrante[0] === normaleSortante[0] &&
        normaleEntrante[1] === normaleSortante[1]
      ) {
        return
      }
      points.push([
        sortant.depart[0] + retrait * (normaleEntrante[0] + normaleSortante[0]),
        sortant.depart[1] + retrait * (normaleEntrante[1] + normaleSortante[1]),
      ])
    })
    if (points.length >= 3) contours.push(points)
  }
  return contours
}

/** La normale d'un segment, tournée vers l'intérieur de la cage (à droite du sens de parcours). */
function normaleInterieure(segment: { depart: Point; arrivee: Point }): Point {
  const dx = segment.arrivee[0] - segment.depart[0]
  const dy = segment.arrivee[1] - segment.depart[1]
  return [-dy, dx]
}

/** Classe les virages : 0 pour à droite, 1 tout droit, 2 à gauche. */
function viragePrefere(
  entrant: { depart: Point; arrivee: Point },
  sortant: { depart: Point; arrivee: Point },
): number {
  const [ex, ey] = [
    entrant.arrivee[0] - entrant.depart[0],
    entrant.arrivee[1] - entrant.depart[1],
  ]
  const [sx, sy] = [
    sortant.arrivee[0] - sortant.depart[0],
    sortant.arrivee[1] - sortant.depart[1],
  ]
  const produit = ex * sy - ey * sx
  // À l'écran (axe vertical vers le bas), un produit positif tourne à droite.
  return produit > 0 ? 0 : produit === 0 ? 1 : 2
}

/** Les décimales superflues n'ont pas de sens dans une sortie imprimable. */
function arrondi(valeur: number): string {
  return String(Math.round(valeur * 1000) / 1000)
}

/* -------------------------------------------------------------------------- */
/* Sorties imprimables                                                         */
/* -------------------------------------------------------------------------- */

/**
 * La grille en tikz : le quadrillage fin, les traits épais des blocs, puis le
 * contour pointillé de chaque cage et sa somme.
 */
export function renderLatexGrille(
  taille: number,
  cages: CageKiller[],
  solution: number[][] | null,
): string {
  const [hauteur, largeur] = dimensionsBloc(taille)
  const traits: string[] = [
    `\\draw[line width=${TRAIT_FIN_TEX}] (0,${-taille}) grid (${taille},0);`,
  ]
  for (let ligne = 0; ligne <= taille; ligne += hauteur) {
    traits.push(
      `\\draw[line width=${TRAIT_EPAIS_TEX}] (0,${-ligne}) -- (${taille},${-ligne});`,
    )
  }
  for (let colonne = 0; colonne <= taille; colonne += largeur) {
    traits.push(
      `\\draw[line width=${TRAIT_EPAIS_TEX}] (${colonne},0) -- (${colonne},${-taille});`,
    )
  }
  const contours = cages.flatMap((cage) =>
    contoursDeLaCage(cage, taille).map(
      (contour) =>
        `\\draw[dash pattern=on 1.5pt off 1.2pt, line width=0.5pt] ${contour
          .map(([x, y]) => `(${arrondi(x)},${arrondi(-y)})`)
          .join(' -- ')} -- cycle;`,
    ),
  )
  const etiquettes = cages.map((cage) => {
    const coin = coinDeLaCage(cage)
    return `\\node[anchor=north west, font=\\tiny, inner sep=0pt] at (${arrondi(colonneDe(coin, taille) + RETRAIT_CAGE + 0.04)},${arrondi(-ligneDe(coin, taille) - RETRAIT_CAGE - 0.03)}) {${cage.somme}};`
  })
  const valeurs: string[] = []
  if (solution !== null) {
    for (let index = 0; index < taille * taille; index++) {
      const trouvee =
        solution[ligneDe(index, taille)]?.[colonneDe(index, taille)]
      if (trouvee === undefined) continue
      // La valeur trouvée est le résultat de l'élève : elle est mise en évidence.
      valeurs.push(
        `\\node[font=\\large] at (${colonneDe(index, taille) + 0.5},${-ligneDe(index, taille) - 0.5}) {$${miseEnEvidence(trouvee)}$};`,
      )
    }
  }
  return [
    '\\begin{center}',
    '\\begin{tikzpicture}[x=1cm,y=1cm]',
    ...traits,
    ...contours,
    ...etiquettes,
    ...valeurs,
    '\\end{tikzpicture}',
    '\\end{center}',
  ].join('\n')
}

/**
 * La grille en Typst : un `table` dont chaque cellule porte ses propres traits
 * de bloc, sous un `polygon` pointillé par contour de cage.
 */
export function renderTypstGrille(
  taille: number,
  cages: CageKiller[],
  solution: number[][] | null,
): string {
  const etiquettes = new Map<number, number>()
  for (const cage of cages) etiquettes.set(coinDeLaCage(cage), cage.somme)
  const cellules: string[] = []
  for (let index = 0; index < taille * taille; index++) {
    const trait = (cote: 'haut' | 'bas' | 'gauche' | 'droite') =>
      traitEpais(index, cote, taille) ? TRAIT_EPAIS_TEX : TRAIT_FIN_TEX
    const traits = `(top: ${trait('haut')}, bottom: ${trait('bas')}, left: ${trait('gauche')}, right: ${trait('droite')})`
    const etiquette = etiquettes.get(index)
    const marque =
      etiquette === undefined
        ? ''
        : `#place(top + left, dx: 4pt, dy: 3.6pt, text(size: 6pt)[${etiquette}])`
    const trouvee =
      solution?.[ligneDe(index, taille)]?.[colonneDe(index, taille)]
    const valeur =
      trouvee === undefined
        ? ''
        : `#align(center + horizon)[#text(size: 12pt, fill: rgb("${orangeMathalea}"), weight: "bold")[${trouvee}]]`
    cellules.push(`table.cell(stroke: ${traits})[${marque}${valeur}]`)
  }
  const polygones = cages.flatMap((cage) =>
    contoursDeLaCage(cage, taille).map(
      (contour) =>
        `place(top + left, polygon(stroke: (thickness: 0.5pt, dash: "dashed"), ${contour
          .map(([x, y]) => `(${arrondi(x)}cm, ${arrondi(y)}cm)`)
          .join(', ')}))`,
    ),
  )
  const tableau = `place(top + left, table(columns: (1cm,) * ${taille}, rows: (1cm,) * ${taille}, inset: 0pt, ${cellules.join(', ')}))`
  return `#align(center, box(width: ${taille}cm, height: ${taille}cm, { ${[tableau, ...polygones].join('; ')} }))`
}

/* -------------------------------------------------------------------------- */
/* Le composant                                                                */
/* -------------------------------------------------------------------------- */

export class KillerSudokuGrilleElement
  extends MathaleaCustomElement
  implements GrilleDeChiffres
{
  static readonly elementTag = 'killer-sudoku-grille'

  private taille = 6
  private cages: CageKiller[] = []
  private solution: number[][] | null = null
  private numeroExercice = 0
  private questionIndex = 0
  private champs = new Map<number, HTMLInputElement>()
  private zoneMessage: HTMLElement | null = null

  static create(options: KillerSudokuGrilleOptions): string {
    const taille = normaliseTaille(options.taille)
    const cages = options.cages ?? []
    const solution = options.solution ?? null
    const interactivityOn = options.interactivityOn ?? true
    // La vue Typst régénère l'exercice avec `isHtml` encore vrai : ce cas doit
    // donc être traité avant la branche HTML.
    if (context.isTypst) {
      return `<mathalea-typst>${renderTypstGrille(taille, cages, interactivityOn ? null : solution)}</mathalea-typst>`
    }
    if (!context.isHtml) {
      return renderLatexGrille(taille, cages, interactivityOn ? null : solution)
    }
    const numeroExercice = options.numeroExercice ?? 0
    const questionIndex = options.questionIndex ?? 0
    const id =
      options.id ??
      `${KillerSudokuGrilleElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    const elementHtml = super.create({
      id,
      taille,
      cages,
      solution: interactivityOn ? null : solution,
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
    this.taille = normaliseTaille(this.getAttribute('taille'))
    this.cages = parseCages(this.getAttribute('cages'))
    this.solution = parseSolution(this.getAttribute('solution'))
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
      valeurs[cleDeLaCase(index, this.taille)] = champ.value.trim()
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
      const saisie = saisies[cleDeLaCase(index, this.taille)]
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
    return renderLatexGrille(
      this.taille,
      this.cages,
      this.interactivityOn ? null : this.solution,
    )
  }

  protected renderTypst(): string {
    return renderTypstGrille(
      this.taille,
      this.cages,
      this.interactivityOn ? null : this.solution,
    )
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
    grille.className = 'grid w-fit relative'
    grille.style.gridTemplateColumns = `repeat(${this.taille}, ${TAILLE_CASE})`
    grille.addEventListener('keydown', this.toucheEnfoncee)
    grille.addEventListener('input', this.saisie)

    const etiquettes = new Map<number, number>()
    for (const cage of this.cages)
      etiquettes.set(coinDeLaCage(cage), cage.somme)
    for (let index = 0; index < this.taille * this.taille; index++) {
      grille.appendChild(this.construitCase(index, etiquettes.get(index)))
    }
    grille.appendChild(this.construitContours())
    cadre.appendChild(grille)
    this.appendChild(cadre)

    this.zoneMessage = document.createElement('div')
    this.zoneMessage.style.marginTop = '0.5em'
    this.zoneMessage.style.fontSize = '0.875em'
    this.zoneMessage.setAttribute('aria-live', 'polite')
    this.appendChild(this.zoneMessage)

    this.onInteractivityChanged(this.interactivityOn)
  }

  /**
   * Le contour pointillé des cages, superposé à la grille. Le dessin est
   * exprimé en côtés de case : il suit la taille de la grille, donc le zoom.
   */
  private construitContours(): SVGSVGElement {
    const espace = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(espace, 'svg')
    svg.setAttribute('viewBox', `0 0 ${this.taille} ${this.taille}`)
    svg.setAttribute('aria-hidden', 'true')
    svg.style.position = 'absolute'
    svg.style.inset = '0'
    svg.style.width = '100%'
    svg.style.height = '100%'
    svg.style.pointerEvents = 'none'
    for (const cage of this.cages) {
      for (const contour of contoursDeLaCage(cage, this.taille)) {
        const polygone = document.createElementNS(espace, 'polygon')
        polygone.setAttribute(
          'points',
          contour.map(([x, y]) => `${arrondi(x)},${arrondi(y)}`).join(' '),
        )
        polygone.setAttribute('fill', 'none')
        polygone.setAttribute('stroke', 'currentColor')
        polygone.setAttribute('stroke-width', '0.03')
        polygone.setAttribute('stroke-dasharray', '0.09 0.07')
        svg.appendChild(polygone)
      }
    }
    return svg
  }

  private construitCase(index: number, somme: number | undefined): HTMLElement {
    const cellule = document.createElement('div')
    cellule.className =
      'relative flex items-center justify-center ' +
      'border-coopmaths-corpus dark:border-coopmathsdark-corpus'
    cellule.dataset.case = String(index)
    cellule.style.width = TAILLE_CASE
    cellule.style.height = TAILLE_CASE
    cellule.style.borderStyle = 'solid'
    // Chaque case ne trace que son bord haut et son bord gauche : le bord bas
    // d'une case est le bord haut de sa voisine du dessous, et deux bordures
    // superposées doubleraient l'épaisseur du trait intérieur. Seules les cases
    // du bas et de la droite ferment la grille.
    const derniereLigne = ligneDe(index, this.taille) === this.taille - 1
    const derniereColonne = colonneDe(index, this.taille) === this.taille - 1
    cellule.style.borderTopWidth = this.epaisseur(index, 'haut')
    cellule.style.borderLeftWidth = this.epaisseur(index, 'gauche')
    cellule.style.borderBottomWidth = derniereLigne ? TRAIT_EPAIS : '0'
    cellule.style.borderRightWidth = derniereColonne ? TRAIT_EPAIS : '0'

    if (somme !== undefined) {
      const etiquette = document.createElement('span')
      etiquette.className = 'absolute leading-none'
      etiquette.style.top = '0.33em'
      etiquette.style.left = '0.36em'
      etiquette.style.fontSize = '0.6em'
      etiquette.textContent = String(somme)
      cellule.appendChild(etiquette)
    }

    const trouvee =
      this.solution?.[ligneDe(index, this.taille)]?.[
        colonneDe(index, this.taille)
      ]
    if (trouvee !== undefined) {
      // Grille de correction : la solution remplace les champs de saisie.
      const valeur = document.createElement('span')
      valeur.className = 'font-bold'
      valeur.style.fontSize = '1.2em'
      valeur.style.color = orangeMathalea
      valeur.textContent = String(trouvee)
      cellule.appendChild(valeur)
      return cellule
    }

    const champ = creeChampDeSaisie({
      index,
      chiffreMax: this.taille,
      ariaLabel: `Ligne ${ligneDe(index, this.taille) + 1}, colonne ${colonneDe(index, this.taille) + 1}`,
    })
    cellule.appendChild(champ)
    this.champs.set(index, champ)
    return cellule
  }

  private epaisseur(
    index: number,
    cote: 'haut' | 'bas' | 'gauche' | 'droite',
  ): string {
    return traitEpais(index, cote, this.taille) ? TRAIT_EPAIS : TRAIT_FIN
  }

  /**
   * Seuls les chiffres de 1 à n ont un sens dans la grille, et le focus reste
   * sur la case saisie : une grille de Killer Sudoku ne se remplit pas dans
   * l'ordre de lecture, l'élève passe d'une cage à l'autre au gré de ses déductions.
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
      this.taille,
      this.taille,
      deplacement[0],
      deplacement[1],
    )
  }

  /** Colore chaque case selon que sa valeur est juste ou non. */
  marqueLesCases(etats: Map<string, boolean>): void {
    for (const [index, champ] of this.champs) {
      const etat = etats.get(cleDeLaCase(index, this.taille))
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
   * correctement remplies, multipliée par le barème de la grille (sa taille)
   * et arrondie à l'entier inférieur.
   */
  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): ResultatVerification {
    const id = `${KillerSudokuGrilleElement.elementTag}Ex${exercice.numeroExercice ?? 0}Q${questionIndex}`
    return verifieLesCases(
      exercice,
      questionIndex,
      document.getElementById(id) as KillerSudokuGrilleElement | null,
      tailleKiller(exercice.sup),
    )
  }

  static pointsMaxQuestion(
    exercice: IExercice,
    _questionIndex: number,
  ): number {
    return tailleKiller(exercice.sup)
  }
}

registerMathaleaCustomElement(KillerSudokuGrilleElement)

/** Helper d'injection depuis l'exercice. */
export function ajouteKillerSudoku(
  exercice: IExercice,
  questionIndex: number,
  options: KillerSudokuGrilleOptions,
): string {
  return KillerSudokuGrilleElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}
