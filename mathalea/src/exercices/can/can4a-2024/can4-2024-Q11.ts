import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Passer des fractions d'heures en minutes"
export const interactifReady = true

export const uuid = 'b8916'
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
    if (this.canOfficielle) {
      this.reponse = 45
      this.question = "$\\dfrac{3}{4}$ d'heure $=$ "
      this.correction = `$\\dfrac{1}{4}$ d'heure $=60\\text{ min }\\div4=15$ min.<br><br>
    Ainsi,  $\\dfrac{3}{4}$ d'heure $=${miseEnEvidence(45)}$ min`

      this.canReponseACompleter = '$\\ldots$ min'
      if (!this.interactif) {
        this.question += '$\\ldots$ min'
      } else {
        this.optionsChampTexte = { texteApres: 'min' }
      }
    } else {
      const listeHeures = [
        [3, 4, 45],
        [1, 3, 20],
        [2, 3, 40],
        [1, 6, 10],
        [5, 6, 50],
        [1, 10, 6],
        [3, 10, 18],
        [7, 10, 42],
        [1, 4, 15],
      ]
      const a = choice(listeHeures)
      const fracHeures = new FractionEtendue(a[0], a[1])
      if (choice([true, false])) {
        this.reponse = a[2]
        this.question = `$${fracHeures.texFraction}$ d'heure $=$ `
        this.correction = `$\\dfrac{1}{${a[1]}}$ h $=60\\text{ min }\\div ${a[1]}= ${texNombre(a[2] / a[0], 0)}$ min.<br>
        Ainsi, $${fracHeures.texFraction}$ d'heure $=${miseEnEvidence(a[2])}$ min`

        this.canReponseACompleter = '$\\ldots$ min'
        if (!this.interactif) {
          this.question += '$\\ldots$ min'
        } else {
          this.optionsChampTexte = { texteApres: 'min' }
        }
      } else {
        this.reponse = new FractionEtendue(a[0], a[1])
        this.question = `$${a[2]}$ min $=$ `
        this.correction = `$\\dfrac{1}{${a[1]}}$ h $=60\\text{ min } \\div ${a[1]} = ${texNombre(a[2] / a[0], 0)}$ min.<br>
        Ainsi, $${a[2]}$ min $=${miseEnEvidence(fracHeures.texFraction)}$ h`

        this.canReponseACompleter = '$\\ldots$ h'
        if (!this.interactif) {
          this.question += '$\\ldots$ h'
        } else {
          this.optionsChampTexte = { texteApres: 'h' }
        }
      }
    }
  }
}
