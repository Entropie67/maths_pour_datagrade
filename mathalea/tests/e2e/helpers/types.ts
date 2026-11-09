import type {
  Browser,
  BrowserContextOptions,
  LaunchOptions,
  Locator,
} from 'playwright'

export type BrowserName = 'chromium' | 'firefox' | 'webkit'

export type Prefs = {
  browserInstance: null | Browser // L'objet Browser courant, null s'il n'y en a pas d'instancié
  browserOptions: LaunchOptions // Les options à passer au lancement du browser https://playwright.dev/docs/api/class-browsertype?_highlight=launch#browsertypelaunchoptions
  browsers: BrowserName[] // La liste des browsers qu'on va tester
  contextOptions: BrowserContextOptions // Options de contexte éventuel https://playwright.dev/docs/api/class-browser#browsernewcontextoptions
  pauseOnError: boolean // Si true, page.pause() après chaque test où il y a eu une erreur
  debug: boolean // Si false, n'affiche que les erreurs dans la console de node. Si true, affiche aussi tout le contenu de la console du navigateur ainsi que le contenu des réponses JSON https://playwright.dev/docs/api/class-response
  headless: boolean // Si true, effectue les tests en arrière plan pour aller plus vite
  silent: boolean // Si true, ne log rien dans la console
  slowMo: number // Délai en ms entre chaque action de Playwright si on veut avoir le temps de voir ce qu'il se passe
  verbose: boolean // Si true, affiche tous les messages de moindre importance loggés avec logIfVerbose()
  nbExosParLot: number // Nombre d'exercices à tester par lot pour limiter le temps de monopolisation des machines CI.
}

export type Katex = {
  elements: string[][]
  locators: Locator[]
  innerHTMLs: string[]
  innerTexts: string[]
}

export type Question = {
  feedback?: 'OK' | 'KO'
  id: string // du type 0Q0
  innerText: string
  innerHTML: string
  isCorrect: boolean
  katex: Katex
  locator: Locator
  numero: number
  mathField: string
}
