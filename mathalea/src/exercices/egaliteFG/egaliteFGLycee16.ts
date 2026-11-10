import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence, texteItalique } from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Les filières technologiques'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '9ca12'
export const refs = {
  'fr-fr': ['EgaliteFG6-1e-16'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Statistiques']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee16 extends Exercice {
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
      `<br><br>Voici les effectifs des classes de première technologique d'un lycée${sp()}:<br>`
    const tableauHtml = `<table style="border-collapse: collapse; margin: 10px 0;">
      <tr><th style="border: 1px solid #888; padding: 4px 10px;"></th><th style="border: 1px solid #888; padding: 4px 10px;">Filles</th><th style="border: 1px solid #888; padding: 4px 10px;">Garçons</th><th style="border: 1px solid #888; padding: 4px 10px;">Total</th></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1<sup>re</sup> STMG</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$54$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$90$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$144$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1<sup>re</sup> ST2S</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$59$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$18$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$77$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1<sup>re</sup> STI2D</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$27$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$72$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$99$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1<sup>re</sup> STL</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$60$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$18$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$78$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1<sup>re</sup> STD2A</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$34$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$18$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$52$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Total</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$234$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$216$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$450$</td></tr>
      </table>`
    const tableauLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|}\n\\hline\n' +
      ' & Filles & Garçons & Total \\\\\n\\hline\n' +
      '1re STMG & $54$ & $90$ & $144$ \\\\\n\\hline\n' +
      '1re ST2S & $59$ & $18$ & $77$ \\\\\n\\hline\n' +
      '1re STI2D & $27$ & $72$ & $99$ \\\\\n\\hline\n' +
      '1re STL & $60$ & $18$ & $78$ \\\\\n\\hline\n' +
      '1re STD2A & $34$ & $18$ & $52$ \\\\\n\\hline\n' +
      'Total & $234$ & $216$ & $450$ \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    this.consigne += context.isHtml ? tableauHtml : tableauLatex
    this.nbQuestions = 7
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const texte0 =
      'Construire le tableau des fréquences et des fréquences marginales associé.'
    const tableauFreqHtml =
      '<table style="border-collapse: collapse; margin: 10px 0;">' +
      '<tr><th style="border: 1px solid #888; padding: 4px 10px;"></th><th style="border: 1px solid #888; padding: 4px 10px;">Filles</th><th style="border: 1px solid #888; padding: 4px 10px;">Garçons</th><th style="border: 1px solid #888; padding: 4px 10px;">Total</th></tr>' +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1<sup>re</sup> STMG</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$12{,}00\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$20{,}00\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$32{,}00\\,\\%$</td></tr>` +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1<sup>re</sup> ST2S</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$13{,}11\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$4{,}00\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$17{,}11\\,\\%$</td></tr>` +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1<sup>re</sup> STI2D</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$6{,}00\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$16{,}00\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$22{,}00\\,\\%$</td></tr>` +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1<sup>re</sup> STL</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$13{,}33\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$4{,}00\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$17{,}33\\,\\%$</td></tr>` +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1<sup>re</sup> STD2A</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$7{,}56\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$4{,}00\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$11{,}56\\,\\%$</td></tr>` +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Total</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$52{,}00\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$48{,}00\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$100\\,\\%$</td></tr>` +
      '</table>'
    const tableauFreqLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|}\n\\hline\n' +
      ' & Filles & Garçons & Total \\\\\n\\hline\n' +
      '1re STMG & $12{,}00\\,\\%$ & $20{,}00\\,\\%$ & $32{,}00\\,\\%$ \\\\\n\\hline\n' +
      '1re ST2S & $13{,}11\\,\\%$ & $4{,}00\\,\\%$ & $17{,}11\\,\\%$ \\\\\n\\hline\n' +
      '1re STI2D & $6{,}00\\,\\%$ & $16{,}00\\,\\%$ & $22{,}00\\,\\%$ \\\\\n\\hline\n' +
      '1re STL & $13{,}33\\,\\%$ & $4{,}00\\,\\%$ & $17{,}33\\,\\%$ \\\\\n\\hline\n' +
      '1re STD2A & $7{,}56\\,\\%$ & $4{,}00\\,\\%$ & $11{,}56\\,\\%$ \\\\\n\\hline\n' +
      'Total & $52{,}00\\,\\%$ & $48{,}00\\,\\%$ & $100\\,\\%$ \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    const correction0 =
      (context.isHtml ? tableauFreqHtml : tableauFreqLatex) +
      "(chaque effectif est divisé par l'effectif total, $450$.)"

    let texte1 =
      `Quel est le pourcentage d'élèves en 1re ST2S (arrondi au centième)${sp()}?`
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 17.11 } })
    const correction1 = `$\\dfrac{77}{450}\\approx ${miseEnEvidence('17{,}11')}\\,\\%$.`

    let texte2 =
      `Quel est le pourcentage de filles en 1re STI2D (arrondi au centième)${sp()}?`
    if (this.interactif)
      texte2 +=
        ajouteChampTexteMathLive(this, 2, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 27.27 } })
    const correction2 = `$\\dfrac{27}{99}\\approx ${miseEnEvidence('27{,}27')}\\,\\%$.`

    let texte3 =
      `Parmi les élèves de 1re STL, quel est le pourcentage de filles (arrondi au centième)${sp()}?`
    if (this.interactif)
      texte3 +=
        ajouteChampTexteMathLive(this, 3, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 76.92 } })
    const correction3 = `$\\dfrac{60}{78}\\approx ${miseEnEvidence('76{,}92')}\\,\\%$.`

    let texte4 =
      `Parmi les garçons, quel est le pourcentage d'élèves qui choisit de s'orienter en ST2S (arrondi au centième)${sp()}?`
    if (this.interactif)
      texte4 +=
        ajouteChampTexteMathLive(this, 4, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 4, { reponse: { value: 8.33 } })
    const correction4 = `$\\dfrac{18}{216}\\approx ${miseEnEvidence('8{,}33')}\\,\\%$.`

    const texte5 =
      `En construisant le tableau des fréquences conditionnelles par ligne, que peut-on déduire quant à la proportion des élèves dans chaque filière technologique au regard de leur genre${sp()}?`
    const correction5 =
      `On constate un très fort déséquilibre selon les filières${sp()}: les filles sont largement majoritaires en ST2S ($\\approx 76{,}6\\,\\%$) et en STL ($\\approx 76{,}9\\,\\%$), alors qu'elles sont minoritaires en STI2D ($\\approx 27{,}3\\,\\%$). Ce contraste illustre une orientation encore très genrée selon les filières technologiques (santé/social et laboratoire perçus comme féminins, industrie perçue comme masculine).`

    const texte6 =
      "À l'aide du tableau des fréquences conditionnelles par colonne, donner une répartition sous forme de diagramme circulaire des différentes filières auprès des filles et auprès des garçons, puis comparer ces diagrammes entre eux."
    const correction6 =
      `Chez les filles ($234$ élèves)${sp()}: STMG $\\dfrac{54}{234}\\approx 23{,}1\\,\\%$, ST2S $\\dfrac{59}{234}\\approx 25{,}2\\,\\%$, STI2D $\\dfrac{27}{234}\\approx 11{,}5\\,\\%$, STL $\\dfrac{60}{234}\\approx 25{,}6\\,\\%$, STD2A $\\dfrac{34}{234}\\approx 14{,}5\\,\\%$.<br>` +
      `Chez les garçons ($216$ élèves)${sp()}: STMG $\\dfrac{90}{216}\\approx 41{,}7\\,\\%$, ST2S $\\dfrac{18}{216}\\approx 8{,}3\\,\\%$, STI2D $\\dfrac{72}{216}\\approx 33{,}3\\,\\%$, STL $\\dfrac{18}{216}\\approx 8{,}3\\,\\%$, STD2A $\\dfrac{18}{216}\\approx 8{,}3\\,\\%$.<br>` +
      `Les deux diagrammes circulaires ont des profils très différents${sp()}: chez les filles, les quatre filières hors STMG se partagent des parts comparables (entre $11$ et $26\\,\\%$), alors que chez les garçons, STMG et STI2D dominent nettement (à eux deux, $75\\,\\%$ des garçons), tandis que ST2S et STL restent marginales. Cela confirme, sous un autre angle, l'orientation très genrée observée par filière.`

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
    this.listeQuestions[6] = texte6
    this.listeCorrections[6] = correction6

    // Construction d'un tableau : pas de réponse courte.
    this.listeReponsesCourtes[0] = null
    // Réponse rédigée : pas de réponse courte.
    this.listeReponsesCourtes[5] = null
    // Construction de diagrammes et comparaison : pas de réponse courte.
    this.listeReponsesCourtes[6] = null
    listeQuestionsToContenu(this)
  }
}
