import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un coefficient directeur'
export const interactifReady = true

export const uuid = '5b0ab'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CoeffDirecteur extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }
  }

  nouvelleVersion() {
    const xK = this.canOfficielle ? 3 : randint(3, 10)
    const yK = this.canOfficielle ? 1 : randint(0, 7)
    const xL = this.canOfficielle ? -5 : randint(-5, 7, [0, xK])
    const yL = this.canOfficielle ? 1 : choice([yK, yK + 1, yK + 1])
    const n = yL - yK
    const d = xL - xK

    this.reponse = new FractionEtendue(n, d).simplifie().texFraction
    this.question = `Coefficient directeur de la droite $(KL)$ avec $K(${xK}\\,;\\,${yK})$ et $L(${xL}\\,;\\,${yL})$. `
    if (this.canOfficielle || yK === yL) {
      this.correction = `On remarque que les points $K$ et $L$ ont les mêmes ordonnées. <br>
    On en déduit que la droite $(KL)$ est horizontale et donc que son coefficient directeur est égal à $${miseEnEvidence('0')}$.`
    } else {
      this.correction =
        "On sait d'après le cours que le coefficient directeur $m$ est donné par : $m=\\dfrac{y_L-y_K}{x_-x_A}$."
      this.correction += `<br>On applique avec les données de l'énoncé :
        $m=\\dfrac{${yL}-${ecritureParentheseSiNegatif(yK)}}{${xL}-${ecritureParentheseSiNegatif(xK)}}=
        ${miseEnEvidence(`${this.reponse}`)}$.`
    }

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
