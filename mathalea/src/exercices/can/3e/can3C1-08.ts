import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier des fractions avec une simplification évidente'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '05/01/2026'

/**
 * @author Gilles Mora

 */

export const uuid = '1894f'

export const refs = {
  'fr-fr': ['can3C1-08', '2N31-flash4'],
  'fr-ch': ['11LCNO2C-2'],
}
export default class MultiplierFractionAstuce extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.spacing = 1
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    // Choisir un facteur commun > 10 pour la simplification évidente
    const facteurCommun = this.quotaChoice(
      'facteurCommun',
      [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    )

    // Choisir un facteur de simplification supplémentaire
    const facteurSupp = this.quotaChoice('facteurSupp', [2, 3, 4, 5, 6])

    // Choisir des petits coefficients simples (2 à 9) pour avoir des dénominateurs faciles
    const listeCoef = [2, 3, 4, 5, 6, 7, 8, 9]

    const coef1Base = choice(
      listeCoef.filter((x) => facteurCommun % x !== 0 && x !== facteurSupp),
    )
    const coef2Base = choice(
      listeCoef.filter(
        (x) => x !== coef1Base && facteurCommun % x !== 0 && x !== facteurSupp,
      ),
    )

    // Construire les fractions avec le facteur supplémentaire
    // fraction1 = facteurCommun/(facteurSupp * coef1Base)
    // fraction2 = (facteurSupp * coef2Base)/facteurCommun
    const n1 = facteurCommun
    const d1 = facteurSupp * coef1Base
    const n2 = facteurSupp * coef2Base
    const d2 = facteurCommun

    const f1 = new FractionEtendue(n1, d1)
    const f2 = new FractionEtendue(n2, d2)

    this.reponse = f1.produitFraction(f2).simplifie()

    this.question = `Calculer  $${f1.texFraction}\\times ${f2.texFraction}$ sous la forme d'une fraction irréductible. `
    if (this.interactif) {
      this.question += `<br><br>$${f1.texFraction}\\times ${f2.texFraction}=$`
    }

    // Correction détaillée montrant les deux simplifications
    const resultatApresSimplif1 = new FractionEtendue(n2, d1)
    const resultatFinal = resultatApresSimplif1.simplifie()

    this.correction = `Il y a une simplification évidente par $${facteurCommun}$, puis on simplifie par $${facteurSupp}$ :<br>
    $\\begin{aligned}
    ${f1.texFraction}\\times ${f2.texFraction}&=\\dfrac{${n2}}{${d1}}\\\\
    &=\\dfrac{${facteurSupp} \\times ${coef2Base}}{${facteurSupp} \\times ${coef1Base}}\\\\
    &=${miseEnEvidence(resultatFinal.texFraction)}
    \\end{aligned}$`
  }
}
