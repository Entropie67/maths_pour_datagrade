// printPrettier pose problème avec begin{aligned}[t] en ajoutant un saut de ligne problématique
// import { printPrettier } from 'prettier-plugin-latex/standalone.js'
export interface Exo {
  content?: string
  serie?: string
  month?: string
  year?: string
  zone?: string
  title?: string
}

export interface picFile {
  name: string
  format: string
}

export type ExerciceConfig = {
  points: number
}

export type ExamConfig = {
  type: string
  titre: string
  session: string
  matiere: string
  duree: string
  autorisation: string
  exercices?: ExerciceConfig[]
}

/**
 * Polices proposées par la vue LaTeX. `Defaut` laisse l'habillage choisir
 * (Helvetica en police standard, Fira en police adaptée aux dys).
 */
export type FontFamily = 'Defaut' | 'Fira' | 'lmodern' | 'tgheros'

/** Marges de la page, en centimètres */
export interface PageMargins {
  left: number
  right: number
  top: number
  bottom: number
}

/**
 * Mise en page d'un exercice, réglable indépendamment des autres.
 *
 * Ces réglages sont portés par `LatexFileInfos.exos`, indexé par la
 * **position** de l'exercice dans la fiche (0-based, en chaîne) : déplacer ou
 * supprimer un exercice décale donc les réglages des suivants.
 */
export interface ExerciceLayoutConfig {
  /** Numérotation des questions (`\alph*)`, `\Roman*)`…) */
  labels?: string
  /** Espacement entre deux questions, en em */
  itemsep?: number
  /** Colonnes de l'énoncé */
  cols?: number
  /** Colonnes de la correction */
  cols_corr?: number
  /** Lignes à écrire ajoutées après chaque question (réglage de la vue PDF) */
  blocrep?: { nbligs: number; nbcols: number }
  /** Interligne de l'exercice (1 = interligne simple) */
  baselinestretch?: number
  /**
   * L'exercice tient d'un seul tenant : plutôt que d'être coupé, il passe en
   * entier à la page suivante. Sans effet en habillage ProfMaquette, dont les
   * cadres imposent leur propre découpe.
   */
  unbreakable?: boolean
  /** Lignes à écrire, en fin d'exercice ou après chaque question */
  writingLines?: { position: 'fin' | 'question'; count: number }
  /** Saut de page avant l'exercice */
  pageBreakBefore?: boolean
  /** Saut de colonne avant l'exercice */
  columnBreakBefore?: boolean
  /**
   * L'exercice prolonge le précédent au lieu d'ouvrir son propre cadre.
   * Sans effet en habillage ProfMaquette, qui a son propre regroupement
   * (`exosGrouping`).
   */
  mergeWithPrevious?: boolean
}

export interface LatexFileInfos {
  title: string
  reference: string
  withReferences?: boolean
  subtitle: string
  /** Marges de la page ; absentes, celles de l'habillage s'appliquent */
  margins?: PageMargins
  /** Nombre de colonnes de la fiche entière (1 : pas de multicolonnes) */
  globalColumns?: number
  /** Convertit toutes les couleurs en niveaux de gris (impression N&B) */
  blackAndWhite?: boolean
  /** Police du document ; `Defaut` laisse l'habillage décider */
  fontFamily?: FontFamily
  /**
   * Affiche le numéro de version dans l'en-tête. Par défaut, seulement
   * quand la fiche compte plusieurs versions.
   */
  showVersionInHeader?: boolean
  dysTailleFontOption: number
  tailleFontOption: number
  durationCanOption: string
  titleOption: string
  style:
    | 'Coopmaths'
    | 'Classique'
    | 'ProfMaquette'
    | 'ProfMaquetteQrcode'
    | 'Can'
  modele?: 'Brevet' | 'Bac' | 'DS' | 'aucun'
  nbVersions: number
  fontOption: 'StandardFont' | 'DysFont'
  correctionOption: 'AvecCorrection' | 'SansCorrection'
  qrcodeOption: 'AvecQrcode' | 'SansQrcode'
  typeFiche: 'Fiche' | 'Eval'
  exos?: { [key: string]: ExerciceLayoutConfig }
  exosGrouping?: string
  examConfig?: ExamConfig
  signal?: AbortSignal | undefined
}

export interface contentsType {
  preamble: string
  intro: string
  content: string
  contentCorr: string
}

export interface latexFileType {
  contents: contentsType
  latexWithoutPreamble: string
  latexWithPreamble: string
}
export interface ExoContent {
  content?: string
  contentCorr?: string
  serie?: string
  month?: string
  year?: string
  zone?: string
  title?: string
}
