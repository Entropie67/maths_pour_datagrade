import { reduireAxPlusB, rienSi1 } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcm from '../ExerciceQcm'
/*
 @author Stéphane Guyon
*/
export const uuid = 'fe22f'
export const refs = {
  'fr-fr': ['TSA7-12', 'TCA5-12'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer une primitive'
export const dateDePublication = '15/03/2025'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 */

export default class Binomiale extends ExerciceQcm {
  versionOriginale: () => void = () => {
    const a = randint(-5, 5, 0)
    const c = randint(-5, 5, [0, 1])

    // -1 s'écrit « - » devant le logarithme et la fraction
    const coef = c === -1 ? rienSi1(c) : `${c}\\times`
    let correction
    this.reponses = [
      `$F(x)=${coef} \\ln\\left(${reduireAxPlusB(1, a)}\\right)+C$, où $C\\in\\mathbb{R}$`,
      `$F(x)=C\\times \\ln\\left(${reduireAxPlusB(1, a)}\\right)$, où $C\\in\\mathbb{R}$`,
      `$F(x)=\\dfrac{${c}}{\\left(${reduireAxPlusB(1, a)}\\right)^2}+C$, où $C\\in\\mathbb{R}$`,
      `$F(x)=C\\times \\ln\\left(${reduireAxPlusB(c, a * c)}\\right)$, où $C\\in\\mathbb{R}$`,
    ]
    const texte = `Une primitive de la fonction $f$ définie sur $]${texNombre(-a)};+\\infty[$ par $f(x)=\\dfrac{${c}}{${reduireAxPlusB(1, a)}}$, est la fonction : <br>`
    this.enonce = texte

    correction = `Soit $u$ la fonction définie sur  $]${texNombre(-a)};+\\infty[$ par $u(x)=${reduireAxPlusB(1, a)}$.<br>`
    correction += `On a alors $u'(x)=1$. <br>$f$ peut donc s'écrire sous la forme : $f(x)=${coef}\\dfrac{u'(x)}{u(x)}$.<br>`
    correction +=
      "On sait qu'une primitive d'une fonction sous la forme $\\dfrac{u'(x)}{u(x)}$, avec $u(x)\\neq0$, est définie par $\\ln{(u(x))}$.<br>"
    correction += `Une primitive de $f$ est donc la fonction $F(x)=${coef} \\ln\\left(${reduireAxPlusB(1, a)}\\right)+C$, où $C\\in\\mathbb{R}$.<br>`
    this.correction = correction
    this.enonce = texte
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
