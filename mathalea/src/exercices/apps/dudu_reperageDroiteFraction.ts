import ExternalApp from './_ExternalApp'

export const uuid = 'duduReperageDroiteFraction'
export const titre = 'Utiliser les abscisses fractionnaires'

/**
 * @author Arnaud Durand
 */
class DuduReperageDroiteFraction extends ExternalApp {
  constructor() {
    super(
      'https://mathix.org/reperage_droite_fraction/index.html?suivi=1&mathalea=1',
    )
  }
}

export default DuduReperageDroiteFraction
