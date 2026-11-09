// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid a6b5b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import EqResolvantesThales from '../3e/3L13-2-old'
export const titre = 'Déterminer une quatrième proportionnelle dans un tableau'
export const interactifReady = true

export const dateDePublication = '15/12/2020'
export const dateDeModifImportante = '15/06/2024'
export const uuid = 'a6b5b'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class TableauxEtQuatriemeProportionnelleOld extends EqResolvantesThales {
  constructor() {
    super()
    this.exo = '4P10-2'
    this.consignePluriel =
      'Déterminer la quatrième proportionnelle dans les tableaux suivants.'
    this.consigneSingulier =
      'Déterminer la quatrième proportionnelle dans le tableau suivant.'
    this.sup = 1
    this.clavierAvecFraction = true
  }
}
