import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { droite } from '../../../lib/2d/droites'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Déterminer le coefficient directeur d'une droite"
export const interactifReady = true

export const uuid = '58656'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025TQ19 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.formatInteractif = 'fillInTheBlank'
    this.canOfficielle = true
  }

  nouvelleVersion() {
    let lABx
    const xA = 0
    const yA = this.canOfficielle ? 1 : randint(1, 3)
    const xB = this.canOfficielle ? 3 : 3
    const yB = this.canOfficielle ? 3 : randint(-2, 2, [0, yA])
    const o = latex2d('\\text{O}', -0.2, -0.3, {
      color: 'black',
      letterSize: 'scriptsize',
      backgroundColor: '',
    })
    const A = pointAbstrait(xA, yA)
    const B = pointAbstrait(xB, yB)
    const Bx = pointAbstrait(B.x, A.y)
    const sABx = segment(A, Bx)
    const sBBx = segment(B, Bx)
    const m = new FractionEtendue(yB - yA, xB - xA)
    sBBx.epaisseur = 2
    sBBx.pointilles = 5
    sABx.epaisseur = 2
    sABx.pointilles = 5
    const lA = latex2d('A', xA + 0.1, yA - 0.2, {
      color: 'black',
      backgroundColor: '',
    })
    const traceA = tracePoint(A, 'black') // Variable qui trace les points avec une croix
    const lB = latex2d('B', xB, yB + 0.5, {
      color: 'black',
      backgroundColor: '',
    })
    if (yA > yB) {
      lABx = latex2d(`${xB - xA}`, milieu(A, Bx).x, A.y + 0.3, {
        color: 'red',
        backgroundColor: '',
      })
    } else {
      lABx = latex2d(`${xB - xA}`, milieu(A, Bx).x, A.y - 0.3, {
        color: 'red',
        backgroundColor: '',
      })
    }
    const lBBx = latex2d(`${yB - yA}`, B.x + 0.5, milieu(B, Bx).y, {
      color: bleuMathalea,
      backgroundColor: '',
    })
    const traceB = tracePoint(B, 'black') // Variable qui trace les points avec une croix
    const d = droite(A, B, '', bleuMathalea)
    d.epaisseur = 2
    traceA.taille = 2
    traceA.epaisseur = 2
    traceB.taille = 2
    traceB.epaisseur = 2
    const xmin = -5
    const ymin = Math.min(yA, yB, 0) - 1
    const xmax = 5
    const ymax = Math.max(yA, yB, 0) + 1
    const r1 = repere({
      xMin: xmin,
      xMax: xmax,
      xUnite: 1,
      yMin: ymin,
      yMax: ymax,
      yUnite: 1,
      thickHauteur: 0.1,
      xLabelMin: xmin + 1,
      xLabelMax: xmax - 1,
      yLabelMax: ymax - 1,
      yLabelMin: ymin + 1,
      axeXStyle: '->',
      axeYStyle: '->',
      yLabelDistance: 1,
      yLabelEcart: 0.4,
      grilleXDistance: 1,
      grilleYDistance: 1,
    })
    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin,
        ymax: ymax + 0.25,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      r1,
      traceA,
      lA,
      lB,
      traceB,
      o,
    )
    const objetC = mathalea2d(
      {
        xmin,
        xmax,
        ymin,
        ymax: ymax + 0.25,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      r1,
      traceA,
      lA,
      lB,
      traceB,
      o,
      sABx,
      sBBx,
      lABx,
      lBBx,
    )
    this.consigne = 'Équation réduite de cette droite.'
    this.introduction = objet
    this.question = 'y=%{champ1} x+%{champ2}'
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: new FractionEtendue(yB - yA, 3).texFraction },
      champ2: { value: yA },
    }

    this.correction = `Le coefficient directeur $m$ de la droite $(AB)$ est donné par :<br><br>
            $m=\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{${yB}-${ecritureParentheseSiNegatif(yA)}}{${xB}-${ecritureParentheseSiNegatif(xA)}}=\\dfrac{${miseEnEvidence(yB - yA, bleuMathalea)}}{${miseEnEvidence(xB - xA, 'red')}}$.<br>
            Son ordonnée à l'origine est $${yA}$.<br>
            Ainsi, $y=${miseEnEvidence(`${m.texFraction}`)}x+${miseEnEvidence(`${yA}`)}$.`
    this.correction += `${objetC}`
    this.canEnonce = `${objet}`
    this.canReponseACompleter = `Équation réduite de cette droite : <br> \\vspace{5mm}
    $y=\\dfrac{\\ldots}{\\ldots} x+\\ldots$`
  }
}
