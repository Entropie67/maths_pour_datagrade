import Decimal from 'decimal.js'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer la raison d'une suite géométrique"
export const interactifReady = true

export const uuid = 'zfkoc'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q27 extends ExerciceCan {
  enonce(k?: Decimal): void {
    if (k == null) {
      k = new Decimal(choice([0.2, 0.5, 0.8, 1.2, 1.5, 2, 2.5, 3]))
    }

    const raison = k.add(1)
    const distracteur1 = k
    const distracteur2 = k.sub(1)

    const enonce = `Soit une suite $(u_n)$, avec $u_0\\neq 0$, qui vérifie pour tout entier naturel $n$, $\\dfrac{u_{n+1}-u_n}{u_n}=${texNombre(k, 1)}$.<br>
    La suite $(u_n)$ est géométrique :`

    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      options: { ordered: true, vertical: !context.isHtml },
      enonce,
      propositions: [
        {
          texte: `de raison $${texNombre(distracteur2, 1)}$`,
          statut: false,
        },
        {
          texte: `de raison $${texNombre(distracteur1, 1)}$`,
          statut: false,
        },
        {
          texte: `de raison $${texNombre(raison, 1)}$`,
          statut: true,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = enonce + '<br>' + qcm.texte
    this.correction = `$\\dfrac{u_{n+1}-u_n}{u_n}=${texNombre(k, 1)}$ équivaut à $\\dfrac{u_{n+1}}{u_n}-1=${texNombre(k, 1)}$, soit $\\dfrac{u_{n+1}}{u_n}=${texNombre(k, 1)}+1=${texNombre(raison, 1)}$.<br>
    La suite $(u_n)$ est donc géométrique ${texteEnCouleurEtGras('de raison')} $${miseEnEvidence(`${texNombre(raison, 1)}`)}$.`
    this.canEnonce = enonce
    this.canReponseACompleter = `$\\square\\;$ de raison $${texNombre(distracteur2, 1)}$ <br>
    $\\square\\;$ de raison $${texNombre(distracteur1, 1)}$ <br> $\\square\\;$ de raison $${texNombre(raison, 1)}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(new Decimal(1.2))
    else this.enonce()
  }
}
