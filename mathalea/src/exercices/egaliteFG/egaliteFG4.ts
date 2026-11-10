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

export const titre = 'Les personnages dans les sujets du DNB'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '6c10c'
export const refs = {
  'fr-fr': ['EgaliteFG1-6e-4'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Organisation et gestion de données']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles (source : femmes et maths)
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG4 extends Exercice {
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
      `<br><br>Le DNB est organisé en France métropolitaine, Outre-Mer et centres étrangers. En 2016, l'inventaire des prénoms dans les sujets du DNB a permis d'établir le tableau suivant${sp()}:<br>`
    const th =
      'style="border: 1px solid #888; padding: 3px 6px; font-size:0.85rem;"'
    const td =
      'style="border: 1px solid #888; padding: 3px 6px; font-size:0.85rem; text-align:center;"'
    const tableauHtml = `<table style="border-collapse: collapse; margin: 10px 0;">
      <tr><th ${th}></th><th ${th} colspan="2">Activité purement mathématique</th><th ${th} colspan="2">Métier</th><th ${th} colspan="2">Activité sportive</th><th ${th} colspan="2">Activité courante</th></tr>
      <tr><th ${th}>Personnage</th><th ${th}>Fille/femme</th><th ${th}>Garçon/homme</th><th ${th}>Fille/femme</th><th ${th}>Garçon/homme</th><th ${th}>Fille/femme</th><th ${th}>Garçon/homme</th><th ${th}>Fille/femme</th><th ${th}>Garçon/homme</th></tr>
      <tr><td ${td}>Pondichéry</td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}>3</td><td ${td}></td><td ${td}>1</td><td ${td}>2</td><td ${td}>4</td></tr>
      <tr><td ${td}>Amérique du Nord</td><td ${td}>1</td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}>2</td><td ${td}></td><td ${td}></td></tr>
      <tr><td ${td}>Centres étrangers</td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}>4</td><td ${td}>3</td></tr>
      <tr><td ${td}>Polynésie</td><td ${td}></td><td ${td}>1</td><td ${td}></td><td ${td}></td><td ${td}>3</td><td ${td}>3</td><td ${td}></td><td ${td}>1</td></tr>
      <tr><td ${td}>Métropole</td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}>1</td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}>1</td></tr>
      <tr><td ${td}>Asie</td><td ${td}>1</td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}>1</td><td ${td}>1</td><td ${td}>1</td><td ${td}></td></tr>
      <tr><td ${td}>Métropole (sept)</td><td ${td}>1</td><td ${td}>1</td><td ${td}></td><td ${td}>1</td><td ${td}></td><td ${td}></td><td ${td}>1</td><td ${td}>1</td></tr>
      <tr><td ${td}>Amérique du Sud</td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}>1</td><td ${td}></td><td ${td}></td><td ${td}>2</td><td ${td}>1</td></tr>
      <tr><td ${td}>Nouvelle-Calédonie</td><td ${td}>1</td><td ${td}>2</td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}></td><td ${td}>8</td></tr>
      <tr><td ${td}><b>TOTAL</b></td><td ${td}><b>4</b></td><td ${td}><b>4</b></td><td ${td}><b>0</b></td><td ${td}><b>6</b></td><td ${td}><b>4</b></td><td ${td}><b>7</b></td><td ${td}><b>10</b></td><td ${td}><b>19</b></td></tr>
      </table>`
    const tableauLatex =
      '{\\small\\begin{center}\\begin{tabular}{|l|c|c|c|c|c|c|c|c|}\n\\hline\n' +
      ' & \\multicolumn{2}{c|}{Math.} & \\multicolumn{2}{c|}{Métier} & \\multicolumn{2}{c|}{Sportive} & \\multicolumn{2}{c|}{Courante} \\\\\n' +
      'Personnage & F & G & F & G & F & G & F & G \\\\\n\\hline\n' +
      'Pondichéry & & & & 3 & & 1 & 2 & 4 \\\\\n\\hline\n' +
      'Amérique du Nord & 1 & & & & & 2 & & \\\\\n\\hline\n' +
      'Centres étrangers & & & & & & & 4 & 3 \\\\\n\\hline\n' +
      'Polynésie & & 1 & & & 3 & 3 & & 1 \\\\\n\\hline\n' +
      'Métropole & & & & 1 & & & & 1 \\\\\n\\hline\n' +
      'Asie & 1 & & & & 1 & 1 & 1 & \\\\\n\\hline\n' +
      'Métropole (sept) & 1 & 1 & & 1 & & & 1 & 1 \\\\\n\\hline\n' +
      'Amérique du Sud & & & & 1 & & & 2 & 1 \\\\\n\\hline\n' +
      'Nouvelle-Calédonie & 1 & 2 & & & & & & 8 \\\\\n\\hline\n' +
      '\\textbf{TOTAL} & \\textbf{4} & \\textbf{4} & \\textbf{0} & \\textbf{6} & \\textbf{4} & \\textbf{7} & \\textbf{10} & \\textbf{19} \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}}\n' +
      '(F = Fille/femme, G = Garçon/homme)<br>'
    this.consigne += context.isHtml ? tableauHtml : tableauLatex
    this.consigne +=
      '<br>' +
      texteGras('Pour lire le tableau') +
      ".<br>Il y a $4$ personnages féminins intervenant lors d'activités courantes dans le sujet de mathématiques du DNB «\u00a0Centres étrangers\u00a0» en 2016.<br>" +
      "Il y a $4$ personnages masculins intervenant lors d'activités purement mathématiques et relevés dans les sujets de mathématiques des zones géographiques citées dans ce tableau."
    this.nbQuestions = 4
    this.nbQuestionsModifiable = false
    this.comment =
      `Source${sp()}: femmes et maths - ` +
      ajouterLien(
        'https://femmes-et-maths.fr/wp-content/uploads/2023/06/inegalites-hommes-femmes.pdf',
        'lien',
      )
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    // Q0 : interprétation du 0 dans la ligne TOTAL (QCM)
    const texteQ0 =
      `Que traduit la présence du nombre $0$ dans la colonne «\u00a0Métier, Fille/femme\u00a0» de la ligne TOTAL${sp()}?`
    this.autoCorrection[0] = {
      enonce: texteQ0,
      options: { ordered: true, radio: true },
      propositions: [
        {
          texte:
            "Aucun personnage féminin n'exerce un métier dans l'ensemble des sujets étudiés.",
          statut: true,
        },
        {
          texte:
            "Aucun personnage masculin n'exerce un métier dans l'ensemble des sujets étudiés.",
          statut: false,
        },
      ],
    }
    const monQcm0 = propositionsQcm(this, 0)
    let texte0 = texteQ0
    if (!context.isAmc) texte0 += monQcm0.texte
    const correction0 = `Le $0$ signifie qu'${texteEnCouleurEtGras("aucun personnage féminin n'intervient dans une activité liée à un métier")}, dans l'ensemble des zones géographiques citées.`

    // Q1 : garçon Nouvelle-Calédonie maths
    let texte1 =
      `Combien de fois apparaît un personnage masculin dans le sujet de mathématiques du DNB en Nouvelle-Calédonie${sp()}?`
    if (this.interactif) texte1 += ajouteChampTexteMathLive(this, 1) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 2 } })
    const correction1 = `D'après le tableau, un personnage masculin apparaît $${miseEnEvidence('2')}$ fois.`

    // Q2 : fille Nouvelle-Calédonie maths
    let texte2 = 'Même question avec un personnage féminin.'
    if (this.interactif) texte2 += ajouteChampTexteMathLive(this, 2) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 1 } })
    const correction2 = `D'après le tableau, un personnage féminin apparaît $${miseEnEvidence('1')}$ fois.`

    // Q3 : sportives vs courantes (QCM)
    const texteQ3 =
      `Au total, les filles sont-elles plus souvent représentées dans les activités sportives ou dans les activités courantes${sp()}?`
    this.autoCorrection[3] = {
      enonce: texteQ3,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Dans les activités sportives', statut: false },
        { texte: 'Dans les activités courantes', statut: true },
      ],
    }
    const monQcm3 = propositionsQcm(this, 3)
    let texte3 = texteQ3
    if (!context.isAmc) texte3 += monQcm3.texte
    const correction3 = `Les filles apparaissent $4$ fois dans les activités sportives contre $10$ fois dans les activités courantes${sp()}: elles sont donc ${texteEnCouleurEtGras('plus souvent représentées dans les activités courantes')}.`

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
