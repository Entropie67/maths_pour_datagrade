import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter sur une droite graduée'
export const interactifReady = true

export const uuid = '1c3b0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CM2Q16 extends ExerciceCan {
  enonce() {
    const min = this.canOfficielle ? 2 : randint(0, 8)
    const max = min + 1

    // Les 9 dixièmes reçoivent les lettres A..I
    const lettres = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

    // pointListe : une lettre par dixième (0.1, 0.2, ..., 0.9)
    const pointListe: [number, string][] = lettres.map((l, i) => [
      min + (i + 1) * 0.1,
      `\\text{${l}}`,
    ])

    // Lettre cible
    // Version officielle : D → min + 0.4 = 2.4
    const indexCible = this.canOfficielle ? 3 : randint(0, 8)
    const lettreCible = lettres[indexCible]
    const abscisseCible = min + (indexCible + 1) * 0.1

    // ── Droite question (toutes les lettres) ──────────────────────────────
    const d = droiteGraduee({
      Unite: 10,
      Min: min,
      Max: max + 0.1,
      x: 0,
      y: 0,
      thickDistance: 1,
      thickSec: true,
      thickSecDist: 0.1,
      thickOffset: 0,
      axeStyle: '->',
      labelListe: [
        [min, texNombre(min, 0)],
        [max, texNombre(max, 0)],
      ],
      labelsPrincipaux: false,
      pointListe,
      pointCouleur: 'black',
      pointStyle: '',
    })

    // ── Droite correction PDF (lettre cible en bleu) ───────────────────────
    const dCorrection = droiteGraduee({
      Unite: 10,
      Min: min,
      Max: max,
      x: 0,
      y: 0,
      thickDistance: 1,
      thickSec: true,
      thickSecDist: 0.1,
      thickOffset: 0,
      axeStyle: '->',
      labelListe: [
        [min, texNombre(min, 0)],
        [max, texNombre(max, 0)],
      ],
      labelsPrincipaux: false,
      pointListe: [[abscisseCible, `\\text{${lettreCible}}`]],
      pointCouleur: bleuMathalea,
      pointStyle: '',
    })

    // ── Réponse ────────────────────────────────────────────────────────────
    this.reponse = lettreCible

    // ── Question ───────────────────────────────────────────────────────────
    const figureQuestion = mathalea2d(
      {
        xmin: -1,
        ymin: -1.3,
        xmax: 12,
        ymax: 1.2,
        pixelsParCm: 20,
        scale: 0.6,
        center: !context.isHtml,
      },
      d,
    )
    this.question = figureQuestion
    this.question += `<br>Quelle lettre repère le nombre $${texNombre(abscisseCible, 1)}$ ?`

    // ── Correction ─────────────────────────────────────────────────────────
    if (context.isHtml) {
      this.correction = `L'unité est partagée en $10$ donc la lettre qui repère $${texNombre(abscisseCible, 1)}$ est $${miseEnEvidence(lettreCible)}$.`
    } else {
      this.correction = mathalea2d(
        {
          xmin: -1,
          ymin: -1.3,
          xmax: 11,
          ymax: 1.5,
          pixelsParCm: 20,
          scale: 0.5,
          center: !context.isHtml,
        },
        dCorrection,
      )
      this.correction += `<br>La lettre qui repère $${texNombre(abscisseCible, 1)}$ est $${miseEnEvidence(lettreCible)}$.`
    }

    // ── canEnonce / canReponseACompleter ───────────────────────────────────
    this.canEnonce = figureQuestion
    this.canEnonce += `<br>Quelle lettre repère le nombre $${texNombre(abscisseCible, 1)}$ ?`
    this.canReponseACompleter = ''
  }

  nouvelleVersion() {
    this.optionsDeComparaison = {
      texteSansCasse: true,
    }
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.formatChampTexte = KeyboardType.clavierMajuscules
    this.enonce()
  }
}
