import Figure from 'apigeom'
import { apigeomFigureToSvg } from '../../lib/apigeom/apigeom-figure'
import { isEqual, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const interactifReady = true

export const titre =
  "Sujet de synthèse sur la droite d'Euler : orthocentre, cercle circonscrit et centre de gravité"

export const dateDePublication = '22/5/2026'

export const uuid = '795d6'
export const refs = {
  'fr-fr': ['1G11-2'],
  'fr-ch': [],
}

/**
 * @author Rémi Angot
 * D'après E3C 2020 sujet15 Ex 3
 * Sujet de synthèse : droite d'Euler en géométrie repérée
 * Stratégie : on part du centre K du cercle circonscrit et de R² ∈ {45, 90}
 * (R² = 3² + 6² ou 3² + 9², multiples de 3 → G = (A+B+C)/3 toujours entier)
 * puis H = A + B + C − 2K (relation d'Euler).
 */
export default class DroiteEuler extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const kx = randint(-2, 2)
      const ky = randint(-2, 2)

      // R² ∈ {45 = 3²+6², 90 = 3²+9²} : a et b multiples de 3 → G entier
      const [a, b] = randint(0, 1) === 0 ? [3, 6] : [3, 9]
      const r2 = a * a + b * b

      // 8 points entiers sur le cercle de centre K et rayon R
      // Paires antipodales : (0,3), (1,2), (4,7), (5,6)
      const relPts: [number, number][] = [
        [a, b],
        [a, -b],
        [-a, b],
        [-a, -b],
        [b, a],
        [b, -a],
        [-b, a],
        [-b, -a],
      ]
      const antipodalPairs = [
        [0, 3],
        [1, 2],
        [4, 7],
        [5, 6],
      ]

      // Choisir 3 indices distincts sans paire antipodale (triangle non rectangle)
      let idxA: number, idxB: number, idxC: number
      let tries = 0
      do {
        idxA = randint(0, 7)
        idxB = randint(0, 7, idxA)
        idxC = randint(0, 7, [idxA, idxB])
        tries++
      } while (
        tries < 30 &&
        antipodalPairs.some(([p, q]) => {
          const chosen = [idxA, idxB, idxC]
          return chosen.includes(p) && chosen.includes(q)
        })
      )
      if (tries >= 30) {
        cpt++
        continue
      }

      const [rAxK, rAyK] = relPts[idxA]
      const [rBxK, rByK] = relPts[idxB]
      const [rCxK, rCyK] = relPts[idxC]

      const xA = kx + rAxK
      const yA = ky + rAyK
      const xB = kx + rBxK
      const yB = ky + rByK
      const xC = kx + rCxK
      const yC = ky + rCyK

      // Orthocentre via la relation d'Euler : H = A + B + C − 2K
      const xH = xA + xB + xC - 2 * kx
      const yH = yA + yB + yC - 2 * ky

      // Centre de gravité : G = (A + B + C) / 3 (entier car a, b multiples de 3)
      const gx = (xA + xB + xC) / 3
      const gy = (yA + yB + yC) / 3

      // Vecteurs pour Q1
      const abX = xB - xA
      const abY = yB - yA
      const acX = xC - xA
      const acY = yC - yA
      const hcX = xC - xH
      const hcY = yC - yH
      const hbX = xB - xH
      const hbY = yB - yH

      const dot1 = abX * hcX + abY * hcY // doit valoir 0
      const dot2 = acX * hbX + acY * hbY // doit valoir 0

      if (dot1 !== 0 || dot2 !== 0) {
        cpt++
        continue
      }

      // Vecteurs pour Q5
      const ghX = xH - gx
      const ghY = yH - gy
      const gkX = kx - gx
      const gkY = ky - gy

      // Éviter le cas dégénéré K = G (triangle équilatéral)
      if (gkX === 0 && gkY === 0) {
        cpt++
        continue
      }

      // Vérification GH = −2 × GK
      if (ghX !== -2 * gkX || ghY !== -2 * gkY) {
        cpt++
        continue
      }

      // Coordonnées de G via AG = (1/3)(AB + AC)
      const agX = (abX + acX) / 3
      const agY = (abY + acY) / 3

      const seed = kx + ky * 11 + r2 * 100 + idxA * 1000 + idxB * 10000

      // === FIGURE (statique dans l'introduction) ===
      const pixPerUnit = 30
      const margin = 2
      const allX = [xA, xB, xC, xH, kx]
      const allY = [yA, yB, yC, yH, ky]
      const figXMin = Math.min(...allX) - margin
      const figXMax = Math.max(...allX) + margin
      const figYMin = Math.min(...allY) - margin
      const figYMax = Math.max(...allY) + margin
      const figWidth = Math.round((figXMax - figXMin) * pixPerUnit)
      const figHeight = Math.round((figYMax - figYMin) * pixPerUnit)

      const figure = new Figure({
        xMin: figXMin,
        yMin: figYMin,
        width: figWidth,
        height: figHeight,
        pixelsPerUnit: pixPerUnit,
      })
      figure.create('Grid', {
        xMin: figXMin,
        yMin: figYMin,
        xMax: figXMax,
        yMax: figYMax,
      })
      const ptA = figure.create('Point', {
        x: xA,
        y: yA,
        label: 'A',
        shape: 'x',
      })
      const ptB = figure.create('Point', {
        x: xB,
        y: yB,
        label: 'B',
        shape: 'x',
      })
      const ptC = figure.create('Point', {
        x: xC,
        y: yC,
        label: 'C',
        shape: 'x',
      })
      figure.create('Point', {
        x: xH,
        y: yH,
        label: 'H',
        shape: 'x',
      })
      figure.create('Point', {
        x: kx,
        y: ky,
        label: 'K',
        shape: 'x',
      })
      figure.create('Segment', { point1: ptA, point2: ptB })
      figure.create('Segment', { point1: ptB, point2: ptC })
      figure.create('Segment', { point1: ptA, point2: ptC })
      figure.optimizeLabels()

      // === QUESTIONS ===

      const question1 =
        `Montrer que $\\overrightarrow{AB} \\cdot \\overrightarrow{HC} = 0$ et que ` +
        `$\\overrightarrow{AC} \\cdot \\overrightarrow{HB} = 0$.`

      const question2 = `Que représente le point $H$ pour le triangle $ABC$${sp()}?`

      const question3 = `Montrer que $K$ est le centre du cercle passant par les sommets du triangle $ABC$.`

      const question4 =
        `On admet que $G$, le centre de gravité du triangle $ABC$, est le point qui vérifie ` +
        `$\\overrightarrow{AG} = \\dfrac{2}{3}\\overrightarrow{AM}$ où $M$ est le milieu du segment $[BC]$. ` +
        `Déterminer les coordonnées de $G$.<br>` +
        remplisLesBlancs(
          this,
          3,
          `G(%{champ1}\\,;\\,%{champ2})`,
          KeyboardType.lyceeClassique,
        )

      const question5 = `Montrer que les points $G$, $H$ et $K$ sont alignés.`

      // === CORRECTIONS ===

      const prod1_1 = abX * hcX
      const prod1_2 = abY * hcY
      const prod2_1 = acX * hbX
      const prod2_2 = acY * hbY

      const correction1 =
        `$\\overrightarrow{AB}\\begin{pmatrix} ${abX} \\\\ ${abY} \\end{pmatrix}$ ` +
        `et $\\overrightarrow{HC}\\begin{pmatrix} ${hcX} \\\\ ${hcY} \\end{pmatrix}$, ` +
        `on a $\\overrightarrow{AB} \\cdot \\overrightarrow{HC} = ` +
        `${ecritureParentheseSiNegatif(abX)} \\times ${ecritureParentheseSiNegatif(hcX)} + ` +
        `${ecritureParentheseSiNegatif(abY)} \\times ${ecritureParentheseSiNegatif(hcY)} = ` +
        `${prod1_1} ${ecritureAlgebrique(prod1_2)} = ${miseEnEvidence('0')}$.<br>` +
        `De même avec $\\overrightarrow{AC}\\begin{pmatrix} ${acX} \\\\ ${acY} \\end{pmatrix}$ ` +
        `et $\\overrightarrow{HB}\\begin{pmatrix} ${hbX} \\\\ ${hbY} \\end{pmatrix}$, ` +
        `on a $\\overrightarrow{AC} \\cdot \\overrightarrow{HB} = ` +
        `${ecritureParentheseSiNegatif(acX)} \\times ${ecritureParentheseSiNegatif(hbX)} + ` +
        `${ecritureParentheseSiNegatif(acY)} \\times ${ecritureParentheseSiNegatif(hbY)} = ` +
        `${prod2_1} ${ecritureAlgebrique(prod2_2)} = ${miseEnEvidence('0')}$.`

      const correction2 =
        `On a $(CH) \\perp (AB)$ et $(BH) \\perp (AC)$. ` +
        `Les droites $(CH)$ et $(BH)$ sont donc deux hauteurs du triangle $ABC$ qui se coupent en $H$${sp()}: ` +
        `$H$ est l'${texteEnCouleurEtGras('orthocentre')} du triangle $ABC$.`

      const correction3 =
        `$KA^2 = ${ecritureParentheseSiNegatif(rAxK)}^2 + ${ecritureParentheseSiNegatif(rAyK)}^2 = ${r2}$,<br>` +
        `$KB^2 = ${ecritureParentheseSiNegatif(rBxK)}^2 + ${ecritureParentheseSiNegatif(rByK)}^2 = ${r2}$,<br>` +
        `$KC^2 = ${ecritureParentheseSiNegatif(rCxK)}^2 + ${ecritureParentheseSiNegatif(rCyK)}^2 = ${r2}$.<br>` +
        `Or $KA^2 = KB^2 = KC^2 = ${r2}$ entraîne $KA = KB = KC$.<br>` +
        `Le point $K$ est équidistant de $A$, $B$ et $C$${sp()}: c'est donc le ` +
        `${texteEnCouleurEtGras('centre du cercle circonscrit')} au triangle $ABC$.`

      const correction4 =
        `Comme $\\overrightarrow{AG} = \\dfrac{2}{3}\\overrightarrow{AM}$ et ` +
        `$\\overrightarrow{AM} = \\dfrac{1}{2}\\overrightarrow{AB} + \\dfrac{1}{2}\\overrightarrow{AC}$, ` +
        `on a $\\overrightarrow{AG} = \\dfrac{1}{3}\\left(\\overrightarrow{AB} + \\overrightarrow{AC}\\right) = ` +
        `\\dfrac{1}{3}\\begin{pmatrix} ${abX + acX} \\\\ ${abY + acY} \\end{pmatrix} = ` +
        `\\begin{pmatrix} ${agX} \\\\ ${agY} \\end{pmatrix}$.<br>` +
        `On en déduit $g = ${xA}${ecritureAlgebrique(agX)} = ${gx}$ et ` +
        `$g' = ${yA}${ecritureAlgebrique(agY)} = ${gy}$.<br>` +
        `Donc $G(${miseEnEvidence(gx)}\\,;\\,${miseEnEvidence(gy)})$.`

      const correction5 =
        `$\\overrightarrow{GH}\\begin{pmatrix} ${ghX} \\\\ ${ghY} \\end{pmatrix}$ ` +
        `et $\\overrightarrow{GK}\\begin{pmatrix} ${gkX} \\\\ ${gkY} \\end{pmatrix}$.<br>` +
        `On a $\\overrightarrow{GH} = ${miseEnEvidence('-2')} \\times \\overrightarrow{GK}$${sp()}: ` +
        `les vecteurs $\\overrightarrow{GH}$ et $\\overrightarrow{GK}$ sont colinéaires, ` +
        `donc les points $G$, $H$ et $K$ sont alignés.`

      if (this.questionJamaisPosee(i, seed)) {
        this.introduction =
          `Dans un repère orthonormé $(O\\,;\\,\\vec{\\imath}\\,;\\,\\vec{\\jmath})$, on considère les points ` +
          `$A(${xA}\\,;\\,${yA})$, $B(${xB}\\,;\\,${yB})$, $C(${xC}\\,;\\,${yC})$, ` +
          `$H(${xH}\\,;\\,${yH})$ et $K(${kx}\\,;\\,${ky})$.<br>` +
          (context.isTypst
            ? apigeomFigureToSvg(figure)
            : context.isHtml
              ? figure.getStaticHtml()
              : figure.tikz())

        handleAnswers(this, 3, {
          champ1: { value: `${gx}`, compare: seq([isEqual()]) },
          champ2: { value: `${gy}`, compare: seq([isEqual()]) },
        })

        this.listeQuestions = [
          question1,
          question2,
          question3,
          question4,
          question5,
        ]
        this.listeCorrections = [
          correction1,
          correction2,
          correction3,
          correction4,
          correction5,
        ]
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
