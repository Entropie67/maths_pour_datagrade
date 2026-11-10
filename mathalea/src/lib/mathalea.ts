import Decimal from 'decimal.js'
import seedrandom from 'seedrandom'
import { get } from 'svelte/store'
import Exercice from '../exercices/Exercice'
import {
  CALCULATRICES_NON_FORCEES,
  isCalculatricesAutorisees,
  isCalculatricesForcees,
  type CalculatricesForcees,
} from './calculatrices'
import ExerciceSimple from '../exercices/ExerciceSimple'
import referentielStaticCH from '../json/referentielStaticCH.json'
import referentielStaticFR from '../json/referentielStaticFRHydrated'
import uuidToUrl from '../json/uuidsToUrlFR.json'
import { uuidCourant, uuidNouvelleVersion } from './uuidsRemplaces'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../lib/interactif/questionMathLive'
import {
  type IExercice,
  type IExerciceStatique,
  type InterfaceGlobalOptions,
  type InterfaceParams,
  type Valeur,
  isMathaleaCustomElementFormat,
  isValeur,
} from '../lib/types'
import { context } from '../modules/context'
import FractionEtendue from '../modules/FractionEtendue'
import Grandeur from '../modules/Grandeur'
import Hms from '../modules/Hms'
import { contraindreValeur } from '../modules/outils'
import {
  inferAmcOptionsFromAnswerType,
  inferNumericValueForAMC,
} from './amc/amcInferenceHelpers'
import { isStatic, isSvelte } from './components/componentsUtils'
import {
  showDialogForLimitedTime,
  showPopupAndWait,
} from './components/dialogs'
import { referentielMathadata } from './components/mathadataReferentiel'
import { retrieveResourceFromUuid } from './components/refUtils'
import { resizeContent } from './components/sizeTools'
import { delay } from './components/time'
import { decrypt, isCrypted } from './components/urls'
import { checkForServerUpdate } from './components/version'
import { createURL } from './createURL'
import type { ExerciseModule } from './exerciseModules'
import { listOfCustomElements } from './customElements/MathaleaCustomElement'
import { attachExerciseCustomCallbacks } from './customElements/MetaCustomElement'
import { sendToCapytaleMathaleaHasChanged } from './handleCapytale'
import { isHtmlDocumentText } from './httpResponses'
import { normaliseCoeffBareme } from './interactif/baremeExercice'
import { fonctionComparaison } from './interactif/comparisonFunctions'
import { handleAnswers } from './interactif/gestionInteractif'
import { mettreEnEvidenceSelonMode } from './interactif/alignerMiseEnEvidenceQcm'
import { formaterReponse } from './outils/ecritures'
import { buildSimpleVersionQcm } from './interactif/qcmBuilder'
import { getDistracteurs } from './interactif/qcmDistractors'
import { renderKatex } from './latex/renderKatex'
import { Complexe } from './mathFonctions/Complexe'
import { renderScratchDiv } from './renderScratch'
import { referentielBanquesExternes } from './stores/banquesExternesStore'
import { canOptions } from './stores/canStore'
import {
  appendGlobalOptionsToURL,
  exercicesParams,
  freezeUrl,
  presModeId,
  updateGlobalOptionsInURL,
} from './stores/generalStore'
import { globalOptions } from './stores/globalOptions'
import { isFormatNumeriqueSaved } from './stores/storage'
import {
  getLang,
  localisedIDToUuid,
  referentielLocale,
  updateURLFromReferentielLocale,
} from './stores/languagesStore'
import { estUuidBanqueExterne } from './types/banquesExternes'
import {
  isIntegerInRange0to2,
  isIntegerInRange0to4,
  isIntegerInRange1to4,
} from './types/integerInRange'
import { type VueType, convertVueType } from './VueType'

export { getDistracteurs } from './interactif/qcmDistractors'
export { renderKatex } from './latex/renderKatex'

const ERROR_MESSAGE =
  'Erreur - Veuillez actualiser la page et nous contacter si le problème persiste.'

function getExerciceByUuid(
  root: { [key: string]: any },
  targetUUID: string,
): object | null {
  if ('uuid' in root) {
    if (root.uuid === targetUUID) {
      return root
    }
  }
  for (const child in root) {
    if (typeof root[child] !== 'object') continue
    const foundObject = getExerciceByUuid(root[child], targetUUID)
    if (foundObject) {
      return foundObject
    }
  }

  return null
}

/*
 Chargement d'un composant SVELTE
 ATTENTION : oliger d'être daans ce répertoire, sinon différence entre le serveur de test et de production
*/
export async function getSvelteComponent(paramsExercice: InterfaceParams) {
  const urlExercice = uuidToUrl[paramsExercice.uuid as keyof typeof uuidToUrl]

  let filename, directory
  if (urlExercice) {
    ;[filename, directory] = urlExercice
      .replaceAll('\\', '/')
      .split('/')
      .reverse()
  }
  try {
    if (filename && filename.includes('.svelte')) {
      return (
        await import(
          `../exercicesInteractifs/${directory === undefined ? '' : `${directory}/`}${filename.replace('.svelte', '')}.svelte`
        )
      ).default
    }
  } catch (err) {
    console.error(
      `Chargement de l'exercice ${paramsExercice.uuid} impossible. Vérifier  ${directory === undefined ? '' : `${directory}/`}${filename}`,
    )
  }
  throw new Error(
    `Chargement de l'exercice ${paramsExercice.uuid} impossible. Vérifier ${directory === undefined ? '' : `${directory}/`}${filename}`,
  )
}

// Vérification serveur réelle
async function checkHEAD(
  url: string,
): Promise<{ reachable: boolean; status: number | null }> {
  // 1. Tentative CORS (pour obtenir status si possible)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'cors',
    })

    // Ici, CORS autorise → on a un vrai statut
    console.log('🔍 CORS OK → vrai statut :', res.status)

    return {
      reachable: true,
      status: res.status,
    }
  } catch (err) {
    console.warn('⚠️ CORS a bloqué ou autre erreur :', err)
  }

  // 2. Fallback NO-CORS : détecter si le serveur répond (statut inaccessible)
  try {
    await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors',
    })

    // Si on arrive ici → le serveur a répondu, mais sans CORS
    console.log('🌐 Serveur répond (no-cors), statut inaccessible')

    return {
      reachable: true,
      status: null, // on ne peut pas savoir
    }
  } catch (err) {
    console.error('❌ Serveur totalement injoignable :', err)

    return {
      reachable: false,
      status: null,
    }
  }
}

/**
 * Charge un exercice depuis son uuid
 * Exemple : const exercice = loadExercice('3cvng')
 * @param {string} url
 * @returns {Promise<Exercice>} exercice
 */
export async function mathaleaLoadExerciceFromUuid(uuid: string) {
  const url = uuidToUrl[uuidCourant(uuid) as keyof typeof uuidToUrl]
  let filename, directory
  if (url) {
    ;[filename, directory] = url.replaceAll('\\', '/').split('/').reverse()
  } else {
    console.error(`UUID introuvable dans uuidToUrl: ${uuid}`)
    window.notify(`L'exercice n'existe pas avec la référence uuid:${uuid}`, {
      exercicesParams: get(exercicesParams),
    })

    const exercice = new Exercice()
    exercice.titre = `L'exercice n'existe pas ou plus avec la référence uuid:${uuid}`
    exercice.nouvelleVersion = () => {}
    return exercice as IExercice
  }
  let attempts = 0
  const maxAttempts = 3
  while (attempts < maxAttempts) {
    let pathToCheck: string = ''
    try {
      pathToCheck = `../exercices/${url.replaceAll('\\', '/')}`
      const { loadExerciseModule } = await import('./exerciseModules')
      const module = await loadExerciseModule(pathToCheck)

      const ClasseExercice = module.default
      const exercice = new ClasseExercice()

      // Définir explicitement les propriétés à copier
      type OptionalExerciceProps =
        'titre' | 'amcReady' | 'amcType' | 'interactifReady'

      const propsToClone: OptionalExerciceProps[] = [
        'titre',
        'amcReady',
        'amcType',
        'interactifReady',
      ]

      propsToClone.forEach((prop) => {
        if (module[prop as keyof ExerciseModule] !== undefined) {
          // Assertion sûre après vérification
          ;(exercice as Record<string, any>)[prop] =
            module[prop as keyof ExerciseModule]
        }
      })

      exercice.id = filename
      exercice.titre =
        (uuidNouvelleVersion(uuidCourant(uuid)) ||
          /-old\d*\.[jt]s$/i.test(url)) &&
        !exercice.titre.toLowerCase().includes('ancienne version')
          ? exercice.titre + ' (ancienne version)'
          : exercice.titre
      return exercice as IExercice
    } catch (error) {
      attempts++
      const serverUpdated = await checkForServerUpdate()
      if (serverUpdated) {
        await showPopupAndWait()
      }
      if (pathToCheck !== '') {
        // ---- Extraction du vrai chemin dans l'erreur ----
        let url: string = ''
        if (error instanceof Error && error.message) {
          // on recupère la vraie requete pour trouver le chunk qui pose problème
          const match = error.message.match(/https?:\/\/[^\s)]+/)
          if (match) url = match[0]
        }

        if (url !== '') {
          const exists = await checkHEAD(url)
          // Si exists = false → bingo, c’est un problème de disponibilité du chunk.
          // si exists = true MAIS l'import échoue → problème HTTP/2 / compression / LSCache.
          // Dans les deux cas → infrastructure, pas ton code.
          window.notify(
            `Load failed: ${url} (exists on server: ${exists.reachable} status: ${exists.status})`,
            { error, exists },
          )
        }
      }
      window.notify(
        `Un exercice ne s'est pas affiché ${attempts} fois: uuid:${uuid} ,filename: ${directory}/${filename}, serverUpdated: ${serverUpdated}`,
        { error },
      )
      if (attempts === maxAttempts) {
        console.error(
          `Chargement de l'exercice ${uuid} impossible. Vérifier ${directory}/${filename}`,
        )
        console.error(error)
        const exercice = new Exercice()
        exercice.titre = ERROR_MESSAGE
        exercice.nouvelleVersion = () => {}
        return exercice as IExercice
      } else {
        await delay(1000)
      }
    }
  }
  const exercice = new Exercice()
  exercice.titre = ERROR_MESSAGE
  exercice.nouvelleVersion = () => {}
  return exercice as IExercice
}

/**
 * Télécharge la source LaTeX d'un exercice de banque externe, si la banque en
 * fournit une. L'URL est déjà résolue par le store (`blob:` pour une banque
 * zip, API de la forge pour un dépôt).
 * @param {string} url URL du fichier `.tex`, vide si la banque n'en déclare pas
 * @returns {Promise<string|null>} le code LaTeX, ou `null` s'il est indisponible
 */
async function recupererSourceLatexDeBanque(
  url: string,
): Promise<string | null> {
  if (typeof url !== 'string' || url.length === 0) return null
  try {
    const response = await window.fetch(url)
    if (!response.ok) return null
    const text = await response.text()
    if (isHtmlDocumentText(text) || text.trim().length === 0) return null
    return text
  } catch {
    return null
  }
}

/**
 * Charge tous les exercices et les paramètres
 * en fonction du store exercicesParams.
 */
export async function mathaleaGetExercicesFromParams(
  params: InterfaceParams[],
): Promise<(IExercice | IExerciceStatique)[]> {
  const exercices = []
  for (const param of params) {
    if (estUuidBanqueExterne(param.uuid)) {
      // Banque externe : la source LaTeX est facultative (une banque peut n'être
      // qu'en png et/ou Typst). Quand elle manque, on produit tout de même une
      // entrée commentée pour que l'exercice ne disparaisse pas silencieusement
      // de l'export LaTeX/PDF.
      const ressource = retrieveResourceFromUuid(
        referentielBanquesExternes(),
        param.uuid,
      )
      const titre =
        ressource !== null && 'titre' in ressource && ressource.titre
          ? ressource.titre
          : param.uuid
      const texUrl =
        ressource !== null && 'tex' in ressource ? ressource.tex : ''
      const texCorUrl =
        ressource !== null && 'texCor' in ressource ? ressource.texCor : ''
      exercices.push({
        typeExercice: 'statique',
        uuid: param.uuid,
        content:
          (await recupererSourceLatexDeBanque(texUrl)) ??
          `\n\n\t%« ${titre} » : pas de source LaTeX dans cette banque.\n\n`,
        contentCorr:
          (await recupererSourceLatexDeBanque(texCorUrl)) ??
          '\n\n\t%Pas de correction LaTeX disponible\n\n',
        examen: '',
        titre: titre !== param.uuid ? titre : undefined,
      } as IExerciceStatique)
      continue
    }
    if (
      param.uuid.substring(0, 4) === 'crpe' ||
      param.uuid.substring(0, 4) === 'dnb_' ||
      param.uuid.startsWith('dnbpro_') ||
      param.uuid.substring(0, 4) === 'e3c_' ||
      param.uuid.startsWith('eam_') ||
      param.uuid.substring(0, 4) === 'bac_' ||
      param.uuid.startsWith('sti2d_') ||
      param.uuid.substring(0, 7) === 'evacom_' ||
      param.uuid.startsWith('2nd_') ||
      param.uuid.startsWith('md-')
    ) {
      const infosExerciceStatique =
        param.uuid.substring(0, 7) === 'evacom_'
          ? getExerciceByUuid(referentielStaticCH, param.uuid)
          : param.uuid.startsWith('md-')
            ? getExerciceByUuid(referentielMathadata, param.uuid)
            : getExerciceByUuid(referentielStaticFR, param.uuid)

      // Vérifier que infosExerciceStatique n'est pas null
      if (!infosExerciceStatique) {
        throw new Error(
          `Informations introuvables pour l'exercice statique avec l'UUID : ${param.uuid}`,
        )
      }

      let content = ''
      let contentCorr = ''
      const sujet = param.uuid.split('_')[0]
      if (
        sujet === 'dnb' ||
        sujet === 'dnbpro' ||
        sujet === 'bac' ||
        sujet === 'eam' ||
        sujet === 'sti2d' ||
        sujet === 'stl'
      ) {
        if ('annee' in infosExerciceStatique) {
          let response = await window.fetch(
            `static/${sujet}/${infosExerciceStatique.annee}/tex/${param.uuid}.tex`,
          )
          if (response.status === 200) {
            const text = await response.clone().text()
            if (!isHtmlDocumentText(text)) {
              content = text
            } else {
              content = '\n\n\t%Exercice non disponible\n\n'
            }
          }
          response = await window.fetch(
            `static/${sujet}/${infosExerciceStatique.annee}/tex/${param.uuid}_cor.tex`,
          )
          if (response.status === 200) {
            const text = await response.clone().text()
            if (!isHtmlDocumentText(text)) {
              contentCorr = text
            } else {
              contentCorr = '\n\n\t%Pas de correction disponible\n\n'
            }
          }
        }
      } else {
        if (infosExerciceStatique && 'url' in infosExerciceStatique) {
          const response = await window.fetch(
            infosExerciceStatique.url as string,
          )
          if (response.status === 200) {
            const text = await response.clone().text()
            if (!isHtmlDocumentText(text)) {
              content = text
            } else {
              content = '\n\n\t%Exercice non disponible\n\n'
            }
          }
        }
        if (infosExerciceStatique && 'urlcor' in infosExerciceStatique) {
          const response = await window.fetch(
            infosExerciceStatique.urlcor as string,
          )
          if (response.status === 200) {
            const text = await response.clone().text()
            if (!isHtmlDocumentText(text)) {
              contentCorr = text
            } else {
              contentCorr = '\n\n\t%Pas de correction disponible\n\n'
            }
          }
        }
      }
      const annee =
        'annee' in infosExerciceStatique
          ? infosExerciceStatique.annee
          : undefined
      const lieu =
        'lieu' in infosExerciceStatique ? infosExerciceStatique.lieu : undefined
      const mois =
        'mois' in infosExerciceStatique ? infosExerciceStatique.mois : undefined
      const numeroInitial =
        'numeroInitial' in infosExerciceStatique
          ? infosExerciceStatique.numeroInitial
          : undefined
      let examen: string = ''
      if (param.uuid.substring(0, 4) === 'crpe') examen = 'CRPE'
      if (param.uuid.substring(0, 4) === 'dnb_') examen = 'DNB'
      if (param.uuid.startsWith('dnbpro_')) examen = 'DNBPRO'
      if (param.uuid.substring(0, 4) === 'e3c_') examen = 'E3C'
      if (param.uuid.substring(0, 4) === 'bac_') examen = 'BAC'
      if (param.uuid.startsWith('sti2d_')) examen = 'STI2D'
      if (param.uuid.startsWith('stl_')) examen = 'STL'
      if (param.uuid.substring(0, 7) === 'evacom_') examen = 'EVACOM'
      exercices.push({
        typeExercice: 'statique',
        uuid: param.uuid,
        content,
        contentCorr,
        annee,
        lieu,
        mois,
        numeroInitial,
        examen,
        titre:
          'titre' in infosExerciceStatique &&
          typeof infosExerciceStatique.titre === 'string'
            ? infosExerciceStatique.titre
            : undefined,
      } as IExerciceStatique)
    } else {
      const exercice = await mathaleaLoadExerciceFromUuid(param.uuid)
      if (typeof exercice === 'undefined') continue
      mathaleaHandleParamOfOneExercice(exercice, param)
      exercices.push(exercice)
    }
  }
  return exercices
}

/**
 * Applique les paramètres sauvegardés dans un élément de exercicesParams à un exercice.
 */
export function mathaleaHandleParamOfOneExercice(
  exercice: IExercice,
  param: InterfaceParams,
) {
  exercice.uuid = param.uuid
  // Un `n` d'URL (souvent recopié d'un lien plus ancien ou généré automatiquement)
  // ne doit pas forcer le nombre de questions d'un exercice qui l'a verrouillé
  // (`nbQuestionsModifiable === false`) : plusieurs de ces exercices — dont les
  // exercices apiGeom qui se corrigent eux-mêmes (5G1B-3 / 3AutoG01-1) — ne
  // savent produire qu'une seule question et se retrouvent sinon avec un énoncé
  // et une correction issus de tirages différents.
  if (param.nbQuestions && exercice.nbQuestionsModifiable !== false)
    exercice.nbQuestions = param.nbQuestions
  exercice.duration = param.duration ?? 10
  if (param.id) exercice.id = param.id
  if (param.sup) exercice.sup = mathaleaHandleStringFromUrl(param.sup)
  if (param.sup2) exercice.sup2 = mathaleaHandleStringFromUrl(param.sup2)
  if (param.sup3) exercice.sup3 = mathaleaHandleStringFromUrl(param.sup3)
  if (param.sup4) exercice.sup4 = mathaleaHandleStringFromUrl(param.sup4)
  if (param.sup5) exercice.sup5 = mathaleaHandleStringFromUrl(param.sup5)
  if (param.versionQcm !== undefined && exercice instanceof ExerciceSimple)
    exercice.versionQcm = param.versionQcm === '1'
  exercice.coeffBareme = normaliseCoeffBareme(param.coeffBareme)
  if (param.interactif) exercice.interactif = param.interactif === '1'
  // Un exercice interactif obligatoire ne possède pas de version HTML non
  // interactive. Ce réglage est donc prioritaire sur celui de l'URL.
  if (exercice.interactifObligatoire) {
    exercice.interactif = true
    if (param.interactif !== '1') {
      param.interactif = '1'
      // Le paramètre appartient généralement au store : notifier ses abonnés
      // permet notamment de réécrire immédiatement l'URL partagée.
      if (get(exercicesParams).includes(param)) {
        exercicesParams.update((params) => params)
      }
    }
  }
  if (param.alea) exercice.seed = param.alea
  if (param.cols !== undefined && param.cols > 1) exercice.nbCols = param.cols
  if (param.cd !== undefined) exercice.correctionDetaillee = param.cd === '1'
  if (param.tip !== undefined) exercice.tipAvailable = param.tip === '1'
  exercice.calculatrices = isCalculatricesAutorisees(param.calc)
    ? param.calc
    : '0'
  if (exercice.seed === undefined) {
    exercice.seed = mathaleaGenerateSeed()
  }
}

/**
 * sup, sup2, sup3 et sup4 permettent de sauvegarder les formulaires modifiées par
 * les enseignants pour pparamétrer les exercices.
 * Ces paramètres peuvent être des strings, des booléens ou des number mais que ce soit dans l'url
 * ou dans le store exercicesParams, ils sont sauvegardés sous forme de string d'où cette fonction de conversion
 * d'un des trois types vers string.
 */
export function mathaleaHandleSup(param: boolean | string | number): string {
  if (typeof param === 'string') {
    return param
  } else if (typeof param === 'number') {
    return param.toString()
  } else {
    // if (typeof param === 'boolean')
    return param ? 'true' : 'false'
  }
}

/**
 * sup, sup2, sup3 et sup4 permettent de sauvegarder les formulaires modifiées par
 * les enseignants pour paramétrer les exercices.
 * Ces paramètres peuvent être des strings, des booléens ou des numbers mais que ce soit dans l'url
 * ou dans le store exercicesParams, ils sont sauvegardés sous forme de string d'où cette fonction de conversion
 * du string vers booléen ou number.
 */
export function mathaleaHandleStringFromUrl(
  text: string,
): boolean | number | string {
  if (text === 'true' || text === 'false') {
    // "true"=>true
    return text === 'true'
  } else if (/^(0|[1-9]\d*)$/.test(text)) {
    // "17"=>17
    return parseInt(text)
  } else {
    return text
  }
}

export function mathaleaRenderDiv(
  div: HTMLElement | null,
  zoom?: number,
): void {
  if (!div) return
  const params = get(globalOptions)
  zoom = zoom ?? Number(params.z)

  renderKatex(div)
  renderKatexInAllShadowRoots(div)
  renderScratchDiv(div ?? document.body)
  if (zoom !== -1) {
    resizeContent(div, zoom)
  }
}

export function renderDiv(HtmlElement: HTMLElement, _content: string) {
  mathaleaRenderDiv(HtmlElement, -1)
}

/**
 * Modifie l'url courante avec le store exercicesParams ou un tableau similaire
 * sauf si le store freezeUrl est à true (utile sur un site externe)
 */
export function mathaleaUpdateUrlFromExercicesParams(
  params?: InterfaceParams[],
) {
  if (get(globalOptions).recorder === 'capytale') {
    sendToCapytaleMathaleaHasChanged()
  }
  if (get(freezeUrl) === true) return
  if (params === undefined) {
    params = get(exercicesParams)
  }
  const url = createURL(params)
  updateURLFromReferentielLocale(url)
  updateGlobalOptionsInURL(url)
}

/**
 * URL de l'état courant (exercices, options, réglages de la vue), sans
 * attendre son écriture différée dans la barre d'adresse
 */
export function mathaleaBuildUrlFromExercicesParams(): URL {
  const url = createURL(get(exercicesParams))
  updateURLFromReferentielLocale(url)
  appendGlobalOptionsToURL(url)
  return url
}

/**
 * Analyse l'url courante de la fenêtre
 * pour mettre à jour exercicesParams
 * avec tous les exercices et les options
 * @returns vue
 */
export function mathaleaUpdateExercicesParamsFromUrl(
  urlString = window.location.href,
): InterfaceGlobalOptions {
  const currentRefToUuid = localisedIDToUuid[get(referentielLocale)]
  let urlNeedToBeFreezed = false
  let v: VueType | undefined
  let z = '1'
  let durationGlobal = 0
  let durationCorrection: number | undefined
  let ds
  let nbVues: 1 | 2 | 3 | 4 = 1
  let flow: 0 | 1 | 2 = 0
  let screenBetweenSlides
  let pauseAfterEachQuestion
  let isImagesOnSides = false
  let sound: 0 | 1 | 2 | 3 | 4 = 0
  let shuffle = false
  let manualMode
  let select: number[] = []
  let order: number[] = []
  let title = ''
  let iframe = ''
  let answers = ''
  let subject = ''
  let quizzParam = ''
  let quizzRole: 'manager' | 'player' | undefined
  let pin = ''
  let gameId = ''
  let recorder:
    | 'capytale'
    | 'moodle'
    | 'labomep'
    | 'anki'
    | 'flowmath'
    | 'sesatheque'
    | undefined
  let done: '1' | undefined
  let es
  let numerique = false
  let presMode:
    | 'liste_exos'
    | 'un_exo_par_page'
    | 'une_question_par_page'
    | 'recto'
    | 'verso' = 'liste_exos'
  let setInteractive = '2'
  let calculatricesForcees: CalculatricesForcees = CALCULATRICES_NON_FORCEES
  let isSolutionAccessible = true
  let isInteractiveFree = true
  let oneShot = false
  let twoColumns = false
  let isTitleDisplayed = true
  let isReferenceDisplayed = true
  let isCorrectionOnlyOnError = false
  let isCheckPerQuestion = false
  let beta = false
  let cor = false
  let url: URL
  let canDuration = 540
  let canMainTitle = 'Course aux Nombres'
  let canTitle = ''
  let canSolAccess = true
  let canSolMode = 'gathered'
  let canIsInteractive = true
  let canIsTimerDisabled = false
  let canSecondsPerQuestion: number | undefined
  let canFeedbackEach = false
  try {
    url = new URL(urlString)
  } catch (error) {
    return {}
  }
  // let url = new URL(urlString)
  // Le site est considéré « beta » dès qu'on développe en local, sans avoir
  // à ajouter `&beta` à l'URL (le paramètre `beta` reste géré plus bas pour
  // les autres hôtes).
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  if (isLocal) {
    beta = true
  }
  if (isCrypted(url)) {
    urlNeedToBeFreezed = true
    url = decrypt(url)
  }
  const decodedPathname = decodeURIComponent(url.pathname)
  const legacyPathSegmentMatch = decodedPathname.match(/\/&([^/].*)$/)
  const legacyQueryFromPath =
    url.search.length === 0 && legacyPathSegmentMatch != null
      ? legacyPathSegmentMatch[1]
      : ''
  const searchParams =
    legacyQueryFromPath.length > 0
      ? new URLSearchParams(legacyQueryFromPath)
      : url.searchParams
  const entries = searchParams.entries()
  let indiceExercice = -1
  const newExercisesParams: InterfaceParams[] = []
  let previousEntryWasUuid = false
  try {
    for (const entry of entries) {
      if (entry[0] === 'uuid') {
        indiceExercice++
        const uuid = uuidCourant(entry[1])
        if (!newExercisesParams[indiceExercice])
          newExercisesParams[indiceExercice] = { uuid, id: undefined }
        newExercisesParams[indiceExercice].uuid = uuid // string
        newExercisesParams[indiceExercice].interactif = '0' // par défaut
      } else if (entry[0] === 'id' && previousEntryWasUuid) {
        // La référence précise choisie par l'utilisateur pour ce uuid :
        // on ne la remplace par une référence par défaut que si elle ne
        // correspond pas au uuid annoncé juste avant (URL corrompue ou obsolète)
        const id = entry[1]
        const uuid = newExercisesParams[indiceExercice].uuid
        if (currentRefToUuid[id as keyof typeof currentRefToUuid] === uuid) {
          newExercisesParams[indiceExercice].id = id
        }
      } else if (entry[0] === 'id' && !previousEntryWasUuid) {
        indiceExercice++
        const id = entry[1]
        const uuid = currentRefToUuid[id as keyof typeof currentRefToUuid]
        if (!newExercisesParams[indiceExercice])
          newExercisesParams[indiceExercice] = { id, uuid }
      } else if (entry[0] === 'n') {
        newExercisesParams[indiceExercice].nbQuestions = parseInt(entry[1]) // int
      } else if (entry[0] === 'd') {
        newExercisesParams[indiceExercice].duration = parseInt(entry[1]) // int
      } else if (entry[0] === 's') {
        newExercisesParams[indiceExercice].sup = entry[1]
      } else if (entry[0] === 's2') {
        newExercisesParams[indiceExercice].sup2 = entry[1]
      } else if (entry[0] === 's3') {
        newExercisesParams[indiceExercice].sup3 = entry[1]
      } else if (entry[0] === 's4') {
        newExercisesParams[indiceExercice].sup4 = entry[1]
      } else if (entry[0] === 's5') {
        newExercisesParams[indiceExercice].sup5 = entry[1]
      } else if (entry[0] === 'qcm' && (entry[1] === '0' || entry[1] === '1')) {
        newExercisesParams[indiceExercice].versionQcm = entry[1]
      } else if (entry[0] === 'coef') {
        newExercisesParams[indiceExercice].coeffBareme = normaliseCoeffBareme(
          entry[1],
        )
      } else if (entry[0] === 'alea') {
        newExercisesParams[indiceExercice].alea = entry[1]
      } else if (entry[0] === 'cols') {
        newExercisesParams[indiceExercice].cols = parseInt(entry[1])
      } else if (entry[0] === 'i' && (entry[1] === '0' || entry[1] === '1')) {
        newExercisesParams[indiceExercice].interactif = entry[1]
      } else if (entry[0] === 'cd' && (entry[1] === '0' || entry[1] === '1')) {
        newExercisesParams[indiceExercice].cd = entry[1]
      } else if (entry[0] === 'tip' && (entry[1] === '0' || entry[1] === '1')) {
        newExercisesParams[indiceExercice].tip = entry[1]
      } else if (entry[0] === 'calc' && isCalculatricesAutorisees(entry[1])) {
        newExercisesParams[indiceExercice].calc = entry[1]
      } else if (entry[0] === 'v') {
        v = convertVueType(entry[1].trim().toLowerCase())
      } else if (entry[0] === 'recorder') {
        if (
          entry[1] === 'capytale' ||
          entry[1] === 'moodle' ||
          entry[1] === 'labomep' ||
          entry[1] === 'anki' ||
          entry[1] === 'flowmath' ||
          entry[1] === 'sesatheque'
        ) {
          recorder = entry[1]
        }
      } else if (entry[0] === 'done' && entry[1] === '1') {
        done = '1'
      } else if (entry[0] === 'z') {
        // Un zoom négatif ou nul n'a pas de sens (liens anciens ou mal formés) : on l'ignore
        z = Number(entry[1]) <= 0 ? '1' : entry[1]
      } else if (entry[0] === 'dGlobal') {
        durationGlobal = parseInt(entry[1])
      } else if (entry[0] === 'dCorr') {
        durationCorrection = parseInt(entry[1]) || undefined
      } else if (entry[0] === 'shuffle') {
        shuffle = true
      } else if (entry[0] === 'select') {
        select = entry[1].split('-').map((e) => parseInt(e))
      } else if (entry[0] === 'order') {
        order = entry[1].split('-').map((e) => parseInt(e))
      } else if (entry[0] === 'ds') {
        ds = entry[1]
      } else if (entry[0] === 'es') {
        es = entry[1]
      } else if (entry[0] === 'numerique' && entry[1] === '1') {
        numerique = true
      } else if (entry[0] === 'title') {
        title = decodeURIComponent(entry[1])
      } else if (entry[0] === 'subject') {
        // entries() fournit déjà une valeur décodée : affectation directe
        // (un titre de quizz peut contenir un '%' littéral)
        subject = entry[1]
      } else if (entry[0] === 'quizzParam') {
        quizzParam = entry[1]
      } else if (entry[0] === 'quizzRole') {
        // Rôle dans une partie multi-joueurs (vue quizz)
        if (entry[1] === 'manager' || entry[1] === 'player') {
          quizzRole = entry[1]
        }
      } else if (entry[0] === 'pin') {
        pin = entry[1]
      } else if (entry[0] === 'gameId') {
        gameId = entry[1]
      } else if (entry[0] === 'iframe') {
        iframe = entry[1]
      } else if (entry[0] === 'answers') {
        answers = entry[1]
      } else if (entry[0] === 'beta') {
        beta = true
      } else if (entry[0] === 'cor') {
        // Relecture : énoncé et correction de tous les exercices affichés,
        // réservé au développement local
        cor = isLocal
      } else if (entry[0] === 'canD') {
        canDuration = parseInt(entry[1])
      } else if (entry[0] === 'canTi') {
        canMainTitle = entry[1]
      } else if (entry[0] === 'canT') {
        canTitle = entry[1]
      } else if (entry[0] === 'canSA') {
        canSolAccess = entry[1] === '1'
      } else if (entry[0] === 'canSM') {
        canSolMode = entry[1]
      } else if (entry[0] === 'canI') {
        canIsInteractive = entry[1] === '1'
      } else if (entry[0] === 'canNC') {
        canIsTimerDisabled = entry[1] === '1'
      } else if (entry[0] === 'canQ') {
        const seconds = parseInt(entry[1])
        if (Number.isFinite(seconds) && seconds > 0) {
          canSecondsPerQuestion = seconds
        }
      } else if (entry[0] === 'canFB') {
        canFeedbackEach = entry[1] === '1'
      }

      if (entry[0] === 'uuid') previousEntryWasUuid = true
      else previousEntryWasUuid = false
    }
    // Pour les uuid sans id valide dans l'URL (anciennes URLs ou URL corrompue),
    // on se rabat sur une référence par défaut pour ce uuid
    for (const params of newExercisesParams) {
      if (params.uuid != null && params.id == null) {
        params.id = (
          Object.keys(currentRefToUuid) as (keyof typeof currentRefToUuid)[]
        ).find((key) => currentRefToUuid[key] === params.uuid)
      }
    }
  } catch (error) {
    // MOUCHARD SUR LES URLS FANTAISISTES
    window.notify(`Erreur d'URL : ${error} `, {
      err: error,
      urlString,
      url: window.location.href.toString(),
      referrer: document.referrer,
    })
    console.error(error)
    showDialogForLimitedTime(
      'notifUrlIncorrecte',
      5000,
      "L'URL présente une erreur. Veuillez réessayer et nous contacter si le problème persiste.",
    )
    return {}
  }

  // Choix « Numérique » de la conception de document : le lien fait foi ;
  // sans exercice dans l'URL (nouvelle visite), on reprend le dernier choix.
  if (
    es === undefined &&
    (numerique ||
      (newExercisesParams.length === 0 &&
        (v === undefined || v === 'l') &&
        isFormatNumeriqueSaved()))
  ) {
    setInteractive = '1'
  }

  if (recorder === 'capytale' && es === undefined) {
    setInteractive = '1'
    isInteractiveFree = false
  }

  const newExercisesParamsFiltered = newExercisesParams.filter(
    (e) => e.uuid || e.id,
  )

  if (
    JSON.stringify(get(exercicesParams)) !==
    JSON.stringify(newExercisesParamsFiltered)
  ) {
    exercicesParams.set(newExercisesParamsFiltered)
  }

  if (urlNeedToBeFreezed) {
    freezeUrl.set(true)
  }

  if (v === 'can' || get(globalOptions).recorder === 'capytale') {
    canOptions.update((e) => {
      e.durationInMinutes = canDuration
      e.title = canMainTitle
      e.isInteractive = canIsInteractive
      e.isTimerDisabled = canIsTimerDisabled
      e.timerMode = canSecondsPerQuestion === undefined ? 'global' : 'question'
      if (canSecondsPerQuestion !== undefined) {
        e.durationPerQuestionInSeconds = canSecondsPerQuestion
      }
      e.feedbackMode = canFeedbackEach ? 'each' : 'end'
      e.solutionsAccess = canSolAccess
      if (canSolMode === 'gathered') e.solutionsMode = 'gathered'
      else e.solutionsMode = 'split'
      e.subTitle = canTitle
      return e
    })
  }

  if (ds) {
    const nbVuesCandidate = contraindreValeur(1, 4, ds.charAt(0), 1)
    const flowCandidate = contraindreValeur(0, 2, ds.charAt(1), 0)
    const soundCandidate = contraindreValeur(0, 4, ds.charAt(3), 0)
    if (isIntegerInRange1to4(nbVuesCandidate)) nbVues = nbVuesCandidate
    if (isIntegerInRange0to2(flowCandidate)) flow = flowCandidate
    if (isIntegerInRange0to4(soundCandidate)) sound = soundCandidate
    screenBetweenSlides = ds.charAt(2) === '1'
    shuffle = ds.charAt(4) === '1'
    manualMode = ds.charAt(5) === '1'
    pauseAfterEachQuestion = ds.charAt(6) === '1'
    isImagesOnSides = ds.charAt(7) === '1'
  }

  /**
   * es permet de résumer les réglages de la vue élève
   * Il est de la forme 21011010
   * Avec un caractère par réglage presMode|setInteractive|isSolutionAccessible|isInteractiveFree|oneShot|twoColumns|isTitleDisplayed|isReferenceDisplayed|isCorrectionOnlyOnError|calculatricesForcees (facultatif)|isCheckPerQuestion (facultatif)
   */
  if (es && es.length === 6) {
    presMode = presModeId[parseInt(es.charAt(0))]
    setInteractive = es.charAt(1)
    isSolutionAccessible = es.charAt(2) === '1'
    isInteractiveFree = es.charAt(3) === '1'
    oneShot = es.charAt(4) === '1'
    twoColumns = es.charAt(5) === '1'
  } else if (es && es.length === 7) {
    presMode = presModeId[parseInt(es.charAt(0))]
    setInteractive = es.charAt(1)
    isSolutionAccessible = es.charAt(2) === '1'
    isInteractiveFree = es.charAt(3) === '1'
    oneShot = es.charAt(4) === '1'
    twoColumns = es.charAt(5) === '1'
    isTitleDisplayed = es.charAt(6) === '1'
  } else if (es && es.length === 8) {
    presMode = presModeId[parseInt(es.charAt(0))]
    setInteractive = es.charAt(1)
    isSolutionAccessible = es.charAt(2) === '1'
    isInteractiveFree = es.charAt(3) === '1'
    oneShot = es.charAt(4) === '1'
    twoColumns = es.charAt(5) === '1'
    isTitleDisplayed = es.charAt(6) === '1'
    isReferenceDisplayed = es.charAt(7) === '1'
  } else if (es && es.length >= 9 && es.length <= 11) {
    presMode = presModeId[parseInt(es.charAt(0))]
    setInteractive = es.charAt(1)
    isSolutionAccessible = es.charAt(2) === '1'
    isInteractiveFree = es.charAt(3) === '1'
    oneShot = es.charAt(4) === '1'
    twoColumns = es.charAt(5) === '1'
    isTitleDisplayed = es.charAt(6) === '1'
    isReferenceDisplayed = es.charAt(7) === '1'
    isCorrectionOnlyOnError = es.charAt(8) === '1'
    if (isCalculatricesForcees(es.charAt(9))) {
      calculatricesForcees = es.charAt(9) as CalculatricesForcees
    }
    isCheckPerQuestion = es.charAt(10) === '1'
  }
  v = v ?? ''
  return {
    v,
    z,
    durationGlobal,
    durationCorrection,
    ds,
    nbVues,
    flow,
    screenBetweenSlides,
    pauseAfterEachQuestion,
    isImagesOnSides,
    sound,
    shuffle,
    manualMode,
    select,
    order,
    title,
    presMode,
    setInteractive,
    calculatricesForcees,
    isSolutionAccessible,
    isInteractiveFree,
    oneShot,
    twoColumns,
    isTitleDisplayed,
    isReferenceDisplayed,
    isCorrectionOnlyOnError,
    isCheckPerQuestion,
    recorder,
    done,
    beta,
    cor,
    iframe,
    answers,
    subject,
    quizzParam,
    quizzRole,
    pin,
    gameId,
  }
}

/**
 * Les exercice qui ont le paramètre typeExercice égale à 'simple'
 * ne définissent qu'une seule question.
 * Avec cette fonction, on permet la création de plusieurs questions.
 */
export function mathaleaHandleExerciceSimple(
  exercice: IExercice,
  isInteractif: boolean,
  numeroExercice?: number,
  seed?: string,
) {
  if (numeroExercice !== undefined) exercice.numeroExercice = numeroExercice
  exercice.reinit()
  exercice.interactif = isInteractif
  for (
    let i = 0, cptSecours = 0;
    i < exercice.nbQuestions && cptSecours < 50;
  ) {
    exercice.reponseCourteExplicite = undefined
    seedrandom(seed ?? String(exercice.seed) + i + cptSecours, { global: true })
    if (
      exercice.nouvelleVersion &&
      typeof exercice.nouvelleVersion === 'function'
    )
      exercice.nouvelleVersion(numeroExercice)
    const compare =
      exercice.compare == null ? fonctionComparaison : exercice.compare
    const options =
      exercice.optionsDeComparaison == null ? {} : exercice.optionsDeComparaison
    let reponse = {}

    if (exercice.questionJamaisPosee(i, String(exercice.correction))) {
      if (
        exercice.reponse != null &&
        !(exercice.exoCustomResultat && exercice.formatChampTexte === 'none')
      ) {
        if (compare != null) {
          /// DE LA AU PROCHAIN LA, ce sera à supprimer quand il n'y aura plus de this.compare
          if (
            typeof exercice.reponse !== 'string' &&
            typeof exercice.reponse !== 'number'
          ) {
            if (exercice.reponse instanceof FractionEtendue) {
              reponse = {
                reponse: {
                  value: exercice.reponse.texFraction,
                  compare,
                  options,
                },
              }
            } else if (exercice.reponse instanceof Decimal) {
              reponse = {
                reponse: {
                  value: exercice.reponse.toString(),
                  compare,
                  options,
                },
              }
            } else if (
              exercice.reponse instanceof Grandeur ||
              exercice.reponse instanceof Hms
            ) {
              reponse = {
                reponse: { value: exercice.reponse, compare, options },
              }
            } else if (exercice.reponse instanceof Complexe) {
              reponse = {
                reponse: {
                  value: exercice.reponse.tex(),
                  compare,
                  options,
                },
              }
            } else if (
              typeof exercice.reponse === 'object' &&
              !Array.isArray(exercice.reponse)
            ) {
              // Si c'est handleAnswer qu'on veut utiliser directement avec un fillInTheBlank par exemple, on met l'objet reponse complet dans this.reponse
              reponse = exercice.reponse
            } else if (Array.isArray(exercice.reponse)) {
              reponse = {
                reponse: { value: exercice.reponse, compare, options },
              }
            } else {
              window.notify(
                `MathaleaHandleExerciceSimple n'a pas réussi à déterminer le type de exercice.reponse, dans ${(exercice?.numeroExercice ?? 0) + 1} - ${exercice.titre} ${JSON.stringify(exercice.reponse)}, on Stingifie, mais c'est sans doute une erreur à rectifier`,
                { exercice: JSON.stringify(exercice) },
              )
              reponse = {
                reponse: { value: String(exercice.reponse), compare, options },
              }
            }
          } else {
            reponse = {
              reponse: {
                value:
                  typeof exercice.reponse === 'number'
                    ? String(exercice.reponse)
                    : exercice.reponse,
                compare,
                options,
              },
            }
          }
          handleAnswers(exercice, i, reponse, {
            formatInteractif: exercice.formatInteractif ?? 'mathlive',
          }) /// // PROCHAIN LA : La partie ci-dessus sera à supprimer quand il n'y aura plus de this.compare
        } else if (
          isValeur(exercice.reponse) &&
          exercice.reponse.reponse != null &&
          exercice.reponse.reponse.value != null &&
          typeof exercice.reponse.reponse.value === 'string'
        ) {
          handleAnswers(exercice, i, exercice.reponse)
        }
        // Handle AMC array
        if (context.isAmc) {
          if (exercice.autoCorrectionAMC == null) {
            exercice.autoCorrectionAMC = []
          }
          if (exercice.autoCorrectionAMC[i] == null) {
            exercice.autoCorrectionAMC[i] = {}
          }
          if (exercice.autoCorrectionAMC[i].reponse == null) {
            exercice.autoCorrectionAMC[i].reponse = {}
          }
          const reponseSimple = Array.isArray(exercice.reponse)
            ? exercice.reponse[0]
            : exercice.reponse
          const value = inferNumericValueForAMC(String(reponseSimple))
          if (value !== null) {
            const param = inferAmcOptionsFromAnswerType(reponse)
            if (param) {
              exercice.autoCorrectionAMC![i].reponse = {
                valeur: value,
                param,
              }
            }
          }
        }
      } else if (exercice.interactif === true) {
        // Un MathaleaCustomElement (apigeom, tableau-signes-variations...) ne
        // renseigne son formatInteractif (sur l'exercice ou par question, via
        // autoCorrection[i]) que lorsqu'il construit réellement ses éléments
        // interactifs : hors mode interactif, ni l'un ni l'autre n'est peuplé,
        // sans que ce soit une erreur (la correction reste affichée en texte).
        const hasCustomElementQuestion = isMathaleaCustomElementFormat(
          exercice.autoCorrection[i]?.formatInteractif,
        )
        if (
          exercice.formatInteractif !== 'qcm' &&
          !isMathaleaCustomElementFormat(exercice.formatInteractif) &&
          !hasCustomElementQuestion
        )
          window.notify(
            "Un exercice simple doit avoir un this.reponse sauf si c'est un qcm ou un MathaleaCustomElement avec sa propre autoCorrection",
            { exercice: JSON.stringify(exercice) },
          )
      }
      const isFillInTheBlank =
        exercice.formatInteractif === 'fillInTheBlank' ||
        (exercice.formatInteractif === 'meta-custom' &&
          String(exercice.question).includes('%{'))
      if (!isFillInTheBlank) {
        if (
          exercice.formatInteractif === 'qcm' ||
          (exercice instanceof ExerciceSimple &&
            exercice.distracteurs.length > 0 &&
            exercice.versionQcm)
        ) {
          if (
            exercice instanceof ExerciceSimple &&
            exercice.distracteurs.length > 0
          ) {
            exercice.distracteurs = getDistracteurs(exercice)
            if (
              typeof exercice.reponse === 'string' ||
              typeof exercice.reponse === 'number' ||
              exercice.reponse instanceof FractionEtendue ||
              exercice.reponse instanceof Grandeur ||
              exercice.reponse instanceof Hms ||
              (Array.isArray(exercice.reponse) &&
                exercice.reponse.every(
                  (r) =>
                    typeof r === 'string' ||
                    typeof r === 'number' ||
                    r instanceof FractionEtendue ||
                    r instanceof Grandeur ||
                    r instanceof Hms,
                ))
            ) {
              const qcmData = buildSimpleVersionQcm(exercice, i, {
                question: exercice.question ?? '',
                correction: exercice.correction ?? '',
                reponse: exercice.reponse,
                distracteurs: exercice.distracteurs,
                options: exercice.versionQcmOptions ?? { radio: true },
              })
              exercice.question = qcmData.question
              exercice.correction = qcmData.correction
            }
          }
          exercice.listeQuestions.push(exercice.question || '')
        } else if (exercice.formatInteractif === 'liste-deroulante') {
          const n = exercice.numeroExercice
          exercice.question = exercice.question?.replace(
            `id="ex${n}Q0"`,
            `id="ex${n}Q${i}"`,
          )
          exercice.question = exercice.question?.replace(
            `checkEx${n}Q0"`,
            `checkEx${n}Q${i}"`,
          )
          exercice.listeQuestions.push(exercice.question ?? '')
        } else if (exercice.formatInteractif === 'MetaInteractif2d') {
          const n = exercice.numeroExercice
          if (exercice.question != null) {
            const inputsIds = exercice.question.matchAll(
              /id="MetaInteractif2dEx\d+Q\d+field(\d+)"/g,
            )
            for (const match of inputsIds) {
              exercice.question = exercice.question.replace(
                `id="MetaInteractif2dEx${n}Q0field${match[1]}"`,
                `id="MetaInteractif2dEx${n}Q${i}field${match[1]}"`,
              )
            }
            exercice.question = exercice.question.replace(
              `id="resultatCheckEx${n}Q0"`,
              `id="resultatCheckEx${n}Q${i}"`,
            )
            exercice.question = exercice.question.replace(
              `id="feedbackEx${n}Q0"`,
              `id="feedbackEx${n}Q${i}"`,
            )
            exercice.listeQuestions.push(exercice.question ?? '')
          }
        } else if (exercice.formatInteractif === 'svg-selection') {
          const n = exercice.numeroExercice
          exercice.question = exercice.question?.replace(
            `id="svg-selectionEx${n}Q0"`,
            `id="svg-selectionEx${n}Q${i}"`,
          )
          exercice.question = exercice.question?.replace(
            `checkSvgSelectionEx${n}Q0"`,
            `checkSvgSelectionEx${n}Q${i}"`,
          )
          exercice.listeQuestions.push(exercice.question ?? '')
        } else if (
          listOfCustomElements.includes(String(exercice.formatInteractif))
        ) {
          // Un custom element porte sa propre correction : aucun champ MathLive
          // à ajouter. Dans un exercice simple, nouvelleVersion() ne connait pas
          // l'indice de la question et produit des identifiants en Q0 : ils sont
          // renumérotés ici (même principe que les branches spécifiques
          // ci-dessus, mais valable pour tout customElement enregistré).
          const n = exercice.numeroExercice
          exercice.listeQuestions.push(
            (exercice.question ?? '').replaceAll(`Ex${n}Q0`, `Ex${n}Q${i}`),
          )
        } else {
          exercice.listeQuestions.push(
            exercice.question +
              ajouteChampTexteMathLive(
                exercice,
                i,
                String(exercice.formatChampTexte),
                exercice.optionsChampTexte || {},
              ),
          )
        }
      } else {
        // La question doit contenir une unique variable %{champ1} On est en fillInTheBlank
        // Ou bien, on fait appel à un callback
        exercice.listeQuestions.push(
          remplisLesBlancs(
            exercice,
            i,
            String(exercice.question),
            'fillInTheBlank ' + exercice.formatChampTexte,
            '\\ldots',
          ),
        )
        if (
          exercice.formatInteractif !== 'meta-custom' &&
          typeof exercice.reponse === 'object' &&
          'callback' in exercice.reponse
        ) {
          // Cas d'un callback dans un exercice simple
          handleAnswers(exercice, i, exercice.reponse)
        } else if (
          exercice.formatInteractif !== 'meta-custom' &&
          typeof exercice.reponse === 'object' &&
          'champ1' in exercice.reponse
        ) {
          handleAnswers(exercice, i, exercice.reponse as Valeur, {
            formatInteractif: 'fillInTheBlank',
          })
        } else {
          if (
            typeof exercice.reponse === 'string' ||
            typeof exercice.reponse === 'number'
          ) {
            handleAnswers(
              exercice,
              i,
              { champ1: { value: exercice.reponse ?? '' } },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
        }
      }
      // Sans version QCM, quand l'exercice a des distracteurs : hors interactif, la
      // correction est celle du QCM (bonne proposition complète en évidence) ; en saisie
      // libre, seule la valeur que le champ attend reste en évidence.
      const reponseSimple =
        typeof exercice.reponse === 'string' ||
        typeof exercice.reponse === 'number'
          ? exercice.reponse
          : exercice.reponse instanceof Decimal
            ? exercice.reponse.toNumber()
            : undefined
      if (
        exercice instanceof ExerciceSimple &&
        !exercice.versionQcm &&
        exercice.distracteurs.length > 0 &&
        reponseSimple != null
      ) {
        const proposition = formaterReponse(reponseSimple)
        exercice.correction = mettreEnEvidenceSelonMode(
          exercice.correction ?? '',
          proposition,
          exercice.interactif
            ? {
                // la correction écrit la virgule décimale : `0.24` s'y lit `0,24`
                reponseSaisie: proposition
                  .replace(/\$/g, '')
                  .replace(/(\d)\.(\d)/g, '$1,$2'),
              }
            : {},
        )
      }
      exercice.listeCorrections.push(exercice.correction ?? '')
      exercice.listeReponsesCourtes?.push(exercice.reponseCourteExplicite)
      exercice.listeCanEnonces?.push(exercice.canEnonce ?? '')
      exercice.listeCanReponsesACompleter?.push(
        exercice.canReponseACompleter ?? '',
      )
      exercice.listeCanLiees?.push(exercice.canLiee ?? '')
      exercice.listeCanNumerosLies?.push(exercice.canNumeroLie ?? '')

      cptSecours = 0
      i++
    } else {
      cptSecours++
    }
  }
  attachExerciseCustomCallbacks(exercice)
}

/**
 * Génère un string de 4 caractères qui sera utilisé comme seed pour l'aléatoire
 */
export function mathaleaGenerateSeed({
  includeUpperCase = true,
  includeNumbers = true,
  length = 4,
  startsWithLowerCase = false,
}: {
  includeUpperCase?: boolean
  includeNumbers?: boolean
  length?: number
  startsWithLowerCase?: boolean
} = {}) {
  let a = 10
  const b = 'abcdefghijklmnopqrstuvwxyz'
  let c = ''
  let d = 0
  let e = '' + b
  if (startsWithLowerCase) {
    c = b[Math.floor(Math.random() * b.length)]
    d = 1
  }
  if (length) {
    a = length
  }
  if (includeUpperCase) {
    e += b.toUpperCase()
  }
  if (includeNumbers) {
    e += '1234567890'
  }

  for (; d < a; d++) {
    c += e[Math.floor(Math.random() * e.length)]
  }
  return c
}

/**
 * Pour la sortie HTML, il faut modifier certains codages LaTeX non pris en charge par KaTeX
 * @param {string} texte
 * @returns string
 */
// Define the function with the condition check
function applyFormatExerciceReplacements(texte: string): string {
  const lang = getLang()
  // Replace symbols based on general rules
  let formattedText = texte
    .replace(/\\dotfill/g, '..............................')
    .replace(/\\not=/g, '≠')
    .replace(/\\ldots/g, '....')
    .replaceAll(' ?', '&nbsp;?')
    .replaceAll(' !', '&nbsp;!')
    .replaceAll(' ;', '&nbsp;;')
    .replaceAll(' :', '&nbsp;:')

  // Check if the language is 'fr-CH' and replace \times with \cdot if true
  if (lang === 'fr-CH') {
    formattedText = formattedText.replace(/\\times/g, '\\cdot')
    formattedText = formattedText.replace(/un antécédent/g, 'une préimage')
    formattedText = formattedText.replace(/l'antécédent/g, 'la préimage')
    formattedText = formattedText.replace(/des antécédents/g, 'des préimages')
    formattedText = formattedText.replace(/les antécédents/g, 'les préimages')
    formattedText = formattedText.replace(/pour antécédents/g, 'pour préimages')
    formattedText = formattedText.replace(/pour antécédent/g, 'pour préimage')
    formattedText = formattedText.replace(/d'antécédent/g, 'de préimage')
    formattedText = formattedText.replace(/antécédent/g, 'préimage')
    formattedText = formattedText.replace(
      /s'il existe et en l'expliquant, le coefficient directeur/g,
      'si elle existe, la pente',
    )
    formattedText = formattedText.replace(
      /le coefficient directeur/g,
      'la pente',
    )
    formattedText = formattedText.replace(
      /coefficients directeurs/g,
      'les pentes',
    )
    formattedText = formattedText.replace(
      /coefficient directeur respectif/g,
      'pente respective',
    )
    formattedText = formattedText.replace(
      /le même coefficient directeur/g,
      'la même pente',
    )
    formattedText = formattedText.replace(
      /aucun coefficient directeur/g,
      'aucune pente',
    )
    formattedText = formattedText.replace(/coefficient directeur/g, 'pente')
  }

  return formattedText
}

export function mathaleaFormatExercice(texte = ' ') {
  // Les remplacements ne doivent porter que sur le texte affiché, pas sur le
  // contenu des balises (ex: le JSON sérialisé dans l'attribut `propositions`
  // de <mathalea-qcm>, que ces remplacements pourraient corrompre en cassant
  // l'échappement des `\`, rendant le JSON illisible par JSON.parse).
  return texte
    .split(/(<[^>]*>)/g)
    .map((part) =>
      part.startsWith('<') ? part : applyFormatExerciceReplacements(part),
    )
    .join('')
}

export async function getExercisesFromExercicesParams() {
  const exercises = []
  for (const paramsExercice of get(exercicesParams)) {
    if (isStatic(paramsExercice.uuid) || isSvelte(paramsExercice.uuid)) {
      continue
    }
    const exercise = await mathaleaLoadExerciceFromUuid(paramsExercice.uuid)
    if (!exercise) continue
    mathaleaHandleParamOfOneExercice(exercise, paramsExercice)
    exercise.duration = paramsExercice.duration ?? 10
    exercises.push(exercise)
  }
  return exercises
}

/**
 * Applique renderKatex dans tous les shadowRoots des éléments donnés
 * @param {HTMLElement} root - Élément racine à explorer
 */
export function renderKatexInAllShadowRoots(root: HTMLElement) {
  // Sélectionne tous les éléments avec un shadowRoot (ex: MultiMathfieldElement, math-field...)
  const elementsWithShadow = root.querySelectorAll('*')
  elementsWithShadow.forEach((el) => {
    if (el.shadowRoot) {
      // Vérifie s'il y a du LaTeX à traiter dans le shadowRoot
      const shadowText = el.shadowRoot.textContent || ''
      const hasLatex = /\$[^$]+\$|\\\[[\s\S]*?\\\]/.test(shadowText)
      if (hasLatex) {
        // Injecte le style d'accessibilité KaTeX si absent
        const styleId = 'katex-mathml-style'
        if (!el.shadowRoot.getElementById(styleId)) {
          const style = document.createElement('style')
          style.id = styleId
          style.textContent = `
            .katex-mathml {
              clip: rect(1px,1px,1px,1px);
              border: 0;
              height: 1px;
              overflow: hidden;
              padding: 0;
              position: absolute;
              width: 1px;
            }
             .katex {
    font: normal 1em KaTeX_Main,Times New Roman,serif;
    line-height: 1.2;
    position: relative;
    text-indent: 0;
    text-rendering: auto;
        }
    .katex .mathnormal {
      font-family: KaTeX_Math,Times New Roman,serif;
      font-style: italic;
    }`
          el.shadowRoot.appendChild(style)
        }
        try {
          renderKatex(el.shadowRoot as unknown as HTMLElement)
        } catch (e) {
          // ignore les erreurs sur les shadowRoots non pertinents
        }
      }
    }
  })
}

// Exemple d'utilisation après renderKatex classique :
// renderKatex(div);
// renderKatexInAllShadowRoots(div);
