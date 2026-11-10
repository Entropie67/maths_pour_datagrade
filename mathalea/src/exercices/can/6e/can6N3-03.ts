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
  'Lire une abscisse sur une droite graduée avec des grands nombres'
export const interactifReady = true

export const dateDePublication = '29/08/2022'
export const dateDeModifImportante = '12/10/2024'
/**
 * @author Gilles Mora
 *
 */
export const uuid = 'fb7ac'

export const refs = {
  'fr-fr': ['can6N3-03', '6N1C-flash2', '2N11-flash3'],
  'fr-ch': [],
}
export default class AbscisseDroiteEntiers extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let d, abs0, abs1, abs2, x1
    const choix1 = this.quotaChoice('choix1', [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
    ]) //, 'b', 'c', 'd', 'e', 'f', 'g', 'h'
    if (choix1 === 'a') {
      // graduation de 200 en 200
      abs0 = randint(1, 9) * choice([1000, 10000])
      abs1 = new Decimal(abs0).add(1000)
      abs2 = new Decimal(abs0).add(2000)
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
          [0, `${texNombre(abs0, 0)}`],
          [1, `${texNombre(abs1, 0)}`],
          [2, `${texNombre(abs2, 0)}`],
        ],
        pointListe: [[x1, '']],
      })
      this.reponse = new Decimal(x1).mul(1000).add(abs0)
      this.question =
        "Déterminer l'abscisse du point $A$. <br>" +
        mathalea2d(
          {
            xmin: -0.9,
            ymin: -1,
            xmax: 10,
            ymax: 1,
            pixelsParCm: 35,
            scale: 0.7,
          },
          latex2d('A', x1 * 4, 0.5, { color: bleuMathalea }),
          d,
        )
      this.correction = `Entre $${texNombre(abs0, 0)}$ et $${texNombre(abs1, 0)}$, il y a $5$ intervalles. Une graduation correspond donc à $200$. <br>
       Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(Number(this.reponse), 0))}$.`
    }

    if (choix1 === 'b') {
      // graduation de 250 en 250
      abs0 = randint(1, 9) * choice([1000, 10000])
      abs1 = new Decimal(abs0).add(1000)
      abs2 = new Decimal(abs0).add(2000)
      x1 = choice([25, 75, 125, 175]) / 100
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
          [0, `${texNombre(abs0, 0)}`],
          [1, `${texNombre(abs1, 0)}`],
          [2, `${texNombre(abs2, 0)}`],
        ],
        pointListe: [[x1, '']],
      })
      this.reponse = new Decimal(x1).mul(1000).add(abs0)
      this.question =
        "Déterminer l'abscisse du point $A$. <br>" +
        mathalea2d(
          {
            xmin: -0.9,
            ymin: -1,
            xmax: 10,
            ymax: 1,
            pixelsParCm: 30,
            scale: 0.7,
          },
          latex2d('A', 4 * x1, 0.5, { color: bleuMathalea }),
          d,
        )
      this.correction = `Entre $${texNombre(abs0, 0)}$ et $${texNombre(abs1, 0)}$, il y a $4$ intervalles. Une graduation correspond donc à $250$. <br>
         Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(Number(this.reponse), 0))}$.`
    }

    if (choix1 === 'c') {
      // graduation de 20 en 20
      abs0 = randint(1, 9) * choice([1000, 10000])
      abs1 = new Decimal(abs0).add(100)
      abs2 = new Decimal(abs0).add(200)
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
          [0, `${texNombre(abs0)}`],
          [1, `${texNombre(abs1)}`],
          [2, `${texNombre(abs2)}`],
        ],
        pointListe: [[x1, '']],
      })
      this.reponse = new Decimal(x1).mul(100).add(abs0)
      this.question =
        "Déterminer l'abscisse du point $A$. <br>" +
        mathalea2d(
          {
            xmin: -0.9,
            ymin: -1,
            xmax: 10,
            ymax: 1,
            pixelsParCm: 30,
            scale: 0.7,
          },
          latex2d('A', 4 * x1, 0.5, { color: bleuMathalea }),
          d,
        )
      this.correction = `Entre $${texNombre(abs0, 0)}$ et $${texNombre(abs1, 0)}$, il y a $5$ intervalles. Une graduation correspond donc à $20$. <br>Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(Number(this.reponse), 0))}$.`
    }

    if (choix1 === 'd') {
      // graduation de 25 en 25
      abs0 = randint(1, 9) * choice([1000, 10000])
      abs1 = new Decimal(abs0).add(100)
      abs2 = new Decimal(abs0).add(200)
      x1 = choice([25, 75, 125, 175]) / 100
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
          [0, `${texNombre(abs0)}`],
          [1, `${texNombre(abs1)}`],
          [2, `${texNombre(abs2)}`],
        ],
        pointListe: [[x1, '']],
      })
      this.reponse = new Decimal(x1).mul(100).add(abs0)
      this.question =
        "Déterminer l'abscisse du point $A$. <br>" +
        mathalea2d(
          {
            xmin: -0.9,
            ymin: -1,
            xmax: 10,
            ymax: 1,
            pixelsParCm: 30,
            scale: 0.7,
          },
          latex2d('A', 4 * x1, 0.5, { color: bleuMathalea }),
          d,
        )
      this.correction = `Entre $${texNombre(abs0, 0)}$ et $${texNombre(abs1, 0)}$, il y a $4$ intervalles. Une graduation correspond donc à $25$. <br>
      Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(Number(this.reponse), 0))}$.`
    }
    if (choix1 === 'e') {
      // graduation de 2 en 2
      abs0 = randint(1, 9) * choice([1000, 10000])
      abs1 = new Decimal(abs0).add(10)
      abs2 = new Decimal(abs0).add(20)
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
          [0, `${texNombre(abs0, 0)}`],
          [1, `${texNombre(abs1, 0)}`],
          [2, `${texNombre(abs2, 0)}`],
        ],
        pointListe: [[x1, '']],
      })
      this.reponse = new Decimal(x1).mul(10).add(abs0)
      this.question =
        "Déterminer l'abscisse du point $A$. <br>" +
        mathalea2d(
          {
            xmin: -0.9,
            ymin: -1,
            xmax: 10,
            ymax: 1,
            pixelsParCm: 30,
            scale: 0.7,
          },
          latex2d('A', 4 * x1, 0.5, { color: bleuMathalea }),
          d,
        )
      this.correction = `Entre $${texNombre(abs0, 0)}$ et $${texNombre(abs1, 0)}$, il y a $5$ i.5ntervalles.<br>
         Une graduation correspond donc à $2$. Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(Number(this.reponse), 0))}$.`
    }
    if (choix1 === 'f') {
      // graduation de 2,5 en 2,5
      abs0 = randint(1, 9) * choice([1000, 10000])
      abs1 = new Decimal(abs0).add(10)
      abs2 = new Decimal(abs0).add(20)
      x1 = choice([25, 75, 125, 175]) / 100
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
          [0, `${texNombre(abs0, 0)}`],
          [1, `${texNombre(abs1, 0)}`],
          [2, `${texNombre(abs2, 0)}`],
        ],
        pointListe: [[x1, '']],
      })
      this.reponse = new Decimal(x1).mul(10).add(abs0)
      this.question =
        "Déterminer l'abscisse du point $A$. <br>" +
        mathalea2d(
          {
            xmin: -0.9,
            ymin: -1,
            xmax: 10,
            ymax: 1,
            pixelsParCm: 30,
            scale: 0.7,
          },
          latex2d('A', 4 * x1, 0.5, { color: bleuMathalea }),
          d,
        )
      this.correction = `Entre $${texNombre(abs0, 0)}$ et $${texNombre(abs1, 0)}$, il y a $4$ intervalles. Une graduation correspond donc à $2,5$. <br>
      Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(Number(this.reponse), 1))}$.`
    }
    if (choix1 === 'g') {
      // graduation de 0,2 en 0,2
      abs0 = randint(1, 9) * choice([1000, 10000])
      abs1 = new Decimal(abs0).add(1)
      abs2 = new Decimal(abs0).add(2)
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
          [0, `${texNombre(abs0, 0)}`],
          [1, `${texNombre(abs1, 0)}`],
          [2, `${texNombre(abs2, 0)}`],
        ],
        pointListe: [[x1, '']],
      })
      this.reponse = new Decimal(x1).add(abs0)
      this.question =
        "Déterminer l'abscisse du point $A$. <br>" +
        mathalea2d(
          {
            xmin: -1,
            ymin: -1,
            xmax: 10,
            ymax: 1,
            pixelsParCm: 30,
            scale: 0.7,
          },
          latex2d('A', 4 * x1, 0.5, { color: bleuMathalea }),
          d,
        )
      this.correction = `Entre $${texNombre(abs0, 0)}$ et $${texNombre(abs1, 0)}$, il y a $5$ intervalles. Une graduation correspond donc à $0,2$. <br>
      Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(Number(this.reponse), 1))}$.`
    }

    if (choix1 === 'h') {
      // graduation de 0.25 en 0.25
      abs0 = randint(1, 9) * choice([1000, 10000])
      abs1 = new Decimal(abs0).add(1)
      abs2 = new Decimal(abs0).add(2)
      x1 = choice([25, 75, 125, 175]) / 100
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
          [0, `${texNombre(abs0, 0)}`],
          [1, `${texNombre(abs1, 0)}`],
          [2, `${texNombre(abs2, 0)}`],
        ],
        pointListe: [[x1, '']],
      })
      this.reponse = new Decimal(x1).add(abs0)
      this.question =
        "Déterminer l'abscisse du point $A$. <br>" +
        mathalea2d(
          {
            xmin: -0.9,
            ymin: -1,
            xmax: 10,
            ymax: 1,
            pixelsParCm: 30,
            scale: 0.7,
          },
          latex2d('A', 4 * x1, 0.5, { color: bleuMathalea }),
          d,
        )
      this.correction = `Entre $${texNombre(abs0, 0)}$ et $${texNombre(abs1, 0)}$, il y a $4$ intervalles. Une graduation correspond donc à $0,25$.<br>
       Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(Number(this.reponse), 2))}$.`
    }
  }
}
