import Decimal from 'decimal.js'
import { latex2d } from '../../../lib/2d/textes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'

import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Déterminer une abscisse'
export const interactifReady = true

export const uuid = 'p2237'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter + Gilles Mora

*/
export default class CompleterUneSuite extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const pas = this.canOfficielle
      ? 2
      : this.quotaChoice('pas', [1, 2, 3, 4, 5]) // Graduation de 2, 3, 4 ou 5
    const abs0 = annee - 5 * pas // 5 intervalles avant l'année
    const abs1 = annee // L'année est le repère central
    const abs2 = annee + 5 * pas // 5 intervalles après l'année
    const x1 = this.canOfficielle
      ? new Decimal(0.6)
      : new Decimal(this.quotaRandint('x1', 1, 9, [5]) * 2).div(10)
    const x1B = Number(x1.toFixed(1))
    const x2 = x1.mul(5 * pas).add(abs0)
    const d = droiteGraduee({
      Unite: 5,
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
      pointListe: [[Number(x1), '']],
    })
    const nbIntervalles = 5

    this.reponse = texNombre(x2, 0)
    this.correction = `Entre $${texNombre(abs0)}$ et $${texNombre(abs1)}$, il y a un écart de $${texNombre(abs1 - abs0)}$ et $${nbIntervalles}$ intervalles.<br>
    $${texNombre(abs1 - abs0)} \\div ${nbIntervalles} = ${texNombre(pas)}$<br>
                Une graduation correspond donc à $${texNombre(pas)}$ unité${pas > 1 ? 's' : ''}. <br>
               Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(this.reponse)}$.`

    this.question = "Déterminer l'abscisse du point $A$ ci-dessous :"
    this.question +=
      '<br>' +
      mathalea2d(
        {
          xmin: -0.9,
          ymin: -1.5,
          xmax: 15,
          ymax: 1.5,
          pixelsParCm: 30,
          scale: 0.6,
        },
        latex2d('A', x1B * 5, 0.5, { color: bleuMathalea }),
        d,
      )
  }
}
