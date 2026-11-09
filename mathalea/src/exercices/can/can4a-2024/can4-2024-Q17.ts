import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { latexParCoordonnees } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une dimension dans un rectangle'
export const interactifReady = true

export const uuid = 'a5528'
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

    this.canOfficielle = false
  }

  nouvelleVersion() {
    const A = pointAbstrait(0, 0, 'A', 'below')
    const B = pointAbstrait(4, 0, 'B', 'below')
    const C = pointAbstrait(4, 3, 'C', 'above')
    const D = pointAbstrait(0, 3, 'D', 'above')
    const P = polygone(A, B, C, D) // rectangle
    const code1 = codageAngleDroit(A, B, C)
    const code2 = codageAngleDroit(B, C, D)
    const code3 = codageAngleDroit(C, D, A)
    const code4 = codageAngleDroit(D, A, B)
    const xmin = -1.5
    const ymin = -0.7
    const xmax = 5.2
    const ymax = 3.5
    const objets1 = []
    const objets2 = []
    const L = this.canOfficielle ? 4 : randint(4, 8)
    const l = this.canOfficielle ? 2 : randint(1, 3)
    objets1.push(
      P,
      code1,
      code2,
      code3,
      code4,
      latexParCoordonnees(
        `${L} \\text{ cm}`,
        milieu(A, B).x,
        milieu(A, B).y - 0.2,
        'black',
        0,
        0,
        '',
        8,
      ),
      latexParCoordonnees(
        '?',
        milieu(B, C).x + 0.4,
        milieu(B, C).y,
        'black',
        0,
        0,
        '',
        8,
      ),
    )
    objets2.push(
      P,
      code1,
      code2,
      code3,
      code4,
      latexParCoordonnees(
        '?',
        milieu(A, B).x,
        milieu(A, B).y - 0.2,
        'black',
        0,
        0,
        '',
        8,
      ),
      latexParCoordonnees(
        `${l} \\text{ cm}`,
        milieu(B, C).x + 0.5,
        milieu(B, C).y,
        'black',
        0,
        0,
        '',
        8,
      ),
    )
    if (this.canOfficielle) {
      this.reponse = l
      this.question = `Le périmètre de ce rectangle est  $12\\text{ cm}$.<br>
      Quelle est sa largeur ?<br>`
      this.question += mathalea2d(
        {
          xmin,
          ymin,
          xmax,
          ymax,
          pixelsParCm: 35,
          mainlevee: true,
          amplitude: 0.5,
          scale: 0.8,
          center: !context.isHtml,
        },
        objets1,
      )

      this.correction = `Le demi-périmètre est $12\\div 2 = 6\\text{ cm}$, la largeur du rectangle est donc égale à  $6-4=${miseEnEvidence(2)}\\text{ cm}$.`
    } else {
      if (choice([true, false])) {
        this.reponse = l
        this.question = `Le périmètre de ce rectangle est  $${2 * L + 2 * l}\\text{ cm}$.<br>
      Quelle est sa largeur ?<br>`
        this.question += mathalea2d(
          {
            xmin,
            ymin,
            xmax,
            ymax,
            pixelsParCm: 35,
            mainlevee: true,
            amplitude: 0.5,
            scale: 0.8,
            center: !context.isHtml,
          },
          objets1,
        )

        this.correction = `Le demi-périmètre est $${2 * L + 2 * l}\\div 2 = ${L + l}\\text{ cm}$, la largeur du rectangle est donc égale à  $${L + l}-${L}=${miseEnEvidence(this.reponse)}\\text{ cm}$.`
      } else {
        this.reponse = L
        this.question = `Le périmètre de ce rectangle est  $${2 * L + 2 * l}\\text{ cm}$.<br>
    Quelle est sa longueur ?<br>`
        this.question += mathalea2d(
          {
            xmin,
            ymin,
            xmax,
            ymax,
            pixelsParCm: 35,
            mainlevee: true,
            amplitude: 0.5,
            scale: 0.8,
            center: !context.isHtml,
          },
          objets2,
        )

        this.correction = `Le demi-périmètre est $${2 * L + 2 * l}\\div 2 = ${L + l}\\text{ cm}$, la longueur du rectangle est donc égale à  $${L + l}-${l}=${miseEnEvidence(this.reponse)}\\text{ cm}$.`
      }
    }

    this.canReponseACompleter = '? $=\\ldots\\text{ cm}$'
    if (!this.interactif) {
      this.question += '? $=\\ldots\\text{ cm}$'
    } else {
      this.optionsChampTexte = {
        texteAvant: '? $=$',
        texteApres: '$\\text{ cm}$',
      }
    }
  }
}
