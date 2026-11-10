import ExternalApp from './_ExternalApp'

export const uuid = 'duduStatistix4e'
export const titre = 'Pratiquer les statistiques en 4e'

/**
 * @author Arnaud Durand
 */
class DuduStatistix4e extends ExternalApp {
  constructor() {
    super('https://mathix.org/statistix/4e/index.html?suivi=1&mathalea=1')
  }
}

export default DuduStatistix4e
