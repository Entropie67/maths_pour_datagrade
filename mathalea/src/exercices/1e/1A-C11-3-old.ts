// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 1aa6a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '14/10/2025'
export const uuid = '1aa6a'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Exprimer une variable en fonction des autres (avec des quotients)'
/**
 * @author Gilles Mora
 */
export default class Auto1AC11cOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    signe: '+' | '-' = '+',
  ): void {
    const operateur = signe === '+' ? '+' : '-'

    this.enonce = `On considère des réels $x$, $y$ et $u$ non nuls tels que $\\dfrac{${a}}{x}${operateur}\\dfrac{${b}}{y}= \\dfrac{${c}}{u}$.<br>
      On peut affirmer que :`

    if (signe === '+') {
      this.correction = `On isole $u$ dans le premier membre : <br>
          $\\begin{aligned} \\dfrac{${a}}{x}+\\dfrac{${b}}{y}&= \\dfrac{${c}}{u} \\\\ 
         \\dfrac{${rienSi1(a)}y${ecritureAlgebriqueSauf1(b)}x}{xy}&= \\dfrac{${c}}{u} \\\\ 
          ${c === 1 ? `u` : `\\dfrac{u}{${c}}`} &=   \\dfrac{xy}{${rienSi1(a)}y${ecritureAlgebriqueSauf1(b)}x} \\\\
          u&= ${miseEnEvidence(`\\dfrac{${rienSi1(c)}xy}{${rienSi1(b)}x${ecritureAlgebriqueSauf1(a)}y}`)} 
          \\end{aligned}$`

      this.reponses = [
        `$u=\\dfrac{${rienSi1(c)}xy}{${rienSi1(b)}x${ecritureAlgebriqueSauf1(a)}y}$`,
        `$u=${rienSi1(a * b)}xy$`,
        `$u=${rienSi1(b)}x${ecritureAlgebriqueSauf1(a)}y$`,
        `$u=\\dfrac{${rienSi1(b)}x${ecritureAlgebriqueSauf1(a)}y}{${rienSi1(c)}xy}$`,
      ]
    } else {
      this.correction = `On isole $u$ dans le premier membre : <br>
          $\\begin{aligned} \\dfrac{${a}}{x}-\\dfrac{${rienSi1(b)}}{y}&= \\dfrac{${c}}{u} \\\\ 
          \\dfrac{${rienSi1(a)}y-${rienSi1(b)}x}{xy}&= \\dfrac{${c}}{u} \\\\ 
           ${c === 1 ? `u` : `\\dfrac{u}{${c}}`}&= \\dfrac{xy}{${rienSi1(a)}y-${rienSi1(b)}x} \\\\
          u&= ${miseEnEvidence(`\\dfrac{${rienSi1(c)}xy}{${rienSi1(a)}y-${rienSi1(b)}x}`)} 
          \\end{aligned}$`

      this.reponses = [
        `$u=\\dfrac{${rienSi1(c)}xy}{${rienSi1(a)}y-${rienSi1(b)}x}$`,
        `$u=\\dfrac{${rienSi1(c)}xy}{${rienSi1(b)}x-${rienSi1(a)}y}$`,
        `$u=${rienSi1(a - b)}xy$`,
        `$u=\\dfrac{${rienSi1(a)}y-${rienSi1(b)}x}{${rienSi1(c)}xy}$`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1, 1, 1, '+')
  }

  versionAleatoire: () => void = () => {
    const a = randint(1, 7)
    const b = a + 1
    const c = randint(1, 6)

    switch (randint(1, 4)) {
      case 1:
        this.appliquerLesValeurs(a, b, c, '+')
        break

      case 2:
        this.enonce = `On considère des réels $x$ et $u$ non nuls tels que $\\dfrac{${a}}{x}+\\dfrac{1}{${b}}= \\dfrac{${c}}{u}$.<br>
            On peut affirmer que :`

        this.correction = `On isole $u$ dans le premier membre : <br>
              $\\begin{aligned} \\dfrac{${a}}{x}+\\dfrac{1}{${b}}&= \\dfrac{${c}}{u} \\\\ 
              \\dfrac{${a * b}+x}{${rienSi1(b)}x}&= \\dfrac{${c}}{u} \\\\ 
              u&= \\dfrac{${c === 1 ? '' : `${c}\\times `}${b}x}{${a * b}+x}\\\\
              u&= ${miseEnEvidence(`\\dfrac{${c * b}x}{${a * b}+x}`)} 
              \\end{aligned}$`

        this.reponses = [
          `$u=\\dfrac{${rienSi1(c * b)}x}{${a * b}+x}$`,
          `$u=\\dfrac{${a * b}+x}{${rienSi1(c * b)}x}$`,
          `$u=\\dfrac{${rienSi1(c)}x}{${rienSi1(a * b)}x${ecritureAlgebrique(a)}}$`,
          `$u=\\dfrac{${rienSi1(c)}x}{${rienSi1(a * b)}x${ecritureAlgebrique(b)}}$`,
        ]
        break

      case 3:
        this.appliquerLesValeurs(a, b, c, '-')
        break

      case 4:
      default:
        this.enonce = `On considère des réels $x$, $y$ et $u$ non nuls tels que $\\dfrac{${rienSi1(a)}x}{y}+${b}= \\dfrac{${c}}{u}$.<br>
            On peut affirmer que :`

        this.correction = `On isole $u$ dans le premier membre : <br>
              $\\begin{aligned}
               \\dfrac{${rienSi1(a)}x}{y}+${b}&= \\dfrac{${c}}{u} \\\\ 
              \\dfrac{${rienSi1(a)}x+${rienSi1(b)}y}{y}&= \\dfrac{${c}}{u} \\\\ 
              u&=\\dfrac{${c === 1 ? `` : `${c}\\times `}y}{${rienSi1(a)}x+${b}y} \\\\
              u&= ${miseEnEvidence(`\\dfrac{${rienSi1(c)}y}{${rienSi1(a)}x+${rienSi1(b)}y}`)} 
              \\end{aligned}$`

        this.reponses = [
          `$u=\\dfrac{${rienSi1(c)}y}{${rienSi1(a)}x+${rienSi1(b)}y}$`,
          `$u=\\dfrac{${rienSi1(a)}x+${rienSi1(b)}y}{${rienSi1(c)}y}$`,
          `$u=${rienSi1(c)}y$`,
          `$u=\\dfrac{${c}}{${rienSi1(a)}x+${rienSi1(b)}y}$`,
        ]
        break
    }
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
