import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { reduireAxPlusB, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Exprimer une aire en fonction de $x$'
export const interactifReady = true

export const dateDePublication = '18/04/2024'
export const uuid = 'd544a'
export const refs = {
  'fr-fr': ['can3L2-03', '2L14-flash2'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class EnFonctionDeAire extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsChampTexte = { texteApres: '$\\text{ cm}^2$.' }
  }

  nouvelleVersion() {
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1:
        {
          const a = randint(1, 3)
          const b1 = randint(1, 5)
          const b = 2 * b1
          const c = a + b
          const A = pointAbstrait(0, 0, 'A', 'below')
          const B = pointAbstrait(5, 0, 'B', 'below')
          const C = pointAbstrait(5, 3, 'C', 'above')
          const D = pointAbstrait(0, 3, 'D', 'above')
          const M = pointAbstrait(2, 3, 'M', 'above')
          const poly = polygone([A, B, C, M], 'black')
          const segmentMD = segment(M, D)
          const segmentDA = segment(D, A)
          poly.hachures = 'north east lines'
          const d = latex2d(
            `${c}\\text{ cm}`,
            milieu(A, B).x,
            milieu(A, B).y - 0.5,
            { letterSize: 'normalsize' },
          )
          const e = latex2d(
            `${b}\\text{ cm}`,
            milieu(B, C).x + 1,
            milieu(B, C).y,
            { letterSize: 'normalsize' },
          )
          const t = latex2d('x', milieu(D, M).x, milieu(D, M).y + 0.5, {
            letterSize: 'normalsize',
          })

          const figure = mathalea2d(
            {
              xmin: -2,
              ymin: -1,
              xmax: 7.1,
              ymax: 4,
              pixelsParCm: 30,
              scale: 0.7,
            },
            poly,
            labelPoint(A, B, C, D, M),
            d,
            e,
            t,
            segmentMD,
            segmentDA,
          )
          const intro = '$ABCD$ est un rectangle et $DM=x$.<br>' + figure

          if (choice([true, false])) {
            this.reponse = {
              reponse: {
                value: reduireAxPlusB(b1, 0),
                options: { fonction: true, variable: 'x' },
              },
            }
            const consigne =
              "L'aire de la partie non hachurée en fonction de $x$ est : "
            this.question = intro + consigne
            if (!this.interactif) this.question += ' $\\ldots \\text{ cm}^2$.'
            this.canEnonce = intro + consigne
            this.correction = `L'aire du triangle $ADM$ est $\\dfrac{DM\\times AD}{2}=\\dfrac{x\\times ${b}}{2}=${miseEnEvidence(reduireAxPlusB(b1, 0))}\\text{ cm}^2$.`
          } else {
            this.reponse = {
              reponse: {
                value: reduireAxPlusB(-b1, c * b),
                options: { fonction: true, variable: 'x' },
              },
            }
            const consigne =
              "L'aire de la partie hachurée en fonction de $x$ est : "
            this.question = intro + consigne
            if (!this.interactif) this.question += ' $\\ldots \\text{ cm}^2$.'
            this.canEnonce = intro + consigne
            this.correction = `$\\bullet$ L'aire du triangle $ADM$ est $\\dfrac{DM\\times AD}{2}=\\dfrac{x\\times ${b}}{2}=${reduireAxPlusB(b1, 0)}\\text{ cm}^2$.<br>
      $\\bullet$ L'aire du rectangle $ABCD$ est $AB\\times BC=${c}\\times ${b} =${c * b}\\text{ cm}^2$.<br>
      $\\bullet$ L'aire de la partie hachurée est donc la différence entre ces deux aires, soit $${miseEnEvidence(`${c * b}-${rienSi1(b1)}x`)}\\text{ cm}^2$.`
          }
        }
        break

      case 2:
        {
          const a = randint(2, 3)
          const b1 = randint(3, 5)
          const b = 2 * b1
          const A = pointAbstrait(-1, 0, 'A', 'below')
          const B = pointAbstrait(5.5, 0, 'B', 'below')
          const C = pointAbstrait(5.5, 5, 'C', 'above')
          const D = pointAbstrait(0.5, 5, 'D', 'above')
          const E = pointAbstrait(0.5, 0, 'E', 'below')
          const F = pointAbstrait(0.5, 1.5, 'F', 'above left')
          const G = pointAbstrait(-1, 1.5, 'G', 'above')
          const M = pointAbstrait(2, 0, 'M', 'below')
          const N = pointAbstrait(2, 5, 'N', 'above')
          const poly = polygone([E, M, N, D], 'black')
          const poly1 = polygone([A, E, F, G], 'black')
          const poly2 = polygone([E, B, C, D], 'black')
          poly.hachures = 'north east lines'
          poly1.hachures = 'north east lines'
          const f = latex2d(`${a}\\text{ cm}`, -1.6, milieu(A, G).y, {
            letterSize: 'normalsize',
          })
          const e = latex2d(
            `${b}\\text{ cm}`,
            milieu(B, C).x + 0.8,
            milieu(B, C).y,
            { letterSize: 'normalsize' },
          )
          const t = latex2d('x', milieu(E, M).x, milieu(E, M).y - 0.6, {
            letterSize: 'normalsize',
          })
          const figure = mathalea2d(
            {
              xmin: -3,
              ymin: -1,
              xmax: 7.1,
              ymax: 6,
              pixelsParCm: 30,
              scale: 0.7,
            },
            poly,
            poly1,
            poly2,
            labelPoint(A, B, C, D, M, N, E, F, G),
            e,
            t,
            f,
          )
          const intro =
            '$AEFG$ et $EBCD$ sont des carrés et $EM=x$.<br>' + figure

          if (choice([true, false])) {
            this.reponse = {
              reponse: {
                value: reduireAxPlusB(-b, b ** 2),
                options: { fonction: true, variable: 'x' },
              },
            }
            const consigne =
              "L'aire de la partie non hachurée en fonction de $x$ est : "
            this.question = intro + consigne
            if (!this.interactif) this.question += ' $\\ldots \\text{ cm}^2$.'
            this.canEnonce = intro + consigne
            this.correction = `$\\bullet$ L'aire du rectangle $EMND$ est $EM\\times MN=x \\times ${b} =${b}x\\text{ cm}^2$.<br>
        $\\bullet$ L'aire du carré $EBCD$ est $${b}^2 =${b ** 2}\\text{ cm}^2$.<br>
        $\\bullet$ L'aire de la partie non hachurée est donc la différence entre ces deux aires, soit $${miseEnEvidence(`${b ** 2}-${rienSi1(b)}x`)}\\text{ cm}^2$.`
          } else {
            this.reponse = {
              reponse: {
                value: reduireAxPlusB(b, a ** 2),
                options: { fonction: true, variable: 'x' },
              },
            }
            const consigne =
              "L'aire de la partie hachurée en fonction de $x$ est : "
            this.question = intro + consigne
            if (!this.interactif) this.question += ' $\\ldots \\text{ cm}^2$.'
            this.canEnonce = intro + consigne
            this.correction = `$\\bullet$ L'aire du carré $AEFG$ est $${a}^2=${a ** 2}\\text{ cm}^2$.<br>
        $\\bullet$ L'aire du rectangle $EMND$ est $EM\\times MN=x \\times ${b} =${b}x\\text{ cm}^2$.<br>
        $\\bullet$ L'aire de la partie hachurée est donc la somme de ces deux aires, soit $${miseEnEvidence(reduireAxPlusB(b, a ** 2))}\\text{ cm}^2$.`
          }
        }
        break
    }

    this.canReponseACompleter = '$\\ldots\\text{ cm}^2$'
  }
}
