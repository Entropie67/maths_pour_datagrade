import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '20/04/2026'
export const uuid = '50f20'
// @Author Gilles Mora
export const refs = {
  'fr-fr': ['1A-C09-10', '2A-C2-5'],
  'fr-ch': ['1mQCM-15', '11LSFA3I-8'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Factoriser ou développer une expression du type $A^2-B^2$'
export default class Puissances extends ExerciceQcmA {
  appliquerLesValeurs = (
    a: number,
    b: number,
    c: number,
    d: number,
    cas: number,
  ) => {
    // (ax+b)^2 - (cx+d)^2 = ((a-c)x+(b-d))*((a+c)x+(b+d))
    const A = a * a - c * c
    const B = 2 * (a * b - c * d)
    const C = b * b - d * d

    const fact1a = a - c
    const fact1b = b - d
    const fact2a = a + c
    const fact2b = b + d

    const polyBon = new Polynome({ rand: false, coeffs: [C, B, A] }).toLatex()
    const polyFaux1 = new Polynome({
      rand: false,
      coeffs: [C, -B, A],
    }).toLatex()
    const polyFaux2 = new Polynome({
      rand: false,
      coeffs: [-C, B, A],
    }).toLatex()

    const factBonne = `\\left(${reduireAxPlusB(fact1a, fact1b)}\\right)\\left(${reduireAxPlusB(fact2a, fact2b)}\\right)`
    // Erreur : (ax+b) - (cx+d) mal distribué en (ax+b-cx+d), soit ((a-c)x+(b+d))
    const factFaux1 = `\\left(${reduireAxPlusB(fact1a, b + d)}\\right)\\left(${reduireAxPlusB(fact2a, fact2b)}\\right)`
    // Variante : les deux signes de d inversés
    const factFaux2 = `\\left(${reduireAxPlusB(fact1a, b + d)}\\right)\\left(${reduireAxPlusB(fact2a, b - d)}\\right)`

  
    this.enonce = `À quelle expression est égale $\\left(${reduireAxPlusB(a, b)}\\right)^2-\\left(${reduireAxPlusB(c, d)}\\right)^2$ ?`

    const ligneFact =
      cas === 1 ? `&=${miseEnEvidence(factBonne)}\\\\` : `&=${factBonne}\\\\`
    const ligneDev =
      cas === 2 ? `&=${miseEnEvidence(polyBon)}.` : `&=${polyBon}`

    this.correction = `On reconnaît une différence de deux carrés $A^2-B^2$ avec $A=${reduireAxPlusB(a, b)}$ et $B=${reduireAxPlusB(c, d)}$, qui se factorise en $(A-B)(A+B)$ .<br>
    $\\begin{aligned}
    \\left(${reduireAxPlusB(a, b)}\\right)^2-\\left(${reduireAxPlusB(c, d)}\\right)^2&=\\left[\\left(${reduireAxPlusB(a, b)}\\right)-\\left(${reduireAxPlusB(c, d)}\\right)\\right]\\left[\\left(${reduireAxPlusB(a, b)}\\right)+\\left(${reduireAxPlusB(c, d)}\\right)\\right]\\\\
    ${ligneFact}
    ${ligneDev}
    \\end{aligned}$`

    if (cas === 1) {
      this.reponses = [
        `$${factBonne}$`,
        `$${factFaux1}$`,
        `$${polyFaux1}$`,
        `$${polyFaux2}$`,
      ]
    } else {
      this.reponses = [
        `$${polyBon}$`,
        `$${polyFaux1}$`,
        `$${factFaux1}$`,
        `$${factFaux2}$`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 1, 1, -3, 1)
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      let a, b, c, d
      do {
        a = randint(-2, 7, 0)
        c = randint(-2, 5, [0, a, -a])
        b = randint(-9, 9, 0)
        d = randint(-10, 10, [0, b, -b])
      } while (
        a * a - c * c === 0 ||
        2 * (a * b - c * d) === 0 ||
        b * b - d * d === 0
      )
      const cas = choice([1, 2])
      this.appliquerLesValeurs(a, b, c, d, cas)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
