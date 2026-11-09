import ExternalApp from './_ExternalApp'

export const uuid = 'permisEquerre'
export const titre = 'Obtenir son permis équerre'
/**
 * @author Arnaud Durand
 */
class permisEquerre extends ExternalApp {
  constructor() {
    super('https://mathix.org/permis_equerre/index.html?suivi=1&mathalea=1')
  }
}

export default permisEquerre
