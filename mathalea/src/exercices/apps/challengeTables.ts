import ExternalApp from './_ExternalApp'

export const uuid = 'challengeTables'
export const titre = 'Relever le challenge des tables de multiplication'

/**
 * @author Rémi Angot
 */
class challengeTables extends ExternalApp {
  constructor() {
    super('https://coopmaths.fr/challenge/?mathalea&type=tables')
  }
}

export default challengeTables
