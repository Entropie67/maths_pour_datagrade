import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, latex2d } from '../../../lib/2d/textes'
import { milieu, pointAdistance } from '../../../lib/2d/utilitairesPoint'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer une longueur avec le théorème de Thalès (agrandissement/réduction)'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication sptembre 2021
*/
export const uuid = '14145'

export const refs = {
  'fr-fr': ['can3G2-01', 'BP2AutoR11'],
  'fr-ch': ['NR'],
}
export default class CalculLongueurThales2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.spacingCorr = 1.5
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let nom, a, b, c, k, A, B, C, D, E, objets
    if (this.quotaChoice('cas', [true, false])) {
      nom = creerNomDePolygone(5, ['QD'])
      k = choice([1.5, 2, 2.5])
      b = randint(2, 5) * 2 //
      a = k * b
      c = randint(2, 6, b) //

      A = pointAbstrait(0, 0, nom[0], 'above')
      B = pointAdistance(A, b, -30, nom[1], 'below')
      C = pointAdistance(B, c, 110, nom[2], 'above')

      D = pointAdistance(A, a, 150, nom[3], 'above')
      E = pointAdistance(D, k * c, -70, nom[4], 'below')

      // pol = polygoneAvecNom(A, D, C)
      objets = []
      objets.push(
        segment(B, D),
        segment(D, E),
        segment(C, E),
        segment(B, C),
        labelPoint(A, B, C, D, E),
      )
      objets.push(
        latex2d(`${texNombre(b)}`, milieu(A, B).x, milieu(A, B).y - 0.7, {
          letterSize: 'scriptsize',
        }),
        latex2d(`${texNombre(c)}`, milieu(B, C).x + 0.5, milieu(B, C).y, {
          letterSize: 'scriptsize',
        }),
        latex2d(`${texNombre(a)}`, milieu(A, D).x + 0.5, milieu(A, D).y + 0.5, {
          letterSize: 'scriptsize',
        }),
      )
      this.question = `Les droites $(${nom[1]}${nom[2]})$ et $(${nom[3]}${nom[4]})$ sont parallèles.
      
      Calculer $${nom[3]}${nom[4]}$.<br>
      
      `
      this.correction = ` Les droites $(${nom[1]}${nom[2]})$ et $(${nom[3]}${nom[4]})$ sont parallèles, donc les triangles $${nom[0]}${nom[1]}${nom[2]}$ et $${nom[0]}${nom[3]}${nom[4]}$ sont en configuration de Thalès.<br>
      Le triangle $${nom[0]}${nom[3]}${nom[4]}$ est donc un agrandissement du triangle $${nom[0]}${nom[1]}${nom[2]}$.<br>
    Le coefficient d'agrandissement est donné par : $\\dfrac{${nom[0]}${nom[3]}}{${nom[0]}${nom[1]}}=\\dfrac{${texNombre(a)}}{${b}}=${texNombre(a / b)}$.<br>
    On en déduit que les longueurs du triangle $${nom[0]}${nom[3]}${nom[4]}$ sont $${texNombre(a / b)}$ fois plus grandes que les longueurs du triangle $${nom[0]}${nom[1]}${nom[2]}$. <br>
        Ainsi, $${nom[3]}${nom[4]}=${texNombre(a / b)}\\times ${c}=${miseEnEvidence(texNombre((a * c) / b))}$.
                `
      this.reponse = (a * c) / b
      this.canReponseACompleter = `$${nom[3]}${nom[4]}=\\ldots$`
    } else {
      nom = creerNomDePolygone(5, ['QD'])
      k = choice([1.5, 2, 2.5])
      b = randint(2, 5) * 2 //
      a = k * b
      c = randint(2, 6, b) //

      A = pointAbstrait(0, 0, nom[0], 'above')
      B = pointAdistance(A, c, -30, nom[1], 'below')
      C = pointAdistance(B, b, 110, nom[2], 'above')

      D = pointAdistance(A, k * c, 150, nom[3], 'above')
      E = pointAdistance(D, a, -70, nom[4], 'below')

      // pol = polygoneAvecNom(A, D, C)
      objets = []
      objets.push(
        segment(B, D),
        segment(D, E),
        segment(C, E),
        segment(B, C),
        labelPoint(A, B, C, D, E),
      )
      objets.push(
        latex2d(`${texNombre(b)}`, milieu(B, C).x + 0.5, milieu(B, C).y, {
          letterSize: 'scriptsize',
        }),
        latex2d(`${texNombre(c)}`, milieu(A, B).x, milieu(A, B).y - 0.5, {
          letterSize: 'scriptsize',
        }),
        latex2d(`${texNombre(a)}`, milieu(D, E).x - 0.8, milieu(D, E).y, {
          letterSize: 'scriptsize',
        }),
      )
      this.question = `Les droites $(${nom[1]}${nom[2]})$ et $(${nom[3]}${nom[4]})$ sont parallèles.<br>
      
      Calculer $${nom[3]}${nom[0]}$.<br>

      `
      this.correction = ` Le triangle $${nom[0]}${nom[3]}${nom[4]}$ est un agrandissement du triangle $${nom[0]}${nom[1]}${nom[2]}$.<br>
       Le coefficient d'agrandissement est donné par : $\\dfrac{${nom[3]}${nom[4]}}{${nom[2]}${nom[1]}}=\\dfrac{${texNombre(a)}}{${b}}=${texNombre(a / b)}$.<br>
       On en déduit que les longueurs du triangle $${nom[0]}${nom[3]}${nom[4]}$ sont $${texNombre(a / b)}$ fois plus grandes que les longueurs du triangle $${nom[0]}${nom[1]}${nom[2]}$. <br>
           Ainsi, $${nom[3]}${nom[0]}=${texNombre(a / b)}\\times ${c}=${miseEnEvidence(texNombre((a * c) / b))}$.
                     <br>`
      this.reponse = (a * c) / b
      this.canReponseACompleter = `$${nom[3]}${nom[0]}=\\ldots$`
    }

    this.question += mathalea2d(
      Object.assign(
        {},
        fixeBordures(objets, {
          rxmin: -0.1 * c,
          rymin: -0.75 * c,
          rxmax: 0.1 * c,
          rymax: 0.1 * c,
        }),
        {
          pixelsParCm: 15,
          mainlevee: false,
          amplitude: 0.5,
          scale: 0.2,
          center: !context.isHtml,
        },
      ),
      objets,
    )
  }
}
