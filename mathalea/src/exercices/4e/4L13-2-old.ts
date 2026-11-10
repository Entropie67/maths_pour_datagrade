import ProblemesEnEquation from '../3e/3L13-3'
export const titre =
  'Mettre un problème en équation et le résoudre (ancienne version)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDePublication = '04/04/2022'
export const dateDeModifImportante = '05/04/2023'

/**
 * @author Guillaume Valmont
 * Ancienne version de 4L13-2, conservée pour les feuilles déjà partagées.
 * La nouvelle version (4L13-2) détaille les étapes de la mise en équation.
 */
export const uuid = '5ca1e'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ProblemesEnEquation4e extends ProblemesEnEquation {
  constructor() {
    super()
    this.sup = '1-2-3-4-5-6-7-8-9'
  }
}
