import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { MetaInteractif2d } from '../../../lib/2d/interactif2d'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ajouteFeedback } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Tracer une figure avec une aire donnée'
export const interactifReady = true

export const uuid = '845fa'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025CM1Q16 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'MetaInteractif2d'
  }

  enonce(min?: number, position?: number) {
    if (min == null || position == null) {
      min = randint(0, 8) * 1000
      position = randint(1, 9)
    }
    const max = min + 1000
    const pas = 100
    const valeur = min + position * pas

    // Nombre de graduations secondaires (10 intervalles de 100)
    const nbGrad = 10

    const drGrad = droiteGraduee({
      axeEpaisseur: context.isHtml ? 1.5 : 1.2,
      Unite: 1,
      Min: 0,
      Max: nbGrad + 1,
      thickSec: false,
      thickSecDist: 1,
      labelsPrincipaux: false,
    })

    const labMin = latex2d(texNombre(min, 0), 0, -0.7, {
      letterSize: 'normalsize',
    })
    const labMax = latex2d(texNombre(max, 0), nbGrad, -0.7, {
      letterSize: 'normalsize',
    })

    const fleche = segment(position, -1.5, position, -0.5)
    fleche.styleExtremites = '->'
    fleche.tailleExtremites = context.isHtml ? 6 : 1.5

    const input = new MetaInteractif2d(
      [
        {
          x: position,
          y: -2,
          content: '%{champ1}',
          classe: KeyboardType.clavierDeBase,
          blanc: '\\ldots',
          opacity: 0.8,
          index: 0,
        },
      ],
      { exercice: this, question: 0 },
    )

    const objets = [drGrad, fleche, input, labMin, labMax]

    const graphique = mathalea2d(
      Object.assign({ pixelsParCm: 25, scale: 0.25 }, fixeBordures(objets)),
      objets,
    )

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = { field0: { value: texNombre(valeur, 0) } }
    this.question = 'Complète.<br>'
    this.question +=
      graphique +
      (context.isHtml
        ? `<span id="resultatCheckEx${this.numeroExercice}Q0"></span>` +
          ajouteFeedback(this, 0)
        : '')

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = graphique

    this.correction = `Les graduations vont de $${texNombre(pas, 0)}$ en $${texNombre(pas, 0)}$ entre $${texNombre(min, 0)}$ et $${texNombre(max, 0)}$, ainsi le nombre repéré est $${miseEnEvidence(texNombre(valeur, 0))}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(2000, 4)
    else this.enonce()
  }
}
