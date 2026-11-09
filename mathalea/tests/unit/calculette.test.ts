import { describe, expect, it } from 'vitest'
import {
  calculetteKeyFromKeyboard,
  formatCalculetteResult,
  initialCalculetteState,
  pressCalculetteKey,
  type CalculetteKey,
} from '../../src/lib/calculette'

/** Saisie d'une suite de touches, ex. type('4×3=') */
function type(keys: string, start = initialCalculetteState) {
  return [...keys].reduce(
    (state, key) => pressCalculetteKey(state, key as CalculetteKey),
    start,
  )
}

describe('calculette : calcul', () => {
  it.each([
    ['4×3=', '12'],
    ['2+3×4=', '20'],
    ['10−2−3=', '5'],
    ['8÷2÷2=', '2'],
    ['0,1+0,2=', '0,3'],
    ['1÷3=', '0,3333333333'],
    ['2÷3=', '0,6666666667'],
    ['7÷8=', '0,875'],
    ['3−5=', '−2'],
    ['−3×2=', '−6'],
    ['3×−2=', '−6'],
    ['1,5×4=', '6'],
    ['123456789×987654321=', '1,219326311E17'],
    ['1÷3000000=', '3,333333333E−7'],
    ['9999999999+1=', '1E10'],
  ])('%s → %s', (keys, result) => {
    expect(type(keys).result).toBe(result)
  })

  it('une division par zéro affiche une erreur effacée à la touche suivante', () => {
    const state = type('5÷0=')
    expect(state.error).toBe(true)
    expect(state.result).toBeNull()
    expect(type('7', state)).toMatchObject({ expression: '7', error: false })
  })

  it('le 2e opérateur effectue le calcul en cours et passe à la ligne', () => {
    expect(type('4+3×')).toMatchObject({
      previous: '4+3 = 7',
      expression: '7×',
      result: null,
    })
    expect(type('2+3×4−5÷3=').result).toBe('5')
    expect(type('2+3×4−5÷3=').previous).toBe('20−5 = 15')
  })

  it('le 2e opérateur gère un nombre négatif et le signe moins', () => {
    expect(type('3×−2+').expression).toBe('−6+')
    expect(type('−3+2×').expression).toBe('−1×')
  })

  it('un 2e opérateur après une division par zéro affiche une erreur', () => {
    expect(type('5÷0+')).toMatchObject({ error: true, result: null })
  })

  it('un opérateur final est ignoré au calcul', () => {
    expect(type('5+=').result).toBe('5')
  })
})

describe('calculette : saisie', () => {
  it('écrit le calcul en ligne avec la virgule décimale', () => {
    expect(type('4×3,5').expression).toBe('4×3,5')
  })

  it('ne saisit qu\'une virgule par nombre', () => {
    expect(type('1,2,3').expression).toBe('1,23')
  })

  it('complète une virgule en début de nombre par un zéro', () => {
    expect(type(',5').expression).toBe('0,5')
    expect(type('3+,5').expression).toBe('3+0,5')
  })

  it('remplace le zéro initial', () => {
    expect(type('05').expression).toBe('5')
    expect(type('3+007').expression).toBe('3+7')
  })

  it('remplace un opérateur par le suivant', () => {
    expect(type('3+×').expression).toBe('3×')
    expect(type('3×−').expression).toBe('3×−')
    expect(type('3×−+').expression).toBe('3+')
  })

  it('refuse un opérateur (hors −) en début de calcul', () => {
    expect(type('×').expression).toBe('')
    expect(type('−').expression).toBe('−')
  })

  it('limite la longueur des nombres', () => {
    expect(type('1'.repeat(20)).expression).toHaveLength(12)
  })

  it('efface le dernier caractère ou tout', () => {
    expect(pressCalculetteKey(type('45'), 'effacer').expression).toBe('4')
    expect(pressCalculetteKey(type('45+3'), 'tout-effacer')).toEqual(
      initialCalculetteState,
    )
  })

  it('un opérateur après « = » poursuit avec le résultat', () => {
    expect(type('4×3=+1=').result).toBe('13')
    expect(type('4×3=+')).toMatchObject({ previous: '4×3 = 12', expression: '12+' })
  })

  it('un chiffre après « = » démarre un nouveau calcul', () => {
    expect(type('4×3=7')).toMatchObject({ previous: null, expression: '7' })
  })

  it('effacer après « = » revient à la modification du calcul', () => {
    const state = pressCalculetteKey(type('4×3='), 'effacer')
    expect(state).toMatchObject({ expression: '4×', result: null })
  })
})

describe('calculette : format du résultat', () => {
  it('supprime les zéros inutiles et utilise la virgule', () => {
    expect(formatCalculetteResult(2.5)).toBe('2,5')
    expect(formatCalculetteResult(100)).toBe('100')
    expect(formatCalculetteResult(-0.25)).toBe('−0,25')
  })

  it('élimine les erreurs d\'arrondi des flottants', () => {
    expect(formatCalculetteResult(0.1 + 0.2)).toBe('0,3')
  })
})

describe('calculette : clavier physique', () => {
  it('convertit les touches usuelles', () => {
    expect(calculetteKeyFromKeyboard('7')).toBe('7')
    expect(calculetteKeyFromKeyboard('.')).toBe(',')
    expect(calculetteKeyFromKeyboard('*')).toBe('×')
    expect(calculetteKeyFromKeyboard('/')).toBe('÷')
    expect(calculetteKeyFromKeyboard('-')).toBe('−')
    expect(calculetteKeyFromKeyboard('Enter')).toBe('=')
    expect(calculetteKeyFromKeyboard('Backspace')).toBe('effacer')
    expect(calculetteKeyFromKeyboard('a')).toBeNull()
  })
})
