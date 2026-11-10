import { beforeEach, describe, expect, it } from 'vitest'
import {
  codesCalculatricesEffectifs,
  isCalculatriceAutorisee,
  isCalculatricesAutorisees,
  isCalculatricesForcees,
} from '../../src/lib/calculatrices'
import { buildEsParams } from '../../src/lib/components/urls'
import { mathaleaUpdateExercicesParamsFromUrl } from '../../src/lib/mathalea'
import { globalOptions } from '../../src/lib/stores/globalOptions'

describe('calculatrices autorisées', () => {
  it('reconnaît les codes 0, 1, 2, 3 et 9', () => {
    for (const code of ['0', '1', '2', '3', '9']) {
      expect(isCalculatricesAutorisees(code)).toBe(true)
    }
    expect(isCalculatricesAutorisees('4')).toBe(false)
    expect(isCalculatricesAutorisees(undefined)).toBe(false)
  })

  it('associe chaque code à sa calculatrice', () => {
    expect(isCalculatriceAutorisee('1', 'calculette')).toBe(true)
    expect(isCalculatriceAutorisee('1', 'college')).toBe(false)
    expect(isCalculatriceAutorisee('2', 'college')).toBe(true)
    expect(isCalculatriceAutorisee('2', 'lycee')).toBe(false)
    expect(isCalculatriceAutorisee('3', 'lycee')).toBe(true)
  })

  it('9 les autorise toutes, 0 et l’absence aucune', () => {
    for (const kind of ['calculette', 'college', 'lycee'] as const) {
      expect(isCalculatriceAutorisee('9', kind)).toBe(true)
      expect(isCalculatriceAutorisee('0', kind)).toBe(false)
      expect(isCalculatriceAutorisee(undefined, kind)).toBe(false)
    }
  })
})

describe('calculatrices forcées (réglage global)', () => {
  it('reconnaît « - » et les codes de calc', () => {
    for (const code of ['-', '0', '1', '2', '3', '9']) {
      expect(isCalculatricesForcees(code)).toBe(true)
    }
    expect(isCalculatricesForcees('x')).toBe(false)
  })

  it('sans calculatrice forcée, les codes des exercices sont conservés', () => {
    expect(codesCalculatricesEffectifs('-', ['1', undefined])).toEqual([
      '1',
      undefined,
    ])
    expect(codesCalculatricesEffectifs(undefined, ['2'])).toEqual(['2'])
  })

  it('une calculatrice forcée remplace les codes des exercices', () => {
    expect(codesCalculatricesEffectifs('3', ['1', undefined])).toEqual(['3'])
    expect(codesCalculatricesEffectifs('0', ['9'])).toEqual(['0'])
  })
})

describe('calculatrices forcées dans le paramètre es', () => {
  beforeEach(() => {
    globalOptions.set({ presMode: 'liste_exos', setInteractive: '2' })
  })

  it('n’alourdit pas le paramètre par défaut', () => {
    expect(buildEsParams()).toHaveLength(9)
  })

  it('ajoute le code de la calculatrice forcée en dernier caractère', () => {
    globalOptions.update((o) => ({ ...o, calculatricesForcees: '9' }))
    const es = buildEsParams()
    expect(es).toHaveLength(10)
    expect(es.endsWith('9')).toBe(true)
  })

  it('se relit depuis l’URL', () => {
    globalOptions.update((o) => ({ ...o, calculatricesForcees: '1' }))
    const es = buildEsParams()
    window.history.replaceState(null, '', `/?uuid=aaa&es=${es}`)
    expect(mathaleaUpdateExercicesParamsFromUrl().calculatricesForcees).toBe(
      '1',
    )
    window.history.replaceState(null, '', '/?uuid=aaa&es=121011010')
    expect(mathaleaUpdateExercicesParamsFromUrl().calculatricesForcees).toBe(
      '-',
    )
  })
})
