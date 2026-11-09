import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { MetaInteractif2d } from '../../../lib/2d/interactif2d'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ajouteFeedback } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter sur une droite graduée'
export const interactifReady = true

export const uuid = 'br9n6'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can20266Q16 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'MetaInteractif2d'
  }

  enonce(min?: number, max?: number, abscisse?: number) {
    if (min == null || max == null || abscisse == null) {
      min = randint(2, 9) + randint(2, 9) * 0.1 + randint(2, 9) * 0.01
      max = min + 0.01
      abscisse = min + randint(2, 8) * 0.001
    }

    const dg = droiteGraduee({
      Min: min,
      Max: max + 0.0005,
      x: 0,
      y: 0,
      thickDistance: 0.01,
      thickSecDist: 0.001,
      labelsPrincipaux: false,
      thickSec: true,
      thickEpaisseur: 2,
      labelListe: [
        [min, texNombre(min, 3)],
        [max, texNombre(max, 3)],
      ],
      labelCustomDistance: 2.5,
      Unite: 1000,
    })
    const fleche = segment(
      (abscisse - min) * 1000,
      -2,
      (abscisse - min) * 1000,
      -0.5,
    )
    const flecheMin = segment(0, -2, 0, -0.5)
    const flecheMax = segment((max - min) * 1000, -2, (max - min) * 1000, -0.5)
    flecheMax.styleExtremites = '->'
    flecheMin.styleExtremites = '->'
    fleche.styleExtremites = '->'
    fleche.tailleExtremites = context.isHtml ? 6 : 1.5
    flecheMax.tailleExtremites = context.isHtml ? 6 : 1.5
    flecheMin.tailleExtremites = context.isHtml ? 6 : 1.5

    const input = new MetaInteractif2d(
      [
        {
          x: (abscisse - min) * 1000,
          y: -3,
          content: '%{champ1}',
          classe: KeyboardType.clavierDeBase,
          blanc: '\\ldots',
          opacity: 0.8,
          index: 0,
        },
      ],
      { exercice: this, question: 0 },
    )
    const objets = [dg, fleche, input, flecheMin, flecheMax]

    const figure = mathalea2d(
      Object.assign(
        { scale: 0.5 },
        fixeBordures(objets, { rxmin: -0.7, rxmax: 0.3 }),
      ),
      objets,
    )
    this.reponse = { field0: { value: texNombre(abscisse, 3) } }
    this.question =
      'Complète.' +
      figure +
      (context.isHtml
        ? `<span id="resultatCheckEx${this.numeroExercice}Q0"></span>` +
          ajouteFeedback(this, 0)
        : '')

    this.correction = `Un pas de graduation est égal à $0,001$ et il y a $${texNombre((abscisse - min) / 0.001, 0)}$ pas de graduation entre $${texNombre(min, 3)}$ et la dernière flèche.<br>
    Donc l'abscisse de la flèche est $${miseEnEvidence(texNombre(abscisse, 3))}$.`

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = figure
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(2.31, 2.32, 2.314)
    else this.enonce()
  }
}
