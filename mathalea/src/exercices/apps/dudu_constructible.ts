import ExternalApp from './_ExternalApp'

export const uuid = 'duduConstructible'
export const titre = 'Déterminer si des triangles sont constructibles'

/**
 * @author Arnaud Durand
 */
class DuduConstructible extends ExternalApp {
  constructor() {
    super('https://mathix.org/constructible/index.html?suivi=1&mathalea=1')
  }
}

export default DuduConstructible
