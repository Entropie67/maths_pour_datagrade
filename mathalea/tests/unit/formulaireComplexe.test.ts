import { describe, expect, it } from 'vitest'
import {
  itemsDeLaValeur,
  lireFormulaireComplexe,
  parseFormulaireComplexe,
  POIDS_MAX_DEFAUT,
  poidsMaximal,
  repartitionPonderee,
  repartitionPondereeOrdonnee,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type ChampListeQuelconque,
  type FormulaireComplexe,
  type ItemPondere,
} from '../../src/lib/formulaireComplexe'

const formulaire: FormulaireComplexe = {
  titre: 'Réglages',
  champs: [
    {
      type: 'listePondereeOrdonnee',
      nom: 'unites',
      label: 'Unités',
      labelOrdre: 'Respecter l’ordre des unités',
      items: [
        { nom: 'm', label: 'Longueurs', poids: 1 },
        { nom: 'L', label: 'Contenances', poids: 1 },
        { nom: 'g', label: 'Masses', poids: 0 },
      ],
    },
    {
      type: 'listePonderee',
      nom: 'operations',
      label: 'Opérations',
      items: [
        { nom: 'mult', label: 'Multiplications', poids: 2 },
        { nom: 'div', label: 'Divisions', poids: 1 },
      ],
    },
    {
      type: 'liste',
      nom: 'prefixes',
      label: 'Préfixes',
      items: [
        { nom: 'k', label: 'kilo' },
        { nom: 'h', label: 'hecto', actif: false },
        { nom: 'da', label: 'déca' },
      ],
    },
    {
      type: 'selection',
      nom: 'sens',
      label: 'Sens',
      options: [
        { valeur: 'vers', label: 'Vers l’unité' },
        { valeur: 'depuis', label: 'Depuis l’unité' },
      ],
      defaut: 'vers',
    },
    { type: 'case', nom: 'decimaux', label: 'Décimaux', defaut: false },
  ],
}

describe('valeursParDefaut', () => {
  it('reprend les valeurs déclarées par l’exercice', () => {
    expect(valeursParDefaut(formulaire)).toEqual({
      unites: {
        ordre: false,
        items: [
          { nom: 'm', label: 'Longueurs', poids: 1 },
          { nom: 'L', label: 'Contenances', poids: 1 },
          { nom: 'g', label: 'Masses', poids: 0 },
        ],
      },
      operations: [
        { nom: 'mult', label: 'Multiplications', poids: 2 },
        { nom: 'div', label: 'Divisions', poids: 1 },
      ],
      prefixes: [
        { nom: 'k', label: 'kilo', poids: 1 },
        { nom: 'h', label: 'hecto', poids: 0 },
        { nom: 'da', label: 'déca', poids: 1 },
      ],
      sens: 'vers',
      decimaux: false,
    })
  })
})

describe('poidsMaximal', () => {
  it('vaut 1 pour une liste simple et POIDS_MAX_DEFAUT pour les listes pondérées', () => {
    const [unites, operations, prefixes] = formulaire.champs as [
      ChampListeQuelconque,
      ChampListeQuelconque,
      ChampListeQuelconque,
    ]
    // Régression : le test portait sur la présence de la propriété `poidsMax`, qui est
    // facultative ; tous les poids saisis étaient donc ramenés à 1.
    expect(poidsMaximal(unites)).toBe(POIDS_MAX_DEFAUT)
    expect(poidsMaximal(operations)).toBe(POIDS_MAX_DEFAUT)
    expect(poidsMaximal(prefixes)).toBe(1)
    expect(poidsMaximal({ ...operations, poidsMax: 4 })).toBe(4)
  })
})

describe('sérialisation', () => {
  it('utilise une forme compacte propre à chaque type de champ', () => {
    const serialisation = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
    // listePondereeOrdonnee : ordre_indice.poids · listePonderee : poids · liste : 0/1
    expect(serialisation).toBe('0_0.1-1.1-2.0*2-1*101*vers*0')
    expect(new URLSearchParams({ s: serialisation }).toString()).toBe(
      's=0_0.1-1.1-2.0*2-1*101*vers*0',
    )
  })

  it('est réversible, y compris après réordonnancement', () => {
    const valeurs = {
      unites: {
        ordre: true,
        items: [
          { nom: 'g', label: 'Masses', poids: 3 },
          { nom: 'm', label: 'Longueurs', poids: 2 },
          { nom: 'L', label: 'Contenances', poids: 0 },
        ],
      },
      operations: [
        { nom: 'mult', label: 'Multiplications', poids: 0 },
        { nom: 'div', label: 'Divisions', poids: 5 },
      ],
      prefixes: [
        { nom: 'k', label: 'kilo', poids: 0 },
        { nom: 'h', label: 'hecto', poids: 1 },
        { nom: 'da', label: 'déca', poids: 0 },
      ],
      sens: 'depuis',
      decimaux: true,
    }
    const serialisation = serialiseFormulaireComplexe(formulaire, valeurs)
    expect(serialisation).toBe('1_2.3-0.2-1.0*0-5*010*depuis*1')
    expect(parseFormulaireComplexe(formulaire, serialisation)).toEqual(valeurs)
  })

  it('ne réordonne pas une liste sans flèches', () => {
    // Les items d'une `liste` ou d'une `listePonderee` restent dans l'ordre déclaré,
    // quel que soit l'ordre du tableau fourni.
    const serialisation = serialiseFormulaireComplexe(formulaire, {
      ...valeursParDefaut(formulaire),
      operations: [
        { nom: 'div', label: 'Divisions', poids: 4 },
        { nom: 'mult', label: 'Multiplications', poids: 3 },
      ],
    })
    expect(serialisation.split('*')[1]).toBe('3-4')
  })
})

describe('parseFormulaireComplexe', () => {
  it('relit les anciennes sélections binaires uniquement sur demande explicite', () => {
    const migrated: FormulaireComplexe = {
      champs: [
        {
          type: 'listePonderee',
          nom: 'familles',
          label: 'Familles',
          acceptLegacyBinary: true,
          items: ['a', 'b', 'c', 'd', 'e'].map((nom) => ({ nom, label: nom })),
        },
        { type: 'case', nom: 'donnee', label: 'Intégrale donnée' },
      ],
    }
    for (const binary of ['11111', '10100', '00000']) {
      const legacy = parseFormulaireComplexe(migrated, `${binary}*1`)
      expect(legacy).toEqual(
        parseFormulaireComplexe(migrated, `${[...binary].join('-')}*1`),
      )
      expect(serialiseFormulaireComplexe(migrated, legacy)).toBe(
        `${[...binary].join('-')}*1`,
      )
    }
    expect(
      lireFormulaireComplexe(migrated, '3-0-2-1-0*0')
        .liste('familles')
        .map((item) => item.poids),
    ).toEqual([3, 0, 2, 1, 0])
    const field = migrated.champs[0]
    if (field.type !== 'listePonderee') throw new Error('Type inattendu')
    field.acceptLegacyBinary = false
    expect(
      lireFormulaireComplexe(migrated, '11111*0').liste('familles')[0].poids,
    ).toBe(11111)
  })

  it('retombe sur les valeurs par défaut si sup est absent', () => {
    expect(parseFormulaireComplexe(formulaire, undefined)).toEqual(
      valeursParDefaut(formulaire),
    )
    expect(parseFormulaireComplexe(formulaire, false)).toEqual(
      valeursParDefaut(formulaire),
    )
  })

  it('complète les champs manquants d’une URL tronquée', () => {
    const valeurs = parseFormulaireComplexe(formulaire, '1_1.2')
    expect(valeurs.unites).toEqual({
      ordre: true,
      items: [
        { nom: 'L', label: 'Contenances', poids: 2 },
        { nom: 'm', label: 'Longueurs', poids: 1 },
        { nom: 'g', label: 'Masses', poids: 0 },
      ],
    })
    expect(valeurs.operations).toEqual(valeursParDefaut(formulaire).operations)
    expect(valeurs.sens).toBe('vers')
    expect(valeurs.decimaux).toBe(false)
  })

  it('ignore les items et les options inconnus', () => {
    const valeurs = parseFormulaireComplexe(
      formulaire,
      '0_9.4-0.2*7-1*1*inconnu*1',
    )
    expect(valeurs.sens).toBe('vers')
    expect(valeurs.decimaux).toBe(true)
    expect(itemsDeLaValeur(valeurs.unites).map((item) => item.nom)).toEqual([
      'm',
      'L',
      'g',
    ])
    // Poids hors formulaire conservé tel quel, item manquant remis à son défaut.
    expect(
      itemsDeLaValeur(valeurs.operations).map((item) => item.poids),
    ).toEqual([7, 1])
    // `liste` tronquée : les items absents reprennent leur état déclaré.
    expect(itemsDeLaValeur(valeurs.prefixes).map((item) => item.poids)).toEqual(
      [1, 0, 1],
    )
  })
})

describe('champ nombre', () => {
  const formulaireNombre: FormulaireComplexe = {
    champs: [
      { type: 'nombre', nom: 'coefficient', label: 'Coefficient', max: 10 },
      {
        type: 'nombre',
        nom: 'pourcentage',
        label: 'Pourcentage',
        min: 0,
        max: 100,
        defaut: 25,
      },
    ],
  }

  it('utilise `defaut`, ou `min`, ou 0', () => {
    expect(valeursParDefaut(formulaireNombre)).toEqual({
      coefficient: 0,
      pourcentage: 25,
    })
  })

  it('sérialise et désérialise la valeur entière', () => {
    const valeurs = { coefficient: 7, pourcentage: 50 }
    const serialisation = serialiseFormulaireComplexe(formulaireNombre, valeurs)
    expect(serialisation).toBe('7*50')
    expect(parseFormulaireComplexe(formulaireNombre, serialisation)).toEqual(
      valeurs,
    )
  })

  it('borne la valeur entre min et max', () => {
    expect(parseFormulaireComplexe(formulaireNombre, '99*-5')).toEqual({
      coefficient: 10,
      pourcentage: 0,
    })
  })

  it('retombe sur la valeur par défaut si la valeur est invalide', () => {
    expect(parseFormulaireComplexe(formulaireNombre, 'x*')).toEqual({
      coefficient: 0,
      pourcentage: 25,
    })
  })

  it('est accessible via ParametresFormulaireComplexe.nombre()', () => {
    const params = lireFormulaireComplexe(formulaireNombre, '3*80')
    expect(params.nombre('coefficient')).toBe(3)
    expect(params.nombre('pourcentage')).toBe(80)
  })
})

describe('répartitions pondérées', () => {
  const items: ItemPondere[] = [
    { nom: 'm', label: 'Longueurs', poids: 2 },
    { nom: 'L', label: 'Contenances', poids: 1 },
    { nom: 'g', label: 'Masses', poids: 0 },
  ]

  it('regroupe les questions par item, dans l’ordre reçu et selon les poids', () => {
    // 7 questions à répartir entre m (poids 2) et L (poids 1) : 4,67 et 2,33,
    // la question restante allant à la plus grande part fractionnaire.
    expect(repartitionPondereeOrdonnee(items, 7)).toEqual([
      'm',
      'm',
      'm',
      'm',
      'm',
      'L',
      'L',
    ])
  })

  it('répartit équitablement des poids égaux', () => {
    const poidsEgaux: ItemPondere[] = [
      { nom: 'm', label: 'Longueurs', poids: 1 },
      { nom: 'L', label: 'Contenances', poids: 1 },
      { nom: 'g', label: 'Masses', poids: 1 },
    ]
    expect(repartitionPondereeOrdonnee(poidsEgaux, 5)).toEqual([
      'm',
      'm',
      'L',
      'L',
      'g',
    ])
    expect(repartitionPondereeOrdonnee(poidsEgaux, 6)).toEqual([
      'm',
      'm',
      'L',
      'L',
      'g',
      'g',
    ])
  })

  it('donne exactement le nombre de questions demandé', () => {
    for (let taille = 1; taille <= 20; taille++) {
      expect(repartitionPondereeOrdonnee(items, taille)).toHaveLength(taille)
      expect(repartitionPonderee(items, taille)).toHaveLength(taille)
    }
  })

  it('exclut les items de poids nul et respecte les proportions', () => {
    const repartition = repartitionPonderee(items, 6)
    expect(repartition).toHaveLength(6)
    expect(repartition).not.toContain('g')
    expect(repartition.filter((nom) => nom === 'm')).toHaveLength(4)
    expect(repartition.filter((nom) => nom === 'L')).toHaveLength(2)
  })

  it('retombe sur les poids déclarés si tout est décoché', () => {
    const toutDecoche = items.map((item) => ({ ...item, poids: 0 }))
    const repartition = repartitionPondereeOrdonnee(toutDecoche, 3, [
      { nom: 'm', label: 'Longueurs', poids: 1 },
      { nom: 'L', label: 'Contenances', poids: 0 },
      { nom: 'g', label: 'Masses', poids: 0 },
    ])
    expect(repartition).toEqual(['m', 'm', 'm'])
  })
})

describe('ParametresFormulaireComplexe', () => {
  it('donne un accès typé aux valeurs', () => {
    const params = lireFormulaireComplexe(
      formulaire,
      '1_2.3-0.2-1.0*0-5*010*depuis*1',
    )
    expect(params.case('decimaux')).toBe(true)
    expect(params.selection('sens')).toBe('depuis')
    expect(params.listeActive('unites').map((item) => item.nom)).toEqual([
      'g',
      'm',
    ])
    expect(params.listeActive('prefixes').map((item) => item.nom)).toEqual([
      'h',
    ])
    expect(params.serialise()).toBe('1_2.3-0.2-1.0*0-5*010*depuis*1')
  })

  it('déclares() reste correct quel que soit l’ordre des champs dans le formulaire', () => {
    // Régression : un exercice indexait `formulaire.champs[0]` pour retrouver les
    // items déclarés d'une liste, en supposant que cette liste était le premier champ.
    // Réordonner les champs faisait planter l'exercice (accès à `.items` sur un champ
    // qui n'était pas une liste). `declares()` doit fonctionner quelle que soit la
    // position du champ dans le tableau.
    const formulaireReordonne: FormulaireComplexe = {
      champs: [...formulaire.champs].reverse(),
    }
    const params = lireFormulaireComplexe(formulaireReordonne, '')
    expect(params.declares('unites').map((item) => item.nom)).toEqual([
      'm',
      'L',
      'g',
    ])
    expect(params.declares('prefixes').map((item) => item.poids)).toEqual([
      1, 0, 1,
    ])
  })

  it('applique l’ordre choisi seulement si la case est cochée', () => {
    const avecOrdre = lireFormulaireComplexe(
      formulaire,
      '1_2.3-0.2-1.0*2-1*101*vers*0',
    )
    expect(avecOrdre.ordreImpose('unites')).toBe(true)
    expect(avecOrdre.repartition('unites', 5)).toEqual([
      'g',
      'g',
      'g',
      'm',
      'm',
    ])

    const sansOrdre = lireFormulaireComplexe(
      formulaire,
      '0_2.3-0.2-1.0*2-1*101*vers*0',
    )
    expect(sansOrdre.ordreImpose('unites')).toBe(false)
    const repartition = sansOrdre.repartition('unites', 5)
    expect(repartition.filter((nom) => nom === 'g')).toHaveLength(3)
    expect(repartition.filter((nom) => nom === 'm')).toHaveLength(2)
  })

  it('ne considère jamais une liste sans flèches comme ordonnée', () => {
    const params = lireFormulaireComplexe(formulaire, '')
    expect(params.ordreImpose('operations')).toBe(false)
    expect(params.ordreImpose('prefixes')).toBe(false)
  })

  it('signale un champ inexistant ou qui n’est pas une liste', () => {
    const params = lireFormulaireComplexe(formulaire, '')
    expect(() => params.repartition('inconnu', 3)).toThrow(
      /Champ « inconnu » absent/,
    )
    expect(() => params.repartition('decimaux', 3)).toThrow(
      /n'est pas une liste/,
    )
  })
})
