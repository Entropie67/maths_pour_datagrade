import ExternalApp from './_ExternalApp'

export const uuid = 'challengeLitteral'
export const titre = 'Développer et réduire des expressions'

/**
 * @author Rémi Angot
 */
export default class challengeLitteral extends ExternalApp {
  constructor() {
    super('https://coopmaths.fr/challenge/?mathalea&type=litteral')
  }
}

