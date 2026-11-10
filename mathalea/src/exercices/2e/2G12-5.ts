import Decimal from 'decimal.js'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latexParCoordonnees } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { texteGras } from '../../lib/format/style'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { prenom } from '../../lib/outils/Personne'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { abs } from '../../lib/outils/nombres'
import { creerNomDePolygone, sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre =
  "Calculer les coordonnées du $4^\\text{e}$ sommet d'un parallélogramme"
export const dateDePublication = '06/12/2023'

/**
 * @author  Gilles Mora
 */

export const uuid = 'b77cc'

export const refs = {
  'fr-fr': ['2G12-5'],
  'fr-ch': ['3G90-7'],
}
export default class ParallélogrammeSommet extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Avec des entiers \n2 : Avec des décimaux\n3 : Situation concrète ',
    ]

    this.nbQuestions = 1

    this.sup = 1 //
    // this.correctionDetaillee = false
    // this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles = [1, 2, 3]
    let typesDeQuestions
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1]
    }
    if (this.sup === 2) {
      typesDeQuestionsDisponibles = [2]
    }
    if (this.sup === 3) {
      typesDeQuestionsDisponibles = [3]
    }
    const o = latexParCoordonnees('O', -0.35, -0.35, 'black', 0, 0, '')
    const I = latexParCoordonnees('I', 1, -0.5, 'black', 0, 0, '')
    const J = latexParCoordonnees('J', -0.5, 1, 'black', 0, 0, '')

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      typesDeQuestions = listeTypeDeQuestions[i]
      const objets: NestedObjetMathalea2dArray = []
      let texte = ''
      let texteCorr = ''
      let xA: number
      let xB: number
      let xC: number
      let xD: number
      let yA: number
      let yB: number
      let yC: number
      let yD: number
      let ux: number
      let uy: number
      let AB2: number
      let AC2: number
      let BC2: number

      switch (typesDeQuestions) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1:
          {
            // Dq ABDC parallélogramme
            xA = randint(0, 5) * choice([-1, 1])
            yA = randint(0, 5) * choice([-1, 1])
            xD = randint(0, 5, xA) * choice([-1, 1])
            yD = randint(0, 5) * choice([-1, 1])
            uy = randint(3, 5) * choice([-1, 1])
            ux = randint(3, 5) * choice([-1, 1])
            yB = yA + uy
            xB = xA + ux
            xC = xD + ux
            yC = yD + uy
            AB2 = (xA - xB) ** 2 + (yA - yB) ** 2
            AC2 = (xC - xA) ** 2 + (yC - yA) ** 2
            BC2 = (xC - xB) ** 2 + (yC - yB) ** 2
            //
            while (
              (xD - xA) ** 2 + (yD - yA) ** 2 < 8 ||
              (xC - xB) ** 2 + (yC - yB) ** 2 < 8 ||
              abs(xA - xB) < 3 ||
              abs(xA - xC) < 3 ||
              yC ===
                ((yB - yA) / (xB - xA)) * xC +
                  yA -
                  ((yB - yA) / (xB - xA)) * xA ||
              Math.acos(
                (BC2 - AB2 - AC2) / (-2 * Math.sqrt(AB2) * Math.sqrt(AC2)),
              ) < 0.4 ||
              Math.acos(
                (BC2 - AB2 - AC2) / (-2 * Math.sqrt(AB2) * Math.sqrt(AC2)),
              ) > 2.6
            ) {
              xA = randint(0, 5) * choice([-1, 1])
              yA = randint(0, 5) * choice([-1, 1])
              xD = randint(0, 5, xA) * choice([-1, 1])
              yD = randint(0, 5) * choice([-1, 1])
              uy = randint(3, 5) * choice([-1, 1])
              ux = randint(3, 5) * choice([-1, 1])
              yB = yA + uy
              xB = xA + ux
              xC = xD + ux
              yC = yD + uy
              AB2 = (xA - xB) ** 2 + (yA - yB) ** 2
              AC2 = (xC - xA) ** 2 + (yC - yA) ** 2
              BC2 = (xC - xB) ** 2 + (yC - yB) ** 2
            }

            const xM = new FractionEtendue(xA + xC, 2)
            const yM = new FractionEtendue(yA + yC, 2)
            const xMd = (xA + xC) / 2
            const yMd = (yA + yC) / 2
            const absReponse = xA + xC - xB
            const ordReponse = yA + yC - yB
            const A = pointAbstrait(xA, yA, 'A', 'red')
            const B = pointAbstrait(xB, yB, 'B', 'red')
            const C = pointAbstrait(xC, yC, 'C', 'red')
            const D = pointAbstrait(xD, yD, 'D', 'red')
            const s1 = segment(A, B, bleuMathalea)
            const s2 = segment(D, B, bleuMathalea)
            const s3 = segment(C, D, bleuMathalea)
            const s4 = segment(A, C, bleuMathalea)
            const s5 = segment(A, D, bleuMathalea)
            const s6 = segment(B, C, bleuMathalea)
            s1.epaisseur = 2
            s2.epaisseur = 2
            s3.epaisseur = 2
            s4.epaisseur = 2
            s5.epaisseur = 2
            s6.epaisseur = 2
            const nom = creerNomDePolygone(4, ['OIJM'])
            A.nom = nom[0]
            B.nom = nom[1]
            C.nom = nom[2]
            D.nom = nom[3]
            codageSegments('X', bleuMathalea, s5, s6) // Code les segments s5 et s6
            const T = tracePoint(A, B, C, D) // Repère les points avec une croix
            // L = labelPoint(M)
            const P = polygoneAvecNom(A, B, D, C)
            objets.push(P[1])
            texte =
              'Dans un repère orthonormé $(O,I,J)$, on donne les $3$ points suivants :<br>'
            texte += ` $${A.nom}\\left(${xA}\\,;\\,${yA}\\right)$ ; $${B.nom}\\left(${xB}\\,;\\,${yB}\\right)$ et `
            texte += ` $${C.nom}\\left(${xC}\\,;\\,${yC}\\right)$.<br>
       `
            texte += `Déterminer les coordonnées du point $${D.nom}$ tel que $${A.nom}${B.nom}${C.nom}${D.nom}$ soit un parallélogramme. Justifier.`
            this.listeReponsesCourtes[i] = `$\\left(${texNombre(absReponse, 2)}\\,;\\,${texNombre(ordReponse, 2)}\\right)$`
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: absReponse },
              champ2: { value: ordReponse },
            })
            if (this.interactif) {
              texte +=
                '<br>' +
                remplisLesBlancs(
                  this,
                  i,
                  `${D.nom}\\Bigg(%{champ1};%{champ2}\\Bigg)`,
                )
            }

            objets.push(s1, s3, s5, s6, T, I, J, o)
            const XMIN = Math.min(xA, xB, xC, xD, -1) - 1
            const YMIN = Math.min(yA, yB, yC, yD, -1) - 1
            const XMAX = Math.max(xA, xB, xC, xD, 1) + 1
            const YMAX = Math.max(yA, yB, yC, yD, 1) + 1
            objets.push(
              repere({
                xMin: XMIN,
                yMin: YMIN,
                xMax: XMAX,
                yMax: YMAX,
                yLabelEcart: 0.6,
                xLabelEcart: 0.6,
                yLabelDistance: 2,
                xLabelDistance: 2,
              }),
            )
            texteCorr = `On peut représenter la situation avec les données de l'énoncé et conjecturer les coordonnées du point $${D.nom}$: <br>`
            texteCorr += mathalea2d(
              {
                xmin: XMIN,
                ymin: YMIN,
                xmax: XMAX,
                ymax: YMAX,
                pixelsParCm: 25,
                scale: 0.6,
                display: 'block',
              },
              objets,
            )
            texteCorr += `Pour déterminer les coordonnées du point $${D.nom}$, on utilise la propriété suivante : <br>
          «${sp()}Un parallélogramme a ses diagonales qui se coupent en leur milieu${sp()}». <br>
            Autrement dit, le milieu $M$ de $[${A.nom}${C.nom}]$ est aussi le milieu de $[${B.nom}${D.nom}]$ ;<br><br>
            ainsi : <br>
             $\\bullet$ On détermine les coordonnées du milieu $M$ de la diagonale $[${A.nom}${C.nom}]$. <br>
             $\\bullet$ On détermine les coordonnées du point $${D.nom}$ de façon que $M$ soit aussi le milieu de $[${B.nom}${D.nom}]$.<br>`

            texteCorr += `<br> Soit $M$ le milieu de $[${A.nom}${C.nom}]$ : <br> ${context.isHtml ? '<br>' : ''}`
            texteCorr += `$\\begin{cases}x_M=\\dfrac{x_${A.nom}+x_${C.nom}}{2}= \\dfrac{${xA}+${ecritureParentheseSiNegatif(xC)}}{2}=\\dfrac{${texNombre(xA + xC)}}{2}${xM.texSimplificationAvecEtapes()}\\\\[0.8em] y_M=\\dfrac{y_${A.nom}+y_${C.nom}}{2}= \\dfrac{${yA}+${ecritureParentheseSiNegatif(yC)}}{2}=\\dfrac{${texNombre(yA + yC)}}{2}${yM.texSimplificationAvecEtapes()}\\end{cases}$`
            texteCorr += ` <br><br>Donc $ M\\left(${xM.simplifie().texFSD}\\,;\\,${yM.simplifie().texFSD}\\right)$ ou $ M\\left(${texNombre(xM, 1)}\\,;\\,${texNombre(yM, 1)}\\right)$.`
            texteCorr += `<br><br> $M$ est aussi le milieu de $[${B.nom}${D.nom}]$ : <br> ${context.isHtml ? '<br>' : ''}`
            texteCorr += `$\\begin{cases}x_M=\\dfrac{x_${B.nom}+x_${D.nom}}{2}\\\\[0.5em]y_M=\\dfrac{y_${B.nom}+y_${D.nom}}{2}\\end{cases}$ `
            texteCorr += `$\\iff\\begin{cases}${texNombre(xM, 1)}=\\dfrac{${xB}+x_${D.nom}}{2}\\\\[0.5em]${texNombre(yM, 1)}=\\dfrac{${yB}+y_${D.nom}}{2}\\end{cases}\\iff \\begin{cases}${xB}+x_${D.nom}=2\\times ${ecritureParentheseSiNegatif(xMd)} \\\\[0.5em] ${yB}+y_${D.nom}=2\\times ${ecritureParentheseSiNegatif(yMd)}\\end{cases}\\iff \\begin{cases}x_${D.nom}=${texNombre(xM.multiplieEntier(2), 0)} ${ecritureAlgebrique(-xB)} \\\\[0.5em] y_${D.nom}=${texNombre(yM.multiplieEntier(2).valeurDecimale, 0)}${ecritureAlgebrique(-yB)}\\end{cases}$`
            texteCorr += `<br> ${context.isHtml ? '<br>' : ''}On en déduit : $\\begin{cases}x_${D.nom}={${texNombre(xM.multiplieEntier(2).valeurDecimale - xB)}}\\\\[0.5em]y_${D.nom}=${texNombre(yM.multiplieEntier(2).valeurDecimale - yB)}\\end{cases}$`
            texteCorr += `<br> ${context.isHtml ? '<br>' : ''}Donc $${D.nom}\\left( ${texNombre(xM.multiplieEntier(2).valeurDecimale - xB)}\\,;\\,${texNombre(yM.multiplieEntier(2).valeurDecimale - yB)}\\right)$.<br>
          ${context.isHtml ? '<br>' : ''}${texteGras('Remarque :')} On retrouve bien le résultat conjecturé graphiquement.`
          }
          break
        case 2: // avec des décimaux
          {
            xA = (randint(0, 50) * choice([-1, 1])) / 10
            yA = (randint(0, 50) * choice([-1, 1])) / 10
            xD = (randint(0, 50) * choice([-1, 1])) / 10
            yD = (randint(0, 50) * choice([-1, 1])) / 10
            uy = randint(3, 5) * choice([-1, 1])
            ux = randint(3, 5) * choice([-1, 1])
            yB = yA + uy
            xB = xA + ux
            xC = xD + ux
            yC = yD + uy
            AB2 = (xA - xB) ** 2 + (yA - yB) ** 2
            AC2 = (xC - xA) ** 2 + (yC - yA) ** 2
            BC2 = (xC - xB) ** 2 + (yC - yB) ** 2
            //
            do {
              xA = (randint(0, 50) * choice([-1, 1])) / 10
              yA = (randint(0, 50) * choice([-1, 1])) / 10
              xD = (randint(0, 50) * choice([-1, 1])) / 10
              yD = (randint(0, 50) * choice([-1, 1])) / 10
              uy = randint(3, 5) * choice([-1, 1])
              ux = randint(3, 5) * choice([-1, 1])
              yB = yA + uy
              xB = xA + ux
              xC = xD + ux
              yC = yD + uy
              AB2 = (xA - xB) ** 2 + (yA - yB) ** 2
              AC2 = (xC - xA) ** 2 + (yC - yA) ** 2
              BC2 = (xC - xB) ** 2 + (yC - yB) ** 2
            } while (
              (xD - xA) ** 2 + (yD - yA) ** 2 < 8 ||
              (xC - xB) ** 2 + (yC - yB) ** 2 < 8 ||
              abs(xA - xB) < 3 ||
              abs(xA - xC) < 3 ||
              yC ===
                ((yB - yA) / (xB - xA)) * xC +
                  yA -
                  ((yB - yA) / (xB - xA)) * xA ||
              Math.acos(
                (BC2 - AB2 - AC2) / (-2 * Math.sqrt(AB2) * Math.sqrt(AC2)),
              ) < 0.4 ||
              Math.acos(
                (BC2 - AB2 - AC2) / (-2 * Math.sqrt(AB2) * Math.sqrt(AC2)),
              ) > 2.6
            )
            const nom = creerNomDePolygone(4, ['OIJM'])
            const xM = (xA + xC) / 2
            const yM = (yA + yC) / 2
            const absReponse = xM * 2 - xB
            const ordReponse = yM * 2 - yB
            const A = pointAbstrait(xA, yA, 'A', 'red')
            const B = pointAbstrait(xB, yB, 'B', 'red')
            const C = pointAbstrait(xC, yC, 'C', 'red')
            const D = pointAbstrait(xD, yD, 'D', 'red')
            const s1 = segment(A, B, bleuMathalea)
            const s2 = segment(D, B, bleuMathalea)
            const s3 = segment(C, D, bleuMathalea)
            const s4 = segment(A, C, bleuMathalea)
            const s5 = segment(A, D, bleuMathalea)
            const s6 = segment(B, C, bleuMathalea)
            s1.epaisseur = 2
            s2.epaisseur = 2
            s3.epaisseur = 2
            s4.epaisseur = 2
            s5.epaisseur = 2
            s6.epaisseur = 2
            A.nom = nom[0]
            B.nom = nom[1]
            C.nom = nom[2]
            D.nom = nom[3]
            codageSegments('X', bleuMathalea, s5, s6) // Code les segments s5 et s6
            const T = tracePoint(A, B, C, D) // Repère les points avec une croix
            // L = labelPoint(M)
            const P = polygoneAvecNom(A, B, D, C)
            objets.push(P[1])
            texte =
              'Dans un repère orthonormé $(O,I,J)$, on donne les $3$ points suivants :<br>'
            texte += ` $${A.nom}\\left(${texNombre(xA, 2)}\\,;\\,${texNombre(yA, 2)}\\right)$ ; $${B.nom}\\left(${texNombre(xB, 2)}\\,;\\,${texNombre(yB, 2)}\\right)$ et `
            texte += ` $${C.nom}\\left(${texNombre(xC, 2)}\\,;\\,${texNombre(yC, 2)}\\right)$.<br>
           `
            texte += `Déterminer les coordonnées du point $${D.nom}$ tel que $${A.nom}${B.nom}${C.nom}${D.nom}$ soit un parallélogramme. Justifier.`
            objets.push(s1, s3, s5, s6, T, I, J, o)
            const XMIN =
              Math.min(
                Math.round(xA),
                Math.round(xB),
                Math.floor(xC),
                Math.round(xD),
                -1,
              ) - 1
            const YMIN =
              Math.min(
                Math.round(yA),
                Math.round(yB) - 1,
                Math.round(yC),
                Math.round(yD),
                -1,
              ) - 1
            const XMAX =
              Math.max(
                Math.ceil(xA),
                Math.round(xB),
                Math.round(xC),
                Math.round(xD),
                1,
              ) + 1
            const YMAX =
              Math.max(
                Math.round(yA),
                Math.round(yB),
                Math.round(yC),
                Math.round(yD),
                1,
              ) + 1
            objets.push(
              repere({
                xMin: XMIN,
                yMin: YMIN,
                xMax: XMAX,
                yMax: YMAX,
                yLabelEcart: 0.6,
                xLabelEcart: 0.6,
                yLabelDistance: 2,
                xLabelDistance: 2,
              }),
            )
            this.listeReponsesCourtes[i] = `$\\left(${texNombre(absReponse, 2)}\\,;\\,${texNombre(ordReponse, 2)}\\right)$`
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: absReponse },
              champ2: { value: ordReponse },
            })
            if (this.interactif) {
              texte +=
                '<br>' +
                remplisLesBlancs(
                  this,
                  i,
                  `${D.nom}\\Bigg(%{champ1};%{champ2}\\Bigg)`,
                )
            }

            texteCorr = `On peut représenter la situation avec les données de l'énoncé et conjecturer les coordonnées du point $${D.nom}$: <br>`
            texteCorr += mathalea2d(
              {
                xmin: XMIN,
                ymin: YMIN,
                xmax: XMAX,
                ymax: YMAX,
                pixelsParCm: 25,
                scale: 0.6,
                display: 'block',
              },
              objets,
            )
            texteCorr += `Pour déterminer les coordonnées du point $${nom[3]}$, on utilise la propriété suivante : <br>
          «${sp()}Un parallélogramme a ses diagonales qui se coupent en leur milieu${sp()}». <br>
        Autrement dit, le milieu $M$ de $[${nom[0]}${nom[2]}]$ est aussi le milieu de $[${nom[1]}${nom[3]}]$ ;<br><br>
        ainsi : <br>
         $\\bullet$ On détermine les coordonnées du milieu $M$ de la diagonale $[${nom[0]}${nom[2]}]$. <br>
         $\\bullet$ On détermine les coordonnées du point $${nom[3]}$ de façon que $M$ soit aussi le milieu de $[${nom[1]}${nom[3]}]$.<br>`
            texteCorr += `<br> $M$ est le milieu de $[${A.nom}${C.nom}]$ : <br> ${context.isHtml ? '<br>' : ''} `
            texteCorr += `$\\begin{cases}x_M=\\dfrac{x_${A.nom}+x_${C.nom}}{2}=
          \\dfrac{${texNombre(xA, 2)}+${ecritureParentheseSiNegatif(xC)}}{2}=\\dfrac{${texNombre(new Decimal(xA).add(xC), 1)}}{2}=${texNombre(new Decimal(xA).add(xC).div(2), 3)}\\\\[0.8em] y_M=\\dfrac{y_${A.nom}+y_${C.nom}}{2}= \\dfrac{${texNombre(yA, 2)}+${ecritureParentheseSiNegatif(yC)}}{2}=\\dfrac{${texNombre(new Decimal(yA).add(yC), 3)}}{2}=${texNombre(new Decimal(yA).add(yC).div(2), 3)}\\end{cases}$`

            texteCorr += `<br><br>Donc $M(${texNombre(xM, 2)}\\,;\\,${texNombre(yM, 2)})$.<br> `
            texteCorr += `<br><br> $M$ est aussi le milieu de $[${B.nom}${D.nom}]$ : <br> ${context.isHtml ? '<br>' : ''} `
            texteCorr += `$\\begin{cases}x_M=\\dfrac{x_${B.nom}+x_${D.nom}}{2}\\\\[0.5em]y_M=\\dfrac{y_${B.nom}+y_${D.nom}}{2}\\end{cases}$ `
            texteCorr += `$\\iff\\begin{cases}${texNombre(xM, 3)}=\\dfrac{${texNombre(xB)}+x_${D.nom}}{2}\\\\[0.5em]${texNombre(yM, 3)}=\\dfrac{${texNombre(yB, 2)}+y_${D.nom}}{2}\\end{cases}\\iff \\begin{cases}${texNombre(xB)}+x_${D.nom}=2\\times ${ecritureParentheseSiNegatif(xM)} \\\\[0.5em] ${texNombre(yB)}+y_${D.nom}=2\\times ${ecritureParentheseSiNegatif(yM)}\\end{cases}\\iff \\begin{cases}x_${D.nom}=${texNombre(xM * 2, 2)} ${ecritureAlgebrique(-xB)} \\\\[0.5em] y_${D.nom}=${texNombre(yM * 2, 2)}${ecritureAlgebrique(-yB)}\\end{cases}$`
            texteCorr += `<br>On en déduit : $\\begin{cases}x_${D.nom}={${texNombre(xM * 2 - xB, 2)}}\\\\[0.5em]y_${D.nom}=${texNombre(yM * 2 - yB, 2)}\\end{cases}$`
            texteCorr += `<br>Donc $${D.nom}\\left( ${texNombre(xM * 2 - xB, 2)}\\,;\\,${texNombre(yM * 2 - yB, 2)}\\right)$.<br>
          ${context.isHtml ? '<br>' : ''}${texteGras('Remarque :')} Ce résultat est en cohérence avec le graphique.`
          }
          break

        case 3: // avec des décimaux chasse au trésor
        default:
          {
            const pre = prenom()
            xA = (randint(0, 50) * choice([-1, 1])) / 10
            yA = (randint(0, 50) * choice([-1, 1])) / 10
            xD = (randint(0, 50) * choice([-1, 1])) / 10
            yD = (randint(0, 50) * choice([-1, 1])) / 10
            uy = randint(3, 5) * choice([-1, 1])
            ux = randint(3, 5) * choice([-1, 1])
            yB = yA + uy
            xB = xA + ux
            xC = xD + ux
            yC = yD + uy
            AB2 = (xA - xB) ** 2 + (yA - yB) ** 2
            AC2 = (xC - xA) ** 2 + (yC - yA) ** 2
            BC2 = (xC - xB) ** 2 + (yC - yB) ** 2
            //
            while (
              (xD - xA) ** 2 + (yD - yA) ** 2 < 8 ||
              (xC - xB) ** 2 + (yC - yB) ** 2 < 8 ||
              abs(xA - xB) < 3 ||
              abs(xA - xC) < 3 ||
              yC ===
                ((yB - yA) / (xB - xA)) * xC +
                  yA -
                  ((yB - yA) / (xB - xA)) * xA ||
              Math.acos(
                (BC2 - AB2 - AC2) / (-2 * Math.sqrt(AB2) * Math.sqrt(AC2)),
              ) < 0.4 ||
              Math.acos(
                (BC2 - AB2 - AC2) / (-2 * Math.sqrt(AB2) * Math.sqrt(AC2)),
              ) > 2.6
            ) {
              xA = (randint(0, 50) * choice([-1, 1])) / 10
              yA = (randint(0, 50) * choice([-1, 1])) / 10
              xD = (randint(0, 50) * choice([-1, 1])) / 10
              yD = (randint(0, 50) * choice([-1, 1])) / 10
              uy = randint(3, 5) * choice([-1, 1])
              ux = randint(3, 5) * choice([-1, 1])
              yB = yA + uy
              xB = xA + ux
              xC = xD + ux
              yC = yD + uy
              AB2 = (xA - xB) ** 2 + (yA - yB) ** 2
              AC2 = (xC - xA) ** 2 + (yC - yA) ** 2
              BC2 = (xC - xB) ** 2 + (yC - yB) ** 2
            }
            const nom = creerNomDePolygone(4, ['OIJM'])
            const xM = (xA + xC) / 2
            const yM = (yA + yC) / 2
            const absReponse = xM * 2 - xB
            const ordReponse = yM * 2 - yB
            const A = pointAbstrait(xA, yA, 'A', 'red') // E
            const B = pointAbstrait(xB, yB, 'B', 'red') // G
            const C = pointAbstrait(xC, yC, 'C', 'red') // M
            const D = pointAbstrait(xD, yD, 'D', 'red') // T
            const s1 = segment(A, B, bleuMathalea)
            const s2 = segment(D, B, bleuMathalea)
            const s3 = segment(C, D, bleuMathalea)
            const s4 = segment(A, C, bleuMathalea)
            const s5 = segment(A, D, bleuMathalea)
            const s6 = segment(B, C, bleuMathalea)
            s1.epaisseur = 2
            s2.epaisseur = 2
            s3.epaisseur = 2
            s4.epaisseur = 2
            s5.epaisseur = 2
            s6.epaisseur = 2
            A.nom = nom[0]
            B.nom = nom[1]
            C.nom = nom[2]
            D.nom = nom[3]
            codageSegments('X', bleuMathalea, s5, s6) // Code les segments s5 et s6
            const T = tracePoint(A, B, C) // Repère les points avec une croix
            // L = labelPoint(M)
            // objets.push(P[1])

            texte = `${pre} a retrouvé un vieux plan dans son grenier. La maison se situe au point $M$, la grange au point $G$ et
          les écuries au point $E$.<br>
          Au dos, il est inscrit le texte suivant : «${sp()}Pour trouver le trésor, il suffit de creuser à l'endroit bien précis $T$ tel que $TEGM$ soit un parallélogramme${sp()}».<br>
          Déterminer précisément, par le calcul, l'emplacement de ce trésor.<br><br>`
            const E = latexParCoordonnees(
              `E(${stringNombre(xA)};${stringNombre(yA)})`,
              xA,
              yA - 0.5,
              'black',
              0,
              0,
              '',
            )
            const G = latexParCoordonnees(
              `G(${stringNombre(xB)};${stringNombre(yB)})`,
              xB,
              yB - 0.5,
              'black',
              0,
              0,
              '',
            )
            const M = latexParCoordonnees(
              `M(${stringNombre(xC)};${stringNombre(yC)})`,
              xC,
              yC - 0.5,
              'black',
              0,
              0,
              '',
            )

            objets.push(T, I, J, o)
            const XMIN =
              Math.min(
                Math.round(xA) - 1,
                Math.round(xB) - 1,
                Math.floor(xC),
                Math.round(xD),
                -1,
              ) - 1
            const YMIN =
              Math.min(
                Math.round(yA) - 1,
                Math.round(yB) - 1,
                Math.round(yC) - 1,
                Math.round(yD),
                -1,
              ) - 1
            const XMAX =
              Math.max(
                Math.ceil(xA),
                Math.ceil(xB),
                Math.ceil(xC),
                Math.ceil(xD),
                1,
              ) + 1
            const YMAX =
              Math.max(
                Math.round(yA),
                Math.round(yB),
                Math.round(yC),
                Math.round(yD),
                1,
              ) + 1
            objets.push(
              repere({
                xMin: XMIN,
                yMin: YMIN,
                xMax: XMAX,
                yMax: YMAX,
                yLabelEcart: 0.6,
                xLabelEcart: 0.6,
                yLabelDistance: 15,
                xLabelDistance: 15,
              }),
            )
            this.listeReponsesCourtes[i] = `$\\left(${texNombre(absReponse, 2)}\\,;\\,${texNombre(ordReponse, 2)}\\right)$`
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: absReponse },
              champ2: { value: ordReponse },
            })

            texte += mathalea2d(
              {
                xmin: XMIN,
                ymin: YMIN,
                xmax: XMAX,
                ymax: YMAX,
                pixelsParCm: 25,
                scale: 0.6,
                display: 'block',
              },
              objets,
              E,
              G,
              M,
            )
            if (this.interactif) {
              texte += remplisLesBlancs(
                this,
                i,
                `${D.nom}\\Bigg(%{champ1};%{champ2}\\Bigg)`,
              )
            }

            texteCorr = `Pour déterminer les coordonnées du point $T$, on utilise la propriété suivante : <br>
          «${sp()}Un parallélogramme a ses diagonales qui se coupent en leur milieu${sp()}». <br>
        Autrement dit, le milieu $M$ de $[EM]$ est aussi le milieu de $[GT]$ ;<br><br>
        ainsi : <br>
         $\\bullet$ On détermine les coordonnées du milieu $K$ de la diagonale $[EM]$. <br>
         $\\bullet$ On détermine les coordonnées du point $T$ de façon que $K$ soit aussi le milieu de $[GT]$.<br>${context.isHtml ? '<br>' : ''}`
            texteCorr += `<br> $K$ est le milieu de $[EM]$ : <br>${context.isHtml ? '<br>' : ''} `
            texteCorr += `$\\begin{cases}x_K=\\dfrac{x_E+x_M}{2}=
          \\dfrac{${texNombre(xA, 2)}+${ecritureParentheseSiNegatif(xC)}}{2}=\\dfrac{${texNombre(new Decimal(xA).add(xC), 1)}}{2}=${texNombre(new Decimal(xA).add(xC).div(2), 3)}\\\\[0.8em] y_M=\\dfrac{y_E+y_M}{2}= \\dfrac{${texNombre(yA, 2)}+${ecritureParentheseSiNegatif(yC)}}{2}=\\dfrac{${texNombre(new Decimal(yA).add(yC), 3)}}{2}=${texNombre(new Decimal(yA).add(yC).div(2), 3)}\\end{cases}$`
            texteCorr += `<br>${context.isHtml ? '<br>' : ''} Donc $K(${texNombre(xM, 2)}\\,;\\,${texNombre(yM, 2)})$.`
            texteCorr += `<br><br> $K$ est aussi le milieu de $[GT]$ : <br> ${context.isHtml ? '<br>' : ''} `
            texteCorr +=
              '$\\begin{cases}x_M=\\dfrac{x_G+x_T}{2}\\\\[0.5em]y_M=\\dfrac{y_G+y_T}{2}\\end{cases}$ '
            texteCorr += `$\\iff\\begin{cases}${texNombre(xM, 3)}=\\dfrac{${texNombre(xB)}+x_T}{2}\\\\[0.5em]${texNombre(yM, 3)}=\\dfrac{${texNombre(yB, 2)}+y_T}{2}\\end{cases}\\iff \\begin{cases}${texNombre(xB)}+x_T=2\\times ${ecritureParentheseSiNegatif(xM)} \\\\[0.5em] ${texNombre(yB)}+y_T=2\\times ${ecritureParentheseSiNegatif(yM)}\\end{cases}\\iff \\begin{cases}x_T=${texNombre(xM * 2, 2)} ${ecritureAlgebrique(-xB)} \\\\[0.5em] y_T=${texNombre(yM * 2, 2)}${ecritureAlgebrique(-yB)}\\end{cases}$`
            texteCorr += `<br>${context.isHtml ? '<br>' : ''}On en déduit : $\\begin{cases}x_T={${texNombre(xM * 2 - xB, 2)}}\\\\[0.5em]y_T=${texNombre(yM * 2 - yB, 2)}\\end{cases}$`
            texteCorr += `<br>${context.isHtml ? '<br>' : ''}Donc $T\\left( ${texNombre(xM * 2 - xB, 2)}\\,;\\,${texNombre(yM * 2 - yB, 2)}\\right)$.<br>
        `
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
