import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'dab01'
export const refs = {
  'fr-fr': ['3AutoM04-1'],
  'fr-ch': ['10CTGM4A-3', '10LCGM4A-3', '10LSGM4A-3', 'PRQMG04C-4'],
}
export const interactifReady = true
export const titre =
  "Convertir un volume donné en litres en d'autres unités de volume"
export const dateDePublication = '12/08/2026'

/**
 * DNB Polynésie juin 2026 - Question 7
 * @author Jean-Claude Lhote
 */
export default class AutoQ6PolynesieBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: ' $\\text{ cm}^3$' }
  }
  enonce(nbLitres?: number, uniteCible?: string) {
    if (nbLitres == null || uniteCible == null) {
      nbLitres = randint(101, 399, [200, 300]) / 100
      uniteCible = ['cm', 'dm', 'mm'][randint(0, 2)]
    }
    this.optionsChampTexte = { texteApres: ` $\\text{ ${uniteCible}}^3$` }
    this.question = this.interactif
      ? `Compléter l'égalité : $${texNombre(nbLitres, 2)}\\text{ L} =$`
      : `Recopier et compléter l'égalité : $${texNombre(nbLitres, 2)}\\text{ L} =\\ldots\\text{ ${uniteCible}}^3$`
    const coeff = uniteCible === 'cm' ? 1000 : uniteCible === 'dm' ? 1 : 1000000
    this.reponse = texNombre(nbLitres * coeff, 2)
    this.correction = `On sait que $1\\text{ L} = ${texNombre(coeff, 0)}\\text{ ${uniteCible}}^3$.<br>
Donc $${texNombre(nbLitres, 2)}\\text{ L} = ${texNombre(nbLitres, 2)}\\times ${texNombre(coeff, 0)}\\text{ ${uniteCible}}^3 = ${miseEnEvidence(texNombre(nbLitres * coeff, 2))}\\text{ ${uniteCible}}^3$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(3.57, 'cm')
    } else {
      this.enonce()
    }
  }
}
