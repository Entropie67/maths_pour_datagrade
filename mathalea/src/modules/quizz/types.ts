/**
 * Types du moteur de quizz MathALÉA.
 *
 * Adaptés de la plateforme Razzia (https://github.com/Ralex91/Razzia)
 * — licence MIT, Copyright (c) 2024 Ralex (voir NOTICE à la racine).
 * Les noms de statuts et les charges utiles reprennent le protocole de Razzia
 * afin de rester compatibles avec une future version multi-joueurs temps réel.
 *
 * Extensions propres à MathALÉA :
 * - chaque question embarque sa `correction` (HTML) et la référence de
 *   l'exercice source (`sourceRef`) ;
 * - les paramètres du quizz (`QuizzParams`) ajoutent mode de jeu, mode de
 *   score, gestion des graines et fond d'écran.
 */

export const QUIZZ_STATUS = {
  SHOW_ROOM: 'SHOW_ROOM',
  SHOW_START: 'SHOW_START',
  SHOW_PREPARED: 'SHOW_PREPARED',
  SHOW_QUESTION: 'SHOW_QUESTION',
  SELECT_ANSWER: 'SELECT_ANSWER',
  SHOW_RESULT: 'SHOW_RESULT',
  SHOW_RESPONSES: 'SHOW_RESPONSES',
  SHOW_LEADERBOARD: 'SHOW_LEADERBOARD',
  FINISHED: 'FINISHED',
  WAIT: 'WAIT',
} as const

export type QuizzStatus = (typeof QUIZZ_STATUS)[keyof typeof QUIZZ_STATUS]

/**
 * Événements annexes véhiculés par le transport (hors changements de statut).
 * Mêmes noms que chez Razzia.
 */
export const QUIZZ_EVENTS = {
  STATUS: 'game:status',
  COOLDOWN: 'game:cooldown',
  START_COOLDOWN: 'game:startCooldown',
  UPDATE_QUESTION: 'game:updateQuestion',
  PLAYER_ANSWER: 'game:playerAnswer',
  ERROR_MESSAGE: 'game:errorMessage',
} as const

/** Question à une seule bonne réponse ('single') ou plusieurs ('multi'). */
export type QuizzQuestionType = 'single' | 'multi'

/** Mode de score choisi par le concepteur du quizz. */
export type QuizzScoring = 'full' | 'simple' | 'none'

/** Mode de jeu : solo, projection, ou multi-joueurs temps réel (V2). */
export type QuizzMode = 'solo' | 'projection' | 'multi'

/** Rôle d'un client en mode multi-joueurs (V2). */
export type QuizzRole = 'manager' | 'player'

/** Graines figées dans le lien ('fixed') ou tirées à chaque ouverture ('random'). */
export type QuizzSeedMode = 'fixed' | 'random'

export type QuizzBackgroundMode = 'none' | 'fixed' | 'random'

/** Modes de notation des questions multi-réponses (repris de Razzia). */
export type QuizzMultiScoringMode = 'strict' | 'balanced' | 'lenient'

/**
 * Mode d'attribution des pseudos (multi-joueurs) : 'free' — l'élève saisit
 * le pseudo de son choix ; 'safe' — le pseudo doit être un prénom de la
 * liste autorisée, vérifié par le serveur de jeu (qui enregistre la forme
 * canonique de la liste et suffixe les homonymes d'un numéro).
 */
export type QuizzUsernameMode = 'free' | 'safe'

export interface QuizzBackgroundParam {
  mode: QuizzBackgroundMode
  /** Nom du fichier dans public/images/quizz/backgrounds/ (mode 'fixed'). */
  image?: string
}

/**
 * Contenu du paramètre d'URL `quizzParam` (JSON encodé en base64).
 * `v` permet de faire évoluer le format sans casser les liens existants.
 */
export interface QuizzParams {
  v: 1
  mode: QuizzMode
  scoring: QuizzScoring
  seedMode: QuizzSeedMode
  background: QuizzBackgroundParam
  sound: boolean
  /** Durée d'affichage de l'énoncé seul, en secondes (3-15, défaut 5). */
  cooldown: number
  /** Temps de réponse par exercice de la sélection, en secondes (défaut 20). */
  times: number[]
  /** Mode d'attribution des pseudos en multi-joueurs (défaut 'free'). */
  usernameMode: QuizzUsernameMode
}

export interface QuizzQuestion {
  type: QuizzQuestionType
  /** Énoncé en HTML (KaTeX inclus), construit comme le contenu d'un exercice. */
  question: string
  /** Propositions en HTML, dans l'ordre d'affichage (déjà mélangé). 2 à 4. */
  answers: string[]
  /** Indices (0-based) des bonnes réponses. */
  solutions: number[]
  /** Correction détaillée en HTML (raisonnement), affichée à la révélation. */
  correction: string
  cooldown: number
  time: number
  maxPoints?: number
  penalty?: number
  /** Référence de l'exercice MathALÉA source (ex. '1A-C01-3'). */
  sourceRef?: string
}

export interface Quizz {
  subject: string
  questions: QuizzQuestion[]
}

export interface QuizzPlayer {
  id: string
  username: string
  points: number
  streak: number
}

export interface QuizzAnswer {
  playerId: string
  answerIds: number[]
  /** Points acquis au moment de la réponse (pondérés par la rapidité). */
  points: number
}

/**
 * Charges utiles par statut : fusion des payloads « joueur » et « manager »
 * de Razzia (les deux rôles partagent le même écran en V1), augmentées de la
 * correction MathALÉA et du mode de score pour l'affichage.
 */
export interface QuizzStatusDataMap {
  SHOW_ROOM: { text: string; inviteCode?: string; players: QuizzPlayer[] }
  SHOW_START: { time: number; subject: string }
  SHOW_PREPARED: { totalAnswers: number; questionNumber: number }
  SHOW_QUESTION: { question: string; cooldown: number }
  SELECT_ANSWER: {
    question: string
    answers: string[]
    time: number
    totalPlayer: number
    questionType: QuizzQuestionType
  }
  SHOW_RESULT: {
    correct: boolean
    message: string
    /** Points gagnés (ou perdus) sur la question. */
    points: number
    /** Total du joueur après la question. */
    myPoints: number
    rank: number
    aheadOfMe: string | null
    correction: string
    solutions: number[]
    answers: string[]
    /** Indices choisis par le joueur local (null si pas de réponse). */
    selected: number[] | null
    scoring: QuizzScoring
  }
  SHOW_RESPONSES: {
    question: string
    responses: Record<number, number>
    solutions: number[]
    answers: string[]
    correction: string
    /**
     * Indices choisis par le joueur local (la classe en projection) —
     * toujours null en multi-joueurs : il n'y a pas de joueur local et la
     * réponse d'un élève précis ne doit pas ressortir à la révélation.
     */
    selected: number[] | null
    scoring: QuizzScoring
  }
  SHOW_LEADERBOARD: {
    oldLeaderboard: QuizzPlayer[]
    leaderboard: QuizzPlayer[]
  }
  FINISHED: {
    subject: string
    top: QuizzPlayer[]
    rank?: number
    myPoints?: number
    scoring: QuizzScoring
  }
  WAIT: { text: string }
}

export interface QuizzUpdateQuestion {
  current: number
  total: number
}
