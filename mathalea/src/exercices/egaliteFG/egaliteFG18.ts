import { imposerCorrectionsQcm } from '../../lib/interactif/alignerMiseEnEvidenceQcm'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import {
  texCalculDecomposition,
  texFactorisation,
} from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Maryam Mirzakhani : médailles Fields, prix Nobel et arithmétique'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const dateDeModifImportante = '23/10/2026'
export const uuid = 'e1276'
export const refs = {
  'fr-fr': ['EgaliteFG4-3e-18'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Arithmétique', 'Pourcentages']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles (source : Wikipedia)
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG18 extends Exercice {
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
        ? `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/mirzakhani-portrait.jpg" alt="Portrait de Maryam Mirzakhani" style="width:130px; height:auto; border-radius:9999px; border:3px solid #f15929;"><p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Maryam Mirzakhani (1977-2017) — Source${sp()}: Florian Caullery — Wikimedia Commons — CC BY-SA 3.0</p></div>`
        : '') +
      '<br>Maryam Mirzakhani (1977-2017), mathématicienne iranienne, est la première femme à avoir reçu la médaille Fields, en 2014.<br>'
    const tableauHtml = `<table style="border-collapse: collapse; margin: 10px 0; font-size:0.85rem; text-align:center;">
      <tr><th style="border: 1px solid #888; padding: 4px 10px;"></th><th style="border: 1px solid #888; padding: 4px 10px;">Nombre de prix Nobel<br>de 1901 à 2024</th><th style="border: 1px solid #888; padding: 4px 10px;">Nombre de médailles Fields<br>de 1936 à 2024</th></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Femmes</td><td align="center" style="border: 1px solid #888; padding: 4px 10px; text-align:center;">65</td><td align="center" style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Hommes</td><td align="center" style="border: 1px solid #888; padding: 4px 10px; text-align:center;">915</td><td align="center" style="border: 1px solid #888; padding: 4px 10px; text-align:center;">62</td></tr>
      </table>
      <p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Source${sp()}: Wikipedia</p>`
    const tableauLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|}\n\\hline\n' +
      ' & Nombre de prix Nobel de 1901 à 2024 & Nombre de médailles Fields de 1936 à 2024 \\\\\n\\hline\n' +
      'Femmes & 65 & 2 \\\\\n\\hline\n' +
      'Hommes & 915 & 62 \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n' +
      '\\textit{Source~: Wikipedia}<br>'
    this.consigne +=
      (context.isHtml ? tableauHtml : tableauLatex) +
      `On considère${sp()}:<br>` +
      `$\\bullet$ $A$${sp()}: le pourcentage total de femmes ayant obtenu la médaille Fields depuis sa création jusqu'en 2024 ;<br>` +
      `$\\bullet$ $B$${sp()}: le pourcentage total de femmes ayant obtenu un prix Nobel depuis sa création jusqu'en 2024 (arrondis au centième).`
    this.nbQuestions = 6
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 =
      'Calculer $A$, le pourcentage de femmes parmi les médailles Fields.'
    if (this.interactif)
      texte0 +=
        ajouteChampTexteMathLive(this, 0, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 3.13 } })
    const correction0 = `$A=\\dfrac{2}{2+62}=\\dfrac{2}{64}\\approx ${miseEnEvidence('3{,}13')}\\,\\%$.`

    let texte1 = 'Calculer $B$, le pourcentage de femmes parmi les prix Nobel.'
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 6.63 } })
    const correction1 = `$B=\\dfrac{65}{65+915}=\\dfrac{65}{980}\\approx ${miseEnEvidence('6{,}63')}\\,\\%$.`

    const texteQ2 = `Comparer $A$ et $B$. Que peut-on en déduire${sp()}?`
    this.autoCorrection[2] = {
      enonce: texteQ2,
      options: { ordered: true, radio: true },
      propositions: [
        {
          texte:
            `$A < B$${sp()}: les femmes sont encore moins représentées en mathématiques (médaille Fields) que parmi l'ensemble des prix Nobel.`,
          statut: true,
        },
        {
          texte:
            `$A>B$${sp()}: les femmes sont mieux représentées en mathématiques que parmi l'ensemble des prix Nobel.`,
          statut: false,
        },
      ],
    }
    const monQcm2 = propositionsQcm(this, 2)
    let texte2 = texteQ2
    if (!context.isAmc) texte2 += monQcm2.texte
    const correction2 =
      `$A\\approx 3{,}13\\,\\% < B\\approx 6{,}63\\,\\%$${sp()}: la sous-représentation des femmes est donc encore plus marquée pour la médaille Fields que pour l'ensemble des prix Nobel.`

    const texteQ3 =
      "Lors de la semaine des Mathématiques en mars 2025, un collège a organisé un concours de résolution de problèmes afin d'encourager les élèves. Pour les récompenser de leur participation, le collège a acheté $630$ chocolats et $456$ caramels. Les professeurs de mathématiques ont souhaité faire des lots identiques, c'est-à-dire contenant chacun le même nombre de chocolats et le même nombre de caramels, en utilisant tous les bonbons.<br>" +
      'Donner la décomposition en produit de facteurs premiers de $630$ et de $456$.'
    let texte3 = texteQ3
    if (this.interactif) {
      texte3 +=
        '<br>' +
        addMultiMathfield(this, 3, {
          dataTemplate: '%{champ1}\n%{champ2}',
          dataOptions: {
            champ1: { keyboard: KeyboardType.clavierDeBase },
            champ2: { keyboard: KeyboardType.clavierDeBase },
          },
        })
    }
    handleAnswers(
      this,
      3,
      {
        champ1: {
          value: texFactorisation(630, true),
          options: { nbFacteursIdentiquesFactorisation: true },
        },
        champ2: {
          value: texFactorisation(456, true),
          options: { nbFacteursIdentiquesFactorisation: true },
        },
        bareme: toutAUnPoint,
      },
      { formatInteractif: 'multi-mathfield' },
    )
    const correction3 = `${texCalculDecomposition(630)}<br>${texCalculDecomposition(456)}`

    const texteQ4 =
      `Les professeurs de mathématiques ont-ils pu constituer $18$ lots${sp()}?`
    this.autoCorrection[4] = {
      enonce: texteQ4,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Oui', statut: false },
        { texte: 'Non', statut: true },
      ],
    }
    const monQcm4 = propositionsQcm(this, 4)
    let texte4 = texteQ4
    if (!context.isAmc) texte4 += monQcm4.texte
    const correction4 = `Le nombre de lots doit diviser à la fois $630$ et $456$, donc diviser leur PGCD. D'après les décompositions précédentes, les seuls facteurs premiers communs à $630=2\\times 3^2\\times 5\\times 7$ et $456=2^3\\times 3\\times 19$ sont $2$ et $3$, donc $\\text{PGCD}(630\\,;\\,456)=2\\times 3=6$. Comme $18$ ne divise pas $6$, la réponse est ${texteEnCouleurEtGras('Non')}${sp()}: les professeurs n'ont pas pu constituer $18$ lots.`

    const texteQ5 =
      `Quel est le nombre maximum de lots qu'ont pu constituer les professeurs${sp()}? Combien de chocolats et de caramels y avait-il alors dans chaque lot${sp()}?`
    let texte5 = texteQ5
    if (this.interactif) {
      texte5 +=
        '<br>' +
        addMultiMathfield(this, 5, {
          dataTemplate: '%{champ1}\n%{champ2}\n%{champ3}',
          dataOptions: {
            champ1: { keyboard: KeyboardType.clavierNumbers },
            champ2: { keyboard: KeyboardType.clavierNumbers },
            champ3: { keyboard: KeyboardType.clavierNumbers },
          },
        })
    }
    handleAnswers(
      this,
      5,
      {
        champ1: { value: '6', options: { nombreDecimalSeulement: true } },
        champ2: { value: '105', options: { nombreDecimalSeulement: true } },
        champ3: { value: '76', options: { nombreDecimalSeulement: true } },
        bareme: toutAUnPoint,
      },
      { formatInteractif: 'multi-mathfield' },
    )
    const correction5 = `Le nombre maximum de lots correspond au $\\text{PGCD}(630\\,;\\,456)=6$ trouvé à la question précédente, donc le nombre maximum de lots est $${miseEnEvidence('6')}$.<br>Chaque lot contient alors $630\\div 6=${miseEnEvidence('105')}$ chocolats et $456\\div 6=${miseEnEvidence('76')}$ caramels.`

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

    imposerCorrectionsQcm(this)
    listeQuestionsToContenu(this)
  }
}
