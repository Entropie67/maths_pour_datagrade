import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un périmètre ou une aire'
export const interactifReady = true

export const uuid = 'vzpnb'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q29 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, type?: string) {
    if (a == null || type == null) {
      a = randint(2, 10)
      type = choice(['aireVersPerimetre', 'perimetreVersAire'])
    }

    if (type === 'aireVersPerimetre') {
      const reponse = 4 * a
      this.optionsChampTexte = {
        texteAvant: '<br>',
        texteApres: '$\\text{ cm}$',
      }
      this.question = `Donner le périmètre d'un carré d'aire $${a * a}\\text{ cm}^2$.`
      this.correction = `La longueur du côté est donnée par $\\sqrt{${a * a}}=${a}$.<br>
Le périmètre est donc $4\\times ${a}=${miseEnEvidence(reponse)}\\text{ cm}$.`
      this.reponse = reponse
      this.canReponseACompleter = '$\\ldots\\text{ cm}$'
    } else {
      const reponse = a * a
      this.optionsChampTexte = {
        texteAvant: '<br>',
        texteApres: '$\\text{ cm}^2$',
      }
      this.question = `Donner l'aire d'un carré de périmètre $${4 * a}\\text{ cm}$.`
      this.correction = `La longueur du côté est donnée par $${4 * a}\\div 4=${a}$.<br>
L'aire est donc $ ${a}\\times ${a}=${miseEnEvidence(reponse)}\\text{ cm}^2$.`
      this.reponse = reponse
      this.canReponseACompleter = '$\\ldots\\text{ cm}^2$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(6, 'aireVersPerimetre')
    else this.enonce()
  }
}
