import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcm from '../ExerciceQcm'
import { sp } from '../../lib/outils/outilString'
/*
 @author Stéphane Guyon
*/
export const uuid = 'afbe8'
export const refs = {
  'fr-fr': ['TSA7-11', 'TCA5-11'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'QCM : Déterminer une primitive'
export const dateDePublication = '15/03/2025'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 */

export default class Binomiale extends ExerciceQcm {
  versionOriginale: () => void = () => {
    let compteur = 0
    do {
      const a = randint(-5, 5, 0)
      const c = randint(-5, 5, [0, 1])
      const d = randint(-5, 5, [-1, 0, 1])
      let correction
      this.reponses = [
        `$F(x)=\\dfrac{${d}x ${ecritureAlgebrique(d * a - c)}}{x${ecritureAlgebrique(a)}}$`,
        `$F(x)=\\dfrac{${-d}x ${ecritureAlgebrique(c - d * a)}}{x${ecritureAlgebrique(a)}}$`,
        `$F(x)=\\dfrac{${d}x ${ecritureAlgebrique(c + a)}}{x${ecritureAlgebrique(a)}}$`,
        `$F(x)=\\dfrac{${-d}x ${ecritureAlgebrique(c)}}{x${ecritureAlgebrique(a)}}$`,
      ]
      const texte = `Une primitive de la fonction $f$ définie sur $]${texNombre(-a)};+\\infty[$ par $f(x)=\\dfrac{${c}}{(${reduireAxPlusB(1, a)})^2}$, est la fonction${sp()}: <br>`
      this.enonce = texte
      correction =
        'Le plus rapide est sans doute de dériver toutes les fonctions proposées pour déterminer laquelle donnera $f$.<br>'
      correction += `On teste${sp()}:  $F(x)=\\dfrac{${d}x ${ecritureAlgebrique(d * a - c)}}{x${ecritureAlgebrique(a)}}$ .<br>`
      correction += `Soit $u(x)=${d}x ${ecritureAlgebrique(d * a - c)}\\quad$ et $\\quad v(x)=  x${ecritureAlgebrique(a)}$ .<br>`
      correction += `On calcule $u'(x)=${d}\\quad$ et $\\quad v'(x)=  1$ .<br>`
      correction +=
        `De $\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}$, on déduit que${sp()}:<br>`
      correction += `$\\begin{aligned}F'(x)&=\\dfrac{${d}\\left(x${ecritureAlgebrique(a)}\\right)-\\left(${d}x ${ecritureAlgebrique(d * a - c)}\\right)}{(${reduireAxPlusB(1, a)})^2}\\\\&=\\dfrac{${c}}{(${reduireAxPlusB(1, a)})^2} \\\\&=f(x)\\end{aligned}$<br>`
      correction += `Une primitive est donc $${miseEnEvidence(`F(x)=\\dfrac{${d}x ${ecritureAlgebrique(d * a - c)}}{x${ecritureAlgebrique(a)}}`)}$ .<br>`
      correction += `${texteGras(`Remarque${sp()}:`)}<br>`
      correction += `On aurait pu être tenté d'appliquer directement le cours en posant $u$ la fonction définie sur  $]${texNombre(-a)};+\\infty[$ par $u(x)=${reduireAxPlusB(1, a)}$.<br>`
      correction += `$f$ peut alors s'écrire sous la forme${sp()}: $f(x)=${c} \\times\\dfrac{1}{u^2(x)}$.<br>`
      correction +=
        "On sait qu'une primitive d'une fonction sous la forme $\\dfrac{1}{u^2(x)}$, avec $u(x)\\neq0$, est définie par $-\\dfrac{1}{u(x)}+ k$, avec $k\\in \\mathbb R$.<br>"
      correction += `On obtient donc $F(x)=${-c} \\times \\dfrac{1}{${reduireAxPlusB(1, a)}}+ k$ avec $k\\in\\mathbb{R}$.<br>`
      correction +=
        'Aucune fonction proposée correspond à la primitive de $f$ avec $k=0$.<br>'
      correction +=
        "Il est possible de poursuivre cette méthode (en mettant l'expression au même dénominateur et en identifiant $k$).<br>"
      this.correction = correction
      this.enonce = texte
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.optionsDeComparaison = { egaliteExpression: true } // pour le test qcm_exercices
    this.options.vertical = true
    this.versionOriginale()
  }
}
