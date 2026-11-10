import ExternalApp from './_ExternalApp'

export const uuid = 'permisLitteralReduire'
export const titre = 'Obtenir son permis littéral : réduire une expression'
/**
 * @author Arnaud Durand
 */
class permisLitteralRed extends ExternalApp {
  constructor() {
    super(
      'https://mathix.org/permis_litteral_red/index.html?suivi=1&mathalea=1',
    )
  }
}

export default permisLitteralRed
