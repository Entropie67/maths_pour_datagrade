import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Déterminer l'opposé ou l'inverse d'une fraction"
export const interactifReady = true

export const uuid = '719da'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction

    this.optionsChampTexte = { texteAvant: 'est', texteApres: '.' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let reponse: FractionEtendue
    if (this.canOfficielle) {
      reponse = new FractionEtendue(2, 3).oppose()
      this.question = "L'opposé de $\\dfrac{2}{3}$ "
      this.correction = `Deux nombres sont opposés lorsque leur somme est nulle.<br>
      L'opposé de $\\dfrac{2}{3}$ est : $${miseEnEvidence(reponse.texFSD)}$.`
    } else {
      const listeFractions = [
        [1, 3],
        [1, 7],
        [5, 7],
        [3, 7],
        [5, 3],
        [7, 9],
        [7, 3],
        [4, 7],
        [7, 13],
        [1, 9],
      ]
      const a = choice(listeFractions)
      if (choice([true, false])) {
        reponse = new FractionEtendue(a[0], a[1]).oppose()
        this.question = `L'opposé de $\\dfrac{${a[0]}}{${a[1]}}$ `
        this.correction = `Deux nombres sont opposés lorsque leur somme est nulle.<br>
        L'opposé de $\\dfrac{${a[0]}}{${a[1]}}$ est : $${miseEnEvidence(reponse.texFSD)}$.`
      } else {
        reponse = new FractionEtendue(a[0], a[1]).inverse()
        this.question = `L'inverse de $\\dfrac{${a[0]}}{${a[1]}}$ `
        this.correction = `Deux nombres sont inverses l'un de l'autre lorsque leur produit vaut $1$.<br>
        L'inverse de $\\dfrac{${a[0]}}{${a[1]}}$ est  $${miseEnEvidence(reponse.texFSD)}$ car $\\dfrac{${a[0]}}{${a[1]}}\\times ${reponse.texFSD}=1$.`
      }
    }
    this.reponse = reponse.texFSD
  }
}
