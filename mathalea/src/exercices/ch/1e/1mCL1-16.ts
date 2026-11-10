import { ComputeEngine } from '@cortex-js/compute-engine'
import {
  lireFormulaireComplexe,
  repartitionPonderee,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { sameUpToIntegerShift, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { premiereLettreEnMajuscule } from '../../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Traduire une phrase sur des nombres entiers par une expression littérale'
export const dateDePublication = '03/11/2026'
export const uuid = 'e5cd3'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['1mCL1-16'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Nombres en jeu',
      items: [
        {
          nom: 'un',
          label: 'Un nombre (entier, pair, impair)',
        },
        { nom: 'multiples', label: 'Multiples' },
        {
          nom: 'deux',
          label: 'Deux nombres quelconques (entiers, pairs, impairs)',
        },
        { nom: 'consecutifs2', label: 'Deux nombres consécutifs' },
        { nom: 'consecutifs3', label: 'Trois nombres consécutifs' },
      ],
    },
    {
      type: 'selection',
      nom: 'notation',
      label: 'Nombres consécutifs',
      options: [
        { valeur: 'libre', label: 'Notation libre' },
        {
          valeur: 'imposee',
          label: "Notation imposée par l'énoncé (« le plus petit noté n »)",
        },
        { valeur: 'melange', label: 'Mélange' },
      ],
      defaut: 'melange',
    },
    {
      type: 'selection',
      nom: 'operations',
      label: "Nombre d'opérations dans la phrase",
      options: [
        { valeur: '1', label: 'Une (« le carré d’un nombre pair »)' },
        { valeur: '2', label: 'Deux (« la somme des carrés de… »)' },
        {
          valeur: '3',
          label: 'Trois ou plus (« le double de la somme des carrés de… »)',
        },
        { valeur: 'melange', label: 'Mélange' },
      ],
      defaut: 'melange',
    },
    {
      type: 'selection',
      nom: 'multiple',
      label: 'Multiples de',
      options: [
        { valeur: '2', label: '2' },
        { valeur: '3', label: '3' },
        { valeur: '4', label: '4' },
        { valeur: '5', label: '5' },
        { valeur: 'hasard', label: 'Au hasard entre 2 et 5' },
      ],
      defaut: 'hasard',
    },
    {
      type: 'selection',
      nom: 'lettres',
      label: 'Lettres',
      options: [
        { valeur: 'nm', label: 'n et m' },
        { valeur: 'xy', label: 'x et y' },
      ],
      defaut: 'nm',
    },
  ],
}

/** Terme affine $av+b$ d'une lettre $v$. */
type Terme = { a: number; b: number; v: string }

const texTerme = ({ a, b, v }: Terme) =>
  `${a === 1 ? '' : a}${v}${b === 0 ? '' : ecritureAlgebrique(b)}`

/** Vrai si l'écriture est une somme ou une différence (au premier niveau). */
function estSomme(tex: string): boolean {
  let profondeur = 0
  for (let k = 0; k < tex.length; k++) {
    const c = tex[k]
    if (c === '(' || c === '{') profondeur++
    else if (c === ')' || c === '}') profondeur--
    else if (profondeur === 0 && k > 0 && (c === '+' || c === '-')) return true
  }
  return false
}

const entreParentheses = (tex: string) => (estSomme(tex) ? `(${tex})` : tex)

const puissance = (tex: string, k: number) =>
  /^[a-z]$/.test(tex) ? `${tex}^{${k}}` : `(${tex})^{${k}}`

function fois(k: number, tex: string): string {
  if (estSomme(tex)) return `${k}(${tex})`
  return /^[a-z(]/.test(tex) ? `${k}${tex}` : `${k}\\times ${tex}`
}

const somme = (texs: string[]) => texs.map(entreParentheses).join('+')

function produit(texs: string[]): string {
  return texs
    .map(entreParentheses)
    .map((tex, k) => (k > 0 && /^\d/.test(tex) ? `\\times ${tex}` : tex))
    .join('')
}

/** Opération appliquée aux nombres : phrase « … de X » et expression. */
type Operation = {
  /** a : constante tirée pour « la somme de $a$ et du carré de… » */
  phrase: (deX: string, a: number) => string
  expression: (termes: string[], a: number) => string
}

const operations: Record<string, Operation> = {
  carre: {
    phrase: (x) => `le carré ${x}`,
    expression: ([t]) => puissance(t, 2),
  },
  cube: {
    phrase: (x) => `le cube ${x}`,
    expression: ([t]) => puissance(t, 3),
  },
  double: {
    phrase: (x) => `le double ${x}`,
    expression: ([t]) => fois(2, t),
  },
  triple: {
    phrase: (x) => `le triple ${x}`,
    expression: ([t]) => fois(3, t),
  },
  carrePlusA: {
    phrase: (x, a) => `le carré de la somme ${x} et de $${a}$`,
    expression: ([t], a) => puissance(`${t}+${a}`, 2),
  },
  aPlusCarre: {
    phrase: (x, a) => `la somme de $${a}$ et du carré ${x}`,
    expression: ([t], a) => `${a}+${puissance(t, 2)}`,
  },
  doubleCarre: {
    phrase: (x) => `le double du carré ${x}`,
    expression: ([t]) => fois(2, puissance(t, 2)),
  },
  carreDouble: {
    phrase: (x) => `le carré du double ${x}`,
    expression: ([t]) => puissance(fois(2, t), 2),
  },
  moitie: {
    phrase: (x) => `la moitié ${x}`,
    expression: ([t]) => `\\dfrac{${t}}{2}`,
  },
  carreMoinsA: {
    phrase: (x, a) => `la différence entre le carré ${x} et $${a}$`,
    expression: ([t], a) => `${puissance(t, 2)}-${a}`,
  },
  somme: {
    phrase: (x) => `la somme ${x}`,
    expression: (t) => somme(t),
  },
  produit: {
    phrase: (x) => `le produit ${x}`,
    expression: (t) => produit(t),
  },
  sommeCarres: {
    phrase: (x) => `la somme des carrés ${x}`,
    expression: (t) => t.map((s) => puissance(s, 2)).join('+'),
  },
  sommeCubes: {
    phrase: (x) => `la somme des cubes ${x}`,
    expression: (t) => t.map((s) => puissance(s, 3)).join('+'),
  },
  carreSomme: {
    phrase: (x) => `le carré de la somme ${x}`,
    expression: (t) => puissance(somme(t), 2),
  },
  tripleSomme: {
    phrase: (x) => `le triple de la somme ${x}`,
    expression: (t) => fois(3, somme(t)),
  },
  aPlusProduit: {
    phrase: (x, a) => `la somme de $${a}$ et du produit ${x}`,
    expression: (t, a) => `${a}+${produit(t)}`,
  },
  carreDoublePlusA: {
    phrase: (x, a) => `le carré de la somme du double ${x} et de $${a}$`,
    expression: ([t], a) => puissance(`${fois(2, t)}+${a}`, 2),
  },
  doubleCarrePlusA: {
    phrase: (x, a) => `le double du carré de la somme ${x} et de $${a}$`,
    expression: ([t], a) => fois(2, puissance(`${t}+${a}`, 2)),
  },
  aPlusCarreDouble: {
    phrase: (x, a) => `la somme de $${a}$ et du carré du double ${x}`,
    expression: ([t], a) => `${a}+${puissance(fois(2, t), 2)}`,
  },
  doubleSommeCarres: {
    phrase: (x) => `le double de la somme des carrés ${x}`,
    expression: (t) => fois(2, t.map((s) => puissance(s, 2)).join('+')),
  },
  carreSommeMoinsSommeCarres: {
    phrase: (x) =>
      `la différence entre le carré de la somme et la somme des carrés ${x}`,
    expression: (t) =>
      `${puissance(somme(t), 2)}-(${t.map((s) => puissance(s, 2)).join('+')})`,
  },
  differenceCarres: {
    phrase: (x) =>
      `la différence entre le carré du plus grand et le carré du plus petit ${x}`,
    expression: ([t1, t2]) => `${puissance(t2, 2)}-${puissance(t1, 2)}`,
  },
}

/** Notation imposée par l'énoncé : « le plus petit étant noté $n$ ». */
type Imposee = {
  /** « le plus petit », « celui du milieu »… */
  role: string
  termes: (n: string) => Terme[]
  /** Indice du terme nommé dans l'énoncé */
  nomme: number
}

type Objet = {
  /** Groupe nominal : « trois entiers consécutifs » */
  gn: string
  /** « entiers » ou « nombres », pour la phrase de la correction */
  nom: string
  /** k : facteur tiré pour « un multiple de $K$ » */
  termes: (n: string, m: string, k: number) => Terme[]
  /** Autre notation acceptée, citée dans la correction */
  autre?: (n: string, k: number) => Terme[]
  /** Nombres consécutifs : le $n$ de l'élève doit désigner l'un d'eux */
  consecutifs?: boolean
  /** Notations imposables par l'énoncé (seulement si elles ne dévoilent pas la réponse, donc pas « noté $2n$ ») */
  imposees?: Imposee[]
  /** Opérations possibles, rangées par nombre d'opérations dans la phrase : une, deux, trois ou plus */
  operations: [string[], string[], string[]]
}

const t = (a: number, v: string, b = 0): Terme => ({ a, b, v })

const objetsUn: Objet[] = [
  {
    gn: 'un entier',
    nom: 'entier',
    termes: (n) => [t(1, n)],
    operations: [
      ['carre', 'cube', 'double'],
      ['carrePlusA', 'aPlusCarre', 'doubleCarre', 'carreDouble'],
      ['carreDoublePlusA', 'doubleCarrePlusA', 'aPlusCarreDouble'],
    ],
  },
  {
    gn: 'un nombre pair',
    nom: 'nombre',
    termes: (n) => [t(2, n)],
    operations: [
      ['carre', 'cube', 'triple', 'moitie'],
      ['carrePlusA', 'aPlusCarre', 'doubleCarre'],
      ['doubleCarrePlusA', 'aPlusCarreDouble'],
    ],
  },
  {
    gn: 'un nombre impair',
    nom: 'nombre',
    termes: (n) => [t(2, n, 1)],
    autre: (n) => [t(2, n, -1)],
    operations: [
      ['carre', 'cube', 'double'],
      ['carreMoinsA', 'aPlusCarre', 'doubleCarre', 'carrePlusA'],
      ['doubleCarrePlusA', 'carreDoublePlusA'],
    ],
  },
]

const objetsMultiples: Objet[] = [
  {
    gn: 'un multiple de $K$',
    nom: 'nombre',
    termes: (n, m, k) => [t(k, n)],
    operations: [
      ['carre', 'cube', 'double', 'triple'],
      ['aPlusCarre', 'doubleCarre', 'carrePlusA'],
      ['aPlusCarreDouble', 'doubleCarrePlusA'],
    ],
  },
  {
    gn: 'deux multiples de $K$',
    nom: 'nombres',
    termes: (n, m, k) => [t(k, n), t(k, m)],
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'carreSomme', 'aPlusProduit'],
      ['doubleSommeCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
  {
    gn: 'deux multiples consécutifs de $K$',
    nom: 'nombres',
    termes: (n, m, k) => [t(k, n), t(k, n, k)],
    autre: (n, k) => [t(k, n, -k), t(k, n)],
    consecutifs: true,
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'carreSomme'],
      ['differenceCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
]

const objetsDeux: Objet[] = [
  {
    gn: 'deux entiers',
    nom: 'entiers',
    termes: (n, m) => [t(1, n), t(1, m)],
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'carreSomme', 'sommeCubes', 'aPlusProduit'],
      ['doubleSommeCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
  {
    gn: 'deux nombres pairs',
    nom: 'nombres',
    termes: (n, m) => [t(2, n), t(2, m)],
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'carreSomme', 'aPlusProduit'],
      ['doubleSommeCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
  {
    gn: 'deux nombres impairs',
    nom: 'nombres',
    termes: (n, m) => [t(2, n, 1), t(2, m, 1)],
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'carreSomme', 'aPlusProduit'],
      ['doubleSommeCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
  {
    gn: 'un nombre pair et un nombre impair',
    nom: 'nombres',
    termes: (n, m) => [t(2, n), t(2, m, 1)],
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'carreSomme', 'aPlusProduit'],
      ['doubleSommeCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
]

const objetsConsecutifs2: Objet[] = [
  {
    gn: 'deux entiers consécutifs',
    nom: 'entiers',
    termes: (n) => [t(1, n), t(1, n, 1)],
    autre: (n) => [t(1, n, -1), t(1, n)],
    consecutifs: true,
    imposees: [
      { role: 'le plus petit', termes: (n) => [t(1, n), t(1, n, 1)], nomme: 0 },
      {
        role: 'le plus grand',
        termes: (n) => [t(1, n, -1), t(1, n)],
        nomme: 1,
      },
    ],
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'carreSomme', 'aPlusProduit'],
      ['differenceCarres', 'carreSommeMoinsSommeCarres', 'doubleSommeCarres'],
    ],
  },
  {
    gn: 'deux nombres pairs consécutifs',
    nom: 'nombres',
    termes: (n) => [t(2, n), t(2, n, 2)],
    autre: (n) => [t(2, n, -2), t(2, n)],
    consecutifs: true,
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'carreSomme'],
      ['differenceCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
  {
    gn: 'deux nombres impairs consécutifs',
    nom: 'nombres',
    termes: (n) => [t(2, n, 1), t(2, n, 3)],
    autre: (n) => [t(2, n, -1), t(2, n, 1)],
    consecutifs: true,
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'sommeCubes'],
      ['differenceCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
]

const objetsConsecutifs3: Objet[] = [
  {
    gn: 'trois entiers consécutifs',
    nom: 'entiers',
    termes: (n) => [t(1, n), t(1, n, 1), t(1, n, 2)],
    autre: (n) => [t(1, n, -1), t(1, n), t(1, n, 1)],
    consecutifs: true,
    imposees: [
      {
        role: 'le plus petit',
        termes: (n) => [t(1, n), t(1, n, 1), t(1, n, 2)],
        nomme: 0,
      },
      {
        role: 'celui du milieu',
        termes: (n) => [t(1, n, -1), t(1, n), t(1, n, 1)],
        nomme: 1,
      },
      {
        role: 'le plus grand',
        termes: (n) => [t(1, n, -2), t(1, n, -1), t(1, n)],
        nomme: 2,
      },
    ],
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'tripleSomme', 'carreSomme', 'aPlusProduit'],
      ['doubleSommeCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
  {
    gn: 'trois nombres pairs consécutifs',
    nom: 'nombres',
    termes: (n) => [t(2, n), t(2, n, 2), t(2, n, 4)],
    autre: (n) => [t(2, n, -2), t(2, n), t(2, n, 2)],
    consecutifs: true,
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'tripleSomme'],
      ['doubleSommeCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
  {
    gn: 'trois nombres impairs consécutifs',
    nom: 'nombres',
    termes: (n) => [t(2, n, 1), t(2, n, 3), t(2, n, 5)],
    autre: (n) => [t(2, n, -1), t(2, n, 1), t(2, n, 3)],
    consecutifs: true,
    operations: [
      ['somme', 'produit'],
      ['sommeCarres', 'tripleSomme'],
      ['doubleSommeCarres', 'carreSommeMoinsSommeCarres'],
    ],
  },
]

const objetsParFamille: Record<string, Objet[]> = {
  multiples: objetsMultiples,
  un: objetsUn,
  deux: objetsDeux,
  consecutifs2: objetsConsecutifs2,
  consecutifs3: objetsConsecutifs3,
}

/** « $n$, $n+1$ et $n+2$ » */
function enumeration(texs: string[]): string {
  const maths = texs.map((tex) => `$${tex}$`)
  return maths.length === 1
    ? maths[0]
    : `${maths.slice(0, -1).join(', ')} et ${maths[maths.length - 1]}`
}

const de = (gn: string) =>
  (/^un/.test(gn) ? `d'${gn}` : `de ${gn}`).replace(' et un ', " et d'un ")

const ce = new ComputeEngine()

/**
 * Distribue les puissances sur les produits : $(2n)^2$ devient $2^2n^2$.
 * Le moteur ne développe pas lui-même la puissance d'un monôme.
 */
function puissanceDUnProduit(json: unknown): unknown {
  if (!Array.isArray(json)) return json
  const [tete, ...args] = json
  const enfants = args.map(puissanceDUnProduit)
  if (
    tete === 'Power' &&
    Array.isArray(enfants[0]) &&
    enfants[0][0] === 'Multiply'
  ) {
    const [, ...facteurs] = enfants[0]
    return ['Multiply', ...facteurs.map((f) => ['Power', f, enfants[1]])]
  }
  return [tete, ...enfants]
}

/**
 * Forme développée et réduite, pour la correction. Les lettres sont renommées
 * a et b le temps du calcul : le moteur range les termes par ordre alphabétique,
 * et les termes en n doivent venir avant ceux en m.
 */
function formeReduite(tex: string, lettres: string[]): string {
  try {
    const versAb = Object.fromEntries(
      lettres.map((lettre, k) => [lettre, ce.symbol(k === 0 ? 'a' : 'b')]),
    )
    const parse = ce.parse(tex.replaceAll('\\dfrac', '\\frac')).subs(versAb)
    // Expand ne développe qu'un niveau à la fois : on répète jusqu'à stabilité.
    let developpee = ce.box(
      puissanceDUnProduit(parse.json) as typeof parse.json,
    )
    for (let k = 0; k < 4; k++) {
      const suivante = ce.box(['Expand', developpee]).evaluate()
      if (suivante.isSame(developpee)) break
      developpee = ce.box(
        puissanceDUnProduit(suivante.json) as typeof parse.json,
      )
    }
    const latex = developpee.latex
    if (latex.includes('\\')) return ''
    return latex
      .replaceAll('ab', [...lettres].sort().join(''))
      .replaceAll('a', lettres[0])
      .replaceAll('b', lettres[1] ?? 'b')
  } catch {
    return ''
  }
}

/**
 * Traduire en expression littérale des phrases sur des nombres entiers : nombres pairs,
 * impairs, multiples, entiers consécutifs, avec somme, produit, carrés, cubes…
 * Toute expression égale à la réponse attendue, réduite ou non, est acceptée, ainsi que
 * les autres notations des mêmes nombres ($2n-1$ pour un impair, $n-1$, $n$, $n+1$ pour
 * trois consécutifs), sauf si l'énoncé impose la notation.
 * @author Nathan Scheinmann
 */
export default class TraduirePhraseEntiers extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.spacingCorr = 2
    this.consigne =
      'Traduire chaque phrase par une expression littérale. Les lettres désignent des nombres entiers.'
    this.comment =
      "En mode interactif, toute expression égale à la réponse attendue est acceptée, réduite ou non. Les autres notations des mêmes nombres sont aussi acceptées : $2n-1$ pour un nombre impair, $n-1$, $n$ et $n+1$ pour trois entiers consécutifs, lettres échangées pour un nombre pair et un nombre impair. Pour des nombres consécutifs, $n$ doit désigner l'un d'eux : $n+(n+2)+(n+4)$ est refusé pour la somme de trois entiers consécutifs, bien qu'égal à $(n+1)+(n+2)+(n+3)$.<br>Pour « un entier » et « deux entiers », l'énoncé nomme les nombres (« On note $n$ l'entier ») : $(n-12)^2$ est refusé pour le carré de l'entier. Pour des entiers consécutifs, le réglage de notation peut aussi imposer la notation (« le plus petit étant noté $n$ ») : seule cette notation est alors acceptée. Pour les nombres pairs, impairs ou multiples, l'énoncé ne nomme pas les nombres : « le pair étant noté $2n$ » donnerait la réponse.<br>La correction donne aussi la forme réduite, et une autre notation possible des nombres consécutifs."
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const familles = repartitionPonderee(
      shuffle(params.liste('familles')),
      this.nbQuestions,
      shuffle(params.declares('familles')),
    )
    const notation = params.selection('notation')
    const nbOperations = params.selection('operations')
    const choixMultiple = params.selection('multiple')
    const [n, m] =
      params.selection('lettres') === 'xy' ? ['x', 'y'] : ['n', 'm']

    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const objet = choice(objetsParFamille[familles[i]])
      const niveau =
        nbOperations === 'melange' ? randint(1, 3) : Number(nbOperations)
      const nomOperation = choice(objet.operations[niveau - 1])
      const operation = operations[nomOperation]
      const imposee =
        objet.imposees != null &&
        (notation === 'imposee' ||
          (notation === 'melange' && randint(0, 1) === 1))
          ? choice(objet.imposees)
          : undefined
      const k = !objet.gn.includes('K')
        ? 0
        : choixMultiple === 'hasard'
          ? randint(2, 5)
          : Number(choixMultiple)
      const gn = objet.gn.replace('K', String(k))
      // Peu de phrases possibles avec certains réglages : on accepte une répétition en dernier recours.
      if (
        !this.questionJamaisPosee(i, gn, nomOperation, imposee?.role ?? '') &&
        essais < 40
      )
        continue

      const termesAffines = imposee?.termes(n) ?? objet.termes(n, m, k)
      const termes = termesAffines.map(texTerme)
      const a = randint(1, 9)
      const reponse = operation.expression(termes, a)
      const deuxLettres = termesAffines.some((terme) => terme.v === m)
      const lettres = deuxLettres ? [n, m] : [n]
      const phrase = operation.phrase(de(gn), a)

      // « un entier », « deux entiers » : l'énoncé nomme les nombres, sans dévoiler la réponse.
      const nommes = !imposee && termes.every((tex) => /^[a-z]$/.test(tex))
      let texte = premiereLettreEnMajuscule(phrase)
      if (imposee) {
        texte += `, ${imposee.role} étant noté $${termes[imposee.nomme]}$.`
      } else if (nommes) {
        texte +=
          termes.length > 1
            ? `.<br>On note $${n}$ et $${m}$ les deux entiers.`
            : `.<br>On note $${n}$ l'entier.`
      } else {
        texte += deuxLettres
          ? `.<br>Utiliser les lettres $${n}$ et $${m}$.`
          : `.<br>Utiliser la lettre $${n}$.`
      }

      let correction = ''
      if (imposee) {
        const role = premiereLettreEnMajuscule(imposee.role)
        correction = `${role} est $${termes[imposee.nomme]}$, donc les ${gn.split(' ')[0]} ${objet.nom} sont ${enumeration(termes)}.<br>`
      } else if (!nommes) {
        const accord = termes.length > 1 ? 'vent' : 't'
        const entiers = deuxLettres
          ? `$${n}$ et $${m}$ entiers`
          : `$${n}$ entier`
        correction = `${premiereLettreEnMajuscule(gn)} s'écri${accord} ${enumeration(termes)}, avec ${entiers}.`
        if (deuxLettres) {
          correction +=
            '<br>On utilise deux lettres différentes, car les deux nombres sont choisis indépendamment.'
        }
        correction += '<br>'
      }
      correction += `${correction === '' ? premiereLettreEnMajuscule(phrase) : `Donc ${phrase}`} s'écrit $${miseEnEvidence(reponse)}$.`
      // Forme réduite donnée seulement s'il reste un calcul à faire (2n^2, nm sont déjà réduits).
      const reduite = /[(\\]/.test(reponse)
        ? formeReduite(reponse, lettres)
        : ''
      if (reduite !== '') {
        correction += `<br>Sous forme réduite : $${reduite}$.`
      }
      if (!imposee && objet.autre) {
        const autres = objet.autre(n, k).map(texTerme)
        const nombres = termes.length > 1 ? `ces ${objet.nom}` : 'ce nombre'
        correction += `<br>On peut aussi noter ${nombres} ${enumeration(autres)} : l'expression $${operation.expression(autres, a)}$ convient aussi.`
      }

      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          compare: seq([
            sameUpToIntegerShift({
              variables: lettres,
              fixed: imposee ? [n] : nommes ? lettres : [],
              // Nombres consécutifs : n désigne l'un d'eux (le plus petit, celui du milieu…).
              // Sans cette limite, n+(n+2)+(n+4) = (n+1)+(n+2)+(n+3) serait accepté.
              ...(objet.consecutifs
                ? { shifts: [0, termes.length - 1], allowNegation: false }
                : {}),
            }),
          ]),
        },
      })
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecVariable,
          { texteAvant: '<br>', dataKeys: [...lettres, 'POW'] },
        )
      }
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
