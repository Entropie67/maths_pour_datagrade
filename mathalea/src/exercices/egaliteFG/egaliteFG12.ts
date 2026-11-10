import { handleAnswers } from '../../lib/interactif/gestionInteractif'
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

export const titre =
  "À la conquête de l'espace"
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '42693'
export const refs = {
  'fr-fr': ['EgaliteFG4-3e-12'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Puissances','Grandeurs','Espace']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG12 extends Exercice {
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
    this.consigne += context.isHtml
      ? '<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/figures-de-l-ombre.jpg" alt="Affiche du film Les figures de l\'ombre" style="width:130px; height:auto; border-radius:0.5rem; border:3px solid #f15929;"><p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Les figures de l\'ombre, de Theodore Melfi (2016)</p></div>'
      : ''
    this.comment =
      texteGras("À la conquête de l'espace") +
      '<br>' +
      "La séquence se décline en quatre parties : le visionnage de la bande-annonce (et/ou du film) <i>Les figures de l'ombre</i>, de Theodore Melfi (2016), puis trois parties avec des exercices pratiques sur :<br>" +
      '<ul style="margin:0.25rem 0 0.5rem 1.25rem;">' +
      '<li>une exploration des grandeurs et des unités de mesure ;</li>' +
      "<li>la conversion d'unités de mesure puis la substitution de variables algébriques pour calculer le volume et la circonférence de la Terre ;</li>" +
      '<li>la distance parcourue par un satellite géostationnaire quand il fait un tour complet autour de notre planète.</li>' +
      '</ul>' +
      "Avant que les élèves se lancent dans l'activité, il est recommandé de leur rappeler les différences entre l'écriture décimale, l'écriture fractionnaire et l'écriture scientifique d'un nombre décimal, ainsi que la différence entre une grandeur et une unité de mesure."
    this.nbQuestions = 13
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const texte0 =
      texteGras("Partie 1 : Phase d'exploration") +
      "<br>La vitesse, la durée, la distance et la masse sont des grandeurs, c'est-à-dire que ce sont des caractéristiques qui se mesurent ou se calculent et qui s'expriment sous forme de nombres, suivis d'une unité de mesure.<br>Explore ta mémoire et cite cinq autres grandeurs.<br>Cite, pour chacune des grandeurs suivantes, deux unités de mesure qui correspondent à cette grandeur.<br>Exemple : la vitesse : km/h et m/s (ou autres)<br>La durée - La distance - La masse - Le volume"
    const correction0 =
      "Réponse possible parmi de nombreuses grandeurs : la température, l'énergie, la force, l'aire, l'intensité électrique, la concentration $\\ldots$<br>La durée : minutes, heures (ou jours, secondes $\\ldots$). La distance : mètres, kilomètres (ou autres). La masse : kilogrammes, tonnes (ou autres). Le volume : m³, dm³ (ou autres)."

    let texte1 =
      texteGras("Partie 2 : Changements d'unités et notation scientifique") +
      "<br>Fais les calculs et exprime la durée évoquée par les enfants de Katherine Johnson (dans la bande-annonce ou le film) en minutes puis en jours et heures, et enfin en jours sous la forme d'un nombre décimal." +
      '<br>' +
      ajouterLien(
        'https://www.youtube-nocookie.com/embed/548FlCcem58?playlist=548FlCcem58&autoplay=1&iv_load_policy=3&loop=1&start=',
        'Voir la bande-annonce',
      ) +
      '<br>' +
      "La durée est de $300$ h. Exprime cette durée en jours, sous la forme d'un nombre décimal."
    if (this.interactif)
      texte1 +=
        '<br>' +
        ajouteChampTexteMathLive(this, 1, '', { texteApres: 'jours' }) +
        '<br>'
    handleAnswers(this, 1, { reponse: { value: 12.5 } })
    const correction1 = `La durée évoquée est de $300$ h.<br>$300\\times 60=18\\,000$ minutes.<br>$300=24\\times 12+12$, soit $12$ jours et $12$ heures.<br>$300\\div 24=${miseEnEvidence('12{,}5')}$ jours (sous forme décimale).`

    let texte2 =
      "La distance entre la Terre et la Lune est en moyenne de $384\\,400$ km (la Lune décrit une ellipse autour de la Terre). Exprime cette distance en mètres, d'abord en écriture décimale puis en notation scientifique, toujours en mètres."
    if (this.interactif)
      texte2 +=
        '<br>' +
        ajouteChampTexteMathLive(this, 2, '', { texteApres: 'm' }) +
        '<br>'
    handleAnswers(this, 2, { reponse: { value: 384400000 } })
    const correction2 = `$384\\,400\\text{ km}=${miseEnEvidence('384\\,400\\,000')}\\text{ m}$, soit en notation scientifique $3{,}844\\times 10^{8}\\text{ m}$.`

    let texte3 =
      "La masse de la Terre est de $5{,}974\\times 10^{24}$ kg. Exprime la masse de la Terre en tonnes, en écriture décimale ou scientifique (selon ton choix), en sachant qu'une tonne vaut $1\\,000$ kg : sous la forme $5{,}974\\times 10^{n}$, quelle est la valeur de l'entier $n$ ?"
    if (this.interactif)
      texte3 += '<br>' + ajouteChampTexteMathLive(this, 3) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 21 } })
    const correction3 = `$5{,}974\\times 10^{24}\\text{ kg}\\div 1\\,000=5{,}974\\times 10^{24}\\div 10^{3}=5{,}974\\times 10^{21}$ tonnes, donc $n=${miseEnEvidence('21')}$.`

    let texte4 =
      "La vitesse de la lumière dans le vide est de $299\\,792\\,458$ m/s. Arrondis au millier puis exprime la vitesse en km/h, en plusieurs étapes.<br>Arrondis d'abord cette valeur au millier (en m/s)."
    if (this.interactif)
      texte4 +=
        '<br>' +
        ajouteChampTexteMathLive(this, 4, '', { texteApres: 'm/s' }) +
        '<br>'
    handleAnswers(this, 4, { reponse: { value: 299792000 } })
    const correction4 = `$299\\,792\\,458\\approx ${miseEnEvidence('299\\,792\\,000')}$ m/s (arrondi au millier).`

    let texte5 =
      'En partant de cette valeur arrondie, exprime la vitesse de la lumière en km/h.'
    if (this.interactif)
      texte5 +=
        '<br>' +
        ajouteChampTexteMathLive(this, 5, '', { texteApres: 'km/h' }) +
        '<br>'
    handleAnswers(this, 5, { reponse: { value: 1079251200 } })
    const correction5 = `$299\\,792\\,000\\text{ m/s}=299\\,792{,}000\\text{ km/s}$. Une heure comptant $3\\,600$ secondes : $299\\,792\\times 3\\,600=${miseEnEvidence('1\\,079\\,251\\,200')}$ km/h (on multiplie par $3{,}6$ pour passer de m/s à km/h).`

    let texte6 =
      texteGras(
        "Partie 3 : Volume et circonférence de la Terre, trajectoire d'un satellite",
      ) +
      (context.isHtml
        ? '<div class="not-prose" style="text-align:center; margin: 0.5rem 0;"><img src="/alea/images/egalite/terre.png" alt="Illustration de la Terre" style="width:80px; height:auto;"></div>'
        : '') +
      "<br>Quel est le volume d'une boule de rayon $50$ cm ? Tu utiliseras pour valeur approchée de $\\pi$ le nombre $3$. N'oublie pas d'écrire ton résultat avec l'unité de mesure correcte.<br>Aide : le volume d'une boule de rayon $r$ est donné par la formule $V=\\dfrac{4}{3}\\pi r^3$."
    if (this.interactif)
      texte6 +=
        '<br>' +
        ajouteChampTexteMathLive(this, 6, '', { texteApres: 'cm³' }) +
        '<br>'
    handleAnswers(this, 6, { reponse: { value: 500000 } })
    const correction6 = `$V=\\dfrac{4}{3}\\times 3\\times 50^3=4\\times 125\\,000=${miseEnEvidence('500\\,000')}\\text{ cm}^3$.`

    let texte7 = 'Réécris le volume trouvé et convertis-le en m³.'
    if (this.interactif)
      texte7 +=
        '<br>' +
        ajouteChampTexteMathLive(this, 7, '', { texteApres: 'm³' }) +
        '<br>'
    handleAnswers(this, 7, { reponse: { value: 0.5 } })
    const correction7 = `$500\\,000\\text{ cm}^3=${miseEnEvidence('0{,}5\\text{ m}^3')}$ (puisque $1\\text{ m}^3=1\\,000\\,000\\text{ cm}^3$).`

    let texte8 =
      "La Terre est une boule aplatie un peu aux pôles mais, pour faciliter les calculs, nous allons considérer ici que c'est une boule parfaite. Le rayon de la Terre mesure $6\\,371{,}03$ km. Arrondis ce rayon à la centaine de km."
    if (this.interactif)
      texte8 +=
        '<br>' +
        ajouteChampTexteMathLive(this, 8, '', { texteApres: 'km' }) +
        '<br>'
    handleAnswers(this, 8, { reponse: { value: 6400 } })
    const correction8 = `$6\\,371{,}03\\approx ${miseEnEvidence('6\\,400')}$ km (arrondi à la centaine).`

    let texte9 =
      'Calcule le volume de la Terre avec un rayon arrondi à la centaine de km ($6\\,400$ km). Exprime le résultat en écriture décimale puis en notation scientifique. Tu utiliseras pour valeur approchée de $\\pi$ le nombre $3$.'
    if (this.interactif)
      texte9 +=
        '<br>' +
        ajouteChampTexteMathLive(this, 9, '', { texteApres: 'km³' }) +
        '<br>'
    handleAnswers(this, 9, { reponse: { value: 1048576000000 } })
    const correction9 = `$V=\\dfrac{4}{3}\\times 3\\times 6\\,400^3=4\\times 262\\,144\\,000\\,000=1\\,048\\,576\\,000\\,000\\text{ km}^3$, soit environ $${miseEnEvidence('1{,}048576\\times 10^{12}\\text{ km}^3')}$.`

    let texte10 =
      "Convertis le volume de la Terre que tu as trouvé en m³, d'abord en écriture décimale puis en notation scientifique : sous la forme $1{,}048576\\times 10^{n}$, quelle est la valeur de l'entier $n$ ?"
    if (this.interactif)
      texte10 += '<br>' + ajouteChampTexteMathLive(this, 10) + '<br>'
    handleAnswers(this, 10, { reponse: { value: 21 } })
    const correction10 = `$1\\text{ km}^3=10^{9}\\text{ m}^3$, donc $1{,}048576\\times 10^{12}\\text{ km}^3=1{,}048576\\times 10^{21}\\text{ m}^3$ : $n=${miseEnEvidence('21')}$.`

    let texte11 =
      (context.isHtml
        ? '<div class="not-prose" style="text-align:center; margin: 0.5rem 0;"><img src="/alea/images/egalite/terre-satellite.png" alt="Illustration d\'un satellite en orbite autour de la Terre" style="width:150px; height:auto;"></div>'
        : '') +
      'Maintenant, considérons le satellite géostationnaire Telstar 1 (un satellite géostationnaire est un satellite qui tourne de façon circulaire autour de la Terre à la même vitesse que celle-ci tourne sur elle-même), qui a permis à la société privée AT' +
      (context.isHtml ? '&' : '\\&') +
      "T de lancer dans l'espace le premier satellite de télécommunication de l'histoire, le 10 juillet 1962, depuis la base de la NASA à Cape Canaveral, aux États-Unis.<br>Calcule la circonférence de la Terre et arrondis le résultat trouvé au centième de km, puis au millier de km. Le rayon de la Terre est donné dans une question précédente ($6\\,371{,}03$ km). Tu utiliseras la valeur de $\\pi$ donnée par la calculatrice."
    if (this.interactif)
      texte11 +=
        '<br>' +
        ajouteChampTexteMathLive(this, 11, '', {
          texteApres: 'km (au millier)',
        }) +
        '<br>'
    handleAnswers(this, 11, { reponse: { value: 40000 } })
    const correction11 = `$C=2\\pi r\\approx 2\\times \\pi \\times 6\\,371{,}03\\approx 40\\,030{,}36$ km (arrondi au centième), soit environ $${miseEnEvidence('40\\,000')}$ km (arrondi au millier).`

    let texte12 =
      "L'altitude du satellite Telstar 1 est d'environ $36\\,000$ km. Le rayon de la Terre est donné dans une question précédente.<br>Calcule la circonférence du cercle que le satellite a décrit lorsqu'il a effectué un tour complet autour de la Terre et arrondis le résultat trouvé au centième de km, puis au millier de km."
    if (this.interactif)
      texte12 +=
        '<br>' +
        ajouteChampTexteMathLive(this, 12, '', {
          texteApres: 'km (au millier)',
        }) +
        '<br>'
    handleAnswers(this, 12, { reponse: { value: 266000 } })
    const correction12 = `Le rayon de l'orbite est $6\\,371{,}03+36\\,000=42\\,371{,}03$ km. $C=2\\pi\\times 42\\,371{,}03\\approx 266\\,225{,}03$ km (arrondi au centième), soit environ $${miseEnEvidence('266\\,000')}$ km (arrondi au millier).`

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
    this.listeQuestions[11] = texte11
    this.listeCorrections[11] = correction11
    this.listeQuestions[12] = texte12
    this.listeCorrections[12] = correction12

    this.listeReponsesCourtes[0] =
      'Exemples : température, énergie, force, aire, intensité électrique. Durée : s, min ; distance : m, km ; masse : g, kg ; volume : L, m³.'

    listeQuestionsToContenu(this)
  }
}
