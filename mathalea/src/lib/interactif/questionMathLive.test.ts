import { describe, expect, it } from 'vitest'
import type { IExercice } from '../types'
import { ajouteChampTexteMathLive, remplisLesBlancs } from './questionMathLive'

describe('étiquette du champ', () => {
  const exercice = { interactif: true, numeroExercice: 1 } as IExercice

  it('ne génère pas de label sans texte', () => {
    expect(ajouteChampTexteMathLive(exercice, 2)).not.toContain('<label')
  })

  it.each(['<br>', ' ', '&nbsp;&nbsp;', '<br> '])(
    'garde tel quel le texte de mise en page « %s », sans label',
    (texteAvant) => {
      const html = ajouteChampTexteMathLive(exercice, 2, '', { texteAvant })
      expect(html).not.toContain('<label')
      expect(html.startsWith(`${texteAvant}<mathalea-mathfield`)).toBe(true)
    },
  )

  it('relie le label au champ', () => {
    expect(
      ajouteChampTexteMathLive(exercice, 2, '', { texteAvant: '$S=$' }),
    ).toContain('<label for="champTexteEx1Q2">$S=$</label>')
  })

  it('transmet nomAccessible, échappé, sans changer le HTML sinon', () => {
    expect(
      ajouteChampTexteMathLive(exercice, 2, '', {
        nomAccessible: 'côté "a"',
      }),
    ).toContain('data-nom-accessible="côté &quot;a&quot;"')
    expect(ajouteChampTexteMathLive(exercice, 2)).not.toContain(
      'data-nom-accessible',
    )
    expect(
      remplisLesBlancs(exercice, 2, 'x=%{champ1}', '', undefined, {
        nomAccessible: 'valeur de x',
      }),
    ).toContain('data-nom-accessible="valeur de x"')
  })
})
