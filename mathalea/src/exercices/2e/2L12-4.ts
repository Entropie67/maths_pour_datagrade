import developperIdentiteRemarquable from '../3e/3L11-15'

export const titre = 'Développer une identité remarquable'
export const interactifReady = true
export const dateDePublication = '09/10/2025'
export const dateDeModifImportante = '21/09/2026'

/**
 * Clone de 3L11-15 pour la France
 * @author Éric Elter
 */

export const uuid = '12880'

export const refs = {
  'fr-fr': ['2L12-4', 'BP2AutoI8', 'BP1AUTO078'],
  'fr-ch': ['NR'],
}
export default class developperIdentiteRemarquableFrance extends developperIdentiteRemarquable {
  constructor() {
    super()
    this.pays = 'France'
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : (x+a)^2\n2 : (x-a)^2\n3 : (x-a)(x-b)\n5 : (ax+by)^2\n6 : (ax-by)^2\n7 : (ax+by)(ax-by)\n9 - Mélange',
    ]
    this.besoinFormulaire3Numerique = false
    this.sup3 = 1
    this.sup4 = 1
    this.lettresVariablesImposees = ['x']
  }
}
