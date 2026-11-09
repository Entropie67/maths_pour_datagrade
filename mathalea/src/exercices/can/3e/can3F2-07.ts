import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Calculer un produit, une somme ou une différence d'images par une fonction affine"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '26/07/2025'
/**
 * @author Gilles Mora
  *

*/
export const dateDeModifImportante = '30/10/2026'
export const uuid = '2bbd1'

export const refs = {
  'fr-fr': ['can3F2-07', '2F13-flash5'],
  'fr-ch': ['NR'],
}
export default class CalculProduitSommeImageParFonctionAffine extends ExerciceSimple {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const typeOperation = this.quotaChoice('typeOperation', [1, 2, 3]) // 1 = produit, 2 = somme 3=différence

    // Paramètres selon le type d'opération
    let a, b
    if (typeOperation === 1) {
      // Produit
      a = randint(-2, 2, [0])
      b = randint(-5, 5, 0)
    } else {
      // Somme
      a = randint(-6, 6, [0])
      b = randint(-6, 6, [0])
    }
    const x1 = this.quotaRandint('x1', -4, 4)
    const x2 = randint(-3, 3, x1)
    const nomF = choice(['f', 'g', 'h', 'u', 'v', 'w', 'p', 'm', 't', 'k'])

    // Calcul des images
    const fx1 = a * x1 + b
    const fx2 = a * x2 + b

    // Base de la question
    this.question = `Soit $${nomF}$ la fonction définie par : $${nomF}(x)=${rienSi1(a)}x${ecritureAlgebrique(b)}$.<br>`
    let signe = ''
    switch (typeOperation) {
      case 1: // Produit
        signe = '\\times'
        // Construction de la correction
        this.correction = `On a : $${nomF}(${x1})=${a === 1 ? '' : `${a}\\times`} ${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(b)}=${fx1}$ et $${nomF}(${x2})=${a === 1 ? '' : `${a}\\times`} ${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(b)}=${fx2}$.<br>
    On en déduit que $${nomF}(${x1})\\times ${nomF}(${x2})=${fx1}\\times ${ecritureParentheseSiNegatif(fx2)}=${miseEnEvidence(fx1 * fx2)}$.`

        this.reponse = this.versionQcm ? `$${fx1 * fx2}$` : fx1 * fx2
        this.distracteurs = [
          `$${fx1 + fx2}$`,
          `$${x1 + b + (x2 + b)}$`,
          `$${x1 * x2}$`,
          `$${a * (x1 * x2) + b}$`,
        ]
        this.canEnonce = `Soit $${nomF}$ la fonction définie par : $${nomF}(x)=${rienSi1(a)}x${ecritureAlgebrique(b)}$.`
        this.canReponseACompleter = `$${nomF}(${x1})\\times ${nomF}(${x2})=\\ldots$`

        break

      case 2: // Somme
        signe = '+'
        // Construction de la correction
        this.correction = `On a : $${nomF}(${x1})=${a === 1 ? '' : `${a}\\times`} ${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(b)}=${fx1}$ et $${nomF}(${x2})=${a === 1 ? '' : `${a}\\times`} ${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(b)}=${fx2}$.<br>
    On en déduit que $${nomF}(${x1})+${nomF}(${x2})=${fx1}${ecritureAlgebrique(fx2)}=${miseEnEvidence(fx1 + fx2)}$.`

        this.reponse = this.versionQcm ? `$${fx1 + fx2}$` : fx1 + fx2
        this.distracteurs = [
          `$${fx1 * fx2}$`,
          `$${(x1 + b) * (x2 + b)}$`,
          `$${x1 + x2}$`,
          `$${a * (x1 + x2) + b}$`,
        ]
        this.canEnonce = `Soit $${nomF}$ la fonction définie par : $${nomF}(x)=${rienSi1(a)}x${ecritureAlgebrique(b)}$.`
        this.canReponseACompleter = `$${nomF}(${x1})+${nomF}(${x2})=\\ldots$`
        break

      case 3: // difference
      default:
        signe = '-'
        // Construction de la correction
        this.correction = `On a : $${nomF}(${x1})=${a === 1 ? '' : `${a}\\times`} ${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(b)}=${fx1}$ et $${nomF}(${x2})=${a === 1 ? '' : `${a}\\times`} ${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(b)}=${fx2}$.<br>
    On en déduit que $${nomF}(${x1})-${nomF}(${x2})=${fx1}${ecritureAlgebrique(-fx2)}=${miseEnEvidence(fx1 - fx2)}$.`

        this.reponse = this.versionQcm ? `$${fx1 - fx2}$` : fx1 - fx2
        this.distracteurs = [
          `$${fx1 + fx2}$`,
          `$${(x1 - b) * (x2 - b)}$`,
          `$${x1 - x2}$`,
          `$${a * (x1 - x2) + b}$`,
        ]
        this.canEnonce = `Soit $${nomF}$ la fonction définie par : $${nomF}(x)=${rienSi1(a)}x${ecritureAlgebrique(b)}$.`
        this.canReponseACompleter = `$${nomF}(${x1})-${nomF}(${x2})=\\ldots$`
        break
    }
    if (this.versionQcm) {
      this.question += `$${nomF}(${x1})${signe} ${nomF}(${x2})$ est égal à :`
    } else if (!this.interactif && !this.versionQcm) {
      this.question += `Calculer $${nomF}(${x1})${signe} ${nomF}(${x2})$.`
    } else {
      this.question += `$${nomF}(${x1})${signe} ${nomF}(${x2})=$`
    }
    if (this.versionQcm) {
      // Secours : Oublier une image ou confondre produit et somme des carrés.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [
          fx1,
          fx2,
          -fx1,
          -fx2,
          fx1 - fx2,
          fx2 - fx1,
          fx1 + fx2 + b,
          fx1 + fx2 - b,
          fx1 ** 2 + fx2 ** 2,
          -(fx1 ** 2 + fx2 ** 2),
          a * (x1 + x2),
          b,
          -b,
        ].map((n) => `$${n}$`),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
