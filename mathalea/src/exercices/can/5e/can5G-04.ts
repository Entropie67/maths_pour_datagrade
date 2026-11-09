import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un périmètre connaissant une aire'
export const interactifReady = true

export const dateDePublication = '30/11/2024'
export const uuid = 'bf029'
export const refs = {
  'fr-fr': ['can5G-04', '6M2C-flash3'],
  'fr-ch': ['10CTGM1D-3', '10LCGM1D-3', '10LSGM1D-3', '11CTGM1F-4', '11LCGM1F-4', '11LSGM1F-4'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class longueursRectPerimetre extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const liste = [
      [5, randint(3, 4)],
      [6, randint(3, 4)],
      [7, randint(4, 5)],
      [8, randint(4, 6)],
      [9, randint(5, 7)],
      [10, randint(6, 8)],
    ] // longueur-lageur
    const choix = choice(liste)
    const aire = choix[0] * choix[1]
    const A = pointAbstrait(0, 0, 'A', 'below')
    const B = pointAbstrait(5, 0, 'B', 'below')
    const C = pointAbstrait(5, 3, 'C', 'above')
    const D = pointAbstrait(0, 3, 'D', 'above')
    const M = pointAbstrait(2, 3, 'M', 'above')
    const poly = polygone([A, B, C, D], 'black')
    const segmentMD = segment(M, D)
    const segmentDA = segment(D, A)
    poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
    const d = latex2d(`${choix[0]} \\text{ cm}`, milieu(C, D).x, 3.5, {
      color: 'black',
      letterSize: 'normalsize',
      backgroundColor: '',
    })

    const t = latex2d(`${aire} \\text{ cm}^2`, milieu(A, B).x, milieu(B, C).y, {
      color: 'black',
      letterSize: 'normalsize',
      backgroundColor: '',
    })

    this.question = 'Calculer le périmètre $P$ de ce rectangle.<br>'
    this.question += mathalea2d(
      {
        xmin: -1.5,
        ymin: -1,
        xmax: 7.1,
        ymax: 4,
        pixelsParCm: 30,
        scale: 0.7,
      },
      poly,
      d,
      t,
      segmentMD,
      segmentDA,
    )

    this.reponse = {
      reponse: {
        value: 2 * choix[0] + 2 * choix[1],
        options: { fonction: true },
      },
    }
    this.correction = `L'aire du rectangle est  $${aire}\\text{ cm}^2$. Elle est égale au produit de la longueur par la largeur du rectangle.<br>
           $${aire}\\div ${choix[0]}=${choix[1]}$<br>
        La largeur du rectangle est donc : $${choix[1]}\\text{ cm}$.<br>
          $2\\times (${choix[0]}+${choix[1]})=${2 * choix[0] + 2 * choix[1]}\\text{ cm}$.<br>
          Le périmètre du rectangle est : $${miseEnEvidence(stringNombre(2 * choix[0] + 2 * choix[1], 0))}\\text{ cm}$.<br>`

    this.canReponseACompleter = '$\\ldots\\text{ cm}$'
    if (this.interactif) {
      this.optionsChampTexte = {
        texteApres: '$\\text{ cm}$',
        texteAvant: '$P=$',
      }
    }
  }
}
