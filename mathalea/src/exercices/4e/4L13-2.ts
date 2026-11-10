import { codageSegments } from '../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone, polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { homothetie } from '../../lib/2d/transformations'
import type { AllChoicesType } from '../../lib/customElements/ListeDeroulanteElement'
import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi, rangeMinMax } from '../../lib/outils/nombres'
import { prenom } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import type {
  AnswerType,
  CompareFunction,
  OptionsComparaisonType,
  ResultType,
  Valeur,
} from '../../lib/types'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { queDevant } from '../../lib/outils/outilString'

export const titre = 'Mettre un problème en équation et le résoudre'
export const interactifReady = true

export const dateDePublication = '04/04/2022'
export const dateDeModifImportante = '03/11/2026'

/**
 * Un seul problème, décomposé en cinq étapes :
 * choix de l'inconnue (liste déroulante), expression des grandeurs en fonction
 * de l'inconnue, écriture de l'équation, résolution, réponse à la question.
 * Plusieurs choix d'inconnue sont souvent possibles : les étapes suivantes sont
 * alors corrigées en fonction de l'inconnue effectivement choisie.
 * Chaque étape rapporte un point, quel que soit le problème tiré.
 *
 * @author Guillaume Valmont (version initiale), décomposition en étapes par Rémi Angot
 */
export const uuid = '75a84'

export const refs = {
  'fr-fr': ['4L13-2', 'BP2RES3'],
  'fr-ch': ['10LCFA5D-1', '10LSFA5D-1', '11CTFA4A-4', '11LCFA4A-4', '11LSFA4A-4', 'PRQAL04C-2', 'PRQAL04D-1', 'PRQAL04E-4'],
}

/* -------------------------------------------------------------------------- */
/*                          Description d'un problème                         */
/* -------------------------------------------------------------------------- */

/**
 * Une façon de mettre le problème en équation, déterminée par la grandeur
 * choisie comme inconnue (`indice` est son rang dans `Probleme.donnees`).
 */
type Variante = {
  /** Rang, dans `Probleme.donnees`, de la grandeur prise pour inconnue. */
  indice: number
  /** Expression de chaque grandeur de `Probleme.donnees` en fonction de x. */
  expressions: string[]
  /** Équation traduisant l'énoncé (nombres bruts, sans mise en forme). */
  equation: string
  /** Coefficients a, b, c, d de l'équation une fois réduite en ax+b=cx+d. */
  coeffs: [number, number, number, number]
}

type Probleme = {
  enonce: string
  /** Phrase annonçant ce que l'on cherche, affichée avant la question a). */
  objectif: string
  figure: string
  /** Grandeurs à exprimer en fonction de l'inconnue (au plus 5). */
  donnees: string[]
  /** Grandeurs déjà connues : elles ne peuvent pas servir d'inconnue. */
  distracteurs: string[]
  variantes: Variante[]
  /** Question posée à l'élève, et réponse attendue (nombres bruts). */
  question: string
  reponseFinale: string
  uniteReponse: string
  optionsReponseFinale?: OptionsComparaisonType
  verification: string
}

/* -------------------------------------------------------------------------- */
/*                            Outils de mise en forme                         */
/* -------------------------------------------------------------------------- */

/** Passe une écriture LaTeX à nombres bruts en écriture française. */
function enFrancais(tex: string): string {
  return tex
    // Les couleurs hexadécimales LaTeX et HTML ne sont pas des nombres.
    .replace(
      /(\[HTML\]\{[0-9A-Fa-f]{6}\}|\{#[0-9A-Fa-f]{6}\})|(?<![\d.,])(\d{4,})(?!\d)/g,
      (correspondance, couleur, entier) =>
        couleur ? correspondance : texNombre(Number(entier), 0),
    )
    .replace(/(\d)\.(\d)/g, '$1{,}$2')
}

/** Écrit le monôme kx : `x`, `-x`, `0` ou `3x`. */
function monome(k: number): string {
  if (k === 0) return '0'
  if (k === 1) return 'x'
  if (k === -1) return '-x'
  return `${k}x`
}

/** Écrit un terme additif : `+5`, `-5`, ou rien s'il est nul. */
function terme(v: number): string {
  if (v === 0) return ''
  return v > 0 ? `+${texNombre(v)}` : `${texNombre(v)}`
}

/** Écrit le membre kx+v : `5x+34`, `94`, `-x`, `0`… */
function membre(k: number, v: number): string {
  if (k === 0) return `${texNombre(v)}`
  return `${monome(k)}${terme(v)}`
}

/** Solution de l'équation réduite ax+b=cx+d. */
function solutionDe([a, b, c, d]: [number, number, number, number]): number {
  return arrondi((d - b) / (a - c))
}

/** Équation réduite ax+b=cx+d, écrite avec des nombres bruts. */
function equationReduite([a, b, c, d]: [
  number,
  number,
  number,
  number,
]): string {
  return `${membre(a, b)}=${membre(c, d)}`
}

/**
 * Corrigé pas à pas de la résolution de ax+b=cx+d (avec a ≠ c).
 * Les étapes inutiles (quand b ou c est nul, quand a-c vaut 1 ou -1) sont
 * supprimées pour ne pas alourdir la correction.
 */
function resolutionAffine([a, b, c, d]: [
  number,
  number,
  number,
  number,
]): string {
  const coefficient = arrondi(a - c)
  const constante = arrondi(d - b)
  const solution = solutionDe([a, b, c, d])
  const lignes = [`${membre(a, b)} &= ${membre(c, d)}`]
  if (b !== 0 || c !== 0) {
    lignes.push(
      `${c !== 0 ? `(${a}${terme(-c)})x` : monome(a)} &= ${d === 0 ? `${-b}` : `${texNombre(d)}${terme(-b)}`}`,
    )
    lignes.push(`${monome(coefficient)} &= ${texNombre(constante)}`)
  }
  if (Math.abs(coefficient) !== 1) {
    lignes.push(`x &= \\dfrac{${texNombre(constante)}}{${coefficient}}`)
  }
  lignes.push(`x &= ${miseEnEvidence(texNombre(Number(String(solution))))}`)
  return `On regroupe les termes en $x$ dans un membre et les nombres dans l'autre, puis on divise :<br>
  $\\begin{aligned}${enFrancais(lignes.join('\\\\\n'))}\\end{aligned}$<br>`
}

/** Corrigé complet du problème pour l'un des choix d'inconnue possibles. */
function corrigeVariante(probleme: Probleme, variante: Variante): string {
  let texte = texteEnCouleurEtGras(
    `Si on choisit pour inconnue ${probleme.donnees[variante.indice]} :`,
    'black',
  )
  texte += '<br>'
  texte += probleme.donnees
    .map(
      (donnee, rang) =>
        `• ${donnee} : $${enFrancais(variante.expressions[rang])}$`,
    )
    .join('<br>')
  texte += `<br>L'énoncé se traduit alors par l'équation : $${enFrancais(variante.equation)}$.<br>`
  const reduite = equationReduite(variante.coeffs)
  if (reduite !== variante.equation) {
    texte += `On développe et on réduit chaque membre : $${enFrancais(reduite)}$.<br>`
  }
  texte += resolutionAffine(variante.coeffs)
  return texte
}

/* -------------------------------------------------------------------------- */
/*                                   Figures                                  */
/* -------------------------------------------------------------------------- */

function triangleIsocele1(): string {
  const O = pointAbstrait(6, 1.5)
  const B = pointAbstrait(0, 0)
  const A = pointAbstrait(0, 3)
  return mathalea2d(
    { xmin: -1, xmax: 7, ymin: -1, ymax: 4, pixelsParCm: 20, scale: 0.8 },
    polygone(O, A, B),
    codageSegments('//', 'black', O, A, O, B),
  )
}

function triangleIsocele2(): string {
  const O = pointAbstrait(3, 1.5)
  const B = pointAbstrait(6, 0)
  const A = pointAbstrait(0, 0)
  return mathalea2d(
    { xmin: -1, xmax: 7, ymin: -1, ymax: 2.5, pixelsParCm: 20, scale: 0.8 },
    polygone(O, A, B),
    codageSegments('//', 'black', O, A, O, B),
  )
}

function figureThales(
  a: number | string,
  b: number | string,
  c: number | string,
  OC: number | string,
): string {
  const O = pointAbstrait(1.5, 0, 'O')
  const B = pointAbstrait(4, 6, 'B')
  const A = pointAbstrait(0, 5, 'A')
  const D = homothetie(B, O, 0.4, 'D')
  const C = homothetie(A, O, 0.4, 'C')
  const OAB = polygoneAvecNom(O, C, A, B, D)
  return mathalea2d(
    { xmin: -1, xmax: 5, ymin: -1, ymax: 7, pixelsParCm: 20, scale: 0.8 },
    OAB[0],
    OAB[1],
    texteParPosition(`${OC}`, 0.5, 1),
    texteParPosition(`${b}`, 0, 3),
    texteParPosition(`${c}`, 2, 6),
    texteParPosition(`${a}`, 1.5, 2.5),
    segment(C, D),
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Les problèmes                              */
/* -------------------------------------------------------------------------- */

function basket(): Probleme {
  const x = randint(5, 15) // nombre de paniers à trois points
  const a = randint(5, 12) // paniers à deux points de plus que de paniers à trois points
  const b = randint(15, 30) // points marqués sur les lancers francs
  const d = b + (a + x) * 2 + x * 3 // total des points du match
  return {
    enonce: `Une équipe de basket a marqué $${d}$ points lors d'un match. Au cours de ce match, elle a marqué $${b}$ points sur lancers francs.<br>
    L'équipe a marqué $${a}$ paniers à deux points de plus que de paniers à trois points.`,
    objectif:
      "On cherche à déterminer le nombre de paniers à trois points marqués par l'équipe.",
    figure: '',
    donnees: [
      'le nombre de paniers à trois points',
      'le nombre de paniers à deux points',
    ],
    distracteurs: [
      'le nombre de points marqués sur les lancers francs',
      'le nombre total de points marqués',
    ],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `x+${a}`],
        equation: `3x+2(x+${a})+${b}=${d}`,
        coeffs: [5, 2 * a + b, 0, d],
      },
      {
        indice: 1,
        expressions: [`x-${a}`, 'x'],
        equation: `3(x-${a})+2x+${b}=${d}`,
        coeffs: [5, b - 3 * a, 0, d],
      },
    ],
    question: "Combien l'équipe a-t-elle marqué de paniers à trois points ?",
    reponseFinale: String(x),
    uniteReponse: 'paniers à trois points',
    verification: `$3\\times ${x}+2\\times ${x + a}+${b}=${3 * x}+${2 * (x + a)}+${b}=${d}$`,
  }
}

function basket2(): Probleme {
  const x = randint(17, 27) // nombre de paniers à deux points
  const a = randint(5, 12) // paniers à trois points de moins que de paniers à deux points
  const b = randint(15, 30) // points marqués sur les lancers francs
  const d = b + (x - a) * 3 + x * 2 // total des points du match
  return {
    enonce: `Une équipe de basket a marqué $${d}$ points lors d'un match. Au cours de ce match, elle a marqué $${b}$ points sur lancers francs.<br>
    L'équipe a marqué $${a}$ paniers à trois points de moins que de paniers à deux points.`,
    objectif:
      "On cherche à déterminer le nombre de paniers à deux points marqués par l'équipe.",
    figure: '',
    donnees: [
      'le nombre de paniers à trois points',
      'le nombre de paniers à deux points',
    ],
    distracteurs: [
      'le nombre de points marqués sur les lancers francs',
      'le nombre total de points marqués',
    ],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `x+${a}`],
        equation: `3x+2(x+${a})+${b}=${d}`,
        coeffs: [5, 2 * a + b, 0, d],
      },
      {
        indice: 1,
        expressions: [`x-${a}`, 'x'],
        equation: `3(x-${a})+2x+${b}=${d}`,
        coeffs: [5, b - 3 * a, 0, d],
      },
    ],
    question: "Combien l'équipe a-t-elle marqué de paniers à deux points ?",
    reponseFinale: String(x),
    uniteReponse: 'paniers à deux points',
    verification: `$2\\times ${x}+3\\times ${x - a}+${b}=${2 * x}+${3 * (x - a)}+${b}=${d}$`,
  }
}

function achats(valeurEntiere: boolean): Probleme {
  let x: number // prix d'un kilogramme
  let a: number // nombre de kilogrammes achetés
  let b: number // prix payé
  const quidam = prenom(1)
  const produit = choice([
    'fraises',
    'pêches',
    'poires',
    'pommes',
    'mangues',
    'prunes',
    'citrons',
  ])
  do {
    x = randint(2, 5) + (valeurEntiere ? 0 : randint(0, 4) / 5)
    a = randint(2, 5) + (valeurEntiere ? 0 : randint(0, 1) / 5)
    b = arrondi(a * x, 2)
  } while (b >= 100 || b <= 5 || b % 10 === 0)
  const d = b > 50 ? 100 : b > 20 ? 50 : b > 10 ? 20 : 10 // valeur du billet
  const rendu = arrondi(d - b, 2)
  return {
    enonce: `${quidam} a acheté $${texNombre(a, 2)}$ kg de ${produit} avec un billet de $${d}$ €. Le marchand lui a rendu $${texPrix(rendu)}$ €.`,
    objectif: `On cherche à déterminer le prix d'un kilogramme de ${produit}.`,
    figure: '',
    donnees: [
      `le prix d'un kilogramme de ${produit}`,
      `le prix payé pour les $${texNombre(a)}$ kg de ${produit}`,
    ],
    distracteurs: [
      'la somme rendue par le marchand',
      'la valeur du billet donné au marchand',
    ],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `${a}x`],
        equation: `${a}x+${rendu}=${d}`,
        coeffs: [a, rendu, 0, d],
      },
      {
        indice: 1,
        expressions: [`\\dfrac{x}{${a}}`, 'x'],
        equation: `x+${rendu}=${d}`,
        coeffs: [1, rendu, 0, d],
      },
    ],
    question: `Quel est le prix d'un kilogramme de ${produit} ?`,
    reponseFinale: String(x),
    uniteReponse: '€',
    verification: `$${texNombre(a, 2)}\\times ${texNombre(x, 2)}+${texPrix(rendu)}=${texPrix(b)}+${texPrix(rendu)}=${d}$`,
  }
}

function polyg(valeurEntiere: boolean): Probleme {
  const polygones = ['triangle', 'quadrilatère', 'pentagone', 'hexagone']
  const x = randint(2, 4) + (valeurEntiere ? 0 : randint(0, 9) / 2) // longueur d'un côté égal
  const a = randint(2, 5) + (valeurEntiere ? 0 : randint(0, 9) / 2) // longueur du côté différent
  const b = randint(2, 5) // nombre de côtés de même longueur
  const d = arrondi(b * x + a, 2) // périmètre
  return {
    enonce: `Un ${polygones[b - 2]} possède un côté de longueur $${texNombre(a, 2)}\\text{ cm}$ et $${b}$ autres côtés de même longueur.<br>
    Son périmètre est $${texNombre(d, 2)}\\text{ cm}$.`,
    objectif: 'On cherche à déterminer la longueur des côtés de même longueur.',
    figure: '',
    donnees: [
      'la longueur d’un des côtés de même longueur',
      'la longueur totale des côtés de même longueur',
    ],
    distracteurs: [
      `la longueur du côté qui mesure $${texNombre(a)}$ cm`,
      'le périmètre du polygone',
    ],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `${b}x`],
        equation: `${b}x+${a}=${d}`,
        coeffs: [b, a, 0, d],
      },
      {
        indice: 1,
        expressions: [`\\dfrac{x}{${b}}`, 'x'],
        equation: `x+${a}=${d}`,
        coeffs: [1, a, 0, d],
      },
    ],
    question: 'Quelle est la longueur des côtés de même longueur, en cm ?',
    reponseFinale: String(x),
    uniteReponse: 'cm',
    verification: `$${b}\\times ${texNombre(x, 2)}+${texNombre(a, 2)}=${texNombre(arrondi(b * x, 2), 2)}+${texNombre(a, 2)}=${texNombre(d, 2)}$`,
  }
}

function programme1(solutionPositive: boolean): Probleme {
  let a: number
  let b: number
  let c: number
  let d: number
  do {
    a = randint(2, 15)
    b = randint(1, 10)
    c = randint(2, 15)
    d = randint(1, 10)
  } while (
    (solutionPositive
      ? (c * d - a * b) * (a - c) <= 0
      : (c * d - a * b) * (a - c) >= 0) ||
    Math.abs(c * d - a * b) % Math.abs(a - c) !== 0
  )
  const x = Math.round((c * d - a * b) / (a - c))
  const quidam = prenom(2)
  return {
    enonce: `${quidam[0]} et ${quidam[1]} choisissent un même nombre.<br>
    ${quidam[0]} lui ajoute $${b}$ puis multiplie le résultat par $${a}$, alors ${queDevant(quidam[1])} lui ajoute $${d}$ puis multiplie le résultat par $${c}$.<br>
    ${quidam[0]} et ${quidam[1]} obtiennent le même résultat.`,
    objectif: `On cherche à déterminer le nombre choisi au départ par ${quidam[0]} et ${quidam[1]}.`,
    figure: '',
    donnees: [
      'le nombre choisi au départ',
      `le résultat obtenu par ${quidam[0]}`,
      `le résultat obtenu par ${quidam[1]}`,
    ],
    distracteurs: [
      `le nombre ${b} ajouté par ${quidam[0]}`,
      `le nombre ${c} utilisé par ${quidam[1]}`,
    ],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `${a}(x+${b})`, `${c}(x+${d})`],
        equation: `${a}(x+${b})=${c}(x+${d})`,
        coeffs: [a, a * b, c, c * d],
      },
    ],
    question: `Quel nombre ${quidam[0]} et ${quidam[1]} ont-ils choisi au départ ?`,
    reponseFinale: String(x),
    uniteReponse: '',
    verification: `$(${x}+${b})\\times ${a}=${a * (x + b)}$ et $(${x}+${d})\\times ${c}=${c * (x + d)}$`,
  }
}

function programme2(): Probleme {
  let a: number
  let b: number
  let c: number
  let d: number
  do {
    a = randint(2, 15)
    b = randint(1, 10)
    c = randint(2, 15)
    d = randint(1, 10)
  } while (
    (d - a * b) * (a - c) <= 0 ||
    Math.abs(d - a * b) % Math.abs(a - c) !== 0
  )
  const x = Math.round((d - a * b) / (a - c))
  const quidam = prenom(2)
  return {
    enonce: `${quidam[0]} et ${quidam[1]} choisissent un même nombre.<br>
    ${quidam[0]} lui ajoute $${b}$ puis multiplie le résultat par $${a}$, alors ${queDevant(quidam[1])} le multiplie par $${c}$ puis ajoute $${d}$ au résultat.<br>
    ${quidam[0]} et ${quidam[1]} obtiennent le même résultat.`,
    objectif: `On cherche à déterminer le nombre choisi au départ par ${quidam[0]} et ${quidam[1]}.`,
    figure: '',
    donnees: [
      'le nombre choisi au départ',
      `le résultat obtenu par ${quidam[0]}`,
      `le résultat obtenu par ${quidam[1]}`,
    ],
    distracteurs: [
      `le nombre ${b} ajouté par ${quidam[0]}`,
      `le nombre ${d} ajouté par ${quidam[1]}`,
    ],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `${a}(x+${b})`, `${c}x+${d}`],
        equation: `${a}(x+${b})=${c}x+${d}`,
        coeffs: [a, a * b, c, d],
      },
    ],
    question: `Quel nombre ${quidam[0]} et ${quidam[1]} ont-ils choisi au départ ?`,
    reponseFinale: String(x),
    uniteReponse: '',
    verification: `$(${x}+${b})\\times ${a}=${a * (x + b)}$ et $${c}\\times ${x < 0 ? `(${x})` : x}+${d}=${c * x + d}$`,
  }
}

function tarifs(valeurEntiere: boolean): Probleme {
  const clubs = ['ciné-club', 'club de fitness', 'club de ski']
  let club: number
  let b: number // prix d'une séance avec le tarif A
  let c: number // abonnement annuel du tarif B
  let d: number // prix d'une séance avec le tarif B
  do {
    club = randint(0, 2)
    b = valeurEntiere ? randint(5, 8) : randint(50, 80) / 10
    c = randint(4, 10) * 5
    d = arrondi(b - (valeurEntiere ? randint(1, 3) : randint(2, 6) * 0.5), 2)
  } while (
    c / (b - d) >= 30 ||
    c / (b - d) <= 10 ||
    (c * 2) % ((b - d) * 2) !== 0
  )
  const x = Math.round(c / (b - d))
  return {
    enonce: `Le ${clubs[club]} d'un village propose deux tarifs à ses pratiquants.<br>
    Le tarif A propose de payer $${texPrix(b)}$ € à chaque séance.<br>
    Le tarif B propose de payer un abonnement annuel de $${texPrix(c)}$ € puis $${texPrix(d)}$ € par séance.`,
    objectif:
      'On cherche à déterminer le nombre de séances pour lequel les deux tarifs sont égaux.',
    figure: '',
    donnees: [
      'le nombre de séances',
      'le prix payé avec le tarif A',
      'le prix payé avec le tarif B',
    ],
    distracteurs: [
      "le montant de l'abonnement annuel du tarif B",
      'le prix d’une séance avec le tarif A',
    ],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `${b}x`, `${c}+${d}x`],
        equation: `${b}x=${c}+${d}x`,
        coeffs: [b, 0, d, c],
      },
    ],
    question: 'Pour quel nombre de séances les deux tarifs sont-ils égaux ?',
    reponseFinale: String(x),
    uniteReponse: 'séances',
    verification: `$${texPrix(b)}\\times ${x}=${texPrix(arrondi(b * x, 2))}$ et $${texPrix(c)}+${texPrix(d)}\\times ${x}=${texPrix(arrondi(c + d * x, 2))}$`,
  }
}

function spectacle(valeurEntiere: boolean): Probleme {
  let a: number // nombre de places de la salle
  let b: number // prix d'une place adulte
  let c: number // prix d'une place enfant
  let d: number // recette
  let x: number // nombre de places adultes
  do {
    a = randint(200, 300) * 10
    b = valeurEntiere ? randint(10, 20) : randint(100, 200) / 10
    c = valeurEntiere ? randint(5, 15) : randint(50, 150) / 10
    x = randint(1000, a - 500)
    d = arrondi(b * x + (a - x) * c, 2)
  } while (b <= c)
  return {
    enonce: `Dans une salle de spectacle de $${texNombre(a, 0)}$ places, le prix d'entrée est $${texPrix(b)}$ € pour un adulte et $${texPrix(c)}$ € pour un enfant.<br>
    Le spectacle de ce soir s'est déroulé devant une salle pleine et la recette est de $${texPrix(d)}$ €.`,
    objectif:
      "On cherche à déterminer le nombre d'adultes présents dans la salle.",
    figure: '',
    donnees: [
      'le nombre de places adultes vendues',
      'le nombre de places enfants vendues',
    ],
    distracteurs: [
      'le nombre total de places de la salle',
      'la recette du spectacle',
    ],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `${a}-x`],
        equation: `${b}x+${c}(${a}-x)=${d}`,
        coeffs: [arrondi(b - c, 2), arrondi(a * c, 2), 0, d],
      },
      {
        indice: 1,
        expressions: [`${a}-x`, 'x'],
        equation: `${b}(${a}-x)+${c}x=${d}`,
        coeffs: [arrondi(c - b, 2), arrondi(a * b, 2), 0, d],
      },
    ],
    question: "Combien d'adultes y avait-il dans la salle ?",
    reponseFinale: String(x),
    uniteReponse: 'adultes',
    verification: `$${texPrix(b)}\\times ${texNombre(x, 0)}+${texPrix(c)}\\times ${texNombre(a - x, 0)}=${texPrix(arrondi(b * x, 2))}+${texPrix(arrondi(c * (a - x), 2))}=${texPrix(d)}$`,
  }
}

function isocele(): Probleme {
  let cote: number // longueur d'un des côtés égaux
  let base: number
  let ecart: number // base - côté égal
  let perimetre: number
  do {
    cote = randint(50, 100)
    ecart = (1 - 2 * randint(0, 2)) * randint(10, 30)
    base = cote + ecart
    perimetre = 2 * cote + base
  } while (base <= 0 || 2 * cote <= base)
  const chercheLaBase = choice([true, false])
  return {
    enonce: `Un triangle isocèle a pour périmètre $${perimetre}\\text{ mm}$.<br>
    Sa base est plus ${ecart > 0 ? 'longue' : 'courte'} de $${Math.abs(ecart)}\\text{ mm}$ que chacun des côtés égaux.<br>
    (La figure n'est pas en vraie grandeur.)`,
    objectif: chercheLaBase
      ? 'On cherche à déterminer la longueur de la base du triangle.'
      : 'On cherche à déterminer la longueur des côtés égaux du triangle.',
    figure: ecart > 0 ? triangleIsocele2() : triangleIsocele1(),
    donnees: ['la longueur de la base', 'la longueur d’un des côtés égaux'],
    distracteurs: [
      'le périmètre du triangle',
      'la différence entre la base et un côté égal',
    ],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `x${terme(-ecart)}`],
        equation: `x+2(x${terme(-ecart)})=${perimetre}`,
        coeffs: [3, -2 * ecart, 0, perimetre],
      },
      {
        indice: 1,
        expressions: [`x${terme(ecart)}`, 'x'],
        equation: `x${terme(ecart)}+2x=${perimetre}`,
        coeffs: [3, ecart, 0, perimetre],
      },
    ],
    question: chercheLaBase
      ? 'Quelle est la mesure de la base, en mm ?'
      : 'Quelle est la mesure des côtés égaux, en mm ?',
    reponseFinale: String(chercheLaBase ? base : cote),
    uniteReponse: 'mm',
    verification: `$2\\times ${cote}+${base}=${2 * cote}+${base}=${perimetre}$`,
  }
}

function thales(): Probleme {
  let a: number // CD
  let b: number // AC
  let c: number // AB
  let quotient: number
  do {
    a = randint(5, 40)
    b = randint(5, 40)
    c = randint(41, 100)
    quotient = (a * b) / (c - a)
  } while (quotient <= 0 || (a * b) % Math.abs(c - a) !== 0)
  const x = Math.round(quotient) // OC
  return {
    enonce: `Sur la figure ci-dessous, qui n'est pas en vraie grandeur, $[CD]$ et $[AB]$ sont parallèles.<br>
    $AB=${c}\\text{ mm}$, $AC=${b}\\text{ mm}$ et $CD=${a}\\text{ mm}$.<br>
    Dans cette configuration de Thalès, $\\dfrac{OC}{OA}=\\dfrac{CD}{AB}$, ce qui donne l'égalité des produits en croix $CD\\times OA=OC\\times AB$.`,
    objectif: 'On cherche à déterminer la longueur $OC$.',
    figure: figureThales(a, b, c, ''),
    donnees: ['la longueur OC', 'la longueur OA'],
    distracteurs: ['la longueur AB', 'la longueur CD'],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `x+${b}`],
        equation: `${a}(x+${b})=${c}x`,
        coeffs: [a, a * b, c, 0],
      },
      {
        indice: 1,
        expressions: [`x-${b}`, 'x'],
        equation: `${a}x=${c}(x-${b})`,
        coeffs: [a, 0, c, -b * c],
      },
    ],
    question: 'Quelle est la longueur $OC$, en mm ?',
    reponseFinale: String(x),
    uniteReponse: 'mm',
    verification: `$CD\\times OA=${a}\\times ${b + x}=${a * (b + x)}$ et $OC\\times AB=${x}\\times ${c}=${c * x}$`,
  }
}

function thales2(): Probleme {
  let a: number // CD
  let c: number // AB
  let x: number // AC
  let quotient: number
  do {
    a = randint(5, 40)
    x = randint(5, 40)
    c = randint(41, 100)
    quotient = (a * x) / (c - a)
  } while (quotient <= 0 || (a * x) % Math.abs(c - a) !== 0)
  const b = Math.round(quotient) // OC
  return {
    enonce: `Sur la figure ci-dessous, qui n'est pas en vraie grandeur, $[CD]$ et $[AB]$ sont parallèles.<br>
    $AB=${c}\\text{ mm}$, $OC=${b}\\text{ mm}$ et $CD=${a}\\text{ mm}$.<br>
    Dans cette configuration de Thalès, $\\dfrac{OC}{OA}=\\dfrac{CD}{AB}$, ce qui donne l'égalité des produits en croix $CD\\times OA=OC\\times AB$.`,
    objectif: 'On cherche à déterminer la longueur $AC$.',
    figure: figureThales(a, '', c, b),
    donnees: ['la longueur AC', 'la longueur OA'],
    distracteurs: ['la longueur AB', 'la longueur OC'],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `x+${b}`],
        equation: `${a}(x+${b})=${b}\\times ${c}`,
        coeffs: [a, a * b, 0, b * c],
      },
      {
        indice: 1,
        expressions: [`x-${b}`, 'x'],
        equation: `${a}x=${b}\\times ${c}`,
        coeffs: [a, 0, 0, b * c],
      },
    ],
    question: 'Quelle est la longueur $AC$, en mm ?',
    reponseFinale: String(x),
    uniteReponse: 'mm',
    verification: `$CD\\times OA=${a}\\times ${x + b}=${a * (x + b)}$ et $OC\\times AB=${b}\\times ${c}=${b * c}$`,
  }
}

function sommeDeNombresConsecutifs(): Probleme {
  const milieu = randint(17, 27)
  const somme = 3 * milieu
  const nombres = [milieu - 1, milieu, milieu + 1]
  /** Expressions des trois nombres quand l'inconnue est celui de rang `rang`. */
  const expressionsDepuis = (rang: number) =>
    rangeMinMax(0, 2).map((n) => `x${terme(n - rang)}`)
  const equationDepuis = (rang: number) =>
    expressionsDepuis(rang)
      .map((expression) => (expression === 'x' ? 'x' : `(${expression})`))
      .join('+') + `=${somme}`
  return {
    enonce: `On considère une suite de $3$ nombres entiers consécutifs.<br>
    La somme de ces $3$ nombres est $${somme}$.`,
    objectif: 'On cherche à déterminer ces trois nombres entiers consécutifs.',
    figure: '',
    donnees: [
      'le plus petit des trois nombres',
      'le nombre du milieu de la suite',
      'le plus grand des trois nombres',
    ],
    distracteurs: [
      'la somme des trois nombres',
      'le nombre de termes de la suite',
    ],
    variantes: [
      {
        indice: 0,
        expressions: expressionsDepuis(0),
        equation: equationDepuis(0),
        coeffs: [3, 3, 0, somme],
      },
      {
        indice: 1,
        expressions: expressionsDepuis(1),
        equation: equationDepuis(1),
        coeffs: [3, 0, 0, somme],
      },
      {
        indice: 2,
        expressions: expressionsDepuis(2),
        equation: equationDepuis(2),
        coeffs: [3, -3, 0, somme],
      },
    ],
    question: 'Quels sont ces trois nombres consécutifs ?',
    reponseFinale: nombres.join(';'),
    uniteReponse: '(nombres séparés par des points-virgules)',
    optionsReponseFinale: { suiteDeNombres: true },
    verification: `$${nombres.join('+')}=${somme}$`,
  }
}

function ageDuPereEtDuFils(): Probleme {
  let n: number // nombre d'années à attendre
  let ageFils: number
  let agePere: number
  do {
    n = randint(2, 5)
    const ageFilsPlusTard = randint(20, 30)
    ageFils = ageFilsPlusTard - n
    agePere = 2 * ageFilsPlusTard - n
  } while (agePere < 20 || ageFils < 0)
  const ecart = agePere - ageFils
  return {
    enonce: `Un père a $${ecart}$ ans de plus que son fils.<br>
    Dans $${n}$ ans, l'âge du père sera le double de l'âge du fils.`,
    objectif:
      "On cherche à déterminer les âges du fils et du père aujourd'hui.",
    figure: '',
    donnees: ["l'âge du fils aujourd'hui", "l'âge du père aujourd'hui"],
    distracteurs: [
      "la différence d'âge entre le père et le fils",
      "le nombre d'années à attendre",
    ],
    variantes: [
      {
        indice: 0,
        expressions: ['x', `x+${ecart}`],
        equation: `x+${ecart}+${n}=2(x+${n})`,
        coeffs: [1, ecart + n, 2, 2 * n],
      },
      {
        indice: 1,
        expressions: [`x-${ecart}`, 'x'],
        equation: `x+${n}=2(x-${ecart}+${n})`,
        coeffs: [1, n, 2, 2 * (n - ecart)],
      },
    ],
    question: "Quels sont les âges respectifs du fils et du père aujourd'hui ?",
    reponseFinale: `${ageFils};${agePere}`,
    uniteReponse: '(âge du fils puis âge du père)',
    optionsReponseFinale: { suiteDeNombres: true },
    verification: `Dans $${n}$ ans, le fils aura $${ageFils + n}$ ans et le père $${agePere + n}$ ans, or $2\\times ${ageFils + n}=${agePere + n}$.`,
  }
}

/** Les problèmes proposés, dans l'ordre du formulaire de paramétrage. */
const catalogue: ((valeurEntiere: boolean) => Probleme)[] = [
  () => basket(),
  () => basket2(),
  (valeurEntiere) => achats(valeurEntiere),
  (valeurEntiere) => polyg(valeurEntiere),
  () => programme1(true),
  () => programme1(false),
  (valeurEntiere) => tarifs(valeurEntiere),
  (valeurEntiere) => spectacle(valeurEntiere),
  () => isocele(),
  () => thales(),
  () => thales2(),
  () => sommeDeNombresConsecutifs(),
  () => ageDuPereEtDuFils(),
  () => programme2(),
]

/* -------------------------------------------------------------------------- */
/*                                  L'exercice                                */
/* -------------------------------------------------------------------------- */

/** Rang du champ de l'équation, de la solution et de la réponse finale. */
const CHAMP_EQUATION = 6
const CHAMP_SOLUTION = 7
const CHAMP_REPONSE = 8

export default class ProblemesEnEquationParEtapes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.spacingCorr = 1.5
    this.consigne = ''
    this.besoinFormulaireNumerique = [
      'Choix du problème',
      15,
      [
        'Paniers de basket (paniers à trois points)',
        'Paniers de basket (paniers à deux points)',
        'Achat au marché',
        "Périmètre d'un polygone",
        'Programmes de calcul (deux produits, solution positive)',
        'Programmes de calcul (deux produits, solution négative)',
        "Tarifs d'un club",
        'Places de spectacle',
        'Triangle isocèle',
        'Théorème de Thalès (longueur OC)',
        'Théorème de Thalès (longueur AC)',
        'Somme de trois nombres consécutifs',
        'Âges du père et du fils',
        'Programmes de calcul (un produit et une somme)',
        'Hasard',
      ].join('\n'),
    ]
    this.sup = 15
    this.besoinFormulaire2CaseACocher = ['Uniquement des nombres entiers', true]
    this.sup2 = true
  }

  nouvelleVersion() {
    const indiceTypeProbleme = this.sup === 15 ? randint(1, 14) : this.sup
    const probleme = catalogue[indiceTypeProbleme - 1](Boolean(this.sup2))
    const { texte, texteCorr } = this.construitQuestion(probleme, 0)
    this.listeQuestions[0] = texte
    this.listeCorrections[0] = texteCorr
    listeQuestionsToContenu(this)
  }

  /**
   * Construit l'énoncé (avec le multi-mathfield des cinq étapes) et la
   * correction (une résolution complète par choix d'inconnue possible).
   */
  private construitQuestion(probleme: Probleme, i: number) {
    const nbDonnees = probleme.donnees.length
    // Le premier choix n'est pas sélectionnable : il sert d'invite.
    const choix: AllChoicesType = [
      { label: 'Choisir…', value: '' },
      ...shuffle([
        ...probleme.donnees.map((donnee, rang) => ({
          label: donnee,
          value: `d${rang}`,
        })),
        ...probleme.distracteurs.map((donnee, rang) => ({
          label: donnee,
          value: `k${rang}`,
        })),
      ]),
    ]

    /** La variante correspondant au choix courant de l'élève, s'il est valable. */
    const varianteChoisie = (): Variante | undefined => {
      const multi = document.getElementById(
        `multi-mathfieldEx${this.numeroExercice}Q${i}`,
      )
      const liste = multi?.shadowRoot?.querySelector(
        'liste-deroulante[data-name="field0"]',
      ) as { value?: string } | null
      return probleme.variantes.find(
        (variante) => `d${variante.indice}` === liste?.value,
      )
    }

    /**
     * Compare la saisie à la réponse de la variante choisie à l'étape a).
     * Tant qu'aucune inconnue valable n'est choisie, toutes les variantes sont
     * acceptées : l'élève n'est pénalisé qu'une fois, à l'étape a).
     */
    const comparaisonSelonInconnue =
      (
        attenduePour: (variante: Variante) => string,
        options: OptionsComparaisonType,
      ): CompareFunction =>
      (saisie: string): ResultType => {
        const variante = varianteChoisie()
        const candidates = variante ? [variante] : probleme.variantes
        for (const candidate of candidates) {
          const resultat = fonctionComparaison(
            saisie,
            attenduePour(candidate),
            options,
          )
          if (resultat.isOk) return resultat
        }
        return { isOk: false, feedback: '' }
      }

    const varianteParDefaut = probleme.variantes[0]
    const clavierExpression = KeyboardType.clavierDeBaseAvecX
    const clavierEquation = KeyboardType.clavierDeBaseAvecXEtEgal

    const lignesEtapeB = probleme.donnees
      .map((donnee, rang) => `${donnee} : %{field${rang + 1}}`)
      .join('\n\n')
    const dataTemplate = `a) Quelle grandeur choisir comme inconnue ? %{field0}

b) On note $x$ cette inconnue. Exprimer chaque grandeur en fonction de $x$ :

${lignesEtapeB}

c) Écrire l'équation traduisant l'énoncé : %{field${CHAMP_EQUATION}}

d) Résoudre cette équation : $x=$ %{field${CHAMP_SOLUTION}}

e) ${probleme.question} %{field${CHAMP_REPONSE}}`

    const dataOptions: DataOptionsMultiMathfield = {
      field0: { choices: choix, ldots: true },
      [`field${CHAMP_EQUATION}`]: {
        keyboard: clavierEquation,
        minWidth: 220,
        ldots: true,
      },
      [`field${CHAMP_SOLUTION}`]: {
        keyboard: KeyboardType.clavierDeBase,
        minWidth: 80,
        ldots: true,
      },
      [`field${CHAMP_REPONSE}`]: {
        keyboard: KeyboardType.clavierDeBase,
        minWidth: 80,
        texteApres: probleme.uniteReponse,
        ldots: true,
      },
    }
    for (let rang = 1; rang <= nbDonnees; rang++) {
      dataOptions[`field${rang}` as 'field1'] = {
        keyboard: clavierExpression,
        minWidth: 120,
        ldots: true,
      }
    }

    const texte =
      probleme.enonce +
      probleme.figure +
      `<br>${probleme.objectif}<br><br>` +
      addMultiMathfield(this, i, { dataTemplate, dataOptions })

    /**
     * Chaque étape rapporte un point, quel que soit le problème tiré :
     * l'étape b) n'en rapporte qu'un seul, même si elle a plusieurs champs.
     */
    const bareme = (points: number[]): [number, number] => {
      const pointsEtapeB = points.slice(1, 1 + nbDonnees)
      const total =
        (points[0] ?? 0) +
        (pointsEtapeB.length > 0 ? Math.min(...pointsEtapeB) : 0) +
        (points[1 + nbDonnees] ?? 0) +
        (points[2 + nbDonnees] ?? 0) +
        (points[3 + nbDonnees] ?? 0)
      return [total, 5]
    }

    const reponses: Valeur = { bareme }
    reponses.field0 = {
      value: probleme.variantes.map((variante) => `d${variante.indice}`),
    }
    for (let rang = 1; rang <= nbDonnees; rang++) {
      reponses[`field${rang}` as 'field1'] = {
        value: varianteParDefaut.expressions[rang - 1],
        compare: comparaisonSelonInconnue(
          (variante) => variante.expressions[rang - 1],
          { calculFormel: true },
        ),
        options: { calculFormel: true },
      } satisfies AnswerType
    }
    reponses[`field${CHAMP_EQUATION}` as 'field6'] = {
      value: varianteParDefaut.equation,
      compare: comparaisonSelonInconnue((variante) => variante.equation, {
        egaliteExpression: true,
      }),
      options: { egaliteExpression: true },
    }
    reponses[`field${CHAMP_SOLUTION}` as 'field7'] = {
      value: String(solutionDe(varianteParDefaut.coeffs)),
      compare: comparaisonSelonInconnue(
        (variante) => String(solutionDe(variante.coeffs)),
        { nombreDecimalSeulement: true },
      ),
      options: { nombreDecimalSeulement: true },
    }
    reponses[`field${CHAMP_REPONSE}` as 'field8'] = {
      value: probleme.reponseFinale,
      options: probleme.optionsReponseFinale ?? {
        nombreDecimalSeulement: true,
      },
    }

    handleAnswers(this, i, reponses, { formatInteractif: 'multi-mathfield' })

    const reponseAffichee = enFrancais(
      probleme.reponseFinale.replaceAll(';', ' \\, ; \\, '),
    )
    let texteCorr = `${texteEnCouleurEtGras("Choix de l'inconnue", 'black')}<br>
    Une grandeur déjà connue par l'énoncé ne peut pas servir d'inconnue. Ici, ${
      probleme.variantes.length > 1
        ? `$${probleme.variantes.length}$ choix sont possibles et conduisent chacun à une équation différente.`
        : "une seule grandeur peut servir d'inconnue."
    }<br><br>`
    texteCorr += probleme.variantes
      .map((variante) => corrigeVariante(probleme, variante))
      .join('<br>')
    texteCorr += `${texteEnCouleurEtGras('Vérification :', 'black')}<br>${probleme.verification}<br><br>`
    texteCorr += `${texteEnCouleurEtGras('Réponse à la question posée :', 'black')}<br>${probleme.question} $${miseEnEvidence(reponseAffichee)}$ ${probleme.uniteReponse}`

    return { texte, texteCorr }
  }
}
