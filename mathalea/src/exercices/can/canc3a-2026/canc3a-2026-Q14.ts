import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une somme avec une fraction décimale'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

export const uuid = '0f2d1'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CM2Q14 extends ExerciceCan {
  constructor() {
    super()
    this.enonce()
    this.optionsChampTexte = { texteAvant: '$~=~$' }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
      fractionEgale: true,
    }
  }

  enonce(a?: number, numerateur?: number, denominateur?: number) {
    if (a == null || numerateur == null || denominateur == null) {
      denominateur = choice([10, 100, 1000])
      numerateur = randint(1, 9)
      switch (denominateur) {
        case 10:
          // a a 1 décimale, on ajoute n/10 → résultat à 1 décimale
          a = randint(1, 9) + randint(1, 9) / 10
          break
        case 100:
          // a a 2 décimales, on ajoute n/100 → résultat à 2 décimales
          a = randint(1, 9) + randint(1, 9) / 10 + randint(1, 9) / 100
          break
        case 1000:
        default:
          // a a 3 décimales, on ajoute n/1000 → résultat à 3 décimales
          a =
            randint(1, 9) +
            randint(1, 9) / 10 +
            randint(1, 9) / 100 +
            randint(1, 9) / 1000
          break
      }
    }

    const nbDecimales = denominateur === 10 ? 1 : denominateur === 100 ? 2 : 3
    const resultat = a + numerateur / denominateur

    this.reponse = `\\dfrac{${arrondi(a * denominateur, 0) + numerateur}}{${denominateur}}`
    this.question = `$${texNombre(a, nbDecimales)}+\\dfrac{${numerateur}}{${texNombre(denominateur, 0)}}$`

    this.correction = `$${texNombre(a, nbDecimales)}+\\dfrac{${numerateur}}{${texNombre(denominateur, 0)}}=${texNombre(a, nbDecimales)}+${texNombre(numerateur / denominateur, nbDecimales)}=${miseEnEvidence(texNombre(resultat, nbDecimales))}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(4.352, 3, 1000)
    else this.enonce()
  }
}
