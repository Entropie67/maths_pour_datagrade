import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Répartition'
export const interactifReady = true

export const uuid = 'a343p'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q10 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    let c = 25
    if (a == null || b == null) {
      b = this.quotaRandint('b', 4, 6)
      c = this.quotaChoice('c', [15, 20, 25, 30, 35, 40])
      a = b * c
    }
    this.reponse = c
    this.question = `On répartit $${a}$ élèves dans $${b}$ groupes de même effectif.<br>
    Le nombre d'élèves dans un groupe est :`
    this.correction = `$${a}\\div ${b} = ${miseEnEvidence(String(c))}$<br>
    Donc, chaque groupe contient $${c}$ élèves.`
    this.canReponseACompleter = '$\\ldots$'
    if (!this.interactif && context.isHtml) {
      this.question += ' $\\ldots$'
    }
    this.optionsChampTexte = { texteApres: '.' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(150, 6)
    else this.enonce()
  }
}
