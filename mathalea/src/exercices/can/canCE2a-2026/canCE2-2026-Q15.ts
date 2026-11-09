import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Décomposer un nombre (QCM)'
export const interactifReady = true

export const uuid = '569e1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q15 extends ExerciceCan {
  enonce(
    nombre?: number,
    chiffreDizaines?: number,
    ajoutOuRetrait?: number,
    type?: string,
  ) {
    if (
      nombre == null ||
      chiffreDizaines == null ||
      ajoutOuRetrait == null ||
      type == null
    ) {
      type = choice(['soustraction', 'addition'])

      if (type === 'soustraction') {
        // Nombre = (chiffreDizaines) × 10 - différence
        // Exemple: 78 = 8 × 10 - 2
        do {
          nombre = randint(51, 99, [60, 70, 80, 90])
          chiffreDizaines = Math.floor(nombre / 10) + 1
          ajoutOuRetrait = chiffreDizaines * 10 - nombre
        } while (Math.floor(nombre / 10) === nombre % 10) // Éviter 55, 66, 77, 88, 99
      } else {
        // Nombre = (chiffreDizaines) × 10 + unités
        // Exemple: 73 = 7 × 10 + 3
        do {
          chiffreDizaines = randint(5, 9)
          ajoutOuRetrait = randint(1, 9)
          nombre = chiffreDizaines * 10 + ajoutOuRetrait
        } while (chiffreDizaines === ajoutOuRetrait) // Éviter 55, 66, 77, 88, 99
      }
    }

    const chiffreUnites = nombre % 10
    const dizainesCompletes = Math.floor(nombre / 10)

    let prop1Text, prop2Text, prop3Text

    if (type === 'soustraction') {
      // Bonne réponse
      prop1Text = `$${chiffreDizaines}$ fois $10$ et j'enlève $${ajoutOuRetrait}$`

      // Distracteur 1 : erreur en mettant le nombre complet de dizaines avec addition
      prop2Text = `$${dizainesCompletes * 10}$ fois $10$ et j'ajoute $${chiffreUnites}$`

      // Distracteur 2 : formule inversée
      prop3Text = `$${dizainesCompletes}$ et $${chiffreUnites}\\times 10$`
    } else {
      // Bonne réponse
      prop1Text = `$${chiffreDizaines}$ fois $10$ et j'ajoute $${ajoutOuRetrait}$`

      // Distracteur 1 : inversion dizaines/unités
      prop2Text = `$${ajoutOuRetrait}$ fois $10$ et j'ajoute $${chiffreDizaines}$`

      // Distracteur 2 : formule inversée
      prop3Text = `$${chiffreDizaines}$ et $${ajoutOuRetrait}\\times 10$`
    }

    this.question = `Coche la bonne réponse.<br>$${nombre}$ c'est :`

    this.autoCorrection[0] = {
      enonce: this.question,
      propositions: [
        {
          texte: prop1Text,
          statut: true,
        },
        {
          texte: prop2Text,
          statut: false,
        },
        {
          texte: prop3Text,
          statut: false,
        },
      ],
      options: { vertical: !context.isHtml },
    }

    this.formatInteractif = 'qcm'
    const monQcm = propositionsQcm(this, 0)
    this.reponse = nombre
    this.question += `${monQcm.texte}`
    this.canEnonce = `Coche la bonne réponse.<br>$${nombre}$ c'est :`

    if (type === 'soustraction') {
      this.correction =
        monQcm.texteCorr +
        `$${nombre}=${chiffreDizaines}\\times 10-${ajoutOuRetrait}$, donc $${nombre}$ c'est ${texteEnCouleurEtGras(`$${chiffreDizaines}$ fois $10$ et j'enlève $${ajoutOuRetrait}$`)}.`
    } else {
      this.correction =
        monQcm.texteCorr +
        `$${nombre}=${chiffreDizaines}\\times 10+${ajoutOuRetrait}$, donc $${nombre}$ c'est ${texteEnCouleurEtGras(`$${chiffreDizaines}$ fois $10$ et j'ajoute $${ajoutOuRetrait}$`)}.`
    }

    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(78, 8, 2, 'soustraction')
    else this.enonce()
  }
}
