import { imposerCorrectionsQcm } from '../../lib/interactif/alignerMiseEnEvidenceQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
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
import ExerciceVraiFaux from '../ExerciceVraiFaux'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Inès et Arthur'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '11ede'
export const refs = {
  'fr-fr': ['EgaliteFG4-3e-15'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Algorithmique et programmation','Calcul littéral','Pourcentages']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG15 extends ExerciceVraiFaux {
  introBio = ''
  commentaireDebat = ''
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
        ? '<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/rectangle-x2-x5.jpg" alt="Rectangle de largeur x+2 et de longueur x+5" style="max-width:240px; width:100%; height:auto;"></div>'
        : '') +
      '<br>$x$ désigne un nombre positif ou nul. On considère un rectangle dont la largeur est $x+2$ et la longueur est $x+5$.<br>' +
      "La professeure de mathématiques organise une séance en salle informatique et demande aux élèves de se mettre en binômes mixtes. Inès et Arthur ont réalisé un programme Scratch qui, à partir d'un nombre $x$ saisi, calcule les longueurs $l$ et $L$, le périmètre $P=2\\times(l+L)$ et l'aire $A=l\\times L$ du rectangle."
    // 4 affirmations du modèle + les 2 questions ajoutées par nouvelleVersion()
    this.nbQuestions = 6
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      `.<br>Pourquoi, selon vous, les filles sont-elles encore sous-représentées dans les métiers de la programmation informatique${sp()}?<br>Comment peut-on encourager davantage les filles à s'investir dans ce domaine et à choisir des carrières scientifiques et techniques${sp()}?`
    this.besoinFormulaire2CaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup2 = true
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
    this.besoinFormulaire3CaseACocher = [
      'Afficher «\u00a0Pour aller plus loin\u00a0»',
      true,
    ]
    this.sup3 = true
    this.affirmations = [
      {
        texte: "L'affirmation d'Inès sur le périmètre, $P=3x+9$, est correcte.",
        statut: false,
        correction: `$P=2\\times\\big((x+2)+(x+5)\\big)=2\\times(2x+7)=${miseEnEvidence('4x+14')}$. L'affirmation d'Inès est donc fausse${sp()}: c'est l'expression d'Arthur qui est correcte.`,
      },
      {
        texte: "L'affirmation d'Inès sur l'aire, $A=x^2+7x+10$, est correcte.",
        statut: true,
        correction: `$A=(x+2)(x+5)=x^2+5x+2x+10=${miseEnEvidence('x^2+7x+10')}$. L'affirmation d'Inès est donc correcte.`,
      },
      {
        texte:
          "L'affirmation d'Arthur sur le périmètre, $P=4x+14$, est correcte.",
        statut: true,
        correction: `$P=2\\times\\big((x+2)+(x+5)\\big)=2\\times(2x+7)=${miseEnEvidence('4x+14')}$. L'affirmation d'Arthur est donc correcte.`,
      },
      {
        texte:
          "L'affirmation d'Arthur sur l'aire, $A=x^2+10x+7$, est correcte.",
        statut: false,
        correction: `$A=(x+2)(x+5)=x^2+7x+10\\neq x^2+10x+7$. L'affirmation d'Arthur est donc fausse${sp()}: c'est l'expression d'Inès qui est correcte.<br>Chacun des deux élèves a donc une expression correcte et une expression fausse${sp()}: ${texteEnCouleurEtGras("la réussite n'est donc pas la propriété d'un seul binôme ou d'une seule personne")}.`,
      },
    ]
  }

  nouvelleVersion() {
    const codeScratch = `\\begin{scratch}[fill blocks,scale=0.8]
\\blockinit{quand \\greenflag est cliqué}
\\blocksensing{demander \\ovalnum{Donne un nombre} et attendre}
\\blockvariable{mettre \\selectmenu{x} à \\ovalsensing{réponse}}
\\blockvariable{mettre \\selectmenu{l} à \\ovaloperator{\\ovalvariable{x} + \\ovalnum{2}}}
\\blockvariable{mettre \\selectmenu{L} à \\ovaloperator{\\ovalvariable{x} + \\ovalnum{5}}}
\\blockvariable{mettre \\selectmenu{P} à \\ovaloperator{\\ovalnum{2} * \\ovaloperator{\\ovalvariable{l} + \\ovalvariable{L}}}}
\\blockvariable{mettre \\selectmenu{A} à \\ovaloperator{\\ovalvariable{l} * \\ovalvariable{L}}}
\\blocklook{dire \\ovalvariable{P} pendant \\ovalnum{2} secondes}
\\blocklook{dire \\ovalvariable{A} pendant \\ovalnum{2} secondes}
\\end{scratch}`
    const filtreNoirEtBlanc = this.sup
      ? 'filter: grayscale(1) contrast(1.15);'
      : ''
    const introConsigne =
      this.introBio +
      `<div class="not-prose" style="margin: 0.75rem 0; ${filtreNoirEtBlanc}">${scratchblock(codeScratch, 'block', false) || ''}</div>` +
      `Inès affirme${sp()}: «\u00a0$P=3x+9$ et $A=x^2+7x+10$\u00a0». Arthur affirme${sp()}: «\u00a0$P=4x+14$ et $A=x^2+10x+7$\u00a0».`
    super.nouvelleVersion()
    this.consigne = introConsigne + '<br><br>' + this.consigne

    const texte4 =
      `Que représentent les variables $l$ et $L$ dans ce programme${sp()}?`
    const correction4 = `En lisant le programme, $l$ représente $${miseEnEvidence('x+2')}$ (la largeur du rectangle) et $L$ représente $${miseEnEvidence('x+5')}$ (la longueur du rectangle).`

    let texte5 =
      `Partie 2 - Au lycée général et technologique, en cours de sciences de l'ingénieur, la classe est composée de $30$ élèves et $10\\,\\%$ sont des filles. Quel est l'effectif des filles dans cette classe${sp()}?`
    if (this.interactif) texte5 += ajouteChampTexteMathLive(this, 5) + '<br>'
    handleAnswers(this, 5, { reponse: { value: 3 } })
    const correction5 = `$30\\times \\dfrac{10}{100}=3$${sp()}: il y a $${miseEnEvidence('3')}$ filles dans cette classe.`

    this.listeQuestions[4] = texte4
    this.listeCorrections[4] = correction4
    this.listeQuestions[5] = texte5
    this.listeCorrections[5] = correction5
    this.nbQuestions = 6
    if (this.sup2)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat
    if (this.sup3)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir

    imposerCorrectionsQcm(this)
    listeQuestionsToContenu(this)
  }
}
