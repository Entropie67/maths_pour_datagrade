import { describe, expect, it } from 'vitest'
import type { JSONReferentielObject } from '../types/referentiels'
import {
  ajouteALaSelection,
  cheminDeLEntree,
  etatDeLaCible,
  exercicesDeLaSelection,
  exercicesDuNoeud,
  enfantsVisibles,
  formatSelection,
  lienVersLaSerie,
  parseSelection,
  referentielDesExercices,
  retireDeLaSelection,
  tirageDeLaSerie,
} from './selection'

/**
 * Un référentiel factice de la même forme que `referentiel2022FR.json` :
 * niveau > thème > (sous-thème >) exercice.
 */
const exercice = (uuid: string, id: string) => ({
  uuid,
  id,
  titre: `Exercice ${id}`,
  url: `${id}.ts`,
  tags: [],
  features: {},
  typeExercice: 'alea',
})

const referentiel = {
  '6e': {
    '6N1': {
      '6N10': exercice('aaaa1', '6N10'),
      '6N11': exercice('aaaa2', '6N11'),
    },
    '6G1': {
      '6G10': exercice('aaaa3', '6G10'),
    },
  },
  '5e': {
    // Le référentiel réel garde des rubriques vides (ainsi `200` en Seconde,
    // homonyme de `2A`) : elles ne doivent pas apparaître dans le sélecteur.
    '5Vide': {},
    '5N1': {
      '5N10': exercice('bbbb1', '5N10'),
    },
  },
} as unknown as JSONReferentielObject

describe('sélection de la série aléatoire', () => {
  it('lit et écrit la sélection mémorisée dans sup', () => {
    expect(parseSelection('6e>6N1; bbbb1 ;')).toEqual(['6e>6N1', 'bbbb1'])
    expect(parseSelection(undefined)).toEqual([])
    expect(formatSelection(['6e', '6e', '5e'])).toBe('6e;5e')
  })

  it('distingue un chemin de l’uuid d’un exercice', () => {
    expect(cheminDeLEntree(referentiel, '6e')).toEqual(['6e'])
    expect(cheminDeLEntree(referentiel, '6e>6N1')).toEqual(['6e', '6N1'])
    expect(cheminDeLEntree(referentiel, 'aaaa1')).toBeUndefined()
  })

  it('récolte les exercices d’un nœud, sous-thèmes compris', () => {
    const niveau = referentiel['6e'] as JSONReferentielObject
    expect(exercicesDuNoeud(niveau).map((e) => e.uuid)).toEqual([
      'aaaa1',
      'aaaa2',
      'aaaa3',
    ])
  })

  it('masque les nœuds qui ne contiennent aucun exercice', () => {
    const niveau = referentiel['5e'] as JSONReferentielObject
    expect(enfantsVisibles(niveau).map((enfant) => enfant.cle)).toEqual(['5N1'])
  })

  it('tire le bon nombre d’exercices, tous issus de la sélection', () => {
    const disponibles = exercicesDeLaSelection(referentiel, ['6e'])
    const tirage = tirageDeLaSerie(disponibles, 2)
    expect(tirage).toHaveLength(2)
    expect(new Set(tirage.map((e) => e.uuid)).size).toBe(2)
    for (const exercice of tirage) expect(disponibles).toContain(exercice)
    // La sélection est plus petite que le nombre demandé : on ne complète pas.
    expect(tirageDeLaSerie(disponibles, 10)).toHaveLength(3)
  })

  it('résout une sélection mêlant chemins et uuid, sans doublon', () => {
    const exercices = exercicesDeLaSelection(referentiel, [
      '6e>6N1',
      'aaaa1',
      'bbbb1',
    ])
    expect(exercices.map((e) => e.uuid)).toEqual(['aaaa1', 'aaaa2', 'bbbb1'])
  })

  it('ignore les entrées qui ne correspondent plus à rien', () => {
    expect(exercicesDeLaSelection(referentiel, ['4e>4N1', 'zzzzz'])).toEqual([])
  })

  it('coche un nœud pour tout son contenu', () => {
    const selection = ajouteALaSelection(referentiel, [], { chemin: ['6e'] })
    expect(selection).toEqual(['6e'])
    expect(
      etatDeLaCible(referentiel, selection, { chemin: ['6e', '6N1'] }),
    ).toBe('oui')
    expect(
      etatDeLaCible(referentiel, selection, {
        chemin: ['6e', '6N1', '6N10'],
        uuid: 'aaaa1',
      }),
    ).toBe('oui')
    expect(etatDeLaCible(referentiel, selection, { chemin: ['5e'] })).toBe(
      'non',
    )
  })

  it('remplace les entrées contenues par celle du nœud coché', () => {
    const selection = ajouteALaSelection(
      referentiel,
      ['aaaa1', '6e>6G1', '5e'],
      { chemin: ['6e'] },
    )
    expect(selection).toEqual(['5e', '6e'])
  })

  it('signale une sélection partielle', () => {
    expect(etatDeLaCible(referentiel, ['aaaa1'], { chemin: ['6e'] })).toBe(
      'partiel',
    )
    expect(etatDeLaCible(referentiel, ['6e>6G1'], { chemin: ['6e'] })).toBe(
      'partiel',
    )
  })

  it('éclate un ancêtre coché quand on décoche une de ses branches', () => {
    const selection = retireDeLaSelection(referentiel, ['6e'], {
      chemin: ['6e', '6N1'],
    })
    expect(selection).toEqual(['6e>6G1'])
    expect(
      etatDeLaCible(referentiel, selection, { chemin: ['6e', '6N1'] }),
    ).toBe('non')
  })

  it('éclate un ancêtre jusqu’à l’exercice décoché', () => {
    const selection = retireDeLaSelection(referentiel, ['6e'], {
      chemin: ['6e', '6N1', '6N10'],
      uuid: 'aaaa1',
    })
    expect(new Set(selection)).toEqual(new Set(['6e>6G1', 'aaaa2']))
    expect(
      exercicesDeLaSelection(referentiel, selection).map((e) => e.uuid),
    ).toEqual(['aaaa3', 'aaaa2'])
  })

  it('décoche une entrée sans ancêtre coché', () => {
    expect(
      retireDeLaSelection(referentiel, ['6e>6N1', '5e'], {
        chemin: ['6e', '6N1'],
      }),
    ).toEqual(['5e'])
  })

  it('construit un lien vers une séance en vue élève', () => {
    const lien = lienVersLaSerie(
      [
        { uuid: 'aaaa1', id: '6N10', titre: '' },
        { uuid: 'bbbb1', id: '5N10', titre: '' },
      ],
      { interactif: true },
    )
    expect(lien).toBe(
      'https://coopmaths.fr/alea/?uuid=aaaa1&id=6N10&i=1&uuid=bbbb1&id=5N10&i=1&v=eleve&es=12110011',
    )
  })

  it('n’ajoute pas i=1 pour une série non interactive', () => {
    const lien = lienVersLaSerie([{ uuid: 'aaaa1', id: '6N10', titre: '' }], {
      interactif: false,
    })
    expect(lien).toBe(
      'https://coopmaths.fr/alea/?uuid=aaaa1&id=6N10&v=eleve&es=12110011',
    )
  })

  it('expose le référentiel réel des exercices aléatoires', () => {
    const reel = referentielDesExercices()
    expect(Object.keys(reel)).toContain('6e')
    expect(exercicesDuNoeud(reel).length).toBeGreaterThan(1000)
  })
})
