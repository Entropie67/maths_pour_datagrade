import ExternalApp from './_ExternalApp'

export const uuid = 'duduThpythagore'
export const titre = 'Appliquer le théorème de Pythagore'

/**
 * @author Arnaud Durand
 */
class DuduThpythagore extends ExternalApp {
  constructor() {
    super('https://mathix.org/thpythagore/index.html?suivi=1&mathalea=1')
  }
}

export default DuduThpythagore
