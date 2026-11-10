import { afterEach, describe, expect, it } from 'vitest'
import { get } from 'svelte/store'
import { canOptions } from '../stores/canStore'
import { globalOptions } from '../stores/globalOptions'
import { exercicesParams } from '../stores/generalStore'
import {
  appendExerciseParams,
  buildMathAleaURL,
  buildCapytalePreviewURL,
  buildSingleExerciseURL,
  encrypt,
} from './urls'

const seriesUrl =
  'https://coopmaths.fr/alea/?uuid=aaa&id=3L11&n=4&s=2&alea=Xy12&i=1' +
  '&uuid=bbb&id=6N1E&n=5&s=1&s2=3&alea=Ab34&cd=1' +
  '&v=eleve&es=0211001&title=Test&select=0-1&order=1-0&answers=zzz&done=1&z=1.2'

describe('buildSingleExerciseURL', () => {
  const url = buildSingleExerciseURL(new URL(seriesUrl), {
    uuid: 'bbb',
    id: '6N1E',
    nbQuestions: 5,
    sup: '1',
    sup2: '3',
    alea: 'Ab34',
    cd: '1',
  })

  it('ne conserve que l’exercice fourni avec sa graine et ses options', () => {
    expect(url.searchParams.getAll('uuid')).toEqual(['bbb'])
    expect(url.searchParams.getAll('alea')).toEqual(['Ab34'])
    expect(url.searchParams.get('n')).toBe('5')
    expect(url.searchParams.get('s')).toBe('1')
    expect(url.searchParams.get('s2')).toBe('3')
    expect(url.searchParams.get('cd')).toBe('1')
    expect(url.searchParams.has('i')).toBe(false)
  })

  it('place l’exercice en tête et garde les réglages globaux', () => {
    expect([...url.searchParams.keys()][0]).toBe('uuid')
    expect(url.searchParams.get('v')).toBe('eleve')
    expect(url.searchParams.get('es')).toBe('0211001')
    expect(url.searchParams.get('z')).toBe('1.2')
    expect(url.searchParams.get('title')).toBe('Test')
  })

  it('retire les paramètres liés à la série complète', () => {
    for (const param of ['select', 'order', 'answers', 'done']) {
      expect(url.searchParams.has(param)).toBe(false)
    }
  })

  it('décrypte une URL cryptée', () => {
    const fromCrypted = buildSingleExerciseURL(new URL(encrypt(seriesUrl)), {
      uuid: 'aaa',
      alea: 'Xy12',
    })
    expect(fromCrypted.searchParams.getAll('uuid')).toEqual(['aaa'])
    expect(fromCrypted.searchParams.get('v')).toBe('eleve')
  })
})

describe('calculatrices autorisées (calc)', () => {
  it('n’alourdit pas l’URL par défaut', () => {
    const url = new URL('https://coopmaths.fr/alea/')
    appendExerciseParams(url, { uuid: 'aaa', calc: '0' })
    expect(url.searchParams.has('calc')).toBe(false)
  })

  it.each(['1', '2', '3', '9'] as const)(
    'conserve calc=%s, y compris pour un exercice isolé',
    (calc) => {
      const url = new URL('https://coopmaths.fr/alea/')
      appendExerciseParams(url, { uuid: 'aaa', calc })
      expect(url.searchParams.get('calc')).toBe(calc)
      const single = buildSingleExerciseURL(
        new URL(
          `https://coopmaths.fr/alea/?uuid=aaa&calc=${calc}&uuid=bbb&v=eleve`,
        ),
        { uuid: 'bbb' },
      )
      expect(single.searchParams.has('calc')).toBe(false)
    },
  )
})

describe('buildMathAleaURL en vue can', () => {
  const defaultOptions = { ...get(canOptions) }
  afterEach(() => canOptions.set(defaultOptions))

  it('n’ajoute ni canQ ni canFB par défaut (chronomètre global, feedback à la fin)', () => {
    const url = buildMathAleaURL({ view: 'can' })
    expect(url.searchParams.has('canQ')).toBe(false)
    expect(url.searchParams.has('canFB')).toBe(false)
  })

  it('transmet la durée par question et le feedback après chaque question', () => {
    canOptions.update((options) => ({
      ...options,
      timerMode: 'question',
      durationPerQuestionInSeconds: 20,
      feedbackMode: 'each',
    }))
    const url = buildMathAleaURL({ view: 'can' })
    expect(url.searchParams.get('canQ')).toBe('20')
    expect(url.searchParams.get('canFB')).toBe('1')
  })
})

describe('aperçu Capytale', () => {
  const defaultGlobal = { ...get(globalOptions) }
  const defaultCan = { ...get(canOptions) }
  const defaultExercises = get(exercicesParams)
  afterEach(() => {
    globalOptions.set(defaultGlobal)
    canOptions.set(defaultCan)
    exercicesParams.set(defaultExercises)
  })

  it('verrouille l’interactivité et transmet le barème sans modifier les stores', () => {
    globalOptions.update((options) => ({
      ...options,
      setInteractive: '1',
      isInteractiveFree: true,
    }))
    exercicesParams.set([
      { uuid: 'aaa', coeffBareme: 3, alea: 'abcd', interactif: '1' },
    ])
    globalOptions.update((options) => ({ ...options, isDataRandom: false }))
    const url = buildCapytalePreviewURL('eleve')
    expect(url.searchParams.get('es')?.[3]).toBe('0')
    expect(url.searchParams.get('coef')).toBe('3')
    expect(url.searchParams.get('alea')).toBe('abcd')
    expect(url.searchParams.has('recorder')).toBe(false)
    expect(get(globalOptions).isInteractiveFree).toBe(true)
  })

  it('retire la graine si les données sont différentes pour chaque élève', () => {
    exercicesParams.set([{ uuid: 'aaa', alea: 'abcd' }])
    for (const isDataRandom of [true, undefined]) {
      globalOptions.update((options) => ({ ...options, isDataRandom }))
      for (const view of ['eleve', 'can'] as const) {
        expect(buildCapytalePreviewURL(view).searchParams.has('alea')).toBe(
          false,
        )
      }
    }
    expect(get(exercicesParams)[0].alea).toBe('abcd')
  })

  it('conserve la graine si tous les élèves ont les mêmes données', () => {
    exercicesParams.set([{ uuid: 'aaa', alea: 'abcd' }])
    globalOptions.update((options) => ({ ...options, isDataRandom: false }))
    expect(buildCapytalePreviewURL('eleve').searchParams.get('alea')).toBe(
      'abcd',
    )
  })

  it('reprend le feedback, le chronomètre et l’interactivité globale de la CAN', () => {
    globalOptions.update((options) => ({ ...options, setInteractive: '1' }))
    canOptions.update((options) => ({
      ...options,
      isInteractive: false,
      feedbackMode: 'each',
      timerMode: 'question',
      durationPerQuestionInSeconds: 25,
      isTimerDisabled: true,
    }))
    const url = buildCapytalePreviewURL('can')
    expect(url.searchParams.get('canI')).toBe('1')
    expect(url.searchParams.get('canFB')).toBe('1')
    expect(url.searchParams.get('canQ')).toBe('25')
    expect(url.searchParams.get('canNC')).toBe('1')
  })
})
