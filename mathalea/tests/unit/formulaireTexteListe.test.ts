import { describe, expect, it } from 'vitest'
import {
  itemsFormulaireTexte,
  parseCasFormulaireTexte,
  serialiseItemsFormulaireTexte,
  type CasFormulaireTexte,
} from '../../src/lib/formulaireTexteListe'

/** L'aide de 3L11, à l'origine de cette présentation. */
const AIDE_3L11 =
  'Nombres séparés par des tirets :\n1: k(ax+b)\n2: (ax+b)×k\n3: kx(ax+b)\n4: (ax+b)×kx\n5: k(ax+b)+c\n6: c+k(ax+b)\n7: Mélange'

/** Les cas de 3L11 : six formes de développement, « Mélange » valant 7. */
const CAS_3L11 = parseCasFormulaireTexte(AIDE_3L11) as CasFormulaireTexte

describe('parseCasFormulaireTexte', () => {
  it('extrait les cas énumérés par l’aide et repère « Mélange »', () => {
    expect(CAS_3L11).toEqual({
      melange: 7,
      cas: [
        { valeur: 1, label: 'k(ax+b)' },
        { valeur: 2, label: '(ax+b)×k' },
        { valeur: 3, label: 'kx(ax+b)' },
        { valeur: 4, label: '(ax+b)×kx' },
        { valeur: 5, label: 'k(ax+b)+c' },
        { valeur: 6, label: 'c+k(ax+b)' },
      ],
    })
  })

  it('accepte les autres façons d’écrire les cas', () => {
    expect(
      parseCasFormulaireTexte(
        'Nombres séparés par des tirets\n1 : Entier\n2- Décimal\n3) Mélange',
      ),
    ).toEqual({
      melange: 3,
      cas: [
        { valeur: 1, label: 'Entier' },
        { valeur: 2, label: 'Décimal' },
      ],
    })
  })

  it('repère un « Mélange » placé avant les cas ou numéroté 0', () => {
    expect(
      parseCasFormulaireTexte('1 : Bornée\n2 : Non bornée\n0: Mélange'),
    ).toEqual({
      melange: 0,
      cas: [
        { valeur: 1, label: 'Bornée' },
        { valeur: 2, label: 'Non bornée' },
      ],
    })
  })

  it('accepte une énumération qui ne commence pas à 1', () => {
    expect(
      parseCasFormulaireTexte('4 : Disque\n5 : Demi-disque\n6 : Mélange'),
    ).toEqual({
      melange: 6,
      cas: [
        { valeur: 4, label: 'Disque' },
        { valeur: 5, label: 'Demi-disque' },
      ],
    })
  })

  it('garde « Mélange » comme cas ordinaire quand ce n’est pas une sentinelle', () => {
    // 4C23 : deux libellés « Mélange… », dont un vrai type de question.
    const ambigu = parseCasFormulaireTexte(
      '1 : Somme\n2 : Différence\n3 : Produit\n4 : Avec priorités\n5 : Mélange\n6 : Quotient\n7 : Mélange avec quotient',
    )
    expect(ambigu?.melange).toBeNull()
    expect(ambigu?.cas).toHaveLength(7)

    // Un « Mélange » encadré par les autres numéros n'en est pas un non plus.
    const encadre = parseCasFormulaireTexte(
      '1 : Somme\n2 : Mélange\n3 : Produit',
    )
    expect(encadre?.melange).toBeNull()
    expect(encadre?.cas).toHaveLength(3)
  })

  it('renonce sur une aide qui n’énumère pas de cas', () => {
    expect(
      parseCasFormulaireTexte('Choisir un nombre entier entre 2 et 15.'),
    ).toBeNull()
    expect(
      parseCasFormulaireTexte(
        'Nombres séparés par des tirets (de 1 à 9)\n0 pour aléatoire',
      ),
    ).toBeNull()
  })

  it('renonce dès qu’une ligne décrit des valeurs non énumérées', () => {
    expect(
      parseCasFormulaireTexte(
        'Nombres séparés par des tirets :\nEntre 1 et 12 : pour choisir un motif particulier\n0 : au hasard\n100 : motifs linéaires',
      ),
    ).toBeNull()
  })

  it('renonce sur moins de deux cas, un numéro répété ou une aide absente', () => {
    expect(parseCasFormulaireTexte('1 : Le seul cas')).toBeNull()
    expect(parseCasFormulaireTexte('1 : Entier\n1 : Décimal')).toBeNull()
    expect(parseCasFormulaireTexte(undefined)).toBeNull()
  })

  it('garde « Mélange » cochable s’il ne reste qu’un seul autre cas', () => {
    // Le retirer laisserait une liste d'une seule case, toujours cochée.
    expect(parseCasFormulaireTexte('1 : Le seul cas\n2 : Mélange')).toEqual({
      melange: null,
      cas: [
        { valeur: 1, label: 'Le seul cas' },
        { valeur: 2, label: 'Mélange' },
      ],
    })
  })
})

describe('itemsFormulaireTexte', () => {
  it('compte les occurrences de chaque cas comme poids', () => {
    const items = itemsFormulaireTexte(CAS_3L11, '1-1-1-2')
    expect(items.map((item) => item.poids)).toEqual([3, 1, 0, 0, 0, 0])
    expect(items[0]).toEqual({ nom: '1', label: 'k(ax+b)', poids: 3 })
  })

  it('coche tous les cas quand « Mélange » est demandé', () => {
    for (const sup of ['7', 7, '7-1', '1-7']) {
      expect(itemsFormulaireTexte(CAS_3L11, sup).map((i) => i.poids)).toEqual([
        1, 1, 1, 1, 1, 1,
      ])
    }
  })

  it('ne coche rien pour un sup vide ou booléen', () => {
    for (const sup of ['', false, undefined, null]) {
      expect(
        itemsFormulaireTexte(CAS_3L11, sup).every((item) => item.poids === 0),
      ).toBe(true)
    }
  })

  it('ignore les valeurs inconnues sans casser les autres', () => {
    expect(
      itemsFormulaireTexte(CAS_3L11, '2-42-x-3').map((item) => item.poids),
    ).toEqual([0, 1, 1, 0, 0, 0])
  })
})

describe('serialiseItemsFormulaireTexte', () => {
  it('répète chaque cas autant de fois que son poids', () => {
    const items = itemsFormulaireTexte(CAS_3L11, '')
    items[0].poids = 3
    items[1].poids = 1
    expect(serialiseItemsFormulaireTexte(CAS_3L11, items)).toBe('1-1-1-2')
  })

  it('écrit « Mélange » quand tous les cas sont cochés au même poids', () => {
    const items = itemsFormulaireTexte(CAS_3L11, '1-2-3-4-5-6')
    expect(serialiseItemsFormulaireTexte(CAS_3L11, items)).toBe('7')
  })

  it('écrit la liste des cas quand l’aide ne propose pas de « Mélange »', () => {
    const sansMelange = parseCasFormulaireTexte(
      '1 : Somme\n2 : Mélange\n3 : Produit',
    ) as CasFormulaireTexte
    const items = itemsFormulaireTexte(sansMelange, '1-2-3')
    expect(serialiseItemsFormulaireTexte(sansMelange, items)).toBe('1-2-3')
  })

  it('n’écrit pas « Mélange » si un poids diffère', () => {
    const items = itemsFormulaireTexte(CAS_3L11, '1-1-2-3-4-5-6')
    expect(serialiseItemsFormulaireTexte(CAS_3L11, items)).toBe('1-1-2-3-4-5-6')
  })

  it('ne garde que les cas cochés', () => {
    expect(
      serialiseItemsFormulaireTexte(
        CAS_3L11,
        itemsFormulaireTexte(CAS_3L11, ''),
      ),
    ).toBe('')
  })

  it('est stable : relire puis réécrire une saisie ne la change pas', () => {
    for (const sup of ['1-1-1-2', '7', '3-3-5', '']) {
      const items = itemsFormulaireTexte(CAS_3L11, sup)
      expect(serialiseItemsFormulaireTexte(CAS_3L11, items)).toBe(sup)
    }
  })
})

describe('raccourci « tout cocher »', () => {
  it('écrit « Mélange » quel que soit l’état de départ', () => {
    for (const sup of ['', '1-1-1-2', '7', '3-3-5']) {
      const items = itemsFormulaireTexte(CAS_3L11, sup).map((item) => ({
        ...item,
        poids: 1,
      }))
      expect(serialiseItemsFormulaireTexte(CAS_3L11, items)).toBe('7')
    }
  })
})
