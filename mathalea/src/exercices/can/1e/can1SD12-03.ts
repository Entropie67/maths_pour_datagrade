import { orangeMathalea } from '../../../lib/colors'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Déterminer l’abscisse ou l’ordonnée du sommet d’une parabole'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '21/09/2022'

/**
 * @author Gilles Mora
 */

export const uuid = '2d459'

export const refs = {
  'fr-fr': ['can1SD12-03'],
  'fr-ch': ['1mF3-21'],
}
export default class EcondDegreAbscisseOrdonneeSommet extends ExerciceSimple {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une figure ou un tableau.

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const nomF = [['f'], ['g'], ['h'], ['u'], ['v']]
    let a, b, c, r, alpha, nom
    if (this.quotaChoice('cas', [true, false])) {
      a = randint(-3, 3, 0)
      b = randint(-9, 9)
      c = randint(-9, 9)
      nom = choice(nomF)
      r = new FractionEtendue(-b, 2 * a)
      this.question = `Soit $${nom}$ la fonction définie sur $\\mathbb{R}$ par :<br>

      $${nom}(x)=${reduirePolynomeDegre3(0, a, b, c)}$. <br>
      Quelle est l'abscisse du sommet de la parabole représentant $${nom}$ ?`

      this.correction = `$${nom}$ est une fonction polynôme du second degré écrite sous forme développée $ax^2+bx+c$.<br>
      Le sommet de la parabole a pour abscisse $-\\dfrac{b}{2a}$.<br>
          L'abscisse du sommet est donc : $-\\dfrac{${b}}{2\\times${ecritureParentheseSiNegatif(a)} }= ${r.estIrreductible && r.num * r.den > 0 ? miseEnEvidence(r.texFraction) : `${r.texFraction}${r.texSimplificationAvecEtapes(false, orangeMathalea)}`}$.`
      this.reponse = r
    } else {
      // this.formatInteractif = 'mathLive'
      a = randint(-3, 3, 0)
      b = randint(-2, 2) * 2 * a
      c = randint(-9, 9)
      alpha = -b / (2 * a)
      nom = choice(nomF)
      r = a * alpha ** 2 + b * alpha + c
      this.question = `Soit $${nom}$ la fonction définie sur $\\mathbb{R}$ par :<br>

          $${nom}(x)=${reduirePolynomeDegre3(0, a, b, c)}$. <br>

          Quelle est l'ordonnée du sommet de la parabole représentant $${nom}$ ?`

      this.correction = `$${nom}$ est une fonction polynôme du second degré écrite sous forme développée $ax^2+bx+c$.<br>
          Le sommet de la parabole a pour abscisse $-\\dfrac{b}{2a}=-\\dfrac{${b}}{2\\times${ecritureParentheseSiNegatif(a)} }= ${miseEnEvidence(alpha)}$.<br>
          L'ordonnée du sommet est donnée par l'image de l'abscisse, soit `

      if (a === 1) {
        if (b === 0) {
          if (c === 0) {
            this.correction += `$ ${ecritureParentheseSiNegatif(alpha)}^2=${miseEnEvidence(r)}$.`
          } else {
            this.correction += `$${ecritureParentheseSiNegatif(alpha)}^2${ecritureAlgebrique(c)}=${miseEnEvidence(r)}$.`
          }
        } else {
          this.correction += `$${ecritureParentheseSiNegatif(alpha)}^2${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(alpha)}${ecritureAlgebrique(c)}=${miseEnEvidence(r)}$.`
        }
      } else {
        if (b === 0) {
          if (c === 0) {
            this.correction += `$${a}\\times ${ecritureParentheseSiNegatif(alpha)}^2=${miseEnEvidence(r)}$.`
          } else {
            this.correction += `$${a}\\times ${ecritureParentheseSiNegatif(alpha)}^2${ecritureAlgebrique(c)}=${miseEnEvidence(r)}$.`
          }
        } else {
          this.correction += `$${a}\\times ${ecritureParentheseSiNegatif(alpha)}^2${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(alpha)}${ecritureAlgebrique(c)}=${miseEnEvidence(r)}$.`
        }
      }
      this.reponse = r
    }
  }
}
