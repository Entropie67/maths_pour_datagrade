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

export const titre = 'Clubs de la pause méridienne : filles et garçons'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = 'ce1f4'
export const refs = {
  'fr-fr': ['EgaliteFG2-5e-7'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Probabilités']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG7 extends Exercice {
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
      `<br><br>Un collège propose trois clubs pendant la pause méridienne. Voici un tableau qui représente les réponses des élèves de 5<sup>e</sup> à un sondage sur leur participation à un club${sp()}:<br>`
    const tableauHtml = `<table style="border-collapse: collapse; margin: 10px 0;">
      <tr><th style="border: 1px solid #888; padding: 4px 10px;">Clubs</th><th style="border: 1px solid #888; padding: 4px 10px;">Filles</th><th style="border: 1px solid #888; padding: 4px 10px;">Garçons</th><th style="border: 1px solid #888; padding: 4px 10px;">Total</th></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Ludothèque</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">3</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">5</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Danse</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">9</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">10</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Robotique</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">3</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">10</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">13</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Éloquence</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">4</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">5</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Total</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">18</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">15</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">33</td></tr>
      </table>`
    const tableauLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|}\n\\hline\n' +
      'Clubs & Filles & Garçons & Total \\\\\n\\hline\n' +
      'Ludothèque & 2 & 3 & 5 \\\\\n\\hline\n' +
      'Danse & 9 & 1 & 10 \\\\\n\\hline\n' +
      'Robotique & 3 & 10 & 13 \\\\\n\\hline\n' +
      'Éloquence & 4 & 1 & 5 \\\\\n\\hline\n' +
      'Total & 18 & 15 & 33 \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    this.consigne += context.isHtml ? tableauHtml : tableauLatex
    this.nbQuestions = 3
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      `.<br>Que pourrait-on conclure sur l'influence des stéréotypes de genre dans le choix des clubs${sp()}?`
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 =
      "Calculer la probabilité qu'un élève interrogé au hasard soit un garçon inscrit au club robotique (arrondie au millième)."
    if (this.interactif) texte0 += ajouteChampTexteMathLive(this, 0) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 0.303 } })
    const correction0 = `$p=\\dfrac{10}{33}\\approx ${miseEnEvidence('0{,}303')}$.`

    let texte1 =
      "Calculer la probabilité qu'un élève interrogé au hasard soit une fille inscrite à la danse (arrondie au millième)."
    if (this.interactif) texte1 += ajouteChampTexteMathLive(this, 1) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 0.273 } })
    const correction1 = `$p=\\dfrac{9}{33}=\\dfrac{3}{11}\\approx ${miseEnEvidence('0{,}273')}$.`

    const texte2 =
      'Comparer les probabilités des deux questions précédentes. Interpréter les résultats.'
    const correction2 =
      `$0{,}303 > 0{,}273$${sp()}: la probabilité qu'un élève au hasard soit un garçon inscrit à la robotique est légèrement supérieure à celle qu'un élève au hasard soit une fille inscrite à la danse, mais les deux valeurs restent proches. Ce qui est plus marquant, c'est le déséquilibre à l'intérieur de chaque club${sp()}: $10$ garçons sur $13$ inscrits en robotique, et $9$ filles sur $10$ inscrites en danse.`

    this.listeQuestions[0] = texte0
    this.listeCorrections[0] = correction0
    this.listeQuestions[1] = texte1
    this.listeCorrections[1] = correction1
    this.listeQuestions[2] = texte2
    this.listeCorrections[2] = correction2
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat

    this.listeReponsesCourtes[2] =
      `La probabilité «\u00a0garçon en robotique\u00a0» est légèrement supérieure${sp()}: $0{,}303>0{,}273$.`

    listeQuestionsToContenu(this)
  }
}
