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

export const titre =
  "L'accès aux CPGE scientifiques"
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = 'cd974'
export const refs = {
  'fr-fr': ['EgaliteFG7-Tle-17'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Probabilités conditionnelles', 'Loi binomiale']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee17 extends Exercice {
  commentaireDebat = ''

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
      `<br><br>Dans une enquête menée auprès de $50$ terminales d'un lycée, on relève${sp()}: $40\\,\\%$ des élèves interrogés sont des filles ; parmi les garçons, $30\\,\\%$ sont admis en CPGE scientifique ; parmi les filles, $15\\,\\%$ sont admises en CPGE scientifique.<br>` +
      "On choisit au hasard un élève. On note $F$ l'événement «\u00a0l'élève est une fille\u00a0» et $A$ l'événement «\u00a0l'élève est admis(e) en CPGE scientifique\u00a0»."
    this.nbQuestions = 11
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      `.<br>Au regard des résultats de la Partie A, comment le choix des enseignements de spécialité en classe de Première et de Terminale peut-il influencer cet écart d'admission${sp()}? Selon vous, d'autres facteurs (censure, représentations sociales des métiers, etc.) interviennent-ils également dans ce constat${sp()}?`
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const texte0 =
      'Traduire la situation par un arbre pondéré (sans justification).'
    const correction0 =
      `Arbre à deux niveaux${sp()}: premier niveau $F$ (probabilité $0{,}4$) / $\\overline F$ (probabilité $0{,}6$) ; sur la branche $F$, deuxième niveau $A$ (probabilité $0{,}15$) / $\\overline A$ (probabilité $0{,}85$) ; sur la branche $\\overline F$, deuxième niveau $A$ (probabilité $0{,}3$) / $\\overline A$ (probabilité $0{,}7$).`

    let texte1 =
      "Calculer la probabilité $P(F\\cap A)$ que l'élève soit une fille et admise en CPGE."
    if (this.interactif) texte1 += ajouteChampTexteMathLive(this, 1) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 0.06 } })
    const correction1 = `$P(F\\cap A)=P(F)\\times P_F(A)=0{,}4\\times 0{,}15=${miseEnEvidence('0{,}06')}$.`

    let texte2 =
      "Montrer que la probabilité de l'événement $A$ est égale à $0{,}24$."
    if (this.interactif) texte2 += ajouteChampTexteMathLive(this, 2) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 0.24 } })
    const correction2 = `D'après la formule des probabilités totales${sp()}: $P(A)=P(F)\\times P_F(A)+P(\\overline F)\\times P_{\\overline F}(A)=0{,}4\\times 0{,}15+0{,}6\\times 0{,}3=0{,}06+0{,}18=${miseEnEvidence('0{,}24')}$.`

    let texte3 =
      `On choisit au hasard un élève admis en CPGE. Quelle est la probabilité $P_A(\\overline F)$ que cet élève soit un garçon${sp()}?`
    if (this.interactif) texte3 += ajouteChampTexteMathLive(this, 3) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 0.75 } })
    const correction3 = `$P_A(\\overline F)=\\dfrac{P(\\overline F\\cap A)}{P(A)}=\\dfrac{0{,}6\\times 0{,}3}{0{,}24}=\\dfrac{0{,}18}{0{,}24}=${miseEnEvidence('0{,}75')}$.`

    const texteQ4 =
      `Que peut-on dire en comparant $P_F(A)=0{,}15$ et $P_{\\overline F}(A)=0{,}3$${sp()}?`
    this.autoCorrection[4] = {
      enonce: texteQ4,
      options: { ordered: true, radio: true },
      propositions: [
        {
          texte:
            "Les garçons ont environ deux fois plus de chances d'être admis en CPGE que les filles",
          statut: true,
        },
        {
          texte:
            "Les filles et les garçons ont des chances comparables d'être admis en CPGE",
          statut: false,
        },
      ],
    }
    const monQcm4 = propositionsQcm(this, 4)
    let texte4 = texteQ4
    if (!context.isAmc) texte4 += monQcm4.texte
    const correction4 = `$P_{\\overline F}(A)=0{,}3=2\\times 0{,}15=2\\times P_F(A)$${sp()}: à ce stade de l'enquête, un garçon a ${texteEnCouleurEtGras('deux fois plus de chances')} qu'une fille d'être admis en CPGE scientifique, révélant une nette inégalité d'accès.`

    const texteQ5 =
      `On prélève au hasard, avec remise, un échantillon de $7$ élèves parmi les $50$ interrogés. On note $X$ le nombre d'élèves admis en CPGE parmi les $7$ tirés au sort. Quelle est la loi suivie par $X$${sp()}?`
    this.autoCorrection[5] = {
      enonce: texteQ5,
      options: { ordered: true, radio: true },
      propositions: [
        {
          texte: 'La loi binomiale de paramètres $n=7$ et $p=0{,}24$',
          statut: true,
        },
        {
          texte: 'La loi binomiale de paramètres $n=50$ et $p=0{,}24$',
          statut: false,
        },
        {
          texte: 'La loi binomiale de paramètres $n=7$ et $p=0{,}4$',
          statut: false,
        },
      ],
    }
    const monQcm5 = propositionsQcm(this, 5)
    let texte5 = texteQ5
    if (!context.isAmc) texte5 += monQcm5.texte
    const correction5 = `Chaque tirage est une épreuve de Bernoulli de paramètre $p=P(A)=0{,}24$ (succès = «${sp()}admis en CPGE${sp()}»), répétée $7$ fois de façon identique et indépendante (tirage avec remise)${sp()}: $X$ suit donc la loi binomiale $${miseEnEvidence('\\mathcal{B}(7\\,;\\,0{,}24)')}$.`

    let texte6 =
      "Calculer la probabilité qu'un seul des sept élèves tirés au sort soit admis en CPGE (arrondie au centième)."
    if (this.interactif) texte6 += ajouteChampTexteMathLive(this, 6) + '<br>'
    handleAnswers(this, 6, { reponse: { value: 0.32 } })
    const correction6 = `$P(X=1)=\\dbinom{7}{1}\\times 0{,}24^1\\times 0{,}76^6\\approx ${miseEnEvidence('0{,}32')}$.`

    let texte7 =
      "Calculer la probabilité qu'au moins deux élèves tirés au sort soient admis en CPGE (arrondie au centième)."
    if (this.interactif) texte7 += ajouteChampTexteMathLive(this, 7) + '<br>'
    handleAnswers(this, 7, { reponse: { value: 0.53 } })
    const correction7 = `$P(X\\geqslant 2)=1-P(X=0)-P(X=1)=1-0{,}76^7-0{,}32\\approx 1-0{,}15-0{,}32=${miseEnEvidence('0{,}53')}$.`

    let texte8 = "Calculer l'espérance de $X$ et interpréter le résultat."
    if (this.interactif) texte8 += ajouteChampTexteMathLive(this, 8) + '<br>'
    handleAnswers(this, 8, { reponse: { value: 1.68 } })
    const correction8 = `$E(X)=np=7\\times 0{,}24=${miseEnEvidence('1{,}68')}$${sp()}: en moyenne, sur un échantillon de $7$ élèves, environ $1{,}68$ (soit un peu moins de $2$) seront admis en CPGE.`

    const texte9 =
      "Un lycée présente $n$ candidats, admis chacun avec une probabilité $0{,}24$, de façon indépendante. Donner, en fonction de $n$, l'expression de la probabilité qu'aucun candidat de ce lycée ne soit admis en CPGE."
    const correction9 = `La probabilité qu'aucun candidat ne soit admis est $${miseEnEvidence('0{,}76^n')}$.`

    let texte10 =
      `À partir de quelle valeur de $n$ la probabilité qu'au moins un candidat soit admis est-elle supérieure ou égale à $0{,}99$${sp()}?`
    if (this.interactif) texte10 += ajouteChampTexteMathLive(this, 10) + '<br>'
    handleAnswers(this, 10, { reponse: { value: 17 } })
    const correction10 = `On cherche $n$ tel que $1-0{,}76^n\\geqslant 0{,}99$, soit $0{,}76^n\\leqslant 0{,}01$. On trouve $0{,}76^{16}\\approx 0{,}0124>0{,}01$ et $0{,}76^{17}\\approx 0{,}0094\\leqslant 0{,}01$${sp()}: il faut donc $${miseEnEvidence('17')}$.`

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
    this.listeQuestions[10] = texte10
    this.listeCorrections[10] = correction10
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat

    this.listeReponsesCourtes[0] = null

    imposerCorrectionsQcm(this)
    listeQuestionsToContenu(this)
  }
}
