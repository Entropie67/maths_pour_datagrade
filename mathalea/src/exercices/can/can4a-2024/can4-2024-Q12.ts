import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Convertir cL <-> L'
export const interactifReady = true

export const uuid = '63eb6'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 40
      this.question = '$0,4\\text{ L }=$ '
      this.correction = `Comme $1$ L $=100$ cL, pour passer des $\\text{L}$ aux $\\text{cL}$, on multiplie par $100$.<br>
      Ainsi $0,4\\text{ L }=${miseEnEvidence(40)}$ cL`
      this.canEnonce = 'Complète.'
      this.canReponseACompleter = '$0,4\\text{ L }=\\ldots$ cL'
      if (!this.interactif) {
        this.question += '$\\ldots$ cL'
      } else {
        this.optionsChampTexte = { texteApres: 'cL' }
      }
    } else {
      if (choice([true, false])) {
        const a = randint(5, 19, 10) / 10
        this.reponse = (a * 100).toFixed(0)
        this.question = `$${texNombre(a, 1)}\\text{ L }=$ `
        this.correction = `Comme $1$ L $=100$ cL, pour passer des $\\text{L}$ aux $\\text{cL}$, on multiplie par $100$.<br>
      Ainsi $${texNombre(a, 1)}\\text{ L }=${miseEnEvidence(texNombre(a * 100, 1))}$ cL`

        this.canReponseACompleter = '$\\ldots$ cL'
        if (!this.interactif) {
          this.question += '$\\ldots$ cL'
        } else {
          this.optionsChampTexte = { texteApres: 'cL' }
        }
      } else {
        const a = randint(5, 19, 10) * 10
        this.reponse = (a / 100).toFixed(1)
        this.question = `$${texNombre(a, 1)}\\text{ cL }=$ `
        this.correction = `Comme $1$ cL $=0,01$ L, pour passer des $\\text{cL}$ aux $\\text{L}$, on divise par $100$.<br>
      Ainsi $${texNombre(a, 1)}\\text{ cL }=${miseEnEvidence(texNombre(a / 100, 1))}$ L`

        this.canReponseACompleter = '$\\ldots$ L'
        if (!this.interactif) {
          this.question += '$\\ldots$ L'
        } else {
          this.optionsChampTexte = { texteApres: 'L' }
        }
      }
    }
  }
}
