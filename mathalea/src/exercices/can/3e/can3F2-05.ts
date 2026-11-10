import { courbe } from '../../../lib/2d/Courbe'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Déterminer une ordonnée/abscisse avec une fonction linéaire'
export const interactifReady = true

export const dateDePublication = '02/11/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 *
*/

export const uuid = 'bf9f2'

export const refs = {
  'fr-fr': ['can3F2-05', 'can2F20-08', '2F30-flash1'],
  'fr-ch': [],
}
export default class OrdonneeAbscisseFonctionLineaire extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let xA, yB
    const a = this.quotaChoice('a', [0.5, 1.5, 2, 2.5, 3, 3.5, 4])
    if (a === 0.5 || a === 1.5 || a === 2) {
      xA = choice([2, 4])
    } else {
      xA = 2
    }
    const yA = a * xA
    const f = (x: number) => a * x
    const xB = this.quotaRandint('xB', 5, 10)
    if (a === 0.5) {
      yB = randint(6, 10) * 2
    } else if (a === 1.5) {
      yB = randint(6, 10) * 3
    } else if (a === 2.5) {
      yB = randint(3, 10) * 5
    } else if (a === 3.5) {
      yB = randint(2, 5) * 7
    } else {
      yB = randint(5, 10) * a
    }
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const A = pointAbstrait(xA, 0.5 * yA)
    const Ax = pointAbstrait(A.x, 0)
    const Ay = pointAbstrait(0, A.y)
    const sAAx = segment(A, Ax)
    sAAx.epaisseur = 2
    sAAx.pointilles = 5
    const sAAy = segment(A, Ay)
    sAAy.epaisseur = 2
    sAAy.pointilles = 5
    const lA = latex2d('A', xA, 0.5 * yA + 0.5, { letterSize: 'scriptsize' })
    const traceA = tracePoint(A, 'black') // Variable qui trace les points avec une croix
    traceA.taille = 4
    traceA.epaisseur = 2
    const xmin = -1
    const ymin = -1
    const xmax = 5
    const ymax = A.y + 1
    const r1 = repere({
      xMin: xmin,
      xMax: xmax,
      xUnite: 1,
      yMin: ymin,
      yMax: 2 * ymax,
      yUnite: 0.5,
      thickHauteur: 0.1,
      xLabelMin: xmin + 1,
      xLabelMax: xmax - 1,
      yLabelMax: 2 * ymax - 1,
      yLabelMin: ymin + 1,
      axeXStyle: '->',
      axeYStyle: '->',
      yLabelDistance: 1,
      yLabelEcart: 0.3,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 0.5,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: 2 * ymin,
      grilleSecondaireYMax: 2 * ymax,
      grilleSecondaireXMin: xmin,
      grilleSecondaireXMax: xmax,
    })
    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin,
        ymax,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      courbe(f, { repere: r1, color: bleuMathalea, epaisseur: 2 }),
      r1,
      lA,
      traceA,
      o,
      sAAx,
      sAAy,
    )
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1: //
        this.question = `$B(${xB}\\,;\\, \\ldots)$ est un point de la droite $(OA)$.<br>
        Quelle est son ordonnée ?<br>
        `
        this.question += `${objet}`

        this.correction = `La fonction représentée est une fonction linéaire.<br>
        Il y a donc une proportionnalité entre les abscisses et les ordonnées des points de la droite.<br>
        L'abscisse du point $A$ est $${xA}$ et son ordonnée $${yA}$. Les ordonnées des points s'obtiennent en multipliant par $${texNombre(a, 1)}$ les abscisses.<br>
        L'abscisse du point $B$ étant $${xB}$, son ordonnée est $${xB}\\times ${texNombre(a, 1)}=${miseEnEvidence(`${texNombre(a * xB, 1)}`)}$.`
        this.canEnonce = 'Compléter.<br>'
        this.canEnonce += `${objet}`
        this.canReponseACompleter = `$B(${xB}\\,;\\,\\ldots) \\in (OA)$`
        this.reponse = a * xB

        break
      case 2: //
        this.question = `$B(\\ldots\\,;\\, ${yB})$ est un point de la droite $(OA)$.<br>
        Quelle est son abscisse ?<br>
        `
        this.question += `${objet}`

        this.correction = `La fonction représentée est une fonction linéaire.<br>
        Il y a donc une proportionnalité entre les abscisses et les ordonnées des points de la droite.<br>
        L'abscisse du point $A$ est $${xA}$ et son ordonnée $${yA}$. Les abscisses respectives des points s'obtiennent en divisant par $${texNombre(a, 1)}$ les ordonnées.<br>`
        if (a === 0.5) {
          this.correction += `Diviser par $${texNombre(a, 1)}$ (soit par $\\dfrac{1}{2}$) revient à multiplier par $2$.<br>
        Ainsi, l'abscisse du point $B$ est donnée par $${yB}\\times 2=${miseEnEvidence(yB / a)}$.`
        } else if (a === 1.5) {
          this.correction += `Diviser par $${texNombre(a, 1)}$ (soit par $\\dfrac{3}{2}$) revient à multiplier par $3$ puis diviser par $2$.<br>
        Ainsi, l'abscisse du point $B$ est donnée par $(${yB}\\times 2)\\div 3=${miseEnEvidence(yB / a)}$.`
        } else if (a === 2.5) {
          this.correction += `Diviser par $${texNombre(a, 1)}$ (soit par $\\dfrac{5}{2}$) revient à multiplier par $2$ puis diviser par $5$.<br>
        Ainsi, l'abscisse du point $B$ est donnée par $(${yB}\\times 2)\\div 5=${miseEnEvidence(yB / a)}$.`
        } else if (a === 3.5) {
          this.correction += `Diviser par $${texNombre(a, 1)}$ (soit par $\\dfrac{7}{2}$) revient à multiplier par $2$ puis diviser par $7$.<br>
        Ainsi, l'abscisse du point $B$ est donnée par $(${yB}\\times 2)\\div 7=${miseEnEvidence(yB / a)}$.`
        } else {
          this.correction += `Ainsi, l'abscisse du point $B$ est donnée par $${yB}\\div ${a}=${miseEnEvidence(yB / a)}$. `
        }

        this.reponse = yB / a
        this.canEnonce = 'Compléter.<br> '
        this.canEnonce += `${objet}`
        this.canReponseACompleter = `$B(\\ldots\\,;\\, ${yB}) \\in (OA)$`
        break
    }
  }
}
