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
import { scratchblock } from '../../modules/scratchblock'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Ada Lovelace : un programme de calcul'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = 'e95b3'
export const refs = {
  'fr-fr': ['EgaliteFG4-3e-17'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Algorithmique et programmation','Calcul littéral']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG17 extends Exercice {
  introBio = ''
  commentaireApprofondir = ''

  constructor() {
    super()
    this.pasDeVersionAleatoire = true
    this.besoinFormulaireCaseACocher = ['Version noir et blanc']
    this.introBio = texteItalique(
      "D'après " +
        ajouterLien(
          'https://nuage03.apps.education.fr/index.php/s/NZgmoFpcSCW8Cag?dir=/&editing=false&openfile=true',
          "«\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles",
        ),
    )
    this.introBio +=
      (context.isHtml
        ? '<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/lovelace.png" alt="Portrait d\'Ada Lovelace" style="width:130px; height:auto; border-radius:9999px; border:3px solid #f15929;"><p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Ada Lovelace, Anglaise (1815-1852)</p></div>'
        : '') +
      '<br>' +
      texteGras(
        `Saviez-vous que le premier programme informatique fût écrit par une femme${sp()}?`,
      ) +
      '<br>' +
      `La mathématicienne et comtesse Ada Lovelace est principalement connue pour avoir réalisé le premier véritable programme informatique, lors de son travail sur un ancêtre de l'ordinateur${sp()}: la machine analytique de Charles Babbage.<br>` +
      'Voici un programme réalisé avec Scratch.'
    this.nbQuestions = 6
    this.nbQuestionsModifiable = false
    this.commentaireApprofondir =
      texteGras('Pour aller plus loin') +
      ".<br>Pour en savoir plus sur les métiers liés à la programmation et à l'informatique, et découvrir qu'ils sont accessibles à toutes et à tous, vous pouvez consulter " +
      ajouterLien(
        'https://www.onisep.fr/recherche?text=informatique&context=onisep',
        'cette fiche métier',
      ) +
      ' ou ' +
      ajouterLien(
        'https://oniseptv.onisep.fr/video/bts-informatique',
        'cette vidéo',
      ) +
      " proposées par l'Onisep."
    this.besoinFormulaire2CaseACocher = [
      'Afficher «\u00a0Pour aller plus loin\u00a0»',
      true,
    ]
    this.sup2 = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const codeScratch = `\\begin{scratch}[fill blocks,scale=0.8]
\\blockinit{quand \\greenflag est cliqué}
\\blocksensing{demander \\ovalnum{Choisir un nombre} et attendre}
\\blockvariable{mettre \\selectmenu{A} à \\ovaloperator{\\ovalsensing{réponse} - \\ovalnum{7}}}
\\blockvariable{mettre \\selectmenu{B} à \\ovaloperator{\\ovaloperator{\\ovalnum{3} * \\ovalsensing{réponse}} + \\ovalnum{1}}}
\\blockvariable{mettre \\selectmenu{C} à \\ovaloperator{\\ovalvariable{A} * \\ovalvariable{B}}}
\\blocklook{dire \\ovalvariable{C}}
\\end{scratch}`

    const filtreNoirEtBlanc = this.sup
      ? 'filter: grayscale(1) contrast(1.15);'
      : ''
    this.consigne =
      this.introBio +
      `<div class="not-prose" style="text-align:center; margin: 0.75rem 0; ${filtreNoirEtBlanc}">${scratchblock(codeScratch, 'block', false) || ''}</div>`

    let texte0 =
      `Combien de variables comporte ce programme${sp()}? Donner leurs noms.`
    if (this.interactif) texte0 += ajouteChampTexteMathLive(this, 0) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 3 } })
    const correction0 = `Ce programme comporte $${miseEnEvidence('3')}$ variables${sp()}: $A$, $B$ et $C$.`

    let texte1 =
      "En détaillant le calcul de $A$, $B$ puis $C$, vérifier que si l'on choisit $2$ comme nombre de départ, le programme renvoie bien $-35$."
    if (this.interactif) texte1 += ajouteChampTexteMathLive(this, 1) + '<br>'
    handleAnswers(this, 1, { reponse: { value: -35 } })
    const correction1 = `Avec $\\text{réponse}=2$${sp()}: $A=2-7=-5$ et $B=3\\times 2+1=7$, donc $C=A\\times B=-5\\times 7=${miseEnEvidence('-35')}$.`

    let texte2 =
      `Que renvoie le programme si l'on choisit au départ le nombre $-3$${sp()}?`
    if (this.interactif) texte2 += ajouteChampTexteMathLive(this, 2) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 80 } })
    const correction2 = `Avec $\\text{réponse}=-3$${sp()}: $A=-3-7=-10$ et $B=3\\times(-3)+1=-8$, donc $C=(-10)\\times(-8)=${miseEnEvidence('80')}$.`

    let texte3 =
      `Que renvoie le programme si l'on choisit au départ le nombre $\\dfrac{19}{3}$${sp()}? Donner la valeur exacte, puis son arrondi au centième.`
    if (this.interactif) texte3 += ajouteChampTexteMathLive(this, 3) + '<br>'
    handleAnswers(this, 3, { reponse: { value: -13.33 } })
    const correction3 = `Avec $\\text{réponse}=\\dfrac{19}{3}$${sp()}: $A=\\dfrac{19}{3}-7=-\\dfrac{2}{3}$ et $B=3\\times\\dfrac{19}{3}+1=20$, donc $C=-\\dfrac{2}{3}\\times 20=-\\dfrac{40}{3}$ (valeur exacte), soit environ $${miseEnEvidence('-13{,}33')}$.`

    const texteQ4 =
      `En prenant $x$ comme nombre de départ, l'expression littérale correspondant à ce programme est $(x-7)(3x+1)$. Quel est son développement${sp()}?`
    this.autoCorrection[4] = {
      enonce: texteQ4,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: '$3x^2-20x-7$', statut: true },
        { texte: '$3x^2+20x-7$', statut: false },
        { texte: '$3x^2-20x+7$', statut: false },
      ],
    }
    const monQcm4 = propositionsQcm(this, 4)
    let texte4 = texteQ4
    if (!context.isAmc) texte4 += monQcm4.texte
    const correction4 = `$(x-7)(3x+1)=3x^2+x-21x-7=${miseEnEvidence('3x^2-20x-7')}$.`

    const texteQ5 =
      `L'affirmation suivante est-elle correcte${sp()}? «\u00a0Pour tout nombre $x$, $(x-7)(3x+1)$ est égale à $2x(3x-7)-(7+3x^2+6x)$\u00a0».`
    this.autoCorrection[5] = {
      enonce: texteQ5,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Vrai', statut: true },
        { texte: 'Faux', statut: false },
      ],
    }
    const monQcm5 = propositionsQcm(this, 5)
    let texte5 = texteQ5
    if (!context.isAmc) texte5 += monQcm5.texte
    const correction5 = `$2x(3x-7)-(7+3x^2+6x)=6x^2-14x-7-3x^2-6x=3x^2-20x-7$, qui est bien égal au développement de $(x-7)(3x+1)$ trouvé à la question précédente. ${texteEnCouleurEtGras("L'affirmation est donc vraie")}.`

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
    if (this.sup2)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir

    listeQuestionsToContenu(this)
  }
}
