import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Déterminer un prix par somme'
export const interactifReady = true

export const uuid = 's1oxx'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q7 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
    this.optionsChampTexte = { texteApres: ' €.' }
  }

  enonce(n1?: number, n2?: number, p1?: number, p2?: number) {
    if (n1 == null || n2 == null || p1 == null || p2 == null) {
      const prixUnitaire = choice([1.5, 2.5, 3.5])
      n1 = 2 * randint(2, 4)
      n2 = 2 * randint(2, 4, [n1 / 2])
      p1 = n1 * prixUnitaire
      p2 = n2 * prixUnitaire
    }
    const nTotal = n1 + n2
    const pTotal = p1 + p2

    this.reponse = pTotal
    this.question = `Les glaces sont toutes au même prix.<br>Pour $${n1}$ glaces, Malo a payé $${texNombre(p1, 0)}$ €.<br>Pour $${n2}$ glaces, Lisa a payé $${texNombre(p2, 0)}$ €.<br>Pour $${nTotal}$ glaces, Nour a payé `
    if (!this.interactif) {
      this.question += '$\\ldots$ €.'
    }
    this.correction = `$${nTotal}$ glaces $= ${n1}$ glaces $+$ $${n2}$ glaces, donc le prix est $${texNombre(p1, 0)} + ${texNombre(p2, 0)} = ${miseEnEvidence(texNombre(pTotal, 0))}$ €.`
    this.canEnonce = `Les glaces sont toutes au même prix.<br>Pour $${n1}$ glaces, Malo a payé $${texNombre(p1, 0)}$ €.<br>Pour $${n2}$ glaces, Lisa a payé $${texNombre(p2, 0)}$ €.`
    this.canReponseACompleter = `Pour $${nTotal}$ glaces, Nour a payé $\\ldots$ €.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(6, 4, 15, 10)
    else this.enonce()
  }
}
