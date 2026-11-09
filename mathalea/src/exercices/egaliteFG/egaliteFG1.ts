import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence, texteItalique } from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = "Julie et Paul réussiront-ils à être à l'heure ?"
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = 'cb676'
export const refs = {
  'fr-fr': ['EgaliteFG1-6e-1'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Durées']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG1 extends Exercice {
  commentaireDebat = ''

  constructor() {
    super()
    this.pasDeVersionAleatoire = true
    this.consigne = texteItalique(
      "D'après " +
        ajouterLien(
          'https://nuage03.apps.education.fr/index.php/s/NZgmoFpcSCW8Cag?dir=/&editing=false&openfile=true',
          "«\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles",
        ),
    )
    this.consigne +=
      "<br><br>Julie et Paul, frère et sœur, doivent rentrer chez eux à $17\\text{h}45$ au plus tard, sinon ils vont rater leur émission préférée sur les mathématiques qui commence à cette heure-là. Mais ils ne sont pas d'accord sur le meilleur chemin pour rentrer chez eux depuis leur collège. Ils sortent du collège à $17\\text{h}03$. Ayant chacun un itinéraire différent en tête, ils commencent à discuter pour décider quel chemin emprunter.<br>" +
      "Julie pense qu'il est plus rapide d'attendre le bus de $17\\text{h}20$. Le trajet en bus dure $14$ minutes, puis il faut encore marcher $4$ minutes pour arriver à la maison.<br>" +
      'Paul préfère marcher directement $15$ minutes pour prendre le métro de $17\\text{h}26$. Le trajet en métro dure $10$ minutes, et ensuite il faut encore marcher $2$ minutes pour arriver à la maison.<br>' +
      "Ils doivent comparer chaque chemin et s'assurer qu'ils arrivent à temps pour leur émission tout en évitant de se perdre dans la discussion. Le temps presse, et ils doivent rapidement trouver un compromis. Analyse leur stratégie."
    this.nbQuestions = 2
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      `Pour débattre.<br>Pourquoi penses-tu que Julie choisit le bus et Paul le métro${sp()}? Est-ce que cela reflète un stéréotype sur les choix des transports ou les rôles des filles et des garçons${sp()}?`
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 =
      `À quelle heure Julie arrivera-t-elle à la maison si elle prend le bus${sp()}? Donne ta réponse en nombre de minutes après $17\\text{h}00$ (par exemple, $38$ pour $17\\text{h}38$).`
    if (this.interactif)
      texte0 +=
        ajouteChampTexteMathLive(this, 0, '', { texteApres: 'min' }) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 38 } })
    const correction0 = `$17\\text{h}20 \\xrightarrow{+14~\\text{min}} 17\\text{h}34 \\xrightarrow{+4~\\text{min}} 17\\text{h}38$<br>Julie arrive donc chez elle à $17\\text{h}38$, soit $${miseEnEvidence('38')}$ minutes après $17\\text{h}00$.`

    let texte1 =
      `À quelle heure Paul arrivera-t-il à la maison en prenant le métro${sp()}? Donne ta réponse en nombre de minutes après $17\\text{h}00$.`
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: 'min' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 38 } })
    const correction1 = `$17\\text{h}26 \\xrightarrow{+10~\\text{min}} 17\\text{h}36 \\xrightarrow{+2~\\text{min}} 17\\text{h}38$<br>Paul arrive donc chez lui à $17\\text{h}38$, soit $${miseEnEvidence('38')}$ minutes après $17\\text{h}00$.<br>Julie et Paul arrivent donc tous les deux à la même heure, $17\\text{h}38$, bien avant $17\\text{h}45$${sp()}: les deux chemins sont finalement équivalents${sp()}!`

    this.listeQuestions[0] = texte0
    this.listeCorrections[0] = correction0
    this.listeQuestions[1] = texte1
    this.listeCorrections[1] = correction1
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat

    listeQuestionsToContenu(this)
  }
}
