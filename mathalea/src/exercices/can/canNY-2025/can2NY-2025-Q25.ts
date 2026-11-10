import { propositionsQcm } from '../../../lib/interactif/qcm'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un multiple'

export const uuid = '82a2f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author GM+EE

*/
export default class diviseur extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatInteractif = 'qcm'
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', [9, 27, 25, 75, 6, 13, 17, 7, 11, 15])

    const correctionOui = `${texteEnCouleurEtGras('Oui')}, $${a}$ est un diviseur de $${texNombre(2025, 0)}$ car `
    this.question = `$${a}$ est-il un diviseur de $${texNombre(2025, 0)}$ ? <br>
    On pourra s'aider de la décomposition  en produits de facteurs premiers :  $${texNombre(2025, 0)}=3^4\\times 5^2$.`
    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce: `$${a}$ est-il un diviseur de $${texNombre(2025, 0)}$ ?<br>
       On pourra s'aider de la décomposition  en produits de facteurs premiers :  $${texNombre(2025, 0)}=3^4\\times 5^2$.`,
      propositions: [
        {
          texte: 'OUI',
          statut: a === 9 || a === 27 || a === 25 || a === 75 || a === 15,
        },
        {
          texte: 'NON',
          statut:
            a === 6 || a === 13 || a === 17 || a === 7 || a === 11 || a === 8,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)
    this.question =
      `$${texNombre(2025)}$ est-il un multiple de $${a}$ ? ` + qcm.texte
    this.canEnonce = `$${texNombre(2025)}$ est-il un multiple de $${a}$ ? `
    this.canReponseACompleter = `OUI ${sp(7)} NON`
    if (a === 13 || a === 17 || a === 11 || a === 7) {
      this.correction = `$${a}$ est un nombre premier, il n'apparaît pas dans la décomposition, donc ${texteEnCouleurEtGras('non')}, $${a}$ n'est pas un diviseur de $${texNombre(2025, 0)}$.`
    } else if (a === 6) {
      this.correction = `${texteEnCouleurEtGras('Non')}, $${a}$ n'est pas un diviseur de $${texNombre(2025, 0)}$ car $3$ n'est pas un diviseur de $${texNombre(2025, 0)}$. `
    } else if (a === 8) {
      this.correction = `${texteEnCouleurEtGras('Non')}, $${a}$ n'est pas un diviseur de $${texNombre(2025, 0)}$ car $2$ n'est pas un diviseur de $${texNombre(2025, 0)}$. `
    } else if (a === 9) {
      this.correction = `${correctionOui} $3^2=9$  est un diviseur de $${texNombre(2025, 0)}$ (on le sait grâce à la décomposition).`
    } else if (a === 27) {
      this.correction = `${correctionOui} $3^3=27$  est un diviseur de $${texNombre(2025, 0)}$ (on le sait grâce à la décomposition).`
    } else if (a === 25) {
      this.correction = `${correctionOui} $5^2=25$  est un diviseur de $${texNombre(2025, 0)}$ (on le sait grâce à la décomposition).`
    } else if (a === 75) {
      this.correction = `${correctionOui} $3\\times 5^2=75$  est un diviseur de $${texNombre(2025, 0)}$ (on le sait grâce à la décomposition).`
    } else if (a === 15) {
      this.correction = `${correctionOui} $3\\times 5=15$  est un diviseur de $${texNombre(2025, 0)}$ (on le sait grâce à la décomposition).`
    }
  }
}
