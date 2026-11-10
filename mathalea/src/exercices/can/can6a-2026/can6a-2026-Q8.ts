import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { MetaInteractif2d } from '../../../lib/2d/interactif2d'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ajouteFeedback } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Déterminer l'abscisse d'un point sur une droite graduée"
export const interactifReady = true

export const uuid = 'nuwgb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q8 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'MetaInteractif2d'
  }

  enonce(pas?: number, position?: number, label1?: number, label2?: number) {
    if (pas == null || position == null || label1 == null || label2 == null) {
      pas = choice([10, 20, 30, 40])
      label1 = 2
      label2 = 5
      position = randint(3, 8, [label1, label2])
    }
    const valeur = position * pas
    const nbGrad = Math.max(position + 2, label2 + 2)

    const drGrad = droiteGraduee({
      axeEpaisseur: context.isHtml ? 1.5 : 1.2,
      Unite: 1,
      Min: 0,
      Max: nbGrad,
      thickSec: false,
      thickSecDist: 1,
      labelsPrincipaux: false,
    })
    const origine = latex2d('0', 0, -0.7, { letterSize: 'normalsize' })
    const lab1 = latex2d(texNombre(label1 * pas, 0), label1, -0.7, {
      letterSize: 'normalsize',
    })
    const lab2 = latex2d(texNombre(label2 * pas, 0), label2, -0.7, {
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
    const objets = [drGrad, fleche, input, lab1, lab2, origine]

    const graphique = mathalea2d(
      Object.assign({ pixelsParCm: 25, scale: 0.4 }, fixeBordures(objets)),
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
    this.correction = `Les graduations vont de $${texNombre(pas, 0)}$ en $${texNombre(pas, 0)}$, ainsi la flèche repère le nombre $${miseEnEvidence(texNombre(valeur, 0))}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(20, 6, 2, 5)
    else this.enonce()
  }
}
