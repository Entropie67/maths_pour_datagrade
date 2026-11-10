import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer une fraction d'un entier"
export const interactifReady = true

export const uuid = 'sts09'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q7 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: string, b?: number) {
    let c = 3
    if (a == null || b == null) {
      a = this.quotaChoice('a', ['La moitié', 'Le tiers', 'Le quart'])
      c = a === 'La moitié' ? 2 : a === 'Le tiers' ? 3 : 4
      b =
        ((c === 4 ? randint(1, 2) : c === 3 ? randint(1, 3) : randint(1, 4)) +
          10) *
        c
    }

    this.reponse = b / c
    this.question = `${a} de $${b}$ `
    this.correction = `${a} de $${b}$ est égal${a === 'La moitié' ? 'e' : ''} à : $${b}\\div ${c} = ${miseEnEvidence(texNombre(b / c, 0))}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('Le tiers', 30)
    else this.enonce()
  }
}
