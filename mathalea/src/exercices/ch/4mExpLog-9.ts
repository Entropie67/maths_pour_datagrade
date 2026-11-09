import EtudeFonctionLogarithme, {
  COMMENTAIRE_INTERACTIF,
  formulaireZerosApproches,
} from './4e/4mExpLog-8'

export const titre =
  'Étudier complètement une fonction avec le logarithme et des zéros approchés'
export const dateDePublication = '05/11/2026'
export const uuid = '7bd91'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mExpLog-9'] }

/**
 * Même étude que 4mExpLog-8, pour des fonctions dont l'équation f(x) = 0 ne se
 * résout pas algébriquement : les zéros sont cherchés après le tableau de
 * croissance, avec le théorème des valeurs intermédiaires.
 * @author Nathan Scheinmann
 */
export default class EtudeFonctionLogarithmeZerosApproches extends EtudeFonctionLogarithme {
  constructor() {
    super(formulaireZerosApproches)
    this.comment =
      "Chaque fonction est construite pour que sa dérivée se factorise et donne des extrema exacts (entiers ou logarithmes d'entiers). " +
      "L'équation f(x) = 0 ne se résout pas algébriquement : l'énoncé le précise, et les zéros sont demandés arrondis au centième à la question c), justifiés par le théorème des valeurs intermédiaires sur chaque intervalle de monotonie. " +
      'Un zéro entier exact (quand ln(1) = 0 l’annule) est donné exactement. ' +
      'Pour la somme, la variable est une fois sur deux décalée : ln(x - c) au lieu de ln(x). ' +
      COMMENTAIRE_INTERACTIF
  }
}
