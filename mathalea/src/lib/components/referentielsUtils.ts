import { get } from 'svelte/store'
import codeList from '../../json/codeToLevelList.json'
import referentiel from '../../json/referentiel2022FR.json'
import referentielsActivation from '../../json/referentielsActivation.json'
import referentielStaticCH from '../../json/referentielStaticCH.json'
import referentielStaticFR from '../../json/referentielStaticFRHydrated'
import { globalOptions } from '../stores/globalOptions'
import type { InterfaceReferentiel } from '../types'
import type { JSONReferentielObject } from '../types/referentiels'
import { isRecent } from './handleDate'
import { findDuplicates, findPropPaths } from './searching'
import { toMap } from './toMap'
// Réorganisation du référentiel
// Suppression de la rubrique calcul mental
// On renomme les chapitres pour la partie statique
const baseReferentiel: JSONReferentielObject = {
  ...referentiel,
  static: {
    ...referentielStaticFR,
    ...referentielStaticCH,
  },
}
if (get(globalOptions).beta) {
  // const second: JSONReferentielObject = referentiel2nd
  // Object.assign(baseReferentiel.static, { '2nd': second['2nd'] })
  // @ToDo afficher les exercices statiques de 2nd
  // if (baseReferentiel.static !== null) {
  //   baseReferentiel.static['2nd'] = { ...referentiel2nd }
  // }
}
delete baseReferentiel['Calcul mental']
let referentielMap = toMap(baseReferentiel)

type ReferentielTree = Record<string, unknown>
type ReferentielLeaf = Partial<InterfaceReferentiel> & { uuid: string }

function isReferentielTree(value: unknown): value is ReferentielTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isReferentielTree(value) &&
    Object.values(value).every((entry) => typeof entry === 'string')
  )
}

function isReferentielLeaf(value: unknown): value is ReferentielLeaf {
  return isReferentielTree(value) && typeof value.uuid === 'string'
}

function requireReferentielTree(
  value: unknown,
  context: string,
): ReferentielTree {
  if (!isReferentielTree(value)) {
    throw new Error(`Invalid referentiel tree: ${context}`)
  }
  return value
}

function requireStringRecord(
  value: unknown,
  context: string,
): Record<string, string> {
  if (!isStringRecord(value)) {
    throw new Error(`Invalid string record: ${context}`)
  }
  return value
}

const codeListMap = requireStringRecord(codeList, 'codeToLevelList.json')
const referentielRoot = requireReferentielTree(
  referentiel,
  'referentiel2022FR.json',
)

/**
 *
 * @param listOfEntries COnstruction d'un référentiel basé sur une liste d'entrée
 * @returns
 */
function buildReferentiel(listOfEntries: string[][]): ReferentielTree {
  const referentiel: ReferentielTree = {}
  for (const path of listOfEntries) {
    let schema: ReferentielTree = referentiel
    let obj: ReferentielTree = { ...baseReferentiel }
    for (let i = 0; i < path.length - 1; i++) {
      const elt = path[i]
      if (!schema[elt]) {
        schema[elt] = {}
      }
      schema = requireReferentielTree(schema[elt], `schema.${elt}`)
      const nextObj = obj[path[i]]
      obj = isReferentielTree(nextObj) ? { ...nextObj } : {}
    }
    schema[path[path.length - 1]] = obj[path[path.length - 1]]
  }
  return referentiel
}

/**
 * Détecter si une valeur est un objet
 * @param val valeur à analyser
 */
const isObject = (val: unknown) =>
  val && typeof val === 'object' && !Array.isArray(val)

/**
 * Construit un object contenant les références des exercices ayant une date
 * de modification ou de publication récente (<= 1mois)
 * en parcourant récursivement l'objet passé en paramètre
 * Inspiration : {@link https://stackoverflow.com/questions/15690706/recursively-looping-through-an-object-to-build-a-property-list/53620876#53620876}
 * @param {any} obj objet à parcourir (récursivement)
 * @return {[string]} objet des exos nouveaux
 * @author sylvain
 */
function getRecentExercises(obj: ReferentielTree): ReferentielTree {
  const recentExercises: ReferentielTree[] = []
  /**
   * On parcourt récursivement l'objet référentiel et on en profite pour peupler
   * le tableau recentExercises avec les exercices dont les dates de publication
   * ou de modification sont récentes
   * @param obj Objet à parcourir
   */
  const traverseObject = (tree: ReferentielTree): void => {
    for (const [key, value] of Object.entries(tree)) {
      if (!isObject(value)) {
        continue
      }
      if (isReferentielLeaf(value)) {
        if (
          (value.datePublication != null && isRecent(value.datePublication)) ||
          (value.dateModification != null && isRecent(value.dateModification))
        ) {
          recentExercises.push({ [key]: value })
        }
        continue
      }
      if (isReferentielTree(value)) {
        traverseObject(value)
      }
    }
  }
  traverseObject(obj)
  const recentExercisesAsObject: ReferentielTree = {}
  recentExercises.forEach((exo) => Object.assign(recentExercisesAsObject, exo))
  return recentExercisesAsObject
}

/**
 *
 * @param isAmcOnlySelected Tag pour le filtre AMC
 * @param isInteractiveOnlySelected tag pour le filtre Interactif
 * @param itemsAccepted Tableau des entrées filtrées
 * @returns tableau de tous les exercices filtrés
 */
export function updateReferentiel(
  isAmcOnlySelected: boolean,
  isInteractiveOnlySelected: boolean,
  itemsAccepted: string[],
) {
  // console.log(getRecentExercices(baseReferentiel))
  let filteredReferentiel: ReferentielTree = {}
  if (itemsAccepted.length === 0) {
    // pas de filtres sélectionnés
    filteredReferentiel = { ...referentielRoot }
  } else {
    filteredReferentiel = Object.keys(referentielRoot)
      .filter((key) => itemsAccepted.includes(key))
      .reduce<ReferentielTree>((obj, key) => {
        const ref = referentielRoot
        return {
          ...obj,
          [key]: ref[key],
        }
      }, {})
    // console.log("first list :")
    // console.log(filteredReferentiel)
  }
  // Construction du tableau des chemins vers les exercices ayant la propriété `amc` et/ou `interactif`
  if (isAmcOnlySelected && !isInteractiveOnlySelected) {
    const amcCompatible = findPropPaths(
      baseReferentiel,
      (key: string) => key === 'amc',
    ).map((elt) => elt.replace(/(?:\.tags\.amc)$/, '').split('.'))
    filteredReferentiel = { ...buildReferentiel(amcCompatible) }
  } else if (isInteractiveOnlySelected && !isAmcOnlySelected) {
    const interactiveCompatible = findPropPaths(
      baseReferentiel,
      (key: string) => key === 'interactif',
    ).map((elt) => elt.replace(/(?:\.tags\.interactif)$/, '').split('.'))
    filteredReferentiel = { ...buildReferentiel(interactiveCompatible) }
  } else if (isAmcOnlySelected && isInteractiveOnlySelected) {
    const amcCompatible = findPropPaths(
      baseReferentiel,
      (key: string) => key === 'amc',
    ).map((elt) => elt.replace(/(?:\.tags\.amc)$/, '').split('.'))
    const interactiveCompatible = findPropPaths(
      baseReferentiel,
      (key: string) => key === 'interactif',
    ).map((elt) => elt.replace(/(?:\.tags\.interactif)$/, '').split('.'))
    // garder que les doublons
    const bothCompatible = findDuplicates(
      amcCompatible.concat(interactiveCompatible),
    )
    filteredReferentiel = { ...buildReferentiel(bothCompatible) }
  }
  // Construction des entrées nouvelles dans la liste
  filteredReferentiel['Nouveautés'] = getRecentExercises(filteredReferentiel)
  const keysToBeFirst = { Nouveautés: null }
  filteredReferentiel = Object.assign(keysToBeFirst, filteredReferentiel)
  referentielMap = toMap(filteredReferentiel as JSONReferentielObject)
  return Array.from(referentielMap, ([key, obj]) => ({ key, obj }))
}

/**
 * Retrouve le titre d'un niveau basé sur son
 * @param levelId
 */
export function codeToLevelTitle(code: string) {
  if (code in codeListMap) {
    return codeListMap[code]
  } else {
    return code
  }
}

/**
 * Consulte le fichier `src/json/referentielsActivation.json`
 * et retourne la valeur d'activation `true`/`false` indiqué pour un nom de référentiel donné.
 * @param refName nom du référentiel (conformément au type `ReferentielNames` dans `src/lib/types.ts`)
 * @returns la valeur mentionnée dans `src/json/referentielsActivation.json` <br/> `false` si le nom du référentiel n'exoiste pas.
 */
export function isReferentielActivated(refName: string): boolean {
  const referentielList = toMap({ ...referentielsActivation })
  if (referentielList.has(refName)) {
    return referentielList.get(refName) === true
  } else {
    console.warn(refName + ' is not a valid referentiel name !')
    return false
  }
}
