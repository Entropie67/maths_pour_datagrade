import { describe, expect, it } from 'vitest'
import { keyboardBlocks, specialKeys } from '../layouts/keysBlocks'
import { choisitClavierReduit, dimensionsClavierAgrandi } from './modeClavier'

const agrandi = { largeur: 500, hauteur: 220 }
const base = {
  preference: null,
  nbPagesEnLigne: 2,
  agrandi,
  innerWidth: 900,
  innerHeight: 700,
  tactile: false,
}

describe('dimensionsClavierAgrandi', () => {
  it('estime un clavier chiffres + longueurs sur grand écran', () => {
    const { largeur, hauteur } = dimensionsClavierAgrandi(
      [specialKeys, keyboardBlocks.numbers],
      [keyboardBlocks.lengths],
      900,
    )
    // 4 rangées de touches de 40 px, espacées de 8 px, plus 32 px de padding
    expect(hauteur).toBe(4 * 40 + 3 * 8 + 32)
    expect(largeur).toBeLessThan(900)
  })

  it('ajoute la hauteur des onglets quand plusieurs blocs d’unités', () => {
    const unites = [keyboardBlocks.lengths, keyboardBlocks.areas]
    const avecOnglets = dimensionsClavierAgrandi([specialKeys], unites, 900)
    const sansOnglets = dimensionsClavierAgrandi(
      [specialKeys],
      [keyboardBlocks.lengths],
      900,
    )
    expect(avecOnglets.hauteur).toBeGreaterThan(sansOnglets.hauteur)
  })
})

describe('choisitClavierReduit', () => {
  it('respecte le dernier choix de l’élève', () => {
    expect(choisitClavierReduit({ ...base, preference: true })).toBe(true)
    expect(
      choisitClavierReduit({ ...base, preference: false, nbPagesEnLigne: 1 }),
    ).toBe(false)
  })

  it('reste réduit quand toutes les touches tiennent sur une ligne', () => {
    expect(choisitClavierReduit({ ...base, nbPagesEnLigne: 1 })).toBe(true)
    expect(
      choisitClavierReduit({ ...base, nbPagesEnLigne: 1, tactile: true }),
    ).toBe(true)
  })

  it('s’agrandit plutôt que de cacher des touches sur une autre page', () => {
    expect(choisitClavierReduit(base)).toBe(false)
  })

  it('garde les pages si le clavier agrandi est trop haut ou trop large', () => {
    expect(
      choisitClavierReduit({
        ...base,
        agrandi: { largeur: 500, hauteur: 400 },
      }),
    ).toBe(true)
    expect(
      choisitClavierReduit({
        ...base,
        agrandi: { largeur: 950, hauteur: 220 },
      }),
    ).toBe(true)
  })

  it('reste agrandi sur écran tactile dès qu’il y a plusieurs pages', () => {
    expect(
      choisitClavierReduit({
        ...base,
        tactile: true,
        agrandi: { largeur: 500, hauteur: 400 },
      }),
    ).toBe(false)
  })

  it('sur smartphone, agrandit toujours si les touches tiennent en largeur', () => {
    const smartphone = {
      ...base,
      innerWidth: 390,
      agrandi: { largeur: 350, hauteur: 220 },
    }
    expect(choisitClavierReduit(smartphone)).toBe(false)
    // même avec une seule page en ligne, un choix précédent ou un écran tactile
    expect(
      choisitClavierReduit({
        ...smartphone,
        nbPagesEnLigne: 1,
        preference: true,
      }),
    ).toBe(false)
    expect(choisitClavierReduit({ ...smartphone, tactile: true })).toBe(false)
  })

  it.each([320, 360, 390, 640])(
    'sur smartphone (%i px), adapte la grille même si sa largeur fixe dépasse',
    (innerWidth) => {
      // Clavier de 2F32-flash1 : sa largeur fixe dépasse les petits écrans,
      // mais ses touches se partagent la largeur disponible en mode mobile.
      const agrandi = dimensionsClavierAgrandi(
        [
          specialKeys,
          keyboardBlocks.numbersX,
          keyboardBlocks.ensemble,
          keyboardBlocks.ensembleDefini,
        ],
        [],
        innerWidth,
        false,
      )
      expect(
        choisitClavierReduit({
          ...base,
          innerWidth,
          preference: true,
          agrandi,
        }),
      ).toBe(false)
    },
  )
})
