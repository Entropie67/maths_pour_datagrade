import ExternalApp from './_ExternalApp'

export const uuid = 'duduEquadorix'
export const titre = 'Résoudre des équations avec Équadorix'

/**
 * @author Arnaud Durand
 */
class DuduEquadorix extends ExternalApp {
  constructor() {
    super('https://mathix.org/equadorix/index.html?suivi=1&mathalea=1')
  }
}

export default DuduEquadorix
