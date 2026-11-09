import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Shakuntala Devi : le café qui coule'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '5b75c'
export const refs = {
  'fr-fr': ['EgaliteFG4-3e-20'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Lecture graphique','Fonctions']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG20 extends Exercice {
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
      (context.isHtml
        ? `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/devi-portrait.jpg" alt="Portrait de Shakuntala Devi" style="width:130px; height:auto; border-radius:9999px; border:3px solid #f15929;"><p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Shakuntala Devi (1929-2013) — Source${sp()}: Central News Agency, 1968, domaine public à Taïwan</p></div>`
        : '') +
      "<br>Shakuntala Devi (1929-2013), surnommée «\u00a0l'ordinateur humain\u00a0», est une prodige indienne du calcul mental, capable de résoudre les multiplications les plus compliquées sans aucun appareil technologique.<br>" +
      "Une machine expresso transfère le café de son réservoir vers une tasse. La tasse est vide au départ, et on considère qu'elle est pleine lorsqu'elle contient $80$ mL de café." +
      (context.isHtml
        ? `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/reservoir-pompe-tasse.jpg" alt="Machine expresso${sp()}: réservoir, pompe et tasse de 80 mL" style="max-width:380px; width:100%; height:auto;"></div>`
        : '') +
      'On modélise le volume de café dans la tasse, en fonction du temps $x$ (en secondes) écoulé depuis la mise en marche de la machine, par le graphique ci-dessous.' +
      (context.isHtml
        ? '<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/graphe-volume-temps.jpg" alt="Graphique du volume de café (en mL) en fonction du temps (en s)" style="max-width:420px; width:100%; height:auto;"></div>'
        : '')
    this.nbQuestions = 6
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      `.<br>Shakuntala Devi était capable de résoudre mentalement des calculs bien plus vite que des ordinateurs de son époque. Pourtant, elle fut souvent présentée comme une «\u00a0exception féminine\u00a0».<br>Est-il plus difficile pour une femme d'être reconnue comme «\u00a0experte\u00a0»${sp()}?<br>Y a-t-il aujourd'hui encore des domaines (mathématiques, calcul, logique $\\ldots$) où les filles doivent «\u00a0prouver plus\u00a0»${sp()}?`
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 =
      `D'après le graphique, quel est le temps de préchauffage de la machine${sp()}?`
    if (this.interactif)
      texte0 +=
        ajouteChampTexteMathLive(this, 0, '', { texteApres: 's' }) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 25 } })
    const correction0 = `Sur le graphique, le café ne commence à couler qu'à partir de $x=25$ s${sp()}: le temps de préchauffage est donc de $${miseEnEvidence('25')}$ secondes.`

    let texte1 =
      `On admet que, une fois le préchauffage terminé, ce volume est modélisé par la fonction $f$ définie par $f(x)=4(x-25)$.<br>Au bout de $30$ secondes, quel est le volume de café dans la tasse${sp()}?`
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: 'mL' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 20 } })
    const correction1 = `$f(30)=4\\times(30-25)=4\\times 5=${miseEnEvidence('20')}$ mL.`

    let texte2 =
      `Au bout de combien de temps la tasse contient-elle $60$ mL de café${sp()}?`
    if (this.interactif)
      texte2 +=
        ajouteChampTexteMathLive(this, 2, '', { texteApres: 's' }) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 40 } })
    const correction2 = `On cherche $x$ tel que $4(x-25)=60$, soit $x-25=15$, donc $x=40$${sp()}: au bout de $${miseEnEvidence('40')}$ secondes.`

    let texte3 =
      `En combien de temps la tasse est-elle pleine ($80$ mL), sans compter le temps de préchauffage${sp()}?`
    if (this.interactif)
      texte3 +=
        ajouteChampTexteMathLive(this, 3, '', { texteApres: 's' }) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 20 } })
    const correction3 = `On cherche $x$ tel que $4(x-25)=80$, soit $x-25=20$, donc $x=45$${sp()}: la tasse est pleine au bout de $45$ secondes depuis le départ, soit $45-25=${miseEnEvidence('20')}$ secondes après la fin du préchauffage.`

    let texte4 =
      "Calculer l'image de $38$ par la fonction $f$. Interpréter ce résultat."
    if (this.interactif)
      texte4 +=
        ajouteChampTexteMathLive(this, 4, '', { texteApres: 'mL' }) + '<br>'
    handleAnswers(this, 4, { reponse: { value: 52 } })
    const correction4 = `$f(38)=4\\times(38-25)=4\\times 13=52$${sp()}: au bout de $38$ secondes, la tasse contient $${miseEnEvidence('52')}$ mL de café.`

    let texte5 =
      `La tasse déborde au bout de $50$ secondes. Quel est le volume de cette dernière${sp()}?`
    if (this.interactif)
      texte5 +=
        ajouteChampTexteMathLive(this, 5, '', { texteApres: 'mL' }) + '<br>'
    handleAnswers(this, 5, { reponse: { value: 100 } })
    const correction5 = `$f(50)=4\\times(50-25)=4\\times 25=100$${sp()}: la tasse a donc un volume de $${miseEnEvidence('100')}$ mL.`

    this.listeQuestions[0] = texte0
    this.listeCorrections[0] = correction0
    this.listeQuestions[1] = texte1
    this.listeCorrections[1] = correction1
    this.listeQuestions[2] = texte2
    this.listeCorrections[2] = correction2
    this.listeQuestions[3] = texte3
    this.listeCorrections[3] = correction3
    this.listeQuestions[4] = texte4
    this.listeCorrections[4] = correction4
    this.listeQuestions[5] = texte5
    this.listeCorrections[5] = correction5
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat

    listeQuestionsToContenu(this)
  }
}
