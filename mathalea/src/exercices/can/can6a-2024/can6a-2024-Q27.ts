import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone, Polygone } from '../../../lib/2d/polygones'
import { segment, Segment } from '../../../lib/2d/segmentsVecteurs'
import { rotation, similitude } from '../../../lib/2d/transformations'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Déterminer une fraction d'aire"
export const interactifReady = true

export const uuid = '32d25'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/

export default class FractionDeRectangle extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.canOfficielle = false
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const hauteur = 3
    let cas: number
    let factor: number
    let nbCase: number
    if (this.canOfficielle) {
      nbCase = 3
      cas = 1
      factor = 2
    } else {
      nbCase = randint(2, 5)
      cas = randint(1, 8)
      factor = cas > 4 ? 4 : 2
    }

    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(nbCase * hauteur, 0)
    const C = pointAbstrait(nbCase * hauteur, hauteur)
    const D = pointAbstrait(0, hauteur)
    const O = pointAbstrait(hauteur / 2, hauteur / 2)
    let triangle: Polygone
    const diag1 = segment(pointAbstrait(0, 0), pointAbstrait(hauteur, hauteur))
    const diag2 = segment(pointAbstrait(hauteur, 0), pointAbstrait(0, hauteur))
    const rectangle = polygone([A, B, C, D], 'black')
    rectangle.epaisseur = 2
    const segments: Segment[] = []
    for (let i = 0; i < nbCase; i++) {
      const s = segment(
        pointAbstrait((i + 1) * hauteur, 0),
        pointAbstrait((i + 1) * hauteur, hauteur),
      )
      s.pointilles = 2
      segments.push(s)
    }
    const triangle0 = polygone([
      pointAbstrait(0, 0),
      O,
      pointAbstrait(hauteur, 0),
    ])
    switch (cas) {
      case 1:
        triangle = similitude(triangle0, A, 45, Math.sqrt(2))
        break
      case 2:
        triangle = similitude(
          triangle0,
          pointAbstrait(hauteur, 0),
          -45,
          Math.sqrt(2),
        )
        break
      case 3:
        triangle = rotation(similitude(triangle0, A, 45, Math.sqrt(2)), O, -90)
        break
      case 4:
        triangle = rotation(similitude(triangle0, A, 45, Math.sqrt(2)), O, 90)
        break
      case 5:
        triangle = triangle0
        break
      case 6:
        triangle = rotation(triangle0, O, 90)
        break
      case 7:
        triangle = rotation(triangle0, O, -90)
        break
      default:
        triangle = rotation(triangle0, O, 180)
        break
    }
    triangle.couleurDeRemplissage = colorToLatexOrHTML('gray')
    const objets = this.canOfficielle
      ? [rectangle, ...segments, triangle, diag1]
      : [rectangle, ...segments, triangle, diag1, diag2]
    this.question = "Quelle fraction de l'aire du rectangle est grisée ?<br>"
    this.question += mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )

    this.reponse = `\\dfrac{1}{${nbCase * factor}}`
    this.correction = `La fraction de l'aire du rectangle qui est grisée est $${miseEnEvidence(`\\dfrac{1}{${nbCase * factor}}`)}$.<br>`
    this.correction += `En effet, il y a $${nbCase}$ carrés dans le rectangle et la zone grisée couvre ${factor === 2 ? "la moitié d'un carré" : "le quart d'un carré"}.<br>Il y a donc  $${nbCase}\\times ${factor === 2 ? 2 : 4} = ${nbCase * factor}$ fois l'aire grisée dans le rectangle.<br> On en déduit que l'aire grisée est égale à $\\dfrac{1}{${nbCase * factor}}$ de l'aire du rectangle.`
  }
}
