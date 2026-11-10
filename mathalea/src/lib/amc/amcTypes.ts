import type { IFractionEtendue } from '../../modules/FractionEtendue.type'
import type {
  IExercice,
  InteractivityType,
  OldFormatInteractifType,
} from '../types'
/**
 * @author Jean-claude Lhote
 */

// Nouvelles interfaces pour les exercices AMC

// Bloc QCMMult ou QCMMono
export type AutoCorrectionForQcm = {
  type: 'qcmMult' | 'qcmMono'
  enonce: string
  propositions: propositionForQcmAMC[]
  options?: OptionsForQcmAmc
  correction?: string // Correction détaillée pour l'étudiant
}

export type propositionForQcmAMC = {
  affirmation: string
  isCorrect: boolean
  baremeForThisQuestion?: number // difficile à implémenter dans l'interface où les réponses sont mélangées et cela doit traduire une volonté pédagogique en contradiction avec l'ordre aléatoire des réponses. Donc, à coder en dur dans l'exercice.
}

export type OptionsForQcmAmc = {
  ordered?: boolean
  vertical?: boolean
  lastchoice?: number
  completemulti?: boolean
  bareme?: {
    // @todo implémentation d'un barême fin via l'interface
    b?: number // points pour une bonne réponse cochée et pour une mauvaise non cochée
    m?: number // points (négatif) pour une bonne réponse non cochée ou une mauvaise cochée
    p?: number // plancher si la somme des points est inférieure à cette valeur
    P?: number // plafond si la somme des points est supérieure à cette valeur
    mz?: boolean // maximum ou zéro (pour des QcmMult) toutes les bonnes réponses doivent être cochées et aucune mauvaise cochée pour avoir les points, sinon 0
  }
  avecSymboleMult?: boolean
  multicols?: boolean // permet le multicolonne énoncé d'un côté et case à cocher en vertical dans des colonnes séparées (à implémenter)
  barreseparatrice?: boolean // Pour le multicols ci-dessus
  affirmationsMulticols?: boolean // permet le passage à plusieurs colonnes pour les affirmations (à implémenter) voir la documentation AMC à ce sujet
}

// Bloc AMCOpen
export type AutoCorrectionForAMCOpen = {
  type: 'AMCOpen'
  enonce: string
  options?: OptionsForAMCOpen
  correction?: string // Correction détaillée pour l'étudiant
}

export type OptionsForAMCOpen = {
  sansCadre?: boolean // -> variable lineup dans AMC (défaut false)
  cadreNbLines?: number // -> variable lines dans AMC (défaut 1)
  lignesEnPointillés?: boolean // -> variable dots dans AMC (défaut true)
  lineHeight?: number // -> variable lineheight dans AMC (défaut 1cm)
  bareme?: baremeForOneBox[] // non implémenté
  // @todo lister ce qu'on peut implémenter ou pas des options d'AMC pour ce type de question
}

// Bloc AMCNum
export type AutoCorrectionForAMCNum = {
  type: 'AMCNum'
  enonce: string
  reponseAttendue: AmcNumericChoice
  options?: OptionsForAMCNum
  correction?: string // Correction détaillée pour l'étudiant
}

export type OptionsForAMCNum = {
  scoring?: boolean // si true, un bareme est transmis à AMC pour la question
  scoreExact?: number // nombre de points pour la réponse exacte
  scoreApprox?: number // nombre de points pour une réponse approximative
}

export type AmcNumericChoice = {
  valeur: string // chaine de caractère correspondant à un nombre valide (voir l'inférence numérique pour AMC)
  aussiCorrect?: string // idem valeur (réponse alternative correcte tolérée)
  approx?: number // voir paramètre AMC du même nom
  exact?: number // distance maximale pour considérer la réponse comme exacte @todo à implémenter
  digits?: number // si undefined, sera inféré à partir de valeur
  decimals?: number // idem digits
  signe?: boolean // sera inféré en cas de réponse négative... C'est un paramètre qu'on peut modifié via l'UI
  exposantNbChiffres?: number // peut-être inféré ou fixé via l'UI à posteriori (pour les réponse en notation scientifique gérée par AMCNumericChoices)
  exposantSigne?: boolean // idem
  vertical?: boolean // Modifiable via l'UI
  vhead?: string // Ne fonctionne que si vertical est true. Permet d'écrire au-dessus de la colonne de  chaque série de cases à cocher un texte.
  tpoint?: string // tpoint est soit une virgule, soir une ligne séparatrice pour séparer une fraction.
  digitsNum?: number // Pourra être modifié via l'UI si undefined (inféré)
  digitsDen?: number // idem
  basePuissance?: number // @todo à implémenter côté moteur d'inférence et display UI
  exposantPuissance?: number // Si la réponse est une puissance, exposantPuissance correspond à l'exposant de la réponse
  baseNbChiffres?: number // Si la réponse est une puissance, baseNbChiffres est le nombre de chiffres sur  lequel on veut que AMC code la base @todo à implémenter
  expoNbChiffres?: number // @todo à implémenter
}
export type baremeForOneBox = {
  code: string // une simple référence pour la case
  codeString?: string // Ce qui est inscrit dans la case (insidebox) ou à côté.
  scoring: number // Combien de points rapporte la case si elle est cochée. -> bareme ou scoring dans AMC ?
}

// Bloc AMCHybride
export type AutoCorrectionForAMCHybride = {
  type: 'AMCHybride'
  enonceCommun: string
  blocs: AutoCorrectionBaseTypes[]
  options?: OptionsForAMCHybride
  correctionCommune?: string // Correction pour l'ensemble (peut être facultatif, chaque bloc apportant sa propre correction (elle aussi facultative))
}

export type TypeKeys =
  'AMCOpen' | 'AMCNum' | 'qcmMono' | 'qcmMult' | 'AMCHybride'
export type AutoCorrectionBaseTypes =
  AutoCorrectionForAMCNum | AutoCorrectionForAMCOpen | AutoCorrectionForQcm

export type OptionsForAMCHybride = {
  enonceAvant?: boolean // permet de supprimer l'énoncé commun si false
  enonceAvantUneFois?: boolean // si true, l'énoncé commun est afficher une seule fois avant le premier bloc.
  enonceCentre?: boolean // Centrage de l'énoncé commun (par défaut aligné à gauche)
  multicols?: boolean // Passage en multicols{2} si true
  multicolsAll?: boolean // Inclut l'énoncé commun dans le multicols.
}

export interface ReponseParams {
  digits?: number
  decimals?: number
  signe?: boolean
  exposantNbChiffres?: number
  exposantSigne?: boolean
  approx?: number | 'intervalleStrict'
  aussiCorrect?: number | IFractionEtendue
  digitsNum?: number
  digitsDen?: number
  basePuissance?: number
  exposantPuissance?: number
  baseNbChiffres?: number
  milieuIntervalle?: number
  formatInteractif?: InteractivityType | OldFormatInteractifType
  precision?: number
  scoreapprox?: number
  vertical?: boolean
  strict?: boolean
  vhead?: boolean
  tpoint?: string
}
export type AMCExportType =
  'qcmMono' | 'qcmMult' | 'AMCOpen' | 'AMCNum' | 'AMCHybride'

export type AMCStatut = number | boolean | string

export type AMCFractionValue = {
  num: number
  den: number
}

export type AMCReponseValue =
  | number
  | AMCFractionValue
  | {
      num?: number
      den?: number
      valeurDecimale?: number
      [key: string]: unknown
    }

export type AMCDisplayAlignment = 'flushleft' | 'center' | 'flushright'

export type AMCReponseDisplay = {
  label?: string
  labelPosition?: 'left' | 'right'
  align?: AMCDisplayAlignment
}

export type AMCQcmChoice = {
  texte?: string
  statut?: AMCStatut
  sanscadre?: boolean | number
  enonce?: string
  feedback?: string
  multicolsBegin?: boolean
  multicolsEnd?: boolean
  numQuestionVisible?: boolean
  pointilles?: boolean | number
  reponse?: {
    texte?: string
    valeur?: AMCReponseValue | AMCReponseValue[]
    alignement?: string
    param?: ReponseParams
    display?: AMCReponseDisplay
  }
}

export type AMCLayoutOptions = {
  radio?: boolean
  ordered?: boolean
  vertical?: boolean
  lastChoice?: number
  barreseparation?: boolean
  multicols?: boolean
  nbCols?: number
  multicolsAll?: boolean
  numerotationEnonce?: boolean
  avecSymboleMult?: boolean
  correction?: string
}

export type AMCUneProposition = {
  texte?: string
  statut?: AMCStatut
  sanscadre?: boolean | number
  multicolsBegin?: boolean
  multicolsEnd?: boolean
  numQuestionVisible?: boolean
  type?: string
  feedback?: string
  pointilles?: boolean | number
  enonce?: string
  propositions?: AMCQcmChoice[]
  options?: AMCLayoutOptions
  amcInterval?: {
    correct: number
    left: number
    right: number
    step: number
  }
  reponse?: {
    valeur?: AMCReponseValue | AMCReponseValue[]
    param?: ReponseParams
    display?: AMCReponseDisplay
    // Compat legacy
    textePosition?: string
    texte?: string
    alignement?: string
  }
}

export interface AutoCorrectionAMC {
  enonce?: string
  enonceAvant?: boolean
  melange?: boolean
  enonceAGauche?: boolean | [number, number]
  enonceAvantUneFois?: boolean
  enonceCentre?: boolean
  enonceApresNumQuestion?: boolean
  propositions?: AMCUneProposition[]
  reponse?: {
    valeur?: AMCReponseValue | AMCReponseValue[]
    param?: ReponseParams
    display?: AMCReponseDisplay
    // Compat legacy
    textePosition?: string
    texte?: string
    alignement?: string
  }
  options?: AMCLayoutOptions
  amcInterval?: {
    correct: number
    left: number
    right: number
    step: number
  }
}

export type QuestionAMC =
  | AutoCorrectionForQcm
  | AutoCorrectionForAMCNum
  | AutoCorrectionForAMCOpen
  | AutoCorrectionForAMCHybride

export type IExerciceAMC = Omit<IExercice, 'autoCorrectionAMC'> & {
  autoCorrectionAMC: AutoCorrectionAMC[]
  amcType?: AMCExportType | string
}

export type QuestionContext = {
  ref: string
  id: string
  exercice: any
  index: number
}

export type QuestionQcmContext = QuestionContext & {
  type: 'qcm' | 'qcmMult'
}

export type QCMProposition = {
  texte: string
  correct: boolean
}

export type QCMNormalized = {
  type: 'qcm'
  mode: 'mono' | 'mult'
  id: string
  ref: string
  enonce: string
  layout: 'reponses' | 'reponseshoriz'
  ordered: boolean
  lastChoice: number | null
  multicols?: boolean
  correction?: string
  propositions: QCMProposition[]
}

export type AMCNumBlock = {
  label?: string
  value: number
  digits: number
  decimals: number
  sign: boolean
  options?: {
    approx?: number
    exponent?: number
    exposign?: boolean
    alsocorrect?: number
    scoreapprox?: number
    strict?: boolean
    vertical?: boolean
    Tpoint?: string
  }
}

export type AMCNumNormalized = {
  ref: string
  id: string
  enonce: string
  multicols?: boolean
  display?: AMCReponseDisplay
  blocks: AMCNumBlock[]
}

export type AMCElement = {
  type: 'qcm' | 'num' | 'open'
  data: any
}

export type AMCHybrideRenderParams = {
  type?: string
  autoCorrectionItem: any
  exercice: any
  ref: string
  idExo: number
  questionIndex: number
  currentId: number
  melange: boolean
}
