import { afterEach, describe, expect, it, vi } from 'vitest'
import type { JSONReferentielEnding } from '../types/referentiels'
import { computeStaticExercicePngUrls } from './refUtils'

// Sujet d'annales dont le référentiel ne donne pas l'adresse des images.
const sujet = () =>
  ({
    uuid: 'dnb_2024_06_asie_1',
    typeExercice: 'dnb',
    annee: '2024',
    lieu: 'Asie',
  }) as unknown as JSONReferentielEnding

describe('computeStaticExercicePngUrls', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('lit les scans sur le site courant quand il sert /alea/static (ici en développement)', () => {
    vi.stubEnv('DEV', true)
    expect(computeStaticExercicePngUrls(sujet())).toEqual({
      png: [
        `${window.location.origin}/alea/static/dnb/2024/tex/png/dnb_2024_06_asie_1.png`,
      ],
      pngCor: [
        `${window.location.origin}/alea/static/dnb/2024/tex/png/dnb_2024_06_asie_1_cor.png`,
      ],
    })
  })

  it('lit les scans sur coopmaths.fr sur une copie de MathALÉA hébergée ailleurs', () => {
    vi.stubEnv('DEV', false)
    // Le site courant des tests (localhost) n'est pas un de nos noms.
    expect(computeStaticExercicePngUrls(sujet())).toEqual({
      png: [
        'https://coopmaths.fr/alea/static/dnb/2024/tex/png/dnb_2024_06_asie_1.png',
      ],
      pngCor: [
        'https://coopmaths.fr/alea/static/dnb/2024/tex/png/dnb_2024_06_asie_1_cor.png',
      ],
    })
  })
})
