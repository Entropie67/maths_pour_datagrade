import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { cercle } from '../../lib/2d/cercle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import {
  distancePointDroite,
  droiteParPointEtPente,
} from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { homothetie, projectionOrtho } from '../../lib/2d/transformations'
import { pointIntersectionLC } from '../../lib/2d/utilitairesPoint'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Mesurer la distance d'un point à une droite"

export const dateDePublication = '01/03/2023'

/**
 * Simple exercice de mesure de distance entre un point et une droite
 * @author Guillaume Valmont

*/
export const uuid = '29c3b'

export const refs = {
  'fr-fr': ['5G33-3'],
  'fr-2016': ['6G53'],
  'fr-ch': ['9R1ES1B-9', '9R2ES1B-9', '9R3ES1B-9', 'PRQMG05B-1'],
}
export default class MesurerDistancePointDroite extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const objetsEnonce = []
      const objetsCorrection = []
      const pente = randint(1, 3) * choice([-1, 1])
      const O = pointAbstrait(0, 0, '$(d)$', 'left')

      const d = droiteParPointEtPente(O, pente)
      let A = pointAbstrait(
        randint(-4, 4),
        randint(-3, 4),
        choisitLettresDifferentes(1, 'OH')[0],
      )
      while (distancePointDroite(A, d) < 1) {
        A = pointAbstrait(
          randint(-4, 4),
          randint(-3, 4),
          choisitLettresDifferentes(1, 'OH')[0],
        )
      }
      const c = cercle(O, 4)
      const H = projectionOrtho(A, d, 'H')
      let B = pointIntersectionLC(d, c, '(d)', 1)
      if ((B.x - H.x) ** 2 + (B.y - H.y) ** 2 < 2) {
        B = pointIntersectionLC(d, c, '(d)', 2)
      }
      B.positionLabel = 'right'
      const BPrime = homothetie(B, O, 10) // point éloigné de O pour codage angle droit afin que H et B soient distincts (JCL

      const traceA = tracePoint(A)
      traceA.taille = context.isHtml ? 2 : 1
      objetsEnonce.push(traceA, labelPoint(A, B), d)
      objetsCorrection.push(traceA, d)
      if (A.y > H.y) H.positionLabel = 'below'
      const segmentAH = segment(A, H)
      segmentAH.pointilles = 5
      const AH = polygoneAvecNom(A, H)
      objetsCorrection.push(
        AH[0],
        AH[1],
        afficheLongueurSegment(A, H),
        labelPoint(B),
        codageAngleDroit(A, H, BPrime),
      )
      const xmin = -5
      const xmax = 5
      const ymin = -4
      const ymax = 5
      const paramsEnonce = { xmin, ymin, xmax, ymax, pixelsParCm: 20, scale: 1 }
      texteCorr = '' + mathalea2d(paramsEnonce, objetsCorrection)
      texteCorr += `Pour mesurer la distance entre le point $${A.nom}$ et la droite ($d$) :<br>
      - on utilise l'équerre pour tracer la perpendiculaire à la droite ($d$) qui passe par le point $${A.nom}$<br>
      - si on nomme $${H.nom}$ le pied de la perpendiculaire, alors la distance entre le point $${A.nom}$ ; 
      et la droite ($d$) est la longueur $${A.nom + H.nom} = ${miseEnEvidence(`${texNombre(distancePointDroite(A, d), 1)}\\text{ cm}`)}$.`
      texte = `Mesurer la distance entre le point $${A.nom}$ et la droite ($d$).<br>`
      texte += mathalea2d(paramsEnonce, objetsEnonce)
      if (this.questionJamaisPosee(i, A.nom)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
