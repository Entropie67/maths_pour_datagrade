import { get, writable } from 'svelte/store'
import {
  AtLeastOneOfCriteria,
  featuresCriteria,
  levelCriterion,
  MultiCriteria,
  type Criterion,
  type FilterableFeature,
} from '../../../../../lib/components/filters'
import {
  buildReferentiel,
  getAllEndings,
} from '../../../../../lib/components/refUtils'
import type {
  DisplayedFilter,
  FilterObject,
  FilterType,
} from '../../../../../lib/types'
import type {
  JSONReferentielObject,
  Level,
  ResourceAndItsPath,
} from '../../../../../lib/types/referentiels'
// pour sauvegarder les sélections de filtres
export const allFilters = writable<
  Record<FilterType, DisplayedFilter<string | Level>>
>({
  levels: {
    '6e': {
      title: 'Sixième',
      values: ['6e'],
      isSelected: false,
      clicked: 0,
    },
    '5e': {
      title: 'Cinquième',
      values: ['5e'],
      isSelected: false,
      clicked: 0,
    },
    '4e': {
      title: 'Quatrième',
      values: ['4e'],
      isSelected: false,
      clicked: 0,
    },
    '3e': {
      title: 'Troisième',
      values: ['3e'],
      isSelected: false,
      clicked: 0,
    },
    college: {
      title: 'Collège',
      values: ['6e', '5e', '4e', '3e'],
      isSelected: false,
      clicked: 0,
    },
    '2e': {
      title: 'Seconde',
      values: ['2e'],
      isSelected: false,
      clicked: 0,
    },
    '1e': {
      title: 'Première',
      values: ['1e'],
      isSelected: false,
      clicked: 0,
    },
    techno1: {
      title: 'Première Technologique',
      values: ['techno1'],
      isSelected: false,
      clicked: 0,
    },
    'Terminale Technologique': {
      title: 'Terminale Technologique',
      values: ['Terminale Technologique'],
      isSelected: false,
      clicked: 0,
    },
    'Terminale Expert': {
      title: 'Terminale Expert',
      values: ['Terminale Expert'],
      isSelected: false,
      clicked: 0,
    },
    'Terminale Spé': {
      title: 'Terminale Spécialité',
      values: ['Terminale Spé'],
      isSelected: false,
      clicked: 0,
    },
    HP: {
      title: 'Hors-Programme (Lycée)',
      values: ['HP'],
      isSelected: false,
      clicked: 0,
    },
    lycee: {
      title: 'Lycée',
      values: [
        '2e',
        '1e',
        'techno1',
        'Terminale Technologique',
        'Terminale Spé',
        'Terminale Expert',
        'HP',
      ],
      isSelected: false,
      clicked: 0,
    },
  },
  specs: {
    amc: {
      title: 'AMC (AutoMultipleChoice)',
      values: ['amc'],
      isSelected: false,
      clicked: 0,
    },
    interactif: {
      title: 'Interactif',
      values: ['interactif'],
      isSelected: false,
      clicked: 0,
    },
    qcm: {
      title: 'QCM',
      values: ['qcm'],
      isSelected: false,
      clicked: 0,
    },
    pasUniquementQcm: {
      title: 'Pas uniquement QCM',
      values: ['pasUniquementQcm'],
      isSelected: false,
      clicked: 0,
    },
  },
  types: {
    alea: {
      title: 'Aléatoires seulement',
      values: ['alea'],
      isSelected: false,
      clicked: 0,
    },
    static: {
      title: 'Statiques seulement',
      values: ['static'],
      isSelected: false,
      clicked: 0,
    },
    CAN: {
      title: 'Course aux nombres',
      values: ['CAN'],
      isSelected: false,
      clicked: 0,
    },
  },
})

/**
 * Retourne la liste de tous les niveaux sélectionnés
 * @returns {Level[]} la liste des niveaux sélectionnés dans les filtres
 */
export function getSelectedLevels(): Level[] {
  const filters = get(allFilters)
  const selectedLevels: Level[] = []
  // on regarde les niveaux
  Object.entries(filters.levels).forEach(([filter, level]) => {
    if (filter !== 'college' && filter !== 'lycee') {
      if (level.isSelected) {
        selectedLevels.push(filter as Level)
      }
    }
  })
  // on regarde les types (qui sont des niveaux particuliers : CAN, static, etc.)
  Object.entries(filters.types).forEach(([filter, level]) => {
    if (level.isSelected) {
      selectedLevels.push(filter as Level)
    }
  })
  return selectedLevels
}
/**
 * Retourne la liste des filtres sélectionnés sous la forme d'objet comprenant le type, la clé et le contenu
 * @returns liste des filtres sélectionnés comme objects
 */
export function getSelectedFiltersObjects(): FilterObject<string | Level>[] {
  const filters = get(allFilters)
  const levels: FilterObject<string | Level>[] = []
  // on regarde les niveaux
  Object.entries(filters).forEach(([filterType, filterObject]) => {
    Object.entries(filterObject).forEach(([key, obj]) => {
      if (key !== 'college' && key !== 'lycee') {
        if (obj.isSelected) {
          levels.push({ type: filterType as FilterType, key, content: obj })
        }
      }
    })
  })
  return levels
}

/**
 * Retourne la liste de toutes les fonctionnalités cochées (AMC, interactif)
 * @returns liste de toutes les fonctionnalités cochées
 */
export function getSelectedFeatures(): FilterableFeature[] {
  const filters = get(allFilters)
  const selectedFeatures: FilterableFeature[] = []
  Object.entries(filters.specs).forEach(([key, spec]) => {
    if (spec.isSelected) {
      selectedFeatures.push(key as FilterableFeature)
    }
  })
  return selectedFeatures
}

/**
 * Désélectionne les filtres lycée (ou collège) si une clé lycée (ou collège) est désélectionnée
 * @param {string} key clé à inspecter
 */
export function handleUncheckingMutipleFilters(key: string) {
  const filters = get(allFilters)
  const clgKeys = [...filters.levels.college.values]
  const lyceeKeys = [...filters.levels.lycee.values]
  if (clgKeys.includes(key)) {
    filters.levels.college.isSelected = false
  }
  if (lyceeKeys.includes(key)) {
    filters.levels.lycee.isSelected = false
  }
}

/**
 * Sur la base d'un référentiel passé en paramètre, construit un nouveau référentiel
 * sur la base de trois critères :
 * - les exercices AMC
 * - les exercices avec des QCM
 * - les exercices interactifs
 * - les niveaux de classe
 * @param {JSONReferentielObject} originalReferentiel Référentiel à filter
 * @param {boolean} isAmcOnlySelected flag pour limiter le référentiel aux exercices AMC
 * @param {boolean} isInteractiveOnlySelected flag pour limiter le référentiel aux exercices interactifs
 * @param {Level[]} levelsSelected flag pour limiter le référentiel aux exercices de certains niveaux
 * @returns {JSONReferentielObject} le référentiel filtré
 * @author sylvain
 */
export function updateReferentiel(
  isQcmOnlySelected: boolean,
  originalReferentiel: JSONReferentielObject,
  isAmcOnlySelected: boolean,
  isInteractiveOnlySelected: boolean,
  levelsSelected: Level[], // les seuls niveaux acceptés sont ceux stocké dans codeList
): JSONReferentielObject {
  // on récupère tous les exercices du référentiel passé en paramètre
  let filteredList: ResourceAndItsPath[] = getAllEndings(originalReferentiel)
  // on commence par créer les critères de filtration pour les spécificités (AMC et/ou Interactif)
  const features: ('amc' | 'interactif' | 'qcm')[] = []
  if (isAmcOnlySelected) {
    features.push('amc')
  }
  if (isInteractiveOnlySelected) {
    features.push('interactif')
  }
  if (isQcmOnlySelected) {
    features.push('qcm')
  }

  if (features.length !== 0) {
    // pas de liste de spécificités vide passée à `featuresCriteria`
    filteredList = featuresCriteria(features).meetCriterion(filteredList)
  }
  // on traite les niveaux

  switch (levelsSelected.length) {
    case 0:
      // pas de critère, on fait rie
      break
    case 1:
      // un seul critère, on l'applique à la liste
      filteredList = levelCriterion(levelsSelected[0]).meetCriterion(
        filteredList,
      )
      break
    default:
      // il y a au moins deux critères : un tableau de critères par niveau
      // puis union des critères
      {
        const levelsCriteria: Criterion<ResourceAndItsPath>[] = []
        for (const level of levelsSelected) {
          levelsCriteria.push(levelCriterion(level))
        }
        const [first, second, ...others] = [...levelsCriteria]
        const unionOfCriteria: Criterion<ResourceAndItsPath> =
          new AtLeastOneOfCriteria([first, second, ...others])
        filteredList = unionOfCriteria.meetCriterion(filteredList)
      }
      break
  }
  return buildReferentiel(filteredList)
}

/**
 * Applique les filtres sélectionnés dans le store à une liste d'élément
 * de type `ResourceAndItsPath` et renvoie une liste du même type triée
 * @param {ResourceAndItsPath[]} original liste originelle
 * @author sylvain
 */
export function applyFilters(
  collection: ResourceAndItsPath[],
): ResourceAndItsPath[] {
  const original = [...collection]
  // on récupère dans le store les niveaux et les fonctionnalités cochés
  const selectedLevels: Level[] = getSelectedLevels()
  const selectedSpecs: FilterableFeature[] = getSelectedFeatures()
  if (selectedLevels.length === 0 && selectedSpecs.length === 0) {
    // pas de filtre coché : on renvoie l'original
    return original
  } else {
    // on gère les niveaux cochés
    let finalLevelsCriterion: Criterion<ResourceAndItsPath> | undefined
    if (selectedLevels.length !== 0) {
      const levelsCriteria: Criterion<ResourceAndItsPath>[] = []
      for (const level of selectedLevels) {
        levelsCriteria.push(levelCriterion(level))
      }
      // au moins un niveau coché !
      if (levelsCriteria.length < 2) {
        // un seul niveau coché
        finalLevelsCriterion = levelsCriteria[0]
      } else {
        // au moins deux niveaux cochés, on fait l'UNION
        const [first, second, ...others] = [...levelsCriteria]
        finalLevelsCriterion = new AtLeastOneOfCriteria([
          first,
          second,
          ...others,
        ])
      }
    }
    // on gère les fonctionnalités (AMC, interactif)
    let specsCriteria: Criterion<ResourceAndItsPath> | undefined
    if (selectedSpecs.length !== 0) {
      specsCriteria = featuresCriteria(selectedSpecs)
    }
    if (finalLevelsCriterion !== undefined) {
      if (specsCriteria !== undefined) {
        // on a des niveaux ET des fonctionnalités cochés
        return new MultiCriteria<ResourceAndItsPath>()
          .addCriterion(finalLevelsCriterion)
          .addCriterion(specsCriteria)
          .meetCriterion(original)
      } else {
        // on a que des niveaux cochés
        return finalLevelsCriterion.meetCriterion(original)
      }
    } else {
      if (specsCriteria !== undefined) {
        // on a que des fonctionnalités cocées
        return specsCriteria.meetCriterion(original)
      }
    }
    return original
  }
}

export const filtersHaveChanged = writable<boolean>(false)
