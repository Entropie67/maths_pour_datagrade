import TableauxEtPourcentages from './_Tableaux_et_pourcentages'

export const titre = 'Utiliser un pourcentage - Prix fixe'
export const interactifReady = true
export const interactifType = 'tableau-mathlive'

/**
 * * Tableaux et pourcentages prix constant
 * * publication initiale le 25/11/2020
 * @author Sébastien Lozano
 */

export const uuid = 'f00fb'

export const refs = {
  'fr-fr': ['5P1A', 'BP2AutoB3', 'BP2CCF1'],
  'fr-2016': ['5N11-1', 'BP2AutoB3', 'BP2CCF1'],
  'fr-ch': ['10CTFA1E-1', '10LCFA1E-1', '10LSFA1E-1', 'PRQPF05B-4'],
}

export default class TableauxEtPourcentagesPrixConstant extends TableauxEtPourcentages {
  constructor() {
    super()
    this.exo = '5N11-1'
    this.consigne = 'Compléter le tableau suivant. Le prix est fixe.'
    this.besoinFormulaireNumerique = [
      'Le coefficient entre les pourcentages',
      2,
      '1 : est entier.\n2 : est décimal.',
    ]
    this.besoinFormulaire3CaseACocher = ['Modulation de ce qui est demandé']
    this.besoinFormulaire2Numerique = [
      'Nombre de colonnes à remplir (fixé à 3 lorsque la case ci-dessous est cochée)',
      4,
      '1 : Une colonne\n2 : Deux colonnes\n3 : Trois colonnes\n4 : Quatre colonnes',
    ]
  }
}
