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

export const titre = 'Devoirs facultatifs rendus : filles et garçons'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '082b8'
export const refs = {
  'fr-fr': ['EgaliteFG1-6e-2'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Organisation et gestion de données','Fractions']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG2 extends Exercice {
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
      `<br><br>Voici la répartition de devoirs facultatifs rendus aux élèves d'une classe${sp()}:<br>`
    const tableauHtml = `<table style="border-collapse: collapse; margin: 10px 0;">
      <tr><th style="border: 1px solid #888; padding: 4px 10px;">Matière</th><th style="border: 1px solid #888; padding: 4px 10px;">Filles</th><th style="border: 1px solid #888; padding: 4px 10px;">Garçons</th><th style="border: 1px solid #888; padding: 4px 10px;">Total</th></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Mathématiques</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">8</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">12</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">20</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Sciences</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">6</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">10</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">16</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Histoire-Géographie</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">9</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">7</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">16</td></tr>
      <tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">${texteGras('Total')}</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">23</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">29</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">52</td></tr>
      </table>`
    const tableauLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|}\n\\hline\n' +
      'Matière & Filles & Garçons & Total \\\\\n\\hline\n' +
      'Mathématiques & 8 & 12 & 20 \\\\\n\\hline\n' +
      'Sciences & 6 & 10 & 16 \\\\\n\\hline\n' +
      'Histoire-Géographie & 9 & 7 & 16 \\\\\n\\hline\n' +
      '\\textbf{Total} & 23 & 29 & 52 \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    this.consigne += context.isHtml ? tableauHtml : tableauLatex
    this.nbQuestions = 4
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    // Q0 : différence filles/garçons en mathématiques
    let texte0 =
      `Quelle est la différence entre le nombre de filles et de garçons ayant rendu des devoirs en mathématiques${sp()}?`
    if (this.interactif) {
      texte0 += ajouteChampTexteMathLive(this, 0) + '<br>'
    }
    handleAnswers(this, 0, { reponse: { value: 4 } })
    const correction0 = `$12-8=${miseEnEvidence('4')}$. Il y a $4$ garçons de plus que de filles ayant rendu ce devoir.`

    // Q1 : nombre de filles en Histoire-Géographie
    let texte1 =
      `Combien de filles ont rendu des devoirs en Histoire-Géographie${sp()}?`
    if (this.interactif) {
      texte1 += ajouteChampTexteMathLive(this, 1) + '<br>'
    }
    handleAnswers(this, 1, { reponse: { value: 9 } })
    const correction1 = `D'après le tableau, $${miseEnEvidence('9')}$ filles ont rendu ce devoir.`

    // Q2 : proportion de filles en Histoire-Géographie (en %)
    let texte2 =
      `Quelle est la proportion de filles par rapport au total d'élèves en Histoire-Géographie${sp()}? (en $\\%$, arrondi au centième)`
    if (this.interactif) {
      texte2 +=
        ajouteChampTexteMathLive(this, 2, '', { texteApres: '%' }) + '<br>'
    }
    handleAnswers(this, 2, { reponse: { value: 56.25 } })
    const correction2 = `$\\dfrac{9}{16}=0{,}5625=${miseEnEvidence('56{,}25')}\\,\\%$ des élèves ayant rendu ce devoir en Histoire-Géographie sont des filles.`

    // Q3 : matière où la proportion de garçons est la plus élevée (QCM)
    const texteQ3 =
      `Dans quelle matière la proportion de garçons ayant rendu des devoirs est-elle la plus élevée${sp()}?`
    this.autoCorrection[3] = {
      enonce: texteQ3,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Mathématiques', statut: false },
        { texte: 'Sciences', statut: true },
        { texte: 'Histoire-Géographie', statut: false },
      ],
    }
    const monQcm3 = propositionsQcm(this, 3)
    let texte3 = texteQ3
    if (!context.isAmc) texte3 += monQcm3.texte
    const correction3 =
      `Proportion de garçons${sp()}: en mathématiques $\\dfrac{12}{20}=60\\,\\%$, en sciences $\\dfrac{10}{16}=62{,}5\\,\\%$, en histoire-géographie $\\dfrac{7}{16}=43{,}75\\,\\%$.<br>` +
      "C'est donc en " +
      texteEnCouleurEtGras('sciences') +
      ' que la proportion de garçons est la plus élevée.'

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
