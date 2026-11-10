// Ce store est dédié au stockage des référentiels et des outils de leur évolution
import { get, writable } from 'svelte/store'
import referentielAleaCH from '../../json/referentiel2022CH.json'
import referentielAlea from '../../json/referentiel2022FR.json'
import referentielBibliotheque from '../../json/referentielBibliotheque.json'
import referentielGeometrieDynamique from '../../json/referentielGeometrieDynamique.json'
import referentielProfs from '../../json/referentielProfs.json'
import referentielRessources from '../../json/referentielRessources.json'
import referentielsActivation from '../../json/referentielsActivation.json'
import referentielExamsCH from '../../json/referentielStaticCH.json'
import referentielExams from '../../json/referentielStaticFRHydrated'
import {
  buildReferentiel,
  getAllEndings,
  getRecentExercices,
} from '../components/refUtils'
import { referentielMathadata } from '../components/mathadataReferentiel'
import { referentielBanquesExternes } from './banquesExternesStore'
import {
  sortArrayOfResourcesBasedOnPathThenId,
  triAnnales,
} from '../components/sorting'
import type { Language } from '../types/languages'
import type {
  ActivationName,
  JSONReferentielObject,
  ReferentielInMenu,
  ResourceAndItsPath,
} from '../types/referentiels'

function createOriginalReferentiels(lang: Language): ReferentielInMenu[] {
  const isFR = lang === 'fr-FR'
  const activations: Record<ActivationName, boolean> = {
    ...referentielsActivation,
  }

  // Référentiels de base selon la langue
  const baseReferentiel: JSONReferentielObject = isFR
    ? { ...referentielAlea }
    : { ...referentielAleaCH }
  const examsReferentiel: JSONReferentielObject = isFR
    ? { ...referentielExams }
    : { ...referentielExamsCH }

  // Référentiels communs
  const referentielOutils: JSONReferentielObject = { ...referentielProfs }
  const referentielHtml: JSONReferentielObject = { ...referentielRessources }
  const biblioReferentiel: JSONReferentielObject = {
    ...referentielBibliotheque,
  }
  const baseGeometrieDynamiqueReferentiel: JSONReferentielObject = {
    ...referentielGeometrieDynamique,
  }

  // "Égalité filles-garçons" : on la détache du référentiel scolaire
  // classique pour la ranger dans "Ressources partenaires", aux côtés de MathAdata.
  // On la fait passer par le même pipeline de tri que le référentiel principal
  // (getAllEndings -> sortArrayOfResourcesBasedOnPathThenId -> buildReferentiel)
  // pour éviter un tri alphabétique brut sur les id ('...-10' avant '...-8').
  const rawEgaliteFGReferentiel: JSONReferentielObject =
    (baseReferentiel['Égalité filles-garçons'] as JSONReferentielObject) || {}
  delete baseReferentiel['Égalité filles-garçons']
  const egaliteFGReferentiel: JSONReferentielObject =
    Object.keys(rawEgaliteFGReferentiel).length > 0
      ? buildReferentiel(
          sortArrayOfResourcesBasedOnPathThenId(
            getAllEndings(rawEgaliteFGReferentiel),
            rawEgaliteFGReferentiel,
          ),
        )
      : {}

  // Traitement des examens
  let examens = getAllEndings(examsReferentiel)
  if (!isFR) {
    examens = [...triAnnales(examens, 'desc')]
  }
  const orderedExamsReferentiel = buildReferentiel(examens)

  // Traitement des nouveautés
  const newExercises: ResourceAndItsPath[] = getRecentExercices(baseReferentiel)
  const newExercisesReferentiel: JSONReferentielObject = {}
  for (const item of newExercises) {
    newExercisesReferentiel[
      item.pathToResource[item.pathToResource.length - 1]
    ] = { ...item.resource }
  }

  // on trie les exercices aléatoires par chapitre (chemin dans le
  // référentiel) puis par ID ('4-C10' < '4-C10-1' <'4-C10-10'), afin de
  // préserver l'ordre des chapitres voulu par les auteurs (ex. 4C1 avant
  // 4C2) même quand un id d'exercice (comme 4C2QCM-01) trierait autrement
  // s'il était comparé seul.
  const baseAndNewsReferentiel: JSONReferentielObject = {
    Nouveautés: { ...newExercisesReferentiel },
    ...baseReferentiel,
  }
  let exercices = getAllEndings(baseAndNewsReferentiel)
  exercices = [
    ...sortArrayOfResourcesBasedOnPathThenId(
      exercices,
      baseAndNewsReferentiel,
    ),
  ]

  const aleaReferentiel = buildReferentiel(exercices)

  // Géométrie dynamique
  const exercicesGeometrieDynamique = getAllEndings(
    baseGeometrieDynamiqueReferentiel,
  )
  const geometrieDynamiqueReferentiel = buildReferentiel(
    exercicesGeometrieDynamique,
  )

  // Construction de la liste des référentiels selon la langue
  const allReferentielsInMenus: ReferentielInMenu[] = [
    {
      title: 'Exercices aléatoires',
      name: 'aleatoires',
      searchable: true,
      referentiel: aleaReferentiel,
    },
    ...(isFR
      ? [
          {
            title: 'Annales examens',
            name: 'examens' as ActivationName,
            searchable: true,
            referentiel: orderedExamsReferentiel,
          },
        ]
      : []),
    // Pour CH, les examens (EVACOM et TAF) sont commentés pour l'instant
    // {
    //   title: 'EVACOM et TAF',
    //   name: 'examens',
    //   searchable: true,
    //   referentiel: orderedExamsReferentiel,
    // },
    ...(isFR
      ? [
          {
            title: 'Ressources partenaires',
            name: 'partenaires' as ActivationName,
            searchable: true,
            referentiel: {
              ...referentielMathadata,
              ...(Object.keys(egaliteFGReferentiel).length > 0
                ? { 'Égalité filles-garçons': egaliteFGReferentiel }
                : {}),
              // banques ajoutées par l'utilisateur : chaque banque forme un
              // nœud de premier niveau portant le titre de son manifest
              ...referentielBanquesExternes(),
            },
          },
        ]
      : []),
    {
      title: 'Géométrie dynamique',
      name: 'geometrieDynamique',
      searchable: false,
      referentiel: geometrieDynamiqueReferentiel,
    },
    {
      title: 'Outils du professeur',
      name: 'outils',
      searchable: false,
      referentiel: referentielOutils,
    },
    {
      title: 'Vos ressources',
      name: 'ressources',
      searchable: false,
      referentiel: referentielHtml,
    },
    ...(isFR
      ? [
          {
            title: 'Bibliothèque',
            name: 'statiques' as ActivationName,
            searchable: false,
            referentiel: biblioReferentiel,
          },
        ]
      : []),
  ]

  // Filtrage selon les activations
  const activatedReferentielsInMenu: ReferentielInMenu[] = []
  for (const ref of allReferentielsInMenus) {
    if (activations[ref.name]) {
      activatedReferentielsInMenu.push(ref)
    }
  }

  return [...activatedReferentielsInMenu]
}

/**
 * Fabrique une liste de _vraies_ copies d'objets représentant les référentiels dans le menu.
 * Ces objet sont passés en paramètres sous la forme d'un tableau.
 * @param {ReferentielInMenu[]} originals liste de référentiels
 * @returns {ReferentielInMenu[]} liste des copies des référentiels
 */
export const deepReferentielInMenuCopy = (
  originals: ReferentielInMenu[],
): ReferentielInMenu[] => {
  const copy: ReferentielInMenu[] = []
  for (const item of originals) {
    const ref: ReferentielInMenu = {
      title: item.title,
      name: item.name,
      searchable: item.searchable,
      referentiel: { ...item.referentiel },
    }
    copy.push(ref)
  }
  return copy
}
// référentiel mutable utilisé par les composants
// MGu ne surtout pas le charger au départ, car c'est une variable globale,
// et donc l'arbre va être chargé quelque soit la page demandée...
// alors que c'est utile seulement pour menuside de la vue prof
// MGu pourquoi le mettre en storer, alors que finalement personne y souscrit ?
// Une variable globale aurait le même effet.
const referentiels = writable<ReferentielInMenu[]>([])

let localeLangLoaded: Language

export const getReferentiels = (lang: Language) => {
  referentiels.set(createOriginalReferentiels(lang))
  localeLangLoaded = lang
  // console.log('getReferentiels loaded', lang)
  return deepReferentielInMenuCopy(get(referentiels))
}

/**
 * Aplatit les référentiels cherchables en une liste de ressources pour la
 * recherche (menu latéral bureau et recherche de la vue mobile), en y
 * ajoutant les outils spéciaux (clavier, version).
 * @param {ReferentielInMenu[]} refList référentiels à inclure dans la recherche
 * @returns {ResourceAndItsPath[]} liste des ressources cherchables
 */
export const buildResourcesSet = (
  refList: ReferentielInMenu[],
): ResourceAndItsPath[] => {
  const result: ResourceAndItsPath[] = []
  const refList2 = deepReferentielInMenuCopy(refList)
  for (const item of refList2) {
    if (item.searchable) {
      if (item.referentiel.BrevetTags) {
        delete item.referentiel.BrevetTags
      }
      if (item.referentiel.E3CTags) {
        delete item.referentiel.E3CTags
      }
      if (item.referentiel.crpeTags) {
        delete item.referentiel.crpeTags
      }
      result.push(...getAllEndings(item.referentiel))
    }
  }
  const clavier: ResourceAndItsPath = {
    resource: {
      uuid: 'clavier',
      url: 'clavier',
      id: 'clavier',
      titre: 'clavier',
      typeExercice: 'outil',
      tags: [],
    },
    pathToResource: ['ClavierTest'],
  }
  const version: ResourceAndItsPath = {
    resource: {
      uuid: 'version',
      url: 'version',
      id: 'version',
      titre: 'version',
      typeExercice: 'outil',
      tags: [],
    },
    pathToResource: ['Version'],
  }
  result.push(clavier, version)
  return result
}
