import type {
  Browser,
  ConsoleMessage,
  JSHandle,
  Page as PlaywrightPage,
  Request,
  Response,
} from 'playwright'
import playwright from 'playwright'
import { log, logError, logIfVerbose } from './log'
import prefs from './prefs'
import type { BrowserName } from './types'

declare global {
  interface Window {
    isPlaywright?: boolean
  }
}

type RequestListener = (request: playwright.Request) => void
type AccessLogger = (requestUrl: string) => void
type Page = PlaywrightPage & {
  warnings: JSHandle<any>[]

  errors: JSHandle<any>[]
  nbLoads: number
  failures: {
    method: string
    url: string
    text: string
  }[]
  requestListener: RequestListener
  accessLogger: AccessLogger
}

/**
 * Reset page puis charge url, recommence si on a des failures (ça arrive souvent, pas trouvé pourquoi)
 */
export async function loadUrl(page: Page, url: string, maxTries: number = 3) {
  let tries = 1
  resetPage(page)
  await purge(url)
  await page.goto(url)
  while (page.failures.length && tries < maxTries) {
    tries++
    resetPage(page)
    // petit délai pour le laisser reprendre ses esprits (ça marche mieux, pas cherché pourquoi)
    await page.waitForTimeout(tries * 100)
    await purge(url)
    await page.goto(url)
  }
  return tries
}

/**
 * Retourne une Page avec les propriétés errors, warnings, failures (tableaux)
 * @param browser
 * @param requestListener
 * @param accessLogger
 * @return {Promise<Page>}
 */
export async function getPage(
  browser: Browser,
  {
    requestListener,
    accessLogger,
  }: { requestListener?: RequestListener; accessLogger?: AccessLogger } = {},
) {
  // une valeur par défaut suivant les prefs
  const [context] = browser.contexts()
  const page = (await context.newPage()) as Page
  // on lui ajoute ces tableaux
  // chaque élément sera un tableau de JsHandle, cf message.args()
  // (on ne sérialise pas dans le listener avant d'ajouter au tableau pour garder le listener sync)
  page.errors = []
  page.warnings = []
  page.failures = []
  page.nbLoads = 0
  // on ajoute un flag global sur window pour que l'appli sache qu'elle est testée (évite de râler si on clique trop vite)
  await page.evaluate(() => {
    window.isPlaywright = true
  })
  page.on('domcontentloaded', () => {
    page.nbLoads++
  })
  // on ajoute le listeners sur les messages pour récupérer les console.error
  // https://playwright.dev/docs/api/class-page#pageonconsole
  page.on('console', (message: ConsoleMessage) => {
    // Cf https://playwright.dev/docs/api/class-consolemessage
    switch (message.type()) {
      case 'error':
        page.errors.push(...message.args())
        break
      case 'warning':
        page.warnings.push(...message.args())
        break
    }
  })
  // https://playwright.dev/docs/api/class-page#pageonrequestfailed
  page.on('requestfailed', (request) => {
    const requestFailure = request.failure()
    page.failures.push({
      method: request.method(),
      url: request.url(),
      text: requestFailure === null ? '' : requestFailure.errorText,
    })
  })
  if (requestListener) {
    page.requestListener = requestListener // pour flush
    page.on('request', requestListener)
  }
  if (accessLogger) {
    page.accessLogger = accessLogger
    page.on('request', (request) => accessLogger(request.url()))
  }
  return page
}

type getDefaultPageOptions = {
  browserName?: BrowserName
  logResponse?: boolean // passer true pour logguer toutes les réponses
  reject?: (error: Error) => void // Une fonction à appeler en cas de console.error dans le navigateur (ignoré si prefs.relax), ou si le navigateur crash (mais ce sera probablement à cause d'un pb de RAM et ce script sera peut-être dégagé aussi sans préavis)
}
/**
 * Retourne une nouvelle page sur le browser courant
 */
export async function getDefaultPage({
  browserName,
  logResponse,
  reject,
}: getDefaultPageOptions = {}) {
  let browser = prefs.browserInstance
  if (!browser || browserName) {
    if (!browserName) {
      if (prefs.browsers === undefined || prefs.browsers[0] === undefined) {
        throw new Error("Il n'y a aucun browser dans la liste des prefs")
      } else {
        browserName = prefs.browsers[0]
      }
    }
    browser = await initCurrentBrowser(browserName)
  }
  if (browser === null) throw new Error("Il n'y a pas de browser de chargé")
  const [context] = browser.contexts()
  const page = await context.newPage()
  // on ajoute le listeners sur les messages pour récupérer les console.error
  const consoleListener = (message: ConsoleMessage) => {
    // Cf https://playwright.dev/docs/api/class-consolemessage
    const type = message.type()
    const args = message.args()
    if (type === 'error') {
      if (!args.length)
        return logError('console.error du navigateur appelé sans argument')
      logError(
        `${page.url()}
[Browser error]`,
        ...args,
      )
    } else if (prefs.debug || (prefs.verbose && type === 'warning')) {
      if (String(args[0]) !== 'placeholderMetrics') {
        // la version 108 de mathlive spamme les warnings placeholderMetrics
        log(`[Browser ${type}]`, ...args)
      }
    }
  }
  const pageErrorListener = (error: Error) => {
    logError(error)
  }
  const pageCrashListener = (page: PlaywrightPage) => {
    logError(page)
  }
  // https://playwright.dev/docs/api/class-page#page-event-console
  page.on('console', consoleListener)
  // https://playwright.dev/docs/api/class-page#page-event-page-error
  page.on('pageerror', reject ?? pageErrorListener)
  // https://playwright.dev/docs/api/class-page#page-event-crash
  page.on('crash', pageCrashListener)

  // on ajoute toujours un listener sur les requests failed
  const requestfailedListener = (request: Request) => {
    const requestFailure = request.failure()
    log(
      `request failure on ${request.method()} ${request.url()} ${requestFailure === null ? '' : requestFailure.errorText}`,
    )
  }
  // https://playwright.dev/docs/api/class-page#pageonrequestfailed
  page.on('requestfailed', requestfailedListener)

  // et sur toutes les réponses si on le demande
  if (logResponse) page.on('response', responseListener)

  return page
}

/**
 * Vide les propriétés errors/warnings/failures de l'objet page (retourné par getPage)
 * @param {Page} page
 */
export function resetPage(page: Page) {
  page.errors = []
  page.warnings = []
  page.failures = []
}

async function purge(url: string) {
  try {
    const response = await fetch(url, { method: 'PURGE' })
    if (!response.ok) {
      // si on est pas sur un serveur sésamath varnish n'est pas forcément là, on dit rien
      if (!/\.sesamath\.(dev|net)/.test(url)) return
      // sinon c'est pas normal, on le signale
      console.error(
        `purge ${url} retourne ${response.status} ${response.statusText}`,
      )
    }
  } catch (error) {
    console.error(`purge ${url} KO :`, error)
  }
}

async function initCurrentBrowser(browserName: BrowserName) {
  logIfVerbose(`init browser ${browserName}`)
  const options = { ...prefs.browserOptions } // faut cloner pour que nos affectations ne modifient pas l'objet d'origine
  if (prefs.browserInstance) await prefs.browserInstance.close()
  prefs.browserInstance = null
  if (prefs.browsers === undefined) {
    throw Error('prefs.browsers est undefined')
  } else {
    if (!prefs.browsers.includes(browserName))
      throw Error(
        `browser ${browserName} invalide (pas dans la liste des browsers autorisés : ${prefs.browsers.join(' ou ')}`,
      )
  }
  const pwBrowser = playwright[browserName]
  options.headless = prefs.headless
  // chromium plante en headless chez moi, on tente ce workaround https://github.com/microsoft/playwright/issues/4761
  if (prefs.headless)
    options.args = ['--disable-gpu', '--enable-unsafe-swiftshader']
  if (prefs.slowMo) {
    console.info('slow mis en option du browser', prefs.slowMo)
    options.slowMo = prefs.slowMo
  }
  const browser = await pwBrowser.launch(options)
  // on lui crée son contexte
  await browser.newContext(prefs.contextOptions)
  prefs.browserInstance = browser
  logIfVerbose(`browser ${browserName} instancié`)
  return browser
}

/**
 * À passer en listener avec page.on('response', logResponse) ou page.removeListener('response', logResponse)
 * En mode debug ça affiche aussi le contenu des réponses json
 * @param {Protocol.Response} res La réponse {@link https://playwright.dev/docs/api/class-response}
 */
function responseListener(res: Response) {
  const req = res.request()
  log(
    `${req.method()} ${req.url()} ${res.status()} ${res.statusText()} => ${res.ok() ? 'OK' : 'KO'}`,
  )
  if (prefs.debug) {
    // on affiche aussi le contenu de la réponse json
    const headers = res.headers()
    if (/json/.test(headers['content-type'])) {
      // pas de await ici car on est pas async, on log en tâche de fond
      res
        .json()
        .then((resJson) => log(`réponse json de ${req.url()} :\n`, resJson))
        .catch(logError)
    }
  }
}
