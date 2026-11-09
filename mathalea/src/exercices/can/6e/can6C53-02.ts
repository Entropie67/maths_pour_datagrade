import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer une somme ou une différence de fractions de même dénominateur'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '05/07/2025'
/**
 * @author Gilles Mora avec IA
 *

 */
export const uuid = '6dbf3'

export const refs = {
  'fr-fr': ['can6C53-02', '6N3K-flash2'],
  'fr-ch': ['NR'],
}
export default class SommeDiffFractionsMemeDen extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { fractionEgale: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    let frac1, frac2, resultat
    switch (this.quotaChoice('typeDeQuestions', [1, 2])) {
      case 1:
        frac1 = choice(obtenirListeFractionsIrreductibles())
        frac2 = new FractionEtendue(randint(1, 10, frac1.den), frac1.den)
        do {
          frac1 = choice(obtenirListeFractionsIrreductibles())
          frac2 = new FractionEtendue(randint(1, 10, frac1.den), frac1.den)
        } while (frac1.num + frac2.num === frac1.den)

        resultat = new FractionEtendue(frac1.num + frac2.num, frac1.den)
        this.question = `
    Calculer $${frac1.texFraction} + ${frac2.texFraction}$.`
        this.correction = `Les fractions ont le même dénominateur ($${frac1.d}$), on additionne les numérateurs en gardant le dénominateur commun.<br>
     $${frac1.texFraction} + ${frac2.texFraction}=${miseEnEvidence(resultat.texFraction)}${pgcd(frac1.num + frac2.num, frac1.den) !== 1 ? `=${miseEnEvidence(resultat.texFractionSimplifiee)}` : ''}$ `
        if (this.interactif) {
          this.question = `
    $${frac1.texFraction} + ${frac2.texFraction}=$`
        }
        break
      case 2:
        frac1 = choice(obtenirListeFractionsIrreductibles())
        frac2 = new FractionEtendue(randint(1, frac1.num), frac1.den)

        do {
          frac1 = choice(obtenirListeFractionsIrreductibles())
          frac2 = new FractionEtendue(randint(1, frac1.num), frac1.den)
        } while (
          frac1.num - frac2.num <= 0 ||
          frac1.num - frac2.num === frac1.den
        )

        resultat = new FractionEtendue(frac1.num - frac2.num, frac1.den)

        this.question = `
Calculer $${frac1.texFraction} - ${frac2.texFraction}$.`

        this.correction = `Les fractions ont le même dénominateur ($${frac1.den}$), on soustrait les numérateurs en gardant le dénominateur commun :<br>
$${frac1.texFraction} - ${frac2.texFraction} = ${miseEnEvidence(resultat.texFraction)}${pgcd(resultat.num, resultat.den) !== 1 ? ` = ${miseEnEvidence(resultat.texFractionSimplifiee)}` : ''}$`
        if (this.interactif) {
          this.question = `
    $${frac1.texFraction} - ${frac2.texFraction}=$`
        }
        break
    }
    this.reponse = resultat
  }
}
