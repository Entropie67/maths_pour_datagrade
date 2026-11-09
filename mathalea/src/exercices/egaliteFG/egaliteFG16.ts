import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Katherine Johnson : poids, masse et gravité'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = 'a0815'
export const refs = {
  'fr-fr': ['EgaliteFG4-3e-16'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Grandeurs composées','Proportionnalité','Trigonométrie']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG16 extends Exercice {
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
        ? `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/johnson.jpg" alt="Portrait de Katherine Johnson" style="width:140px; height:auto; border-radius:9999px; border:3px solid #f15929;"><p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Katherine Johnson (1918-2020) — Source${sp()}: NASA, domaine public</p></div>`
        : '') +
      "<br>Katherine Johnson (1918-2020) est une physicienne, mathématicienne et ingénieure spatiale américaine, qui a contribué aux programmes aéronautique et spatial de la NASA. Son histoire est racontée dans le film «\u00a0Les figures de l'ombre\u00a0».<br>" +
      `Le poids d'un corps sur un astre dépend de la masse et de l'accélération de la pesanteur. On peut montrer que la relation est${sp()}: $P=mg$<br>` +
      "$\\bullet$ $P$ est le poids (en newtons) d'un corps sur un astre ; c'est-à-dire la force que l'astre exerce sur le corps.<br>" +
      '$\\bullet$ $m$ est la masse (en kg) de ce corps.<br>' +
      "$\\bullet$ $g$ est l'accélération de la pesanteur de cet astre ($g$ varie en fonction de l'astre, sa valeur est différente sur Terre, sur la Lune ou sur le Soleil)."
    this.nbQuestions = 6
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 =
      "Juste avant le décollage d'Apollo 11 (mission dont Katherine Johnson a calculé la trajectoire), Neil Armstrong pèse $72$ kg. Sachant que $g_T=9{,}8$ sur Terre, calculer son poids (en newtons)."
    if (this.interactif)
      texte0 +=
        ajouteChampTexteMathLive(this, 0, '', { texteApres: 'N' }) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 705.6 } })
    const correction0 = `$P=m\\times g_T=72\\times 9{,}8=${miseEnEvidence('705{,}6')}$ N.`

    const tableauMassePoidsHtml = `<table style="border-collapse: collapse; margin: 10px auto;">
      <tr><th style="border: 1px solid #888; padding: 4px 10px;">Masse (kg)</th><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$3$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$10$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$25$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$40$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$55$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$72$</td></tr>
      <tr><th style="border: 1px solid #888; padding: 4px 10px;">Poids (N)</th><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$5{,}1$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$17$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$42{,}5$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$68$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$93{,}5$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$122{,}4$</td></tr>
      </table>`
    const tableauMassePoidsLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|c|c|c|}\n\\hline\n' +
      'Masse (kg) & $3$ & $10$ & $25$ & $40$ & $55$ & $72$ \\\\\n\\hline\n' +
      'Poids (N) & $5{,}1$ & $17$ & $42{,}5$ & $68$ & $93{,}5$ & $122{,}4$ \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    const texteQ1 =
      `Sur la Lune, on mesure un tableau de correspondance poids-masse${sp()}:<br>` +
      (context.isHtml ? tableauMassePoidsHtml : tableauMassePoidsLatex) +
      `Ce tableau (masse, poids) est-il un tableau de proportionnalité${sp()}?`
    this.autoCorrection[1] = {
      enonce: texteQ1,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Oui', statut: true },
        { texte: 'Non', statut: false },
      ],
    }
    const monQcm1 = propositionsQcm(this, 1)
    let texte1 = texteQ1
    if (!context.isAmc) texte1 += monQcm1.texte
    const correction1 = `Dans chaque cas, $\\dfrac{\\text{poids}}{\\text{masse}}=1{,}7$ (par exemple $\\dfrac{5{,}1}{3}=1{,}7$ et $\\dfrac{122{,}4}{72}=1{,}7$)${sp()}: ${texteEnCouleurEtGras('le tableau est bien un tableau de proportionnalité')}, de coefficient $1{,}7$.`

    let texte2 =
      "On note $g_L$ l'accélération de la pesanteur sur la Lune. Déterminer $g_L$."
    if (this.interactif) texte2 += ajouteChampTexteMathLive(this, 2) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 1.7 } })
    const correction2 = `Le coefficient de proportionnalité du tableau précédent est $g_L=${miseEnEvidence('1{,}7')}$.`

    const texteQ3 =
      `Est-il vrai que l'on pèse environ $6$ fois moins lourd sur la Lune que sur la Terre${sp()}?`
    this.autoCorrection[3] = {
      enonce: texteQ3,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Vrai', statut: true },
        { texte: 'Faux', statut: false },
      ],
    }
    const monQcm3 = propositionsQcm(this, 3)
    let texte3 = texteQ3
    if (!context.isAmc) texte3 += monQcm3.texte
    const correction3 = `$\\dfrac{g_T}{g_L}=\\dfrac{9{,}8}{1{,}7}\\approx 5{,}76$, soit environ $6$ (arrondi à l'unité)${sp()}: ${texteEnCouleurEtGras("l'affirmation est donc vraie")}, au moins en ordre de grandeur.`

    let texte4 =
      (context.isHtml
        ? '<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/cratere-lune.jpg" alt="Coupe d\'un cratère lunaire, triangle BCD rectangle en D, CD=29 km" style="max-width:320px; width:100%; height:auto;"></div>'
        : '') +
      'Le triangle $BCD$ (un cratère de la Lune) est rectangle en $D$, avec $CD=29$ km et $\\widehat{BCD}=30°$. Calculer la distance $BC$, arrondie au dixième de km.'
    if (this.interactif)
      texte4 +=
        ajouteChampTexteMathLive(this, 4, '', { texteApres: 'km' }) + '<br>'
    handleAnswers(this, 4, { reponse: { value: 33.5 } })
    const correction4 = `Dans le triangle $BCD$ rectangle en $D$, le cosinus de l'angle $\\widehat{BCD}$ est défini par${sp()}: $\\cos\\left(\\widehat{BCD}\\right)=\\dfrac{CD}{BC}$.<br>Avec les données numériques${sp()}: $\\cos(30°)=\\dfrac{29}{BC}$, donc $BC=\\dfrac{29}{\\cos(30°)}\\approx ${miseEnEvidence('33{,}5')}\\text{ km}$.`

    let texte5 =
      "En prenant $BC=34$ km pour cette question, calculer la profondeur $BD$ du cratère, arrondie à l'unité de km."
    if (this.interactif)
      texte5 +=
        ajouteChampTexteMathLive(this, 5, '', { texteApres: 'km' }) + '<br>'
    handleAnswers(this, 5, { reponse: { value: 17 } })
    const correction5 = `Dans le triangle $BCD$ rectangle en $D$, le sinus de l'angle $\\widehat{BCD}$ est défini par${sp()}: $\\sin\\left(\\widehat{BCD}\\right)=\\dfrac{BD}{BC}$.<br>Avec les données numériques${sp()}: $BD=BC\\times \\sin(30°)=34\\times 0{,}5=${miseEnEvidence('17')}\\text{ km}$.`

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

    listeQuestionsToContenu(this)
  }
}
