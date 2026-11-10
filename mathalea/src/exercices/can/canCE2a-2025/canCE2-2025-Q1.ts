import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Complément à la dizaine supérieure'
export const interactifReady = true

export const uuid = 'ccf0d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025CE2Q1 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = randint(2, 4) * 100 + randint(2, 6) * 10 + randint(1, 4)
      b = Math.round(Math.ceil(a / 10) * 10)
    }

    this.reponse = b - a
    this.question = `$${a} + \\ldots = ${b}$`
    this.correction = `Pour trouver le nombre manquant, on peut calculer $${b}-${a}=${miseEnEvidence(texNombre(b - a, 0))}$.<br>
    On peut aussi procéder par complément :<br>`
    if (b - a > 10) {
      const complementADix = a % 0 > 0 ? 10 - (a % 10) : 0
      const dizaine = a + complementADix
      const centaineSup = Math.ceil(dizaine / 100) * 100
      const complementACent = centaineSup - dizaine
      if (complementADix > 0) {
        this.correction += `$${a}+${complementADix}=${dizaine}$<br>`
      }
      this.correction += `$${dizaine}+ ${complementACent} = ${centaineSup}$<br>`
      let complementACent2 = 0
      if (centaineSup !== b) {
        complementACent2 = b - centaineSup
        this.correction += `$${centaineSup}+${complementACent2}=${b}$<br>`
      }
      this.correction += `Donc au final, il a fallu ajouter : $${complementADix > 0 ? `${complementADix}+` : ''}${complementACent}${complementACent2 > 0 ? `+${complementACent2}` : ''}=${miseEnEvidence(b - a)}$.`
    } else {
      const complementADix = 10 - (a % 10)
      this.correction += ` $${a}+${miseEnEvidence(complementADix)}=${a + complementADix}$`
    }
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${a} + \\ldots = ${b}$`
    if (this.interactif) {
      this.question = `$${a}${sp()}+$ `
      this.optionsChampTexte = { texteApres: `$= ${b}$` }
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(342, 350)
    else this.enonce()
  }
}
