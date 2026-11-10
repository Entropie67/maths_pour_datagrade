import { all, isEqual, isReduced } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import {
    columnTex,
    crossProduct,
    dot,
    normSquared,
    type Vector3,
    vectorBetween,
} from '../../../lib/outils/geometrieVectorielle'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Calculer les angles d'un triangle dans l'espace avec le produit scalaire"
export const dateDePublication = '11/05/2026'
export const interactifReady = true

export const uuid = 'b7e4d'
export const refs = {
  'fr-ch': ['3G98-6'],
  'fr-fr': [],
}

function pointTex(name: string, point: Vector3): string {
  return `${name}=(${point[0]}~;~${point[1]}~;~${point[2]})`
}

function opposite(vector: Vector3): Vector3 {
  return [-vector[0], -vector[1], -vector[2]]
}

function angleDegrees(u: Vector3, v: Vector3): number {
  const cos = dot(u, v) / Math.sqrt(normSquared(u) * normSquared(v))
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI
}

function angleAnswer(angle: number): string {
  return String(Math.round(angle * 10) / 10)
}

function roundedAngle(angle: number): number {
  return Math.round(angle * 10) / 10
}

function angleRelation(angle: number): '=' | '\\approx' {
  return Math.abs(angle - roundedAngle(angle)) < 1e-10 ? '=' : '\\approx'
}

function angleMeasureTex(angle: number): string {
  return `${texNombre(roundedAngle(angle), 1)}^\\circ`
}

function dotDetails(u: Vector3, v: Vector3): string {
  return `${u[0]}\\cdot ${ecritureParentheseSiNegatif(v[0])}+${ecritureParentheseSiNegatif(u[1])}\\cdot ${ecritureParentheseSiNegatif(v[1])}+${ecritureParentheseSiNegatif(u[2])}\\cdot ${ecritureParentheseSiNegatif(v[2])}`
}

function normTex(name: string, vector: Vector3): string {
  const n2 = normSquared(vector)
  return `\\Vert\\vec{${name}}\\Vert=\\sqrt{${vector[0]}^2+${ecritureParentheseSiNegatif(vector[1])}^2+${ecritureParentheseSiNegatif(vector[2])}^2}=\\sqrt{${n2}}`
}

function angleLineTex(
  angleName: string,
  numeratorName: string,
  left: Vector3,
  right: Vector3,
  leftNormName: string,
  rightNormName: string,
): string {
  const numerator = dot(left, right)
  const denominator = normSquared(left) * normSquared(right)
  const angle = angleDegrees(left, right)
  return `$\\begin{aligned}
\\theta_${angleName}
&=\\arccos\\left(\\dfrac{${numeratorName}}{\\Vert\\vec{${leftNormName}}\\Vert\\cdot\\Vert\\vec{${rightNormName}}\\Vert}\\right)\\\\
&=\\arccos\\left(\\dfrac{${dotDetails(left, right)}}{\\sqrt{${normSquared(left)}}\\cdot\\sqrt{${normSquared(right)}}}\\right)\\\\
&=\\arccos\\left(\\dfrac{${numerator}}{\\sqrt{${texNombre(denominator)}}}\\right)${angleRelation(angle)} ${angleMeasureTex(angle)}
\\end{aligned}$`
}

export default class AnglesTriangleEspace extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const pointA: Vector3 = [randint(-5, 5), randint(-5, 5), randint(-5, 5)]
      const vectorAB: Vector3 = [
        randint(-5, 5, 0),
        randint(-5, 5),
        randint(-5, 5),
      ]
      const vectorAC: Vector3 = [
        randint(-5, 5),
        randint(-5, 5, 0),
        randint(-5, 5),
      ]
      const pointB: Vector3 = [
        pointA[0] + vectorAB[0],
        pointA[1] + vectorAB[1],
        pointA[2] + vectorAB[2],
      ]
      const pointC: Vector3 = [
        pointA[0] + vectorAC[0],
        pointA[1] + vectorAC[1],
        pointA[2] + vectorAC[2],
      ]
      const cross = crossProduct(vectorAB, vectorAC)
      if (cross.every((coordinate) => coordinate === 0)) {
        cpt++
        continue
      }

      const a = vectorBetween(pointB, pointC)
      const b = vectorBetween(pointA, pointC)
      const c = vectorBetween(pointA, pointB)
      const angleA = angleDegrees(b, c)
      const angleB = angleDegrees(a, opposite(c))
      const angleC = angleDegrees(opposite(a), opposite(b))

      let texte =
        `Dans un repère orthonormé de l'espace, calculer les angles du triangle $ABC$, avec $${pointTex('A', pointA)}$, ` +
        `$${pointTex('B', pointB)}$ et $${pointTex('C', pointC)}$. Arrondir au dixième de degré près.`
      if (this.interactif) {
        texte +=
          '<br>' +
          remplisLesBlancs(
            this,
            i,
            '\\theta_A\\approx %{champ1}^{\\circ}\\quad \\theta_B\\approx %{champ2}^{\\circ}\\quad \\theta_C\\approx %{champ3}^{\\circ}',
          )
      }

      handleAnswers(this, i, {
        champ1: {
          value: angleAnswer(angleA),
          compare: all([isEqual({ tolerance: -1 }), isReduced()]),
        },
        champ2: {
          value: angleAnswer(angleB),
          compare: all([isEqual({ tolerance: -1 }), isReduced()]),
        },
        champ3: {
          value: angleAnswer(angleC),
          compare: all([isEqual({ tolerance: -1 }), isReduced()]),
        },
      })

      let texteCorr = `On pose $\\vec a=\\overrightarrow{BC}$, $\\vec b=\\overrightarrow{AC}$ et $\\vec c=\\overrightarrow{AB}$.<br>`
      texteCorr += `$\\vec a=${columnTex(a)}$, $\\vec b=${columnTex(b)}$ et $\\vec c=${columnTex(c)}$.<br>`
      texteCorr += `$${normTex('a', a)}$, $${normTex('b', b)}$ et $${normTex('c', c)}$.<br><br>`
      texteCorr += `${angleLineTex('A', '\\vec b\\cdot\\vec c', b, c, 'b', 'c')}<br><br>`
      texteCorr += `${angleLineTex('B', '\\vec a\\cdot(-\\vec c)', a, opposite(c), 'a', 'c')}<br><br>`
      texteCorr += `${angleLineTex('C', '(-\\vec a)\\cdot(-\\vec b)', opposite(a), opposite(b), 'a', 'b')}<br>`
      texteCorr += `<br>On obtient donc $\\theta_A${angleRelation(angleA)} ${miseEnEvidence(texNombre(roundedAngle(angleA), 1))}^\\circ$, $\\theta_B${angleRelation(angleB)} ${miseEnEvidence(texNombre(roundedAngle(angleB), 1))}^\\circ$ et $\\theta_C${angleRelation(angleC)} ${miseEnEvidence(texNombre(roundedAngle(angleC), 1))}^\\circ$.`

      if (this.questionJamaisPosee(i, ...pointA, ...pointB, ...pointC)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
