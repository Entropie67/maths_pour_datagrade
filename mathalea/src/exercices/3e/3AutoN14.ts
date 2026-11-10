import ce from '../../lib/interactif/comparisonFunctions'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Résoudre une équation du type $ax+b=c$'
export const amcReady = 'true'
export const amcType = 'qcmMono'
export const interactifReady = true

export const dateDePublication = '25/12/2025'

export const uuid = '4af88'

export const refs = {
  'fr-fr': ['3AutoN14'],
  'fr-ch': ['10LCFA5C-9', '10LSFA5C-9', '11CTFA4C-9', '11LCFA4C-9', '11LSFA4C-9', 'PRQAL05B-3'],
}
/**
 * @author Jean-claude Lhote
 */
export default class ResoudreEquationAxPlusBegaleC extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    typeEquation: number,
  ): void {
    let bonneReponse: string
    let distracteurs: string[]
    let equation: string
    let texteCorrection: string
    switch (typeEquation) {
      case 1:
        bonneReponse = `\\dfrac{${c}${ecritureAlgebrique(-b)}}{${a}}`
        texteCorrection = `on commence par ${b < 0 ? `ajouter $${-b}$` : `soustraire $${b}$`} aux deux membres de l'équation, ce qui donne $${a}x=${c}${ecritureAlgebrique(-b)}$.<br> Ensuite, on divise les deux membres par $${a}$ pour obtenir $x=${bonneReponse}$.`
        equation = `${a}x${ecritureAlgebrique(b)}=${c}`
        distracteurs = shuffle(
          [
            `\\dfrac{${c}}{${a}}${ecritureAlgebrique(-b)}`,
            `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(-b)}`,
            `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(-b)}`,
            `\\dfrac{${c}${ecritureAlgebrique(b)}}{${a}}`,
            `\\dfrac{${c}}{${a}}${ecritureAlgebrique(b)}`,
            `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(b)}`,
            `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(b)}`,
          ].filter(
            (prop) =>
              !ce
                .parse(prop)
                .evaluate()
                .isEqual(ce.parse(bonneReponse).evaluate()),
          ),
        ).slice(0, 3)
        break
      case 2:
        bonneReponse = `\\dfrac{${c}}{${a}}${ecritureAlgebrique(-b)}`
        equation = `${a}(x${ecritureAlgebrique(b)})=${c}`
        texteCorrection = `on commence par diviser les deux membres par $${a}$, ce qui donne $x${ecritureAlgebrique(b)}=\\dfrac{${c}}{${a}}$.<br> Ensuite, on ${b < 0 ? `ajoute $${-b}$` : `soustrait $${b}$`} aux deux membres pour obtenir $x=${bonneReponse}$.`
        distracteurs = shuffle(
          [
            `\\dfrac{${c}${ecritureAlgebrique(-b)}}{${a}}`,
            `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(-b)}`,
            `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(-b)}`,
            `\\dfrac{${c}${ecritureAlgebrique(b)}}{${a}}`,
            `\\dfrac{${c}}{${a}}${ecritureAlgebrique(b)}`,
            `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(b)}`,
            `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(b)}`,
          ].filter(
            (prop) =>
              !ce
                .parse(prop)
                .evaluate()
                .isEqual(ce.parse(bonneReponse).evaluate()),
          ),
        ).slice(0, 3)
        break
      case 3:
        bonneReponse = `${c}${ecritureAlgebrique(-a)}${ecritureAlgebrique(-b)}`
        equation = `x${ecritureAlgebrique(b)}${ecritureAlgebrique(a)}=${c}`
        texteCorrection = `on commence par ${a < 0 ? `ajouter $${-a}$` : `soustraire $${a}$`} aux deux membres de l'équation, ce qui donne $x${ecritureAlgebrique(b)}=${c}${ecritureAlgebrique(-a)}$.<br> Ensuite, on ${b < 0 ? `ajoute $${-b}$` : `soustrait $${b}$`} aux deux membres pour obtenir $x=${bonneReponse}$.`
        distracteurs = shuffle(
          [
            `\\dfrac{${c}}{${a}}${ecritureAlgebrique(-b)}`,
            `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(-b)}`,
            `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(-b)}`,
            `\\dfrac{${c}${ecritureAlgebrique(b)}}{${a}}`,
            `\\dfrac{${c}}{${a}}${ecritureAlgebrique(b)}`,
            `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(b)}`,
            `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(b)}`,
          ].filter(
            (prop) =>
              !ce
                .parse(prop)
                .evaluate()
                .isEqual(ce.parse(bonneReponse).evaluate()),
          ),
        ).slice(0, 3)
        break
      case 4:
        bonneReponse = `${c}${ecritureAlgebrique(-b)}${ecritureAlgebrique(-a)}`
        equation = `${a}+x${ecritureAlgebrique(b)}=${c}`
        texteCorrection = `on commence par ${b < 0 ? `ajouter $${-b}$` : `soustraire $${b}$`} aux deux membres de l'équation, ce qui donne $${a}+x=${c}${ecritureAlgebrique(-b)}$.<br> Ensuite, on ${a < 0 ? `ajoute $${-a}$` : `soustrait $${a}$`} aux deux membres pour obtenir $x=${bonneReponse}$.`
        distracteurs = shuffle(
          [
            `\\dfrac{${c}}{${a}}${ecritureAlgebrique(-b)}`,
            `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(-b)}`,
            `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(-b)}`,
            `\\dfrac{${c}${ecritureAlgebrique(b)}}{${a}}`,
            `\\dfrac{${c}}{${a}}${ecritureAlgebrique(b)}`,
            `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(b)}`,
            `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(b)}`,
          ].filter(
            (prop) =>
              !ce
                .parse(prop)
                .evaluate()
                .isEqual(ce.parse(bonneReponse).evaluate()),
          ),
        ).slice(0, 3)
        break
      default:
        bonneReponse = `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(-b)}`
        equation = `\\dfrac{x${ecritureAlgebrique(b)}}{${a}}=${c}`
        texteCorrection = `on commence par multiplier les deux membres par $${a}$, ce qui donne $x${ecritureAlgebrique(b)}=${c}\\times ${ecritureParentheseSiNegatif(a)}$.<br> Ensuite, on soustrait $${b}$ des deux membres pour obtenir $x=${bonneReponse}$.`
        distracteurs = shuffle(
          [
            `\\dfrac{${c}}{${a}}${ecritureAlgebrique(-b)}`,
            `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(-b)}`,
            `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(-b)}`,
            `\\dfrac{${c}${ecritureAlgebrique(b)}}{${a}}`,
            `\\dfrac{${c}}{${a}}${ecritureAlgebrique(b)}`,
            `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(b)}`,
            `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(b)}`,
          ].filter(
            (prop) =>
              !ce
                .parse(prop)
                .evaluate()
                .isEqual(ce.parse(bonneReponse).evaluate()),
          ),
        ).slice(0, 3)
        break
    }

    this.reponses = [bonneReponse, ...distracteurs].map((el) => `$${el}$`)
    this.enonce = `Pour résoudre l'équation $${equation}$, on effectue le calcul :`

    this.correction = `Pour résoudre l'équation $${equation}$, ${texteCorrection}`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, -3, 20, 1)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const a = randint(2, 9)
      const b = randint(-9, 9, [0, a, -a])
      const c = randint(10, 30)
      this.appliquerLesValeurs(a, b, c, randint(1, 5))
    } while (nombreElementsDifferents(this.reponses) < 4 && compteur++ < 50)
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
