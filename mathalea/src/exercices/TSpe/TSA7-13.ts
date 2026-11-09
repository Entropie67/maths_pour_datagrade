import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcm from '../ExerciceQcm'
/*
 @author Stéphane Guyon
*/
export const uuid = 'ed974'
export const refs = {
  'fr-fr': ['TSA7-13', 'TCA5-13'],
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
    const a = randint(-5, 5, [0, -1, 1])
    const b = randint(-5, 5, [0, 1])
    const c = randint(-5, 5, [0])

    let correction = ''
    this.reponses = [
      `$F(x)=${new FractionEtendue(1, a).texFractionSimplifiee}\\mathrm{e}^{${reduireAxPlusB(a, b)}} ${ecritureAlgebrique(c)}${ecritureAlgebrique(new FractionEtendue(-1, a))}\\times \\mathrm{e}^{${b}}$`,
      `$F(x)=${new FractionEtendue(1, a).texFractionSimplifiee}\\mathrm{e}^{${reduireAxPlusB(a, b)}} ${ecritureAlgebrique(c)}${ecritureAlgebrique(new FractionEtendue(1, a))}\\times \\mathrm{e}^{${b}}$`,
      `$F(x)=${new FractionEtendue(1, a).texFractionSimplifiee}\\mathrm{e}^{${reduireAxPlusB(a, b)}} ${ecritureAlgebrique(c)}${ecritureAlgebrique(-a)}\\times \\mathrm{e}^{${b}}$`,
      `$F(x)=${new FractionEtendue(1, a).texFractionSimplifiee}\\mathrm{e}^{${reduireAxPlusB(a, b)}} ${ecritureAlgebrique(c)}${ecritureAlgebrique(a)}\\times \\mathrm{e}^{${b}}$`,
      `$F(x)=${a}\\mathrm{e}^{${reduireAxPlusB(a, b)}} ${ecritureAlgebrique(c)}${ecritureAlgebrique(new FractionEtendue(-1, a))}\\times \\mathrm{e}^{${b}}$`,
    ]
    const texte = `La seule primitive $F$ de la fonction $f$ définie sur $\\mathbb R$ par $f(x)=\\mathrm{e}^{${reduireAxPlusB(a, b)}}$ telle que $F(0)=${c}$ est la fonction définie par :<br>`
    this.enonce = texte

    correction =
      "Les primitives d'une fonction $f$ définie pour tout réel par $f(x)=\\mathrm{e}^{ax+b}$, avec $a\\neq0$, sont sous la forme  $F(x)=\\dfrac{1}{a}\\mathrm{e}^{ax+b}+k$ avec $k\\in\\mathbb R$.<br>"
    correction += `Cela nous donne dans la situation présente :  $F(x)=${new FractionEtendue(1, a).texFractionSimplifiee}\\mathrm{e}^{${reduireAxPlusB(a, b)}}+k$, avec $k\\in\\mathbb R$.<br>`
    correction += `On a $F(0)=${new FractionEtendue(1, a).texFractionSimplifiee}\\mathrm{e}^{${b}}+k=${c}$<br>`
    correction += `On en déduit que $k=${c}${ecritureAlgebrique(new FractionEtendue(-1, a))}\\mathrm{e}^{${b}}$<br>`
    correction += `La primitive recherchée est donc $${miseEnEvidence(`F(x)=${new FractionEtendue(1, a).texFractionSimplifiee}\\mathrm{e}^{${reduireAxPlusB(a, b)}} ${ecritureAlgebrique(c)}${ecritureAlgebrique(new FractionEtendue(-1, a))}\\times \\mathrm{e}^{${b}}`)}$ .<br>`
    this.correction = correction
    this.enonce = texte
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
