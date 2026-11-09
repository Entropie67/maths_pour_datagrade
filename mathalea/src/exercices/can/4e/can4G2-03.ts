import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { droite } from '../../../lib/2d/droites'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import {
  segment,
  segmentAvecExtremites,
} from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu, pointAdistance } from '../../../lib/2d/utilitairesPoint'
import { choice } from '../../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une longueur avec le théorème de Thalès'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication septembre 2021
*/
export const uuid = '61c07'

export const refs = {
  'fr-fr': ['can4G2-03', 'BP2AutoR12', '2G11-flash5'],
  'fr-ch': [],
}
export default class CalculLongueurThales extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let nom,
      a,
      b,
      c,
      k,
      A,
      B,
      C,
      D,
      E,
      G,
      H,
      xmin,
      xmax,
      ymin,
      ymax,
      objets,
      pol
    if (this.quotaChoice('cas', [true, false])) {
      nom = creerNomDePolygone(5, ['QD'])
      k = choice([1.5, 2, 2.5])
      b = randint(2, 5) //
      a = k * b
      c = randint(2, 5, b) //

      A = pointAbstrait(0, 0, nom[0], 'below right')
      B = pointAdistance(A, b, 40, nom[1])
      D = pointAdistance(A, a, 40, nom[3])
      C = pointAdistance(D, k * c, -40, nom[2], 'below right')
      E = pointAdistance(B, c, -40, nom[4], 'below right')
      G = pointAdistance(A, 0.7, 120)
      H = pointAdistance(D, 0.7, 120)
      pol = polygoneAvecNom(A, D, C)
      xmin = Math.min(A.x, B.x, C.x, D.x, E.x) - 1
      ymin = Math.min(A.y, B.y, C.y, D.y, E.y) - 1
      xmax = Math.max(A.x, B.x, C.x, D.x, E.x) + 1
      ymax = Math.max(A.y, B.y, C.y, D.y, E.y) + 1
      objets = []
      objets.push(pol[0]) //, pol[1]
      objets.push(
        droite(A, B),
        segment(B, E),
        droite(A, C),
        segment(D, C),
        segmentAvecExtremites(G, H),
        labelPoint(A, B, C, D, E),
      )
      objets.push(
        texteParPosition(
          `${stringNombre(a)}`,
          milieu(G, H).x,
          milieu(G, H).y + 0.9,
        ),
        texteParPosition(
          `${stringNombre(b)}`,
          milieu(A, B).x,
          milieu(A, B).y + 0.4,
        ),
        texteParPosition(
          `${stringNombre(c)}`,
          milieu(B, E).x,
          milieu(B, E).y + 0.3,
        ),
      )
      this.question = `Les droites $(${nom[1]}${nom[4]})$ et $(${nom[3]}${nom[2]})$ sont parallèles.<br>

        Calculer $${nom[3]}${nom[2]}$.<br>
        
        `
      this.question += mathalea2d(
        {
          xmin,
          ymin,
          xmax,
          ymax,
          pixelsParCm: 15,
          mainlevee: false,
          amplitude: 0.5,
          scale: 0.5,
          center: !context.isHtml,
        },
        objets,
      )
      this.correction = ` Le triangle $${nom[0]}${nom[3]}${nom[2]}$ est un agrandissement du triangle $${nom[0]}${nom[3]}${nom[2]}$.<br>
    Le coefficient d'agrandissement est donné par : $\\dfrac{${nom[0]}${nom[3]}}{${nom[0]}${nom[1]}}=\\dfrac{${texNombre(a)}}{${b}}=${texNombre(a / b)}$.<br>
    On en déduit que les longueurs du triangle $${nom[0]}${nom[3]}${nom[2]}$ sont $${texNombre(a / b)}$ fois plus grandes que celles du triangle $${nom[0]}${nom[1]}${nom[4]}$. <br>
        Ainsi, $${nom[3]}${nom[2]}=${texNombre(a / b)}\\times ${nom[1]}${nom[4]}=${texNombre(a / b)}\\times ${c}=${miseEnEvidence(texNombre((a * c) / b))}$.
                  <br>`
      this.reponse = (a * c) / b

      this.canReponseACompleter = `$${nom[3]}${nom[2]}=\\ldots$`
    } else {
      nom = creerNomDePolygone(5, ['QD'])
      k = choice([1.5, 2, 2.5])
      a = randint(2, 5) //
      b = randint(2, 5, a) //

      A = pointAbstrait(0, 0, nom[0], 'below right')
      B = pointAdistance(A, a, 40, nom[1])
      D = pointAdistance(A, k * a, 40, nom[3])
      C = pointAdistance(D, k * b, -40, nom[2], 'below right')
      E = pointAdistance(B, b, -40, nom[4], 'below right')
      pol = polygoneAvecNom(A, D, C)
      xmin = Math.min(A.x, B.x, C.x, D.x, E.x) - 1
      ymin = Math.min(A.y, B.y, C.y, D.y, E.y) - 1
      xmax = Math.max(A.x, B.x, C.x, D.x, E.x) + 1
      ymax = Math.max(A.y, B.y, C.y, D.y, E.y) + 1
      objets = []
      objets.push(pol[0]) //, pol[1]
      objets.push(
        droite(A, B),
        segment(B, E),
        droite(A, C),
        segment(D, C),
        labelPoint(A, B, C, D, E),
      )
      objets.push(
        texteParPosition(
          `${stringNombre(a)}`,
          milieu(A, B).x,
          milieu(A, B).y + 0.4,
        ),
        texteParPosition(
          `${stringNombre(k * b)}`,
          milieu(D, C).x + 0.6,
          milieu(D, C).y + 0.2,
        ),
        texteParPosition(
          `${stringNombre(b)}`,
          milieu(B, E).x + 0.6,
          milieu(B, E).y + 0.2,
        ),
      )
      this.question = `Les droites $(${nom[1]}${nom[4]})$ et $(${nom[3]}${nom[2]})$ sont parallèles. <br>

       Calculer $${nom[0]}${nom[3]}$.<br>
       
       `
      this.question += mathalea2d(
        {
          xmin,
          ymin,
          xmax,
          ymax,
          pixelsParCm: 15,
          mainlevee: false,
          amplitude: 0.5,
          scale: 0.5,
          center: !context.isHtml,
        },
        objets,
      )
      this.correction = ` Le triangle $${nom[0]}${nom[3]}${nom[2]}$ est un agrandissement du triangle $${nom[0]}${nom[3]}${nom[2]}$.<br>
   Le coefficient d'agrandissement est donné par : $\\dfrac{${nom[2]}${nom[3]}}{${nom[1]}${nom[4]}}=\\dfrac{${texNombre(k * b)}}{${b}}=${texNombre(k)}$.<br>
   On en déduit que les longueurs du triangle $${nom[0]}${nom[3]}${nom[2]}$ sont $${texNombre(k)}$ fois plus grandes que celles du triangle $${nom[0]}${nom[1]}${nom[4]}$. <br>
       Ainsi, $${nom[0]}${nom[3]}=${texNombre(k)}\\times ${nom[0]}${nom[1]}=${texNombre(k)}\\times ${a}=${miseEnEvidence(texNombre(k * a))}$.
                 <br>`
      this.reponse = k * a

      this.canReponseACompleter = `$${nom[0]}${nom[3]}=\\ldots$`
    }
  }
}
