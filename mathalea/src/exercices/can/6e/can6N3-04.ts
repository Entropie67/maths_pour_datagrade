import Decimal from 'decimal.js'
import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { latex2d } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Lire une abscisse sur une droite graduée avec des décimaux'
export const interactifReady = true

export const dateDePublication = '29/08/2022'
export const dateDeModifImportante = '12/10/2024'
/**
 * @author Gilles Mora
 *
 */
export const uuid = 'aa22e'

export const refs = {
  'fr-fr': ['can6N3-04', '6N1H-flash2', '2N11-flash4'],
  'fr-ch': [],
}
export default class AbscisseDroiteDecimaux extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let d, abs0, abs1, abs2, x1, partieDec1, partieDec2, partieDec3

    const choix1 = this.quotaChoice('choix1', ['a', 'b']) //, 'b'
    if (choix1 === 'a') {
      // graduation de 0,02 en 0,02
      partieDec1 = new Decimal(randint(1, 9)).div(choice([10, 100]))
      abs0 = new Decimal(randint(0, 9)).add(partieDec1)
      partieDec2 = new Decimal(1).div(100)
      abs1 = abs0.add(partieDec2)
      partieDec3 = new Decimal(2).div(100)
      abs2 = abs0.add(partieDec3)
      x1 = (2 * randint(1, 9, 5)) / 10
      d = droiteGraduee({
        Unite: 4,
        Min: 0,
        Max: 2.1,
        thickSecDist: 0.2,
        axeStyle: '->',
        pointTaille: 3,
        pointStyle: 'x',
        labelsPrincipaux: false,
        thickSec: true,
        labelListe: [
          [0, `${texNombre(abs0, 2)}`],
          [1, `${texNombre(abs1, 2)}`],
          [2, `${texNombre(abs2, 2)}`],
        ],
        pointListe: [[x1, '']],
      })
      this.reponse = new Decimal(x1).div(100).add(abs0)
      this.question =
        "Déterminer l'abscisse du point $A$. <br>" +
        mathalea2d(
          {
            xmin: -0.5,
            ymin: -1,
            xmax: 10,
            ymax: 1,
            pixelsParCm: 35,
            scale: 0.75,
          },
          latex2d('A', 4 * x1, 0.5, { color: bleuMathalea }),
          d,
        )
      this.correction = `Entre $${texNombre(abs0)}$ et $${texNombre(abs1)}$, il y a $5$ intervalles. Une graduation correspond donc à $0,002$. <br>
      Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(Number(this.reponse), 4))}$.`
    }

    if (choix1 === 'b') {
      // graduation de 0,025 en 0,025
      partieDec1 = new Decimal(randint(1, 9)).div(choice([10, 100]))
      abs0 = new Decimal(randint(0, 9)).add(partieDec1)

      partieDec2 = new Decimal(1).div(100)
      abs1 = abs0.add(partieDec2)
      partieDec3 = new Decimal(2).div(100)
      abs2 = abs0.add(partieDec3)
      x1 = choice([25, 50, 75, 125, 150, 175]) / 100
      d = droiteGraduee({
        Unite: 4,
        Min: 0,
        Max: 2.1,
        thickSecDist: 0.25,
        axeStyle: '->',
        pointTaille: 3,
        pointStyle: 'x',
        labelsPrincipaux: false,
        thickSec: true,
        labelListe: [
          [0, `${texNombre(abs0, 2)}`],
          [1, `${texNombre(abs1, 2)}`],
          [2, `${texNombre(abs2, 2)}`],
        ],
        pointListe: [[x1, '']],
      })
      this.reponse = new Decimal(x1).div(100).add(abs0)
      this.question =
        "Déterminer l'abscisse du point $A$. <br>" +
        mathalea2d(
          {
            xmin: -0.5,
            ymin: -1,
            xmax: 10,
            ymax: 1,
            pixelsParCm: 35,
            scale: 0.75,
          },
          latex2d('A', 4 * x1, 0.5, { color: bleuMathalea }),
          d,
        )
      this.correction = `Entre $${texNombre(abs0)}$ et $${texNombre(abs1)}$, il y a $4$ intervalles. Une graduation correspond donc à $${texNombre(0.0025)}$. <br>
      Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(Number(this.reponse), 4))}$.`
    }
  }
}
