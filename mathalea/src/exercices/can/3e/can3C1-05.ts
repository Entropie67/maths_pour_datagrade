import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { orangeMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import { pgcd } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../../modules/fractions'
export const titre = 'Calculer une valeur dans une égalité de quotients'
export const interactifReady = true

export const dateDePublication = '17/10/2024'
export const uuid = '49a2b'
export const refs = {
  'fr-fr': ['can3C1-05'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class calculDansQuotient extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const inconnue = this.quotaChoice('inconnue', [
      'AB',
      'AC',
      'BC',
      'EF',
      'HT',
      'CD',
      'RT',
      'GR',
      'JK',
    ])
    const f = this.quotaChoice('f', obtenirListeFractionsIrreductibles())
    const fraction = new FractionEtendue(f.n, f.d)
    const a = randint(2, 10, f.d)
    const choix1 = this.quotaChoice('choix1', [true, false])
    const choix2 = choice([true, false])
    let reponse

    if (choix1 === true) {
      reponse = new FractionEtendue(a * f.d, f.n).texFraction
      this.reponse = { reponse: { value: reponse } }
      this.question = `Calculer $${inconnue}$ sachant que ${choix2 === true ? `$\\dfrac{${a}}{${inconnue}}=${fraction.texFraction}$.` : `$${fraction.texFraction}=\\dfrac{${a}}{${inconnue}}$.`}`
      this.correction = `Les produits en croix sont égaux :<br>
    $\\begin{aligned}
    ${inconnue}\\times${f.n}&=${a}\\times ${f.d}\\\\
    ${inconnue}&=${pgcd(a * f.d, f.n) === 1 ? `${miseEnEvidence(reponse)}` : `${reponse}`}
    \\end{aligned}$<br>
    ${pgcd(a * f.d, f.n) === 1 ? '' : `On peut simplifier : $${inconnue}=${reponse}${new FractionEtendue(a * f.d, f.n).texSimplificationAvecEtapes(false, orangeMathalea)}$`}`
    } else {
      reponse = new FractionEtendue(a * f.n, f.d).texFraction
      this.reponse = { reponse: { value: reponse } }
      this.question = `Calculer $${inconnue}$ sachant que ${choix2 === true ? `$\\dfrac{${inconnue}}{${a}}=${fraction.texFraction}$.` : `$${fraction.texFraction}=\\dfrac{${inconnue}}{${a}}$.`}`
      this.correction =
        this.correction = `Les produits en croix sont égaux :<br>
    $\\begin{aligned}
    ${inconnue}\\times${f.d}&=${a}\\times ${f.n}\\\\
    ${inconnue}&=${pgcd(a * f.n, f.d) === 1 ? `${miseEnEvidence(reponse)}` : `${reponse}`}
    \\end{aligned}$<br>
    ${pgcd(a * f.n, f.d) === 1 ? '' : `On peut simplifier : $${inconnue}=${reponse}${new FractionEtendue(a * f.n, f.d).texSimplificationAvecEtapes(false, orangeMathalea)}$`}`
    }
    if (this.interactif) {
      this.question += `<br> $${inconnue}=$`
    }

    this.correction += `
         `

    this.canReponseACompleter = `$${inconnue}=\\ldots$`
  }
}
