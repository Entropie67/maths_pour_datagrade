import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomM } from '../../../lib/outils/Personne'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Résoudre un problème'
export const interactifReady = true

export const uuid = '80a7b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025CE1Q12 extends ExerciceCan {
  enonce(a?: number, b?: number, quidam?: string) {
    if (a == null || b == null || quidam == null) {
      quidam = prenomM() as string

      a = randint(2, 5) * 10
      b = randint(9, 13, 10)
    }

    this.reponse = a - b
    this.question = `Arthur a préparé $${a}$ gâteaux pour le goûter. <br>$${b}$ gâteaux ont été mangés.<br>
    Combien en reste-t-il ?`
    this.correction = `On effectue une soustraction pour déterminer le nombre de gâteaux restants :<br>
     $${a}-${b}= ${a - b}$<br>
     Il reste $${miseEnEvidence(a - b)}$ gâteaux.`

    this.canReponseACompleter = '$\\ldots$ gâteaux'
    if (this.interactif) {
      this.question += ' <br> '
    }
    this.optionsChampTexte = {
      texteApres: ' gâteaux.',
      texteAvant: ' Il reste',
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(40, 12, 'Arthur')
    else this.enonce()
  }
}
