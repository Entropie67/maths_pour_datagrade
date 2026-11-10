import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer le périmètre d'un rectangle"
export const interactifReady = true

export const uuid = 'cca3f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q11 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(longueur?: number, largeur?: number) {
    if (longueur == null || largeur == null) {
      longueur = randint(5, 9)
      largeur = randint(3, longueur - 1)
    }

    this.reponse = (longueur + largeur) * 2
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.question = `Un rectangle a une longueur de $${longueur}\\text{ cm}$ et une largeur de $${largeur}\\text{ cm}$.<br>
Son périmètre est égal à `

    this.correction = `Le périmètre d'un rectangle de longueur $${longueur}\\text{ cm}$ et de largeur $${largeur}\\text{ cm}$ est :<br>
$2\\times (${longueur}+${largeur})=2\\times ${longueur + largeur}=${miseEnEvidence(texNombre((longueur + largeur) * 2, 0))}\\text{ cm}$.`

    this.canReponseACompleter = '$\\ldots\\text{ cm}$'
    this.optionsChampTexte = { texteApres: ' $\\text{cm}$.' }

    if (!this.interactif) {
      this.question += ' $\\ldots$ cm'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(7, 5)
    else this.enonce()
  }
}
