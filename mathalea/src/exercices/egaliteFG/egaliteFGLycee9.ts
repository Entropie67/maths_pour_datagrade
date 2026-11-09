import { imposerCorrectionsQcm } from '../../lib/interactif/alignerMiseEnEvidenceQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence, texteEnCouleurEtGras, texteItalique } from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Le choix des spécialités en terminale générale'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '60f12'
export const refs = {
  'fr-fr': ['EgaliteFG6-1e-9'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Statistiques', 'Pourcentages']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles (source : DEPP)
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee9 extends Exercice {
  constructor() {
    super()
    this.pasDeVersionAleatoire = true
    this.consigne = texteItalique(
      "D'après " +
        ajouterLien(
          'https://nuage03.apps.education.fr/index.php/s/NZgmoFpcSCW8Cag?dir=/&editing=false&openfile=true',
          "«\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles",
        ) +
        ` (source${sp()}: DEPP, Système d'information Scolarité)`,
    )
    this.consigne +=
      `<br><br>Depuis la réforme du lycée en 2019, de nombreuses enquêtes semblent montrer que le choix des enseignements de spécialité en première générale est dépendant du genre de l'élève. Voici la répartition des principaux enseignements de spécialité en terminale générale en 2022 et 2023${sp()}:<br>`
    const tableauHtml = `<table style="border-collapse: collapse; margin: 10px 0; font-size:0.85rem;">
      <tr><th style="border: 1px solid #888; padding: 4px 10px;" rowspan="2">Enseignements de spécialité</th><th style="border: 1px solid #888; padding: 4px 10px;" colspan="2">2022</th><th style="border: 1px solid #888; padding: 4px 10px;" colspan="2">2023</th></tr>
      <tr><th style="border: 1px solid #888; padding: 4px 10px;">Part des élèves</th><th style="border: 1px solid #888; padding: 4px 10px;">Proportion de filles</th><th style="border: 1px solid #888; padding: 4px 10px;">Part des élèves</th><th style="border: 1px solid #888; padding: 4px 10px;">Proportion de filles</th></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Mathématiques</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$39{,}6\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$40{,}6\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$43{,}7\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$41{,}6\\,\\%$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Sciences économiques et sociales</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$36{,}0\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$59{,}6\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$34{,}7\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$59{,}4\\,\\%$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Physique-chimie</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$30{,}1\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$46{,}9\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$31{,}1\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$46{,}2\\,\\%$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Histoire-géographie, géopolitique et sciences politiques</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$27{,}9\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$62{,}0\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$25{,}7\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$62{,}8\\,\\%$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Sciences de la vie et de la Terre</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$24{,}4\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$62{,}3\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$23{,}0\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$62{,}7\\,\\%$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Langues, littérature et cultures étrangères et régionales</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$18{,}9\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$71{,}8\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$18{,}2\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$72{,}6\\,\\%$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Humanités, littérature et philosophie</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$10{,}7\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$80{,}6\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$10{,}6\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$81{,}7\\,\\%$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Numérique et sciences informatiques</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$4{,}7\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$14{,}6\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$4{,}6\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$15{,}2\\,\\%$</td></tr>
      </table>
      <p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Source${sp()}: DEPP, Système d'information Scolarité</p>`
    const tableauLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|c|}\n\\hline\n' +
      ' & \\multicolumn{2}{c|}{2022} & \\multicolumn{2}{c|}{2023} \\\\\n\\hline\n' +
      'Enseignements de spécialité & Part des élèves & Proportion de filles & Part des élèves & Proportion de filles \\\\\n\\hline\n' +
      'Mathématiques & $39{,}6\\,\\%$ & $40{,}6\\,\\%$ & $43{,}7\\,\\%$ & $41{,}6\\,\\%$ \\\\\n\\hline\n' +
      'Sciences économiques et sociales & $36{,}0\\,\\%$ & $59{,}6\\,\\%$ & $34{,}7\\,\\%$ & $59{,}4\\,\\%$ \\\\\n\\hline\n' +
      'Physique-chimie & $30{,}1\\,\\%$ & $46{,}9\\,\\%$ & $31{,}1\\,\\%$ & $46{,}2\\,\\%$ \\\\\n\\hline\n' +
      'Histoire-géographie, géopolitique et sciences politiques & $27{,}9\\,\\%$ & $62{,}0\\,\\%$ & $25{,}7\\,\\%$ & $62{,}8\\,\\%$ \\\\\n\\hline\n' +
      'Sciences de la vie et de la Terre & $24{,}4\\,\\%$ & $62{,}3\\,\\%$ & $23{,}0\\,\\%$ & $62{,}7\\,\\%$ \\\\\n\\hline\n' +
      'Langues, littérature et cultures étrangères et régionales & $18{,}9\\,\\%$ & $71{,}8\\,\\%$ & $18{,}2\\,\\%$ & $72{,}6\\,\\%$ \\\\\n\\hline\n' +
      'Humanités, littérature et philosophie & $10{,}7\\,\\%$ & $80{,}6\\,\\%$ & $10{,}6\\,\\%$ & $81{,}7\\,\\%$ \\\\\n\\hline\n' +
      'Numérique et sciences informatiques & $4{,}7\\,\\%$ & $14{,}6\\,\\%$ & $4{,}6\\,\\%$ & $15{,}2\\,\\%$ \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n' +
      "\\textit{Source~: DEPP, Système d'information Scolarité}<br>"
    this.consigne += context.isHtml ? tableauHtml : tableauLatex
    const combinaisonsHtml =
      '<div class="not-prose" style="text-align:center; margin: 0.75rem 0;">' +
      '<svg viewBox="0 0 460 332" style="max-width:520px; width:100%; height:auto;">' +
      '<text x="230" y="26" font-size="9" text-anchor="end" fill="#333">HLP - LLCER</text>' +
      '<rect x="235" y="13" width="129.0" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="368.0" y="26" font-size="9" fill="#333">86${sp()}%</text>` +
      '<text x="230" y="50" font-size="9" text-anchor="end" fill="#333">HGGSP - HLP</text>' +
      '<rect x="235" y="37" width="114.0" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="353.0" y="50" font-size="9" fill="#333">76${sp()}%</text>` +
      '<text x="230" y="74" font-size="9" text-anchor="end" fill="#333">HGGSP - LLCER</text>' +
      '<rect x="235" y="61" width="108.0" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="347.0" y="74" font-size="9" fill="#333">72${sp()}%</text>` +
      '<text x="230" y="98" font-size="9" text-anchor="end" fill="#333">LLCER - SES</text>' +
      '<rect x="235" y="85" width="106.5" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="345.5" y="98" font-size="9" fill="#333">71${sp()}%</text>` +
      '<text x="230" y="122" font-size="9" text-anchor="end" fill="#333">Physique-chimie - SVT</text>' +
      '<rect x="235" y="109" width="97.5" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="336.5" y="122" font-size="9" fill="#333">65${sp()}%</text>` +
      '<text x="230" y="146" font-size="9" text-anchor="end" fill="#333">SVT - SES</text>' +
      '<rect x="235" y="133" width="93.0" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="332.0" y="146" font-size="9" fill="#333">62${sp()}%</text>` +
      '<text x="230" y="170" font-size="9" text-anchor="end" fill="#333">Mathématiques - SVT</text>' +
      '<rect x="235" y="157" width="88.5" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="327.5" y="170" font-size="9" fill="#333">59${sp()}%</text>` +
      '<text x="230" y="194" font-size="9" text-anchor="end" fill="#333">HGGSP - SES</text>' +
      '<rect x="235" y="181" width="87.0" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="326.0" y="194" font-size="9" fill="#333">58${sp()}%</text>` +
      '<text x="230" y="218" font-size="9" text-anchor="end" fill="#333">Ensemble</text>' +
      '<rect x="235" y="205" width="84.0" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="323.0" y="218" font-size="9" fill="#333">56${sp()}%</text>` +
      '<text x="230" y="242" font-size="9" text-anchor="end" fill="#333">Mathématiques - SES</text>' +
      '<rect x="235" y="229" width="70.5" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="309.5" y="242" font-size="9" fill="#333">47${sp()}%</text>` +
      '<text x="230" y="266" font-size="9" text-anchor="end" fill="#333">Mathématiques - Physique-chimie</text>' +
      '<rect x="235" y="253" width="55.5" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="294.5" y="266" font-size="9" fill="#333">37${sp()}%</text>` +
      '<text x="230" y="290" font-size="9" text-anchor="end" fill="#333">Mathématiques - Sciences de l\'ingénieur</text>' +
      '<rect x="235" y="277" width="21.0" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="260.0" y="290" font-size="9" fill="#333">14${sp()}%</text>` +
      '<text x="230" y="314" font-size="9" text-anchor="end" fill="#333">Mathématiques - Numérique, sciences informatiques</text>' +
      '<rect x="235" y="301" width="18.0" height="16" fill="#4c72b0" stroke="#2f4a72" />' +
      `<text x="257.0" y="314" font-size="9" fill="#333">12${sp()}%</text>` +
      '</svg>' +
      `<p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Source${sp()}: DEPP, Système d'information Scolarité</p>` +
      '</div>'
    const combinaisonsLatex =
      '\\begin{center}' +
      '\\begin{tikzpicture}[scale=1]' +
      '\\node[anchor=east, font=\\scriptsize] at (0,13) {HLP - LLCER};' +
      '\\draw[fill=blue!60] (0,12.7) rectangle (4.30,13.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (4.30,13) {86~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,12) {HGGSP - HLP};' +
      '\\draw[fill=blue!60] (0,11.7) rectangle (3.80,12.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (3.80,12) {76~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,11) {HGGSP - LLCER};' +
      '\\draw[fill=blue!60] (0,10.7) rectangle (3.60,11.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (3.60,11) {72~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,10) {LLCER - SES};' +
      '\\draw[fill=blue!60] (0,9.7) rectangle (3.55,10.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (3.55,10) {71~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,9) {Physique-chimie - SVT};' +
      '\\draw[fill=blue!60] (0,8.7) rectangle (3.25,9.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (3.25,9) {65~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,8) {SVT - SES};' +
      '\\draw[fill=blue!60] (0,7.7) rectangle (3.10,8.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (3.10,8) {62~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,7) {Mathématiques - SVT};' +
      '\\draw[fill=blue!60] (0,6.7) rectangle (2.95,7.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (2.95,7) {59~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,6) {HGGSP - SES};' +
      '\\draw[fill=blue!60] (0,5.7) rectangle (2.90,6.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (2.90,6) {58~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,5) {Ensemble};' +
      '\\draw[fill=blue!60] (0,4.7) rectangle (2.80,5.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (2.80,5) {56~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,4) {Mathématiques - SES};' +
      '\\draw[fill=blue!60] (0,3.7) rectangle (2.35,4.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (2.35,4) {47~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,3) {Mathématiques - Physique-chimie};' +
      '\\draw[fill=blue!60] (0,2.7) rectangle (1.85,3.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (1.85,3) {37~\\%};' +
      "\\node[anchor=east, font=\\scriptsize] at (0,2) {Mathématiques - Sciences de l'ingénieur};" +
      '\\draw[fill=blue!60] (0,1.7) rectangle (0.70,2.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (0.70,2) {14~\\%};' +
      '\\node[anchor=east, font=\\scriptsize] at (0,1) {Mathématiques - Numérique, sciences informatiques};' +
      '\\draw[fill=blue!60] (0,0.7) rectangle (0.60,1.3);' +
      '\\node[anchor=west, font=\\scriptsize] at (0.60,1) {12~\\%};' +
      '\\end{tikzpicture}' +
      '\\end{center}'
    this.consigne +=
      "<br>En classe de terminale, la part de filles dans les spécialités préfigure leurs choix futurs dans l'enseignement supérieur ou de métiers. Les enquêtes révèlent qu'au niveau national les filles sont sous-représentées dans les spécialités scientifiques.<br>" +
      `Combinaisons les plus choisies par les filles en terminale générale en 2022 et 2023 (HLP = humanités, littérature et philosophie ; LLCER = langues, littérature et cultures étrangères et régionales ; HGGSP = histoire-géographie, géopolitique et sciences politiques ; SES = sciences économiques et sociales ; SVT = sciences de la vie et de la Terre)${sp()}:<br>` +
      (context.isHtml ? combinaisonsHtml : combinaisonsLatex)
    this.nbQuestions = 7
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const texteQ0 =
      `En 2023, quelle spécialité a la plus faible proportion de filles${sp()}?`
    this.autoCorrection[0] = {
      enonce: texteQ0,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Mathématiques', statut: false },
        { texte: 'Numérique et sciences informatiques', statut: true },
        { texte: 'Physique-chimie', statut: false },
      ],
    }
    const monQcm0 = propositionsQcm(this, 0)
    let texte0 = texteQ0
    if (!context.isAmc) texte0 += monQcm0.texte
    const correction0 = `C'est la spécialité «${sp()}Numérique et sciences informatiques${sp()}», avec seulement $${miseEnEvidence('15{,}2')}\\,\\%$ de filles.`

    const texteQ1 =
      `En 2023, quelle spécialité a la plus forte proportion de filles${sp()}?`
    this.autoCorrection[1] = {
      enonce: texteQ1,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Sciences économiques et sociales', statut: false },
        { texte: 'Humanités, littérature et philosophie', statut: true },
        { texte: 'Physique-chimie', statut: false },
      ],
    }
    const monQcm1 = propositionsQcm(this, 1)
    let texte1 = texteQ1
    if (!context.isAmc) texte1 += monQcm1.texte
    const correction1 = `C'est la spécialité «${sp()}Humanités, littérature et philosophie${sp()}», avec $${miseEnEvidence('81{,}7')}\\,\\%$ de filles.`

    let texte2 =
      "Calculer, en 2023, l'écart (en points de pourcentage) entre la proportion de filles en HLP et en NSI."
    if (this.interactif)
      texte2 +=
        ajouteChampTexteMathLive(this, 2, '', { texteApres: 'points' }) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 66.5 } })
    const correction2 = `$81{,}7-15{,}2=${miseEnEvidence('66{,}5')}$ points.`

    const texteQ3 =
      `Entre 2022 et 2023, la proportion de filles en NSI a-t-elle augmenté ou diminué${sp()}?`
    this.autoCorrection[3] = {
      enonce: texteQ3,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Elle a augmenté', statut: true },
        { texte: 'Elle a diminué', statut: false },
        { texte: 'Elle est restée stable', statut: false },
      ],
    }
    const monQcm3 = propositionsQcm(this, 3)
    let texte3 = texteQ3
    if (!context.isAmc) texte3 += monQcm3.texte
    const correction3 = `Elle est passée de $14{,}6\\,\\%$ à $15{,}2\\,\\%$${sp()}: elle ${texteEnCouleurEtGras('a donc légèrement augmenté')} ($+0{,}6$ point).`

    const texte4 =
      `Cet écart (près de $67$ points entre HLP et NSI) préfigure-t-il, selon toi, des choix futurs différents pour les filles et les garçons dans l'enseignement supérieur ou les métiers${sp()}?`
    const correction4 =
      `Réponse ouverte${sp()}: les enquêtes nationales montrent qu'au niveau national, les filles restent sous-représentées dans les spécialités scientifiques et numériques, ce qui peut influencer leurs choix ultérieurs d'orientation dans le supérieur, avec des conséquences sur l'insertion professionnelle et les inégalités salariales.`

    const texte5 =
      "Recueillir la «\u00a0triplette\u00a0» d'enseignements de spécialité de chaque élève de première de ton établissement, puis regrouper et traiter ces données dans une feuille de calcul du tableur."
    const correction5 =
      'Réponse à adapter selon les données collectées par la classe.'

    const texte6 =
      `Ces données confirment-elles, dans ton lycée, que le genre exerce une influence sur le choix des enseignements de spécialité${sp()}? Argumenter.`
    const correction6 =
      'Réponse à adapter selon les données collectées par la classe, en la comparant aux tendances nationales observées dans le tableau et le graphique ci-dessus.'

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

    // Réponse ouverte : pas de réponse courte.
    this.listeReponsesCourtes[4] = null
    // Réponse selon les données de la classe : pas de réponse courte.
    this.listeReponsesCourtes[5] = null
    // Réponse argumentée : pas de réponse courte.
    this.listeReponsesCourtes[6] = null
    imposerCorrectionsQcm(this)
    listeQuestionsToContenu(this)
  }
}
