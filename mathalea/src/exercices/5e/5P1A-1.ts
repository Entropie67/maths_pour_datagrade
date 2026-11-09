import TableauxEtPourcentages from './_Tableaux_et_pourcentages'

export const titre = 'Utiliser un pourcentage - Pourcentage fixe'
export const interactifReady = true

/**
 * * Tableaux et pourcentages prix constant
 * * publication initiale le 28/11/2020
 * @author Sébastien Lozano
 */
export const uuid = '5a44b'

export const refs = {
  'fr-fr': ['5P1A-1', 'BP2AutoB4', 'BP2CCF2'],
  'fr-2016': ['5N11-2', 'BP2AutoB4', 'BP2CCF2'],
  'fr-ch': ['NR'],
}
export default class TableauxEtPourcentagesPourcentConstant extends TableauxEtPourcentages {
  constructor() {
    super()
    this.exo = '5N11-2'
    this.consigne = 'Compléter le tableau suivant. Le pourcentage est fixe.'
    this.besoinFormulaire2Numerique = [
      'Nombre de colonnes à remplir',
      4,
      '1 : Une colonne\n2 : Deux colonnes\n3 : Trois colonnes\n4 : Quatre colonnes',
    ]
  }
}
