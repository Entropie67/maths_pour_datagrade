import {
  contraindreValeur,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Shikaku from '../6e/_Shikaku'
import Exercice from '../Exercice'
export const titre = 'Générer un Shikaku'

export const refs = {
  'fr-fr': ['P019'],
  'fr-ch': [],
}
export const uuid = '6fb13'

/**
 * @author Jean-claude Lhote
 */

export default class GenerateurShikaku extends Exercice {
  constructor() {
    super()
    this.consigne = `Paver la grille à l'aide de rectangles.<br>
  Chaque rectangle doit contenir un nombre et un seul.<br>
  Le nombre contenu dans un rectangle indique combien de cases le constituent.`
    this.besoinFormulaireNumerique = ['Largeur', 30]
    this.besoinFormulaire2Numerique = ['Hauteur', 30]
    this.sup = 12
    this.sup2 = 5
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const largeur = contraindreValeur(4, 30, this.sup, 12)
    const hauteur = contraindreValeur(4, 30, this.sup2, 5)
    for (
      let i = 0, shikaku, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      shikaku = new Shikaku(largeur, hauteur)
      texte = `${shikaku.represente('')}`
      texteCorr = shikaku.represente('solution')
      if (
        this.questionJamaisPosee(i, JSON.stringify(shikaku.pavage.rectangles))
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
