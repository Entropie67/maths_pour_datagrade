import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Déterminer l'inverse ou l'opposé d'une fraction"
export const interactifReady = true

export const uuid = '83663'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class InverseOuOppose extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction

    this.optionsChampTexte = { texteAvant: 'est ', texteApres: '.' }
    this.canOfficielle = true
  }

  nouvelleVersion() {
    let reponse: FractionEtendue

    const listeFractions = this.canOfficielle
      ? [[5, 7]]
      : [
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
    const choix = this.canOfficielle ? true : choice([true, false])
    if (choix === false) {
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

    this.reponse = reponse.texFSD
  }
}
