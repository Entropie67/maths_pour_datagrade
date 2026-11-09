import { describe, expect, it } from 'vitest'
import referentielCH from '../../src/json/referentiel2022CH.json'
import { splitChildren } from '../../src/lib/components/mobileMenu'
import {
  isSwissCycleCode,
  sortSwissCycleEntries,
} from '../../src/lib/components/swissReferentiel'
import {
  isExerciceItemInReferentiel,
  type ExerciceItemInReferentiel,
  type JSONReferentielObject,
} from '../../src/lib/types/referentiels'

const co = (referentielCH as unknown as JSONReferentielObject)[
  "Cycle d'orientation"
] as JSONReferentielObject

function node(...path: string[]): JSONReferentielObject {
  return path.reduce((current, key) => {
    expect(
      current[key],
      `Catégorie absente : ${path.join(' > ')}`,
    ).toBeDefined()
    return current[key] as JSONReferentielObject
  }, co)
}

function exercises(tree: JSONReferentielObject): ExerciceItemInReferentiel[] {
  return Object.values(tree).flatMap((value) =>
    isExerciceItemInReferentiel(value)
      ? [value]
      : exercises(value as JSONReferentielObject),
  )
}

describe('navigation du Cycle d’orientation suisse', () => {
  it('présente les axes dans l’ordre des moyens d’enseignement, puis les QCM', () => {
    expect(Object.keys(co)).toEqual([
      '9R3',
      '9R2',
      '9R1',
      '10LS',
      '10LC',
      '10CT',
      '11LS',
      '11LC',
      '11CT',
    ])
    for (const section of Object.keys(co)) {
      expect(splitChildren(node(section)).categories).toEqual(
        ['NO', 'FA', 'ES', 'GM', 'QCM'].map((axis) => section + axis),
      )
      const entries = Object.entries(node(section))
      expect(sortSwissCycleEntries(entries).map(([key]) => key)).toEqual(
        entries.map(([key]) => key),
      )
    }
  })

  it('réunit les décimaux et le calcul et distingue les familles de figures en 9e', () => {
    for (const section of ['9R1', '9R2', '9R3']) {
      expect(
        splitChildren(node(section, section + 'NO', section + 'NO0'))
          .categories,
      ).toEqual(['NO2', 'NO6', 'NO7', 'NO9'].map((suffix) => section + suffix))
      expect(
        exercises(
          node(section, section + 'NO', section + 'NO0', section + 'NO7'),
        ).some((exercise) => exercise.id.startsWith(section + 'NO8B-')),
      ).toBe(true)
      const plane = node(section, section + 'ES', section + 'ES0')
      expect(splitChildren(plane).categories).toEqual(
        ['ES1', 'ES2', 'ES6', 'ES7'].map((suffix) => section + suffix),
      )
      expect(
        exercises(plane[section + 'ES1'] as JSONReferentielObject).some(
          (exercise) => exercise.uuid === '0dbe7',
        ),
      ).toBe(true)
      expect(
        exercises(plane[section + 'ES7'] as JSONReferentielObject).some(
          (exercise) => exercise.uuid === 'e0bca',
        ),
      ).toBe(true)
      expect(
        exercises(plane[section + 'ES2'] as JSONReferentielObject).some(
          (exercise) => exercise.uuid === 'e0bca',
        ),
      ).toBe(false)
    }
    expect(node('9R1', '9R1ES', '9R1ES0', '9R1ES2')['9R1ES2F']).toBeUndefined()
  })

  it('respecte l’ordre des catégories même quand leurs codes suivent un autre ordre', () => {
    expect(splitChildren(node('10LS', '10LSFA')).categories).toEqual([
      '10LSFA1',
      '10LSFA3',
      '10LSFA2',
      '10LSFA4',
      '10LSFA5',
    ])
    expect(splitChildren(node('11LS', '11LSGM')).categories).toEqual([
      '11LSGM2',
      '11LSGM3',
      '11LSGM1',
      '11LSGM4',
    ])
  })

  it('trie les références par numéro dans la navigation mobile et Typst', () => {
    const leaf = node('9R2', '9R2NO', '9R2NO4', '9R2NO4F')
    const references = splitChildren(leaf).endings.map(([ref]) => ref)
    expect(references.indexOf('9R2NO4F-2')).toBeLessThan(
      references.indexOf('9R2NO4F-10'),
    )
    expect(
      sortSwissCycleEntries(Object.entries(leaf)).map(([ref]) => ref),
    ).toEqual(references)
  })

  it('répartit les QCM par axe, avec uniquement des feuilles non vides et sans doublon de référence', () => {
    for (const section of Object.keys(co)) {
      const qcm = node(section, section + 'QCM')
      const axes = splitChildren(qcm).categories
      expect(axes).toEqual(
        ['NO', 'FA', 'ES', 'GM']
          .map((axis) => section + 'QCM' + axis)
          .filter((axis) => qcm[axis] !== undefined),
      )
      function checkLeaves(tree: JSONReferentielObject) {
        const { categories, endings } = splitChildren(tree)
        if (categories.length) {
          expect(endings).toHaveLength(0)
          categories.forEach((key) =>
            checkLeaves(tree[key] as JSONReferentielObject),
          )
        } else {
          expect(endings.length).toBeGreaterThan(0)
          expect(endings.length).toBeLessThanOrEqual(15)
          endings.forEach(([, exercise]) => {
            expect(
              isExerciceItemInReferentiel(exercise) &&
                exercise.features.qcm?.isActive,
            ).toBe(true)
          })
        }
      }
      checkLeaves(qcm)
      const references = exercises(node(section)).map((exercise) => exercise.id)
      expect(new Set(references).size).toBe(references.length)
    }
  })

  it('réserve les équations avec un carré translaté à LS et les nombres premiers à partir du niveau prévu', () => {
    const uuids = (section: string) =>
      exercises(node(section, section + 'QCM')).map((exercise) => exercise.uuid)
    expect(uuids('9R1')).not.toContain('12ead')
    expect(uuids('9R2')).toContain('12ead')
    expect(uuids('10CT')).toContain('12ead')
    expect(uuids('11CT')).not.toContain('ad00a')
    expect(uuids('11LC')).not.toContain('ad00a')
    expect(uuids('11LS')).toContain('ad00a')
  })

  it('classe les équations ax²=b et leurs QCM dans les quatre niveaux prévus', () => {
    for (const section of ['10LC', '10LS', '11CT', '11LC']) {
      const notion = section.startsWith('10') ? 'FA5' : 'FA4'
      const suffix = section.startsWith('10') ? 'E' : 'H'
      const chapter = node(
        section,
        section + 'FA',
        section + notion,
        section + notion + suffix,
      )
      expect(
        exercises(chapter)
          .map((exercise) => exercise.uuid)
          .sort(),
      ).toEqual(['231d3', 'c9889', '3af9a'].sort())
      expect(
        exercises(
          node(
            section,
            section + 'FA',
            section + notion,
            section + notion + 'C',
          ),
        ).map((exercise) => exercise.uuid),
      ).not.toContain('231d3')
      const qcm = exercises(node(section, section + 'QCM')).map(
        (exercise) => exercise.uuid,
      )
      expect(qcm).toContain('c9889')
      expect(qcm).toContain('3af9a')
      expect(qcm).not.toContain('ad00a')
      expect(qcm).not.toContain('6a9bf')
    }
  })

  it('conserve les exercices réglables et écarte les cas imposés incompatibles', () => {
    for (const section of ['10CT', '11CT']) {
      const uuids = exercises(node(section)).map((exercise) => exercise.uuid)
      for (const uuid of [
        'f49ff',
        '4a986',
        '72f4c',
        'c9893',
        'ceb15',
        '8b399',
      ]) {
        expect(uuids).not.toContain(uuid)
      }
      for (const uuid of ['a0d17', 'a6a23', 'cea05'])
        expect(uuids).toContain(uuid)
    }
    for (const section of ['10LC', '10LS', '11CT', '11LC']) {
      const uuids = exercises(node(section)).map((exercise) => exercise.uuid)
      expect(uuids).not.toContain('9f40e')
      expect(uuids).not.toContain('4fb38')
      expect(uuids).toContain('4b495')
    }
    const ls = exercises(node('11LS')).map((exercise) => exercise.uuid)
    expect(ls).toContain('9f40e')
    expect(ls).toContain('4fb38')
    for (const section of ['11CT', '11LC', '11LS']) {
      const uuids = exercises(node(section)).map((exercise) => exercise.uuid)
      expect(uuids).toContain('66d4e')
      expect(uuids).toContain('b72b0')
      expect(uuids).not.toContain('03b71')
    }
  })
})

describe('périmètre du tri suisse', () => {
  it('laisse les autres référentiels et les catégories dans leur ordre', () => {
    expect(isSwissCycleCode('9R2NO4F-10')).toBe(true)
    expect(isSwissCycleCode('11LSQCMFA2D-1')).toBe(true)
    for (const code of ['9NO1', '4C2', 'PRQNO06B', '1mQCM', '2026']) {
      expect(isSwissCycleCode(code)).toBe(false)
    }
    const entries: [string, number][] = [
      ['4C2-10', 10],
      ['4C2-2', 2],
    ]
    expect(sortSwissCycleEntries(entries)).toEqual(entries)
    expect(sortSwissCycleEntries([])).toEqual([])
  })
})
