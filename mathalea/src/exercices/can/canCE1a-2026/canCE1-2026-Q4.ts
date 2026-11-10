import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Résoudre un problème de jeu de l'oie"
export const interactifReady = true

export const uuid = '5ab31'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q4 extends ExerciceCan {
  enonce(caseDepart?: number, de1?: number, de2?: number) {
    if (caseDepart == null || de1 == null || de2 == null) {
      caseDepart = randint(19, 29)
      de1 = randint(4, 6)
      de2 = randint(4, 6)
    }

    this.reponse = caseDepart + de1 + de2
    this.question = `Axel est sur la case $${caseDepart}$ du jeu de l'oie. Il lance deux dés et obtient $${de1}$ et $${de2}$.<br>Il arrive sur la case : `
    this.correction = `Axel avance de $${de1}+${de2}=${de1 + de2}$ cases.<br>Il arrive donc sur la case $${caseDepart}+${de1 + de2}=${miseEnEvidence(texNombre(this.reponse, 0))}$.`
    this.canEnonce =
      "Axel est sur la case $28$ du jeu de l'oie. Il lance deux dés et obtient $6$ et $6$."
    this.canReponseACompleter = 'Il arrive sur la case $\\ldots$'

    if (this.interactif) {
      this.optionsChampTexte = { texteApres: '' }
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(28, 6, 6)
    else this.enonce()
  }
}
