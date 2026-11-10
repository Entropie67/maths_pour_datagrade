import ExternalApp from './_ExternalApp'

export const uuid = 'duduArrondi'
export const titre = 'Trouver un arrondi'

/**
 * @author Arnaud Durand
 */
class DuduArrondi extends ExternalApp {
  constructor() {
    super('https://mathix.org/arrondi/index.html?suivi=1&mathalea=1')
  }
}

export default DuduArrondi
