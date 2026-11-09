import { all, isEqual, isReduced } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
    ecritureAlgebriqueSauf0,
    ecritureParentheseSiNegatif,
    rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Calculer l'angle formé par deux droites"
export const dateDePublication = '11/05/2026'
export const interactifReady = true

export const uuid = 'c2d91'
export const refs = {
  'fr-ch': ['3G98-7'],
  'fr-fr': [],
}

type Line = {
  slope: number
  intercept: number
}

function equationTex(line: Line): string {
  const c = -line.intercept
  return `${rienSi1(line.slope)}x-y${ecritureAlgebriqueSauf0(c)}=0`
}

function affineTex(line: Line): string {
  return `${rienSi1(line.slope)}x${ecritureAlgebriqueSauf0(line.intercept)}`
}

function pointTex(name: string, x: number, y: number): string {
  return `${name}=(${x}~;~${y})`
}

function pointChoiceTex(name: string, line: Line): string {
  return `Pour $d_${name}$, si $x=0$, alors $y=${line.intercept}$ ; si $x=1$, alors $y=${line.slope + line.intercept}$.`
}

function angleBetween(line1: Line, line2: Line): number {
  const dot = 1 + line1.slope * line2.slope
  const cos =
    dot / (Math.sqrt(1 + line1.slope ** 2) * Math.sqrt(1 + line2.slope ** 2))
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

export default class AngleAiguDeuxDroites extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const line1: Line = {
        slope: randint(-5, 5, 0),
        intercept: randint(-5, 5),
      }
      const line2: Line = {
        slope: randint(-5, 5, [0, line1.slope]),
        intercept: randint(-5, 5),
      }
      const dot = 1 + line1.slope * line2.slope

      const norm1Squared = 1 + line1.slope ** 2
      const norm2Squared = 1 + line2.slope ** 2
      const angle = angleBetween(line1, line2)
      const numerator = dot

      let texte =
        `Dans un repère orthonormé du plan, calculer l'angle formé par les droites $d_1$ et $d_2$ dans le cas suivant :<br>` +
        `$d_1:${equationTex(line1)}\\qquad d_2:${equationTex(line2)}$<br>` +
        'Arrondir au dixième de degré près.'
      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, 'largeur10', {
            texteAvant: `$\\theta${angleRelation(angle)}$`,
            texteApres: '$^\\circ$',
          })
      }

      handleAnswers(this, i, {
        reponse: {
          value: angleAnswer(angle),
          compare: all([isEqual({ tolerance: -1 }), isReduced()]),
        },
      })

      let texteCorr = `Pour obtenir un vecteur directeur de chaque droite, on choisit deux points sur chacune d'elles.<br>`
      texteCorr += `Pour $d_1$ : $${equationTex(line1)}\\iff y=${affineTex(line1)}$ et pour $d_2$ : $${equationTex(line2)}\\iff y=${affineTex(line2)}$.<br>`
      texteCorr += `${pointChoiceTex('1', line1)} ${pointChoiceTex('2', line2)}<br>`
      texteCorr += `On peut donc prendre $${pointTex('A_1', 0, line1.intercept)}$, $${pointTex('B_1', 1, line1.slope + line1.intercept)}$ ; `
      texteCorr += `$${pointTex('A_2', 0, line2.intercept)}$, $${pointTex('B_2', 1, line2.slope + line2.intercept)}$.<br>`
      texteCorr += `$\\vec d_1=\\overrightarrow{A_1B_1}=\\begin{pmatrix}1\\\\${line1.slope}\\end{pmatrix}$ et `
      texteCorr += `$\\vec d_2=\\overrightarrow{A_2B_2}=\\begin{pmatrix}1\\\\${line2.slope}\\end{pmatrix}$.<br>`
      texteCorr += `$\\Vert\\vec d_1\\Vert=\\sqrt{1^2+${ecritureParentheseSiNegatif(line1.slope)}^2}=\\sqrt{${norm1Squared}}$ et `
      texteCorr += `$\\Vert\\vec d_2\\Vert=\\sqrt{1^2+${ecritureParentheseSiNegatif(line2.slope)}^2}=\\sqrt{${norm2Squared}}$.<br>`
      texteCorr += `$\\begin{aligned}
\\theta
&=\\arccos\\left(\\dfrac{\\vec d_1\\cdot\\vec d_2}{\\Vert\\vec d_1\\Vert\\cdot\\Vert\\vec d_2\\Vert}\\right)\\\\
&=\\arccos\\left(\\dfrac{1\\cdot1+${ecritureParentheseSiNegatif(line1.slope)}\\cdot ${ecritureParentheseSiNegatif(line2.slope)}}{\\sqrt{${norm1Squared}}\\cdot\\sqrt{${norm2Squared}}}\\right)\\\\
&=\\arccos\\left(\\dfrac{${numerator}}{\\sqrt{${norm1Squared * norm2Squared}}}\\right)${angleRelation(angle)} ${angleMeasureTex(angle)}.
\\end{aligned}$<br>`
      texteCorr += `L'angle formé par $d_1$ et $d_2$ est donc $${miseEnEvidence(texNombre(roundedAngle(angle), 1))}^\\circ$.`

      if (
        this.questionJamaisPosee(
          i,
          line1.slope,
          line1.intercept,
          line2.slope,
          line2.intercept,
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
