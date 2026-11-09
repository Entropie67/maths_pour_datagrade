import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence, texteEnCouleurEtGras, texteItalique } from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Orientation en première'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '26347'
export const refs = {
  'fr-fr': ['EgaliteFG6-1e-15'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Probabilités']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee15 extends Exercice {
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
      `<br><br>Dans un lycée, on observe la répartition des élèves en première selon le tableau suivant${sp()}:<br>`
    const tableauHtml = `<table style="border-collapse: collapse; margin: 10px 0;">
      <tr><th style="border: 1px solid #888; padding: 4px 10px;">Filière</th><th style="border: 1px solid #888; padding: 4px 10px;">Filles</th><th style="border: 1px solid #888; padding: 4px 10px;">Garçons</th><th style="border: 1px solid #888; padding: 4px 10px;">Total</th></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Générale</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">180</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">200</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">380</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Technologique</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">120</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">100</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">220</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Professionnelle</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">60</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">100</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">160</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Total</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">360</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">400</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">760</td></tr>
      </table>`
    const tableauLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|}\n\\hline\n' +
      'Filière & Filles & Garçons & Total \\\\\n\\hline\n' +
      'Générale & 180 & 200 & 380 \\\\\n\\hline\n' +
      'Technologique & 120 & 100 & 220 \\\\\n\\hline\n' +
      'Professionnelle & 60 & 100 & 160 \\\\\n\\hline\n' +
      'Total & 360 & 400 & 760 \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    this.consigne += context.isHtml ? tableauHtml : tableauLatex
    this.nbQuestions = 4
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 =
      `Un élève est choisi au hasard. Quelle est la probabilité que ce soit une fille (arrondie au millième)${sp()}?`
    if (this.interactif) texte0 += ajouteChampTexteMathLive(this, 0) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 0.474 } })
    const correction0 = `$p=\\dfrac{360}{760}\\approx ${miseEnEvidence('0{,}474')}$.`

    let texte1 =
      `Un élève est choisi au hasard. Quelle est la probabilité que ce soit un garçon en filière technologique (arrondie au millième)${sp()}?`
    if (this.interactif) texte1 += ajouteChampTexteMathLive(this, 1) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 0.132 } })
    const correction1 = `$p=\\dfrac{100}{760}\\approx ${miseEnEvidence('0{,}132')}$.`

    let texte2 =
      `Un élève est choisi au hasard parmi les élèves en filière générale. Quelle est la probabilité que ce soit une fille (arrondie au millième)${sp()}?`
    if (this.interactif) texte2 += ajouteChampTexteMathLive(this, 2) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 0.474 } })
    const correction2 = `$p=\\dfrac{180}{380}\\approx ${miseEnEvidence('0{,}474')}$.`

    const texte3 =
      "Comparer les proportions des filles et des garçons dans chaque filière et expliquer ce que ces résultats révèlent sur les choix d'orientation selon le genre. On pourra s'aider d'un tableau des fréquences conditionnelles par ligne."
    const correction3 = `Tableau des fréquences conditionnelles par ligne (proportion de filles, puis de garçons, dans chaque filière)${sp()}: générale $\\dfrac{180}{380}\\approx 47{,}4\\,\\%$ / $\\dfrac{200}{380}\\approx 52{,}6\\,\\%$ (proche de la répartition globale $\\dfrac{360}{760}\\approx 47{,}4\\,\\%$ / $\\dfrac{400}{760}\\approx 52{,}6\\,\\%$${sp()}: pas de déséquilibre marqué) ; technologique $\\dfrac{120}{220}\\approx 54{,}5\\,\\%$ / $\\dfrac{100}{220}\\approx 45{,}5\\,\\%$ (légère surreprésentation des filles) ; professionnelle $\\dfrac{60}{160}=37{,}5\\,\\%$ / $\\dfrac{100}{160}=62{,}5\\,\\%$ (nette sous-représentation des filles, donc surreprésentation des garçons). Le choix de la filière professionnelle apparaît donc comme ${texteEnCouleurEtGras('le plus genré des trois')}.`

    this.listeQuestions[0] = texte0
    this.listeCorrections[0] = correction0
    this.listeQuestions[1] = texte1
    this.listeCorrections[1] = correction1
    this.listeQuestions[2] = texte2
    this.listeCorrections[2] = correction2
    this.listeQuestions[3] = texte3
    this.listeCorrections[3] = correction3

    listeQuestionsToContenu(this)
  }
}
