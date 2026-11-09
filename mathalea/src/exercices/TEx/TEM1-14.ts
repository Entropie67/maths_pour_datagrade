import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { matriceCompare } from '../../lib/interactif/comparaisonMatrices'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { matrice } from '../../lib/mathFonctions/Matrice'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { prenom } from '../../lib/outils/Personne'
import {
  texMembreGauche,
  texSystemeEquations,
} from '../../lib/outils/systemeEquations'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import type { IExercice } from '../../lib/types'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Modéliser une situation par une matrice'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '08/10/2026'

/**
 * Écrire les matrices qui traduisent une situation concrète, sans les calculer :
 * tableau à double entrée et valeurs unitaires, problème à inconnues,
 * évolution d'effectifs entre plusieurs lieux, ou interpolation.
 *
 * @author Arnaud Meistermann
 */
export const uuid = 'be473'

export const refs = {
  'fr-fr': ['TEM1-14'],
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
 * Situation décrite par un tableau à double entrée (lignes × objets). Les
 * valeurs unitaires des objets ne servent qu'à la version « système ».
 */
type ContexteTableau = {
  id: string
  objets: Objet[]
  lignes: (n: number) => Ligne[]
  quantites: [number, number]
  /** Phrase d'ouverture de la version « tableau ». */
  cadre: string
  ligne: (l: Ligne, q: number[], objets: Objet[]) => string
  nomLignes: string
  nomColonnes: string
  consigneQ: string
  correctionQ: string
  /** Version où les valeurs unitaires sont inconnues (absente si elle n'a pas de sens). */
  systeme?: {
    intro: string
    donnee: (l: Ligne, q: number[], objets: Objet[], t: number) => string
    inconnues: (objets: Objet[]) => string
    traduction: string
  }
}

const lettres = ['A', 'B', 'C']
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

/** « d'article », « de billet ». */
function elision(mot: string): string {
  return /^[aeiouyéèh]/i.test(mot) ? `d'${mot}` : `de ${mot}`
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

/** Achats dans un commerce : quantités achetées et prix unitaires. */
function commerce(
  id: string,
  lieu: string,
  objets: Objet[],
  {
    lignes = prenoms,
    nomLignes = 'les personnes',
    individu = 'personne',
    article = 'article',
  }: {
    lignes?: (n: number) => Ligne[]
    nomLignes?: string
    individu?: string
    article?: string
  } = {},
): ContexteTableau {
  return {
    id,
    objets,
    lignes,
    quantites: [0, 4],
    cadre: `${lieu}, on relève les achats de plusieurs ${individu}s.`,
    ligne: (l, q, o) => `${majuscule(l.sujet)} achète ${texQuantites(q, o)}.`,
    nomLignes,
    nomColonnes: `les ${article}s`,
    consigneQ: `le nombre ${elision(article)}s du $j$-ième type achetés par la $i$-ième ${individu}`,
    correctionQ: `Chaque ligne correspond à une ${individu} et chaque colonne à un type ${elision(article)}`,
    systeme: {
      intro: `${lieu}, on cherche le prix de chaque ${article}.`,
      donnee: (l, q, o, t) =>
        `${majuscule(l.sujet)} paie ${texEuros(t)} pour ${texQuantites(q, o)}.`,
      inconnues: (o) =>
        `les prix respectifs, en euros, ${joinEt(o.map(texDe))}`,
      traduction: "Les achats se traduisent par le système d'équations suivant",
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

const contextesTableau: ContexteTableau[] = [
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
      nomLignes: 'les familles',
      individu: 'famille',
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
    cadre: 'Dans un championnat, on relève les résultats de plusieurs équipes.',
    ligne: (l, q, o) => `${majuscule(l.sujet)} comptent ${texQuantites(q, o)}.`,
    nomLignes: 'les équipes',
    nomColonnes: 'les résultats',
    consigneQ:
      'le nombre de résultats du $j$-ième type obtenus par la $i$-ième équipe',
    correctionQ:
      'Chaque ligne correspond à une équipe et chaque colonne à un type de résultat',
    systeme: {
      intro:
        "Dans un championnat, chaque type de résultat rapporte un nombre de points que l'on cherche à retrouver.",
      donnee: (l, q, o, t) =>
        `${majuscule(l.sujet)} totalisent ${texPoints(t)} avec ${texQuantites(q, o)}.`,
      inconnues: (o) =>
        `les nombres de points respectivement attribués pour ${joinEt(o.map((a) => a.un))}`,
      traduction:
        "Les résultats se traduisent par le système d'équations suivant",
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
    cadre:
      'Un pâtissier relève les ingrédients nécessaires à plusieurs recettes.',
    ligne: (l, q, o) =>
      `${majuscule(l.sujet)} nécessite ${texQuantites(q, o)}.`,
    nomLignes: 'les recettes',
    nomColonnes: 'les ingrédients',
    consigneQ:
      'la quantité du $j$-ième ingrédient nécessaire à la $i$-ième recette',
    correctionQ:
      'Chaque ligne correspond à une recette et chaque colonne à un ingrédient',
    systeme: {
      intro: 'Un pâtissier cherche le prix de chacun de ses ingrédients.',
      donnee: (l, q, o, t) =>
        `Les ingrédients d'${l.sujet}, soit ${texQuantites(q, o)}, coûtent ${texEuros(t)}.`,
      inconnues: (o) =>
        `les prix respectifs, en euros, ${joinEt(o.map(texDe))}`,
      traduction:
        "Les recettes se traduisent par le système d'équations suivant",
    },
  },
  {
    id: 'bulletin',
    // Pas de valeurs unitaires : ce contexte n'a pas de version « système ».
    objets: [
      {
        nom: 'mathématiques',
        pluriel: '',
        un: '',
        valeurs: [],
      },
      {
        nom: 'physique-chimie',
        pluriel: '',
        un: '',
        valeurs: [],
      },
      {
        nom: 'français',
        pluriel: '',
        un: '',
        valeurs: [],
      },
      {
        nom: 'anglais',
        pluriel: '',
        un: '',
        valeurs: [],
      },
    ],
    lignes: prenoms,
    quantites: [6, 20],
    cadre: 'Dans une classe, on relève les notes de plusieurs élèves.',
    ligne: (l, q, o) =>
      `${l.sujet} a obtenu ${joinEt(q.map((note, j) => `$${note}$ en ${o[j].nom}`))}.`,
    nomLignes: 'les élèves',
    nomColonnes: 'les matières',
    consigneQ: 'la note obtenue par le $i$-ième élève dans la $j$-ième matière',
    correctionQ:
      'Chaque ligne correspond à un élève et chaque colonne à une matière',
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
  contexte: ContexteTableau,
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

const contextesInterpolation: ContexteInterpolation[] = [
  {
    id: 'taxi',
    p: 2,
    tirer: () => ({
      coefficients: [10 * randint(11, 25), 50 * randint(4, 10)],
      abscisses: abscissesDistinctes(2, 2, 30),
    }),
    enonce: (d, v) =>
      `Le prix d'une course de taxi comprend une prise en charge fixe et un tarif par kilomètre parcouru. Une course de $${d[0]}~\\text{km}$ coûte ${texEuros(v[0])} et une course de $${d[1]}~\\text{km}$ coûte ${texEuros(v[1])}.<br>On note $a$ le tarif par kilomètre et $b$ le montant de la prise en charge, en euros : une course de $d$ kilomètres coûte $ad+b$ euros.`,
    traduction:
      "Les deux courses se traduisent par le système d'équations suivant",
  },
  {
    id: 'plombier',
    p: 2,
    tirer: () => ({
      coefficients: [500 * randint(7, 12), 500 * randint(4, 10)],
      abscisses: abscissesDistinctes(2, 1, 6),
    }),
    enonce: (h, v) =>
      `Un plombier facture chaque intervention en ajoutant des frais de déplacement fixes à un tarif horaire. Une intervention de $${h[0]}$ heure${h[0] > 1 ? 's' : ''} est facturée ${texEuros(v[0])} et une intervention de $${h[1]}$ heures est facturée ${texEuros(v[1])}.<br>On note $a$ le tarif horaire et $b$ les frais de déplacement, en euros : une intervention de $h$ heures coûte $ah+b$ euros.`,
    traduction:
      "Les deux interventions se traduisent par le système d'équations suivant",
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
      `Dans un repère, la trajectoire d'un ballon est modélisée par une parabole d'équation $y=ax^2+bx+c$, où $x$ est la distance horizontale parcourue et $y$ la hauteur du ballon, en mètres. Le ballon passe par les points de coordonnées ${joinEt(x.map((xi, k) => `$(${xi}\\,;\\,${texNombre(v[k] / 100)})$`))}.`,
    traduction:
      "Chaque point appartient à la parabole, ce qui donne le système d'équations suivant",
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
      `Une entreprise fabrique chaque jour entre $1$ et $10$ centaines d'objets. Son bénéfice, en milliers d'euros, pour une production de $q$ centaines d'objets est modélisé par $f(q)=aq^2+bq+c$. On sait que ${joinEt(q.map((qi, k) => `$f(${qi})=${texNombre(v[k] / 100)}$`))}.`,
    traduction:
      "Ces trois valeurs se traduisent par le système d'équations suivant",
  },
]

/** Effectifs qui se répartissent entre plusieurs lieux (salles, stations…). */
type ContexteEvolution = {
  id: string
  /** Ex. : « Une ville compte trois salles de sport, notées A, B et C. … chaque année : ». */
  intro: (nombre: string, noms: string) => string
  depart: (pct: string, x: string, y: string) => string
  departSuivant: (pct: string, y: string) => string
  reste: (x: string) => string
  notation: (effectifs: string, noms: string) => string
  formation: (p: number) => string
  conservation: string
}

const contextesEvolution: ContexteEvolution[] = [
  {
    id: 'salles',
    intro: (nombre, noms) =>
      `Une ville compte ${nombre} salles de sport, notées ${noms}. Le nombre total d'abonnés reste constant et, chaque année :`,
    depart: (pct, x, y) =>
      `${pct} des abonnés de la salle ${x} la quittent pour la salle ${y}`,
    departSuivant: (pct, y) => `${pct} pour la salle ${y}`,
    reste: (x) => `les autres restent abonnés à la salle ${x}`,
    notation: (effectifs, noms) =>
      `on note ${effectifs} les nombres d'abonnés respectifs des salles ${noms} au $1^{\\text{er}}$ janvier de l'année $2026+n$`,
    formation: (p) =>
      `Chaque effectif de l'année suivante est formé des abonnés restés dans la salle et de ceux venus ${p === 2 ? "de l'autre salle" : 'des autres salles'}`,
    conservation: "le nombre total d'abonnés",
  },
  {
    id: 'velos',
    intro: (nombre, noms) =>
      `Un service de vélos en libre-service dispose de ${nombre} stations, notées ${noms}. Le nombre total de vélos reste constant et, chaque nuit :`,
    depart: (pct, x, y) =>
      `${pct} des vélos de la station ${x} sont déplacés vers la station ${y}`,
    departSuivant: (pct, y) => `${pct} vers la station ${y}`,
    reste: (x) => `les autres restent à la station ${x}`,
    notation: (effectifs, noms) =>
      `on note ${effectifs} les nombres de vélos respectifs des stations ${noms} au matin du jour $n$`,
    formation: (p) =>
      `Chaque effectif du lendemain est formé des vélos restés dans la station et de ceux venus ${p === 2 ? "de l'autre station" : 'des autres stations'}`,
    conservation: 'le nombre total de vélos',
  },
  {
    id: 'reserve',
    intro: (nombre, noms) =>
      `Une réserve naturelle est divisée en ${nombre} zones, notées ${noms}. Le nombre total de cerfs reste constant et, chaque mois :`,
    depart: (pct, x, y) =>
      `${pct} des cerfs de la zone ${x} migrent vers la zone ${y}`,
    departSuivant: (pct, y) => `${pct} vers la zone ${y}`,
    reste: (x) => `les autres restent dans la zone ${x}`,
    notation: (effectifs, noms) =>
      `on note ${effectifs} les nombres de cerfs respectifs des zones ${noms} au bout de $n$ mois`,
    formation: (p) =>
      `Chaque effectif du mois suivant est formé des cerfs restés dans la zone et de ceux venus ${p === 2 ? "de l'autre zone" : 'des autres zones'}`,
    conservation: 'le nombre total de cerfs',
  },
  {
    id: 'villes',
    intro: (nombre, noms) =>
      `Une région compte ${nombre} villes, notées ${noms}. La population totale reste constante et, chaque année :`,
    depart: (pct, x, y) =>
      `${pct} des habitants de la ville ${x} déménagent dans la ville ${y}`,
    departSuivant: (pct, y) => `${pct} dans la ville ${y}`,
    reste: (x) => `les autres restent dans la ville ${x}`,
    notation: (effectifs, noms) =>
      `on note ${effectifs} les populations respectives des villes ${noms} au $1^{\\text{er}}$ janvier de l'année $2026+n$`,
    formation: (p) =>
      `Chaque population de l'année suivante est formée des habitants restés dans la ville et de ceux venus ${p === 2 ? "de l'autre ville" : 'des autres villes'}`,
    conservation: 'la population totale',
  },
]

/** `points` : nombre de points du champ (1 par défaut). */
type Champ = { nom: string; reponse: string; points?: number }
/** Une consigne, sa correction et les matrices attendues. */
type Etape = { consigne: string; correction: string; champs: Champ[] }
type Situation = { enonce: string; etapes: Etape[]; cle: string }

function texInconnues(vars: string[]): string {
  return texPmatrix(vars.map((v) => [v]))
}

/**
 * Tableau à double entrée : matrice Q des quantités. Ce champ unique vaut
 * 2 points, comme les deux champs des autres situations.
 */
function situationTableau(
  p: number,
  contexte: ContexteTableau,
): Situation | null {
  const objets = objetsAleatoires(contexte, p)
  if (objets == null) return null
  const n = randint(2, 3)
  const lignes = contexte.lignes(n)
  const quantites = quantitesAleatoires(n, objets, contexte.quantites)
  // Chaque ligne porte sur au moins deux objets (un seul si p = 2)…
  if (quantites.some((l) => l.filter((q) => q > 0).length < p - 1)) return null
  // … et chaque objet apparaît dans au moins une ligne.
  if (objets.some((_, j) => quantites.every((l) => l[j] === 0))) return null

  const Q = texMatrice(quantites)
  let enonce = `${contexte.cadre}<br>`
  enonce += `${lignes.map((l, i) => contexte.ligne(l, quantites[i], objets)).join(' ')}<br>`
  enonce += `On range ${contexte.nomLignes} dans l'ordre ${joinEt(lignes.map((l) => l.nom))} et ${contexte.nomColonnes} dans l'ordre ${joinEt(objets.map((a) => a.nom))}.`
  return {
    enonce,
    etapes: [
      {
        consigne: `Écrire la matrice $Q$ dont le coefficient de la ligne $i$ et de la colonne $j$ est ${contexte.consigneQ}.`,
        correction: `${contexte.correctionQ} :<br>$Q=${miseEnEvidence(Q)}$`,
        champs: [{ nom: 'Q', reponse: Q, points: 2 }],
      },
    ],
    cle: [
      'tableau',
      contexte.id,
      ...objets.map((a) => a.nom),
      ...quantites.flat(),
    ].join('|'),
  }
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

/** Valeurs unitaires inconnues : traduire la situation par AX=B. */
function situationProbleme(
  p: number,
  contexte: ContexteTableau,
): Situation | null {
  const systemeContexte = contexte.systeme
  if (systemeContexte == null) return null
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
    ],
    cle: ['interpolation', contexte.id, ...coefficients, ...abscisses].join(
      '|',
    ),
  }
}

/** Effectifs qui se répartissent entre p lieux : matrice M telle que U_{n+1}=MU_n (2 points). */
function situationEvolution(p: number, contexte: ContexteEvolution): Situation {
  const noms = lettres.slice(0, p)
  // pourcentages[i][j] : pourcentage de l'effectif de j qui passe en i.
  const pourcentages = noms.map(() => noms.map(() => 0))
  for (let j = 0; j < p; j++) {
    for (let i = 0; i < p; i++) {
      if (i !== j) pourcentages[i][j] = 5 * randint(1, 6)
    }
  }
  for (let j = 0; j < p; j++) {
    pourcentages[j][j] =
      100 - pourcentages.reduce((s, l, i) => s + (i === j ? 0 : l[j]), 0)
  }
  const coefficients = pourcentages.map((l) => l.map((pct) => pct / 100))

  const suites = noms.map((x) => x.toLowerCase())
  const texU = texPmatrix(suites.map((u) => [`${u}_{n}`]))
  const M = texMatrice(coefficients)
  const pct = (x: number) => `$${x}\\,\\%$`
  const texNoms = joinEt(noms)

  const items = noms.map((x, j) => {
    const departs = noms
      .flatMap((y, i) => (i === j ? [] : [{ y, valeur: pourcentages[i][j] }]))
      .map(({ y, valeur }, k) =>
        k === 0
          ? contexte.depart(pct(valeur), x, y)
          : contexte.departSuivant(pct(valeur), y),
      )
    const fin = j === p - 1 ? '.' : ' ;'
    return `${joinEt(departs)}, ${contexte.reste(x)}${fin}`
  })
  let enonce = contexte.intro(p === 2 ? 'deux' : 'trois', texNoms)
  enonce += createList({ items, style: 'puces' })
  enonce += `Pour tout entier naturel $n$, ${contexte.notation(joinEt(suites.map((u) => `$${u}_n$`)), texNoms)} et $U_n=${texU}$.`

  const systeme = texSystemeEquations(
    suites.map(
      (u, i) =>
        `${u}_{n+1}&=${texMembreGauche(
          coefficients[i],
          suites.map((v) => `${v}_n`),
        )}`,
    ),
  )
  let correctionM = `${contexte.formation(p)}. On obtient ainsi, pour tout entier naturel $n$ :<br>$${systeme}$<br>`
  correctionM += `Ce système s'écrit $U_{n+1}=MU_n$ avec $M=${miseEnEvidence(M)}$.<br>`
  correctionM += `La somme des coefficients de chaque colonne de $M$ vaut $1$ : ${contexte.conservation} est ${contexte.conservation.startsWith('la') ? 'conservée' : 'conservé'}.`
  return {
    enonce,
    etapes: [
      {
        consigne:
          'Déterminer la matrice carrée $M$ telle que, pour tout entier naturel $n$, $U_{n+1}=MU_n$.',
        correction: correctionM,
        champs: [{ nom: 'M', reponse: M, points: 2 }],
      },
    ],
    cle: ['evolution', contexte.id, ...pourcentages.flat()].join('|'),
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

/**
 * Énoncé, champs de réponse et correction d'une situation. Les champs sont
 * numérotés à partir de `premierChamp` ; renvoie aussi le nombre de champs utilisés.
 */
function assembler(
  exercice: IExercice,
  premierChamp: number,
  situation: Situation,
): { texte: string; texteCorr: string; nbChamps: number } {
  const nbChamps = situation.etapes.reduce((s, e) => s + e.champs.length, 0)
  let texte = situation.enonce
  if (exercice.interactif) {
    texte += `<br>Saisir ${nbChamps > 1 ? 'les matrices' : 'la matrice'} à l'aide de la touche «${sp()}Matrice${sp()}».`
  }
  let texteCorr = ''
  let champ = premierChamp
  const numeroter = situation.etapes.length > 1
  situation.etapes.forEach((etape, k) => {
    const numero = numeroter ? numAlpha(k) : ''
    texte += `<br>${numero}${etape.consigne}`
    texteCorr += `${k > 0 ? '<br>' : ''}${numero}${etape.correction}`
    for (const { nom, reponse, points = 1 } of etape.champs) {
      if (exercice.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            exercice,
            champ,
            KeyboardType.clavierMatrice,
            { texteAvant: `$${nom}=$` },
          )
      }
      handleAnswers(exercice, champ, {
        ...(points > 1
          ? {
              bareme: (l: number[]): [number, number] => [
                points * l[0],
                points,
              ],
            }
          : {}),
        reponse: { value: reponse, compare: matriceCompare },
      })
      champ++
    }
  })
  return { texte, texteCorr, nbChamps }
}

export default class ModeliserParUneMatrice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Situations',
      'Nombres séparés par des tirets :\n1 : Tableau à double entrée\n2 : Problème à inconnues\n3 : Évolution entre plusieurs lieux\n4 : Interpolation (affine ou 2nd degré)\n5 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Taille (objets, inconnues ou lieux)',
      3,
      '1 : Deux\n2 : Trois\n3 : Mélange',
    ]
    this.sup = '5'
    this.sup2 = 3
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
    }).map(Number)
    const tailles = combinaisonListes(
      this.sup2 === 3 ? [2, 3] : [this.sup2 + 1],
      this.nbQuestions,
    )
    const suivantTableau = serieDeContextes(contextesTableau)
    const suivantProbleme = serieDeContextes(
      contextesTableau.filter((c) => c.systeme != null),
    )
    const suivantEvolution = serieDeContextes(contextesEvolution)
    const suivantInterpolation = serieDeContextes(
      contextesInterpolation,
      (c, p) => c.p === p,
    )
    let indiceChamp = 0
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const p = tailles[i]
      const type = typesDeQuestions[i]
      const situation =
        type === 1
          ? premiereSituation(suivantTableau, p, (c) => situationTableau(p, c))
          : type === 2
            ? premiereSituation(suivantProbleme, p, (c) =>
                situationProbleme(p, c),
              )
            : type === 3
              ? premiereSituation(suivantEvolution, p, (c) =>
                  situationEvolution(p, c),
                )
              : premiereSituation(suivantInterpolation, p, (c) =>
                  situationInterpolation(c),
                )
      if (situation == null || !this.questionJamaisPosee(i, situation.cle)) {
        continue
      }
      const { texte, texteCorr, nbChamps } = assembler(
        this,
        indiceChamp,
        situation,
      )
      indiceChamp += nbChamps
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
