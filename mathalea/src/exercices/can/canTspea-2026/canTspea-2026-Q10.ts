import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer la parité d'une puissance"
export const interactifReady = true

export const uuid = 't6gg0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ10 extends ExerciceCan {
  enonce(base?: number, exposant?: number): void {
    if (base == null || exposant == null) {
      base = choice([2, 3, 4, 5, 6, 7, 8, 9])
      exposant = 2026
    }

    // Une puissance d'un nombre pair est toujours paire
    // Une puissance d'un nombre impair est toujours impaire
    const estPair = base % 2 === 0

    const enonce = `$${base}^{${texNombre(exposant)}}$ est un nombre :`

    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      options: { ordered: true, vertical: !context.isHtml },
      enonce,
      propositions: [
        {
          texte: 'Pair',
          statut: estPair,
        },
        {
          texte: 'Impair',
          statut: !estPair,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = enonce + '<br>' + qcm.texte
    if (estPair) {
      this.correction = `$${base}$ est pair, donc toute puissance de $${base}$ est paire (un produit contenant un facteur pair est pair).<br>
      $${base}^{${texNombre(exposant)}}$ est ${texteEnCouleurEtGras('pair')}.`
    } else {
      this.correction = `$${base}$ est impair, donc toute puissance de $${base}$ est impaire (un produit de nombres impairs est impair).<br>
      $${base}^{${texNombre(exposant)}}$ est ${texteEnCouleurEtGras('impair')}.`
    }
    this.canEnonce = enonce
    this.canReponseACompleter = 'Entourer la réponse : PAIR / IMPAIR'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3, 2026)
    else this.enonce()
  }
}
