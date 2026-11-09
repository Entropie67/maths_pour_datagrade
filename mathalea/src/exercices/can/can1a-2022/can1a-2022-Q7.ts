import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { plot } from '../../../lib/2d/Plot'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une fréquence'
export const interactifReady = true

export const uuid = 'pu78a'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q7 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
      fractionEgale: true,
    }
  }

  enonce(nbNoires?: number, nbTotal?: number) {
    if (nbNoires == null || nbTotal == null) {
      nbNoires = randint(1, 4)
      nbTotal = randint(nbNoires + 1, 9)
    }

    let c: boolean[] = []
    for (let n = 0; n < nbNoires; n++) {
      c.push(true)
    }
    for (let n = 0; n < nbTotal - nbNoires; n++) {
      c.push(false)
    }
    c = shuffle(c)
    const d = []
    for (let n = 0; n < nbTotal; n++) {
      d.push(
        plot(n % 7, -Math.floor(n / 7), {
          rayon: 0.2,
          couleur: 'black',
          couleurDeRemplissage: c[n] ? 'black' : 'white',
        }),
      )
    }
    const f = new FractionEtendue(nbNoires, nbTotal)

    this.question = `Calculer la fréquence de boules noires parmi ces boules :<br>
${mathalea2d(Object.assign({}, fixeBordures(d)), d)}`
    this.correction = `La fréquence est donnée par le quotient : $\\dfrac{\\text{Nombre de boules noires}}{\\text{Nombre total de boules}}=${miseEnEvidence(f.texFraction)}${f.texSimplificationAvecEtapes()}$.`
    this.reponse = f
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 7)
    else this.enonce()
  }
}
