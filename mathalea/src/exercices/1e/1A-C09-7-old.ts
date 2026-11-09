// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid ba2e1 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '02/09/2025'
export const uuid = 'ba2e1'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer une expression algébrique'
export default class PuissancesOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce = 'Soit $x$ un réel.<br>'
    this.enonce += `À quelle expression est égale $3(x+2)^2-8$ ?`
    this.correction = `On cherche parmi les  propositions, lesquelles peuvent donner, après développement, l'expression de l'énoncé. <br>
     $\\begin{aligned}
       (2x+1)(x-3)&=2x^2-6x+x-3\\\\
        &=2x^2-5x-3.
     \\end{aligned}$`

    this.reponses = [
      '$3x^2+12x+4$',
      '$3x^2+12x-4$ ',
      '$3x^2+6x+4$ ',
      '$3x^2+6x-2$ ',
    ]
  }

  versionAleatoire = () => {
    const a = randint(-4, 4, 0)
    const alpha = randint(-5, 5, [-1, 0, 1])
    const beta = randint(-4, 4, [0, 1])

    this.enonce = 'Soit $x$ un réel.<br>'

    this.enonce += `À quelle expression est égale $${rienSi1(a)}(x${ecritureAlgebrique(-alpha)})^2${ecritureAlgebrique(beta)}$ ?`
    this.correction = `On développe $${rienSi1(a)}(x${ecritureAlgebrique(-alpha)})^2${ecritureAlgebrique(beta)}$. <br>
              $\\begin{aligned}
    ${rienSi1(a)}(x${ecritureAlgebrique(-alpha)})^2${ecritureAlgebrique(beta)}&=${ecritureAlgebriqueSauf1(a)}\\left(x^2 ${ecritureAlgebrique(2 * -alpha)}x${ecritureAlgebrique(-alpha * -alpha)}\\right)${ecritureAlgebrique(beta)}\\\\
    &=${rienSi1(a)}x^2 ${ecritureAlgebrique(-2 * a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha)} ${ecritureAlgebrique(beta)}\\\\
        &=${miseEnEvidence(`${rienSi1(a)}x^2 ${ecritureAlgebrique(-2 * a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha + beta)}`)}\\\\
          \\end{aligned}$`
    const constante = a * -alpha * -alpha + beta
    let constante2 = 2 * alpha + beta
    if (constante2 === 0) {
      constante2 = alpha * alpha - beta
    }
    if (constante === 0) {
      this.reponses = [
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(-2 * a * alpha)}x$`,
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(2 * a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha + beta)}$`,
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(-2 * a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha - beta)}$`,
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(-a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha + beta)}$`,
      ]
    } else {
      this.reponses = [
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(-2 * a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha + beta)}$`,
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(2 * a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha + beta)}$`,
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(-2 * a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha - beta)}$`,
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(-a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha + beta)}$`,
      ]
    }
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
