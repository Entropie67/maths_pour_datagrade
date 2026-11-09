import { codageAngle } from '../../lib/2d/angles'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation, similitude } from '../../lib/2d/transformations'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { bleuMathalea } from '../../lib/colors'

export const titre = 'Mesurer un angle'

/**
 * Mesurer un angle
 * @author Mickael Guironnet
 */
export const uuid = '12c6f'

export const refs = {
  'fr-fr': ['6G4B-3'],
  'fr-ch': ['9R1ES1C-9', '9R2ES1C-9', '9R3ES1C-9', 'PRQES01B-10', 'PRQMG05A-2'],
}
export default class MesurerUnAngle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Angle modulo 10°',
        '2 : Angle modulo 5°',
        '3 : Angle modulo 1°',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = 3
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 4,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let angle = 0
      switch (listeTypeDeQuestions[i]) {
        case 1: {
          angle = randint(1, 17, 9) * 10
          break
        }
        case 2: {
          angle = randint(1, 8) * 10 + randint(0, 1) * 90 + 5
          break
        }
        case 3: {
          angle = randint(1, 16) * 10 + randint(1, 9)
          break
        }
      }
      const anglerot = randint(1, 10) * choice([-1, 1])
      const anglehaut = 180 - angle - anglerot
      const unite = 4
      let k = 0
      let x = 0
      let y = 0
      let xdroite = 0
      do {
        // MGu on réduit la hauteur de manière exponentielle pour que les points soient plus proches de la droite graduée et que l'exercice soit plus facile à faire
        y = 1 + 20 * Math.exp(-k / 10) * 0.1 * unite
        // x est orienté : négatif à gauche de C et positif à droite de C
        x = y / Math.tan((anglehaut * Math.PI) / 180)
        k++
        if (x > 6 * unite) {
          xdroite = randint(1, 10) * 0.1 * unite
        } else if (x > 0) {
          xdroite = randint(1, Math.floor((6 - x / unite) * 10)) * 0.1 * unite
        } else if (x < -6 * unite) {
          xdroite = randint(50, 60) * 0.1 * unite
        } else {
          xdroite = randint(Math.ceil(-x / unite), 60) * 0.1 * unite
        }
      } while (
        (xdroite + x + 5 > 6 * unite || xdroite + x < 0 * unite) &&
        k < 30
      )

      // on fait une symétrie axiale par rapport à l'axe verticale x = 3
      const sens = i % 2 === 0 ? -1 : 1 // -1 = gauche, 1 = droite
      const A = pointAbstrait(
        sens === -1 ? 6 * unite - (xdroite + x) : xdroite + x,
        -y,
        lettreDepuisChiffre(i + 1),
        'below',
      )
      const B = pointAbstrait(
        sens === -1 ? 6 * unite - (xdroite + x + 5) : xdroite + x + 5,
        -y,
      )
      const C = rotation(B, A, anglerot, 'x', 'below')
      const D = similitude(
        C,
        A,
        sens === -1 ? -1 * angle : angle,
        1 + randint(1, 4) * 0.1,
        'y',
        'above',
      )
      const seg1 = segment(A, C)
      const seg2 = segment(A, D)

      const texte = mathalea2d(
        Object.assign(
          {
            xmin: -2,
            ymin: -6,
            xmax: 25,
            ymax: 2,
            pixelsParCm: 20,
            scale: 0.5,
            optionsTikz: 'baseline=(current bounding box.north)',
          },
          fixeBordures([A, C, D, seg1, seg2, labelPoint(A, C, D)]),
        ),
        tracePoint(A),
        codageAngle(C, A, D, 1, '', bleuMathalea, 1, 1),
        labelPoint(A, C, D),
        seg1,
        seg2,
      )

      if (this.questionJamaisPosee(i, angle)) {
        this.listeQuestions[i] =
          `Mesurer l'angle $\\widehat{x${A.nom}y}$.<br>` + texte
        this.listeCorrections[i] =
          `La mesure de l'angle est égale à $${miseEnEvidence(texNombre(angle))}^\\circ$.`
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
