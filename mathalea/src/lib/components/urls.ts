import { get } from 'svelte/store'
import { CALCULATRICES_NON_FORCEES } from '../calculatrices'
import { normaliseCoeffBareme } from '../interactif/baremeExercice'
import {
  type InterfaceGlobalOptions,
  type InterfaceParams,
} from '../../lib/types'
import { type VueType } from '../VueType'
import { canOptions } from '../stores/canStore'
import { exercicesParams } from '../stores/generalStore'
import { globalOptions } from '../stores/globalOptions'
import { buildDsParams } from './buildDsParams'

export class MathAleaURL extends URL {
  /**
   * Utilise l'URL courante pour fabriquer l'URL lors de l' appel new MathAleaURL()
   */
  constructor(url?: string) {
    if (url === undefined) {
      url = document.URL
    }
    super(url)
  }

  /**
   * Utilise le store exercicesParams pour fabriquer l'URL (utile pour les recorders qui freezent l'url)
   */
  static fromExercisesParams(): MathAleaURL {
    const url = new URL(
      window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname,
    )
    for (const ex of get(exercicesParams)) {
      appendExerciseParams(url, ex)
    }
    return new MathAleaURL(url.toString())
  }

  /**
   * Retire de l'URL le paramètre fourni et retourne l'URL modifiée
   * @param paramToBeRemoved paramètre à supprimer dans l'URL (seulement les propriétés de InterfaceGlobalOptions sont permises )
   * @returns l'URL
   */
  removeParam(paramToBeRemoved: keyof InterfaceGlobalOptions): MathAleaURL {
    this.searchParams.delete(paramToBeRemoved)
    return this
  }

  /**
   * Ajoute un paramètre avec sa valeur à l'URL et retourne l'URL modifiée
   * @param param paramètre à ajouter (seulement les propriétés de InterfaceGlobalOptions sont permises)
   * @param value valeur du paramètre
   * @returns l'URL
   */
  addParam(param: keyof InterfaceGlobalOptions, value: string): MathAleaURL {
    this.searchParams.append(param, value)
    return this
  }

  /**
   * Supprime la graine de l'aléatoire de l'URL et retourne l'URL modifiée
   */
  removeSeed(): MathAleaURL {
    this.searchParams.delete('alea')
    return this
  }

  /**
   * Ajoute (ou remplace) un paramètre avec sa valeur à l'URL et retourne l'URL modifiée
   * @param param paramètre à ajouter (seulement les propriétés de InterfaceGlobalOptions sont permises)
   * @param value valeur du paramètre
   * @returns l'URL
   */
  setParam(param: keyof InterfaceGlobalOptions, value: string): MathAleaURL {
    this.searchParams.set(param, value)
    return this
  }

  /**
   * Ajoute/remplace une vue cible à l'URL et retourne cette URL
   * @param value la vue cible
   * @returns l'URL
   */
  setVue(value: VueType): MathAleaURL {
    this.setParam('v', value)
    return this
  }
}

/**
 * Paramètres d'URL propres à un exercice (tous les autres concernent la série)
 */
export const EXERCISE_URL_PARAMS = [
  'uuid',
  'id',
  'n',
  'd',
  's',
  's2',
  's3',
  's4',
  's5',
  'qcm',
  'coef',
  'alea',
  'i',
  'cd',
  'tip',
  'calc',
  'cols',
]

/**
 * Paramètres d'URL qui dépendent de la liste complète des exercices ou de
 * l'état d'une copie et n'ont plus de sens pour un exercice isolé
 */
const SERIES_URL_PARAMS = ['select', 'order', 'shuffle', 'answers', 'done']

/**
 * Ajoute à l'URL les paramètres d'un exercice (référence, options, graine...)
 * @param url URL à compléter
 * @param ex paramètres de l'exercice
 */
export function appendExerciseParams(url: URL, ex: InterfaceParams): void {
  url.searchParams.append('uuid', ex.uuid)
  if (ex.id != null) url.searchParams.append('id', ex.id)
  if (ex.nbQuestions !== undefined)
    url.searchParams.append('n', ex.nbQuestions.toString())
  if (ex.duration != null) url.searchParams.append('d', ex.duration.toString())
  if (ex.sup != null) url.searchParams.append('s', ex.sup)
  if (ex.sup2 != null) url.searchParams.append('s2', ex.sup2)
  if (ex.sup3 != null) url.searchParams.append('s3', ex.sup3)
  if (ex.sup4 != null) url.searchParams.append('s4', ex.sup4)
  if (ex.sup5 != null) url.searchParams.append('s5', ex.sup5)
  if (ex.versionQcm != null) url.searchParams.append('qcm', ex.versionQcm)
  const coeff = normaliseCoeffBareme(ex.coeffBareme)
  if (coeff !== 1) url.searchParams.append('coef', coeff.toString())
  if (ex.alea != null) url.searchParams.append('alea', ex.alea)
  if (ex.interactif === '1') url.searchParams.append('i', '1')
  if (ex.cd != null) url.searchParams.append('cd', ex.cd)
  if (ex.tip != null) url.searchParams.append('tip', ex.tip)
  if (ex.calc != null && ex.calc !== '0')
    url.searchParams.append('calc', ex.calc)
  if (ex.cols != null) url.searchParams.append('cols', ex.cols.toString())
}

/**
 * Construit l'URL d'un exercice seul (même graine, mêmes options) à partir de
 * l'URL d'une série : les réglages globaux (vue, zoom...) sont conservés,
 * les exercices de la série sont remplacés par celui fourni.
 * @param seriesUrl URL de la série (éventuellement cryptée)
 * @param ex paramètres de l'exercice à isoler
 */
export function buildSingleExerciseURL(
  seriesUrl: URL,
  ex: InterfaceParams,
): URL {
  const url = new URL(decrypt(seriesUrl))
  for (const param of [...EXERCISE_URL_PARAMS, ...SERIES_URL_PARAMS]) {
    url.searchParams.delete(param)
  }
  // les exercices sont placés en tête, comme dans les URLs de MathALÉA
  const globalParams = [...url.searchParams.entries()]
  url.search = ''
  appendExerciseParams(url, ex)
  for (const [key, value] of globalParams) {
    url.searchParams.append(key, value)
  }
  return url
}

/**
 * Construit l'URL pour la feuille élève en mettant tous les paramètres existants et ceux des réglages de la page de configuration
 * @param view la vue dans laquelle va s'afficher la série d'exercice
 * @param mode le mode de présentation des exercices
 * @returns l'URL correspondant à la feuille d'exercices avec tous les paramètres
 */
export function buildMathAleaURL(options: {
  view?: VueType
  mode?: InterfaceGlobalOptions['presMode']
  isEncrypted?: boolean
  isShort?: boolean
  removeSeed?: boolean
  /** S'il y a un recorder l'url est cachée et doit être construite à partir du store exercicesParams */
  recorder?: boolean
}): URL {
  const url = options.recorder
    ? MathAleaURL.fromExercisesParams()
    : new MathAleaURL()
  if (options.removeSeed) {
    url.removeSeed()
  }
  const global = get(globalOptions)
  const can = get(canOptions)
  if (options.view)
    url.setVue(options.view).addParam('es', buildEsParams(options.mode))
  if (options.view === 'can') {
    // paramètres spécifiques à la can dans l'URL
    url
      .addParam('canD', (can.durationInMinutes ?? 1).toString())
      .addParam('canTi', can.title.toString())
      .addParam('canT', can.subTitle.toString())
      .addParam('canSA', can.solutionsAccess ? '1' : '0')
      .addParam('canSM', can.solutionsMode)
      .addParam('canI', can.isInteractive ? '1' : '0')
    // `canNC` (no chrono) n'est ajouté que s'il est actif pour ne pas allonger
    // inutilement les URLs des courses chronométrées
    if (can.isTimerDisabled) {
      url.addParam('canNC', '1')
    }
    // Idem pour le chronomètre par question (`canQ`, en secondes) et le
    // feedback après chaque question (`canFB`) : absents, on retrouve le
    // comportement historique (chronomètre global, feedback à la fin).
    if (can.timerMode === 'question') {
      url.addParam('canQ', can.durationPerQuestionInSeconds.toString())
    }
    if (can.feedbackMode === 'each') {
      url.addParam('canFB', '1')
    }
  } else if (options.view === 'diaporama') {
    url.addParam('ds', buildDsParams())
    if (
      global.select !== undefined &&
      global.select !== undefined &&
      global.select.length > 0 &&
      global.select.length < get(exercicesParams).length
    ) {
      url.addParam('select', global.select.join('-'))
    }
    if (
      global.order !== undefined &&
      global.order.length > 0 &&
      global.shuffle
    ) {
      url.addParam('order', global.order.join('-'))
    }
  } else {
    const title = global.title ?? 'Évaluation'
    if (title !== '') {
      url.addParam('title', encodeURIComponent(title))
    }
  }
  if (global.beta) {
    url.addParam('beta', '1')
  }
  const cryptedUrl = options.isEncrypted
    ? encrypt(url.toString())
    : url.toString()
  return new URL(cryptedUrl)
}

/**
 * Aperçu autonome d'une séance Capytale, avec les réglages de l'enseignant.
 * Si les élèves ont des données différentes (choix par défaut), la graine est
 * retirée pour que chaque aperçu propose une nouvelle version.
 */
export function buildCapytalePreviewURL(view?: 'eleve' | 'can'): URL {
  const url = buildMathAleaURL({
    view,
    removeSeed: get(globalOptions).isDataRandom ?? true,
    mode: get(exercicesParams).length === 1 ? 'liste_exos' : 'un_exo_par_page',
    recorder: true,
  })
  if (view) {
    const es = url.searchParams.get('es')!
    // L'élève ne peut pas modifier l'interactivité imposée par la séance.
    url.searchParams.set('es', es.slice(0, 3) + '0' + es.slice(4))
  }
  if (view === 'can') {
    url.searchParams.set(
      'canI',
      get(globalOptions).setInteractive === '1' ? '1' : '0',
    )
  }
  return url
}

/**
 * Construit la chaîne représentant les réglages de la vue élève/can
 * @param mode mode de présentation
 * @returns la chaîne de 6 chiffres représentant le setup
 */
export function buildEsParams(
  mode?: InterfaceGlobalOptions['presMode'],
): string {
  const options = get(globalOptions)
  const presentationMode = new Map([
    // sync with src/lib/stores/generalStore.ts presModeId
    ['liste_exos', 0],
    ['un_exo_par_page', 1],
    ['liste_exos', 2],
    ['une_question_par_page', 3],
    ['recto', 4],
    ['verso', 5],
  ])
  let es = ''
  // Paramètre 'es' : presMode|setInteractive|isSolutionAccessible|isInteractiveFree|oneShot|twoColumns|isTitleDisplayed|isReferenceDisplayed|isCorrectionOnlyOnError|calculatricesForcees (facultatif)|isCheckPerQuestion (facultatif)
  es += presentationMode.get(
    mode !== undefined ? mode : (options.presMode ?? 'liste_exos'),
  )
  es += options.setInteractive ?? '2'
  es += options.isSolutionAccessible ? '1' : '0'
  es += options.isInteractiveFree ? '1' : '0'
  es += options.oneShot ? '1' : '0'
  es += options.twoColumns ? '1' : '0'
  es += options.isTitleDisplayed ? '1' : '0'
  es += options.isReferenceDisplayed !== false ? '1' : '0'
  es += options.isCorrectionOnlyOnError ? '1' : '0'
  // Calculatrices forcées et vérification question par question : caractères
  // ajoutés seulement s'ils s'écartent des valeurs par défaut, pour ne pas
  // allonger les URLs par défaut. `isCheckPerQuestion` occupe la position
  // suivant celle des calculatrices, qui est alors écrite même sans calculatrice
  // forcée (`-`).
  const forcees = options.calculatricesForcees ?? CALCULATRICES_NON_FORCEES
  if (forcees !== CALCULATRICES_NON_FORCEES || options.isCheckPerQuestion)
    es += forcees
  if (options.isCheckPerQuestion) es += '1'
  return es
}

export async function getShortenedCurrentUrl(
  addendum: string = '',
): Promise<string> {
  const urlObj = new URL(window.location.href)
  const port = urlObj.port
  const baseUrl = port ? 'https://coopmaths.fr/alea' : document.URL
  const url = `${baseUrl}${addendum}`

  try {
    const response = await fetch(
      `https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`,
    )
    if (!response.ok) {
      throw new Error('Network response was not ok.')
    }
    const jsonResponse = await response.json()
    return jsonResponse.result.full_short_link
  } catch (error) {
    window.notify("Impossible de raccourcir l'url", { error })
    return url
  }
}

/**
 * Encrypte la partie de l'URL après le point d'interrogation '?'
 * Principe : on ajoute 'EEEE' après le '?' pour reconnaître une URL encryptée
 * par la suite et on encode le reste de l'URL en suivant l'algorithme montré
 * [ici](https://stackoverflow.com/questions/67855828/encrypt-and-decrypt-a-string-using-simple-javascript-without-using-any-external)...
 * @param {string} url URL a encrypter
 * @returns {URL} URL encryptée
 * @author sylvain
 */
export function encrypt(url: string): string {
  const urlParts = url.split('?')
  let newUrl = urlParts[0] + '?EEEE'
  let char, nextChar, combinedCharCode
  let partEncrypted = ''
  const partToEncrypt = encodeURI(urlParts[1])
  for (let i = 0; i < partToEncrypt.length; i += 2) {
    char = partToEncrypt.charCodeAt(i)
    if (i + 1 < partToEncrypt.length) {
      nextChar = partToEncrypt.charCodeAt(i + 1) - 31
      combinedCharCode =
        char +
        '' +
        nextChar.toLocaleString('fr-FR', { minimumIntegerDigits: 2 })
      partEncrypted += String.fromCharCode(parseInt(combinedCharCode, 10))
    } else {
      partEncrypted += partToEncrypt.charAt(i)
    }
  }
  const hexPartEncrypted = partEncrypted.split('').reduce((hex, c) => {
    hex += c.charCodeAt(0).toString(16).padStart(4, '0')
    return hex
  }, '')
  newUrl += hexPartEncrypted
  return newUrl
}

/**
 * Décrypte _si besoin_ une URL sur la base du cryptage précédent
 * @param {URL} url URL à décrypter
 * @returns {URL} URL décryptée
 * @author sylvain
 */
export function decrypt(url: URL): URL {
  const oldUrl = url.href
  const part1 = oldUrl.slice(0, oldUrl.indexOf('?'))
  const part2withEEEE = oldUrl.replace(part1 + '?', '')
  let newUrl = ''
  if (part2withEEEE.substring(0, 4) !== 'EEEE') {
    newUrl = url.toString()
  } else {
    let char, codeStr, firstCharCode, lastCharCode
    let decryptedPart = ''
    newUrl = part1 + '?'
    let part2 = part2withEEEE.slice(4, part2withEEEE.length) // on enlève les `EEEE`
    const matches = part2.match(/.{1,4}/g)
    if (matches !== null) {
      part2 = matches.reduce(
        (acc, char) => acc + String.fromCharCode(parseInt(char, 16)),
        '',
      )
    }

    for (let i = 0; i < part2.length; i++) {
      char = part2.charCodeAt(i)
      if (char > 132) {
        codeStr = char.toString(10)
        firstCharCode = parseInt(codeStr.substring(0, codeStr.length - 2), 10)
        lastCharCode =
          parseInt(codeStr.substring(codeStr.length - 2, codeStr.length), 10) +
          31
        decryptedPart +=
          String.fromCharCode(firstCharCode) + String.fromCharCode(lastCharCode)
      } else {
        decryptedPart += part2.charAt(i)
      }
    }
    newUrl += decryptedPart
  }
  return new URL(newUrl)
}

/**
 * Détecte si une URL a été encryptée par `encrypt`
 * @param {URL} url Chaîne representant l'URL à analyser
 * @returns {boolean} `true` si l'URL est crypté avec la fonction `encrypt`
 */
export function isCrypted(url: URL): boolean {
  return url.href.includes('?EEEE')
}

/**
 * Télécharger un fichier connaissant l'URL
 *
 * __Exemple__
 * ```tsx
 * downloadFileFromURL(url, 'image.jpg');
 * ```
 *
 * __Paramètres__
 * @param {string} url URL du fichier à télécharger
 * @param {string} filename nom doné au fichier téléchargé
 * @see {@link https://blog.gitnux.com/code/javascript-download-file-from-url/}
 */
export async function downloadFileFromURL(url: string, filename: string) {
  try {
    // Fetch the file
    const response = await fetch(url)
    // Check if the request was successful
    if (response.status !== 200) {
      throw new Error(
        `Unable to download file. HTTP status: ${response.status}`,
      )
    }

    // Get the Blob data
    const blob = await response.blob()

    // Create a download link
    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.download = filename

    // Trigger the download
    document.body.appendChild(downloadLink)
    downloadLink.click()

    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(downloadLink.href)
      document.body.removeChild(downloadLink)
    }, 100)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error downloading the file:', error.message)
    }
  }
}
