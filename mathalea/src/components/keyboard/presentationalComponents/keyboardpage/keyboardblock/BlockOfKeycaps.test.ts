import { render } from '@testing-library/svelte/svelte5'
import { tick } from 'svelte'
import { describe, expect, it } from 'vitest'
import { enregistreTouchesPersonnalisees } from '../../../lib/touchesPersonnalisees'
import type { KeyboardBlock } from '../../../types/keyboardContent'
import BlockOfKeycaps from './BlockOfKeycaps.svelte'

// jsdom n'implémente pas ResizeObserver, utilisé par Keycap.svelte pour
// adapter l'échelle de son contenu.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub)

function creeBlocPourLaQuestion(lettres: string[]): KeyboardBlock {
  const noms = enregistreTouchesPersonnalisees([
    ...lettres,
    '+',
    '-',
    '=',
    'SQ',
  ])
  return {
    keycaps: { inline: noms, block: noms },
    cols: Math.min(noms.length, 3),
    title: 'Pour cette question',
    isUnits: false,
  }
}

describe('BlockOfKeycaps', () => {
  it('garde les touches partagées (+, -, =, SQ) en changeant de question', async () => {
    const { container, rerender } = render(BlockOfKeycaps, {
      block: creeBlocPourLaQuestion(['J', 'K', 'L']),
      isInLine: true,
      innerWidth: 1280,
      clickKeycap: () => {},
    })
    expect(
      container.querySelectorAll('button[class*="key--perso:"]'),
    ).toHaveLength(7)

    // Une question dont l'exercice propose d'autres lettres, mais les mêmes
    // touches d'opération : voir le bug où (key + '_' + index) comme clé de
    // {#each} faisait disparaître +, -, =, SQ au changement de question.
    rerender({ block: creeBlocPourLaQuestion(['W', 'X', 'Y']) })
    await tick()
    const boutons = [
      ...container.querySelectorAll('button[class*="key--perso:"]'),
    ].map((b) => [...b.classList].find((c) => c.startsWith('key--perso:')))
    expect(boutons).toEqual([
      'key--perso:W',
      'key--perso:X',
      'key--perso:Y',
      'key--perso:+',
      'key--perso:-',
      'key--perso:=',
      'key--perso:SQ',
    ])
  })
})
