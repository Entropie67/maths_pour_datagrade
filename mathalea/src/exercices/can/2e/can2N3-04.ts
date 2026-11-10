import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomF } from '../../../lib/outils/Personne'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

import { pgcd } from '../../../lib/outils/primalite'
import { context } from '../../../modules/context'
export const titre = 'Résoudre un problème avec des fractions'
export const interactifReady = true

export const dateDePublication = '17/09/2024'
export const uuid = '4c878'
export const refs = {
  'fr-fr': ['can2N3-04', '2N33-flash1'],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ProblemeFractions extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.versionQcmDisponible = true
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.optionsDeComparaison = { fractionEgale: true }
  }

  nouvelleVersion() {
    const listeFractions = [
      [1, 3, 1, 4],
      [1, 3, 3, 4],
      [2, 3, 1, 4],
      [1, 5, 1, 4],
      [1, 5, 1, 3],
      [1, 5, 2, 3],
      [2, 5, 1, 3],
      [2, 5, 3, 4],
      [5, 6, 1, 4],
      [1, 6, 3, 4],
      [5, 6, 1, 3],
      [2, 7, 2, 3],
      [3, 4, 3, 4],
      [1, 7, 1, 3],
      [5, 7, 1, 6],
      [3, 10, 1, 3],
      [7, 10, 1, 4],
      [5, 6, 1, 10],
      [9, 10, 1, 4],
      [2, 3, 2, 3],
      [1, 9, 1, 3],
      [1, 9, 3, 7],
      [3, 7, 4, 7],
    ]
    const fractions = this.quotaChoice('fractions', listeFractions)
    const frac1 = new FractionEtendue(fractions[0], fractions[1])
    const frac2 = new FractionEtendue(fractions[2], fractions[3])
    const reste = frac1.entierMoinsFraction(1)
    const reponse = frac2.produitFraction(reste)
    const prenom = prenomF()
    this.reponse = this.versionQcm
      ? `$${frac2.produitFraction(reste).texFractionSimplifiee}$`
      : frac2.produitFraction(reste)
    this.question = `Ce matin, ${prenom} a ouvert une bouteille d’eau.<br>
     Elle a bu $${frac1.texFraction}$ de la bouteille. Puis à midi, ${context.isDiaporama ? '<br>' : ''} elle a bu $${frac2.texFraction}$ du reste.<br> 
Quelle fraction de la bouteille a-t-elle bue à midi ? `
    if (this.interactif && !this.versionQcm) {
      this.question += '<br>'
    }

    this.correction = `Le matin, ${prenom} a bu $${frac1.texFraction}$ de la bouteille. Il reste alors $${reste.texFraction}$ de la bouteille.<br>
    À midi, elle a bu $${frac2.texFraction}$ du reste.<br>
     Comme $${frac2.texFraction}\\times ${reste.texFraction}=${reponse.texFraction}$, elle a bu $${miseEnEvidence(reponse.texFraction)}$ 
     ${pgcd(reponse.num, reponse.den) === 1 ? '' : ` ou $${miseEnEvidence(reponse.simplifie().texFraction)}$`} de la bouteille à midi.`
    const distracteurs = [
      `$${frac2.ajouteEntier(-1).oppose().texFractionSimplifiee}$`,
      `$${frac1.sommeFraction(frac2).texFractionSimplifiee}$`,
      `$${frac1.produitFraction(frac2).texFractionSimplifiee}$`,
      `$${reste.texFractionSimplifiee}$`,
      `$${frac1.texFractionSimplifiee}$`,
      `$${frac2.texFractionSimplifiee}$`,
    ]
    this.distracteurs = [...new Set(distracteurs)]
      .filter((distracteur) => distracteur !== this.reponse)
      .slice(0, 4)
  }
}
