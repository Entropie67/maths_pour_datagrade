// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 550cf continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre = 'Résoudre une équation $\\dfrac{ax+b}{c}=\\dfrac{d}{e}$'
export const interactifReady = true

export const dateDePublication = '10/09/2025'

/**
 *
 * @author Jean-Léon Henry
 */
export const uuid = '550cf'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ResoudreEquationAvecQuotientOld extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    // Paramètres
    const a = randint(-10, 10, 0)
    const b = randint(-10, 10, 0)
    const c = randint(-10, 10, [-1, 0, 1])
    let d = randint(-10, 10, 0)
    let e = randint(-10, 10, [-1, 0, 1, d])
    if (e * d >= 0) {
      e = abs(e)
      d = abs(d)
    }

    // Variables de calculs intermédiaires
    const membre2 = new FractionEtendue(d, e)
    const equation = (align = false) => {
      return `\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(b)}}{${c}}${align ? '&=' : '='}${membre2.texFraction}`
    }
    const resultatFinal = new FractionEtendue(c * d - b * e, e * a)

    switch (choice([1])) {
      case 1:
        if (!this.interactif) {
          this.question = ` Résoudre l'équation $${equation()}$.`
        } else {
          this.question = ` Donner la solution de l'équation $${equation()}$.`
        }
        this.correction = `Pour tous réels $a$, $b$, $c$, $d$ tels que $b$ et $d$ soient non nuls, $\\dfrac{a}{b}=\\dfrac{c}{d}$ si et seulement si $ad=bc$.`
        this.correction += `\\[
\\begin{aligned}
${equation(true)}\\\\
${e}( ${rienSi1(a)}x${ecritureAlgebrique(b)} )&=${c} \\times ${ecritureParentheseSiNegatif(d)}\\\\
${rienSi1(e * a)}x${ecritureAlgebrique(e * b)}&=${c * d}\\\\
${rienSi1(e * a)}x&=${c * d}${ecritureAlgebrique(-b * e)}\\\\
${rienSi1(e * a)}x&=${c * d - b * e}`
        if (e * a !== 1) {
          this.correction += `\\\\x&=${resultatFinal.texFSD}`
          if (!resultatFinal.estIrreductible && resultatFinal.num !== 0) {
            this.correction += `=${resultatFinal.texFractionSimplifiee}`
          }
        }
        this.correction += `
\\end{aligned}
\\]`

        this.correction += `L'équation a donc pour unique solution : $${miseEnEvidence(resultatFinal.texFractionSimplifiee)}$.`
        this.reponse = resultatFinal.simplifie()
        break
    }
  }
}
