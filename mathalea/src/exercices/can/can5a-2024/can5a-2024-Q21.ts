import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Effectuer une conversion d'aires"
export const interactifReady = true

export const uuid = '6c739'
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
      this.reponse = 2500
      this.question = '$25\\text{ m}^2=$ '
      this.correction = `$1\\text{ m}^2= 100\\text{ dm}^2$, donc $25\\text{ m}^2=25\\times 100\\text{ dm}^2=${miseEnEvidence(texNombre(2500))}\\text{ dm}^2$`
      this.canEnonce = 'Complète.'
      this.canReponseACompleter = '$25\\text{ m}^2=\\ldots\\text{ dm}^2$'
      if (!this.interactif) {
        this.question += ' $\\ldots\\text{ dm}^2$'
      } else {
        this.optionsChampTexte = { texteApres: '$\\text{ dm}^2$' }
      }
    } else {
      const a = randint(2, 9)
      const choix = choice(['a', 'b', 'c', 'd']) //
      if (choix === 'a') {
        this.reponse = a * 100
        this.question = `$${a}\\text{ dm}^2=$`
        this.correction = `$1\\text{ dm}^2= 100\\text{ cm}^2$, donc $${a}\\text{ dm}^2=${a}\\times 100\\text{ cm}^2=${miseEnEvidence(a * 100)}\\text{ cm}^2$.`
        this.canEnonce = 'Complète.'
        this.canReponseACompleter = `$${a}\\text{ dm}^2=\\ldots\\text{ cm}^2$`
        if (!this.interactif) {
          this.question += ' $\\ldots\\text{ cm}^2$'
        } else {
          this.optionsChampTexte = { texteApres: '$\\text{cm}^2$' }
        }
      }
      if (choix === 'b') {
        this.reponse = a / 100
        this.question = `$${a}\\text{ cm}^2=$`
        this.correction = `$1\\text{ cm}^2= 0,01\\text{ dm}^2$, donc $${a}\\text{ cm}^2=${a}\\times 0,01\\text{ dm}^2=${miseEnEvidence(texNombre(a / 100))}\\text{ dm}^2$.`
        this.canEnonce = 'Complète.'
        this.canReponseACompleter = `$${a}\\text{ cm}^2=\\ldots\\text{ dm}^2$`
        if (!this.interactif) {
          this.question += '$\\ldots\\text{ dm}^2$'
        } else {
          this.optionsChampTexte = { texteApres: '$\\text{ dm}^2$' }
        }
      }
      if (choix === 'c') {
        this.reponse = a * 100
        this.question = `$${a}\\text{ m}^2=$`
        this.correction = `$1\\text{ m}^2= 100\\text{ dm}^2$, donc $${a}\\text{ m}^2=${a}\\times 100\\text{ dm}^2=${miseEnEvidence(a * 100)}\\text{ dm}^2$.`
        this.canEnonce = 'Complète.'
        this.canReponseACompleter = `$${a}\\text{ m}^2=\\ldots\\text{ dm}^2$`
        if (!this.interactif) {
          this.question += '$\\ldots\\text{ dm}^2$'
        } else {
          this.optionsChampTexte = { texteApres: '$\\text{ dm}^2$' }
        }
      }
      if (choix === 'd') {
        this.reponse = a / 100
        this.question = `$${a}\\text{ dm}^2=$`
        this.correction = `$1\\text{ dm}^2= 0,01\\text{ m}^2$, donc $${a}\\text{ dm}^2=${a}\\times 0,01\\text{ m}^2=${miseEnEvidence(texNombre(a / 100))}\\text{ m}^2$.`
        this.canEnonce = 'Complète.'
        this.canReponseACompleter = `$${a}\\text{ dm}^2=\\ldots\\text{ m}^2$`
        if (!this.interactif) {
          this.question += '$\\ldots\\text{ m}^2$'
        } else {
          this.optionsChampTexte = { texteApres: '$\\text{ m}^2$' }
        }
      }
    }
  }
}
