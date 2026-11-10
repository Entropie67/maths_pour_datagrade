import type {
  QuizzBackgroundMode,
  QuizzMode,
  QuizzParams,
  QuizzScoring,
  QuizzSeedMode,
  QuizzUsernameMode,
} from '../../modules/quizz/types'
import {
  decodeBase64,
  encodeBase64,
} from '../../components/setup/latex/LatexConfig'

export const QUIZZ_DEFAULT_COOLDOWN = 5
export const QUIZZ_DEFAULT_TIME = 20
export const QUIZZ_MIN_TIME = 5
export const QUIZZ_MAX_TIME = 120
export const QUIZZ_MIN_COOLDOWN = 3
export const QUIZZ_MAX_COOLDOWN = 15

/**
 * Paramètres par défaut du quizz (mode solo, score complet, graines figées,
 * pas de fond, sons activés, cooldown de 5 s).
 */
export function defaultQuizzParams(): QuizzParams {
  return {
    v: 1,
    mode: 'solo',
    scoring: 'full',
    seedMode: 'fixed',
    background: { mode: 'none' },
    sound: true,
    cooldown: QUIZZ_DEFAULT_COOLDOWN,
    times: [],
    usernameMode: 'free',
  }
}

function contraindreEntier(
  valeur: unknown,
  min: number,
  max: number,
  defaut: number,
): number {
  const n = typeof valeur === 'number' ? Math.round(valeur) : NaN
  if (Number.isNaN(n)) return defaut
  return Math.min(max, Math.max(min, n))
}

function estMode(valeur: unknown): valeur is QuizzMode {
  return valeur === 'solo' || valeur === 'projection' || valeur === 'multi'
}

function estScoring(valeur: unknown): valeur is QuizzScoring {
  return valeur === 'full' || valeur === 'simple' || valeur === 'none'
}

function estSeedMode(valeur: unknown): valeur is QuizzSeedMode {
  return valeur === 'fixed' || valeur === 'random'
}

function estBackgroundMode(valeur: unknown): valeur is QuizzBackgroundMode {
  return valeur === 'none' || valeur === 'fixed' || valeur === 'random'
}

function estUsernameMode(valeur: unknown): valeur is QuizzUsernameMode {
  return valeur === 'free' || valeur === 'safe'
}

/**
 * Encode les paramètres du quizz en base64 pour le paramètre d'URL `quizzParam`.
 */
export function encodeQuizzParams(params: QuizzParams): string {
  return encodeBase64(params)
}

/**
 * Décode le paramètre d'URL `quizzParam`.
 * Validation défensive : toute valeur absente ou invalide est remplacée par
 * sa valeur par défaut, afin qu'un lien ancien ou corrompu reste utilisable.
 */
export function decodeQuizzParams(raw: string | undefined | null): QuizzParams {
  const params = defaultQuizzParams()
  if (raw == null || raw.length === 0) return params
  const data: unknown = decodeBase64(raw)
  if (typeof data !== 'object' || data === null) return params
  const source = data as Record<string, unknown>
  if (estMode(source.mode)) params.mode = source.mode
  if (estScoring(source.scoring)) params.scoring = source.scoring
  if (estSeedMode(source.seedMode)) params.seedMode = source.seedMode
  if (typeof source.sound === 'boolean') params.sound = source.sound
  if (estUsernameMode(source.usernameMode)) {
    params.usernameMode = source.usernameMode
  }
  params.cooldown = contraindreEntier(
    source.cooldown,
    QUIZZ_MIN_COOLDOWN,
    QUIZZ_MAX_COOLDOWN,
    QUIZZ_DEFAULT_COOLDOWN,
  )
  if (Array.isArray(source.times)) {
    params.times = source.times.map((t) =>
      contraindreEntier(t, QUIZZ_MIN_TIME, QUIZZ_MAX_TIME, QUIZZ_DEFAULT_TIME),
    )
  }
  if (typeof source.background === 'object' && source.background !== null) {
    const bg = source.background as Record<string, unknown>
    if (estBackgroundMode(bg.mode)) {
      params.background = { mode: bg.mode }
      if (typeof bg.image === 'string' && bg.image.length > 0) {
        params.background.image = bg.image
      }
    }
  }
  return params
}

/**
 * Temps de réponse (en secondes) pour l'exercice d'indice donné,
 * avec repli sur la valeur par défaut.
 */
export function timeForExercise(params: QuizzParams, index: number): number {
  const t = params.times[index]
  return typeof t === 'number' && t >= QUIZZ_MIN_TIME ? t : QUIZZ_DEFAULT_TIME
}
