import { describe, expect, it } from 'vitest'
import {
  decodeQuizzParams,
  defaultQuizzParams,
  encodeQuizzParams,
  QUIZZ_MAX_COOLDOWN,
  QUIZZ_MAX_TIME,
  QUIZZ_MIN_TIME,
  timeForExercise,
} from '../../src/lib/quizz/quizzParams'
import type { QuizzParams } from '../../src/modules/quizz/types'

describe('codec quizzParam', () => {
  it('encode puis décode à l’identique (aller-retour)', () => {
    const params: QuizzParams = {
      v: 1,
      mode: 'multi',
      scoring: 'simple',
      seedMode: 'random',
      background: { mode: 'fixed', image: 'plage.jpg' },
      sound: false,
      cooldown: 8,
      times: [30, 15],
      usernameMode: 'safe',
    }
    expect(decodeQuizzParams(encodeQuizzParams(params))).toEqual(params)
  })

  it('usernameMode vaut free par défaut et résiste aux valeurs invalides', () => {
    expect(defaultQuizzParams().usernameMode).toBe('free')
    const lienSansChamp = encodeQuizzParams({
      ...defaultQuizzParams(),
      usernameMode: 'free',
    })
    delete (JSON.parse(atob(lienSansChamp)) as Record<string, unknown>)
      .usernameMode
    expect(decodeQuizzParams(lienSansChamp).usernameMode).toBe('free')
  })

  it('renvoie les valeurs par défaut sans paramètre', () => {
    expect(decodeQuizzParams(undefined)).toEqual(defaultQuizzParams())
    expect(decodeQuizzParams('')).toEqual(defaultQuizzParams())
  })

  it('renvoie les valeurs par défaut sur un blob corrompu', () => {
    expect(decodeQuizzParams('ceci-n-est-pas-du-base64!!!')).toEqual(
      defaultQuizzParams(),
    )
    expect(decodeQuizzParams(btoa('{"mode":42}'))).toEqual(defaultQuizzParams())
  })

  it('conserve les champs valides et borne les valeurs aberrantes', () => {
    const blob = btoa(
      JSON.stringify({
        mode: 'projection',
        scoring: 'none',
        cooldown: 99,
        times: [1, 999],
        background: { mode: 'random' },
      }),
    )
    const params = decodeQuizzParams(blob)
    expect(params.mode).toBe('projection')
    expect(params.scoring).toBe('none')
    expect(params.cooldown).toBe(QUIZZ_MAX_COOLDOWN)
    expect(params.times[0]).toBe(QUIZZ_MIN_TIME)
    expect(params.times[1]).toBe(QUIZZ_MAX_TIME)
    expect(params.background.mode).toBe('random')
  })

  it('timeForExercise replie sur la valeur par défaut', () => {
    const params = defaultQuizzParams()
    params.times = [30]
    expect(timeForExercise(params, 0)).toBe(30)
    expect(timeForExercise(params, 1)).toBe(20)
  })
})
