import ExternalApp from './_ExternalApp'

export const uuid = 'equations'
export const titre = 'Résoudre des équations'
/**
 * @author Rémi Angot
 */
class equations extends ExternalApp {
  constructor() {
    super('https://coopmaths.fr/apps/equations/?mathalea')
  }
}

export default equations
