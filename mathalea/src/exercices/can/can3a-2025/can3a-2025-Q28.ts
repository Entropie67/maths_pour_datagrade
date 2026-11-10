import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { ellipse } from '../../../lib/2d/projections3d'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer le volume d'un cylindre"
export const interactifReady = true

export const uuid = '94db5'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class VolumeCylindre extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteApres: '$\\text{ cm}^3$.' }
  }

  nouvelleVersion() {
    const h = this.canOfficielle ? 7 : randint(5, 8) // longueur hauteur
    const aire = this.canOfficielle ? 21 : randint(15, 25)
    const A = pointAbstrait(0, 0, 'A', 'below')
    const B = pointAbstrait(-2, 0, 'B', 'below')
    const C = pointAbstrait(2, 0, 'C', 'below')
    const D = pointAbstrait(-2, -4, 'D', 'above')
    const E = pointAbstrait(2, -4, 'D', 'above')
    const c = ellipse(A, 2, 0.5)
    const c2 = ellipse(milieu(E, D), 2, 0.5)
    const H1 = pointAbstrait(3, 0) // seg avec flèche hauteur
    const H2 = pointAbstrait(3, -4) // seg avec flèche hauteur
    const H3 = pointAbstrait(-3, -5) // seg avec flèche
    const s1 = segment(H1, H2)
    s1.styleExtremites = '<->'
    c2.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
    c2.opaciteDeRemplissage = 0.3
    const s2 = segment(milieu(E, D), H3) // seg pour l'aire base
    s2.styleExtremites = '<-'
    const xmin = -5.5
    const ymin = -6.5
    const xmax = 6
    const ymax = 1
    const objets = []
    objets.push(
      latex2d(`h= ${h} \\text{ cm}`, 4.5, milieu(H1, H2).y + 0.5, {
        letterSize: 'normalsize',
      }),
      latex2d('\\text{Aire du disque }', -3, -5.3, {
        letterSize: 'normalsize',
      }),
      latex2d(`${aire} \\text{ cm}^2`, -3, -6, { letterSize: 'normalsize' }),
      segment(B, D),
      segment(E, C),
      c,
      c2,
      s1,
      s2,
    )
    const reponse = h * aire
    this.reponse = reponse
    this.question = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 30,
        mainlevee: false,
        amplitude: 0.5,
        scale: 0.6,
        center: !context.isHtml,
      },
      objets,
    )
    this.correction = `Le volume du cylindre est  : $\\text{(Aire de la base)}\\times \\text{Hauteur}$.<br>
              Soit : $ ${aire}\\times ${h}=${miseEnEvidence(reponse)}\\text{ cm}^3$.  `
    this.question += '<br>Le volume de ce cylindre est '

    this.canReponseACompleter = '$\\ldots\\text{ cm}^3$'
    if (!this.interactif) {
      this.question += ' $\\ldots\\text{ cm}^3$.'
    }
  }
}
