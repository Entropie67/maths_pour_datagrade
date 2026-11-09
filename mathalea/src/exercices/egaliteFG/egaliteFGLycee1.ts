import { createList } from '../../lib/format/lists'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Records du $100$ mètres'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '97035'
export const refs = {
  'fr-fr': ['EgaliteFG5-2de-1', 'EgaliteFG6-1e-1'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Fonctions', 'Pourcentages']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee1 extends Exercice {
  commentaireApprofondir = ''
  commentairePrecision = ''
  commentaireMiseEnGarde = ''

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
      `<br><br>On considère les records du monde du $100$ mètres en athlétisme. En 1912, le premier record masculin enregistré était de $10{,}6$ secondes (Don Lippincott, USA). En 1922, le premier record féminin enregistré était de $13{,}6$ secondes (Marie Mejzlikova, Tchécoslovaquie), tandis que celui des hommes était de $10{,}4$ secondes (Charley Paddock, USA). En 2024, les records sont les suivants${sp()}:<br>` +
      createList({
        items: [
          `Record masculin d'Usain Bolt (Jamaïque)${sp()}: $9{,}58$ secondes (atteint en 2009)`,
          `Record féminin de Florence Griffith-Joyner (USA)${sp()}: $10{,}49$ secondes (atteint en 1988)`,
        ],
        style: 'puces',
      }) +
      `On note $t$ le nombre d'années à partir de $1980$. On modélise les performances (en secondes) des sprinteuses et sprinteurs par les fonctions $f$ et $h$ suivantes, définies sur $\\mathbb{R}^+$${sp()}:<br>` +
      createList({
        items: [
          `Pour les femmes${sp()}: $f(t)=11-0{,}015t$`,
          `Pour les hommes${sp()}: $h(t)=10-0{,}02t$`,
        ],
        style: 'puces',
      })
    this.nbQuestions = 8
    this.nbQuestionsModifiable = false
    this.commentaireApprofondir =
      texteGras("Pour approfondir à l'oral") +
      `.<br>Pourquoi, selon vous, le premier record féminin date de 1922 et celui des hommes de 1912${sp()}?`
    this.besoinFormulaireCaseACocher = [
      "Afficher «\u00a0Pour approfondir à l'oral\u00a0»",
      true,
    ]
    this.sup = true
    this.commentairePrecision =
      texteGras('Précision') +
      '.<br>Cela peut permettre de faire un point historique sur la française Alice Milliat, organisatrice des premiers JO $100\\,\\%$ féminin en 1922 et grande défenseuse du sport féminin.<br>' +
      ajouterLien('https://www.youtube.com/watch?v=SGPU8CtA0gI', 'Lien')
    this.besoinFormulaire2CaseACocher = ['Afficher «\u00a0Précision\u00a0»', true]
    this.sup2 = true
    this.commentaireMiseEnGarde =
      texteGras('Mise en garde') +
      `.<br>Un débat type «\u00a0expliquer les différences de performance entre les hommes et les femmes\u00a0» est un débat qui demande une maîtrise du sujet de la place des femmes dans le sport. Nous vous recommandons l'écoute du podcast ${texteItalique('Les Couilles sur la Table')} «\u00a0Épisode $99$${sp()}: Sports Olympiques - Médaille d'or du sexisme\u00a0»`
    this.besoinFormulaire3CaseACocher = ['Afficher «\u00a0Mise en garde\u00a0»', true]
    this.sup3 = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 =
      "Calculer le pourcentage d'évolution du record du monde du $100$ m chez les femmes, entre 1922 (date du premier record recensé) et 2024 (arrondi au centième)."
    if (this.interactif)
      texte0 +=
        ajouteChampTexteMathLive(this, 0, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 0, { reponse: { value: -22.87 } })
    const correction0 = `$\\dfrac{10{,}49-13{,}6}{13{,}6}\\approx ${miseEnEvidence('-22{,}87')}\\,\\%$${sp()}: le record féminin a diminué d'environ $22{,}87\\,\\%$ (on part de 1922, date du premier record féminin recensé — aucun record féminin n'existait en 1912).`

    let texte1 =
      'Même question chez les hommes, entre 1912 et 2024 (arrondi au centième).'
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: -9.62 } })
    const correction1 = `$\\dfrac{9{,}58-10{,}6}{10{,}6}\\approx ${miseEnEvidence('-9{,}62')}\\,\\%$.`

    let texte2 =
      `Quelle était la performance théorique des femmes en 1980 ($t=0$), selon le modèle $f$${sp()}?`
    if (this.interactif)
      texte2 +=
        ajouteChampTexteMathLive(this, 2, '', { texteApres: 's' }) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 11 } })
    const correction2 = `$f(0)=11-0{,}015\\times 0=${miseEnEvidence('11')}$ s.`

    let texte3 = 'Même question pour les hommes, selon le modèle $h$.'
    if (this.interactif)
      texte3 +=
        ajouteChampTexteMathLive(this, 3, '', { texteApres: 's' }) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 10 } })
    const correction3 = `$h(0)=10-0{,}02\\times 0=${miseEnEvidence('10')}$ s.`

    let texte4 =
      `Selon ces modèles, dix ans plus tard ($t=10$), quelle était la performance théorique des femmes${sp()}?`
    if (this.interactif)
      texte4 +=
        ajouteChampTexteMathLive(this, 4, '', { texteApres: 's' }) + '<br>'
    handleAnswers(this, 4, { reponse: { value: 10.85 } })
    const correction4 = `$f(10)=11-0{,}015\\times 10=${miseEnEvidence('10{,}85')}$ s.`

    let texte5 = 'Même question pour les hommes.'
    if (this.interactif)
      texte5 +=
        ajouteChampTexteMathLive(this, 5, '', { texteApres: 's' }) + '<br>'
    handleAnswers(this, 5, { reponse: { value: 9.8 } })
    const correction5 = `$h(10)=10-0{,}02\\times 10=${miseEnEvidence('9{,}8')}$ s.`

    let texte6 =
      'Selon ce modèle mathématique, déterminer en quelle année les performances féminines et masculines devraient être égales.'
    if (this.interactif) texte6 += ajouteChampTexteMathLive(this, 6) + '<br>'
    handleAnswers(this, 6, { reponse: { value: 1780 } })
    const correction6 = `$f(t)=h(t) \\iff 11-0{,}015t=10-0{,}02t \\iff 0{,}005t=-1 \\iff t=-200$, ce qui correspond à l'année $${miseEnEvidence('1780')}$.`

    const texteQ7 =
      `Le modèle est-il réaliste${sp()}? Expliquer les limites de cette modélisation.`
    this.autoCorrection[7] = {
      enonce: texteQ7,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Oui', statut: false },
        { texte: 'Non', statut: true },
      ],
    }
    const monQcm7 = propositionsQcm(this, 7)
    let texte7 = texteQ7
    if (!context.isAmc) texte7 += monQcm7.texte
    const correction7 =
      `Non, ce modèle n'est pas réaliste${sp()}: l'année trouvée ($1780$) est antérieure à $1980$, donc sans réalité physique dans le cadre de l'étude. Comme le coefficient directeur de $h$ ($-0{,}02$) est plus grand en valeur absolue que celui de $f$ ($-0{,}015$), l'écart $f(t)-h(t)=1+0{,}005t$ ne fait qu'augmenter pour $t>0$${sp()}: le modèle affine prévoit donc, de façon irréaliste, que l'écart entre les deux performances ne cessera de se creuser, ce qui n'est pas cohérent avec les progrès observés dans le sport féminin. Ce modèle affine, valable seulement sur une plage limitée d'années, ne peut pas être extrapolé indéfiniment (les performances humaines ne peuvent pas décroître linéairement sans limite).`

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
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir
    if (this.sup2)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentairePrecision
    if (this.sup3)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireMiseEnGarde

    listeQuestionsToContenu(this)
  }
}
