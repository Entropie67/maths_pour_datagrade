import { bleuMathalea } from '../../../lib/colors'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { texteEnCouleur, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Comparer des périmètres (V/F)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '79035'

export const refs = {
  'fr-fr': ['can6M1-01', 'CM1M1H-flash1'],
  'fr-ch': [],
}
export default class QuestionDePerimetres extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(3, 25)
      const b = randint(0, 1)
      const VF = [false, true]
      let texte = `Un carré de côté $${a}\\text{ cm}$ a le même périmètre qu'un rectangle de largeur $${a - b}\\text{ cm}$ et de longueur $${a + 1}\\text{ cm}$. `
      this.canEnonce = texte
      this.autoCorrection[i] = {
        enonce: texte,
        propositions: [
          {
            texte: 'Vrai',
            statut: VF[b],
          },
          {
            texte: 'Faux',
            statut: VF[1 - b],
          },
        ],
        options: { ordered: true, radio: true },
      }
      const monQcm = propositionsQcm(this, i)
      if (!context.isAmc) {
        texte += monQcm.texte
      }
      this.correction = VF[b]
        ? `${texteEnCouleurEtGras('Vrai')} <br>
      $\\bullet$ Pour le carré : $4\\times ${a}=${4 * a}\\text{ cm}$.<br>
      $\\bullet$ Pour le rectangle : $2\\times (${a - b}+ ${a + 1}) = ${4 * a}\\text{ cm}$.`
        : `${texteEnCouleurEtGras('Faux')} <br>
      $\\bullet$ Pour le carré : $4\\times ${a}=${4 * a}\\text{ cm}$.<br>
      $\\bullet$ Pour le rectangle : $2\\times (${a}+${a + 1})= ${2 * 2 * a + 2}\\text{ cm}$.`
      this.correction += VF[b]
        ? texteEnCouleur(`<br> Mentalement : <br>
           Pour le rectangle, la somme de la longueur $${a + 1}$ et de la largeur $${a - b}$ donne le demi-périmètre : $${2 * a - b + 1}$.<br>
      Pour avoir son périmètre, on multiplie par $2$, on obtient : $2\\times ${2 * a - b + 1}=${4 * a - 2 * b + 2}$.`, bleuMathalea)
        : texteEnCouleur(`<br> Mentalement : <br>
      Pour le rectangle, la somme de la longueur $${a + 1}$ et de la largeur $${a}$ donne le demi-périmètre : $${2 * a + 1}$.<br>
      Pour avoir son périmètre, on multiplie par $2$, on obtient : $2\\times ${2 * a + 1}=${4 * a + 2}$.
      `, bleuMathalea)

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = this.correction
        this.listeCanEnonces[i] = this.canEnonce
        this.listeCanReponsesACompleter[i] = monQcm.texte
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
