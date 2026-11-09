import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence, texteEnCouleurEtGras, texteItalique } from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Tabagisme au travail : un paradoxe statistique'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '49e3a'
export const refs = {
  'fr-fr': ['EgaliteFG6-1e-12'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Statistiques']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee12 extends Exercice {
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
      `<br><br>Une caisse d'assurance maladie emploie $1\\,630$ personnes. Voici les effectifs par catégorie${sp()}:<br>`
    const tableauHtml = `<table style="border-collapse: collapse; margin: 10px 0;">
      <tr><th style="border: 1px solid #888; padding: 4px 10px;"></th><th style="border: 1px solid #888; padding: 4px 10px;">De $18$ à $30$ ans</th><th style="border: 1px solid #888; padding: 4px 10px;">De $31$ à $50$ ans</th><th style="border: 1px solid #888; padding: 4px 10px;">Plus de $50$ ans</th><th style="border: 1px solid #888; padding: 4px 10px;">Total</th></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Hommes</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$150$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$600$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$230$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$980$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Femmes</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$500$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$50$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$100$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$650$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Total</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$650$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$650$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$330$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$1\\,630$</td></tr>
      </table>
      <p>Les pourcentages de fumeurs du personnel sont les suivants${sp()}:</p>
      <table style="border-collapse: collapse; margin: 10px 0;">
      <tr><th style="border: 1px solid #888; padding: 4px 10px;"></th><th style="border: 1px solid #888; padding: 4px 10px;">De $18$ à $30$ ans</th><th style="border: 1px solid #888; padding: 4px 10px;">De $31$ à $50$ ans</th><th style="border: 1px solid #888; padding: 4px 10px;">Plus de $50$ ans</th></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Hommes</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$60\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$25\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$30\\,\\%$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Femmes</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$50\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$20\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$25\\,\\%$</td></tr>
      </table>
      <p>La cheffe de centre affirme que les femmes, tranche d'âge par tranche d'âge, fument moins que les hommes.</p>`
    const tableauLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|c|}\n\\hline\n' +
      ' & De $18$ à $30$ ans & De $31$ à $50$ ans & Plus de $50$ ans & Total \\\\\n\\hline\n' +
      'Hommes & $150$ & $600$ & $230$ & $980$ \\\\\n\\hline\n' +
      'Femmes & $500$ & $50$ & $100$ & $650$ \\\\\n\\hline\n' +
      'Total & $650$ & $650$ & $330$ & $1\\,630$ \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n' +
      `Les pourcentages de fumeurs du personnel sont les suivants${sp()}:<br>` +
      '\\begin{center}\\begin{tabular}{|l|c|c|c|}\n\\hline\n' +
      ' & De $18$ à $30$ ans & De $31$ à $50$ ans & Plus de $50$ ans \\\\\n\\hline\n' +
      'Hommes & $60\\,\\%$ & $25\\,\\%$ & $30\\,\\%$ \\\\\n\\hline\n' +
      'Femmes & $50\\,\\%$ & $20\\,\\%$ & $25\\,\\%$ \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n' +
      "La cheffe de centre affirme que les femmes, tranche d'âge par tranche d'âge, fument moins que les hommes.<br>"
    this.consigne += context.isHtml ? tableauHtml : tableauLatex
    this.nbQuestions = 6
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const texte0 =
      "Réaliser le tableau des effectifs des fumeurs suivant leur appartenance aux différentes catégories (sexe et tranche d'âge)."
    const tableauFumeursHtml =
      '<table style="border-collapse: collapse; margin: 10px 0;">' +
      '<tr><th style="border: 1px solid #888; padding: 4px 10px;"></th><th style="border: 1px solid #888; padding: 4px 10px;">De $18$ à $30$ ans</th><th style="border: 1px solid #888; padding: 4px 10px;">De $31$ à $50$ ans</th><th style="border: 1px solid #888; padding: 4px 10px;">Plus de $50$ ans</th><th style="border: 1px solid #888; padding: 4px 10px;">Total</th></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Hommes</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$90$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$150$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$69$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$309$</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Femmes</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$250$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$10$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$25$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$285$</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Total</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$340$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$160$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$94$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$594$</td></tr>' +
      '</table>'
    const tableauFumeursLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|c|}\n\\hline\n' +
      ' & De $18$ à $30$ ans & De $31$ à $50$ ans & Plus de $50$ ans & Total \\\\\n\\hline\n' +
      'Hommes & $90$ & $150$ & $69$ & $309$ \\\\\n\\hline\n' +
      'Femmes & $250$ & $10$ & $25$ & $285$ \\\\\n\\hline\n' +
      'Total & $340$ & $160$ & $94$ & $594$ \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    const correction0 =
      `Fumeurs hommes${sp()}: $150\\times 0{,}6=90$ (de $18$ à $30$ ans), $600\\times 0{,}25=150$ (de $31$ à $50$ ans), $230\\times 0{,}3=69$ (plus de $50$ ans), soit un total de $90+150+69=309$.<br>` +
      `Fumeurs femmes${sp()}: $500\\times 0{,}5=250$ (de $18$ à $30$ ans), $50\\times 0{,}2=10$ (de $31$ à $50$ ans), $100\\times 0{,}25=25$ (plus de $50$ ans), soit un total de $250+10+25=285$.<br>` +
      (context.isHtml ? tableauFumeursHtml : tableauFumeursLatex)

    let texte1 =
      `Quel est le pourcentage de fumeurs dans l'ensemble du personnel (arrondi au centième)${sp()}?`
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 36.44 } })
    const correction1 = `$\\dfrac{594}{1\\,630}\\approx ${miseEnEvidence('36{,}44')}\\,\\%$.`

    let texte2 =
      'Calculer le pourcentage de fumeurs parmi les hommes (arrondi au centième).'
    if (this.interactif)
      texte2 +=
        ajouteChampTexteMathLive(this, 2, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 31.53 } })
    const correction2 = `$\\dfrac{309}{980}\\approx ${miseEnEvidence('31{,}53')}\\,\\%$.`

    let texte3 =
      'Calculer le pourcentage de fumeurs parmi les femmes (arrondi au centième).'
    if (this.interactif)
      texte3 +=
        ajouteChampTexteMathLive(this, 3, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 43.85 } })
    const correction3 = `$\\dfrac{285}{650}\\approx ${miseEnEvidence('43{,}85')}\\,\\%$.`

    const texteQ4 =
      `L'affirmation de la cheffe de centre (tranche d'âge par tranche d'âge, les femmes fument moins que les hommes) est-elle vraie${sp()}?`
    this.autoCorrection[4] = {
      enonce: texteQ4,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Vrai', statut: true },
        { texte: 'Faux', statut: false },
      ],
    }
    const monQcm4 = propositionsQcm(this, 4)
    let texte4 = texteQ4
    if (!context.isAmc) texte4 += monQcm4.texte
    const correction4 = `${texteEnCouleurEtGras('Vrai')}${sp()}: dans chaque tranche d'âge, le pourcentage de fumeuses est inférieur à celui des fumeurs ($50\\,\\%<60\\,\\%$, $20\\,\\%<25\\,\\%$, $25\\,\\%<30\\,\\%$).`

    const texteQ5 =
      `Au vu de ces résultats, peut-on pour autant affirmer, globalement (toutes tranches d'âge confondues), que les femmes fument moins que les hommes dans cette entreprise${sp()}?`
    this.autoCorrection[5] = {
      enonce: texteQ5,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Oui', statut: false },
        { texte: 'Non, au contraire', statut: true },
      ],
    }
    const monQcm5 = propositionsQcm(this, 5)
    let texte5 = texteQ5
    if (!context.isAmc) texte5 += monQcm5.texte
    const correction5 = `Non${sp()}: globalement, $43{,}85\\,\\%$ des femmes fument contre seulement $31{,}53\\,\\%$ des hommes, soit l'inverse de ce que suggère la comparaison par tranche d'âge${sp()}! Cela s'explique par le fait que les femmes de cette entreprise sont très majoritairement jeunes ($500$ sur $650$ ont entre $18$ et $30$ ans, tranche où le tabagisme est le plus élevé), alors que les hommes sont surtout dans la tranche de $31$ à $50$ ans ($600$ sur $980$), où le tabagisme est plus faible. Ce phénomène, où une tendance vraie dans chaque sous-groupe s'inverse au global à cause d'une répartition différente des effectifs, est un exemple classique de ${texteEnCouleurEtGras('paradoxe de Simpson')}.`

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

    // Construction d'un tableau d'effectifs : pas de réponse courte.
    this.listeReponsesCourtes[0] = null
    listeQuestionsToContenu(this)
  }
}
