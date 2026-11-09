import ExerciceConversions from '../6e/_Exercice_conversions'

export const titre =
  'Convertir des longueurs, masses, capacités, prix ou unités informatiques'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Ancienne version de 5G2D-4, conservée pour que les liens déjà partagés
 * continuent de fonctionner. Elle est remplacée dans le menu par `5G2D-4.ts`,
 * dont le paramétrage repose sur un formulaire complexe.
 *
 * @author Rémi Angot

 * Relecture : Novembre 2021 par EE
 */
export const uuid = '3eae0'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6N13', '5N15-2', 'BP2AutoQ2', '3AutoG06-1'],
  'fr-ch': ['NR'],
}
export default class Exercice5N152 extends ExerciceConversions {
  constructor() {
    super()
    this.sup = 1
    this.nbQuestions = 5
    this.comment =
      'Cet exercice est une ancienne version, conservée pour les liens déjà partagés. La nouvelle version 5G2D-4 propose un paramétrage plus souple des unités et des opérations.'
  }
}
