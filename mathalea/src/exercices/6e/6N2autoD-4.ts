import MultiplierDiviserParPuissancesNegativesDe10 from '../5e/5N1autoE-4'

export const interactifReady = true
export const interactifType = 'mathLive'

export const titre = 'Multiplier un nombre par 0,1 ; 0,01 ou 0,001'
export const dateDePublication = '28/10/2026'

/**
 * Multiplication d'un nombre entier ou décimal par 0,1 ; 0,01 ou 0,001.
 * La correction rappelle que 0,1 = 1/10, 0,01 = 1/100, 0,001 = 1/1000 et
 * indique comment se déplace le chiffre des unités.
 * @author Rémi Angot
 */
export const uuid = '20ba1'

export const refs = {
  'fr-fr': ['6N2autoD-4', '6AutoN4-7'],
  'fr-ch': ['NR'],
}

export default class MultiplierParPuissancesNegativesDe10 extends MultiplierDiviserParPuissancesNegativesDe10 {
  constructor() {
    super()
    this.multiplicationSeulement = true
    this.besoinFormulaire4Texte = false
    this.sup4 = '1'
    this.comment = this.comment?.replace(/<br><br>Le quatrième.*$/, '')
  }
}
