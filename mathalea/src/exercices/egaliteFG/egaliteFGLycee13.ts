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

export const titre = 'Le partage des tâches domestiques'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '58ae0'
export const refs = {
  'fr-fr': ['EgaliteFG6-1e-13'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Suites numériques']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee13 extends Exercice {
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
      '<br><br>En 2024, une femme consacre en moyenne $12$ heures par semaine aux tâches domestiques, contre $5$ heures pour un homme. On suppose que chaque année, les hommes augmentent leur participation de $0{,}5$ heure par semaine, tandis que les femmes diminuent leur temps de $0{,}3$ heure par semaine.<br>' +
      'On note $F_n$ le temps hebdomadaire des femmes et $H_n$ celui des hommes, $n$ années après 2024, avec $F_0=12$ et $H_0=5$.'
    this.nbQuestions = 4
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      ".<br>Discutez de la pertinence de cette modélisation et de la façon dont cette évolution pourrait être influencée par d'autres facteurs sociaux."
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
        { texte: 'Arithmétiques', statut: true },
        { texte: 'Géométriques', statut: false },
        { texte: "Ni l'une ni l'autre", statut: false },
      ],
    }
    const monQcm0 = propositionsQcm(this, 0)
    let texte0 = texteQ0
    if (!context.isAmc) texte0 += monQcm0.texte
    const correction0 = `Les deux suites sont ${texteEnCouleurEtGras('arithmétiques')} : $(F_n)$ de raison $-0{,}3$ et de premier terme $12$ (donc $F_n=12-0{,}3n$) ; $(H_n)$ de raison $0{,}5$ et de premier terme $5$ (donc $H_n=5+0{,}5n$).`

    let texte1 =
      "Combien d'heures les femmes consacreront-elles aux tâches domestiques en 2030 ($n=6$) ?"
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: 'h' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 10.2 } })
    const correction1 = `$F_6=12-0{,}3\\times 6=12-1{,}8=${miseEnEvidence('10{,}2')}\\text{ h}$.`

    let texte2 =
      "Combien d'heures les hommes consacreront-ils aux tâches domestiques en 2030 ($n=6$) ?"
    if (this.interactif)
      texte2 +=
        ajouteChampTexteMathLive(this, 2, '', { texteApres: 'h' }) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 8 } })
    const correction2 = `$H_6=5+0{,}5\\times 6=5+3=${miseEnEvidence('8')}\\text{ h}$.`

    let texte3 =
      "En résolvant $F_n=H_n$, au bout de combien d'années (valeur exacte) les hommes et les femmes consacreront-ils le même temps aux tâches domestiques ?"
    if (this.interactif)
      texte3 +=
        ajouteChampTexteMathLive(this, 3, '', { texteApres: 'ans' }) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 8.75 } })
    const correction3 = `$12-0{,}3n=5+0{,}5n \\iff 7=0{,}8n \\iff n=${miseEnEvidence('8{,}75')}$ : le temps consacré serait théoriquement égal au bout de $8{,}75$ ans, soit vers la fin de l'année 2032. Entre la 8e année (où les femmes font encore un peu plus que les hommes) et la 9e (où elles en font déjà un peu moins), l'égalité exacte n'est donc atteinte qu'à une date non entière.`

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
