import ExternalApp from './_ExternalApp'

export const uuid = 'glisseNombre'
export const titre = 'Glisse-nombre'
/**
 * @author Rémi Angot
 */
export default class GlisseNombre extends ExternalApp {
  constructor() {
    super('https://coopmaths.fr/apps/glisse-nombre/?v=embed')
  }
}
