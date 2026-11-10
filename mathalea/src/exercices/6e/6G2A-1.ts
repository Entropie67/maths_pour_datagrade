import { miseEnEvidence } from '../../lib/outils/embellissements'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { tracePointSurDroite } from '../../lib/2d/TracePointSurDroite'
import { cercle } from '../../lib/2d/cercle'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { rotation } from '../../lib/2d/transformations'
import { milieu, pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre =
  "Trouver la longueur d'un segment quand on connaît sa moitié (rayon, diamètre, milieu), et inversement"
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'
export const dateDePublication = '08/10/2025'
export const dateDeModificationImportante = '19/10/2025'

/**
 * Calculer un rayon quand on connaît un diamètre, et inversement
 * @author Mireille Gain
 */
export const uuid = '4d9ca'

export const refs = {
  'fr-fr': ['6G2A-1'],
  'fr-ch': ['10CTGM1A-2', '10LCGM1A-2', '10LSGM1A-2'],
}
export default class RayonDiametreMilieu extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1: Avec rayon et diamètre\n2: Avec un milieu\n3: Mélange',
    ]
    this.sup = 1
    this.besoinFormulaire2CaseACocher = ['Avec un schéma', false]
    this.sup2 = false
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1, 2]
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [3, 4]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 4]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let reponse: number
      let texte = ''
      let texteCorr = ''
      const [lettre1, lettre2, lettre3] = Array.from(creerNomDePolygone(3))
      const longueurSegment = randint(11, 49)
      const fig: NestedObjetMathalea2dArray = []
      switch (listeTypeDeQuestions[i]) {
        case 1: // Diamètre
          {
            texte = `Si le rayon d'un cercle mesure $${longueurSegment}\\text{ cm}$, alors son diamètre mesure`
            texteCorr = `Si le rayon d'un cercle mesure $${longueurSegment}\\text{ cm}$ alors son diamètre mesure $${miseEnEvidence(longueurSegment * 2)}\\text{ cm}$.`
            reponse = longueurSegment * 2
            const point1 = pointAbstrait(0, 0, lettre1, 'left')
            const point2 = rotation(
              pointAbstrait(3, 0),
              point1,
              randint(-20, 20),
              lettre2,
              'right',
            )
            const segMent = segment(point1, point2)
            const cRayon = cercle(point1, segMent.longueur)
            cRayon.epaisseur = 2
            const labels = labelPoint(point1, point2)
            const légende = placeLatexSurSegment(
              `${longueurSegment}\\text{ cm}`,
              point1,
              point2,
              { distance: -0.5 },
            )
            fig.push(cRayon, segMent, labels, légende, tracePoint(point1))
          }
          break
        case 3: // La moitié à partir du segment
          {
            texte = `Si $${lettre1}$ est le milieu de $[${lettre2}${lettre3}]$ et $${lettre2}${lettre3}=${longueurSegment * 2}\\text{ cm}$, alors $[${lettre2}${lettre1}]$ mesure`
            texteCorr = `Si $${lettre1}$ est le milieu de $[${lettre2}${lettre3}]$ et $${lettre2}${lettre3}=${longueurSegment * 2}\\text{ cm}$, alors $[${lettre2}${lettre1}]$ mesure $${miseEnEvidence(longueurSegment)}\\text{ cm}$.`
            reponse = longueurSegment
            const point1 = pointAbstrait(0, 0, lettre2, 'left')
            const point2 = rotation(
              pointAbstrait(6, 0),
              point1,
              randint(-20, 20),
              lettre3,
              'right',
            )
            const segMent = segment(point1, point2)
            segMent.styleExtremites = '|-|'
            const middle = pointSurSegment(
              point1,
              point2,
              segMent.longueur / 2,
              lettre1,
              'below',
            )
            const labels = labelPoint(point1, point2, middle)

            fig.push(
              segMent,
              labels,
              tracePointSurDroite(middle, droite(point1, point2)),
              codageSegments('//', 'black', point1, middle, middle, point2),
            )
          }
          break
        case 4: // Le segment à partir de sa moitié
          {
            texte = `$${lettre1}$ est le milieu de $[${lettre2}${lettre3}]$ et $${lettre2}${lettre1}=${longueurSegment}\\text{ cm}$, alors $[${lettre2}${lettre3}]$ mesure`
            reponse = longueurSegment * 2
            texteCorr = `$${lettre1}$ est le milieu de $[${lettre2}${lettre3}]$ et $${lettre2}${lettre1}=${longueurSegment}\\text{ cm}$, alors $[${lettre2}${lettre3}]$ mesure $${miseEnEvidence(longueurSegment * 2)}\\text{ cm}$.`
            const point1 = pointAbstrait(0, 0, lettre2, 'left')
            const point2 = rotation(
              pointAbstrait(6, 0),
              point1,
              randint(-20, 20),
              lettre3,
              'right',
            )
            const segMent = segment(point1, point2)
            segMent.styleExtremites = '|-|'
            const middle = pointSurSegment(
              point1,
              point2,
              segMent.longueur / 2,
              lettre1,
              'below',
            )
            const labels = labelPoint(point1, point2, middle)
            /* const légende = placeLatexSurSegment(
              `${longueurSegment}\\text{ cm}`,
              point1,
              middle,
              { distance: -0.5 },
            )
              */
            fig.push(
              segMent,
              labels,
              tracePointSurDroite(middle, droite(point1, point2)),
              codageSegments('//', 'black', point1, middle, middle, point2),
            )
          }
          break
        default:
          {
            // case 2 Rayon
            texte = `Si le diamètre d'un cercle mesure $${longueurSegment * 2}\\text{ cm}$, alors son rayon mesure`
            texteCorr = `Si le diamètre d'un cercle mesure $${longueurSegment * 2}\\text{ cm}$, alors son rayon mesure $${miseEnEvidence(longueurSegment)}\\text{ cm}$.`
            reponse = longueurSegment
            const point1 = pointAbstrait(0, 0, lettre1, 'left')
            const point2 = rotation(
              pointAbstrait(6, 0),
              point1,
              randint(-20, 20),
              lettre2,
              'right',
            )
            const segMent = segment(point1, point2)
            const centre = milieu(point1, point2)
            const cRayon = cercle(centre, segMent.longueur / 2)
            cRayon.epaisseur = 2
            const labels = labelPoint(point1, point2)
            const légende = placeLatexSurSegment(
              `${longueurSegment * 2}\\text{ cm}`,
              point1,
              point2,
              { distance: -0.5 },
            )
            fig.push(
              cRayon,
              segMent,
              labels,
              légende,
              tracePointSurDroite(centre, droite(point1, point2)),
            )
          }
          break
      }
      handleAnswers(this, i, { reponse: { value: reponse } })

      if (!this.interactif) {
        texte += ' $\\ldots$ '
      }
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteApres: ' $\\text{cm}$',
        })
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
        this.listeQuestions[i] = texte
        if (fig.length > 0 && this.sup2) {
          this.listeQuestions[i] += mathalea2d(
            Object.assign({}, fixeBordures(fig)),
            fig,
          )
        }
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
