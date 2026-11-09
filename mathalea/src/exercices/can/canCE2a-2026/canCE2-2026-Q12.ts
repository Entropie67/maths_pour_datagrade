import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { bleuMathalea } from '../../../lib/colors'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Placer une fraction sur une droite graduée'
export const interactifReady = true

export const uuid = '481aa'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q12 extends ExerciceCan {
  enonce() {
    const typeFraction = this.canOfficielle
      ? 'cinquiemes'
      : choice(['cinquiemes', 'quarts'])

    let choix: [string, string, string, number][]
    let nbDivisions: number
    let distanceGrad: number

    if (typeFraction === 'cinquiemes') {
      nbDivisions = 5
      distanceGrad = 0.2
      choix = this.canOfficielle
        ? [
            [
              new FractionEtendue(3, 5).texFraction,
              'C',
              new FractionEtendue(3, 5).texFraction,
              0.6,
            ],
          ]
        : [
            [
              new FractionEtendue(1, 5).texFraction,
              'A',
              new FractionEtendue(1, 5).texFraction,
              0.2,
            ],
            [
              new FractionEtendue(2, 5).texFraction,
              'B',
              new FractionEtendue(2, 5).texFraction,
              0.4,
            ],
            [
              new FractionEtendue(3, 5).texFraction,
              'C',
              new FractionEtendue(3, 5).texFraction,
              0.6,
            ],
            [
              new FractionEtendue(4, 5).texFraction,
              'D',
              new FractionEtendue(4, 5).texFraction,
              0.8,
            ],
          ]
    } else {
      // quarts
      nbDivisions = 4
      distanceGrad = 0.25
      choix = [
        [
          new FractionEtendue(1, 4).texFraction,
          'A',
          new FractionEtendue(1, 4).texFraction,
          0.25,
        ],
        [
          new FractionEtendue(2, 4).texFraction,
          'B',
          new FractionEtendue(1, 2).texFraction,
          0.5,
        ],
        [
          new FractionEtendue(3, 4).texFraction,
          'C',
          new FractionEtendue(3, 4).texFraction,
          0.75,
        ],
      ]
    }

    const a = choice(choix)

    const pointListe: [number, string][] =
      typeFraction === 'cinquiemes'
        ? [
            [0.2, '\\text{A}'],
            [0.4, '\\text{B}'],
            [0.6, '\\text{C}'],
            [0.8, '\\text{D}'],
          ]
        : [
            [0.25, '\\text{A}'],
            [0.5, '\\text{B}'],
            [0.75, '\\text{C}'],
          ]

    const d = droiteGraduee({
      Unite: 8,
      Min: 0,
      Max: 1,
      x: 0,
      y: 0,
      thickDistance: 1,
      thickSec: true,
      thickSecDist: distanceGrad,
      thickOffset: 0,
      axeStyle: '->',
      pointListe: pointListe as [number, string][],
      pointCouleur: 'black',
      pointStyle: '',
      labelsPrincipaux: true,
    })

    const dPDF = droiteGraduee({
      Unite: 8,
      Min: 0,
      Max: 1.1,
      x: 0,
      y: 0,
      thickDistance: 1,
      thickSec: true,
      thickSecDist: distanceGrad,
      thickOffset: 0,
      axeStyle: '->',
      pointStyle: '',
      labelsPrincipaux: true,
      axeEpaisseur: 1.5,
    })

    this.reponse = `${a[1]}`

    this.question = mathalea2d(
      {
        xmin: -1,
        ymin: -1.3,
        xmax: 10,
        ymax: 0.9,
        pixelsParCm: 20,
        scale: 0.6,
        center: !context.isHtml,
      },
      d,
    )
    this.question += `Quelle lettre repère la fraction $${a[0]}$ ?`

    if (context.isHtml) {
      this.correction = `L'unité est partagée en $${nbDivisions}$ donc la lettre qui repère la fraction $${a[0]}$ est $${miseEnEvidence(a[1])}$.`
    } else {
      const dCorrection = droiteGraduee({
        Unite: 8,
        Min: 0,
        Max: 1,
        x: 0,
        y: 0,
        thickDistance: 1,
        thickSec: true,
        thickSecDist: distanceGrad,
        thickOffset: 0,
        axeStyle: '->',
        pointListe: [[a[3], `\\text{${a[1]}}`]],
        pointCouleur: bleuMathalea,
        pointStyle: '',
        labelsPrincipaux: true,
      })
      this.correction = mathalea2d(
        {
          xmin: -1,
          ymin: -1.3,
          xmax: 10,
          ymax: 1.5,
          pixelsParCm: 20,
          scale: 0.5,
          center: !context.isHtml,
        },
        dCorrection,
      )
    }

    this.canEnonce = `Place la fraction $${a[0]}$.`
    this.canReponseACompleter = mathalea2d(
      {
        xmin: -1,
        ymin: -1.3,
        xmax: 10,
        ymax: 0.8,
        pixelsParCm: 20,
        scale: 0.45,
        center: !context.isHtml,
      },
      dPDF,
    )

    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce: this.question,
      propositions:
        typeFraction === 'cinquiemes'
          ? [
              { texte: '$A$', statut: a[1] === 'A' },
              { texte: '$B$', statut: a[1] === 'B' },
              { texte: '$C$', statut: a[1] === 'C' },
              { texte: '$D$', statut: a[1] === 'D' },
            ]
          : [
              { texte: '$A$', statut: a[1] === 'A' },
              { texte: '$B$', statut: a[1] === 'B' },
              { texte: '$C$', statut: a[1] === 'C' },
            ],
    }
    const monQcm = propositionsQcm(this, 0)
    this.question += monQcm.texte
  }

  nouvelleVersion() {
    this.enonce()
  }
}
