import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { texteGras } from '../../lib/format/style'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

export const interactifReady = true

export const titre =
  "Calculer et utiliser les coordonnées du milieu d'un segment dans un repère"
export const dateDeModifImportante = '04/12/2023'
/**
 * @author Stéphane Guyon modif Gilles Mora
 */
export const uuid = '4b25a'

export const refs = {
  'fr-fr': ['2G12-2'],
  'fr-ch': ['3G90-4'],
}
export default class Milieu extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Situations',
      4,
      '1 : Application directe \n2 : Application directe (fractions) \n3 : Application indirecte \n4 : Mélange ',
    ]

    this.nbQuestions = 1

    this.sup = 1 //
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles = [1, 2, 3]
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1]
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [3]
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = [2]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      let texte = ''
      let texteCorr = ''
      const objets: NestedObjetMathalea2dArray = []
      const xA = randint(-8, 8, 0)
      const xB = randint(-8, 8, xA)
      const yA = randint(-8, 8, 0)
      const yB = randint(-8, 8)
      const g = repere({
        xUnite: 1,
        yUnite: 1,
        xMin: Math.min(-2, xA - 1, xB - 1),
        yMin: Math.min(-2, yA - 1, yB - 1),
        xMax: Math.max(xA + 1, xB + 1, 2),
        yMax: Math.max(yA + 1, yB + 1, 2),
        thickHauteur: 0.1,
        yLabelEcart: 0.7,
        xLabelEcart: 0.5,
        axeXStyle: '->',
        axeYStyle: '->',
        yLabelDistance: 2,
        xLabelDistance: 2,
      })
      const A = pointAbstrait(xA, yA, 'A')
      const B = pointAbstrait(xB, yB, 'B')
      const M = pointAbstrait((xA + xB) / 2, (yA + yB) / 2, 'M')
      const nom = creerNomDePolygone(3, ['OIJDXYMAB'])
      A.nom = nom[0]
      B.nom = nom[1]
      M.nom = nom[2]

      const I = texteParPosition('I', 1, -0.5, 0, 'black', 1)
      const J = texteParPosition('J', -0.5, 1, 0, 'black', 1)
      const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
      const s = segment(A, B, bleuMathalea)

      s.epaisseur = 2
      // s3 = codageSegments('X', 'red', s1, s2)
      const T = tracePoint(A, B, M) // Repère les points avec une croix
      const L = labelPoint(A, B, M)
      const corrD = `On sait d'après le cours, que si $A(x_A\\,;\\,y_A)$ et $B(x_B\\,;\\,y_B)$ sont deux points d'un repère orthonormé,
       alors $x_M$ l'abscisse du point $M$ est la ${texteGras('moyenne')} des abscisses des points $A$ et $B$, soit $x_M=\\dfrac{x_A+x_B}{2}$ et 
      $y_M$ l'ordonnée du point $M$ est la ${texteGras('moyenne')} des ordonnées des points $A$ et $B$, soit $y_M=\\dfrac{y_A+y_B}{2}$. <br>
      Ainsi, les coordonnées du point $M$ milieu de $[AB]$ sont 
      $M\\left(\\dfrac{x_A+x_B}{2}\\,;\\,\\dfrac{y_A+y_B}{2}\\right)$ <br>
      On peut représenter la situation avec les données de l'énoncé : <br>`
      switch (typesDeQuestions) {
        case 1: // cas simple du milieu
          {
            const xM = new FractionEtendue(xA + xB, 2)
            const yM = new FractionEtendue(yA + yB, 2) // .simplifie()
            objets.push(g, T, L, s, o, I, J)
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: xM.texFraction },
              champ2: { value: yM.texFraction },
            })

            texte =
              'Dans un repère orthonormé $(O,I,J)$, on donne les points suivants :'
            texte += ` $${A.nom}\\left(${xA}\\,;\\,${yA}\\right)$ et $${B.nom}\\left(${xB}\\,;\\,${yB}\\right)$.`
            texte += `<br>Déterminer les coordonnées du point $${M.nom}$, milieu du segment $[${A.nom}${B.nom}]$. `
            if (this.interactif) {
              texte +=
                '<br>' +
                remplisLesBlancs(
                  this,
                  i,
                  `${M.nom}\\Bigg(%{champ1};%{champ2}\\Bigg)`,
                  KeyboardType.clavierDeBaseAvecFraction,
                )
            }
            if (this.correctionDetaillee) {
              texteCorr = corrD
              texteCorr += mathalea2d(
                Object.assign({ zoom: 1, scale: 0.5 }, fixeBordures(objets)),
                objets,
              )
            } else {
              texteCorr = ''
            }
            texteCorr +=
              "On applique les formules avec les données de l'énoncé : <br><br>"
            texteCorr += `$\\begin{cases}x_${M.nom}=\\dfrac{x_${A.nom}+x_${B.nom}}{2}=\\dfrac{${xA}+${ecritureParentheseSiNegatif(xB)}}{2}=\\dfrac{${texNombre(xA + xB)}}{2}${xM.texSimplificationAvecEtapes()}\\\\[0.5em]y_${M.nom}=\\dfrac{y_${A.nom}+y_${B.nom}}{2}=\\dfrac{${yA}+${ecritureParentheseSiNegatif(yB)}}{2}=\\dfrac{${texNombre(yA + yB)}}{2}${yM.texSimplificationAvecEtapes()}\\end{cases}$`
            texteCorr += ` <br>Ainsi : $${miseEnEvidence(`${M.nom}\\left(${xM.simplifie().texFSD}\\,;\\,${yM.simplifie().texFSD}\\right)`)}$ ou 
          $${M.nom}\\left(${texNombre((xA + xB) / 2, 1)}\\,;\\,${texNombre((yA + yB) / 2, 1)}\\right)$<br> `
          }
          break
        case 2: // cas où on connaît A et I, on cherche B
          {
            const xM = (xA + xB) / 2
            const yM = (yA + yB) / 2

            objets.push(g, T, L, s, o, I, J)
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: (xM * 2 - xA).toString() },
              champ2: { value: (yM * 2 - yA).toString() },
            })
            texte =
              'Dans un repère orthonormé $(O,I,J)$, on donne les points suivants :'
            texte += `  $${A.nom}\\left(${xA}\\,;\\,${yA}\\right)$ et $${M.nom}\\left(${texNombre(xM, 1)}\\,;\\,${texNombre(yM, 1)}\\right)$.`
            texte += `<br>Déterminer les coordonnées du point $${B.nom}$ tel que $${M.nom}$ soit le milieu du segment $[${A.nom}${B.nom}]$. `

            if (this.interactif) {
              texte +=
                '<br>' +
                remplisLesBlancs(
                  this,
                  i,
                  `${B.nom}\\Bigg(%{champ1};%{champ2}\\Bigg)`,
                  KeyboardType.clavierDeBaseAvecFraction,
                )
            }
            if (this.correctionDetaillee) {
              texteCorr = corrD
              texteCorr += mathalea2d(
                Object.assign({ zoom: 1, scale: 0.5 }, fixeBordures(objets)),
                objets,
              )
            } else {
              texteCorr = ''
            }
            texteCorr += `$${M.nom}$ est le milieu du segment $[${A.nom}${B.nom}]$.<br>`
            texteCorr +=
              "On applique les formules avec les données de l'énoncé : <br><br>"
            texteCorr += `$\\begin{cases}x_${M.nom}=\\dfrac{x_${A.nom}+x_${B.nom}}{2}\\\\[0.5em]y_${M.nom}=\\dfrac{y_${A.nom}+y_${B.nom}}{2}\\end{cases}$ `
            texteCorr += `$\\iff\\begin{cases}${texNombre(xM, 1)}=\\dfrac{${xA}+x_${B.nom}}{2}\\\\[0.5em]${texNombre(yM, 1)}=\\dfrac{${yA}+y_${B.nom}}{2}\\end{cases}\\iff \\begin{cases}${xA}+x_${B.nom}=2\\times ${ecritureParentheseSiNegatif(xM)} \\\\[0.5em] ${yA}+y_${B.nom}=2\\times ${ecritureParentheseSiNegatif(yM)}\\end{cases}\\iff \\begin{cases}x_${B.nom}=${texNombre(2 * xM, 0)} ${ecritureAlgebrique(-xA)} \\\\[0.5em] y_${B.nom}=${texNombre(2 * yM, 0)}${ecritureAlgebrique(-yA)}\\end{cases}$`
            texteCorr += `<br>On en déduit : $\\begin{cases}x_${B.nom}={${texNombre(2 * xM - xA)}}\\\\[0.5em]y_${B.nom}=${texNombre(2 * yM - yA)}\\end{cases}$`
            texteCorr += `<br>Ainsi : $${miseEnEvidence(`${B.nom}\\left( ${texNombre(2 * xM - xA)}\\,;\\,${texNombre(2 * yM - yA)}\\right)`)}$`
          }
          break

        case 3: // cas simple du milieu avec fraction
          {
            const listeFractions1 = [
              [2, 1],
              [6, 1],
              [5, 1],
              [3, 1],
              [4, 1],
              [7, 1],
              [8, 1],
              [9, 1],
              [10, 1],
              [3, 2],
              [5, 2],
              [1, 3],
              [2, 3],
              [4, 3],
              [5, 3],
              [1, 4],
              [3, 4],
              [5, 4],
              [1, 5],
              [2, 5],
              [3, 5],
              [4, 5],
              [1, 6],
              [5, 6],
            ]
            const listeFractions2 = [
              [3, 2],
              [5, 2],
              [1, 3],
              [2, 3],
              [4, 3],
              [5, 3],
              [1, 4],
              [3, 4],
              [5, 4],
              [1, 5],
              [2, 5],
              [3, 5],
              [4, 5],
              [1, 6],
              [5, 6],
            ]
            const listeFractions3 = [
              [1, 2],
              [3, 2],
              [5, 2],
              [1, 3],
              [2, 3],
              [4, 3],
              [5, 3],
              [1, 4],
              [3, 4],
              [5, 4],
              [1, 5],
              [2, 5],
              [3, 5],
              [4, 5],
              [1, 6],
              [5, 6],
            ]
            const listeFractions4 = [
              [2, 1],
              [6, 1],
              [5, 1],
              [3, 1],
              [4, 1],
              [7, 1],
              [3, 2],
              [5, 2],
              [1, 3],
              [2, 3],
              [4, 3],
              [5, 3],
              [1, 4],
              [3, 4],
              [5, 4],
              [1, 5],
              [2, 5],
              [3, 5],
              [4, 5],
              [1, 6],
              [5, 6],
            ]

            const xAf = choice(listeFractions1)
            const Ax = new FractionEtendue(xAf[0] * choice([-1, 1]), xAf[1])

            const yAf = choice(listeFractions2)
            const Ay = new FractionEtendue(yAf[0] * choice([-1, 1]), yAf[1])

            const xBf = choice(listeFractions3)
            const Bx = new FractionEtendue(xBf[0] * choice([-1, 1]), xBf[1])

            const yBf = choice(listeFractions4)
            const By = new FractionEtendue(yBf[0] * choice([-1, 1]), yBf[1])

            const xM = new FractionEtendue(
              Ax.num * Bx.d + Bx.num * Ax.den,
              2 * Ax.den * Bx.den,
            )
            const yM = new FractionEtendue(
              Ay.num * By.den + By.num * Ay.den,
              2 * Ay.den * By.den,
            )

            texte =
              'Dans un repère orthonormé $(O,I,J)$, on donne les points suivants :'
            texte += ` $${A.nom}\\left(${Ax.texFSD}\\,;\\,${Ay.texFSD}\\right)$ et $${B.nom}\\left(${Bx.texFSD}\\,;\\,${By.texFSD}\\right)$.`
            texte += `<br>Déterminer les coordonnées du point $${M.nom}$, milieu du segment $[${A.nom}${B.nom}]$.`
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: xM.texFraction },
              champ2: { value: yM.texFraction },
            })
            if (this.interactif) {
              texte +=
                '<br>' +
                remplisLesBlancs(
                  this,
                  i,
                  `${M.nom}\\Bigg(%{champ1};%{champ2}\\Bigg)`,
                  KeyboardType.clavierDeBaseAvecFraction,
                )
            }
            if (this.correctionDetaillee) {
              texteCorr = corrD
            } else {
              texteCorr = ''
            }
            texteCorr +=
              "On applique les formules avec les données de l'énoncé : <br><br>"
            texteCorr += `$\\begin{cases}x_${M.nom}=\\dfrac{x_${A.nom}+x_${B.nom}}{2}=\\dfrac{${Ax.texFSD}+${Bx.num < 0 ? `\\left(${Bx.texFSD}\\right)` : `${Bx.texFSD}`}}{2}=
          \\dfrac{\\dfrac{${Ax.num * Bx.den}}{${Ax.den * Bx.den}}+\\dfrac{${Bx.num * Ax.den}}{${Ax.den * Bx.den}}}{2}=\\dfrac{\\dfrac{${Ax.num * Bx.den + Bx.num * Ax.den}}{${Ax.den * Bx.den}}}{2}=\\dfrac{${Ax.num * Bx.den + Bx.num * Ax.den}}{${Ax.den * Bx.den}}\\times \\dfrac{1}{2}=${xM.texFraction}${xM.texSimplificationAvecEtapes()}\\\\[1em]
          y_${M.nom}=\\dfrac{y_${A.nom}+y_${B.nom}}{2}=\\dfrac{${Ay.texFSD}+${By.num < 0 ? `\\left(${By.texFSD}\\right)` : `${By.texFSD}`}}{2}=
          \\dfrac{\\dfrac{${Ay.num * By.den}}{${Ay.den * By.den}}+\\dfrac{${By.num * Ay.den}}{${Ay.den * By.den}}}{2}=\\dfrac{\\dfrac{${Ay.num * By.den + By.num * Ay.den}}{${Ay.den * By.den}}}{2}=\\dfrac{${Ay.num * By.den + By.num * Ay.den}}{${Ay.den * By.den}}\\times \\dfrac{1}{2}=${yM.texFraction}${yM.texSimplificationAvecEtapes()}\\end{cases}$`
            texteCorr += `  <br>Ainsi : $${miseEnEvidence(`${M.nom}\\left(${xM.simplifie().texFSD}\\,;\\,${yM.simplifie().texFSD}\\right)`)}$. `
          }
          break
      }

      if (this.questionJamaisPosee(i, xA, yA, xB, yB, typesDeQuestions)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
