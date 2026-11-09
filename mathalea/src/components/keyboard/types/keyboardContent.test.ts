import { describe, expect, it } from 'vitest'
import { keyboardBlocks } from '../layouts/keysBlocks'
import { decoupeBlocEnLigne, inLineBlockWidth } from './keyboardContent'

describe('decoupeBlocEnLigne', () => {
  const nombres = keyboardBlocks.numbers

  it('renvoie le bloc tel quel quand il tient dans la largeur', () => {
    expect(decoupeBlocEnLigne(nombres, 'md', 600)).toEqual([nombres])
  })

  it('découpe un bloc trop large sans perdre ni réordonner de touches', () => {
    const tranches = decoupeBlocEnLigne(nombres, 'md', 400)
    expect(tranches.length).toBeGreaterThan(1)
    expect(tranches.flatMap((t) => t.keycaps.inline)).toEqual(
      nombres.keycaps.inline,
    )
    for (const t of tranches) {
      expect(inLineBlockWidth(t, 'md')).toBeLessThanOrEqual(400)
    }
  })

  it('répartit les touches de façon équilibrée', () => {
    // 12 touches pour 7 au maximum : 6 + 6 et non 7 + 5.
    const tranches = decoupeBlocEnLigne(nombres, 'md', 7 * 48 - 8)
    expect(tranches.map((t) => t.keycaps.inline.length)).toEqual([6, 6])
  })

  it('garde au moins une touche par tranche', () => {
    const tranches = decoupeBlocEnLigne(nombres, 'sm', 1)
    expect(tranches).toHaveLength(nombres.keycaps.inline.length)
  })
})
