import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Passer d'un décimal à une fraction"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '31/10/2022'
/**
 * @author Gilles Mora
 */

export const uuid = '67f09'

export const refs = {
  'fr-fr': ['can5C4-04', '6N3autoC-3', '6AutoN2-1'],
  'fr-ch': [],
}
export default class DecimalVersFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    let a, d, maFraction

    a = this.quotaRandint('a', 1, 39, [10, 20, 30])
    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3])) {
      case 1: // division par 10
        d = a / 10
        maFraction = new FractionEtendue(a, 10)
        this.correction = `$${texNombre(d, 1)}=${maFraction.estIrreductible ? miseEnEvidence(`\\dfrac{${texNombre(d * 10, 0)}}{10}`) : `\\dfrac{${texNombre(d * 10, 0)}}{10}`}${maFraction.texSimplificationAvecEtapes(true, orangeMathalea)}$ `
        break
      case 2: // division par 100
        d = a / 100
        maFraction = new FractionEtendue(a, 100)
        this.correction = `$${texNombre(d, 2)}=${maFraction.estIrreductible ? miseEnEvidence(`\\dfrac{${texNombre(d * 100, 2)}}{100}`) : `\\dfrac{${texNombre(d * 100, 2)}}{100}`}${maFraction.texSimplificationAvecEtapes(true, orangeMathalea)}$ `
        break

      case 3: // division par 1000
      default:
        a = choice([
          a,
          randint(201, 299, [210, 220, 230, 240, 250, 260, 270, 280, 290]),
        ])
        d = a / 1000
        maFraction = new FractionEtendue(a, 1000)
        this.correction = `$${texNombre(d, 3)}=${maFraction.estIrreductible ? miseEnEvidence(`\\dfrac{${texNombre(d * 1000, 3)}}{${texNombre(1000)}}`) : `\\dfrac{${texNombre(d * 1000, 3)}}{${texNombre(1000)}}`}${maFraction.texSimplificationAvecEtapes(true, orangeMathalea)}$ `
        break
    }
    if (this.interactif)
      this.correction +=
        "<br><br><em>Remarque : une fraction a une infinité d'écritures différentes.</em>"
    this.question = `Écrire $${texNombre(d, 3)}$ sous la forme d'une fraction.`
    this.reponse = maFraction
  }
}
