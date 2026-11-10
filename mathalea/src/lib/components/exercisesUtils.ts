import { composeQuestionContext } from './questionContext'
import seedrandom from 'seedrandom'
import { get } from 'svelte/store'
import Exercice from '../../exercices/Exercice'
import referentielStaticCH from '../../json/referentielStaticCH.json'
import referentielStaticFR from '../../json/referentielStaticFRHydrated'
import {
  computeStaticExerciceCorTypUrl,
  computeStaticExerciceTypUrl,
  computeStaticExercicePngUrls,
  retrieveResourceFromUuid,
} from '../../lib/components/refUtils'
import {
  isBanqueExterneType,
  resourceHasPlace,
  type JSONReferentielObject,
} from '../../lib/types/referentiels'
import {
  mathaleaFormatExercice,
  mathaleaHandleExerciceSimple,
  mathaleaHandleParamOfOneExercice,
  mathaleaLoadExerciceFromUuid,
} from '../mathalea'
import { exercicesParams } from '../stores/generalStore'
import { globalOptions } from '../stores/globalOptions'
import type { IExercice, InterfaceParams } from '../types'
import { estUuidBanqueExterne } from '../types/banquesExternes'
import { isStatic } from './componentsUtils'
import { referentielMathadata } from './mathadataReferentiel'
import {
  preambuleBanque,
  referentielBanquesExternes,
} from '../stores/banquesExternesStore'

const allStaticReferentiels: JSONReferentielObject = {
  ...referentielStaticFR,
  ...referentielStaticCH,
  ...referentielMathadata,
}

// on supprime les entrées par thème qui entraîne des doublons
delete allStaticReferentiels['BrevetTags']
delete allStaticReferentiels['EVACOMTags']
delete allStaticReferentiels['E3CTags']
delete allStaticReferentiels['crpeTags']

/**
 * Référentiels statiques augmentés des banques externes chargées. Ces dernières
 * changeant en cours de session (ajout, suppression, lien partagé), la fusion
 * est refaite à chaque appel plutôt que figée au chargement du module.
 * @returns {JSONReferentielObject} référentiel dans lequel chercher un uuid statique
 */
function referentielsStatiques(): JSONReferentielObject {
  return { ...allStaticReferentiels, ...referentielBanquesExternes() }
}

/**
 * Construit un exercice à partir de ses paramètres (uuid, id, graine,
 * réglages), qu'il soit statique (annale scannée, banque externe) ou
 * aléatoire. Utilisé pour la liste complète d'une fiche
 * (`buildExercisesList`) comme pour un exercice isolé (aperçu de la modale
 * « Ajouter un exercice » de la vue Typst).
 * @param {InterfaceParams} paramsExercice paramètres de l'exercice
 * @returns {Promise<IExercice>} l'exercice chargé et paramétré
 */
export const buildExercise = (
  paramsExercice: InterfaceParams,
): Promise<IExercice> => {
  const options = get(globalOptions)
  if (isStatic(paramsExercice.uuid)) {
    return new Promise<IExercice>((resolve) => {
      const exo = new Exercice()
      exo.typeExercice = 'statique'
      exo.titre = `Uuid ${paramsExercice.uuid}`
      exo.listeQuestions[0] = ''
      exo.listeCorrections[0] = ''
      exo.nbQuestions = 1
      const foundResource = retrieveResourceFromUuid(
        referentielsStatiques(),
        paramsExercice.uuid,
      )
      if (resourceHasPlace(foundResource)) {
        exo.titre = `${foundResource.typeExercice.toUpperCase()} ${foundResource.mois || ''} ${foundResource.annee} ${foundResource.lieu} ${foundResource.jour || ''} Ex ${foundResource.numeroInitial}`
      } else if (
        foundResource !== null &&
        'titre' in foundResource &&
        typeof foundResource.titre === 'string' &&
        foundResource.titre.length > 0
      ) {
        // ressources titrées (banques externes, MathAdata) : sans cela le
        // titre affiché resterait l'uuid brut dans la vue Typst
        exo.titre = foundResource.titre
      }
      const pngUrls = computeStaticExercicePngUrls(foundResource)
      if (pngUrls != null) {
        exo.listeQuestions[0] = pngUrls.png
          .map(
            (url) =>
              `<img class="imageStatique" src="${url}" style="width: calc(100% * {zoomFactor})" alt="énoncé" />`,
          )
          .join('<br>')
        exo.listeCorrections[0] = pngUrls.pngCor
          .map(
            (url) =>
              `<img class="imageStatique" src="${url}" style="width: calc(100% * {zoomFactor})" alt="correction" />`,
          )
          .join('<br>')
      } else {
        exo.listeQuestions[0] = `Uuid ${paramsExercice.uuid}<br>`
        exo.listeCorrections[0] = `Uuid ${paramsExercice.uuid}<br>`
      }
      mathaleaHandleParamOfOneExercice(exo, paramsExercice)
      if (options.setInteractive === '1' && exo?.interactifReady) {
        exo.interactif = true
      }
      resolve(exo)
    })
  }
  return new Promise<IExercice>((resolve) => {
    mathaleaLoadExerciceFromUuid(paramsExercice.uuid).then((exo) => {
      if (typeof exo === 'undefined') {
        throw new Error(
          "L'exercice correspondant à l'uuid " +
            paramsExercice.uuid +
            " n'est pas défini...",
        )
      }
      mathaleaHandleParamOfOneExercice(exo, paramsExercice)
      if (options.setInteractive === '1' && exo?.interactifReady) {
        exo.interactif = true
      }
      resolve(exo)
    })
  })
}

/**
 * Construit la liste des exercices basée sur le contenu du store exercicesParams
 * @returns liste des exercices EN PROMESSE
 */
export const buildExercisesList = (
  filter: string[] = [],
): Promise<IExercice>[] => {
  const exosParams = get(exercicesParams)
  return exosParams
    .filter(
      (paramsExercice) =>
        filter.length === 0 || filter.includes(paramsExercice.uuid),
    )
    .map(buildExercise)
}

/**
 * Résout les images (énoncé et correction) et le titre lisible d'une
 * ressource statique (annale scannée, banque externe) à partir de son uuid.
 * Utilisé par la vue TBI, qui affiche ces ressources comme de simples images
 * faute d'énoncé rejouable.
 * @param uuid uuid de la ressource statique
 * @returns `{ png, pngCor, title }`, ou `null` si l'uuid n'est pas une
 * ressource statique connue (référentiel non chargé, uuid inconnu)
 */
export const getStaticExercicePngUrls = (
  uuid: string,
): { png: string[]; pngCor: string[]; title: string } | null => {
  const foundResource = retrieveResourceFromUuid(referentielsStatiques(), uuid)
  const pngUrls = computeStaticExercicePngUrls(foundResource)
  if (pngUrls == null) return null
  let title = uuid
  if (resourceHasPlace(foundResource)) {
    title = `${foundResource.typeExercice.toUpperCase()} ${foundResource.mois || ''} ${foundResource.annee} ${foundResource.lieu} ${foundResource.jour || ''} Ex ${foundResource.numeroInitial}`
  } else if (
    foundResource !== null &&
    'titre' in foundResource &&
    typeof foundResource.titre === 'string' &&
    foundResource.titre.length > 0
  ) {
    title = foundResource.titre
  }
  return {
    png: pngUrls.png ?? [],
    pngCor: pngUrls.pngCor ?? [],
    title,
  }
}

/**
 * Calcule l'URL locale du fichier source Typst d'une ressource statique
 * (annales DNB, BAC...), si son entrée de référentiel déclare la clé
 * `typ: true`. Utilisé par la vue Typst uniquement (voir `Typst.svelte`) :
 * les autres vues (QuestionParPage...) continuent d'afficher le png.
 * @param uuid uuid de la ressource statique
 * @returns l'URL relative du fichier `.typ`, ou `null` si non déclarée
 */
export const getStaticExerciceTypUrl = (uuid: string): string | null => {
  const foundResource = retrieveResourceFromUuid(referentielsStatiques(), uuid)
  return computeStaticExerciceTypUrl(foundResource)
}

/**
 * Calcule l'URL locale du fichier source Typst de la correction d'une
 * ressource statique (`<uuid>_cor.typ`), si son entrée de référentiel
 * déclare la clé `typ: true`. Utilisé par la vue Typst uniquement.
 * @param uuid uuid de la ressource statique
 * @returns l'URL relative du fichier `_cor.typ`, ou `null` si non déclarée
 */
export const getStaticExerciceCorTypUrl = (uuid: string): string | null => {
  const foundResource = retrieveResourceFromUuid(referentielsStatiques(), uuid)
  return computeStaticExerciceCorTypUrl(foundResource)
}

/**
 * Code Typst déclaré par le préambule des banques externes (`manifest.
 * preambule.typ`) dont un exercice figure dans la liste donnée, une seule
 * fois par banque même si elle fournit plusieurs exercices de la fiche.
 * Utilisé par la vue Typst pour personnaliser le document généré (voir
 * `Typst.svelte`), l'équivalent du `preambule.tex` côté LaTeX (`Latex.ts`).
 * @param uuids uuid des exercices de la fiche
 * @returns le code Typst à insérer, vide si aucune banque n'en déclare
 */
export const getBanquesExternesPreambuleTyp = (uuids: string[]): string => {
  const referentiel = referentielsStatiques()
  const idsBanques = new Set<string>()
  for (const uuid of uuids) {
    if (!estUuidBanqueExterne(uuid)) continue
    const ressource = retrieveResourceFromUuid(referentiel, uuid)
    if (ressource !== null && isBanqueExterneType(ressource)) {
      idsBanques.add(ressource.banque)
    }
  }
  return [...idsBanques]
    .map((id) => preambuleBanque(id)?.typ)
    .filter((typ): typ is string => typ !== undefined)
    .join('\n')
}

export const splitExercisesIntoQuestions = (
  exercices: IExercice[],
): {
  questions: (string | IExercice)[]
  consignes: string[]
  corrections: string[]
  consignesCorrections: string[]
  isCorrectionVisible: boolean[]
  indiceExercice: number[]
  indiceQuestionInExercice: number[]
} => {
  let questions: (string | IExercice)[] = []
  let consignes: string[] = []
  let corrections: string[] = []
  let consignesCorrections: string[] = []

  const isCorrectionVisible: boolean[] = []
  const indiceExercice: number[] = []
  const indiceQuestionInExercice: number[] = []

  for (const [k, exercice] of exercices.entries()) {
    exercice.score = 0
    exercice.numeroExercice = k
    if (exercice.typeExercice === 'simple') {
      mathaleaHandleExerciceSimple(exercice, exercice.interactif, k)
    } else {
      if (exercice.nouvelleVersionWrapper !== undefined) {
        if (exercice.seed !== undefined) {
          seedrandom(exercice.seed, { global: true })
        }
        exercice.nouvelleVersionWrapper(k)
      }
    }
    isCorrectionVisible[k] = false
    const cumulConsignesCorrections = []
    if (exercice.listeQuestions === undefined) {
      exercice.listeQuestions = []
    }
    if (exercice.listeCorrections === undefined) {
      exercice.listeCorrections = []
    }
    for (let i = 0; i < exercice.listeQuestions.length; i++) {
      consignes.push(composeQuestionContext(exercice))
      indiceExercice.push(k)
      indiceQuestionInExercice.push(i)
      if (exercice.consigneCorrection !== undefined) {
        cumulConsignesCorrections.push(exercice.consigneCorrection)
      }
    }
    let newQuestions: (string | IExercice)[] = exercice.listeQuestions.map(
      mathaleaFormatExercice,
    )
    let newCorrections: string[] = exercice.listeCorrections.map(
      mathaleaFormatExercice,
    )
    if (exercice.typeExercice === 'html') {
      newQuestions = [exercice]
      newCorrections = ['']
      cumulConsignesCorrections.push('')
      consignes.push('')
      indiceExercice.push(k)
      indiceQuestionInExercice.push(0)
    }
    questions = [...questions, ...newQuestions]
    corrections = [...corrections, ...newCorrections]
    consignesCorrections = [
      ...consignesCorrections,
      ...cumulConsignesCorrections,
    ].map(mathaleaFormatExercice)
    consignes = consignes.map(mathaleaFormatExercice)
  }

  return {
    questions,
    consignes,
    corrections,
    consignesCorrections,
    isCorrectionVisible,
    indiceExercice,
    indiceQuestionInExercice,
  }
}
