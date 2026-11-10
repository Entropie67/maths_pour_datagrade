import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { obtenirListeFractionsIrreductibles } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = 'd03c4'
export const refs = {
  'fr-fr': ['3F2QCM-1'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Fonction linéaire (Juin 2022 Amérique du nord)'
export const dateDePublication = '07/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class AmeriqueNordJuin22Ex1Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    this.reponses = [
      `$f(x)=\\dfrac{${b * c}}{${a.toString()}}x$`,
      `$f(x)=\\dfrac{${a.toString()}}{${String(b * c)}}x$`,
      `$f(x)=x+\\dfrac{${c.toString()}}{${b.toString()}}$`,
      `$f(x)=x-\\dfrac{${c.toString()}}{${b.toString()}}x$`,
    ]

    this.enonce = `La fonction linéaire $f$ telle que $f\\left(\\dfrac{${a.toString()}}{${b.toString()}}\\right)=${c.toString()}$ est :`
    this.correction = `Une fonction linéaire est de la forme $f(x)=ax$.<br>
    Donc,<br>$\\begin{aligned}
     a\\times \\dfrac{${a.toString()}}{${b.toString()}}&=${c.toString()}\\\\
     a&=${c.toString()}\\times \\dfrac{${b.toString()}}{${a.toString()}}\\\\
     a&=\\dfrac{${String(b * c)}}{${a.toString()}}
     \\end{aligned}$<br>
     D'où $${miseEnEvidence(`f(x)=\\dfrac{${String(b * c)}}{${a.toString()}}x`)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 5, 1)
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const frac = choice(
        obtenirListeFractionsIrreductibles().filter((el) => el.num !== 1),
      )
      const a = frac.num
      const b = frac.den
      const c = randint(1, 9, [a, b, 2, 4, 6, 8])
      this.appliquerLesValeurs(a, b, c)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
