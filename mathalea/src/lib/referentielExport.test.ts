import { describe, expect, it } from 'vitest'
import referentiel2022FR from '../json/referentiel2022FR.json'
import {
  buildReferentielSheets,
  extraireLignesExercices,
  labelForCode,
} from './referentielExport'
import type { JSONReferentielObject } from './types/referentiels'

const exercice = (id: string, titre: string) => ({
  url: `x/${id}.ts`,
  tags: [],
  uuid: id,
  id,
  titre,
  features: { interactif: { isActive: true, type: 'mathlive' } },
  typeExercice: 'alea' as const,
})

const referentielFactice: JSONReferentielObject = {
  Nouveautés: { canc3C01: exercice('canc3C01', 'Doublon à ignorer') },
  '4e': {
    '4C1': {
      '4C10': exercice('4C10', 'Additionner des relatifs'),
      '4C11': exercice('4C11', 'Soustraire des relatifs'),
    },
  },
  CAN: {
    '1e': {
      can1D: {
        can1D0: {
          can1D00: exercice('can1D00', 'Nombre dérivé'),
        },
      },
    },
  },
}

describe('labelForCode', () => {
  it('traduit un code de niveau connu', () => {
    expect(labelForCode('4e', 'fr-FR')).toBe('Quatrième')
  })
  it('traduit un code de thème connu', () => {
    expect(labelForCode('4C1', 'fr-FR')).toBe('Relatifs')
  })
  it('renvoie le code brut si aucune traduction', () => {
    expect(labelForCode('zzz-inconnu', 'fr-FR')).toBe('zzz-inconnu')
  })
})

describe('extraireLignesExercices', () => {
  const lignes = extraireLignesExercices(referentielFactice, 'fr-FR')

  it('ignore le nœud Nouveautés', () => {
    expect(lignes.some((l) => l.titre === 'Doublon à ignorer')).toBe(false)
  })

  it('traduit niveau / thème et garde ID et titre', () => {
    const ligne = lignes.find((l) => l.id === '4C10')
    expect(ligne).toMatchObject({
      niveau: 'Quatrième',
      theme: 'Relatifs',
      sousTheme: '',
      titre: 'Additionner des relatifs',
    })
  })

  it('concatène les sous-niveaux au-delà du 3ᵉ dans la colonne sous-thème', () => {
    const ligne = lignes.find((l) => l.id === 'can1D00')
    expect(ligne?.niveau).toBe('Course aux nombres')
    expect(ligne?.theme).toBe('Première')
    expect(ligne?.sousTheme).toContain('›')
  })
})

describe('buildReferentielSheets', () => {
  const sheets = buildReferentielSheets(referentielFactice, 'fr-FR')

  it('produit deux onglets nommés', () => {
    expect(sheets.map((s) => s.name)).toEqual([
      'Référentiel',
      'Liste des exercices',
    ])
  })

  it('onglet Référentiel : en-tête + triplets distincts', () => {
    const [entete, ...corps] = sheets[0].rows
    expect(entete).toEqual(['Niveau', 'Thème', 'Sous-thème'])
    // 4C10 et 4C11 partagent le même triplet → une seule ligne
    expect(corps).toContainEqual(['Quatrième', 'Relatifs', ''])
    expect(corps.filter((r) => r[0] === 'Quatrième')).toHaveLength(1)
  })

  it('onglet Liste des exercices : une ligne par exercice', () => {
    const [entete, ...corps] = sheets[1].rows
    expect(entete).toEqual(['Niveau', 'Thème', 'Sous-thème', 'ID', 'Titre'])
    expect(corps).toHaveLength(3)
  })
})

describe('sur le référentiel réel (referentiel2022FR.json)', () => {
  const lignes = extraireLignesExercices(
    referentiel2022FR as unknown as JSONReferentielObject,
    'fr-FR',
  )

  it('extrait des milliers d’exercices avec niveau, ID et titre', () => {
    expect(lignes.length).toBeGreaterThan(2000)
    for (const ligne of lignes) {
      expect(ligne.niveau).not.toBe('')
      expect(ligne.id).not.toBe('')
      expect(ligne.titre).not.toBe('')
    }
  })

  it('ne contient aucun exercice du nœud Nouveautés', () => {
    // (le référentiel brut n'a pas de nœud Nouveautés, mais le filtre doit
    // rester sans effet de bord sur les données réelles)
    expect(lignes.every((l) => l.niveau !== 'Nouveautés')).toBe(true)
  })
})
