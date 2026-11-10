import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une probabilité'
export const interactifReady = true

export const uuid = '54dc6'
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

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let reponse: FractionEtendue
    if (this.canOfficielle) {
      reponse = new FractionEtendue(4, 10)
      this.reponse = reponse.texFraction
      this.question = `Une urne contient des jetons numérotés de $1$ à $10$.<br>
      On tire au hasard un jeton. <br>
     Quelle est la probabilité de tirer un nombre premier ?`
      this.correction = `Les nombres premiers inférieurs à $10$ sont : $2$, $3$, $5$, $7$.<br>
      Il y a donc $4$ nombres premiers inférieurs à $10$. <br>
      On en déduit que la probabilité d'obtenir un nombre premier est : $${miseEnEvidence(this.reponse)}${reponse.texSimplificationAvecEtapes()}$.`
    } else {
      const a = randint(8, 22)
      const b = 4
      this.question = `Une urne contient des jetons numérotés de $1$ à $${a}$.<br>
        On tire au hasard un jeton. <br>
        Quelle est la probabilité de tirer un nombre premier ?`
      if (a < 11) {
        reponse = new FractionEtendue(b, a)
        this.correction = `Les nombres premiers inférieurs à $${a}$ sont : $2$, $3$, $5$, $7$.<br>
        Il y a donc $4$ nombres premiers inférieurs à $${a}$. <br>
        On en déduit que la probabilité d'obtenir un nombre premier est : $${miseEnEvidence(reponse.texFraction)}${reponse.texSimplificationAvecEtapes()}$.`
      } else if (a > 10 && a < 13) {
        reponse = new FractionEtendue(b + 1, a)
        this.correction = `Les nombres premiers inférieurs à $${a}$ sont : $2$, $3$, $5$, $7$, $11$.<br>
Il y a donc $5$ nombres premiers inférieurs à $${a}$. <br>
On en déduit que la probabilité d'obtenir un nombre premier est : $${miseEnEvidence(reponse.texFraction)}${reponse.texSimplificationAvecEtapes()}$.`
      } else if (a > 12 && a < 17) {
        reponse = new FractionEtendue(b + 2, a)
        this.correction = `Les nombres premiers inférieurs à $${a}$ sont : $2$, $3$, $5$, $7$, $11$, $13$.<br>
Il y a donc $6$ nombres premiers inférieurs à $${a}$. <br>
On en déduit que la probabilité d'obtenir un nombre premier est : $${miseEnEvidence(reponse.texFraction)}${reponse.texSimplificationAvecEtapes()}$.`
      } else if (a > 16 && a < 19) {
        reponse = new FractionEtendue(b + 3, a)
        this.correction = `Les nombres premiers inférieurs à $${a}$ sont : $2$, $3$, $5$, $7$, $11$, $13$, $17$.<br>
Il y a donc $7$ nombres premiers inférieurs à $${a}$. <br>
On en déduit que la probabilité d'obtenir un nombre premier est : $${miseEnEvidence(reponse.texFraction)}${reponse.texSimplificationAvecEtapes()}$.`
      } else {
        reponse = new FractionEtendue(b + 4, a)
        this.correction = `Les nombres premiers inférieurs à $${a}$ sont : $2$, $3$, $5$, $7$, $11$, $13$, $17$, $19$.<br>
Il y a donc $8$ nombres premiers inférieurs à $${a}$.
<br>
On en déduit que la probabilité d'obtenir un nombre premier est : $${miseEnEvidence(reponse.texFraction)}${reponse.texSimplificationAvecEtapes()}$.`
      }
    }
    this.reponse = reponse.texFraction
  }
}
