import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { matriceCompare } from '../../lib/interactif/comparaisonMatrices'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { matrice } from '../../lib/mathFonctions/Matrice'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { prenom } from '../../lib/outils/Personne'
import {
  texMembreGauche,
  texSystemeEquations,
} from '../../lib/outils/systemeEquations'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import type { IExercice } from '../../lib/types'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import Exercice from '../Exercice'

export const titre = 'Résoudre un problème avec des matrices'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '08/10/2026'

/**
 * Traduire une situation concrète par un système AX=B (prix ou points
 * inconnus, fonction affine ou du second degré passant par des points connus),
 * puis le résoudre à l'aide de la calculatrice et conclure.
 *
 * @author Arnaud Meistermann
 */
export const uuid = 'a7896'

export const refs = {
  'fr-fr': ['TEM1-25'],
  'fr-ch': [],
}

/**
 * Valeurs unitaires (prix, points, coefficients) en centièmes, pour calculer de
 * manière exacte. `quantites` remplace, pour cet objet, l'intervalle du contexte.
 * Un objet `toujours` figure dans toutes les questions de son contexte.
 */
type Objet = {
  nom: string
  pluriel: string
  un: string
  valeurs: number[]
  quantites?: [number, number]
  toujours?: boolean
}

/** Une ligne du tableau : `nom` sert à indiquer l'ordre, `sujet` dans les phrases. */
type Ligne = { nom: string; sujet: string }

/**
 * Situation où l'on connaît, pour plusieurs lignes (personnes, équipes,
 * recettes), les quantités de chaque objet et un total, mais pas les valeurs
 * unitaires des objets.
 */
type ContexteProbleme = {
  id: string
  objets: Objet[]
  lignes: (n: number) => Ligne[]
  quantites: [number, number]
  systeme: {
    intro: string
    donnee: (l: Ligne, q: number[], objets: Objet[], t: number) => string
    inconnues: (objets: Objet[]) => string
    traduction: string
    /** Question c), sur le premier objet. */
    question: (objet: Objet) => string
    /** Réponse à la question c), valeur unitaire en centièmes mise en évidence. */
    reponse: (objet: Objet, valeur: number) => string
    /** Texte avant et après le champ de la question c), en interactif. */
    phrase: (objet: Objet) => [string, string]
  }
}

const variables = ['x', 'y', 'z']

function texPmatrix(table: string[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

/** Matrice à coefficients décimaux, écrits à la française. */
function texMatrice(table: number[][]): string {
  return texPmatrix(table.map((ligne) => ligne.map((x) => texNombre(x))))
}

function colonne(valeurs: number[]): number[][] {
  return valeurs.map((x) => [x])
}

/** « a », « a et b », « a, b et c ». */
function joinEt(liste: string[]): string {
  return liste.length === 1
    ? liste[0]
    : `${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}`
}

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}

function texEuros(centiemes: number): string {
  return `$${texPrix(centiemes / 100)}~\\text{€}$`
}

function texPoints(centiemes: number): string {
  const points = centiemes / 100
  return `$${texNombre(points)}$ point${points > 1 ? 's' : ''}`
}

/** « $2$ baguettes et $1$ croissant », sans les objets en quantité nulle. */
function texQuantites(quantites: number[], objets: Objet[]): string {
  return joinEt(
    quantites.flatMap((q, j) =>
      q === 0 ? [] : [`$${q}$ ${q === 1 ? objets[j].nom : objets[j].pluriel}`],
    ),
  )
}

/** « d'une baguette », « d'un croissant ». */
function texDe(objet: Objet): string {
  return objet.un.startsWith('une ')
    ? `d'une ${objet.nom}`
    : `d'un ${objet.nom}`
}

function prenoms(n: number): Ligne[] {
  return (prenom(n) as string[]).map((nom) => ({ nom, sujet: nom }))
}

function questionPrix(objet: Objet): string {
  return `Quel est le prix, en euros, ${texDe(objet)} ?`
}

function reponsePrix(objet: Objet, valeur: number): string {
  return `${objet.un} coûte $${miseEnEvidence(texPrix(valeur / 100))}~\\text{€}$`
}

function phrasePrix(objet: Objet): [string, string] {
  return [`${majuscule(objet.un)} coûte `, '$~\\text{€}$.']
}

/** Achats dans un commerce : quantités achetées et prix unitaires. */
function commerce(
  id: string,
  lieu: string,
  objets: Objet[],
  {
    lignes = prenoms,
    article = 'article',
  }: {
    lignes?: (n: number) => Ligne[]
    article?: string
  } = {},
): ContexteProbleme {
  return {
    id,
    objets,
    lignes,
    quantites: [0, 4],
    systeme: {
      intro: `${lieu}, on cherche le prix de chaque ${article}.`,
      donnee: (l, q, o, t) =>
        `${majuscule(l.sujet)} paie ${texEuros(t)} pour ${texQuantites(q, o)}.`,
      inconnues: (o) =>
        `les prix respectifs, en euros, ${joinEt(o.map(texDe))}`,
      traduction: "Les achats se traduisent par le système d'équations suivant",
      question: questionPrix,
      reponse: reponsePrix,
      phrase: phrasePrix,
    },
  }
}

function familles(n: number): Ligne[] {
  return shuffle(['Martin', 'Bernard', 'Petit', 'Durand', 'Leroy', 'Moreau'])
    .slice(0, n)
    .map((nom) => ({ nom, sujet: `la famille ${nom}` }))
}

function equipes(n: number): Ligne[] {
  return shuffle(['Aigles', 'Lions', 'Requins', 'Tigres', 'Loups', 'Faucons'])
    .slice(0, n)
    .map((nom) => ({ nom: `les ${nom}`, sujet: `les ${nom}` }))
}

function recettes(n: number): Ligne[] {
  return shuffle([
    { nom: 'quatre-quarts', sujet: 'un quatre-quarts' },
    { nom: 'génoise', sujet: 'une génoise' },
    { nom: 'clafoutis', sujet: 'un clafoutis' },
    { nom: 'tarte', sujet: 'une tarte' },
    { nom: 'flan', sujet: 'un flan' },
    { nom: 'pâte à crêpes', sujet: 'une pâte à crêpes' },
  ]).slice(0, n)
}

const contextesProbleme: ContexteProbleme[] = [
  commerce('boulangerie', 'Dans une boulangerie', [
    {
      nom: 'baguette',
      pluriel: 'baguettes',
      un: 'une baguette',
      valeurs: [110, 120, 130],
    },
    {
      nom: 'croissant',
      pluriel: 'croissants',
      un: 'un croissant',
      valeurs: [100, 110, 120],
    },
    {
      nom: 'pain au chocolat',
      pluriel: 'pains au chocolat',
      un: 'un pain au chocolat',
      valeurs: [130, 140, 150],
    },
    {
      nom: 'brioche',
      pluriel: 'brioches',
      un: 'une brioche',
      valeurs: [250, 280, 300],
    },
  ]),
  commerce('papeterie', 'Dans une papeterie', [
    {
      nom: 'cahier',
      pluriel: 'cahiers',
      un: 'un cahier',
      valeurs: [250, 280, 320],
    },
    {
      nom: 'stylo',
      pluriel: 'stylos',
      un: 'un stylo',
      valeurs: [90, 120, 150],
    },
    {
      nom: 'classeur',
      pluriel: 'classeurs',
      un: 'un classeur',
      valeurs: [450, 520, 600],
    },
    {
      nom: 'trousse',
      pluriel: 'trousses',
      un: 'une trousse',
      valeurs: [600, 750, 850],
    },
  ]),
  commerce('sport', 'Dans un magasin de sport', [
    {
      nom: 'ballon',
      pluriel: 'ballons',
      un: 'un ballon',
      valeurs: [1500, 1800, 2200],
    },
    {
      nom: 'paire de chaussettes',
      pluriel: 'paires de chaussettes',
      un: 'une paire de chaussettes',
      valeurs: [500, 650, 800],
    },
    {
      nom: 'gourde',
      pluriel: 'gourdes',
      un: 'une gourde',
      valeurs: [900, 1200, 1500],
    },
    {
      nom: 'casquette',
      pluriel: 'casquettes',
      un: 'une casquette',
      valeurs: [1100, 1300, 1600],
    },
  ]),
  commerce(
    'cinema',
    'Dans un cinéma',
    [
      {
        nom: 'billet adulte',
        pluriel: 'billets adulte',
        un: 'un billet adulte',
        valeurs: [1050, 1150, 1250],
      },
      {
        nom: 'billet enfant',
        pluriel: 'billets enfant',
        un: 'un billet enfant',
        valeurs: [550, 650, 750],
      },
      {
        nom: 'billet senior',
        pluriel: 'billets senior',
        un: 'un billet senior',
        valeurs: [800, 850, 900],
      },
      {
        nom: 'billet étudiant',
        pluriel: 'billets étudiant',
        un: 'un billet étudiant',
        valeurs: [700, 750, 800],
      },
    ],
    {
      lignes: familles,
      article: 'billet',
    },
  ),
  {
    id: 'championnat',
    objets: [
      {
        nom: 'victoire',
        pluriel: 'victoires',
        un: 'une victoire',
        valeurs: [200, 300, 400],
        toujours: true,
      },
      {
        nom: 'match nul',
        pluriel: 'matchs nuls',
        un: 'un match nul',
        valeurs: [100],
      },
      { nom: 'défaite', pluriel: 'défaites', un: 'une défaite', valeurs: [0] },
    ],
    lignes: equipes,
    quantites: [0, 6],
    systeme: {
      intro:
        "Dans un championnat, chaque type de résultat rapporte un nombre de points que l'on cherche à retrouver.",
      donnee: (l, q, o, t) =>
        `${majuscule(l.sujet)} totalisent ${texPoints(t)} avec ${texQuantites(q, o)}.`,
      inconnues: (o) =>
        `les nombres de points respectivement attribués pour ${joinEt(o.map((a) => a.un))}`,
      traduction:
        "Les résultats se traduisent par le système d'équations suivant",
      question: (o) => `Combien de points rapporte ${o.un} ?`,
      reponse: (o, v) =>
        `${o.un} rapporte $${miseEnEvidence(texNombre(v / 100))}$ point${v > 100 ? 's' : ''}`,
      phrase: (o) => [`${majuscule(o.un)} rapporte `, ' point(s).'],
    },
  },
  {
    id: 'patisserie',
    objets: [
      {
        nom: 'œuf',
        pluriel: 'œufs',
        un: 'un œuf',
        valeurs: [25, 30, 35],
        quantites: [2, 6],
      },
      {
        nom: 'plaquette de beurre',
        pluriel: 'plaquettes de beurre',
        un: 'une plaquette de beurre',
        valeurs: [200, 230, 250],
        quantites: [0, 2],
      },
      {
        nom: 'litre de lait',
        pluriel: 'litres de lait',
        un: 'un litre de lait',
        valeurs: [100, 110, 120],
        quantites: [0, 1],
      },
      {
        nom: 'sachet de levure',
        pluriel: 'sachets de levure',
        un: 'un sachet de levure',
        valeurs: [30, 40, 50],
        quantites: [0, 2],
      },
    ],
    lignes: recettes,
    quantites: [0, 4],
    systeme: {
      intro: 'Un pâtissier cherche le prix de chacun de ses ingrédients.',
      donnee: (l, q, o, t) =>
        `Les ingrédients d'${l.sujet}, soit ${texQuantites(q, o)}, coûtent ${texEuros(t)}.`,
      inconnues: (o) =>
        `les prix respectifs, en euros, ${joinEt(o.map(texDe))}`,
      traduction:
        "Les recettes se traduisent par le système d'équations suivant",
      question: questionPrix,
      reponse: reponsePrix,
      phrase: phrasePrix,
    },
  },
]

function quantitesAleatoires(
  n: number,
  objets: Objet[],
  intervalle: [number, number],
): number[][] {
  return Array.from({ length: n }, () =>
    objets.map((objet) => {
      const [min, max] = objet.quantites ?? intervalle
      return randint(min, max)
    }),
  )
}

/** Tire p objets du contexte, en gardant ceux qui doivent toujours figurer. */
function objetsAleatoires(
  contexte: ContexteProbleme,
  p: number,
): Objet[] | null {
  const objets = shuffle(contexte.objets).slice(0, p)
  return contexte.objets.some((o) => o.toujours && !objets.includes(o))
    ? null
    : objets
}

/** Des valeurs unitaires toutes distinctes, pour que la matrice P soit parlante. */
function valeursDistinctes(valeurs: number[]): boolean {
  return new Set(valeurs).size === valeurs.length
}

/** Une fonction affine ou du second degré dont on connaît des valeurs. */
type ContexteInterpolation = {
  id: string
  /** Nombre d'inconnues : 2 (fonction affine) ou 3 (second degré). */
  p: number
  /** Coefficients en centièmes et abscisses des points connus. */
  tirer: () => { coefficients: number[]; abscisses: number[] } | null
  /** Situation, avec les valeurs connues (en centièmes). */
  enonce: (abscisses: number[], valeurs: number[]) => string
  traduction: string
  /** Question c) : écrire la fonction, par exemple « p(d)= » en fonction de d. */
  consigneFonction: string
  fonction: string
  variable: string
}

/** Valeur en centièmes de la fonction de coefficients `coefficients` en x. */
function valeurPolynome(coefficients: number[], x: number): number {
  return coefficients.reduce(
    (s, c, k) => s + c * x ** (coefficients.length - 1 - k),
    0,
  )
}

/** k abscisses entières distinctes de [min ; max], dans l'ordre croissant. */
function abscissesDistinctes(k: number, min: number, max: number): number[] {
  return shuffle(Array.from({ length: max - min + 1 }, (_, j) => min + j))
    .slice(0, k)
    .sort((a, b) => a - b)
}

const inconnuesInterpolation = ['a', 'b', 'c']

/** « 1,7d+2,5 » ou « -0,1x^2+1,5x+2 » à partir des coefficients en centièmes. */
function texPolynome(coefficients: number[], x: string): string {
  const [a, b, c] = coefficients.map((k) => k / 100)
  return coefficients.length === 2
    ? `${rienSi1(a)}${x}${ecritureAlgebrique(b)}`
    : `${rienSi1(a)}${x}^2${ecritureAlgebriqueSauf1(b)}${x}${ecritureAlgebrique(c)}`
}

const contextesInterpolation: ContexteInterpolation[] = [
  {
    id: 'taxi',
    p: 2,
    tirer: () => ({
      coefficients: [10 * randint(11, 25), 50 * randint(4, 10)],
      abscisses: abscissesDistinctes(2, 2, 30),
    }),
    enonce: (d, v) =>
      `Le prix d'une course de taxi comprend une prise en charge fixe et un tarif par kilomètre parcouru. Une course de $${d[0]}~\\text{km}$ coûte ${texEuros(v[0])} et une course de $${d[1]}~\\text{km}$ coûte ${texEuros(v[1])}.<br>On note $a$ le tarif par kilomètre et $b$ le montant de la prise en charge, en euros : une course de $d$ kilomètres coûte $p(d)=ad+b$ euros.`,
    traduction:
      "Les deux courses se traduisent par le système d'équations suivant",
    consigneFonction:
      "En déduire le prix $p(d)$, en euros, d'une course de $d$ kilomètres.",
    fonction: 'p(d)',
    variable: 'd',
  },
  {
    id: 'plombier',
    p: 2,
    tirer: () => ({
      coefficients: [500 * randint(7, 12), 500 * randint(4, 10)],
      abscisses: abscissesDistinctes(2, 1, 6),
    }),
    enonce: (h, v) =>
      `Un plombier facture chaque intervention en ajoutant des frais de déplacement fixes à un tarif horaire. Une intervention de $${h[0]}$ heure${h[0] > 1 ? 's' : ''} est facturée ${texEuros(v[0])} et une intervention de $${h[1]}$ heures est facturée ${texEuros(v[1])}.<br>On note $a$ le tarif horaire et $b$ les frais de déplacement, en euros : une intervention de $h$ heures coûte $p(h)=ah+b$ euros.`,
    traduction:
      "Les deux interventions se traduisent par le système d'équations suivant",
    consigneFonction:
      "En déduire le prix $p(h)$, en euros, d'une intervention de $h$ heures.",
    fonction: 'p(h)',
    variable: 'h',
  },
  {
    id: 'ballon',
    p: 3,
    tirer: () => {
      const coefficients = [
        choice([-10, -20, -25, -50]),
        choice([50, 100, 150, 200]),
        choice([100, 150, 200]),
      ]
      const abscisses = abscissesDistinctes(3, 1, 8)
      return abscisses.every((x) => valeurPolynome(coefficients, x) > 0)
        ? { coefficients, abscisses }
        : null
    },
    enonce: (x, v) =>
      `Dans un repère, la trajectoire d'un ballon est modélisée par une parabole d'équation $y=ax^2+bx+c$, où $a$, $b$ et $c$ sont des réels, $x$ est la distance horizontale parcourue et $y$ la hauteur du ballon, en mètres. Le ballon passe par les points de coordonnées ${joinEt(x.map((xi, k) => `$(${xi}\\,;\\,${texNombre(v[k] / 100)})$`))}.`,
    traduction:
      "Chaque point appartient à la parabole, ce qui donne le système d'équations suivant",
    consigneFonction: 'En déduire une équation de la trajectoire du ballon.',
    fonction: 'y',
    variable: 'x',
  },
  {
    id: 'benefice',
    p: 3,
    tirer: () => {
      const coefficients = [
        choice([-50, -100, -200]),
        100 * randint(4, 16),
        -100 * randint(5, 20),
      ]
      const abscisses = abscissesDistinctes(3, 1, 10)
      return abscisses.every((q) => valeurPolynome(coefficients, q) > 0)
        ? { coefficients, abscisses }
        : null
    },
    enonce: (q, v) =>
      `Une entreprise fabrique chaque jour entre $1$ et $10$ centaines d'objets. Son bénéfice, en milliers d'euros, pour une production de $q$ centaines d'objets est modélisé par $f(q)=aq^2+bq+c$, où $a$, $b$ et $c$ sont des réels. On sait que ${joinEt(q.map((qi, k) => `$f(${qi})=${texNombre(v[k] / 100)}$`))}.`,
    traduction:
      "Ces trois valeurs se traduisent par le système d'équations suivant",
    consigneFonction: "En déduire l'expression de $f(q)$.",
    fonction: 'f(q)',
    variable: 'q',
  },
]

/**
 * `phrase` : champ numérique placé entre deux textes ; `variable` : champ
 * « nom = » attendant une expression de cette variable ; sinon, le champ
 * attend une matrice.
 */
type Champ = {
  nom: string
  reponse: string
  phrase?: [string, string]
  /** Variable d'une expression saisie après « nom = » (touche ajoutée au clavier). */
  variable?: string
}
/** Une consigne, sa correction et les matrices attendues. */
type Etape = { consigne: string; correction: string; champs: Champ[] }
type Situation = { enonce: string; etapes: Etape[]; cle: string }

function texInconnues(vars: string[]): string {
  return texPmatrix(vars.map((v) => [v]))
}

/** Écrire sous la forme AX=B le système de matrice `lignesA` et de seconds membres `B`. */
function etapeSysteme(
  traduction: string,
  lignesA: number[][],
  B: number[],
  vars: string[],
): Etape {
  const systeme = texSystemeEquations(
    lignesA.map((l, i) => `${texMembreGauche(l, vars)}&=${texNombre(B[i])}`),
  )
  const texA = texMatrice(lignesA)
  const texB = texMatrice(colonne(B))
  return {
    consigne:
      'Déterminer les matrices $A$ et $B$ telles que la situation se traduise par $AX=B$.',
    correction: `${traduction} :<br>$${systeme}$<br>Ce système s'écrit $AX=B$ avec $A=${miseEnEvidence(texA)}$ et $B=${miseEnEvidence(texB)}$.`,
    champs: [
      { nom: 'A', reponse: texA },
      { nom: 'B', reponse: texB },
    ],
  }
}

/** Résoudre AX=B à l'aide de la calculatrice. */
/** A^{-1} en fractions exactes (A est à coefficients entiers). */
function texInverse(lignesA: number[][]): string {
  const A = matrice(lignesA)
  const det = Math.round(A.determinant())
  const inverse = texPmatrix(
    A.inverse()
      .toArray()
      .map((ligne) =>
        ligne.map((x) => fraction(Math.round(x * det), det).simplifie().texFSD),
      ),
  )
  // On espace les lignes des fractions ; le convertisseur Typst ne connaît pas \def.
  return inverse.includes('\\dfrac') && !context.isTypst
    ? `{\\def\\arraystretch{1.8}${inverse}}`
    : inverse
}

/** Résoudre AX=B : A^{-1} à la calculatrice, puis X=A^{-1}B. */
function etapeResolution(lignesA: number[][], B: number[], X: number[]): Etape {
  const texX = texMatrice(colonne(X))
  const inverse = texInverse(lignesA)
  return {
    consigne:
      "Déterminer, à l'aide de la calculatrice, la matrice $X$ en justifiant la démarche.",
    correction: `À l'aide de la calculatrice, on constate que la matrice $A$ est inversible et que $A^{-1}=${inverse}$.<br>Donc $AX=B\\iff X=A^{-1}B$, d'où :<br>$X=${inverse}\\times${texMatrice(colonne(B))}=${miseEnEvidence(texX)}$`,
    champs: [{ nom: 'X', reponse: texX }],
  }
}

/** Question c) : une valeur numérique lue dans X et interprétée. */
function etapeValeur(
  consigne: string,
  correction: string,
  valeur: number,
  phrase: [string, string],
): Etape {
  return {
    consigne,
    correction,
    champs: [{ nom: '', reponse: String(valeur), phrase }],
  }
}

/** Valeurs unitaires inconnues : traduire la situation par AX=B, puis résoudre. */
function situationProbleme(
  p: number,
  contexte: ContexteProbleme,
): Situation | null {
  const systemeContexte = contexte.systeme
  const objets = objetsAleatoires(contexte, p)
  if (objets == null) return null
  const valeurs = objets.map((a) => choice(a.valeurs))
  if (!valeursDistinctes(valeurs)) return null
  const lignes = contexte.lignes(p)
  const quantites = quantitesAleatoires(p, objets, contexte.quantites)
  // Une matrice assez « remplie » et inversible.
  if (quantites.flat().filter((q) => q === 0).length > p - 1) return null
  if (quantites.some((l) => l.filter((q) => q > 0).length < 2)) return null
  if (matrice(quantites).determinant() === 0) return null
  const totaux = quantites.map((l) =>
    l.reduce((s, q, j) => s + q * valeurs[j], 0),
  )

  const vars = variables.slice(0, p)
  let enonce = `${systemeContexte.intro}<br>`
  enonce += `${lignes.map((l, i) => systemeContexte.donnee(l, quantites[i], objets, totaux[i])).join(' ')}<br>`
  enonce += `On note ${joinEt(vars.map((v) => `$${v}$`))} ${systemeContexte.inconnues(objets)} et $X=${texInconnues(vars)}$.`
  return {
    enonce,
    etapes: [
      etapeSysteme(
        systemeContexte.traduction,
        quantites,
        totaux.map((t) => t / 100),
        vars,
      ),
      etapeResolution(
        quantites,
        totaux.map((t) => t / 100),
        valeurs.map((v) => v / 100),
      ),
      etapeValeur(
        systemeContexte.question(objets[0]),
        `D'après la question précédente, ${systemeContexte.reponse(objets[0], valeurs[0])}.`,
        valeurs[0] / 100,
        systemeContexte.phrase(objets[0]),
      ),
    ],
    cle: [
      'probleme',
      contexte.id,
      ...objets.map((a) => a.nom),
      ...valeurs,
      ...quantites.flat(),
    ].join('|'),
  }
}

/** Fonction affine ou du second degré passant par des points connus. */
function situationInterpolation(
  contexte: ContexteInterpolation,
): Situation | null {
  const tirage = contexte.tirer()
  if (tirage == null) return null
  const { coefficients, abscisses } = tirage
  const expression = texPolynome(coefficients, contexte.variable)
  const valeurs = abscisses.map((x) => valeurPolynome(coefficients, x))
  const vars = inconnuesInterpolation.slice(0, contexte.p)
  const lignesA = abscisses.map((x) =>
    contexte.p === 2 ? [x, 1] : [x * x, x, 1],
  )
  return {
    enonce: `${contexte.enonce(abscisses, valeurs)}<br>On pose $X=${texInconnues(vars)}$.`,
    etapes: [
      etapeSysteme(
        contexte.traduction,
        lignesA,
        valeurs.map((v) => v / 100),
        vars,
      ),
      etapeResolution(
        lignesA,
        valeurs.map((v) => v / 100),
        coefficients.map((c) => c / 100),
      ),
      {
        consigne: contexte.consigneFonction,
        correction: `D'après la question précédente, ${joinEt(vars.map((v, k) => `$${v}=${texNombre(coefficients[k] / 100)}$`))}, donc $${contexte.fonction}=${miseEnEvidence(expression)}$.`,
        champs: [
          {
            nom: contexte.fonction,
            reponse: expression,
            variable: contexte.variable,
          },
        ],
      },
    ],
    cle: ['interpolation', contexte.id, ...coefficients, ...abscisses].join(
      '|',
    ),
  }
}

/**
 * Renvoie une fonction qui donne le contexte suivant, compatible avec la
 * taille p : un contexte ne revient pas avant que tous aient servi.
 */
function serieDeContextes<T>(
  contextes: T[],
  compatible: (contexte: T, p: number) => boolean = () => true,
): (p: number) => T {
  let file: T[] = []
  return (p) => {
    let k = file.findIndex((c) => compatible(c, p))
    if (k === -1) {
      file = [...file, ...shuffle(contextes)]
      k = file.findIndex((c) => compatible(c, p))
    }
    return file.splice(k, 1)[0]
  }
}

/** Première situation obtenue, en changeant de contexte si un tirage échoue. */
function premiereSituation<T>(
  suivant: (p: number) => T,
  p: number,
  generer: (contexte: T) => Situation | null,
): Situation | null {
  for (let c = 0; c < 5; c++) {
    const contexte = suivant(p)
    for (let essai = 0; essai < 1000; essai++) {
      const situation = generer(contexte)
      if (situation != null) return situation
    }
  }
  return null
}

/** Énoncé, champs de réponse et correction d'une situation (nbChamps champs par question). */
function assembler(
  exercice: IExercice,
  i: number,
  situation: Situation,
  nbChamps: number,
): { texte: string; texteCorr: string } {
  let texte = situation.enonce
  if (exercice.interactif) {
    texte += "<br>Saisir les matrices à l'aide de la touche «\u00a0Matrice\u00a0»."
  }
  let texteCorr = ''
  let champ = 0
  const numeroter = situation.etapes.length > 1
  situation.etapes.forEach((etape, k) => {
    const numero = numeroter ? numAlpha(k) : ''
    texte += `<br>${numero}${etape.consigne}`
    texteCorr += `${k > 0 ? '<br>' : ''}${numero}${etape.correction}`
    for (const { nom, reponse, phrase, variable } of etape.champs) {
      if (exercice.interactif) {
        texte +=
          '<br>' +
          (phrase != null
            ? ajouteChampTexteMathLive(
                exercice,
                nbChamps * i + champ,
                KeyboardType.clavierNumbers,
                { texteAvant: phrase[0], texteApres: phrase[1] },
              )
            : variable != null
              ? ajouteChampTexteMathLive(
                  exercice,
                  nbChamps * i + champ,
                  KeyboardType.clavierPersonnalisable,
                  { texteAvant: `$${nom}=$`, dataKeys: [variable, 'SQ'] },
                )
              : ajouteChampTexteMathLive(
                  exercice,
                  nbChamps * i + champ,
                  KeyboardType.clavierMatrice,
                  { texteAvant: `$${nom}=$` },
                ))
      }
      handleAnswers(
        exercice,
        nbChamps * i + champ,
        phrase != null || variable != null
          ? { reponse: { value: reponse } }
          : { reponse: { value: reponse, compare: matriceCompare } },
      )
      champ++
    }
  })
  return { texte, texteCorr }
}

export default class ResoudreUnProblemeAvecDesMatrices extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Situations',
      3,
      '1 : Prix ou points inconnus\n2 : Interpolation (affine ou 2nd degré)\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      "Nombre d'inconnues",
      3,
      '1 : Deux\n2 : Trois\n3 : Mélange',
    ]
    this.sup = 3
    this.sup2 = 3
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestions = combinaisonListes(
      this.sup === 3 ? [1, 2] : [this.sup],
      this.nbQuestions,
    )
    const tailles = combinaisonListes(
      this.sup2 === 3 ? [2, 3] : [this.sup2 + 1],
      this.nbQuestions,
    )
    const suivantProbleme = serieDeContextes(contextesProbleme)
    const suivantInterpolation = serieDeContextes(
      contextesInterpolation,
      (c, p) => c.p === p,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const p = tailles[i]
      const situation =
        typesDeQuestions[i] === 1
          ? premiereSituation(suivantProbleme, p, (c) =>
              situationProbleme(p, c),
            )
          : premiereSituation(suivantInterpolation, p, (c) =>
              situationInterpolation(c),
            )
      if (situation == null || !this.questionJamaisPosee(i, situation.cle)) {
        continue
      }
      const { texte, texteCorr } = assembler(this, i, situation, 4)
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
