import ExternalApp from './_ExternalApp'

export const uuid = 'duduReperageEspace'
export const titre = "Effectuer un repérage dans l'espace"

/**
 * @author Arnaud Durand
 */
class DuduReperageEspace extends ExternalApp {
  constructor() {
    super('https://mathix.org/reperage_espace/index.html?suivi=1&mathalea=1')
  }
}

export default DuduReperageEspace
