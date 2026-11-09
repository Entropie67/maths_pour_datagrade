import ExternalApp from './_ExternalApp'

export const uuid = 'questionsDeCours'
export const titre = 'Questions de cours'

/**
 * @author Rémi Angot
 */
export default class QuestionsDeCours extends ExternalApp {
  constructor() {
    super('https://coopmaths.fr/apps/questions-de-cours/?mathalea')
  }
}
