import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import {
  miseEnCouleur,
  miseEnEvidence,
} from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Factoriser avec une identité remarquable'
export const interactifReady = true

export const uuid = '5ad09'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class FactoriserA2MoinsB2 extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsDeComparaison = { factorisation: true }
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = '(x-5)(x+5)'
      this.question = ' Factoriser  $x^2-25$.'
      if (this.interactif) {
        this.question += '<br>$x^2-25=$'
      }
      this.correction = `On utilise l'égalité remarquable $${miseEnCouleur('a', 'red')}^2-${miseEnCouleur('b', bleuMathalea)}^2=(${miseEnCouleur('a', 'red')}-${miseEnCouleur('b', bleuMathalea)})(${miseEnCouleur('a', 'red')}+${miseEnCouleur('b', bleuMathalea)})$ avec $a=${miseEnCouleur('x', 'red')}$  et $b=${miseEnCouleur('5', bleuMathalea)}$.<br>
    $\\begin{aligned}x^2-25&=${miseEnCouleur('x', 'red')}^2-${miseEnCouleur('5', bleuMathalea)}^2\\\\
    &=${miseEnEvidence(`(${miseEnCouleur('x', 'red')}-${miseEnCouleur('5', bleuMathalea)})(${miseEnCouleur('x', 'red')}+${miseEnCouleur('5', bleuMathalea)})`)}\\end{aligned}$<br>
    Une expression factorisée de $x^2-25$ est $${miseEnEvidence('(x-5)(x+5)')}$.`
    } else {
      const choix = choice([true, false])
      const a = randint(1, 10)
      this.reponse = choix
        ? `(${reduireAxPlusB(1, -a)})(${reduireAxPlusB(1, a)})`
        : `(${reduireAxPlusB(1, a)})(${reduireAxPlusB(-1, a)})`
      this.question = ` Factoriser  ${choix ? `$x^2-${a * a}$` : `$${a * a}-x^2$`}.`
      if (this.interactif) {
        this.question += `<br>${choix ? `$x^2-${a * a}=$` : `<br>$${a * a}-x^2=$`}`
      }
      this.correction = `On utilise l'égalité remarquable $${miseEnCouleur('a', 'red')}^2-${miseEnCouleur('b', bleuMathalea)}^2=(${miseEnCouleur('a', 'red')}-${miseEnCouleur('b', bleuMathalea)})(${miseEnCouleur('a', 'red')}+${miseEnCouleur('b', bleuMathalea)})$ avec ${choix ? `$a=${miseEnCouleur('x', 'red')}$  et $b=${miseEnCouleur(`${a}`, bleuMathalea)}$` : `$a=${miseEnCouleur(`${a}`, 'red')}$ et $b=${miseEnCouleur('x', bleuMathalea)}$`}.<br>`
      if (choix === true) {
        this.correction += `$\\begin{aligned}
 x^2-${a * a}&=\\underbrace{${miseEnCouleur('x', 'red')}^2-${miseEnCouleur(`${a}`, bleuMathalea)}^2}_{a^2-b^2}\\\\
 &=\\underbrace{(${miseEnCouleur('x', 'red')}-${miseEnCouleur(`${a}`, bleuMathalea)})(${miseEnCouleur('x', 'red')}+${miseEnCouleur(`${a}`, bleuMathalea)})}_{(a-b)(a+b)}
 \\end{aligned}$ <br>
    Une expression factorisée de $x^2-${a * a}$ est $${miseEnEvidence(`(x-${a})(x+${a})`)}$.`
      } else {
        this.correction += `$\\begin{aligned}
  ${a * a}-x^2&=\\underbrace{${miseEnCouleur(`${a}`, 'red')}^2-${miseEnCouleur('x', bleuMathalea)}^2}_{a^2-b^2}\\\\
  &=\\underbrace{(${miseEnCouleur(`${a}`, 'red')}-${miseEnCouleur('x', bleuMathalea)})(${miseEnCouleur(`${a}`, 'red')}+${miseEnCouleur('x', bleuMathalea)})}_{(a-b)(a+b)}
  \\end{aligned}$ <br>
    Une expression factorisée de $${a * a}-x^2$ est $${miseEnEvidence(`(${a}-x)(${a}+x)`)}$.`
      }
    }
  }
}
