/**
 * Parcours de l'application MathALÉA (mathalea-mobile) : format du fichier
 * `parcours-mathalea-<date>.json` que l'enseignant dépose dans un dossier
 * partagé et que les applications des élèves lisent. Les clés du JSON sont
 * celles de l'application : elles ne se traduisent pas.
 */

/** Mêmes valeurs que le presMode de MathALÉA */
export type Presentation =
  'une_question_par_page' | 'un_exo_par_page' | 'liste_exos'

/** Validation (et correction) après chaque question, page, ou à la fin du parcours */
export type Validation = 'question' | 'page' | 'parcours'

export interface Step {
  uuid: string
  id?: string
  titre: string // titre vu par l'élève : celui de MathALÉA par défaut
  titreMasque?: boolean // l'élève voit « Exercice n »
  nbQuestions?: number
  sup?: string
  sup2?: string
  sup3?: string
  sup4?: string
  sup5?: string
  objectifs?: string[] // libellés des objectifs visés
  cle?: string // identifiant stable dans un salon (retiré à la publication)
}

/** Accès à un palier : toujours ouvert, ou à partir d'une réussite au palier précédent */
export type Access = 'libre' | 'seuil'

export interface Resource {
  titre: string
  lien: string // PDF, vidéo… partagés par lien
}

export interface Pause {
  texte: string // point de cours, consigne, encouragement
  ressource?: Resource
}

/**
 * Fiche de cours, lue dans l'application avant de s'entraîner (d'office la
 * première fois avec `avant`). Le site n'en garde aucune : il sert à les
 * écrire, dans un parcours ou dans un fichier `fiche-<titre>.json`.
 */
export interface Lesson {
  titre: string
  avant?: boolean // montrée d'office avant la première séance du palier (ou du parcours)
  blocs: LessonBlock[]
}

/**
 * Blocs d'une fiche. Les textes acceptent **gras**, *italique*, les listes
 * (lignes « - ») et les formules LaTeX entre $ ou $$.
 */
export type LessonBlock = LessonBlockContent & {
  cle?: string // identifiant stable dans un salon (retiré à la publication)
}
type LessonBlockContent =
  | { type: 'texte'; texte: string }
  | { type: 'retenir'; titre?: string; texte: string } // encadré « À retenir »
  | { type: 'exemple'; titre?: string; enonce: string; etapes: string[] } // étapes dévoilées une à une
  | {
      type: 'question' // non notée
      enonce: string
      choix?: string[]
      bonne?: number // rang de la bonne réponse parmi les choix
      reponse?: number // réponse numérique, sans choix
      explication: string
    }
  | ({ type: 'graphique' } & LessonGraph)
  | { type: 'image'; src: string; alt: string; legende?: string } // data: (SVG, PNG, JPEG, WebP)
  | { type: 'lien'; titre: string; lien: string } // PDF, vidéo… ouvert hors de l'application

export type LessonBlockType = LessonBlock['type']

/** Graphique tracé par l'application : courbes, aire ombrée, curseurs */
export interface LessonGraph {
  fonctions: string[] // expressions en x et en noms de curseurs : « x^2/4+1/2 », « a*sin(x) »
  x: [number, number]
  y: [number, number]
  aire?: {
    fonction?: number // rang dans fonctions
    entre?: number // aire entre deux courbes
    de: number | string // nombre ou nom de curseur
    a: number | string
  }
  curseurs?: Record<string, Slider>
  valeur?: boolean // affiche la valeur de l'intégrale
  legende?: string
  styles?: CurveStyle[] // dans l'ordre des fonctions (absent : plein, bleu puis orange)
  points?: GraphPoint[]
  textes?: GraphText[]
}

/** Couleurs de MathALÉA proposées dans les graphiques */
export const GRAPH_COLORS = ['bleu', 'orange', 'vert', 'gris'] as const
export type GraphColor = (typeof GRAPH_COLORS)[number]
export const LINE_STYLES = ['plein', 'tirets', 'pointilles'] as const
export const POINT_SHAPES = ['plein', 'vide', 'croix'] as const

export interface CurveStyle {
  trait?: (typeof LINE_STYLES)[number]
  couleur?: GraphColor
}

/** Coordonnée : nombre ou nom de curseur (le point suit alors le curseur) */
export type Coordinate = number | string

/** Point : y donné, ou sur la courbe `sur` (rang dans fonctions) */
export interface GraphPoint {
  x: Coordinate
  y?: Coordinate
  sur?: number
  forme?: (typeof POINT_SHAPES)[number] // plein par défaut
  couleur?: GraphColor
  nom?: string // « A », formule acceptée entre $
  coordonnees?: boolean // affiche (x ; y) à côté du point
}

/** Texte posé dans le repère, centré sur (x ; y) ; formules entre $ */
export interface GraphText {
  x: Coordinate
  y: Coordinate
  texte: string
  couleur?: GraphColor
}

/** Curseur : min, max, valeur de départ, pas (facultatif) */
export type Slider = [number, number, number] | [number, number, number, number]

/** Palier : exercices consécutifs du parcours (les anciennes applications les ignorent) */
export interface Level {
  titre: string
  nb: number
  acces?: Access
  seuil?: number // pourcentage à atteindre au palier précédent
  ouverture?: string // instant d'ouverture (8 h du jour choisi, avec le décalage horaire) ; fermé avant
  ressource?: Resource // pour revoir la notion
  pause?: Pause // affichée après le palier
  fiche?: Lesson // cours du palier
}

export interface Parcours {
  id: string
  version: number
  titre: string
  objectif: string // but du parcours, vu par l'élève
  auteurs?: string[] // personnes qui ont rédigé le parcours
  descriptionEleves?: string // présentation montrée aux élèves
  descriptionEnseignant?: string // note pour les collègues : usage, prérequis, déroulé
  niveau: string
  theme: string // chapitre
  difficulte: 1 | 2 | 3
  icone: string
  presentation: Presentation
  correction: Validation
  etapes: Step[]
  paliers?: Level[]
  style?: LevelStyle // présentation des paliers aux élèves
  premiereCeinture?: number // rang dans BELTS de la première ceinture (0 : blanche)
  enTetesMasques?: boolean // ni numéro ni titre d'exercice : les questions s'enchaînent
  melanger?: boolean // questions des exercices mélangées (sans effet avec un exercice par page)
  fiche?: Lesson // cours d'un parcours sans paliers (sinon compte pour le premier palier)
}

/** Paliers numérotés, ou ceintures comme au judo (blanche, jaune…) */
export type LevelStyle = 'paliers' | 'ceintures'

/** Ceintures dans l'ordre ; au-delà de la noire, des dan */
export const BELTS = [
  { nom: 'blanche', couleur: '#f5f5f4' },
  { nom: 'jaune', couleur: '#facc15' },
  { nom: 'orange', couleur: '#f97316' },
  { nom: 'verte', couleur: '#16a34a' },
  { nom: 'bleue', couleur: '#2563eb' },
  { nom: 'marron', couleur: '#78350f' },
  { nom: 'noire', couleur: '#1c1917' },
] as const

type BeltOptions = Pick<Parcours, 'style' | 'premiereCeinture'>
const beltRank = (p: BeltOptions, k: number) => (p.premiereCeinture ?? 0) + k

/** Nom d'un palier selon le style : « Palier 2 » ou « Ceinture jaune » (à partir de la première ceinture choisie) */
export function levelName(p: BeltOptions, k: number) {
  if (p.style !== 'ceintures') return `Palier ${k + 1}`
  const r = beltRank(p, k)
  return r < BELTS.length
    ? `Ceinture ${BELTS[r].nom}`
    : `Ceinture noire, ${r - BELTS.length + 2}e dan`
}

export const beltColor = (p: BeltOptions, k: number) =>
  BELTS[Math.min(beltRank(p, k), BELTS.length - 1)].couleur

/** Niveaux de l'application (France), dans l'ordre */
export const LEVELS = ['6e', '5e', '4e', '3e', '2e', '1re', 'Terminale']
/** Le référentiel du site écrit « 1e » */
export const referentialLevel = (level: string) =>
  level === '1re' ? '1e' : level

export interface Objective {
  libelle: string // sert d'identifiant
  code?: string // objectif du programme (par exemple 5N2G)
  niveau: string
  theme: string
}

export const DIFFICULTIES = [
  'Découverte',
  'Entraînement',
  'Approfondissement',
] as const

export const PRESENTATION_LABELS: Record<Presentation, string> = {
  une_question_par_page: 'Une page par question',
  un_exo_par_page: 'Une page par exercice',
  liste_exos: 'Tous les exercices sur une page',
}

export const VALIDATION_LABELS: Record<Validation, string> = {
  question: 'Après chaque question',
  page: 'À la fin de chaque page',
  parcours: 'À la fin du parcours',
}

/** Libellés de validation : avec des paliers, chaque palier se fait en une séance */
export function validationLabels(
  p: Pick<Parcours, 'paliers' | 'style'>,
): Record<Validation, string> {
  const levels = (p.paliers?.length ?? 0) > 1
  return {
    ...VALIDATION_LABELS,
    parcours: !levels
      ? VALIDATION_LABELS.parcours
      : p.style === 'ceintures'
        ? 'À la fin de la ceinture'
        : 'À la fin du palier',
  }
}

export const DEFAULT_THRESHOLD = 80

/** Exercices de chaque palier ; sans paliers valides, un seul groupe */
export function levelGroups(p: Parcours): number[][] {
  const levels = p.paliers ?? []
  const valid =
    levels.length > 1 &&
    levels.reduce((a, l) => a + l.nb, 0) === p.etapes.length
  if (!valid) return [p.etapes.map((_, i) => i)]
  let start = 0
  return levels.map((l) => {
    const group = Array.from({ length: l.nb }, (_, j) => start + j)
    start += l.nb
    return group
  })
}

export function emptyParcours(defaults: Partial<Parcours> = {}): Parcours {
  return {
    id: '',
    version: 1,
    titre: '',
    objectif: '',
    niveau: '',
    theme: '',
    difficulte: 1,
    icone: 'bx-book-content',
    presentation: 'une_question_par_page',
    correction: 'question',
    // Comme dans l'application : questions enchaînées, ordre mélangé
    enTetesMasques: true,
    melanger: true,
    etapes: [],
    ...defaults,
  }
}

/** Identifiant stable d'un nouveau parcours, tiré de son titre */
export function parcoursId(title: string) {
  const base = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return `${base || 'parcours'}-${Math.random().toString(36).slice(2, 7)}`
}

/** Icônes proposées pour un parcours (boxicons du site) */
export const ICONS = [
  { icon: 'bx-calculator', nom: 'Calcul' },
  { icon: 'bx-math', nom: 'Algèbre' },
  { icon: 'bx-shape-triangle', nom: 'Géométrie' },
  { icon: 'bx-shape-circle', nom: 'Cercle' },
  { icon: 'bx-ruler', nom: 'Mesures' },
  { icon: 'bx-cube', nom: 'Espace' },
  { icon: 'bx-line-chart', nom: 'Fonctions' },
  { icon: 'bx-bar-chart-alt-2', nom: 'Statistiques' },
  { icon: 'bx-dice-5', nom: 'Probabilités' },
  { icon: 'bx-transfer-alt', nom: 'Proportionnalité' },
  { icon: 'bx-code-alt', nom: 'Algorithmique' },
  { icon: 'bx-coin-stack', nom: 'Argent' },
  { icon: 'bx-timer', nom: 'Durées' },
  { icon: 'bx-brain', nom: 'Réflexion' },
  { icon: 'bx-target-lock', nom: 'Objectif' },
  { icon: 'bx-book-content', nom: 'Cours' },
] as const

const ICON_RULES: [RegExp, string][] = [
  [/probabil|hasard|aleatoire/, 'bx-dice-5'],
  [/statisti|donnee|diagramme|moyenne|mediane/, 'bx-bar-chart-alt-2'],
  [/proportion|pourcentage|echelle|vitesse|ratio/, 'bx-transfer-alt'],
  [/algorithm|programm|scratch|informatique/, 'bx-code-alt'],
  [/fonction|graphique|repere|reperage|droite gradu/, 'bx-line-chart'],
  [/espace|solide|pave|pyramide|cone|cylindre|sphere|patron/, 'bx-cube'],
  [/cercle|disque/, 'bx-shape-circle'],
  [
    /triangle|pythagore|thales|trigono|angle|geometr|parallelogramme|polygone|transformation|symetr|homothet|translation|rotation|quadrilatere/,
    'bx-shape-triangle',
  ],
  [
    /longueur|aire|perimetre|grandeur|mesure|volume|unite|conversion/,
    'bx-ruler',
  ],
  [/prix|argent|monnaie|budget/, 'bx-coin-stack'],
  [/duree|horaire|heure/, 'bx-timer'],
  [
    /litteral|equation|algebr|expression|factoris|develop|inequation/,
    'bx-math',
  ],
  [
    /relatif|nombre|calcul|operation|fraction|decima|puissance|entier|division|multipl|racine|arithmet/,
    'bx-calculator',
  ],
]

/** Icône proposée d'après le chapitre (l'enseignant peut en choisir une autre) */
export function suggestedIcon(theme: string) {
  const t = theme.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  return ICON_RULES.find(([re]) => re.test(t))?.[1] ?? 'bx-book-content'
}
