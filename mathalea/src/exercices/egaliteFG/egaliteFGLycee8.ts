import { imposerCorrectionsQcm } from '../../lib/interactif/alignerMiseEnEvidenceQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = "Choix de spécialités en médecine : un plan d'inclusivité"
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '6e064'
export const refs = {
  'fr-fr': ['EgaliteFG6-1e-8'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Suites numériques', 'Pourcentages']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee8 extends Exercice {
  commentaireDebat = ''
  commentaireApprofondir = ''

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
      '<br><br>Dans une université de médecine, les choix de spécialités restent très genrés. En 2025, les femmes représentent $67\\,\\%$ des $500$ étudiants en médecine, $30\\,\\%$ des femmes choisissent une spécialité chirurgicale, et $30\\,\\%$ des hommes choisissent la pédiatrie.<br>' +
      `Un plan d'inclusivité est mis en place${sp()}: chaque année, le pourcentage de femmes en chirurgie augmente de $4$ points, et le pourcentage d'hommes en pédiatrie augmente de $10\\,\\%$ par rapport à l'année précédente.<br>` +
      "On note $f_n$ le pourcentage de femmes en chirurgie l'année $2025+n$, et $h_n$ le pourcentage d'hommes en pédiatrie l'année $2025+n$. On a donc $f_0=30$ et $h_0=30$."
    this.nbQuestions = 10
    this.nbQuestionsModifiable = false
    const tableauMedecinsHtml = `<table style="border-collapse: collapse; margin: 10px auto; font-size: 0.85rem;">
      <tr><th style="border: 1px solid #888; padding: 4px 8px;">Au 1er janvier</th><th style="border: 1px solid #888; padding: 4px 8px;">Nombre de médecins</th><th style="border: 1px solid #888; padding: 4px 8px;">Part des femmes en${sp()}%</th><th style="border: 1px solid #888; padding: 4px 8px;">Médecins libéraux et mixtes en${sp()}%</th></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">Omnipraticiens</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$102\\,169$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$47{,}6$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$66{,}1$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">Spécialistes</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$124\\,690$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$45{,}7$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$49{,}6$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">Spécialités médicales</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$71\\,760$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$48{,}0$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$49{,}2$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">dont anesthésiologie-réanimation</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$11\\,524$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$36{,}9$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$39{,}8$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">pédiatrie</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$8\\,270$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$70{,}4$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$37{,}8$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">radiodiag. et imag. médicale</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$8\\,938$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$36{,}0$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$74{,}4$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">Spécialités chirurgicales</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$27\\,646$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$30{,}4$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$68{,}1$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">dont gynécologie obstétrique</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$5\\,215$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$52{,}6$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$59{,}5$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">ophtalmologie</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$5\\,882$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$44{,}2$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$85{,}7$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">Biologie médicale</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$3\\,053$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$52{,}3$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$39{,}7$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">Psychiatrie</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$15\\,421$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$51{,}9$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$41{,}8$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">Santé publ. et médecine du travail</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$6\\,810$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$66{,}7$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$1{,}2$</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;"><b>Total des médecins</b></td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$\\mathbf{226\\,859}$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$\\mathbf{46{,}6}$</td><td style="border: 1px solid #888; padding: 4px 8px; text-align:center;">$\\mathbf{57{,}0}$</td></tr>
      </table><p style="font-size:0.7rem; font-style:italic; opacity:0.7; text-align:center;">Figure $1$ – Médecins suivant le statut et la spécialité en 2019 (source${sp()}: Drees, RPPS)</p>`
    const tableauMedecinsLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|}\n\\hline\n' +
      'Au 1er janvier & Nombre de médecins & Part des femmes en \\% & Médecins libéraux et mixtes en \\% \\\\\n\\hline\n' +
      'Omnipraticiens & $102\\,169$ & $47{,}6$ & $66{,}1$ \\\\\n\\hline\n' +
      'Spécialistes & $124\\,690$ & $45{,}7$ & $49{,}6$ \\\\\n\\hline\n' +
      'Spécialités médicales & $71\\,760$ & $48{,}0$ & $49{,}2$ \\\\\n\\hline\n' +
      'dont anesthésiologie-réanimation & $11\\,524$ & $36{,}9$ & $39{,}8$ \\\\\n\\hline\n' +
      'dont pédiatrie & $8\\,270$ & $70{,}4$ & $37{,}8$ \\\\\n\\hline\n' +
      'dont radiodiag. et imag. médicale & $8\\,938$ & $36{,}0$ & $74{,}4$ \\\\\n\\hline\n' +
      'Spécialités chirurgicales & $27\\,646$ & $30{,}4$ & $68{,}1$ \\\\\n\\hline\n' +
      'dont gynécologie obstétrique & $5\\,215$ & $52{,}6$ & $59{,}5$ \\\\\n\\hline\n' +
      'dont ophtalmologie & $5\\,882$ & $44{,}2$ & $85{,}7$ \\\\\n\\hline\n' +
      'Biologie médicale & $3\\,053$ & $52{,}3$ & $39{,}7$ \\\\\n\\hline\n' +
      'Psychiatrie & $15\\,421$ & $51{,}9$ & $41{,}8$ \\\\\n\\hline\n' +
      'Santé publ. et médecine du travail & $6\\,810$ & $66{,}7$ & $1{,}2$ \\\\\n\\hline\n' +
      'TOTAL des médecins & $226\\,859$ & $46{,}6$ & $57{,}0$ \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n' +
      `Figure $1$ -- Médecins suivant le statut et la spécialité en 2019 (source${sp()}: Drees, RPPS)<br>`
    this.commentaireDebat =
      texteGras('Pour débattre') +
      `.<br>a. Quelle politique semble la plus efficace${sp()}?<br>b. Pourquoi est-il plus difficile de motiver les hommes à choisir la pédiatrie${sp()}?<br>c. On donne le tableau suivant${sp()}:` +
      (context.isHtml ? tableauMedecinsHtml : tableauMedecinsLatex) +
      `Qu'en pensez-vous${sp()}?`
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
    this.commentaireApprofondir =
      texteGras('Pour approfondir') +
      `.<br>Un article${sp()}: ` +
      ajouterLien(
        'https://shs.cairn.info/revue-francaise-des-affaires-sociales-2005-1-page-59?lang=fr',
        'Féminisation du corps médical et dynamiques professionnelles dans le champ de la santé',
      ) +
      `.<br>Une vidéo${sp()}: ` +
      ajouterLien(
        'https://www.youtube.com/watch?v=J3XEo-85rO8',
        `Le milieu médical est atteint d'une maladie grave${sp()}: le sexisme (URBANIA FR)`,
      ) +
      '.'
    this.besoinFormulaire2CaseACocher = ['Afficher «\u00a0Pour approfondir\u00a0»', true]
    this.sup2 = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const texte0 =
      texteGras('Partie A — Modélisation') +
      "<br>On note $f_n$ le pourcentage de femmes en chirurgie l'année $2025+n$. Justifier pourquoi $f_0=30$."
    const correction0 = `$f_0$ est le pourcentage de femmes en chirurgie l'année de référence $2025+0=2025$${sp()}: or l'énoncé donne, pour 2025, $30\\,\\%$ des femmes choisissant une spécialité chirurgicale. Donc $${miseEnEvidence('f_0=30')}$.`

    let texte1 =
      `Quel est le pourcentage de femmes en chirurgie en 2026, soit $f_1$${sp()}?`
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 34 } })
    const correction1 = `Le pourcentage augmente de $4$ points par an${sp()}: $f_1=30+4=${miseEnEvidence('34')}$.`

    const texte2 = 'Exprimer $f_{n+1}$ en fonction de $f_n$.'
    const correction2 =
      "Chaque année, le pourcentage de femmes en chirurgie augmente de $4$ points par rapport à l'année précédente, donc $f_{n+1}=f_n+4$."

    const texteQ3 =
      `Quelle est la nature de la suite $(f_n)$${sp()}? En déduire l'expression de $f_n$ en fonction de $n$.`
    this.autoCorrection[3] = {
      enonce: texteQ3,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Arithmétique de raison $4$', statut: true },
        { texte: 'Géométrique de raison $4$', statut: false },
        { texte: 'Ni arithmétique, ni géométrique', statut: false },
      ],
    }
    const monQcm3 = propositionsQcm(this, 3)
    let texte3 = texteQ3
    if (!context.isAmc) texte3 += monQcm3.texte
    const correction3 = `$f_{n+1}=f_n+4$${sp()}: $(f_n)$ est arithmétique de raison $4$ et de premier terme $f_0=30$, donc $${miseEnEvidence('f_n=30+4n')}$.`

    let texte4 =
      `À partir de quelle année (donner $n$ tel que l'année soit $2025+n$) atteindra-t-on $50\\,\\%$ de femmes en chirurgie${sp()}?`
    if (this.interactif) texte4 += ajouteChampTexteMathLive(this, 4) + '<br>'
    handleAnswers(this, 4, { reponse: { value: 5 } })
    const correction4 = `$30+4n=50 \\iff 4n=20 \\iff n=5$${sp()}: on atteint $50\\,\\%$ en $2025+${miseEnEvidence('5')}=2030$.`

    let texte5 =
      `On note $h_n$ le pourcentage d'hommes en pédiatrie l'année $2025+n$. Quel est le pourcentage d'hommes en pédiatrie en 2026, soit $h_1$${sp()}?`
    if (this.interactif)
      texte5 +=
        ajouteChampTexteMathLive(this, 5, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 5, { reponse: { value: 33 } })
    const correction5 = `$h_1=30\\times 1{,}1=${miseEnEvidence('33')}$.`

    const texte6 = 'Exprimer $h_{n+1}$ en fonction de $h_n$.'
    const correction6 =
      "Chaque année, le pourcentage d'hommes en pédiatrie augmente de $10\\,\\%$ par rapport à l'année précédente, donc $h_{n+1}=1{,}1\\times h_n$."

    const texteQ7 =
      `Quelle est la nature de la suite $(h_n)$${sp()}? En déduire l'expression de $h_n$ en fonction de $n$.`
    this.autoCorrection[7] = {
      enonce: texteQ7,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Arithmétique de raison $1{,}1$', statut: false },
        { texte: 'Géométrique de raison $1{,}1$', statut: true },
        { texte: 'Ni arithmétique, ni géométrique', statut: false },
      ],
    }
    const monQcm7 = propositionsQcm(this, 7)
    let texte7 = texteQ7
    if (!context.isAmc) texte7 += monQcm7.texte
    const correction7 = `$h_{n+1}=1{,}1\\times h_n$${sp()}: $(h_n)$ est géométrique de raison $1{,}1$ et de premier terme $h_0=30$, donc $${miseEnEvidence('h_n=30\\times 1{,}1^n')}$.`

    const texteQ8 =
      `Quand on atteint la parité ($50\\,\\%$) en chirurgie (en 2030), est-elle également atteinte en pédiatrie${sp()}? Expliquer.`
    this.autoCorrection[8] = {
      enonce: texteQ8,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Oui', statut: false },
        { texte: 'Non', statut: true },
      ],
    }
    const monQcm8 = propositionsQcm(this, 8)
    let texte8 = texteQ8
    if (!context.isAmc) texte8 += monQcm8.texte
    const correction8 = `En 2030 ($n=5$), $h_5=30\\times 1{,}1^5\\approx 48{,}3\\,\\%<50\\,\\%$${sp()}: la parité ${texteEnCouleurEtGras("n'est pas encore tout à fait atteinte")} en pédiatrie, même si elle en est proche.`

    const texte9 =
      texteGras('Partie B — Analyse') +
      "<br>L'université compte $500$ étudiants dont $67\\,\\%$ de femmes, soit $335$ femmes et $165$ hommes. Compléter le tableau suivant, en arrondissant les effectifs à l'unité."
    const tableauEffectifsHtml =
      '<table style="border-collapse: collapse; margin: 10px 0;">' +
      '<tr><th style="border: 1px solid #888; padding: 4px 10px;">Année</th><th style="border: 1px solid #888; padding: 4px 10px;">$f_n$</th><th style="border: 1px solid #888; padding: 4px 10px;">Effectif</th><th style="border: 1px solid #888; padding: 4px 10px;">$h_n$</th><th style="border: 1px solid #888; padding: 4px 10px;">Effectif</th></tr>' +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2025</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$30\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$101$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$30\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$50$</td></tr>` +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2026</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$34\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$114$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$33\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$54$</td></tr>` +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2027</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$38\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$127$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$36{,}3\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$60$</td></tr>` +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2028</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$42\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$141$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$39{,}9\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$66$</td></tr>` +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2029</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$46\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$154$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$43{,}9\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$72$</td></tr>` +
      `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2030</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$50\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$168$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$48{,}3\\,\\%$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$80$</td></tr>` +
      '</table>'
    const tableauEffectifsLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|c|}\n\\hline\n' +
      'Année & $f_n$ & Effectif & $h_n$ & Effectif \\\\\n\\hline\n' +
      '2025 & $30\\,\\%$ & $101$ & $30\\,\\%$ & $50$ \\\\\n\\hline\n' +
      '2026 & $34\\,\\%$ & $114$ & $33\\,\\%$ & $54$ \\\\\n\\hline\n' +
      '2027 & $38\\,\\%$ & $127$ & $36{,}3\\,\\%$ & $60$ \\\\\n\\hline\n' +
      '2028 & $42\\,\\%$ & $141$ & $39{,}9\\,\\%$ & $66$ \\\\\n\\hline\n' +
      '2029 & $46\\,\\%$ & $154$ & $43{,}9\\,\\%$ & $72$ \\\\\n\\hline\n' +
      '2030 & $50\\,\\%$ & $168$ & $48{,}3\\,\\%$ & $80$ \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    const correction9 =
      `On calcule l'effectif de femmes en chirurgie chaque année par $335\\times f_n\\,\\%$ (arrondi à l'unité), et l'effectif d'hommes en pédiatrie par $165\\times h_n\\,\\%$ (arrondi à l'unité)${sp()}:<br>` +
      (context.isHtml ? tableauEffectifsHtml : tableauEffectifsLatex) +
      `Par exemple pour 2025${sp()}: $335\\times 0{,}30=100{,}5\\approx 101$ femmes en chirurgie, et $165\\times 0{,}30=49{,}5\\approx 50$ hommes en pédiatrie. Pour 2030${sp()}: $335\\times 0{,}50=167{,}5\\approx 168$ femmes en chirurgie, et $165\\times 0{,}483=79{,}695\\approx 80$ hommes en pédiatrie.`

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
    this.listeQuestions[7] = texte7
    this.listeCorrections[7] = correction7
    this.listeQuestions[8] = texte8
    this.listeCorrections[8] = correction8
    this.listeQuestions[9] = texte9
    this.listeCorrections[9] = correction9
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat
    if (this.sup2)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir

    this.listeReponsesCourtes[2] = `$f_{n+1}=f_n+4$`
    this.listeReponsesCourtes[6] = `$h_{n+1}=1{,}1\\times h_n$`
    // Tableau à compléter : pas de réponse courte.
    this.listeReponsesCourtes[9] = null
    imposerCorrectionsQcm(this)
    listeQuestionsToContenu(this)
  }
}
