import ProblemesEnEquation from '../3e/3L13-3'

/**
 * Suppression de la copie de code de la classe ProblemesEnEquation
 * et utilisation de l'héritage pour la classe ProblemesEnEquation2
 * qui hérite de la classe ProblemesEnEquation
 * @extends ProblemesEnEquation
 * @class ProblemesEnEquation2
 * @description Exercices de mathématiques pour les 2e
 * @author Jean-claude Lhote
 */
export const uuid = '622b9'
export const titre = 'Mettre un problème en équation et le résoudre'
export const refs = {
  'fr-fr': ['2L20-1', 'BP2RES21'],
  'fr-ch': ['NR'],
}
export default class ProblemesEnEquation2 extends ProblemesEnEquation {
  public constructor() {
    super()
    this.niveau = 2
    this.correctionDetaillee = false
  }
}
