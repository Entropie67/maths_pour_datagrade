import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Trouver l'extremum à partir d'une forme canonique"
export const interactifReady = true

export const uuid = '71604'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['1mF3-16'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q29 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteApres: '.' }
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 2 : randint(1, 2)
    const b = this.canOfficielle ? -7 : randint(-9, 9)
    const c = this.canOfficielle ? 5 : randint(-10, 10)
    this.reponse = new FractionEtendue(-b, 2 * a).texFraction
    this.question = `$f(x)=${reduirePolynomeDegre3(0, a, b, c)}$ <br>
           La représentation graphique $\\mathscr{C}_f$ de la fonction $f$ a pour axe de symétrie la droite d'équation $x=$${this.interactif ? '' : '$\\ldots$'}       `

    this.correction = `$f$ est une fonction polynôme du second degré écrite sous forme développée $ax^2+bx+c$.<br>
       Le sommet de la parabole a pour abscisse $-\\dfrac{b}{2a}$.<br>
           L'axe de symétrie a donc pour équation $x=-\\dfrac{b}{2a}$. <br>
       On obtient alors  $x=-\\dfrac{${b}}{2\\times ${ecritureParentheseSiNegatif(a)}}$, soit $x=\\dfrac{${-b}}{${2 * a}}$ ou encore  $x=${miseEnEvidence(`${texNombre(-b / (2 * a), 2)}`)}$.`
    this.canEnonce = `$f(x)=${reduirePolynomeDegre3(0, a, b, c)}$ <br>
           La représentation graphique $\\mathscr{C}_f$ de la fonction $f$ a pour axe de symétrie la droite d'équation :`
    this.canReponseACompleter = '$x=\\ldots$'
  }
}
