import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { droite } from '../../../lib/2d/droites'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea, orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Déterminer le coefficient directeur d'une droite (graphique)"
export const interactifReady = true

export const dateDePublication = '10/11/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 *
*/

export const uuid = '6082f'

export const refs = {
  'fr-fr': ['can2G30-02'],
  'fr-ch': [],
}
export default class CoeffDirDroite extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let xA,
      yA,
      xB,
      yB,
      o,
      A,
      B,
      Bx,
      sABx,
      sBBx,
      m,
      lA,
      traceA,
      lB,
      lABx,
      lBBx,
      traceB,
      d,
      r1,
      xmin,
      xmax,
      ymin,
      ymax,
      objet,
      objetC
    switch (
      this.quotaChoice('cas', [1, 2]) //, 2, 2
    ) {
      case 1:
        do {
          xA = randint(-4, -1)
          yA = randint(0, 4)
          xB = randint(2, 4)
          yB = randint(1, 4)
          A = pointAbstrait(xA, yA)
          B = pointAbstrait(xB, yB)
          Bx = pointAbstrait(B.x, A.y)
        } while (
          (A.x === Bx.x && A.y === Bx.y) ||
          (B.x === Bx.x && B.y === Bx.y)
        )
        sABx = segment(A, Bx)
        sBBx = segment(B, Bx)
        o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
        m = new FractionEtendue(yB - yA, xB - xA)
        sBBx.epaisseur = 2
        sBBx.pointilles = 5
        sABx.epaisseur = 2
        sABx.pointilles = 5
        lA = texteParPosition('A', xA, yA + 0.5, 0, 'black', 1)
        traceA = tracePoint(A, 'black') // Variable qui trace les points avec une croix
        lB = texteParPosition('B', xB, yB + 0.5, 0, 'black', 1)
        lABx = texteParPosition(
          `${xB - xA}`,
          milieu(A, Bx).x,
          A.y + 0.3,
          0,
          'red',
          1,
        )
        lBBx = texteParPosition(
          `${yB - yA}`,
          B.x + 0.5,
          milieu(B, Bx).y,
          0,
          bleuMathalea,
          1,
        )
        traceB = tracePoint(B, 'black') // Variable qui trace les points avec une croix
        d = droite(A, B, '', bleuMathalea)
        d.epaisseur = 2
        traceA.taille = 2
        traceA.epaisseur = 2
        traceB.taille = 2
        traceB.epaisseur = 2
        xmin = -5
        ymin = -1
        xmax = 5
        ymax = 5
        r1 = repere({
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
          yLabelEcart: 0.3,
          grilleSecondaire: true,
          grilleSecondaireYDistance: 1,
          grilleSecondaireXDistance: 1,
          grilleSecondaireYMin: ymin,
          grilleSecondaireYMax: ymax,
          grilleSecondaireXMin: xmin,
          grilleSecondaireXMax: xmax,
        })
        objet = mathalea2d(
          {
            xmin,
            xmax,
            ymin: ymin - 1,
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
        objetC = mathalea2d(
          {
            xmin,
            xmax,
            ymin: ymin - 1,
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

        this.question = 'Donner le coefficient directeur $m$ de la droite.<br>'
        this.question += `${objet}`
        this.optionsChampTexte = { texteAvant: '$m =$' }
        if (yB === yA) {
          this.correction = `La droite est horizontale. On en déduit que $m=${miseEnEvidence('0')}$.`
        } else {
          this.correction = `Le coefficient directeur $m$ de la droite $(AB)$ est donné par :<br><br>
            $m=\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{${yB}-${yA}}{${xB}-${ecritureParentheseSiNegatif(xA)}}=\\dfrac{${miseEnEvidence(yB - yA, bleuMathalea)}}{${miseEnEvidence(xB - xA, 'red')}}${m.estIrreductible && m.num * m.den > 0 ? `=${miseEnEvidence(m.texFraction)}` : m.texSimplificationAvecEtapes(false, orangeMathalea)}$.<br><br>`
          this.correction += `${objetC}`
        }
        break

      case 2:
        do {
          xA = randint(-4, 0)
          yA = randint(-5, 5) / 2
          xB = randint(1, 4)
          yB = randint(-5, 5, 0) / 2
        } while (yA !== xB)
        o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
        A = pointAbstrait(xA, yA)
        B = pointAbstrait(xB, yB)
        Bx = pointAbstrait(B.x, A.y)
        sABx = segment(A, Bx)
        sBBx = segment(B, Bx)
        m = new FractionEtendue(2 * (yB - yA), xB - xA)
        sBBx.epaisseur = 2
        sBBx.pointilles = 5
        sABx.epaisseur = 2
        sABx.pointilles = 5
        lA = texteParPosition('A', xA, yA + 0.5, 0, 'black', 1.5)
        traceA = tracePoint(A, 'black') // Variable qui trace les points avec une croix
        lB = texteParPosition('B', xB, yB + 0.5, 0, 'black', 1.5)
        if (yA > yB) {
          lABx = texteParPosition(
            `${xB - xA}`,
            milieu(A, Bx).x,
            A.y + 0.3,
            0,
            'red',
            1,
          )
        } else {
          lABx = texteParPosition(
            `${xB - xA}`,
            milieu(A, Bx).x,
            A.y - 0.3,
            0,
            'red',
            1,
          )
        }
        lBBx = texteParPosition(
          `${2 * (yB - yA)}`,
          B.x + 0.5,
          milieu(B, Bx).y,
          0,
          bleuMathalea,
          1,
        )
        traceB = tracePoint(B, 'black') // Variable qui trace les points avec une croix
        d = droite(A, B, '', bleuMathalea)
        d.epaisseur = 2
        traceA.taille = 2
        traceA.epaisseur = 2
        traceB.taille = 2
        traceB.epaisseur = 2
        xmin = -5
        ymin = -3
        xmax = 5
        ymax = 3
        r1 = repere({
          xMin: xmin,
          xMax: xmax,
          xUnite: 1,
          yMin: 2 * ymin,
          yMax: 2 * ymax,
          yUnite: 0.5,
          thickHauteur: 0.1,
          xLabelMin: xmin + 1,
          xLabelMax: xmax - 1,
          yLabelMax: 2 * ymax - 1,
          yLabelMin: 2 * ymin + 1,
          axeXStyle: '->',
          axeYStyle: '->',
          yLabelDistance: 2,
          yLabelEcart: 0.4,
          grilleXDistance: 1,
          grilleYDistance: 0.5,
        })
        objet = mathalea2d(
          {
            xmin,
            xmax,
            ymin: ymin - 1,
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
        objetC = mathalea2d(
          {
            xmin,
            xmax,
            ymin: ymin - 1,
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

        this.question = 'Donner le coefficient directeur $m$ de la droite.<br>'
        this.question += `${objet}`
        this.optionsChampTexte = { texteAvant: '$m =$' }
        if (yB === yA) {
          this.correction = `La droite est horizontale. On en déduit que $m=${miseEnEvidence('0')}$.`
        } else {
          this.correction = `Le coefficient directeur $m$ de la droite $(AB)$ est donné par :<br><br>
            $m=\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{${2 * yB}-${ecritureParentheseSiNegatif(2 * yA)}}{${xB}-${ecritureParentheseSiNegatif(xA)}}=\\dfrac{${miseEnEvidence(2 * (yB - yA), bleuMathalea)}}{${miseEnEvidence(xB - xA, 'red')}}${m.estIrreductible && m.num * m.den > 0 ? `=${miseEnEvidence(m.texFraction)}` : m.texSimplificationAvecEtapes(false, orangeMathalea)}$.<br><br>`
          this.correction += `${objetC}`
        }
        break
    }

    this.canReponseACompleter = '$m=\\ldots$'
    this.reponse = m
  }
}
