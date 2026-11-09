import type { Prefs } from './types'

/**
 * Préférences par défaut
 */
const prefs: Prefs = {
  browserInstance: null,
  browserOptions: {},
  browsers: ['chromium'],
  contextOptions: {},
  pauseOnError: true,
  debug: false,
  headless: true,
  silent: false,
  slowMo: 0,
  verbose: false,
  nbExosParLot: 50,
}

export default prefs
