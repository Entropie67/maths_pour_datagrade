import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec une puissance'
export const interactifReady = true

export const uuid = 'ee42f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class ProprietePuissances extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.question = '\\dfrac{2^5}{2^7}=2^{%{champ1}}'
      this.reponse = { champ1: { value: '-2' } }
      this.correction = `On utilise la formule $\\dfrac{a^n}{a^p}=a^{n - p}$
        avec $a=2$,  $n=5$ et $p=7$.<br>
        $\\dfrac{2^5}{2^7}=2^{5-7}=2^{${miseEnEvidence('-2')}}$`
      this.canEnonce = '$\\dfrac{2^5}{2^7}$'
      this.canReponseACompleter = ' $2^{\\ldots}$'
    } else {
      let a, p, s, n
      switch (
        choice(['a', 'b']) //, 'b', 'c', 'd', 'e', 'f'
      ) {
        case 'a':
          a = randint(2, 3)
          n = randint(2, 5)
          p = randint(-9, 9, [-n, 0, 1])
          s = n + p
          this.reponse = { champ1: { value: s.toString() } }
          this.question = `${a}^{${n}}\\times ${a}^{${p}}=${a}^{%{champ1}}`
          this.correction = `On utilise la formule $a^n\\times a^m=a^{n+m}$ avec $a=${a}$, $n=${n}$ et $p=${p}$.<br>
            $${a}^{${n}}\\times ${a}^{${p}}=${a}^{${n}+${ecritureParentheseSiNegatif(p)}}=${a}^{${miseEnEvidence(s)}}$`
          this.canEnonce = `$${a}^{${n}}\\times ${a}^{${p}}$`
          this.canReponseACompleter = `$${a}^{\\ldots}$`
          break

        case 'b':
        default:
          a = randint(2, 3)
          p = randint(2, 9)
          n = randint(2, 4, p)
          s = n - p
          this.reponse = { champ1: { value: s.toString() } }
          this.question = `\\dfrac{${a}^{${n}}}{${a}^{${p}}}=${a}^{%{champ1}}`
          this.correction = `On utilise la formule $\\dfrac{a^n}{a^p}=a^{n - p}$
        avec $a=${a}$,  $n=${n}$ et $p=${p}$.<br>
        $\\dfrac{${a}^{${n}}}{${a}^{${p}}}=${a}^{${n}-${p}}=${a}^{${miseEnEvidence(s)}}$`
          this.canEnonce = `$\\dfrac{${a}^{${n}}}{${a}^{${p}}}$`
          this.canReponseACompleter = `$${a}^{\\ldots}$`
          break
      }
    }
  }
}
