import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { nombreEnLettres } from '../../../modules/nombreEnLettres'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Écrire en lettres un nombre entier (QCM)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * @author Jean-claude Lhote
 * Date de publication septembre 2021

 */
export const uuid = 'f7ad2'

export const refs = {
  'fr-fr': ['canc3N01'],
  'fr-ch': [],
}
export default class EcritureDeNombreEntier extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(1, 9)
      const b = randint(1, 9, a)
      const c = randint(1, 9, [a, b])
      let n1, n2, n3
      switch (choice([1, 2, 3])) {
        case 1:
          n1 = a * 1000 + b * 100 + c
          n2 = a * 1000 + b * 10 + c
          n3 = a * 1000 + b * 100 + c * 10
          break
        case 2:
          n1 = a * 1000 + b * 10 + c
          n2 = a * 1000 + b * 100 + c
          n3 = a * 1000 + b * 100 + c * 10
          break
        case 3:
        default:
          n1 = a * 1000 + b * 100 + c * 10
          n2 = a * 1000 + b * 100 + c
          n3 = a * 1000 + b * 10 + c
          break
      }
      let texte = `Le nombre $${texNombre(n1)}$ s'écrit (coche la bonne réponse) :<br>`
      this.canEnonce = `Quelle est l'écriture du nombre $${texNombre(n1)}$ ?`
      this.autoCorrection[i] = {
        enonce: texte,
        options: { vertical: true },
        propositions: [
          {
            texte: nombreEnLettres(n1),
            statut: true,
          },
          {
            texte: nombreEnLettres(n2),
            statut: false,
          },
          {
            texte: nombreEnLettres(n3),
            statut: false,
          },
        ],
      }
      const monQcm = propositionsQcm(this, i)
      if (!context.isAmc) {
        texte += monQcm.texte
      }
      const texteCorr = `$${texNombre(n1)}$ s'écrit ${texteEnCouleurEtGras(nombreEnLettres(n1))}.`
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      this.canReponseACompleter = monQcm.texte
      this.listeCanEnonces.push(this.canEnonce)
      this.listeCanReponsesACompleter.push(this.canReponseACompleter)
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
