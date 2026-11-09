import ExternalApp from './_ExternalApp'

export const uuid = 'permisLitteralDevFact'
export const titre = 'Obtenir son permis littéral : développer et factoriser'
/**
 * @author Arnaud Durand
 */
class permisLitteralDevFact extends ExternalApp {
  constructor() {
    super(
      'https://mathix.org/permis_litteral_dev_fact/index.html?suivi=1&mathalea=1',
    )
  }
}

export default permisLitteralDevFact
