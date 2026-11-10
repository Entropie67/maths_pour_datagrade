import { point } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { pgcd } from '../../lib/outils/primalite'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer un lieu géométrique avec $a\\,z+b\\,\\overline{z}$ réel ou imaginaire pur'
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = '83264'
export const refs = {
  'fr-fr': ['TEC2-18'],
  'fr-ch': [],
}

/**
 * Déterminer l'ensemble des points M d'affixe z tels que Z = a z + b z̄
 * soit un nombre réel ou un imaginaire pur.
 * @author Stéphane Guyon
 */
export default class LieuCombinaisonConjugue extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const types = combinaisonListes([1, 2], this.nbQuestions)
    const coefficients = [
      [1, 0],
      [2, 0],
      [3, 0],
      [-1, 0],
      [-2, 0],
      [0, 1],
      [0, 2],
      [0, -1],
      [0, -2],
      [1, 1],
      [1, -1],
      [2, 1],
      [2, -1],
      [-1, 1],
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; cpt++) {
      const reel = types[i] === 1
      const [a1, a2] = choice(coefficients)
      const [b1, b2] = choice(coefficients)
      // Re(Z) = pr x + qr y et Im(Z) = pi x + qi y
      const pr = a1 + b1
      const qr = b2 - a2
      const pi = a2 + b2
      const qi = a1 - b1
      // Condition sur Z : Im(Z) = 0 si réel, Re(Z) = 0 si imaginaire pur
      const A = reel ? pi : pr
      const B = reel ? qi : qr
      // Lieu = plan entier si A = B = 0
      if (A === 0 && B === 0) continue
      if (!this.questionJamaisPosee(i, a1, a2, b1, b2, types[i])) continue

      // Coefficient devant v, avec parenthèses seulement si nécessaire
      const terme = (c1: number, c2: number, v: string) => {
        const imag = (m: number) =>
          m === 1
            ? '\\mathrm{i}'
            : m === -1
              ? '-\\mathrm{i}'
              : `${m}\\mathrm{i}`
        if (c2 === 0) return c1 === 1 ? v : c1 === -1 ? `-${v}` : `${c1}${v}`
        if (c1 === 0) return `${imag(c2)}${v}`
        return `(${c1}${c2 === 1 ? '+' : c2 === -1 ? '-' : ecritureAlgebrique(c2)}\\mathrm{i})${v}`
      }
      const somme = (t1: string, t2: string) =>
        t2.startsWith('-') ? `${t1}${t2}` : `${t1}+${t2}`
      const nature = reel ? 'un nombre réel' : 'un imaginaire pur'
      const fonction = reel ? '\\operatorname{Im}' : '\\operatorname{Re}'
      const expressionZ = somme(
        terme(a1, a2, 'z'),
        terme(b1, b2, '\\overline{z}'),
      )

      const termeXY = (u: number, v: number) => {
        if (u === 0 && v === 0) return '0'
        const tx = u === 0 ? '' : `${u === 1 ? '' : u === -1 ? '-' : u}x`
        const ty =
          v === 0
            ? ''
            : `${tx === '' ? (v === 1 ? '' : v === -1 ? '-' : v) : v === 1 ? '+' : v === -1 ? '-' : ecritureAlgebrique(v)}y`
        return tx + ty
      }
      const partieReelle = termeXY(pr, qr)
      const partieImag = termeXY(pi, qi)
      const condition = reel ? partieImag : partieReelle

      // Équation réduite du lieu
      let equation: string
      let resolution: string
      if (B === 0) {
        equation = 'x=0'
        resolution = ''
      } else if (A === 0) {
        equation = 'y=0'
        resolution = ''
      } else {
        const g = pgcd(Math.abs(A), Math.abs(B))
        const signe = B < 0 ? -1 : 1
        const num = (-A / g) * signe
        const den = (Math.abs(B) / g) * 1
        const coef =
          den === 1
            ? `${num === 1 ? '' : num === -1 ? '-' : num}`
            : `${num < 0 ? '-' : ''}\\dfrac{${Math.abs(num)}}{${den}}`
        equation = `y=${coef}x`
        resolution = `&\\iff ${termeXY(0, B)}=${termeXY(-A, 0)}\\\\`
      }

      const enonce = `Dans le plan complexe muni d'un repère orthonormé $(O\\,;\\,\\vec u,\\vec v)$, déterminer l'ensemble $\\mathcal E$ des points $M$ d'affixe $z=x+\\mathrm{i}y$ ($x$ et $y$ réels) tels que $Z=${expressionZ}$ soit ${nature}.`

      const limite = 5
      const t = limite / Math.max(Math.abs(A), Math.abs(B))
      // Extrémité haute de la droite (ou droite si horizontale), étiquette placée côté vide
      const sens = -A * t > 0 || (A === 0 && B * t > 0) ? 1 : -1
      const xEnd = 0.85 * sens * B * t
      const yEnd = -0.85 * sens * A * t
      const xLabel = xEnd > 0 ? xEnd - 1.6 : xEnd + 1.6
      const yLabel = yEnd + 0.5
      const figure = mathalea2d(
        {
          xmin: -limite - 1,
          xmax: limite + 1,
          ymin: -limite - 1,
          ymax: limite + 1,
          scale: 0.5,
        },
        repere({
          xMin: -limite,
          xMax: limite,
          yMin: -limite,
          yMax: limite,
          grille: true,
          grilleDistance: 1,
          grilleCouleur: bleuMathalea,
          grilleOpacite: 0.3,
        }),
        segment(point(-B * t, A * t), point(B * t, -A * t), 'red'),
        latex2d(equation, xLabel, yLabel, { color: 'red' }),
      )

      const correction = `Posons $z=x+\\mathrm{i}y$ avec $x$ et $y$ réels, donc $\\overline{z}=x-\\mathrm{i}y$.<br>
        $\\begin{aligned}
        Z&=${expressionZ}\\\\
        &=${somme(terme(a1, a2, '(x+\\mathrm{i}y)'), terme(b1, b2, '(x-\\mathrm{i}y)'))}\\\\
        &=\\left(${partieReelle}\\right)+\\left(${partieImag}\\right)\\mathrm{i}
        \\end{aligned}$<br>
        Ainsi $\\operatorname{Re}(Z)=${partieReelle}$ et $\\operatorname{Im}(Z)=${partieImag}$.<br>
        $Z$ est ${nature} si et seulement si $${fonction}(Z)=0$ :
        <br>$\\begin{aligned}
        ${fonction}(Z)=0&\\iff ${condition}=0\\\\
        ${resolution}&\\iff ${equation}
        \\end{aligned}$<br>
        $\\mathcal E$ est la droite d'équation $${miseEnEvidence(equation)}$, qui passe par l'origine $O$.<br>${figure}`

      if (this.interactif) {
        this.listeQuestions[i] = addMultiMathfield(this, i, {
          dataTemplate: `${enonce}<br>$\\mathcal E$ est %{field0} d'équation %{field1}.`,
          dataOptions: {
            field0: {
              choices: [
                { label: 'Choisir…', value: '' },
                { label: 'une droite', value: 'droite' },
                { label: 'un cercle', value: 'cercle' },
                { label: 'une demi-droite', value: 'demi-droite' },
              ],
            },
            field1: {
              keyboard: KeyboardType.clavierEntierementPersonnalisable,
              dataKeys: [
                ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'],
                ['+', '-', '\\times', '\\frac{#@}{#0}', 'SQ', '='],
                ['x', 'y', 'z', 'i'],
              ],
            },
          },
        })
        this.listeCorrections[i] = correction
        handleAnswers(
          this,
          i,
          {
            field0: { value: 'droite' },
            field1: { value: equation, options: { egaliteExpression: true } },
            bareme: toutAUnPoint,
          },
          { formatInteractif: 'multi-mathfield' },
        )
      } else {
        createQuestion(this, i, { question: enonce, correction })
      }
      i++
    }
    listeQuestionsToContenu(this)
  }
}
