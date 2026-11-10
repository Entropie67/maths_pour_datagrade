import { describe, expect, it } from 'vitest'
import { keys } from './keycaps'
import {
  blocsDeTouches,
  enregistreTouchesPersonnalisees,
  litTouchesPersonnalisees,
  ordonneChiffresEnLigne,
  toucheDepuisCle,
} from './touchesPersonnalisees'

describe('touches personnalisées', () => {
  it('reconnaît les raccourcis nommés', () => {
    expect(toucheDepuisCle('POW')).toEqual({
      display: '$\\square^\\square$',
      insert: '#@^{#0}',
    })
    expect(toucheDepuisCle('SQRT').insert).toBe('\\sqrt{#1}')
    expect(toucheDepuisCle('FRAC').insert).toBe('\\frac{#@}{#1}')
  })

  it('affiche le LaTeX des touches libres et l’insère tel quel', () => {
    expect(toucheDepuisCle('a')).toEqual({ display: '$a$', insert: 'a' })
    expect(toucheDepuisCle('\\pi')).toEqual({
      display: '$\\pi$',
      insert: '\\pi',
    })
  })

  it('remplace les emplacements MathLive par un carré à l’affichage', () => {
    expect(toucheDepuisCle('f(#0)')).toEqual({
      display: '$f(\\square)$',
      insert: 'f(#0)',
    })
    expect(toucheDepuisCle('\\lim_{#0\\to #1}').display).toBe(
      '$\\lim_{\\square\\to \\square}$',
    )
  })

  it('enregistre les touches dans la table du clavier, sans doublon', () => {
    const noms = enregistreTouchesPersonnalisees(['u_n', 'u_n', '', 'POW'])
    expect(noms).toHaveLength(2)
    const table = keys as Record<string, { display: string; insert?: string }>
    expect(table[noms[0]]).toEqual({ display: '$u_n$', insert: 'u_n' })
    expect(table[noms[1]].insert).toBe('#@^{#0}')
  })

  it('ordonne un pavé numérique en ligne sans modifier le pavé ni les autres touches', () => {
    const touches = [
      '7',
      '8',
      '9',
      '4',
      '5',
      '6',
      '1',
      '2',
      '3',
      '0',
      ',',
      'u_n',
    ]
    const noms = enregistreTouchesPersonnalisees(touches)
    expect(ordonneChiffresEnLigne(noms)).toEqual(
      enregistreTouchesPersonnalisees([
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
        ',',
        'u_n',
      ]),
    )
    expect(noms).toEqual(enregistreTouchesPersonnalisees(touches))
  })

  it('préserve les sélections de chiffres et les touches numériques à plusieurs chiffres', () => {
    const noms = enregistreTouchesPersonnalisees(['3', '2', '1', '10', 'x'])
    expect(ordonneChiffresEnLigne(noms)).toEqual(noms)
  })

  it('regroupe les touches en blocs', () => {
    expect(blocsDeTouches(['a', 'b'])).toEqual([['a', 'b']])
    expect(blocsDeTouches([['a', 'b'], [], ['+']])).toEqual([['a', 'b'], ['+']])
    expect(blocsDeTouches([])).toEqual([])
  })

  it('relit les blocs stockés sur le champ, même mal formés', () => {
    expect(litTouchesPersonnalisees('["a","b"]')).toEqual([['a', 'b']])
    expect(litTouchesPersonnalisees('[["a","b"],["+"]]')).toEqual([
      ['a', 'b'],
      ['+'],
    ])
    expect(litTouchesPersonnalisees('[["a",1],[2],"x"]')).toEqual([['a']])
    expect(litTouchesPersonnalisees(undefined)).toEqual([])
    expect(litTouchesPersonnalisees('pas du json')).toEqual([])
    expect(litTouchesPersonnalisees('{"a":1}')).toEqual([])
  })
})
