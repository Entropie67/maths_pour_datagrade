import ExternalApp from './_ExternalApp'

export const uuid = 'duduReduction5e'
export const titre = 'Effectuer des réductions algébriques en 5e'

/**
 * @author Arnaud Durand
 */
class DuduReduction5e extends ExternalApp {
  constructor() {
    super('https://mathix.org/reduction/5e/index.html?suivi=1&mathalea=1')
  }
}

export default DuduReduction5e
