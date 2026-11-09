import ExternalApp from './_ExternalApp'

export const uuid = 'duduReperagePlan'
export const titre = 'Effectuer un repérage dans le plan'

/**
 * @author Arnaud Durand
 */
class DuduReperagePlan extends ExternalApp {
  constructor() {
    super('https://mathix.org/reperage_plan/index.html?suivi=1&mathalea=1')
  }
}

export default DuduReperagePlan
