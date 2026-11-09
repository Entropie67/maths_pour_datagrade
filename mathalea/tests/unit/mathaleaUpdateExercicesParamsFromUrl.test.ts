import { describe, expect, it, vi } from 'vitest'

import { get } from 'svelte/store'
import { exercicesParams, freezeUrl } from '../../src/lib/stores/generalStore'

// Mock avant l'import
vi.mock('../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked value'),
}))

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(() => 'mocked value'),
}))

describe('mathaleaUpdateExercicesParamsFromUrl', () => {
  it('utilise Tout interactif pour une nouvelle séance Capytale', async () => {
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    const result = mathaleaUpdateExercicesParamsFromUrl(
      'https://coopmaths.fr/alea/?recorder=capytale',
    )
    expect(result.setInteractive).toBe('1')
    expect(result.isInteractiveFree).toBe(false)
    const existing = mathaleaUpdateExercicesParamsFromUrl(
      'https://coopmaths.fr/alea/?recorder=capytale&es=02010011',
    )
    expect(existing.setInteractive).toBe('2')
  })

  it('reconnaît le recorder Sésathèque', async () => {
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    const result = mathaleaUpdateExercicesParamsFromUrl(
      'https://coopmaths.fr/alea/?recorder=sesatheque',
    )

    expect(result.recorder).toBe('sesatheque')
  })

  it('should accept uppercase view value for AMC', async () => {
    const url = 'https://coopmaths.fr/alea/?v=AMC'
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    const result = mathaleaUpdateExercicesParamsFromUrl(url)

    expect(result.v).toBe('amc')
  })

  it('should parse legacy path query syntax /&v=AMC', async () => {
    const url = 'https://coopmaths.fr/alea/&v=AMC'
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    const result = mathaleaUpdateExercicesParamsFromUrl(url)

    expect(result.v).toBe('amc')
  })

  it('should parse encoded legacy path query syntax /%26v=AMC', async () => {
    const url = 'https://coopmaths.fr/alea/%26v=AMC'
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    const result = mathaleaUpdateExercicesParamsFromUrl(url)

    expect(result.v).toBe('amc')
  })

  it('should update exercicesParams from URL', async () => {
    const url =
      'https://coopmaths.fr/alea/?uuid=test-uuid&id=test-id&n=5&d=10&s=test-sup&s2=test-sup2&s3=test-sup3&s4=test-sup4&s5=test-sup5&alea=test-alea&cols=2&i=1&cd=1&v=eleve&z=2'
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    const result = mathaleaUpdateExercicesParamsFromUrl(url)
    const expectedParams = [
      {
        uuid: 'test-uuid',
        id: undefined, // id est chargé à partir de l'uuid
        nbQuestions: 5,
        duration: 10,
        sup: 'test-sup',
        sup2: 'test-sup2',
        sup3: 'test-sup3',
        sup4: 'test-sup4',
        sup5: 'test-sup5',
        alea: 'test-alea',
        cols: 2,
        interactif: '1',
        cd: '1',
      },
    ]

    // console.log(result)
    expect(get(exercicesParams)).toEqual(expectedParams)
    expect(get(freezeUrl)).toBe(false)
    expect(result).toMatchObject({
      v: 'eleve',
      z: '2',
      durationGlobal: 0,
      ds: undefined,
      nbVues: 1,
      flow: 0,
      screenBetweenSlides: undefined,
      pauseAfterEachQuestion: undefined,
      isImagesOnSides: false,
      sound: 0,
      shuffle: false,
      manualMode: undefined,
      select: [],
      order: [],
      title: '',
      presMode: 'liste_exos',
      setInteractive: '2',
      isSolutionAccessible: true,
      isInteractiveFree: true,
      oneShot: false,
      twoColumns: false,
      isTitleDisplayed: true,
      recorder: undefined,
      done: undefined,
      beta: false,
      iframe: '',
      answers: '',
    })
  })

  it('should update exercicesParams V2 from URL', async () => {
    const url =
      'https://coopmaths.fr/alea/?uuid=edb61&id=5P13&alea=Wm22&uuid=4623e&id=5L12-1&n=6&d=10&s=3&cd=1&alea=iDSe&uuid=b87a5&id=4L10b&n=2&d=10&s=1-2&s2=1&s3=3&s4=1&cd=1&cols=2&alea=G6FS&uuid=71dd8&id=4L10&n=3&d=10&s=3&s2=1&s3=7&s4=false&cd=1&cols=3&alea=4nBh&uuid=&alea=fE6p'
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    const result = mathaleaUpdateExercicesParamsFromUrl(url)
    const expectedParams = [
      {
        uuid: 'edb61',
        id: '5P1A-2',
        interactif: '0',
        alea: 'Wm22',
      },
      {
        uuid: '4623e',
        id: '5N5F-1',
        interactif: '0',
        nbQuestions: 6,
        duration: 10,
        sup: '3',
        cd: '1',
        alea: 'iDSe',
      },
      {
        uuid: 'b87a5',
        id: '4L10b',
        interactif: '0',
        nbQuestions: 2,
        duration: 10,
        sup: '1-2',
        sup2: '1',
        sup3: '3',
        sup4: '1',
        cd: '1',
        cols: 2,
        alea: 'G6FS',
      },
      {
        uuid: '71dd8',
        id: '4L10',
        interactif: '0',
        nbQuestions: 3,
        duration: 10,
        sup: '3',
        sup2: '1',
        sup3: '7',
        sup4: 'false',
        cd: '1',
        cols: 3,
        alea: '4nBh',
      },
    ]

    // console.log(get(exercicesParams))
    expect(get(exercicesParams)).toEqual(expectedParams)
    expect(get(freezeUrl)).toBe(false)
    expect(result).toMatchObject({
      v: '',
      z: '1',
      durationGlobal: 0,
      ds: undefined,
      nbVues: 1,
      flow: 0,
      screenBetweenSlides: undefined,
      pauseAfterEachQuestion: undefined,
      isImagesOnSides: false,
      sound: 0,
      shuffle: false,
      manualMode: undefined,
      select: [],
      order: [],
      title: '',
      presMode: 'liste_exos',
      setInteractive: '2',
      isSolutionAccessible: true,
      isInteractiveFree: true,
      oneShot: false,
      twoColumns: false,
      isTitleDisplayed: true,
      recorder: undefined,
      done: undefined,
      beta: false,
      iframe: '',
      answers: '',
    })
  })

  it('should preserve the chosen id when several ids share the same uuid', async () => {
    // uuid 11090 est partagé par deux références : '1A-F02-14' et 'BP1F2D02'
    // On choisit explicitement la seconde : elle ne doit pas être remplacée
    // par la première (comportement par défaut) lors du parsing de l'URL.
    const url = 'https://coopmaths.fr/alea/?uuid=11090&id=BP1F2D02&alea=ABCD'
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    mathaleaUpdateExercicesParamsFromUrl(url)

    expect(get(exercicesParams)).toEqual([
      {
        uuid: '11090',
        id: 'BP1F2D02',
        interactif: '0',
        alea: 'ABCD',
      },
    ])
  })

  it('should fall back to a default id when no id is given for a uuid with several references', async () => {
    const url = 'https://coopmaths.fr/alea/?uuid=11090&alea=ABCD'
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    mathaleaUpdateExercicesParamsFromUrl(url)

    expect(get(exercicesParams)).toEqual([
      {
        uuid: '11090',
        id: '1A-F02-14',
        interactif: '0',
        alea: 'ABCD',
      },
    ])
  })

  it('should preserve es parameter from imported URL', async () => {
    const url =
      'https://coopmaths.fr/alea/?uuid=edb61&id=5P13&alea=Wm22&v=eleve&es=0211001'
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    const result = mathaleaUpdateExercicesParamsFromUrl(url)

    // Vérifier que es=0211001 est correctement parsé
    // Position 0: presMode = 0 (liste_exos)
    // Position 1: setInteractive = 2
    // Position 2: isSolutionAccessible = 1 (true)
    // Position 3: isInteractiveFree = 1 (true)
    // Position 4: oneShot = 0 (false)
    // Position 5: twoColumns = 0 (false)
    // Position 6: isTitleDisplayed = 1 (true)
    // Note: presMode est parsé par mathaleaUpdateExercicesParamsFromUrl mais peut être forcé par importExercises
    expect(result).toMatchObject({
      v: 'eleve',
      presMode: 'liste_exos',
      setInteractive: '2',
      isSolutionAccessible: true,
      isInteractiveFree: true,
      oneShot: false,
      twoColumns: false,
      isTitleDisplayed: true,
    })
  })

  it('should preserve different es parameter values', async () => {
    const url =
      'https://coopmaths.fr/alea/?uuid=edb61&id=5P13&alea=Wm22&v=eleve&es=1110001'
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    const result = mathaleaUpdateExercicesParamsFromUrl(url)

    // Vérifier que es=1110001 est correctement parsé
    // Position 0: presMode = 1 (un_exo_par_page)
    // Position 1: setInteractive = 1
    // Position 2: isSolutionAccessible = 1 (true)
    // Position 3: isInteractiveFree = 0 (false)
    // Position 4: oneShot = 0 (false)
    // Position 5: twoColumns = 0 (false)
    // Position 6: isTitleDisplayed = 1 (true)
    // Note: presMode est parsé par mathaleaUpdateExercicesParamsFromUrl mais peut être forcé par importExercises
    expect(result).toMatchObject({
      v: 'eleve',
      presMode: 'un_exo_par_page',
      setInteractive: '1',
      isSolutionAccessible: true,
      isInteractiveFree: false,
      oneShot: false,
      twoColumns: false,
      isTitleDisplayed: true,
    })
  })

  it('should document that presMode can be forced during import (not in this function)', async () => {
    // Ce test documente le comportement attendu de mathaleaUpdateExercicesParamsFromUrl
    // La fonction parse correctement le presMode depuis l'URL
    // C'est la fonction importExercises() dans Start.svelte qui force ensuite presMode à 'un_exo_par_page'
    const url =
      'https://coopmaths.fr/alea/?uuid=edb61&id=5P13&alea=Wm22&v=eleve&es=0211001'
    const { mathaleaUpdateExercicesParamsFromUrl } =
      await import('../../src/lib/mathalea')
    const result = mathaleaUpdateExercicesParamsFromUrl(url)

    // mathaleaUpdateExercicesParamsFromUrl parse correctement es=0211001
    // avec presMode = 0 (liste_exos)
    expect(result.presMode).toBe('liste_exos')

    // Mais lors de l'import via importExercises() dans Start.svelte,
    // presMode sera forcé à 'un_exo_par_page' via :
    // globalOptions.update((current) => {
    //   return { ...current, ...options, recorder: tempRecorder, presMode: 'un_exo_par_page' }
    // })
  })

  describe('réglages es à 9 et 11 caractères', () => {
    it('lit isCorrectionOnlyOnError (9e caractère) sans activer isCheckPerQuestion', async () => {
      const { mathaleaUpdateExercicesParamsFromUrl } =
        await import('../../src/lib/mathalea')
      const result = mathaleaUpdateExercicesParamsFromUrl(
        'https://coopmaths.fr/alea/?uuid=edb61&id=5P13&alea=Wm22&v=eleve&es=021100111',
      )
      expect(result.isCorrectionOnlyOnError).toBe(true)
      expect(result.isCheckPerQuestion).toBe(false)
    })

    it('lit isCheckPerQuestion (11e caractère, après calculatricesForcees)', async () => {
      const { mathaleaUpdateExercicesParamsFromUrl } =
        await import('../../src/lib/mathalea')
      const result = mathaleaUpdateExercicesParamsFromUrl(
        'https://coopmaths.fr/alea/?uuid=edb61&id=5P13&alea=Wm22&v=eleve&es=021100110-1',
      )
      expect(result).toMatchObject({
        presMode: 'liste_exos',
        setInteractive: '2',
        isSolutionAccessible: true,
        isInteractiveFree: true,
        isCorrectionOnlyOnError: false,
        isCheckPerQuestion: true,
      })
    })

    it('isCheckPerQuestion est faux pour un ancien lien à 8 caractères', async () => {
      const { mathaleaUpdateExercicesParamsFromUrl } =
        await import('../../src/lib/mathalea')
      const result = mathaleaUpdateExercicesParamsFromUrl(
        'https://coopmaths.fr/alea/?uuid=edb61&id=5P13&alea=Wm22&v=eleve&es=02110011',
      )
      expect(result.isCheckPerQuestion).toBe(false)
    })

    it('buildEsParams écrit isCheckPerQuestion en 11e caractère, seulement quand il est activé', async () => {
      const { buildEsParams } = await import('../../src/lib/components/urls')
      const { globalOptions } =
        await import('../../src/lib/stores/globalOptions')
      globalOptions.update((options) => ({
        ...options,
        isCheckPerQuestion: true,
      }))
      const es = buildEsParams()
      expect(es).toHaveLength(11)
      expect(es.charAt(9)).toBe('-')
      expect(es.charAt(10)).toBe('1')
      globalOptions.update((options) => ({
        ...options,
        isCheckPerQuestion: false,
      }))
      expect(buildEsParams()).toHaveLength(9)
    })
  })

  describe('paramètre beta (phase de test du quizz)', () => {
    it('parse beta=1 depuis l’URL', async () => {
      const { mathaleaUpdateExercicesParamsFromUrl } =
        await import('../../src/lib/mathalea')
      const result = mathaleaUpdateExercicesParamsFromUrl(
        'https://coopmaths.fr/alea/?v=quizzconf&beta=1',
      )
      expect(result.beta).toBe(true)
    })

    it('beta est faux sans le paramètre', async () => {
      const { mathaleaUpdateExercicesParamsFromUrl } =
        await import('../../src/lib/mathalea')
      const result = mathaleaUpdateExercicesParamsFromUrl(
        'https://coopmaths.fr/alea/?v=quizzconf',
      )
      expect(result.beta).toBe(false)
    })

    it('beta est vrai en local (localhost) sans le paramètre', async () => {
      const { mathaleaUpdateExercicesParamsFromUrl } =
        await import('../../src/lib/mathalea')
      const result = mathaleaUpdateExercicesParamsFromUrl(
        'http://localhost:5173/?v=quizzconf',
      )
      expect(result.beta).toBe(true)
    })

    it('beta est vrai en local (127.0.0.1) sans le paramètre', async () => {
      const { mathaleaUpdateExercicesParamsFromUrl } =
        await import('../../src/lib/mathalea')
      const result = mathaleaUpdateExercicesParamsFromUrl(
        'http://127.0.0.1:5173/?v=quizzconf',
      )
      expect(result.beta).toBe(true)
    })

    it('active cor (relecture) uniquement en local', async () => {
      const { mathaleaUpdateExercicesParamsFromUrl } =
        await import('../../src/lib/mathalea')
      expect(
        mathaleaUpdateExercicesParamsFromUrl(
          'http://localhost:5173/alea/?uuid=2359a&cor=1',
        ).cor,
      ).toBe(true)
      expect(
        mathaleaUpdateExercicesParamsFromUrl(
          'https://coopmaths.fr/alea/?uuid=2359a&cor=1',
        ).cor,
      ).toBe(false)
      expect(
        mathaleaUpdateExercicesParamsFromUrl(
          'http://localhost:5173/alea/?uuid=2359a',
        ).cor,
      ).toBe(false)
    })

    it('persiste beta dans l’URL reconstruite (updateGlobalOptionsInURL)', async () => {
      const { updateGlobalOptionsInURL } =
        await import('../../src/lib/stores/generalStore')
      const { globalOptions } =
        await import('../../src/lib/stores/globalOptions')
      const previous = get(globalOptions)
      globalOptions.set({ ...previous, beta: true, v: 'quizzconf' })
      try {
        const url = new URL('https://coopmaths.fr/alea/')
        updateGlobalOptionsInURL(url)
        expect(url.searchParams.get('beta')).toBe('1')
        expect(url.searchParams.get('v')).toBe('quizzconf')
      } finally {
        globalOptions.set(previous)
      }
    })
  })
})
