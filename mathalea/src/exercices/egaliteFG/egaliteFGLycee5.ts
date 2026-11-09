import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Maryam Mirzakhani : trajectoires dans un hexagone régulier'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '6ced7'
export const refs = {
  'fr-fr': ['EgaliteFG5-2de-5'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Géométrie']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee5 extends Exercice {
  commentaireApprofondir = ''

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
      "<br><br>Ce problème s'inspire des travaux de la mathématicienne Maryam Mirzakhani (1977-2017), première femme à recevoir la médaille Fields, en 2014, qui a étudié les trajectoires de points sur des surfaces complexes.<br>" +
      'On considère un hexagone régulier inscrit dans un cercle de centre $O$ et de rayon $6$ cm.'
    this.nbQuestions = 7
    this.nbQuestionsModifiable = false
    this.comment =
      `Suggestion${sp()}: proposer aux élèves une animation GeoGebra pour visualiser les trajectoires du point $P$.`
    this.commentaireApprofondir =
      texteGras('Pour approfondir') +
      '.<br>Proposer le même exercice dans un carré en travail autonome.'
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour approfondir\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const texte0 =
      texteGras(`Partie 1${sp()}: Propriétés de l'hexagone régulier`) +
      '<br>Construction. Tracer un hexagone régulier inscrit dans un cercle de centre $O$ de rayon $6$ cm.'
    const correction0 =
      `Tracer un cercle de centre $O$ et de rayon $6$ cm. À l'aide du compas, reporter le rayon ($6$ cm) six fois consécutivement sur le cercle${sp()}: on obtient ainsi $6$ points, chacun séparé du précédent par un angle au centre de $60^\\circ$ (voir question suivante). Relier ces $6$ points consécutifs donne l'hexagone régulier inscrit dans le cercle.`

    let texte1 =
      `Quelle est la mesure de l'angle au centre correspondant à chaque côté de l'hexagone${sp()}?`
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: '°' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 60 } })
    const correction1 = `L'hexagone régulier a $6$ côtés, donc chaque angle au centre mesure $\\dfrac{360}{6}=${miseEnEvidence('60')}^\\circ$.`

    let texte2 = "Calculer la longueur d'un côté de l'hexagone."
    if (this.interactif)
      texte2 +=
        ajouteChampTexteMathLive(this, 2, '', { texteApres: 'cm' }) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 6 } })
    const correction2 = `Chaque triangle formé par deux rayons et un côté de l'hexagone est isocèle en $O$ avec un angle au sommet de $60^\\circ$${sp()}: c'est donc un triangle équilatéral. Le côté de l'hexagone est donc égal au rayon, soit $${miseEnEvidence('6')}\\text{ cm}$.`

    let texte3 = "Déterminer le périmètre de l'hexagone."
    if (this.interactif)
      texte3 +=
        ajouteChampTexteMathLive(this, 3, '', { texteApres: 'cm' }) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 36 } })
    const correction3 = `$6\\times 6=${miseEnEvidence('36')}\\text{ cm}$.`

    const texte4 =
      texteGras(`Partie 2${sp()}: Trajectoires et réflexions`) +
      `<br>Un point $P$ part du centre $O$ de l'hexagone et se déplace en ligne droite. Lorsqu'il atteint un côté, il est réfléchi selon la règle «\u00a0angle d'incidence = angle de réflexion\u00a0», comme une bille rebondissant sur une paroi.<br>Trajectoire vers un sommet. Que se passe-t-il si le point $P$ part en direction d'un sommet de l'hexagone${sp()}? Décrivez la trajectoire et représentez-la sur la figure.`
    const correction4 =
      `Si $P$ part exactement en direction d'un sommet, il l'atteint sans jamais toucher un côté${sp()}: la trajectoire est un simple segment de $O$ jusqu'au sommet, sans rebond (un sommet n'étant pas une paroi, la réflexion n'a lieu que sur un côté).`

    const texte5 =
      `Trajectoire avec un angle de $30^\\circ$. Et si le point $P$ part dans une direction formant un angle de $30^\\circ$ avec un côté de l'hexagone${sp()}? Quelle trajectoire peut-on observer${sp()}?`
    const correction5 =
      `Un angle de $30^\\circ$ est un sous-multiple rationnel des angles de l'hexagone (dont les côtés sont espacés de $60^\\circ$)${sp()}: la trajectoire de $P$ est alors périodique, elle se referme sur elle-même après un nombre fini de rebonds et repasse par sa position et sa direction de départ — contrairement à une direction de départ «\u00a0générique\u00a0» (angle non particulier), pour laquelle la trajectoire ne se refermerait jamais et finirait par passer arbitrairement près de tous les points de l'hexagone.`

    const texte6 =
      texteGras(`Partie 3${sp()}: Ouverture sur la recherche mathématique`) +
      `<br>Maryam Mirzakhani a étudié des trajectoires similaires sur des surfaces complexes (avec des trous ou des replis). À votre avis, pourquoi les mathématiciens s'intéressent-ils à la manière dont un point peut se déplacer ainsi sur une surface${sp()}?`
    const correction6 =
      "Ces trajectoires (dites «\u00a0billards\u00a0») permettent de modéliser des phénomènes physiques (propagation d'ondes, optique, dynamique de particules) et soulèvent des questions profondes sur le caractère périodique ou chaotique des trajectoires, très étudiées en géométrie et en systèmes dynamiques — c'est précisément ce type de questions qui a valu à Maryam Mirzakhani la médaille Fields."

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
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir

    this.listeReponsesCourtes[0] = null
    this.listeReponsesCourtes[4] = null
    this.listeReponsesCourtes[5] = null
    this.listeReponsesCourtes[6] = null

    listeQuestionsToContenu(this)
  }
}
