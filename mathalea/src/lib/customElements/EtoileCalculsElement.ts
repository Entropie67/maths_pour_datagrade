import renderMathInElement from 'katex/contrib/auto-render'
import { MathfieldElement } from 'mathlive'
import { context } from '../../modules/context'
import { orangeMathalea, vertMathalea } from '../colors'
import {
  buildDataKeyboardFromStyle,
  convertClasseToString,
  KeyboardType,
} from '../interactif/claviers/keyboard'
import { fonctionComparaison } from '../interactif/comparisonFunctions'
import { setMathfield, setMathfieldListener } from '../interactif/setMathfield'
import { optionsKatex } from '../latex/Katex'
import { miseEnEvidence } from '../outils/embellissements'
import type { IExercice } from '../types'
import {
  cleDeLaCase,
  pointsMaxDesCases,
  type ResultatVerification,
} from './grilleDeChiffres'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * Une étoile de calculs : un nombre entier au centre, entouré de flèches qui
 * pointent vers lui. Chaque flèche porte une opération (un trou suivi de
 * « $+ 7$ », « $\times 9 + 1$ »...) et l'élève doit retrouver le nombre caché
 * qui, une fois l'opération appliquée, donne le nombre du centre.
 *
 * Le composant rend les trois sorties attendues d'un composant d'évaluation :
 * HTML interactif, LaTeX (tikz) et Typst (dessin natif). L'énoncé ne contient
 * jamais les réponses : elles ne sont transmises que pour la correction, via
 * `montreSolution`.
 *
 * Trois choix guident le rendu HTML :
 *
 * - les nombres et les opérations sont écrits en LaTeX puis rendus par KaTeX,
 *   comme le reste des énoncés du site : la police du dessin est donc celle de
 *   tous les autres exercices ;
 * - la saisie se fait dans un champ MathLive muni de `data-keyboard`, ce qui
 *   ouvre le clavier MathALÉA — indispensable sur smartphone ;
 * - le dessin (le SVG des flèches) est placé **après** mesure des étiquettes
 *   réellement rendues : chaque flèche part du bord de son étiquette et vise le
 *   nombre central, quelles que soient la longueur de l'opération et la taille
 *   de police choisie par l'enseignant (voir `disposeEtRedessine`).
 *
 * Le barème « un point par flèche » reprend les clés `L1C1`, `L1C2`... des
 * grilles de chiffres, donc `pointsMaxDesCases()`. La comparaison, elle, est
 * celle de MathLive (`fonctionComparaison`) et non l'égalité de chaînes des
 * grilles, puisque l'élève saisit un nombre entier et non un chiffre.
 *
 * @author Rémi Angot
 */

/** Les familles de calculs qu'une flèche peut porter. */
export type OperationEtoile =
  | 'ajout'
  | 'soustraction'
  | 'multiplication'
  | 'multiplicationCombinee'

export type BrancheEtoile = {
  operation: OperationEtoile
  /** Le multiplicateur des flèches multiplicatives, sinon `1`. */
  facteur: number
  /** Le terme ajouté ou retranché, toujours positif (`0` s'il n'y en a pas). */
  terme: number
  /** `1` quand le terme est ajouté, `-1` quand il est retranché. */
  signe: 1 | -1
  /** Le nombre entier que l'élève doit retrouver. */
  reponse: number
}

export type EtoileCalculsOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  /** Le nombre inscrit au centre de l'étoile. */
  centre: number
  /** Les flèches, dans le sens des aiguilles d'une montre à partir du haut. */
  branches: BrancheEtoile[]
  /** Affiche les réponses : à ne transmettre que pour la correction. */
  montreSolution?: boolean
  interactivityOn?: boolean
}

/* -------------------------------------------------------------------------- */
/* Géométrie                                                                   */
/* -------------------------------------------------------------------------- */

/** Le demi-encombrement d'un élément du dessin, en pixels. */
export type MesureEtoile = { demiLargeur: number; demiHauteur: number }

/** Blanc laissé entre la pointe d'une flèche et le nombre central. */
const ECART_NOMBRE = 14
/** Longueur du trait de chaque flèche : la même dans toutes les directions. */
const LONGUEUR_FLECHE = 50
/** Blanc laissé entre le talon d'une flèche et son étiquette. */
const ECART_ETIQUETTE = 10
/** Blanc minimal entre deux étiquettes voisines. */
const ECART_ETIQUETTES = 8
/** Marge autour du dessin. */
const MARGE = 6
/** En deçà, le dessin défile plutôt que de rapetisser encore (cibles tactiles). */
const ECHELLE_MINIMALE = 0.65

/** Tailles de police servant aux mesures estimées (sorties imprimées). */
const TAILLE_ETIQUETTE = 17
const TAILLE_NOMBRE = 30

/** Le clavier MathALÉA des champs : seuls des entiers sont à saisir. */
const CLAVIER_ETOILE = buildDataKeyboardFromStyle(
  convertClasseToString(KeyboardType.clavierNumbers),
).join(' ')

type PositionBranche = {
  etiquetteX: number
  etiquetteY: number
  talonX: number
  talonY: number
  pointeX: number
  pointeY: number
}

export type DispositionEtoile = {
  largeur: number
  hauteur: number
  centreX: number
  centreY: number
  branches: PositionBranche[]
}

/**
 * La distance entre le centre d'une boîte et son bord, dans la direction `u`.
 *
 * C'est elle qui aligne le dessin : une flèche s'arrête sur le bord de son
 * étiquette et non sur un rayon fixe, si bien qu'une étiquette large
 * (« $\times 7 + 4$ ») et une étiquette courte (« $+ 6$ ») laissent le même
 * blanc avant le trait.
 */
function sortieBoite(ux: number, uy: number, mesure: MesureEtoile): number {
  const versX =
    Math.abs(ux) < 1e-9 ? Number.POSITIVE_INFINITY : mesure.demiLargeur / Math.abs(ux)
  const versY =
    Math.abs(uy) < 1e-9 ? Number.POSITIVE_INFINITY : mesure.demiHauteur / Math.abs(uy)
  return Math.min(versX, versY)
}

/** Vrai quand deux étiquettes se touchent, en comptant le blanc minimal. */
function seChevauchent(
  ax: number,
  ay: number,
  a: MesureEtoile,
  bx: number,
  by: number,
  b: MesureEtoile,
): boolean {
  return (
    Math.abs(ax - bx) < a.demiLargeur + b.demiLargeur + ECART_ETIQUETTES &&
    Math.abs(ay - by) < a.demiHauteur + b.demiHauteur + ECART_ETIQUETTES
  )
}

/**
 * Éloigne du centre les étiquettes qui se chevauchent.
 *
 * Aux nombres de flèches élevés, deux directions voisines sont trop proches
 * pour que deux étiquettes larges tiennent côte à côte : celle qui est déjà la
 * plus éloignée recule, jusqu'à ce que plus rien ne se touche. Sa flèche
 * s'allonge d'autant, puisqu'une flèche comble toujours l'espace entre son
 * étiquette et le nombre.
 */
function ecarteLesChevauchements(
  rayons: number[],
  directions: { ux: number; uy: number }[],
  etiquettes: MesureEtoile[],
): void {
  const PAS = 5
  const PASSES_MAXIMUM = 60
  for (let passe = 0; passe < PASSES_MAXIMUM; passe++) {
    let chevauchement = false
    for (let i = 0; i < rayons.length; i++) {
      for (let j = i + 1; j < rayons.length; j++) {
        if (
          !seChevauchent(
            directions[i].ux * rayons[i],
            directions[i].uy * rayons[i],
            etiquettes[i],
            directions[j].ux * rayons[j],
            directions[j].uy * rayons[j],
            etiquettes[j],
          )
        ) {
          continue
        }
        chevauchement = true
        rayons[rayons[i] >= rayons[j] ? i : j] += PAS
      }
    }
    if (!chevauchement) return
  }
}

/**
 * Place les étiquettes et les flèches autour du nombre central, puis en déduit
 * la taille du dessin.
 *
 * Les directions sont régulièrement réparties à partir du haut, dans le sens
 * des aiguilles d'une montre. Sur chaque direction, on empile depuis le centre :
 * le bord du nombre, un blanc, la flèche, un blanc, puis le bord de
 * l'étiquette. Chaque flèche est donc portée par la droite qui joint son
 * étiquette au nombre — c'est ce qui les aligne — et mesure `LONGUEUR_FLECHE`,
 * sauf si son étiquette a dû reculer pour ne pas en chevaucher une autre.
 */
export function dispositionEtoile(
  nombre: MesureEtoile,
  etiquettes: MesureEtoile[],
): DispositionEtoile {
  const nbBranches = etiquettes.length
  const directions = etiquettes.map((_, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / nbBranches
    return { ux: Math.cos(angle), uy: Math.sin(angle) }
  })
  const rayonsPointe = directions.map(
    ({ ux, uy }) => sortieBoite(ux, uy, nombre) + ECART_NOMBRE,
  )
  const rayonsEtiquette = directions.map(
    ({ ux, uy }, index) =>
      rayonsPointe[index] +
      LONGUEUR_FLECHE +
      ECART_ETIQUETTE +
      sortieBoite(ux, uy, etiquettes[index]),
  )
  ecarteLesChevauchements(rayonsEtiquette, directions, etiquettes)

  const relatives: (PositionBranche & { demiLargeur: number; demiHauteur: number })[] =
    directions.map(({ ux, uy }, index) => {
      const etiquette = etiquettes[index]
      const rEtiquette = rayonsEtiquette[index]
      // Le talon est posé sur le bord de l'étiquette : la flèche comble tout
      // l'espace laissé libre, même quand l'étiquette a reculé.
      const rTalon =
        rEtiquette - ECART_ETIQUETTE - sortieBoite(ux, uy, etiquette)
      return {
        etiquetteX: ux * rEtiquette,
        etiquetteY: uy * rEtiquette,
        talonX: ux * rTalon,
        talonY: uy * rTalon,
        pointeX: ux * rayonsPointe[index],
        pointeY: uy * rayonsPointe[index],
        demiLargeur: etiquette.demiLargeur,
        demiHauteur: etiquette.demiHauteur,
      }
    })

  let minX = -nombre.demiLargeur
  let maxX = nombre.demiLargeur
  let minY = -nombre.demiHauteur
  let maxY = nombre.demiHauteur
  for (const position of relatives) {
    minX = Math.min(minX, position.etiquetteX - position.demiLargeur)
    maxX = Math.max(maxX, position.etiquetteX + position.demiLargeur)
    minY = Math.min(minY, position.etiquetteY - position.demiHauteur)
    maxY = Math.max(maxY, position.etiquetteY + position.demiHauteur)
  }
  const centreX = -minX + MARGE
  const centreY = -minY + MARGE
  return {
    largeur: maxX - minX + 2 * MARGE,
    hauteur: maxY - minY + 2 * MARGE,
    centreX,
    centreY,
    branches: relatives.map((position) => ({
      etiquetteX: position.etiquetteX + centreX,
      etiquetteY: position.etiquetteY + centreY,
      talonX: position.talonX + centreX,
      talonY: position.talonY + centreY,
      pointeX: position.pointeX + centreX,
      pointeY: position.pointeY + centreY,
    })),
  }
}

/* -------------------------------------------------------------------------- */
/* Contenus                                                                    */
/* -------------------------------------------------------------------------- */

/** L'opération d'une flèche, écrite avec des symboles Unicode (mesures, aria). */
export function operateurTexte(branche: BrancheEtoile): string {
  switch (branche.operation) {
    case 'ajout':
      return `+ ${branche.terme}`
    case 'soustraction':
      return `− ${branche.terme}`
    case 'multiplication':
      return `× ${branche.facteur}`
    case 'multiplicationCombinee':
      return `× ${branche.facteur} ${branche.signe > 0 ? '+' : '−'} ${branche.terme}`
  }
}

/** L'opération d'une flèche, écrite pour le mode mathématique LaTeX. */
export function operateurLatex(branche: BrancheEtoile): string {
  switch (branche.operation) {
    case 'ajout':
      return `+ ${branche.terme}`
    case 'soustraction':
      return `- ${branche.terme}`
    case 'multiplication':
      return `\\times ${branche.facteur}`
    case 'multiplicationCombinee':
      return `\\times ${branche.facteur} ${branche.signe > 0 ? '+' : '-'} ${branche.terme}`
  }
}

/** L'opération d'une flèche, écrite pour le mode mathématique Typst. */
function operateurTypst(branche: BrancheEtoile): string {
  switch (branche.operation) {
    case 'ajout':
      return `+ ${branche.terme}`
    case 'soustraction':
      return `- ${branche.terme}`
    case 'multiplication':
      return `times ${branche.facteur}`
    case 'multiplicationCombinee':
      return `times ${branche.facteur} ${branche.signe > 0 ? '+' : '-'} ${branche.terme}`
  }
}

/** Ce qui occupe le trou d'une étiquette selon le mode d'affichage. */
type ModeTrou = 'champ' | 'pointilles' | 'reponse'

function modeTrou(interactivityOn: boolean, montreSolution: boolean): ModeTrou {
  if (montreSolution) return 'reponse'
  return interactivityOn ? 'champ' : 'pointilles'
}

/* -------------------------------------------------------------------------- */
/* Mesures estimées (sorties imprimées et premier rendu HTML)                  */
/* -------------------------------------------------------------------------- */

/** Largeur approchée d'un texte : suffisante pour poser un dessin imprimé. */
function largeurTexte(texte: string, taille: number): number {
  let largeur = 0
  for (const caractere of texte) {
    if (caractere === ' ') largeur += 0.28
    else if (caractere >= '0' && caractere <= '9') largeur += 0.56
    else largeur += 0.62
  }
  return largeur * taille
}

function mesureNombre(centre: number): MesureEtoile {
  return {
    demiLargeur: largeurTexte(String(centre), TAILLE_NOMBRE) / 2,
    demiHauteur: TAILLE_NOMBRE * 0.5,
  }
}

/** Largeur du trou : un champ de saisie, des pointillés ou la réponse. */
function largeurTrou(branche: BrancheEtoile, mode: ModeTrou): number {
  if (mode === 'champ') return 51
  if (mode === 'reponse') {
    return largeurTexte(String(branche.reponse), TAILLE_ETIQUETTE) * 1.08
  }
  return largeurTexte('…', TAILLE_ETIQUETTE)
}

function mesureEtiquette(branche: BrancheEtoile, mode: ModeTrou): MesureEtoile {
  const largeur =
    largeurTrou(branche, mode) +
    6 +
    largeurTexte(operateurTexte(branche), TAILLE_ETIQUETTE)
  return {
    demiLargeur: largeur / 2,
    demiHauteur: (mode === 'champ' ? 30 : 22) / 2,
  }
}

/** La disposition utilisée hors HTML, et par le premier rendu HTML. */
function dispositionEstimee(
  centre: number,
  branches: BrancheEtoile[],
  mode: ModeTrou,
): DispositionEtoile {
  return dispositionEtoile(
    mesureNombre(centre),
    branches.map((branche) => mesureEtiquette(branche, mode)),
  )
}

/* -------------------------------------------------------------------------- */
/* Dessin des flèches                                                          */
/* -------------------------------------------------------------------------- */

function f(valeur: number): string {
  return String(Number(valeur.toFixed(2)))
}

/** Une flèche : un trait puis une pointe pleine, sans marqueur SVG. */
function flecheSvg(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  couleur: string,
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const longueur = Math.hypot(dx, dy) || 1
  const ux = dx / longueur
  const uy = dy / longueur
  const pointe = 9
  const demiLargeur = 3.6
  const baseX = x2 - ux * pointe
  const baseY = y2 - uy * pointe
  const points = [
    `${f(x2)},${f(y2)}`,
    `${f(baseX - uy * demiLargeur)},${f(baseY + ux * demiLargeur)}`,
    `${f(baseX + uy * demiLargeur)},${f(baseY - ux * demiLargeur)}`,
  ].join(' ')
  return (
    `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(baseX)}" y2="${f(baseY)}" ` +
    `stroke="${couleur}" stroke-width="2" stroke-linecap="round"/>` +
    `<polygon points="${points}" fill="${couleur}"/>`
  )
}

/**
 * Le fond du dessin HTML : les flèches seules.
 *
 * Le nombre central et les étiquettes sont des éléments HTML posés par-dessus,
 * pour que KaTeX les compose comme le reste de l'énoncé et que les champs de
 * saisie soient de vrais champs MathLive.
 */
function svgFleches(disposition: DispositionEtoile, couleur: string): string {
  const traits = disposition.branches
    .map((position) =>
      flecheSvg(
        position.talonX,
        position.talonY,
        position.pointeX,
        position.pointeY,
        couleur,
      ),
    )
    .join('')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${f(disposition.largeur)}" ` +
    `height="${f(disposition.hauteur)}" viewBox="0 0 ${f(disposition.largeur)} ${f(disposition.hauteur)}">` +
    `${traits}</svg>`
  )
}

/* -------------------------------------------------------------------------- */
/* Sorties imprimables                                                         */
/* -------------------------------------------------------------------------- */

/** L'étoile en tikz, pour la sortie LaTeX. */
export function renderLatexEtoile(
  centre: number,
  branches: BrancheEtoile[],
  montreSolution: boolean,
): string {
  const mode: ModeTrou = montreSolution ? 'reponse' : 'pointilles'
  const disposition = dispositionEstimee(centre, branches, mode)
  // Le dessin est décrit en pixels : l'échelle le ramène à une largeur
  // imprimable, sans jamais dépasser la largeur d'une page.
  const echelle = Math.max(45, disposition.largeur / 15)
  const x = (valeur: number) => f(valeur / echelle)
  const y = (valeur: number) => f(-valeur / echelle)
  const lignes: string[] = [
    '\\begin{center}',
    '\\begin{tikzpicture}[x=1cm,y=1cm]',
  ]
  for (const position of disposition.branches) {
    lignes.push(
      `\\draw[->, line width=0.7pt] (${x(position.talonX)},${y(position.talonY)}) -- ` +
        `(${x(position.pointeX)},${y(position.pointeY)});`,
    )
  }
  lignes.push(
    `\\node[font=\\large, inner sep=0pt] at (${x(disposition.centreX)},${y(disposition.centreY)}) ` +
      `{$\\boldsymbol{${centre}}$};`,
  )
  branches.forEach((branche, index) => {
    const position = disposition.branches[index]
    const trou = montreSolution ? miseEnEvidence(branche.reponse) : '\\ldots'
    lignes.push(
      `\\node[font=\\small, inner sep=0pt] at (${x(position.etiquetteX)},${y(position.etiquetteY)}) ` +
        `{$${trou}\\,${operateurLatex(branche)}$};`,
    )
  })
  lignes.push('\\end{tikzpicture}', '\\end{center}')
  return lignes.join('\n')
}

/**
 * L'étoile en Typst, dessinée nativement.
 *
 * Rien n'est embarqué en image : les nombres et les opérations passent par le
 * mode mathématique de Typst, donc par les polices du document, comme le reste
 * de l'énoncé.
 */
export function renderTypstEtoile(
  centre: number,
  branches: BrancheEtoile[],
  montreSolution: boolean,
): string {
  const mode: ModeTrou = montreSolution ? 'reponse' : 'pointilles'
  const disposition = dispositionEstimee(centre, branches, mode)
  // 0,75 convertit un pixel CSS en point ; l'échelle est réduite si le dessin
  // est trop large pour la justification d'une page.
  const echelle = Math.min(0.75, 400 / disposition.largeur)
  const pt = (valeur: number) => `${f(valeur * echelle)}pt`
  const lignes: string[] = [
    `#align(center, box(width: ${pt(disposition.largeur)}, height: ${pt(disposition.hauteur)})[`,
  ]
  for (const position of disposition.branches) {
    const dx = position.pointeX - position.talonX
    const dy = position.pointeY - position.talonY
    const longueur = Math.hypot(dx, dy) || 1
    const ux = dx / longueur
    const uy = dy / longueur
    const baseX = position.pointeX - ux * 9
    const baseY = position.pointeY - uy * 9
    lignes.push(
      `#place(top + left, line(start: (${pt(position.talonX)}, ${pt(position.talonY)}), ` +
        `end: (${pt(baseX)}, ${pt(baseY)}), stroke: 0.9pt))`,
    )
    lignes.push(
      `#place(top + left, polygon(fill: black, stroke: none, ` +
        `(${pt(position.pointeX)}, ${pt(position.pointeY)}), ` +
        `(${pt(baseX - uy * 3.6)}, ${pt(baseY + ux * 3.6)}), ` +
        `(${pt(baseX + uy * 3.6)}, ${pt(baseY - ux * 3.6)})))`,
    )
  }
  const nombre = mesureNombre(centre)
  lignes.push(
    `#place(top + left, dx: ${pt(disposition.centreX - nombre.demiLargeur)}, ` +
      `dy: ${pt(disposition.centreY - nombre.demiHauteur)}, ` +
      `text(size: ${pt(TAILLE_NOMBRE)})[$bold(${centre})$])`,
  )
  branches.forEach((branche, index) => {
    const position = disposition.branches[index]
    const mesure = mesureEtiquette(branche, mode)
    const trou = montreSolution
      ? `#text(fill: rgb("${orangeMathalea}"), weight: "bold")[$${branche.reponse}$]`
      : '$dots.h$'
    lignes.push(
      `#place(top + left, dx: ${pt(position.etiquetteX - mesure.demiLargeur)}, ` +
        `dy: ${pt(position.etiquetteY - mesure.demiHauteur)}, ` +
        `text(size: ${pt(TAILLE_ETIQUETTE)})[${trou} $${operateurTypst(branche)}$])`,
    )
  })
  lignes.push('])')
  return lignes.join('\n')
}

/* -------------------------------------------------------------------------- */
/* Lecture des attributs                                                       */
/* -------------------------------------------------------------------------- */

/** Accepte aussi bien un objet qu'une chaîne JSON (attribut du DOM). */
function parseJson(valeur: unknown): unknown {
  if (typeof valeur !== 'string') return valeur
  try {
    return JSON.parse(valeur)
  } catch {
    return null
  }
}

function parseBranches(valeur: unknown): BrancheEtoile[] {
  const brut = parseJson(valeur)
  if (!Array.isArray(brut)) return []
  return brut
    .filter(
      (branche): branche is BrancheEtoile =>
        branche != null &&
        typeof branche.operation === 'string' &&
        typeof branche.facteur === 'number' &&
        typeof branche.terme === 'number',
    )
    .map((branche) => ({
      operation: branche.operation,
      facteur: branche.facteur,
      terme: branche.terme,
      signe: branche.signe === -1 ? -1 : 1,
      reponse: typeof branche.reponse === 'number' ? branche.reponse : 0,
    }))
}

/** Les réponses attendues d'une question, c'est-à-dire ses flèches à remplir. */
function reponsesAttendues(
  exercice: IExercice,
  questionIndex: number,
): [string, string][] {
  const valeurs = exercice.autoCorrection?.[questionIndex]?.valeur
  if (valeurs == null) return []
  return Object.entries(valeurs)
    .filter(([cle]) => /^L\d+C\d+$/.test(cle))
    .map(([cle, valeur]) => [
      cle,
      String((valeur as { value?: string | number })?.value ?? ''),
    ])
}

/* -------------------------------------------------------------------------- */
/* Le composant                                                                */
/* -------------------------------------------------------------------------- */

export class EtoileCalculsElement extends MathaleaCustomElement {
  static readonly elementTag = 'etoile-calculs'

  private centre = 0
  private branches: BrancheEtoile[] = []
  private montreSolution = false
  private champs = new Map<number, MathfieldElement>()
  private etiquettes: HTMLElement[] = []
  private cadre: HTMLElement | null = null
  private piste: HTMLElement | null = null
  private scene: HTMLElement | null = null
  private fond: HTMLElement | null = null
  private nombreCentral: HTMLElement | null = null
  private zoneMessage: HTMLElement | null = null
  private observateur: ResizeObserver | null = null
  private redessinDemande = 0
  private echelleAppliquee = 1

  static create(options: EtoileCalculsOptions): string {
    const centre = Math.round(options.centre)
    const branches = options.branches ?? []
    const interactivityOn = options.interactivityOn ?? true
    const montreSolution = options.montreSolution ?? false
    // La vue Typst régénère l'exercice avec `isHtml` encore vrai : ce cas doit
    // donc être traité avant la branche HTML.
    if (context.isTypst) {
      return `<mathalea-typst>${renderTypstEtoile(centre, branches, montreSolution)}</mathalea-typst>`
    }
    if (!context.isHtml) {
      return renderLatexEtoile(centre, branches, montreSolution)
    }
    const numeroExercice = options.numeroExercice ?? 0
    const questionIndex = options.questionIndex ?? 0
    const id =
      options.id ??
      `${EtoileCalculsElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    // Les réponses ne sont mises dans le DOM que pour la correction.
    const branchesDom = montreSolution
      ? branches
      : branches.map((branche) => ({ ...branche, reponse: 0 }))
    return super.create({
      id,
      centre,
      branches: branchesDom,
      montreSolution,
      interactivityOn,
      numeroExercice,
      questionIndex,
    })
  }

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    this.centre = Number(this.getAttribute('centre')) || 0
    this.branches = parseBranches(this.getAttribute('branches'))
    this.montreSolution = this.getAttribute('montre-solution') === 'true'
    this.construitInterface()
  }

  disconnectedCallback(): void {
    this.observateur?.disconnect()
    this.observateur = null
    if (this.redessinDemande !== 0) cancelAnimationFrame(this.redessinDemande)
    this.redessinDemande = 0
    this.champs.clear()
    this.etiquettes = []
    this.cadre = null
    this.piste = null
    this.scene = null
    this.fond = null
    this.nombreCentral = null
    this.zoneMessage = null
    this.innerHTML = ''
  }

  get value(): Record<string, string> {
    const valeurs: Record<string, string> = {}
    for (const [index, champ] of this.champs) {
      valeurs[cleDeLaCase(0, index)] = champ.getValue().trim()
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
      const saisie = saisies[cleDeLaCase(0, index)]
      if (saisie == null) continue
      champ.setValue(String(saisie))
    }
  }

  protected onInteractivityChanged(isOn: boolean): void {
    for (const champ of this.champs.values()) {
      champ.readOnly = !isOn
    }
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) return this.renderLatex()
    return ''
  }

  protected renderLatex(): string {
    return renderLatexEtoile(this.centre, this.branches, this.montreSolution)
  }

  protected renderTypst(): string {
    return renderTypstEtoile(this.centre, this.branches, this.montreSolution)
  }

  /* ---------------------------------------------------------------------- */
  /* Construction du dessin HTML                                            */
  /* ---------------------------------------------------------------------- */

  private construitInterface(): void {
    this.innerHTML = ''
    this.champs.clear()
    this.etiquettes = []
    this.classList.add('block', 'not-prose')
    this.style.margin = '1em 0'

    const cadre = document.createElement('div')
    cadre.style.maxWidth = '100%'
    cadre.style.overflowX = 'auto'
    this.cadre = cadre

    // La piste occupe la place réellement prise par le dessin une fois mis à
    // l'échelle : c'est elle qui décide s'il faut ou non défiler.
    const piste = document.createElement('div')
    piste.style.margin = '0 auto'
    this.piste = piste

    const scene = document.createElement('div')
    scene.style.position = 'relative'
    scene.style.transformOrigin = 'top left'
    this.scene = scene

    const fond = document.createElement('div')
    fond.style.position = 'absolute'
    fond.style.left = '0'
    fond.style.top = '0'
    fond.style.pointerEvents = 'none'
    scene.appendChild(fond)
    this.fond = fond

    const nombre = document.createElement('div')
    nombre.style.position = 'absolute'
    nombre.style.transform = 'translate(-50%, -50%)'
    nombre.style.whiteSpace = 'nowrap'
    nombre.style.fontSize = '1.9rem'
    nombre.style.lineHeight = '1'
    nombre.textContent = `$\\boldsymbol{${this.centre}}$`
    scene.appendChild(nombre)
    this.nombreCentral = nombre

    const mode = modeTrou(this.interactivityOn, this.montreSolution)
    this.branches.forEach((branche, index) => {
      const etiquette = this.construitEtiquette(branche, index, mode)
      this.etiquettes.push(etiquette)
      scene.appendChild(etiquette)
    })

    piste.appendChild(scene)
    cadre.appendChild(piste)
    this.appendChild(cadre)

    this.zoneMessage = document.createElement('div')
    this.zoneMessage.style.marginTop = '0.5em'
    this.zoneMessage.style.fontSize = '0.875em'
    this.zoneMessage.setAttribute('aria-live', 'polite')
    this.appendChild(this.zoneMessage)

    this.rendKatex()
    // Une première disposition estimée évite un dessin vide avant la mesure.
    this.applique(dispositionEstimee(this.centre, this.branches, mode))
    this.demandeRedessin()
    this.observeLesTailles()
    this.onInteractivityChanged(this.interactivityOn)
  }

  /** Une étiquette : le trou (champ, pointillés ou réponse) puis l'opération. */
  private construitEtiquette(
    branche: BrancheEtoile,
    index: number,
    mode: ModeTrou,
  ): HTMLElement {
    const etiquette = document.createElement('div')
    etiquette.style.position = 'absolute'
    etiquette.style.transform = 'translate(-50%, -50%)'
    etiquette.style.display = 'flex'
    etiquette.style.alignItems = 'center'
    etiquette.style.gap = '0.2em'
    etiquette.style.whiteSpace = 'nowrap'
    etiquette.style.lineHeight = '1'

    if (mode === 'champ') {
      etiquette.appendChild(this.construitChamp(branche, index))
    } else {
      const trou = document.createElement('span')
      trou.textContent =
        mode === 'reponse'
          ? `$${miseEnEvidence(branche.reponse)}$`
          : '$\\ldots$'
      etiquette.appendChild(trou)
    }

    const operation = document.createElement('span')
    operation.textContent = `$${operateurLatex(branche)}$`
    etiquette.appendChild(operation)
    return etiquette
  }

  /**
   * Le champ de saisie est un MathLive muni de `data-keyboard` : c'est ce qui
   * ouvre le clavier MathALÉA, seul moyen de saisir sur un téléphone puisque
   * le clavier du système n'apparaît pas sur ces champs.
   *
   * Sa largeur est fixe : une étiquette qui s'élargirait à la frappe
   * décalerait la flèche déjà dessinée.
   */
  private construitChamp(
    branche: BrancheEtoile,
    index: number,
  ): MathfieldElement {
    const champ = new MathfieldElement()
    champ.id = `${this.id}-fleche${index}`
    champ.setAttribute('data-keyboard', CLAVIER_ETOILE)
    champ.setAttribute('virtual-keyboard-mode', 'manual')
    champ.setAttribute(
      'aria-label',
      `Nombre caché de la flèche ${index + 1} : ${operateurTexte(branche)}`,
    )
    champ.style.width = '3em'
    champ.style.textAlign = 'center'
    champ.style.border = 'solid'
    champ.style.borderWidth = '0 0 1px 0'
    champ.readOnly = !this.interactivityOn
    if (champ.dataset.listenerAdded !== 'true') {
      if (champ.isConnected) setMathfield(champ)
      else champ.addEventListener('mount', setMathfieldListener, { once: true })
    }
    this.champs.set(index, champ)
    return champ
  }

  /** Compose les `$...$` du dessin comme le reste de l'énoncé. */
  private rendKatex(): void {
    if (this.scene == null) return
    try {
      renderMathInElement(this.scene, optionsKatex as never)
    } catch (error) {
      window.notify('Erreur lors du rendu KaTeX de l’étoile de calculs.', {
        error,
      })
    }
  }

  /**
   * Re-mesure les étiquettes réellement rendues, puis replace tout.
   *
   * C'est ce passage qui aligne les flèches : tant que KaTeX n'a pas composé
   * les formules, que les polices ne sont pas chargées ou que l'enseignant
   * change le zoom, les largeurs estimées sont fausses.
   */
  private demandeRedessin(): void {
    if (this.redessinDemande !== 0) cancelAnimationFrame(this.redessinDemande)
    this.redessinDemande = requestAnimationFrame(() => {
      this.redessinDemande = 0
      this.disposeEtRedessine()
    })
  }

  private disposeEtRedessine(): void {
    if (this.scene == null || this.nombreCentral == null) return
    const mesure = (element: HTMLElement): MesureEtoile => ({
      demiLargeur: element.offsetWidth / 2,
      demiHauteur: element.offsetHeight / 2,
    })
    const mesures = this.etiquettes.map(mesure)
    if (mesures.some(({ demiLargeur }) => demiLargeur === 0)) return
    this.applique(dispositionEtoile(mesure(this.nombreCentral), mesures))
  }

  private applique(disposition: DispositionEtoile): void {
    if (
      this.scene == null ||
      this.piste == null ||
      this.fond == null ||
      this.nombreCentral == null
    ) {
      return
    }
    this.scene.style.width = `${f(disposition.largeur)}px`
    this.scene.style.height = `${f(disposition.hauteur)}px`
    this.fond.innerHTML = svgFleches(disposition, 'currentColor')
    this.nombreCentral.style.left = `${f(disposition.centreX)}px`
    this.nombreCentral.style.top = `${f(disposition.centreY)}px`
    this.etiquettes.forEach((etiquette, index) => {
      const position = disposition.branches[index]
      if (position == null) return
      etiquette.style.left = `${f(position.etiquetteX)}px`
      etiquette.style.top = `${f(position.etiquetteY)}px`
    })

    // Sur un écran étroit, mieux vaut réduire un peu le dessin que forcer un
    // défilement horizontal. En deçà de `ECHELLE_MINIMALE`, les champs
    // deviendraient trop petits pour le doigt : le défilement reprend la main.
    const disponible = this.cadre?.clientWidth ?? 0
    let echelle =
      disponible === 0
        ? 1
        : Math.min(1, Math.max(ECHELLE_MINIMALE, disponible / disposition.largeur))
    // Réduire le dessin peut faire disparaître la barre de défilement, donc
    // élargir le cadre, donc réagrandir le dessin : on ignore les variations
    // minuscules pour ne pas osciller d'une mesure à l'autre.
    if (Math.abs(echelle - this.echelleAppliquee) < 0.02) {
      echelle = this.echelleAppliquee
    }
    this.echelleAppliquee = echelle
    this.scene.style.transform = echelle === 1 ? '' : `scale(${f(echelle)})`
    this.piste.style.width = `${f(disposition.largeur * echelle)}px`
    this.piste.style.height = `${f(disposition.hauteur * echelle)}px`
  }

  /**
   * Le zoom des vues, le chargement des polices et la largeur de l'écran
   * changent les mesures : chacun doit relancer une mise en place.
   */
  private observeLesTailles(): void {
    if (typeof ResizeObserver === 'undefined') return
    this.observateur = new ResizeObserver(() => this.demandeRedessin())
    if (this.cadre != null) this.observateur.observe(this.cadre)
    if (this.nombreCentral != null) this.observateur.observe(this.nombreCentral)
    for (const etiquette of this.etiquettes) this.observateur.observe(etiquette)
  }

  /* ---------------------------------------------------------------------- */
  /* Correction interactive                                                 */
  /* ---------------------------------------------------------------------- */

  /** Colore chaque flèche selon que sa valeur est juste ou non. */
  marqueLesChamps(etats: Map<string, boolean>): void {
    for (const [index, champ] of this.champs) {
      const etat = etats.get(cleDeLaCase(0, index))
      if (etat === undefined) continue
      const couleur = etat ? vertMathalea : orangeMathalea
      champ.style.color = couleur
      champ.style.borderColor = couleur
      champ.style.backgroundColor = `${couleur}22`
    }
  }

  afficheLeScore(nbBonnesReponses: number, nbReponses: number): void {
    if (this.zoneMessage == null) return
    this.zoneMessage.style.color = orangeMathalea
    const pluriel = nbBonnesReponses > 1 ? 's' : ''
    this.zoneMessage.textContent = `${nbBonnesReponses} flèche${pluriel} correctement complétée${pluriel} sur ${nbReponses}.`
  }

  /**
   * Vérification interactive : chaque flèche correctement complétée rapporte un
   * point. La comparaison est celle de MathLive, la saisie étant un nombre
   * entier écrit dans un champ mathématique.
   */
  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): ResultatVerification {
    const id = `${EtoileCalculsElement.elementTag}Ex${exercice.numeroExercice ?? 0}Q${questionIndex}`
    const element = document.getElementById(
      id,
    ) as EtoileCalculsElement | null
    const attendues = reponsesAttendues(exercice, questionIndex)
    if (element == null || attendues.length === 0) {
      return {
        isOk: false,
        feedback: '',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    exercice.answers ??= {}
    exercice.answers[element.id] = JSON.stringify(element.value)
    const saisies = element.value
    const etats = new Map<string, boolean>()
    let nbBonnesReponses = 0
    for (const [cle, attendue] of attendues) {
      const saisie = saisies[cle] ?? ''
      const isOk = saisie !== '' && fonctionComparaison(saisie, attendue).isOk
      if (isOk) nbBonnesReponses++
      etats.set(cle, isOk)
    }
    element.marqueLesChamps(etats)
    element.afficheLeScore(nbBonnesReponses, attendues.length)
    element.interactivityOn = false
    return {
      isOk: nbBonnesReponses === attendues.length,
      feedback: '',
      score: { nbBonnesReponses, nbReponses: attendues.length },
    }
  }

  static pointsMaxQuestion(exercice: IExercice, questionIndex: number): number {
    return pointsMaxDesCases(exercice, questionIndex)
  }
}

registerMathaleaCustomElement(EtoileCalculsElement)

/** Helper d'injection depuis l'exercice. */
export function ajouteEtoileCalculs(
  exercice: IExercice,
  questionIndex: number,
  options: EtoileCalculsOptions,
): string {
  return EtoileCalculsElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}
