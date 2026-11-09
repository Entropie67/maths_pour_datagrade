import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'

export const titre = 'Convertir kg <--> g (QCM)'
export const interactifReady = true

export const uuid = '3c2cb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/

export default class Can2026CE2Q4 extends ExerciceCan {
  enonce(
    valeur?: number,
    reponse?: number,
    prop2?: number,
    prop3?: number,
    sens?: string,
  ) {
    if (
      valeur == null ||
      reponse == null ||
      prop2 == null ||
      prop3 == null ||
      sens == null
    ) {
      sens = choice(['g_vers_kg', 'kg_vers_g'])

      if (sens === 'g_vers_kg') {
        // Cas : grammes → kilogrammes
        valeur = choice([1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000])
        reponse = valeur / 1000
        prop2 = valeur / 100
        prop3 = valeur * 3
      } else {
        // Cas : kilogrammes → grammes
        valeur = choice([1, 2, 3, 4, 5, 6, 7, 8])
        reponse = valeur * 1000
        prop2 = valeur * 100
        prop3 = valeur * 10
      }
    }

    if (sens === 'g_vers_kg') {
      this.question = `Coche la bonne réponse.<br>$${texNombre(valeur)}$ grammes, c'est`
      this.autoCorrection[0] = {
        enonce: this.question,
        propositions: [
          {
            texte: `$${texNombre(reponse)}${sp()}\\text{kg}$`,
            statut: true,
          },
          {
            texte: `$${texNombre(prop2)}${sp()}\\text{kg}$`,
            statut: false,
          },
          {
            texte: `$${texNombre(prop3)}${sp()}\\text{g}$`,
            statut: false,
          },
        ],
        options: { vertical: !context.isHtml },
      }
      this.formatInteractif = 'qcm'
      const monQcm = propositionsQcm(this, 0)
      this.reponse = reponse
      this.question += `${monQcm.texte}`
      this.canEnonce = `Coche la bonne réponse.<br>$${texNombre(valeur)}$ grammes, c'est`
      this.correction =
        monQcm.texteCorr +
        `$1${sp()}\\text{g}$ est $${texNombre(1000)}$ fois plus petit que $1${sp()}\\text{kg}$, donc $${texNombre(valeur)}${sp()}\\text{g}$ $= ${texNombre(valeur)}\\div 1\\,000=${miseEnEvidence(texNombre(reponse))}${sp()}\\text{kg}$.`
      this.canReponseACompleter = monQcm.texte
    } else {
      this.question = `Coche la bonne réponse.<br>$${texNombre(valeur)}$ kilogrammes, c'est`
      this.autoCorrection[0] = {
        enonce: this.question,
        propositions: [
          {
            texte: `$${texNombre(reponse)}${sp()}\\text{g}$`,
            statut: true,
          },
          {
            texte: `$${texNombre(prop2)}${sp()}\\text{g}$`,
            statut: false,
          },
          {
            texte: `$${texNombre(prop3)}${sp()}\\text{g}$`,
            statut: false,
          },
        ],
        options: { vertical: !context.isHtml },
      }
      this.formatInteractif = 'qcm'
      const monQcm = propositionsQcm(this, 0)
      this.reponse = reponse
      this.question += `${monQcm.texte}`
      this.canEnonce = `Coche la bonne réponse.<br>$${texNombre(valeur)}$ kilogrammes, c'est`
      this.correction =
        monQcm.texteCorr +
        `$1${sp()}\\text{kg}$ $= 1\\,000${sp()}\\text{g}$, donc $${texNombre(valeur)}${sp()}\\text{kg}$ $= ${texNombre(valeur)}\\times 1\\,000${sp()}\\text{g}$ $=${miseEnEvidence(texNombre(reponse))}${sp()}\\text{g}$.`
      this.canReponseACompleter = monQcm.texte
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3000, 3, 300, 9000, 'g_vers_kg')
    else this.enonce()
  }
}
