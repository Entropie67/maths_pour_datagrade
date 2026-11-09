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

export const titre = 'Femmes et hommes dans les postes de direction'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '6de09'
export const refs = {
  'fr-fr': ['EgaliteFG6-1e-10'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Suites numériques', 'Pourcentages']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee10 extends Exercice {
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
      "<br><br>Dans un secteur professionnel, en 2020, $500$ femmes occupaient un poste de direction contre $1\\,500$ hommes. Chaque année, la mise en place de lois favorisant la parité au sein des comités décisionnels augmente le nombre de femmes dirigeantes de $8\\,\\%$ et le nombre d'hommes de $3\\,\\%$.<br>" +
      "On note $F_n$ le nombre de femmes et $H_n$ le nombre d'hommes dirigeants en $2020+n$, avec $F_0=500$ et $H_0=1\\,500$."
    this.nbQuestions = 4
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      '.<br>Cette politique est-elle suffisante pour atteindre la parité ?<br>Pourquoi les femmes sont-elles encore minoritaires dans les postes à responsabilités, malgré les lois ?'
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const texteQ0 = 'Quelle est la nature des suites $(F_n)$ et $(H_n)$ ?'
    this.autoCorrection[0] = {
      enonce: texteQ0,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Arithmétiques', statut: false },
        { texte: 'Géométriques', statut: true },
        { texte: "Ni l'une ni l'autre", statut: false },
      ],
    }
    const monQcm0 = propositionsQcm(this, 0)
    let texte0 = texteQ0
    if (!context.isAmc) texte0 += monQcm0.texte
    const correction0 = `$(F_n)$ et $(H_n)$ sont ${texteEnCouleurEtGras('géométriques')} : $(F_n)$ de raison $1{,}08$ (donc $F_n=500\\times 1{,}08^n$) et $(H_n)$ de raison $1{,}03$ (donc $H_n=1\\,500\\times 1{,}03^n$).`

    let texte1 =
      "Combien de femmes occuperont un poste de direction en 2030 (arrondi à l'unité) ?"
    if (this.interactif) texte1 += ajouteChampTexteMathLive(this, 1) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 1079 } })
    const correction1 = `$F_{10}=500\\times 1{,}08^{10}\\approx ${miseEnEvidence('1\\,079')}$.`

    let texte2 =
      "Combien d'hommes occuperont un poste de direction en 2030 (arrondi à l'unité) ?"
    if (this.interactif) texte2 += ajouteChampTexteMathLive(this, 2) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 2016 } })
    const correction2 = `$H_{10}=1\\,500\\times 1{,}03^{10}\\approx ${miseEnEvidence('2\\,016')}$.`

    let texte3 =
      "En combien d'années (à partir de 2020) l'effectif de femmes dirigeantes dépassera-t-il l'effectif d'hommes dirigeants ?"
    if (this.interactif)
      texte3 +=
        ajouteChampTexteMathLive(this, 3, '', { texteApres: 'ans' }) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 24 } })
    const correction3 = `On cherche le plus petit $n$ tel que $500\\times 1{,}08^n>1\\,500\\times 1{,}03^n$, soit $\\left(\\dfrac{1{,}08}{1{,}03}\\right)^n>3$. À la calculatrice ou au tableur, on trouve qu'à $n=23$ le rapport vaut environ $2{,}98<3$, et qu'à $n=24$ il vaut environ $3{,}12>3$ : c'est donc au bout de $${miseEnEvidence('24')}$ ans, soit en $2044$, que les femmes dirigeantes deviendront plus nombreuses que les hommes dirigeants.`

    this.listeQuestions[0] = texte0
    this.listeCorrections[0] = correction0
    this.listeQuestions[1] = texte1
    this.listeCorrections[1] = correction1
    this.listeQuestions[2] = texte2
    this.listeCorrections[2] = correction2
    this.listeQuestions[3] = texte3
    this.listeCorrections[3] = correction3
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat

    listeQuestionsToContenu(this)
  }
}
