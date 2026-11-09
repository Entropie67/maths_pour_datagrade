import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { abs } from '../../../lib/outils/nombres'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une fonction dérivée'
export const interactifReady = true

export const uuid = 'k7omv'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ25 extends ExerciceCan {
  enonce(a?: number): void {
    if (a == null) {
      const numerateur = randint(2, 9)
      const signe = choice([-1, 1])
      a = numerateur * signe
    }

    const signeStr = a < 0 ? '-' : ''
    const fTex = `${signeStr}\\dfrac{${abs(a)}}{x}`
    this.optionsDeComparaison = { calculFormel: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.reponse = a < 0 ? `\\dfrac{${abs(a)}}{x^2}` : `-\\dfrac{${a}}{x^2}`

    this.question = `Expression de la dérivée de la fonction $f$ définie sur $]0\\,;\\,+\\infty[$ par : $f(x)=${fTex}$<br>`

    this.correction = `On peut écrire $f(x) = ${fTex} = ${a} \\times \\dfrac{1}{x}$.<br>`
    this.correction += `On sait que la dérivée de la fonction $x \\longmapsto \\dfrac{1}{x}$ est la fonction $x \\longmapsto -\\dfrac{1}{x^2}$.<br>`
    this.correction += `On en déduit par produit avec une constante que $f'(x) = ${a} \\times \\left(-\\dfrac{1}{x^2}\\right) = ${miseEnEvidence(this.reponse)}$.`
    if (this.interactif) {
      this.question += "$f'(x)=$"
    } else {
      this.question += "$f'(x)=\\ldots$"
    }

    this.canEnonce = `Expression de la dérivée de la fonction $f$ définie sur $]0\\,;\\,+\\infty[$ par $f(x)=${fTex}$.`
    this.canReponseACompleter = "$f'(x)=\\ldots$"
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-3)
    else this.enonce()
  }
}
