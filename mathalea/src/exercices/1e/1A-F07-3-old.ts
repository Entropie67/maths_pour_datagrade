// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 5b9d0 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { droite } from '../../lib/2d/droites'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
/**
 * @author Gilles Mora
 *
 */
export const uuid = '5b9d0'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer le coefficient directeur d'une droite à partir de sa représentation graphique"
export const dateDePublication = '10/07/2025'

export default class Auto1AF6cOld extends ExerciceQcmA {
  /**
   * Génère l'exercice avec les coordonnées données
   */
  private genererExercice(
    xA: number,
    yA: number,
    xB: number,
    yB: number,
  ): void {
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const A = pointAbstrait(xA, yA)
    const B = pointAbstrait(xB, yB)
    const Bx = pointAbstrait(B.x, A.y)
    const sABx = A.x !== Bx.x || A.y !== Bx.y ? segment(A, Bx) : vide2d()
    const sBBx = B.x !== Bx.x || B.y !== Bx.y ? segment(B, Bx) : vide2d()
    const maFraction = new FractionEtendue(yB - yA, xB - xA)

    sBBx.epaisseur = 2
    sBBx.pointilles = 5
    sABx.epaisseur = 2
    sABx.pointilles = 5

    const lA = latex2d('A', xA, yA + 0.5, { letterSize: 'scriptsize' })
    const traceA = tracePoint(A, 'black')
    traceA.taille = 3
    traceA.epaisseur = 2

    const lB = latex2d('B', xB, yB + 0.5, { letterSize: 'scriptsize' })
    const traceB = tracePoint(B, 'black')
    traceB.taille = 3
    traceB.epaisseur = 2

    const lABx = latex2d(`${xB - xA}`, milieu(A, Bx).x, A.y + 0.3, {
      color: 'red',
      letterSize: 'scriptsize',
    })
    const lBBx = latex2d(`${yB - yA}`, B.x + 0.5, milieu(B, Bx).y, {
      color: bleuMathalea,
      letterSize: 'scriptsize',
    })

    const d = droite(A, B, '', bleuMathalea)
    d.epaisseur = 2

    const xmin = -6
    const ymin = -1
    const xmax = 6
    const ymax = 6

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
      yLabelEcart: 0.3,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 0.1,
      grilleSecondaireXDistance: 0.1,
      grilleSecondaireOpacite: 0.1,
      grilleSecondaireYMin: ymin - 0.1,
      grilleSecondaireYMax: ymax + 0.1,
      grilleSecondaireXMin: xmin - 0.1,
      grilleSecondaireXMax: xmax + 0.1,
    })

    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin: ymin - 0.25,
        ymax: ymax + 0.25,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      r1,
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

    this.enonce = `Dans un repère du plan, on a représenté une droite.<br><br>
      ${objet}<br>
      Le coefficient directeur de cette droite est égal  à :`

    if (yB === yA) {
      this.correction = `La droite est horizontale. On en déduit que son coefficient directeur est $m=${miseEnEvidence('0')}$.<br>`
      this.reponses = [
        '$0$',
        `${yA !== 1 && yA !== -1 ? `$${yA}$` : '$2$'}`,
        '$1$',
        '$-1$',
      ]
    } else {
      this.correction = `En prenant deux points sur la droite, on obtient :<br>
     
    $m=\\dfrac{${miseEnEvidence(yB - yA, bleuMathalea)}}{${miseEnEvidence(xB - xA, 'red')}}=${miseEnEvidence(`${maFraction.texFractionSimplifiee}`)}$`
      this.correction += `<br>${objetC}<br>`
      this.reponses = [
        `$${maFraction.texFractionSimplifiee}$`,
        `${Math.abs((yB - yA) / (xB - xA)) !== 1 ? `$${maFraction.inverse().texFractionSimplifiee}$` : '$0$'}`,
        `$${maFraction.oppose().texFractionSimplifiee}$`,
        `${(yB - yA) / (xB - xA) !== yA ? `$${yA}$` : `$${xB}$`}`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.genererExercice(0, 2, 1, -1)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0 // un compteur pour éviter les boucles infinies si le qcm est vraiment problématique
    do {
      const xA = 0
      const yA = randint(1, 5)
      const xB = randint(-5, 5, 0)
      const yB = randint(0, 6)
      this.genererExercice(xA, yA, xB, yB)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
    // Ici, on doit avoir une bonne réponse et 3 distracteurs distincts.
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
