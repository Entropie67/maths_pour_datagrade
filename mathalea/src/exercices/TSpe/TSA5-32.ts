import { reduirePolynomeDegre3 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '26af7'
export const refs = {
  'fr-fr': ['TSA5-32', 'TCA4-32'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Dériver une fonction logarithme (QCM Bac)'
export const dateDePublication = '09/03/2025'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 */
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class Polynesie2022DeriveeLogarithme extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    const polynome = reduirePolynomeDegre3(0, a, b, c)
    const deriveePolynome = reduirePolynomeDegre3(0, 0, 2 * a, b)
    const polynomePositif =
      b === 0
        ? `$${polynome}\\geqslant ${c}>0$`
        : `$${polynome}$ est strictement positif comme somme de termes positifs.`

    this.reponses = [
      `$g'(x) = \\dfrac{${deriveePolynome}}{${polynome}}$`,
      `$g'(x) = \\dfrac{1}{${deriveePolynome}}$`,
      `$g'(x) = \\dfrac{1}{${polynome}}$`,
      `$g'(x) = \\ln \\left(${deriveePolynome}\\right)$`,
    ]

    this.enonce =
      'On considère la fonction $g$ définie sur $[0~;~+ \\infty[$ par '
    this.enonce += `$g(x) = \\ln \\left(${polynome}\\right).$<br>`
    this.enonce +=
      "Pour tout nombre réel $x$ strictement positif, laquelle des expressions suivantes est égale à $g'(x)$ ?"

    this.correction =
      'La fonction $g$ est dérivable comme composée de fonctions dérivables.<br>'
    this.correction += `On pose $u(x) = ${polynome}$. Sur $[0~;~+\\infty[$, ${polynomePositif}.<br>`
    this.correction += `Sa dérivée est $u'(x) = ${deriveePolynome}$.<br>`
    this.correction +=
      "La dérivée de $\\ln(u(x))$ est donnée par $\\dfrac{u'(x)}{u(x)}$.<br>"
    this.correction += 'Ainsi, on a :<br>'
    this.correction += `$g'(x) = \\dfrac{${deriveePolynome}}{${polynome}}.$<br>`
    this.correction += `La dérivée de la fonction $g$ est donc égale à $${miseEnEvidence(`\\dfrac{${deriveePolynome}}{${polynome}}`)}$.`
  }

  versionOriginale: () => void = () => {
    this.reponses = [
      "$g'(x) = \\dfrac{2x + 1}{x^2 + x + 1}$", // Réponse correcte (d)
      "$g'(x) = \\dfrac{1}{2x + 1}$", // Mauvaise réponse (a)
      "$g'(x) = \\dfrac{1}{x^2 + x + 1}$", // Mauvaise réponse (b)
      "$g'(x) = \\ln (2x + 1)$", // Mauvaise réponse (c)
    ]

    this.enonce =
      'On considère la fonction $g$ définie et dérivable sur $]0~;~+ \\infty[$ par '
    this.enonce += '$g(x) = \\ln \\left(x^2 + x + 1\\right).$<br>'
    this.enonce +=
      "Pour tout nombre réel $x$ strictement positif, laquelle des expressions suivantes est égale à $g'(x)$ ?"

    this.correction =
      'La fonction $g$ est dérivable comme composée de fonctions dérivables.<br>'
    this.correction +=
      'On pose $u(x) = x^2 + x + 1$. Cette fonction est positive sur $]0~;~+\\infty[$ comme somme de fonctions positives.<br>'
    this.correction += "Sa dérivée est $u'(x) = 2x + 1$.<br>"
    this.correction +=
      "La dérivée de $\\ln(u(x))$ est donnée par $\\dfrac{u'(x)}{u(x)}$.<br>"
    this.correction += 'Ainsi, on a :<br>'
    this.correction += "$g'(x) = \\dfrac{2x + 1}{x^2 + x + 1}.$<br>"
    this.correction += `La dérivée de la fonction $g$ est donc égale à $${miseEnEvidence(`\\dfrac{2x + 1}{x^2 + x + 1}`)}$.`
  }

  versionAleatoire: () => void = () => {
    const nombreReponses = 4
    do {
      const a = randint(1, 5)
      const b = randint(0, 7)
      const c = randint(1, 8)
      this.appliquerLesValeurs(a, b, c)
    } while (nombreElementsDifferents(this.reponses) < nombreReponses)
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
