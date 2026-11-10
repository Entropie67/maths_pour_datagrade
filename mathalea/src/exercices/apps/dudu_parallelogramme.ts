import ExternalApp from './_ExternalApp'

export const uuid = 'duduParallelogramme'
export const titre = 'Étudier les propriétés des parallélogrammes'

/**
 * @author Arnaud Durand
 */
class DuduParallelogramme extends ExternalApp {
  constructor() {
    super('https://mathix.org/parallelogramme/index.html?suivi=1&mathalea=1')
  }
}

export default DuduParallelogramme
