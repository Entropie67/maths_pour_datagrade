import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { codageSegment } from '../../../lib/2d/CodageSegment'
import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une aire'
export const interactifReady = true

export const uuid = '5dcca'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: '.' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let reponse: number
    const a = randint(1, 3)
    const b = this.canOfficielle ? 4 : randint(2, 5)
    const c = this.canOfficielle ? 8 : a + b
    const f = (a * b) / 2
    const A = pointAbstrait(0, 0, 'A', 'below')
    const B = pointAbstrait(5, 0, 'B', 'below')
    const C = this.canOfficielle
      ? pointAbstrait(5, 2.5, 'C', 'above')
      : pointAbstrait(5, 3, 'C', 'above')
    const D = this.canOfficielle
      ? pointAbstrait(2.5, 2.5, 'D', 'above')
      : pointAbstrait(2, 3, 'D', 'above')
    const E = this.canOfficielle
      ? pointAbstrait(0, 2.5, 'E', 'above')
      : pointAbstrait(0, 3, 'E', 'above')
    const poly = this.canOfficielle
      ? polygone([A, B, D, E], 'black')
      : polygone([A, B, C, D], 'black')
    const code1 = codageSegment(B, C, '||')
    const segmentED = segment(E, D)
    segmentED.pointilles = 2
    const segmentEA = segment(E, A)
    segmentEA.pointilles = 2
    const code2 = codageSegment(D, C, '||')
    const code3 = codageSegment(D, E, '||')
    poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
    const d = texteParPosition(
      `$${c}\\text{ cm}$`,
      milieu(A, B).x,
      milieu(A, B).y - 0.5,
      0,
      'black',
      1,
      'milieu',
      false,
    )
    const e = texteParPosition(
      `$${b}\\text{ cm}$`,
      milieu(B, C).x + 1,
      milieu(B, C).y,
      0,
      'black',
      1,
      'milieu',
      false,
    )
    poly.epaisseur = 1
    if (this.canOfficielle) {
      reponse = 24
      this.question = mathalea2d(
        {
          xmin: -1.5,
          ymin: -0.8,
          xmax: 7.1,
          ymax: 3.2,
          pixelsParCm: 30,
          scale: 0.7,
        },
        poly,
        codageAngleDroit(E, A, B),
        codageAngleDroit(A, B, C),
        codageAngleDroit(B, C, E),
        codageAngleDroit(C, E, A),
        code1,
        code2,
        code3,
        d,
        e,
        segmentED,
        segmentEA,
        polygone([A, B, C, E]),
      )
      this.question += "Quelle est l'aire de la figure grisée ? "
      this.correction = `L'aire du rectangle  est : $8\\text{ cm}\\times 4\\text{ cm}=32\\text{ cm}^2$.<br>
      L'aire du triangle  est : $\\dfrac{4\\text{ cm}\\times 4\\text{ cm}}{2}=8\\text{ cm}^2$.<br>
      On en déduit que l'aire du polygone grisé est : $32\\text{ cm}^2-8\\text{ cm}^2=${miseEnEvidence(texNombre(reponse, 1))}\\text{ cm}^2$.`
    } else {
      reponse = b * c - f
      this.question = mathalea2d(
        {
          xmin: -1.5,
          ymin: -1,
          xmax: 7.1,
          ymax: 4,
          pixelsParCm: 30,
          scale: 0.7,
        },
        poly,
        labelPoint(A, B, C, D, E),
        codageAngleDroit(E, A, B),
        codageAngleDroit(A, B, C),
        codageAngleDroit(B, C, E),
        codageAngleDroit(C, E, A),
        code1,
        code2,
        d,
        e,
        segmentED,
        segmentEA,
      )
      this.question += "L'aire de la figure grisée est : "
      this.correction = `L'aire du rectangle $ABCD$ est : $${b}\\text{ cm}\\times ${c}\\text{ cm}=${b * c}\\text{ cm}^2$.<br>
      L'aire du triangle $AED$ est : $\\dfrac{${a}\\text{ cm}\\times ${b}\\text{ cm}}{2}=${texNombre(f, 1)}\\text{ cm}^2$.<br>
      On en déduit que l'aire du polygone grisé est : $${b * c}\\text{ cm}^2-${texNombre(f, 1)}\\text{ cm}^2=${miseEnEvidence(texNombre(reponse, 1))}\\text{ cm}^2$.`
    }
    this.reponse = reponse.toFixed(1)

    this.canReponseACompleter = '$\\ldots\\text{ cm}^2$'
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: '$\\text{cm}^2$' }
    } else {
      this.question += sp(5) + ' $\\ldots \\text{ cm}^2$'
    }
  }
}
