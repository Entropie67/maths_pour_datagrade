import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { symboleParallele } from '../../../lib/outils/notationsGeometrie'
import { codageSegments } from '../../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une longueur avec le théorème de Thalès (milieu)'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication septembre 2021
*/
export const uuid = 'ae712'

export const refs = {
  'fr-fr': ['can4G2-04', 'BP2AutoR13'],
  'fr-ch': [],
}
export default class CalculLongueurThalesMilieu extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, A, B, C, D, E, objets, nom
    if (this.quotaChoice('sens', [true, false])) {
      nom = creerNomDePolygone(5, ['QD'])
      a = randint(1, 9) + randint(1, 5) / 10 + randint(1, 9) / 100

      A = pointAbstrait(0, 0, nom[0], 'below')
      B = pointAbstrait(6, 0, nom[1], 'below')
      C = pointAbstrait(5, 4, nom[2], 'above')
      D = pointAbstrait(2.5, 2, nom[3], 'above')
      E = pointAbstrait(3, 0, nom[4], 'below')
      objets = []
      objets.push(
        segment(A, B),
        segment(D, E),
        segment(A, C),
        segment(B, C),
        codageSegments('||', bleuMathalea, A, D, D, C),
        labelPoint(A, B, C, D, E),
      )

      this.question = `$(${nom[3]}${nom[4]})${symboleParallele()}(${nom[1]}${nom[2]})$ et
      $${nom[3]}${nom[4]}=${texNombre(a)}$.<br>

      Calculer $${nom[1]}${nom[2]}$.<br>

     `
      this.question += mathalea2d(
        {
          xmin: -1,
          ymin: -1,
          xmax: 8,
          ymax: 5,
          pixelsParCm: 18,
          mainlevee: false,
          amplitude: 0.5,
          center: !context.isHtml,
        },
        objets,
      )
      this.correction = ` Les longueurs du triangle $${nom[0]}${nom[1]}${nom[2]}$ sont $2$ fois plus grandes que les longueurs du triangle $${nom[0]}${nom[3]}${nom[4]}$.<br>
      Le triangle $${nom[0]}${nom[1]}${nom[2]}$ est un agrandissement du triangle $${nom[0]}${nom[3]}${nom[4]}$.<br>
      Ainsi : $${nom[1]}${nom[2]}=2\\times ${nom[3]}${nom[4]}=2\\times ${texNombre(a)}=${miseEnEvidence(texNombre(2 * a))}$.
  `

      this.reponse = texNombre(2 * a)

      this.canReponseACompleter = `$${nom[1]}${nom[2]}=\\ldots$`
    } else {
      nom = creerNomDePolygone(5, ['QD'])
      a = (randint(1, 9) + randint(1, 5) / 10) * 2
      A = pointAbstrait(0, 0, nom[0], 'below')
      B = pointAbstrait(6, 0, nom[1], 'below')
      C = pointAbstrait(5, 4, nom[2], 'above')
      D = pointAbstrait(2.5, 2, nom[3], 'above')
      E = pointAbstrait(3, 0, nom[4], 'below')
      objets = []
      objets.push(
        segment(A, B),
        segment(D, E),
        segment(A, C),
        segment(B, C),
        codageSegments('||', bleuMathalea, A, D, D, C),
        labelPoint(A, B, C, D, E),
      )

      this.question = `$(${nom[3]}${nom[4]})${symboleParallele()}(${nom[1]}${nom[2]})$ et
       $${nom[1]}${nom[2]}=${texNombre(a)}$. <br>

         Calculer $${nom[3]}${nom[4]}$.<br>
         
         `
      this.question += mathalea2d(
        {
          xmin: -1,
          ymin: -1,
          xmax: 8,
          ymax: 5,
          pixelsParCm: 18,
          mainlevee: false,
          amplitude: 0.5,
          center: !context.isHtml,
        },
        objets,
      )
      this.correction = ` Les longueurs du triangle $${nom[0]}${nom[3]}${nom[4]}$ sont $2$ fois plus petites que les longueurs du triangle $${nom[0]}${nom[1]}${nom[2]}$.<br>
      Le triangle $${nom[0]}${nom[3]}${nom[4]}$ est une réduction du triangle $${nom[0]}${nom[1]}${nom[2]}$. <br>
            Ainsi : $${nom[3]}${nom[4]}= ${nom[1]}${nom[2]} \\div 2 = ${texNombre(a)}\\div 2 =${miseEnEvidence(texNombre(a / 2))}$.
     `

      this.reponse = texNombre(a / 2)

      this.canReponseACompleter = `$${nom[3]}${nom[4]}=\\ldots$`
    }
  }
}
