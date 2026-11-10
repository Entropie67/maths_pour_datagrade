import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texPrix } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Déterminer un rendu de monnaie'
export const interactifReady = true

export const uuid = '8fae0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Éric Elter

*/
export default class Can2026CM1Q27 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = {
      texteAvant: '<br>On me rend ',
      texteApres: ' €.',
    }
  }

  // [article + nom, genre 'm' ou 'f']
  listeviennoiserie: [string, string][] = [
    ['un croissant', 'm'],
    ['un petit pain', 'm'],
    ['un pain aux raisins', 'm'],
    ['un cookie', 'm'],
    ['une brioche', 'f'],
  ]

  enonce(PrixViennoiserie?: number, NomViennoiserie?: [string, string]) {
    if (PrixViennoiserie == null) {
      PrixViennoiserie = arrondi(1 + randint(1, 9, [5]) / 10)
      NomViennoiserie = choice(this.listeviennoiserie)
    }

    const PrixBillet = 10
    this.reponse = arrondi(PrixBillet - PrixViennoiserie)

    this.question = `J'achète ${NomViennoiserie![0]} à $${texPrix(PrixViennoiserie)}$ €.<br>
           Je donne $${PrixBillet}$ €.`
    if (!this.interactif) {
      this.question += `<br>On me rend $\\ldots$  €.`
    }
    this.correction = `On doit me rendre $${PrixBillet}~€ -${texPrix(PrixViennoiserie)}~€=${miseEnEvidence(texPrix(this.reponse))}$ €.`

    this.canReponseACompleter = 'On me rend $\\dots$ €.'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1.5, this.listeviennoiserie[1])
    else this.enonce()
  }
}
