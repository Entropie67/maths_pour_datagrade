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

export const titre = 'Les nombres premiers de Sophie Germain'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '3b5b0'
export const refs = {
  'fr-fr': ['EgaliteFG5-2de-3'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Arithmétique']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee3 extends Exercice {
  commentaireApprofondir = ''
  commentairePartie2 = ''

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
      '<br><br>' +
      texteGras('Partie 1') +
      '<br>On appelle nombre premier de Germain un nombre premier $p$ tel que $2p+1$ soit aussi un nombre premier.'
    this.nbQuestions = 10
    this.nbQuestionsModifiable = false
    this.commentaireApprofondir =
      texteGras(`Pour approfondir${sp()}: Projet interdisciplinaire Maths-Histoire`) +
      `.<br>Le projet interdisciplinaire propose d'étudier les parcours et les travaux de deux grandes mathématiciennes${sp()}: Sophie Germain et Maryam Mirzakhani. Bien que séparées par plus de deux siècles, elles ont chacune affronté des défis liés à leur contexte social et culturel, mais ont néanmoins contribué de manière décisive aux avancées des mathématiques. Ce projet explore comment elles ont surmonté les obstacles de leur époque et leur genre pour devenir des figures incontournables des mathématiques.<br>` +
      "L'objectif est de comprendre comment les mathématiques peuvent être un langage universel tout en étant influencées par le contexte historique et social.<br><br>" +
      texteGras("1. Travail du professeur d'Histoire") +
      '<br>' +
      `Objectifs${sp()}: Les élèves analysent les contextes historiques, géographiques et sociaux des deux mathématiciennes. Ils étudieront l'impact de leur époque et de leur genre sur leur parcours et leurs travaux.<br>` +
      `Activités proposées${sp()}:<br>` +
      '$\\bullet$ Créer une frise chronologique pour chaque mathématicienne, retraçant les événements majeurs de leur vie, mais aussi les contextes sociaux et politiques de leurs époques respectives.<br>' +
      "$\\bullet$ Étudier le contexte de la France au XVIIIe-XIXe siècle pour Sophie Germain et celui de l'Iran au XXe-XXIe siècle pour Maryam Mirzakhani.<br>" +
      "$\\bullet$ Utiliser des cartes géographiques pour localiser la France et l'Iran, afin de mieux comprendre les environnements sociaux et politiques dans lesquels ces mathématiciennes ont évolué.<br>" +
      "$\\bullet$ Analyser les obstacles sociaux et culturels auxquels ces femmes ont dû faire face et comment elles ont réussi à s'imposer dans un milieu dominé par les hommes.<br><br>" +
      texteGras('2. Travail du professeur de Mathématiques') +
      '<br>' +
      'Les élèves découvriront quelques travaux mathématiques de Sophie Germain et de Maryam Mirzakhani, à travers des exercices sur la théorie des nombres pour Sophie Germain et les trajectoires dans un hexagone pour Maryam Mirzakhani.<br><br>' +
      texteGras('3. Synthèse interdisciplinaire') +
      '<br>' +
      `Une fois les exercices réalisés, les élèves participeront à une discussion en classe en présence des deux professeurs. Les objectifs seront de${sp()}:<br>` +
      "$\\bullet$ Réfléchir aux contextes historiques et sociaux qui ont influencé l'accès des femmes au savoir et aux sciences.<br>" +
      '$\\bullet$ Discuter des obstacles rencontrés par Sophie Germain et Maryam Mirzakhani et des façons dont elles ont surmonté ces obstacles pour contribuer de manière significative aux mathématiques.<br>' +
      "$\\bullet$ Examiner comment les mathématiques peuvent être un langage universel, mais aussi comment l'accès à ce savoir est conditionné par des facteurs historiques et sociaux.<br>" +
      "Les élèves pourront présenter leurs résultats sous forme de rapport ou de présentation orale, en faisant le lien entre les mathématiques et l'histoire, tout en montrant comment les contextes sociaux et culturels influencent l'évolution des sciences."
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour approfondir\u00a0»', true]
    this.sup = true
    this.commentairePartie2 =
      texteGras(`Partie 2${sp()}: Travail en groupe`) +
      '<br>' +
      "1. Attribuer à chaque groupe (travail en binôme ou plus) un intervalle de $20$ entiers. Les élèves doivent compter le nombre de nombres premiers de Sophie Germain dans l'intervalle qui leur est attribué.<br>" +
      `2. Restitution des données des élèves par le professeur pour compléter un tableau avec les nombres premiers de Sophie Germain trouvés dans chaque intervalle${sp()}: travail en classe entière (afficher le tableau des intervalles et le compléter avec les élèves).<br>` +
      '3. Tracez un graphique en bâtons (ou diagramme en lignes) avec les intervalles en abscisse et le nombre de nombres premiers de Sophie Germain en ordonnée.<br>' +
      `4. Quelle tendance observez-vous concernant la densité des nombres premiers de Sophie Germain à mesure que les entiers augmentent${sp()}?<br>` +
      `5. Que pouvez-vous en conclure sur leur distribution${sp()}?<br>` +
      `6. Peut-on imaginer une règle expliquant pourquoi ils deviennent de plus en plus rares${sp()}?<br><br>` +
      `Réponse à adapter selon les données collectées par la classe${sp()}: plus les entiers augmentent, plus les nombres premiers de Sophie Germain se raréfient (comme les nombres premiers en général, dont ils forment un sous-ensemble encore plus contraint, puisqu'il faut que $p$ ET $2p+1$ soient tous les deux premiers).`
    this.besoinFormulaire2CaseACocher = [
      'Afficher la Partie 2 (travail en groupe)',
      true,
    ]
    this.sup2 = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const lignesGermain: Array<{
      p: number
      valeur2p1: number
      factorisation: string
      premier: boolean
      germain: boolean
    }> = [
      { p: 2, valeur2p1: 5, factorisation: '5', premier: true, germain: true },
      { p: 3, valeur2p1: 7, factorisation: '7', premier: true, germain: true },
      {
        p: 5,
        valeur2p1: 11,
        factorisation: '11',
        premier: true,
        germain: true,
      },
      {
        p: 7,
        valeur2p1: 15,
        factorisation: '15=3×5',
        premier: false,
        germain: false,
      },
      {
        p: 11,
        valeur2p1: 23,
        factorisation: '23',
        premier: true,
        germain: true,
      },
      {
        p: 13,
        valeur2p1: 27,
        factorisation: '27=3³',
        premier: false,
        germain: false,
      },
      {
        p: 17,
        valeur2p1: 35,
        factorisation: '35=5×7',
        premier: false,
        germain: false,
      },
      {
        p: 19,
        valeur2p1: 39,
        factorisation: '39=3×13',
        premier: false,
        germain: false,
      },
      {
        p: 23,
        valeur2p1: 47,
        factorisation: '47',
        premier: true,
        germain: true,
      },
      {
        p: 29,
        valeur2p1: 59,
        factorisation: '59',
        premier: true,
        germain: true,
      },
    ]

    let texte0HtmlTable = context.isHtml
      ? '<table style="border-collapse: collapse; margin: 10px 0;">' +
        `<tr><th style="border: 1px solid #888; padding: 4px 10px;">$p$</th><th style="border: 1px solid #888; padding: 4px 10px;">$2p+1$</th><th style="border: 1px solid #888; padding: 4px 10px;">Nombre premier${sp()}?</th><th style="border: 1px solid #888; padding: 4px 10px;">Nombre de Germain${sp()}?</th></tr>`
      : ''
    for (let i = 0; i < lignesGermain.length; i++) {
      const ligne = lignesGermain[i]
      const idx2p1 = 3 * i
      const idxPremier = 3 * i + 1
      const idxGermain = 3 * i + 2
      let cellule2p1 = ''
      if (this.interactif) {
        handleAnswers(this, idx2p1, { reponse: { value: ligne.valeur2p1 } })
        cellule2p1 = ajouteChampTexteMathLive(this, idx2p1)
      }
      this.autoCorrection[idxPremier] = {
        enonce: `$2\\times ${ligne.p}+1=${ligne.factorisation}$ est-il premier${sp()}?`,
        options: { ordered: true, radio: true },
        propositions: [
          { texte: 'Oui', statut: ligne.premier },
          { texte: 'Non', statut: !ligne.premier },
        ],
      }
      const qcmPremier = propositionsQcm(this, idxPremier)
      this.autoCorrection[idxGermain] = {
        enonce: `$p=${ligne.p}$ est-il un nombre de Germain${sp()}?`,
        options: { ordered: true, radio: true },
        propositions: [
          { texte: 'Oui', statut: ligne.germain },
          { texte: 'Non', statut: !ligne.germain },
        ],
      }
      const qcmGermain = propositionsQcm(this, idxGermain)
      if (context.isHtml) {
        texte0HtmlTable +=
          `<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$${ligne.p}$</td>` +
          `<td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">${context.isAmc || !this.interactif ? '' : cellule2p1}</td>` +
          `<td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">${context.isAmc || !this.interactif ? '' : qcmPremier.texte}</td>` +
          `<td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">${context.isAmc || !this.interactif ? '' : qcmGermain.texte}</td></tr>`
      }
    }
    if (context.isHtml) texte0HtmlTable += '</table>'
    const texte0Latex =
      '\\begin{center}\\begin{tabular}{|c|c|c|c|}\n\\hline\n' +
      `$p$ & $2p+1$ & Nombre premier${sp()}? & Nombre de Germain${sp()}? \\\\\n\\hline\n` +
      '$2$ & & & \\\\\n\\hline\n' +
      '$3$ & & & \\\\\n\\hline\n' +
      '$5$ & & & \\\\\n\\hline\n' +
      '$7$ & & & \\\\\n\\hline\n' +
      '$11$ & & & \\\\\n\\hline\n' +
      '$13$ & & & \\\\\n\\hline\n' +
      '$17$ & & & \\\\\n\\hline\n' +
      '$19$ & & & \\\\\n\\hline\n' +
      '$23$ & & & \\\\\n\\hline\n' +
      '$29$ & & & \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    const texte0 =
      `Compléter le tableau suivant, pour $p\\in\\{2,3,5,7,11,13,17,19,23,29\\}$ (cocher la case «\u00a0Oui\u00a0» ou «\u00a0Non\u00a0»)${sp()}:<br>` +
      (context.isHtml ? texte0HtmlTable : texte0Latex)
    const correctionGermainHtml =
      '<table style="border-collapse: collapse; margin: 10px 0;">' +
      `<tr><th style="border: 1px solid #888; padding: 4px 10px;">$p$</th><th style="border: 1px solid #888; padding: 4px 10px;">$2p+1$</th><th style="border: 1px solid #888; padding: 4px 10px;">Nombre premier${sp()}?</th><th style="border: 1px solid #888; padding: 4px 10px;">Nombre de Germain${sp()}?</th></tr>` +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$2$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$5$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$3$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$7$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$5$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$11$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$7$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$15=3\\times 5$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Non</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Non</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$11$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$23$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$13$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$27=3^3$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Non</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Non</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$17$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$35=5\\times 7$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Non</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Non</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$19$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$39=3\\times 13$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Non</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Non</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$23$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$47$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td></tr>' +
      '<tr><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$29$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">$59$</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">Oui</td></tr>' +
      '</table>'
    const correctionGermainLatex =
      '\\begin{center}\\begin{tabular}{|c|c|c|c|}\n\\hline\n' +
      `$p$ & $2p+1$ & Nombre premier${sp()}? & Nombre de Germain${sp()}? \\\\\n\\hline\n` +
      '$2$ & $5$ & Oui & Oui \\\\\n\\hline\n' +
      '$3$ & $7$ & Oui & Oui \\\\\n\\hline\n' +
      '$5$ & $11$ & Oui & Oui \\\\\n\\hline\n' +
      '$7$ & $15=3\\times 5$ & Non & Non \\\\\n\\hline\n' +
      '$11$ & $23$ & Oui & Oui \\\\\n\\hline\n' +
      '$13$ & $27=3^3$ & Non & Non \\\\\n\\hline\n' +
      '$17$ & $35=5\\times 7$ & Non & Non \\\\\n\\hline\n' +
      '$19$ & $39=3\\times 13$ & Non & Non \\\\\n\\hline\n' +
      '$23$ & $47$ & Oui & Oui \\\\\n\\hline\n' +
      '$29$ & $59$ & Oui & Oui \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    const correction0 = context.isHtml
      ? correctionGermainHtml
      : correctionGermainLatex

    let texte1 =
      `Combien de nombres premiers de Germain a-t-on trouvé parmi ces dix valeurs${sp()}?`
    if (this.interactif) texte1 += ajouteChampTexteMathLive(this, 30) + '<br>'
    handleAnswers(this, 30, { reponse: { value: 6 } })
    const correction1 = `Il y a $${miseEnEvidence('6')}$ nombres premiers de Germain parmi ces dix valeurs${sp()}: $2,3,5,11,23,29$.`

    const texteQ2 = '$p=7$ est un nombre premier de Germain. Justifier.'
    this.autoCorrection[31] = {
      enonce: texteQ2,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Vrai', statut: false },
        { texte: 'Faux', statut: true },
      ],
    }
    const monQcm2 = propositionsQcm(this, 31)
    let texte2 = texteQ2
    if (!context.isAmc && this.interactif) texte2 += monQcm2.texte
    const correction2 = `$2\\times 7+1=15=3\\times 5$ n'est pas premier${sp()}: $7$ ${texteEnCouleurEtGras("n'est donc pas un nombre de Germain")}.`

    const texteQ3 = '$p=23$ est un nombre premier de Germain. Justifier.'
    this.autoCorrection[32] = {
      enonce: texteQ3,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Vrai', statut: true },
        { texte: 'Faux', statut: false },
      ],
    }
    const monQcm3 = propositionsQcm(this, 32)
    let texte3 = texteQ3
    if (!context.isAmc && this.interactif) texte3 += monQcm3.texte
    const correction3 = `$2\\times 23+1=47$ est premier${sp()}: $23$ ${texteEnCouleurEtGras('est donc bien un nombre de Germain')}.`

    const texteQ4 =
      `Tous les nombres premiers sont-ils des nombres de Germain${sp()}? Quelle conjecture peut-on émettre${sp()}? Justifier.`
    this.autoCorrection[33] = {
      enonce: texteQ4,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Oui', statut: false },
        { texte: 'Non', statut: true },
      ],
    }
    const monQcm4 = propositionsQcm(this, 33)
    let texte4 = texteQ4
    if (!context.isAmc && this.interactif) texte4 += monQcm4.texte
    const correction4 = `Non${sp()}: par exemple $7$, $13$, $17$ et $19$ sont premiers mais ne sont pas des nombres de Germain (voir tableau ci-dessus). On peut conjecturer que les nombres premiers de Germain sont ${texteEnCouleurEtGras('plus rares que les nombres premiers en général')}.`

    const texteQ5 = `Si $p$ est impair, que peut-on dire de $2p+1$${sp()}? Justifier.`
    this.autoCorrection[34] = {
      enonce: texteQ5,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Il est pair', statut: false },
        { texte: 'Il est impair', statut: true },
      ],
    }
    const monQcm5 = propositionsQcm(this, 34)
    let texte5 = texteQ5
    if (!context.isAmc && this.interactif) texte5 += monQcm5.texte
    const correction5 = `$2p$ est toujours pair, donc $2p+1$ est ${texteEnCouleurEtGras('toujours impair')}, que $p$ soit pair ou impair.`

    const texte6 =
      `Que peut-on déduire sur les valeurs possibles de $p$ pour que $2p+1$ soit premier${sp()}?`
    const correction6 =
      `Le fait que $2p+1$ soit toujours impair est une condition nécessaire (un nombre pair strictement supérieur à $2$ ne peut pas être premier) mais pas suffisante${sp()}: on ne peut rien déduire de plus sur les valeurs de $p$, il faut vérifier au cas par cas si $2p+1$ est premier.`

    let texte7 = `Étudier le cas $p=41$${sp()}: calculer $2p+1$.`
    if (this.interactif) texte7 += ajouteChampTexteMathLive(this, 36) + '<br>'
    handleAnswers(this, 36, { reponse: { value: 83 } })
    const correction7 = `$2\\times 41+1=${miseEnEvidence('83')}$.`

    const texteQ8 = `Est-ce que $83$ est un nombre premier${sp()}? Justifier.`
    this.autoCorrection[37] = {
      enonce: texteQ8,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Oui', statut: true },
        { texte: 'Non', statut: false },
      ],
    }
    const monQcm8 = propositionsQcm(this, 37)
    let texte8 = texteQ8
    if (!context.isAmc && this.interactif) texte8 += monQcm8.texte
    const correction8 = `$83$ n'est divisible ni par $2$, ni $3$, ni $5$, ni $7$ ($9^2=81<83<100=10^2$, il suffit de tester les nombres premiers jusqu'à $9$)${sp()}: $83$ ${texteEnCouleurEtGras('est donc premier')}.`

    const texteQ9 = `$41$ est-il un nombre de Germain${sp()}? Justifier.`
    this.autoCorrection[38] = {
      enonce: texteQ9,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Oui', statut: true },
        { texte: 'Non', statut: false },
      ],
    }
    const monQcm9 = propositionsQcm(this, 38)
    let texte9 = texteQ9
    if (!context.isAmc && this.interactif) texte9 += monQcm9.texte
    const correction9 = `$83$ est premier${sp()}: $41$ ${texteEnCouleurEtGras('est donc un nombre de Germain')}.`

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
    if (this.sup2)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentairePartie2
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir

    this.listeReponsesCourtes[0] = null
    this.listeReponsesCourtes[6] =
      `Non${sp()}: être impair est une condition nécessaire mais pas suffisante pour être premier.`

    imposerCorrectionsQcm(this)
    listeQuestionsToContenu(this)
  }
}
