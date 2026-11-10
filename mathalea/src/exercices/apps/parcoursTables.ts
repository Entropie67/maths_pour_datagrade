import ExternalApp from './_ExternalApp'

export const uuid = 'parcoursTables'
export const titre = 'Parcourir les tables de multiplication'
/**
 * @author Rémi Angot
 */
class parcoursTables extends ExternalApp {
  constructor() {
    super('https://coopmaths.fr/apps/parcours/?mathalea')
  }
}

export default parcoursTables
