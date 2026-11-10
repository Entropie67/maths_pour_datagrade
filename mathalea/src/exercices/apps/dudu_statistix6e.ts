import ExternalApp from './_ExternalApp'

export const uuid = 'duduStatistix6e'
export const titre = 'Pratiquer les statistiques en 6e'

/**
 * @author Arnaud Durand
 */
class DuduStatistix6e extends ExternalApp {
  constructor() {
    super('https://mathix.org/statistix/6e/index.html?suivi=1&mathalea=1')
  }
}

export default DuduStatistix6e
