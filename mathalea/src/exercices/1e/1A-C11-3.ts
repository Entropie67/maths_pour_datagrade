import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
export const dateDePublication = '14/10/2025'
export const dateDeModifImportante = '30/09/2026'

export const uuid = 'e6a55'

export const refs = {
  'fr-fr': ['1A-C11-3', '2A-C4-3'],
  'fr-ch': ['1mQCM-32', '11LCFA4D-6', '11LSFA4D-6'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  'Exprimer une variable en fonction des autres (avec des quotients)'
/**
 * @author Gilles Mora
 */
export default class Auto1AC11c extends ExerciceQcmACourt {
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
          ${this.resultat(`\\dfrac{${rienSi1(c)}xy}{${rienSi1(b)}x${ecritureAlgebriqueSauf1(a)}y}`)} 
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
          ${this.resultat(`\\dfrac{${rienSi1(c)}xy}{${rienSi1(a)}y-${rienSi1(b)}x}`)} 
          \\end{aligned}$`

      this.reponses = [
        `$u=\\dfrac{${rienSi1(c)}xy}{${rienSi1(a)}y-${rienSi1(b)}x}$`,
        `$u=\\dfrac{${rienSi1(c)}xy}{${rienSi1(b)}x-${rienSi1(a)}y}$`,
        `$u=${rienSi1(a - b)}xy$`,
        `$u=\\dfrac{${rienSi1(a)}y-${rienSi1(b)}x}{${rienSi1(c)}xy}$`,
      ]
    }
  }

  // Dernière ligne de la correction : toute l'égalité en évidence en QCM,
  // seulement l'expression saisie sinon (« u = » est écrit devant le champ)
  private resultat(expression: string) {
    return this.sup3
      ? `${miseEnEvidence('u~')}&${miseEnEvidence(`=${expression}`)}`
      : `u &= ${miseEnEvidence(expression)}`
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
              ${this.resultat(`\\dfrac{${c * b}x}{${a * b}+x}`)} 
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
              ${this.resultat(`\\dfrac{${rienSi1(c)}y}{${rienSi1(a)}x+${rienSi1(b)}y}`)} 
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
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    // En saisie courte : « u = » devant le champ et les lettres utiles sur le clavier
    this.optionsChampReponseCourte = {
      texteAvant: '$u=$',
      dataKeys: ['u', 'x', 'y'],
    }
    this.enonceCourt = () =>
      this.enonce.replace(
        'On peut affirmer que :',
        'Exprimer $u$ en fonction des autres variables.',
      )
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$u=/, '').replace(/\$$/, '')
    this.versionAleatoire()
  }
}
