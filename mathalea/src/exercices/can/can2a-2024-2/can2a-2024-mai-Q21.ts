import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { grille } from '../../../lib/2d/Grille'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import {
  segment,
  segmentAvecExtremites,
} from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Mesurer la longueur d'une ligne brisée"
export const interactifReady = true

export const uuid = 'ynphg'
/**
 * Question 21 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ21 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const objets = []
    objets.push(grille(-1, 0, 7, 4, 'gray', 1, 1))
    const A = pointAbstrait(0, 3)
    const B = pointAbstrait(0, 1)
    const C = pointAbstrait(2, 1)
    const D = pointAbstrait(2, 3)
    const E = pointAbstrait(4, 3)
    const F = pointAbstrait(4, 1)
    const J = pointAbstrait(5, 1)
    const K = pointAbstrait(5, 2)
    const G = pointAbstrait(0, 4) // unite
    const H = pointAbstrait(4, 4) // unite
    const s1 = segmentAvecExtremites(G, H)
    s1.epaisseur = 3
    const s2 = segment(A, B, bleuMathalea)
    s2.epaisseur = 3
    const s3 = segment(B, C, bleuMathalea)
    s3.epaisseur = 3
    const s4 = segment(C, D, bleuMathalea)
    s4.epaisseur = 3
    const s5 = segment(D, E, bleuMathalea)
    s5.epaisseur = 3
    const s6 = segment(E, F, bleuMathalea)
    s6.epaisseur = 3
    const s7 = segment(F, J, bleuMathalea)
    s7.epaisseur = 3
    const s8 = segment(J, K, bleuMathalea)
    s8.epaisseur = 3
    objets.push(
      texteParPosition(
        '1 u.l.',
        milieu(G, H).x,
        milieu(G, H).y + 0.7,
        0.5,
        'black',
        context.isHtml ? 1 : 0.7,
      ),
      s1,
      s2,
      s3,
      s4,
      s5,
      s6,
      s7,
      s8,
    )
    this.reponse = '3'
    this.question =
      mathalea2d(
        {
          xmin: -1,
          ymin: 0,
          xmax: 7,
          ymax: 5,
          pixelsParCm: 20,
          mainlevee: false,
          amplitude: 0.5,
          scale: 0.5,
          center: !context.isHtml,
        },
        objets,
      ) + 'Longueur de la ligne brisée en unités de longueur (u.l) :'
    this.correction = `$L = ${miseEnEvidence('3')}$ u.l.`
  }
}
