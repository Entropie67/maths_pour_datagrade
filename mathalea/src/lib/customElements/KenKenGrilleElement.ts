import { context } from '../../modules/context'
import { orangeMathalea, vertMathalea } from '../colors'
import { miseEnEvidence } from '../outils/embellissements'
import { etiquetteCage, tailleKenKen, type CageKenKen } from '../outils/kenken'
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
 * La grille d'un KenKen : un carré latin découpé en cages.
 *
 * Chaque cage annonce, dans son coin supérieur gauche, le résultat obtenu en
 * combinant ses cases avec l'opération indiquée. Les cages d'une seule case
 * portent une valeur donnée : elle est écrite d'avance et ne compte pas dans
 * le score.
 *
 * Le composant rend les trois sorties attendues d'un composant d'évaluation :
 * HTML interactif, LaTeX (tikz) et Typst. La grille reçoit sa solution
 * uniquement dans la correction : l'énoncé ne la contient jamais, pour ne pas
 * la livrer dans le DOM.
 *
 * @author Rémi Angot
 */

export type KenKenGrilleOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  /** Côté de la grille. */
  taille: number
  cages: CageKenKen[]
  /** Solution complète : à ne transmettre que pour la correction. */
  solution?: number[][]
  interactivityOn?: boolean
}

/** Côté d'une case, en em pour suivre le zoom des vues (voir `construitInterface`). */
const TAILLE_CASE = '2.6em'
/** Épaisseur d'un trait entre deux cases d'une même cage. */
const TRAIT_FIN = '0.08em'
/** Épaisseur d'un trait à la frontière d'une cage. */
const TRAIT_EPAIS = '0.22em'
/** Les mêmes épaisseurs pour la sortie imprimable. */
const TRAIT_FIN_TEX = '0.4pt'
const TRAIT_EPAIS_TEX = '1.6pt'

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
  if (!Number.isFinite(nombre)) return 4
  return Math.min(6, Math.max(2, nombre))
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

function parseCages(valeur: unknown): CageKenKen[] {
  const brut = parseJson(valeur)
  if (!Array.isArray(brut)) return []
  return brut.filter(
    (cage): cage is CageKenKen =>
      cage != null &&
      Array.isArray((cage as CageKenKen).cases) &&
      typeof (cage as CageKenKen).resultat === 'number',
  )
}

function parseSolution(valeur: unknown): number[][] | null {
  const brut = parseJson(valeur)
  if (!Array.isArray(brut)) return null
  if (!brut.every((ligne) => Array.isArray(ligne))) return null
  return brut as number[][]
}

/** Le numéro de cage de chaque case, ou -1 pour une case orpheline. */
function numerosDesCages(cages: CageKenKen[], nbCases: number): number[] {
  const numeros = new Array<number>(nbCases).fill(-1)
  cages.forEach((cage, numero) => {
    for (const index of cage.cases) {
      if (index >= 0 && index < nbCases) numeros[index] = numero
    }
  })
  return numeros
}

/** La case qui porte l'étiquette : la plus haute, puis la plus à gauche. */
function coinDeLaCage(cage: CageKenKen): number {
  return Math.min(...cage.cases)
}

/** Les cases dont la valeur est écrite d'avance, avec cette valeur. */
function valeursDonnees(cages: CageKenKen[]): Map<number, number> {
  const donnees = new Map<number, number>()
  for (const cage of cages) {
    if (cage.operation === '=') donnees.set(cage.cases[0], cage.resultat)
  }
  return donnees
}

/** Vrai quand le trait est à la frontière de la cage de `index`. */
function traitEpais(
  index: number,
  cote: 'haut' | 'bas' | 'gauche' | 'droite',
  taille: number,
  numeros: number[],
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
  return numeros[index] !== numeros[voisine]
}

/* -------------------------------------------------------------------------- */
/* Sorties imprimables                                                         */
/* -------------------------------------------------------------------------- */

/**
 * La grille en tikz.
 *
 * Les traits fins sont tracés avant les traits épais pour qu'une frontière de
 * cage ne soit jamais recouverte par le trait fin de la case voisine.
 */
export function renderLatexGrille(
  taille: number,
  cages: CageKenKen[],
  solution: number[][] | null,
): string {
  const numeros = numerosDesCages(cages, taille * taille)
  const donnees = valeursDonnees(cages)
  // Chaque trait est partagé par deux cases voisines : on le retient une seule
  // fois, en gardant l'épaisseur la plus forte des deux.
  const traits = new Map<string, boolean>()
  for (let index = 0; index < taille * taille; index++) {
    const ligne = ligneDe(index, taille)
    const colonne = colonneDe(index, taille)
    const cotes: {
      cote: 'haut' | 'bas' | 'gauche' | 'droite'
      trace: string
    }[] = [
      {
        cote: 'haut',
        trace: `(${colonne},${-ligne}) -- (${colonne + 1},${-ligne})`,
      },
      {
        cote: 'bas',
        trace: `(${colonne},${-ligne - 1}) -- (${colonne + 1},${-ligne - 1})`,
      },
      {
        cote: 'gauche',
        trace: `(${colonne},${-ligne}) -- (${colonne},${-ligne - 1})`,
      },
      {
        cote: 'droite',
        trace: `(${colonne + 1},${-ligne}) -- (${colonne + 1},${-ligne - 1})`,
      },
    ]
    for (const { cote, trace } of cotes) {
      const epais = traitEpais(index, cote, taille, numeros)
      traits.set(trace, (traits.get(trace) ?? false) || epais)
    }
  }
  const commande = (trace: string, epais: boolean): string =>
    `\\draw[line width=${epais ? TRAIT_EPAIS_TEX : TRAIT_FIN_TEX}] ${trace};`
  // Les traits fins sont tracés d'abord : une frontière de cage n'est jamais
  // recouverte par le trait fin d'une case voisine.
  const fins = [...traits]
    .filter(([, epais]) => !epais)
    .map(([trace]) => commande(trace, false))
  const epais = [...traits]
    .filter(([, estEpais]) => estEpais)
    .map(([trace]) => commande(trace, true))
  const etiquettes = cages
    .filter((cage) => cage.operation !== '=')
    .map((cage) => {
      const coin = coinDeLaCage(cage)
      return `\\node[anchor=north west, font=\\tiny, inner sep=1.5pt] at (${colonneDe(coin, taille)},${-ligneDe(coin, taille)}) {${etiquetteCage(cage)}};`
    })
  const valeurs: string[] = []
  for (let index = 0; index < taille * taille; index++) {
    const donnee = donnees.get(index)
    const trouvee =
      solution?.[ligneDe(index, taille)]?.[colonneDe(index, taille)]
    const contenu = donnee ?? (solution === null ? undefined : trouvee)
    if (contenu === undefined) continue
    // La valeur trouvée est le résultat de l'élève : elle est mise en évidence,
    // tandis qu'une valeur donnée par l'énoncé reste en noir.
    const texte = donnee === undefined ? miseEnEvidence(contenu) : `${contenu}`
    valeurs.push(
      `\\node[font=\\large] at (${colonneDe(index, taille) + 0.5},${-ligneDe(index, taille) - 0.5}) {$${texte}$};`,
    )
  }
  return [
    '\\begin{center}',
    '\\begin{tikzpicture}[x=1cm,y=1cm]',
    ...fins,
    ...epais,
    ...etiquettes,
    ...valeurs,
    '\\end{tikzpicture}',
    '\\end{center}',
  ].join('\n')
}

/** La grille en Typst : un `table` dont chaque cellule porte ses propres traits. */
export function renderTypstGrille(
  taille: number,
  cages: CageKenKen[],
  solution: number[][] | null,
): string {
  const numeros = numerosDesCages(cages, taille * taille)
  const donnees = valeursDonnees(cages)
  const etiquettes = new Map<number, string>()
  for (const cage of cages) {
    if (cage.operation !== '=') {
      etiquettes.set(coinDeLaCage(cage), etiquetteCage(cage))
    }
  }
  const cellules: string[] = []
  for (let index = 0; index < taille * taille; index++) {
    const trait = (cote: 'haut' | 'bas' | 'gauche' | 'droite') =>
      traitEpais(index, cote, taille, numeros) ? TRAIT_EPAIS_TEX : TRAIT_FIN_TEX
    const traits = `(top: ${trait('haut')}, bottom: ${trait('bas')}, left: ${trait('gauche')}, right: ${trait('droite')})`
    const etiquette = etiquettes.get(index)
    const marque =
      etiquette === undefined
        ? ''
        : `#place(top + left, dx: 1pt, dy: 1pt, text(size: 7pt)[${etiquette}])`
    const donnee = donnees.get(index)
    const trouvee =
      solution?.[ligneDe(index, taille)]?.[colonneDe(index, taille)]
    const contenu = donnee ?? (solution === null ? undefined : trouvee)
    const valeur =
      contenu === undefined
        ? ''
        : donnee === undefined
          ? `#align(center + horizon)[#text(size: 12pt, fill: rgb("${orangeMathalea}"), weight: "bold")[$${contenu}$]]`
          : `#align(center + horizon)[#text(size: 12pt)[$${contenu}$]]`
    cellules.push(`table.cell(stroke: ${traits})[${marque}${valeur}]`)
  }
  return `#align(center, table(columns: (1cm,) * ${taille}, rows: (1cm,) * ${taille}, inset: 0pt, ${cellules.join(', ')}))`
}

/* -------------------------------------------------------------------------- */
/* Le composant                                                                */
/* -------------------------------------------------------------------------- */

export class KenKenGrilleElement
  extends MathaleaCustomElement
  implements GrilleDeChiffres
{
  static readonly elementTag = 'kenken-grille'

  private taille = 4
  private cages: CageKenKen[] = []
  private numeros: number[] = []
  private donnees = new Map<number, number>()
  private solution: number[][] | null = null
  private numeroExercice = 0
  private questionIndex = 0
  private champs = new Map<number, HTMLInputElement>()
  private zoneMessage: HTMLElement | null = null

  static create(options: KenKenGrilleOptions): string {
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
      `${KenKenGrilleElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
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
    this.numeros = numerosDesCages(this.cages, this.taille * this.taille)
    this.donnees = valeursDonnees(this.cages)
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
    grille.className = 'grid w-fit'
    grille.style.gridTemplateColumns = `repeat(${this.taille}, ${TAILLE_CASE})`
    grille.addEventListener('keydown', this.toucheEnfoncee)
    grille.addEventListener('input', this.saisie)

    for (let index = 0; index < this.taille * this.taille; index++) {
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

    const cage = this.cages[this.numeros[index]]
    if (
      cage != null &&
      cage.operation !== '=' &&
      coinDeLaCage(cage) === index
    ) {
      const etiquette = document.createElement('span')
      etiquette.className = 'absolute leading-none'
      etiquette.style.top = '0.15em'
      etiquette.style.left = '0.2em'
      etiquette.style.fontSize = '0.6em'
      etiquette.textContent = etiquetteCage(cage)
      cellule.appendChild(etiquette)
    }

    const donnee = this.donnees.get(index)
    if (donnee !== undefined) {
      // Une valeur donnée n'est pas à trouver : elle ne compte pas dans le score.
      const valeur = document.createElement('span')
      valeur.className = 'font-bold'
      valeur.style.fontSize = '1.2em'
      valeur.textContent = String(donnee)
      cellule.appendChild(valeur)
      return cellule
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
    return traitEpais(index, cote, this.taille, this.numeros)
      ? TRAIT_EPAIS
      : TRAIT_FIN
  }

  /**
   * Seuls les chiffres de 1 à n ont un sens dans la grille, et le focus reste
   * sur la case saisie : une grille de KenKen ne se remplit pas dans l'ordre de
   * lecture, l'élève passe d'une cage à l'autre au gré de ses déductions.
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
   * et arrondie à l'entier inférieur. Les valeurs données ne comptent pas :
   * elles ne figurent pas dans les réponses attendues construites par
   * l'exercice.
   */
  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): ResultatVerification {
    const id = `${KenKenGrilleElement.elementTag}Ex${exercice.numeroExercice ?? 0}Q${questionIndex}`
    return verifieLesCases(
      exercice,
      questionIndex,
      document.getElementById(id) as KenKenGrilleElement | null,
      tailleKenKen(exercice.sup),
    )
  }

  static pointsMaxQuestion(exercice: IExercice, _questionIndex: number): number {
    return tailleKenKen(exercice.sup)
  }
}

registerMathaleaCustomElement(KenKenGrilleElement)

/** Helper d'injection depuis l'exercice. */
export function ajouteKenKen(
  exercice: IExercice,
  questionIndex: number,
  options: KenKenGrilleOptions,
): string {
  return KenKenGrilleElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}
