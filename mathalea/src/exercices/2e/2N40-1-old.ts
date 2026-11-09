// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 53fbb continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 06/09/2026 (commit 62c919dce).
import PuissanceDunNombre from '../4e/4C35-old'
export const titre =
  'Transformer une écriture de puissance en écriture décimale ou fractionnaire'
export const dateDePublication = '14/06/2022'
export const interactifReady = true

export const uuid = '53fbb'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PuissanceDunNombre2eOld extends PuissanceDunNombre {
  constructor() {
    super()
    this.sup = true
  }
}
