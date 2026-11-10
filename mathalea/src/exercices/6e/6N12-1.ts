import MultiplierUnNombreParPuissanceDeDixOld from './6N2B-4Old'

export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre =
  'Par combien multiplier un entier pour que le chiffre des unités devienne le chiffre des ... ?'

// Gestion de la date de publication initiale
export const dateDePublication = '05/11/2021'

/**
 * Presentation didactique : Par combien multiplier un entier pour que le chiffre des unités devienne le chiffre des ...
 * @author Éric Elter (inspiré par Aude Duvold)
 */

export const uuid = '89c0c'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6N12-1'],
  'fr-ch': ['PR-31'],
}
export default class Exercice6N121 extends MultiplierUnNombreParPuissanceDeDixOld {
  constructor() {
    super()
    this.sup = true
    this.sup3 = 1
  }
}
