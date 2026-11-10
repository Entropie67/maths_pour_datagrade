// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid be864 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import developperIdentiteRemarquable from '../3e/3L11-15'

export const titre = 'Développer une identité remarquable'
export const dateDePublication = '09/10/2025'
export const dateDeModifImportante = '05/11/2025'

/**
 * Clone de 3L11-15 pour la France
 * @author Éric Elter
 */

export const uuid = 'be864'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class developperIdentiteRemarquableFranceOld extends developperIdentiteRemarquable {
  constructor() {
    super()
    this.pays = 'France'
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : (x+a)^2\n2 : (x-a)^2\n3 : (x-a)(x-b)\n5 : (ax+by)^2\n6 : (ax-by)^2\n7 : (ax+by)(ax-by)\n9 - Mélange',
    ]
    this.besoinFormulaire3Numerique = false
    this.sup3 = 1
  }
}
