import ExternalApp from './_ExternalApp'

export const uuid = 'duduReperageSphere'
export const titre = 'Effectuer un repérage sur une sphère'

/**
 * @author Arnaud Durand
 */
class DuduReperageSphere extends ExternalApp {
  constructor() {
    super('https://mathix.org/reperage_sphere/index.html?suivi=1&mathalea=1')
  }
}

export default DuduReperageSphere
