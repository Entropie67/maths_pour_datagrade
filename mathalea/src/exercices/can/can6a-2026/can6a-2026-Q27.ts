import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texPrix } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Déterminer un prix'
export const interactifReady = true

export const uuid = '81q3f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Éric Elter

*/
export default class Can20266Q27 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = {
      texteAvant: '<br>On me rend ',
      texteApres: ' €.',
    }
  }

  listeviennoiserie = [
    ['croissants', 'chacun'],
    ['pains au chocolat', 'chacun'],
    ['chocolatines', 'chacune'],
    ['pains aux raisins', 'chacun'],
    ['cookies', 'chacun'],
    ['briochettes', 'chacune'],
  ]

  enonce(
    PrixUneViennoiserie?: number,
    PrixBillet?: number,
    NomViennoiserie?: string[],
  ) {
    if (PrixUneViennoiserie == null) {
      PrixUneViennoiserie = arrondi(1 + randint(1, 9, [5]) / 10)
      PrixBillet = choice([4, 5, 10, 20])
      NomViennoiserie = choice(this.listeviennoiserie)
    }

    this.reponse = PrixBillet! - 2 * PrixUneViennoiserie
    this.question = `J'achète deux ${NomViennoiserie![0]} à $${texPrix(PrixUneViennoiserie)}$ € ${NomViennoiserie![1]}. <br>
           Je donne $${PrixBillet!}$  €.`
    this.canEnonce = this.question
    if (!this.interactif && context.isHtml) {
      this.question += `<br>On me rend $\\ldots$  €.`
    }
    this.correction = `Deux ${NomViennoiserie![0]} coûtent $2\\times${texPrix(PrixUneViennoiserie)}~€=${texPrix(2 * PrixUneViennoiserie)}~€$.<br>`
    this.correction += `On doit me rendre $${PrixBillet!}~€ -${texPrix(2 * PrixUneViennoiserie)}~€=${miseEnEvidence(texPrix(this.reponse))}$ €.`

    this.canReponseACompleter = 'On me rend $\\dots$ €.'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1.2, 10, this.listeviennoiserie[0])
    else this.enonce()
  }
}
