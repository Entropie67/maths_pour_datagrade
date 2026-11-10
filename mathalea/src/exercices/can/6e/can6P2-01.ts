import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Appliquer un pourcentage'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 * Complété par des corrections de Gilles Mora
 */
export const uuid = 'da0c1'

export const refs = {
  'fr-fr': ['can6P2-01', '6N3Q-flash1'],
  'fr-ch': ['NR'],
}
export default class AppliquerUnPourcentage extends ExerciceSimple {
  bis: boolean
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.bis = false
  }

  nouvelleVersion() {
    let a, p
    switch (
      this.bis
        ? this.quotaChoice('cas', [4, 5, 6])
        : this.quotaChoice('cas', [1, 2, 3])
    ) {
      case 1: // prendre 10%
        a = randint(2, 99)
        this.reponse = a / 10
        this.question = `Calculer $10${sp(1)}\\%$ de $${a}$.`
        this.correction = `$10${sp(1)}\\%$ de $${a} = 0,1 \\times ${a}=${miseEnEvidence(texNombre(this.reponse))}$`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
        Prendre $10${sp(1)}\\%$  d'une quantité revient à la diviser par $10$.<br>
        Ainsi, $10${sp(1)}\\%$ de $${a} = \\dfrac{${a}}{10}=${texNombre(this.reponse)}$.`,
          bleuMathalea,
        )
        break

      case 2: // prendre  20%, 30%, 40%......
        a = randint(1, 9) * 10
        p = randint(2, 9, 5) * 10
        this.reponse = (a * p) / 100
        this.question = `Calculer $${p}${sp(1)}\\%$ de $${a}$.`
        this.correction = `$${p}${sp(1)}\\%$ de $${a} = ${miseEnEvidence(texNombre(this.reponse))}$`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
        Prendre $${p}${sp(1)}\\%$  de $${a}$ revient à prendre $${p / 10}\\times 10${sp(1)}\\%$  de $${a}$.<br>
        Comme $10${sp(1)}\\%$  de $${a}$ vaut $${a / 10}$ (pour prendre $10${sp(1)}\\%$  d'une quantité, on la divise par $10$), alors
        $${p}${sp(1)}\\%$ de $${a}=${p / 10}\\times ${a / 10}=${this.reponse}$.
       `,
          bleuMathalea,
        )
        break
      case 3:
        p = randint(2, 9) * 10
        a = randint(2, 9, p) * 10
        this.reponse = (p * a) / 100
        this.question = `Calculer $${p}${sp(1)}\\%$ de $${a}$.`
        if (p === 50) {
          this.correction = `$50${sp(1)}\\%$  de $${a} = ${miseEnEvidence(this.reponse)}$.`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
            Prendre $50${sp(1)}\\%$  d'une quantité revient à la diviser par $2$.<br>
            Ainsi, $${p}${sp(1)}\\%$ de $${a} = ${a}\\div 2=${this.reponse}$.`,
            bleuMathalea,
          )
        } else {
          this.correction = `$${p}${sp(1)}\\%$ de $${a} = ${miseEnEvidence(this.reponse)}$`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          Prendre $${p}${sp(1)}\\%$  de $${a}$ revient à prendre $${p / 10}\\times 10${sp(1)}\\%$  de $${a}$.<br>
          Comme $10${sp(1)}\\%$  de $${a}$ vaut $${a / 10}$ (pour prendre $10${sp(1)}\\%$ d'une quantité, on la divise par $10$), alors
          $${p}${sp(1)}\\%$ de $${a}=${p / 10}\\times ${a / 10}=${this.reponse}$.
         `,
            bleuMathalea,
          )
        }
        break
      case 4: // prendre 1%
        a = randint(100, 999)
        this.reponse = a / 100
        this.question = `Calculer $1${sp(1)}\\%$ de $${a}$.`
        this.correction = `$1${sp(1)}\\%$ de $${a} = 0,01 \\times ${a}=${miseEnEvidence(texNombre(this.reponse))}$`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
        Prendre $1${sp(1)}\\%$  d'une quantité revient à la diviser par $100$.<br>
        Ainsi, $1${sp(1)}\\%$ de $${a} = \\dfrac{${a}}{100}=${texNombre(this.reponse)}$.`,
          bleuMathalea,
        )
        break

      case 5: // prendre  25%, 50%, 75%......
        a = randint(10, 50) * 20
        p = choice([25, 50, 75])
        this.reponse = (a * p) / 100
        this.question = `Calculer $${p}${sp(1)}\\%$ de $${a}$.`
        this.correction = `$${p}${sp(1)}\\%$ de $${a} = ${miseEnEvidence(texNombre(this.reponse))}$`
        if (p === 25) {
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
        Prendre $25${sp(1)}\\%$  de $${a}$ revient à diviser $${a}$ par $4$.<br>
        $${p}${sp(1)}\\%$ de $${a}=\\dfrac{${a}}{4}=${this.reponse}$.
       `,
            bleuMathalea,
          )
        } else if (p === 75) {
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          Prendre $75${sp(1)}\\%$  de $${a}$ revient à diviser $${a}$ par 4 et à multiplier le résultat par $3$.<br>
          Comme $25${sp(1)}\\%$  de $${a}$ vaut $${a / 4}$, alors
          $75${sp(1)}\\%$ de $${a}=${a / 4}\\times 3=${this.reponse}$.
         `,
            bleuMathalea,
          )
        } else {
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          Prendre $50${sp(1)}\\%$  d'une quantité revient à la diviser par $2$.<br>
          Ainsi, $50${sp(1)}\\%$ de $${a} = \\dfrac{${a}}{2}=${this.reponse}$.`,
            bleuMathalea,
          )
        }
        break
      case 6:
        a = randint(10, 50) * 20
        p = choice([5, 10, 20])
        this.reponse = (a * p) / 100
        this.question = `Calculer $${p}${sp(1)}\\%$ de $${a}$.`
        if (p === 5) {
          this.correction = `$5${sp(1)}\\%$  de $${a} = ${miseEnEvidence(this.reponse)}$.`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
            Prendre $5${sp(1)}\\%$  d'une quantité revient à la diviser par $20$ soit la diviser par $10$ puis par $2$.<br>
            Ainsi, $5${sp(1)}\\%$ de $${a} = ${a}\\div 10 \\div 2=${this.reponse * 2}\\div 2=${this.reponse}$.`,
            bleuMathalea,
          )
        } else if (p === 10) {
          this.correction = `$10${sp(1)}\\%$ de $${a} = ${miseEnEvidence(this.reponse)}$`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          Prendre $10${sp(1)}\\%$  de $${a}$ revient à diviser $${a}$ par $10$, alors
          $10${sp(1)}\\%$ de $${a}=\\dfrac{${a}}{10}=${this.reponse}$.
         `,
            bleuMathalea,
          )
        } else {
          this.correction = `$20${sp(1)}\\%$ de $${a} = ${miseEnEvidence(this.reponse)}$`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          Prendre $20${sp(1)}\\%$  de $${a}$ revient à diviser $${a}$ par $5$ soit diviser par $10$ puis multiplier le résultat par $2$.<br>
          Donc $20${sp(1)}\\%$ de $${a}=\\dfrac{${a}}{10}\\times 2=${this.reponse / 2}\\times 2=${this.reponse}$.
         `,
            bleuMathalea,
          )
        }
        break
    }
  }
}
