// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 80c0e continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import MultipleDistributivite from '../3e/3L11-3b-old'

export const titre = 'Additionner des expressions à développer'

export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '20/02/2025'
/**
 * Clone de 3L11-1b pour les secondes
 *
 * @author Gilles Mora
 */
export const uuid = '80c0e'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class MultipleDistributiviteSecondeOld extends MultipleDistributivite {
  constructor() {
    super()
    this.sup = 4
    this.sup2 = 4
    this.sup3 = 3
  }
}
