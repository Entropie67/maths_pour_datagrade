import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'La filière STMG deviendra-t-elle majoritairement féminine ?'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = 'c62f0'
export const refs = {
  'fr-fr': ['EgaliteFG6-1e-14'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Suites numériques', 'Pourcentages']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee14 extends Exercice {
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
      "<br><br>Dans un lycée, une filière STMG compte $35\\,\\%$ de filles et $65\\,\\%$ de garçons en 2024. Chaque année, le pourcentage de filles augmente de $2$ points tandis que celui des garçons diminue d'autant.<br>" +
      'On note $P_n$ le pourcentage de filles $n$ années après 2024, avec $P_0=35$.'
    this.nbQuestions = 3
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      '.<br>Discutez des facteurs pouvant influencer cette évolution.'
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const texte0 =
      'Définir une suite $(P_n)$ qui modélise le pourcentage de filles en fonction des années, en donnant sa relation de récurrence ainsi que son premier terme.'
    const correction0 = `$${miseEnEvidence('P_{n+1}=P_n+2')}$ et $P_0=35$.`

    const texte1 =
      `Quelle est la nature de la suite $(P_n)$${sp()}? Justifier en donnant ses caractéristiques.`
    const correction1 = `La suite $(P_n)$ est ${texteEnCouleurEtGras('arithmétique')}, de raison $2$ et de premier terme $35$ (chaque année, on ajoute $2$ points de pourcentage au terme précédent)${sp()}: on a donc, pour tout $n$, $P_n=35+2n$.`

    let texte2 =
      `À partir de quelle année (donner $n$, avec l'année $2024+n$) les filles seront-elles majoritaires dans cette filière${sp()}?`
    if (this.interactif) texte2 += ajouteChampTexteMathLive(this, 2) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 8 } })
    const correction2 = `On cherche le plus petit entier $n$ tel que $35+2n>50$, soit $n>7{,}5$, donc $n=8$${sp()}: les filles deviendront majoritaires en $2024+${miseEnEvidence('8')}=2032$.`

    this.listeQuestions[0] = texte0
    this.listeCorrections[0] = correction0
    this.listeQuestions[1] = texte1
    this.listeCorrections[1] = correction1
    this.listeQuestions[2] = texte2
    this.listeCorrections[2] = correction2
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat

    listeQuestionsToContenu(this)
  }
}
