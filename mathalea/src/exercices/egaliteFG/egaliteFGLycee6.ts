import { createList } from '../../lib/format/lists'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteCode,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Une politique de rattrapage salarial'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = 'd5005'
export const refs = {
  'fr-fr': ['EgaliteFG5-2de-6'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Pourcentages']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee6 extends Exercice {
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
      '<br><br>Dans une entreprise de $1\\,000$ salariés, il y a $600$ hommes et $400$ femmes. Le salaire moyen des hommes est de $2\\,500$ € par mois, celui des femmes de $2\\,200$ € par mois.'
    this.nbQuestions = 14
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      `.<br>Au bout de deux ans, malgré une augmentation plus forte pour les femmes, l'écart de salaire en euros a-t-il diminué ou augmenté${sp()}? Que cela nous enseigne-t-il sur la difficulté de résorber les inégalités quand les salaires de départ sont très différents${sp()}?`
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 =
      texteGras('Partie A') +
      `<br>Quel est l'écart salarial moyen mensuel entre les hommes et les femmes dans cette entreprise${sp()}?`
    if (this.interactif)
      texte0 +=
        ajouteChampTexteMathLive(this, 0, '', { texteApres: '€' }) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 300 } })
    const correction0 = `$2\\,500-2\\,200=${miseEnEvidence('300')}$ €.`

    let texte1 =
      `Quelle est cette différence salariale en pourcentage (par rapport au salaire des hommes)${sp()}?`
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 12 } })
    const correction1 = `$\\dfrac{300}{2\\,500}=${miseEnEvidence('12')}\\,\\%$.`

    let texte2 =
      `Pour que les femmes aient un salaire moyen égal à celui des hommes, quel taux d'évolution faudrait-il appliquer à leur salaire (arrondi au dixième)${sp()}?`
    if (this.interactif)
      texte2 +=
        ajouteChampTexteMathLive(this, 2, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 13.6 } })
    const correction2 = `$\\dfrac{2\\,500-2\\,200}{2\\,200}\\approx ${miseEnEvidence('13{,}6')}\\,\\%$.`

    let texte3 =
      `Quel budget mensuel supplémentaire l'entreprise devrait-elle prévoir pour augmenter toutes les femmes de $300$ € afin d'atteindre l'équité salariale${sp()}?`
    if (this.interactif)
      texte3 +=
        ajouteChampTexteMathLive(this, 3, '', { texteApres: '€' }) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 120000 } })
    const correction3 = `$300\\times 400=${miseEnEvidence('120\\,000')}$ €.`

    let texte4 =
      "L'entreprise augmente les salaires de $3\\,\\%$ pour les hommes et $4\\,\\%$ pour les femmes la première année. Calculer le nouveau salaire moyen des hommes."
    if (this.interactif)
      texte4 +=
        ajouteChampTexteMathLive(this, 4, '', { texteApres: '€' }) + '<br>'
    handleAnswers(this, 4, { reponse: { value: 2575 } })
    const correction4 = `$2\\,500\\times 1{,}03=${miseEnEvidence('2\\,575')}$ €.`

    let texte5 = 'Même question pour les femmes.'
    if (this.interactif)
      texte5 +=
        ajouteChampTexteMathLive(this, 5, '', { texteApres: '€' }) + '<br>'
    handleAnswers(this, 5, { reponse: { value: 2288 } })
    const correction5 = `$2\\,200\\times 1{,}04=${miseEnEvidence('2\\,288')}$ €.`

    let texte6 =
      `Quel est le pourcentage d'écart salarial entre les hommes et les femmes après cette première année (arrondi au dixième)${sp()}?`
    if (this.interactif)
      texte6 +=
        ajouteChampTexteMathLive(this, 6, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 6, { reponse: { value: 11.1 } })
    const correction6 = `$\\dfrac{2\\,575-2\\,288}{2\\,575}\\approx ${miseEnEvidence('11{,}1')}\\,\\%$.`

    let texte7 =
      'La deuxième année, les salaires des hommes augmentent encore de $3\\,\\%$ et ceux des femmes de $5\\,\\%$. Calculer le salaire moyen des hommes à la fin de la deuxième année.'
    if (this.interactif)
      texte7 +=
        ajouteChampTexteMathLive(this, 7, '', { texteApres: '€' }) + '<br>'
    handleAnswers(this, 7, { reponse: { value: 2652.25 } })
    const correction7 = `$2\\,575\\times 1{,}03=${miseEnEvidence('2\\,652{,}25')}$ €.`

    let texte8 = 'Même question pour les femmes.'
    if (this.interactif)
      texte8 +=
        ajouteChampTexteMathLive(this, 8, '', { texteApres: '€' }) + '<br>'
    handleAnswers(this, 8, { reponse: { value: 2402.4 } })
    const correction8 = `$2\\,288\\times 1{,}05=${miseEnEvidence('2\\,402{,}4')}$ €.`

    let texte9 =
      `Quel est le taux d'évolution global au bout des deux ans d'augmentation salariale pour les femmes, puis pour les hommes (arrondi au dixième)${sp()}?`
    if (this.interactif)
      texte9 +=
        ajouteChampTexteMathLive(this, 9, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 9, { reponse: { value: 9.2 } })
    const correction9 = `Pour les femmes${sp()}: $1{,}04\\times 1{,}05=1{,}092$, soit un taux d'évolution global de $${miseEnEvidence('+9{,}2')}\\,\\%$. Pour les hommes${sp()}: $1{,}03\\times 1{,}03=1{,}0609$, soit un taux d'évolution global de $+6{,}09\\,\\%\\approx +6{,}1\\,\\%$.`

    let texte10 =
      `Quel est le pourcentage d'écart salarial après ces deux années, arrondi au dixième${sp()}?`
    if (this.interactif)
      texte10 +=
        ajouteChampTexteMathLive(this, 10, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 10, { reponse: { value: 9.4 } })
    const correction10 = `$\\dfrac{2\\,652{,}25-2\\,402{,}4}{2\\,652{,}25}\\approx ${miseEnEvidence('9{,}4')}\\,\\%$. L'écart relatif diminue lentement ($12\\,\\%\\to 11{,}1\\,\\%\\to 9{,}4\\,\\%$), mais l'écart en euros, lui, ne diminue presque pas ($2\\,652{,}25-2\\,402{,}4=249{,}85$ € contre $300$ € au départ).`

    const texte11 =
      texteGras(`Partie B${sp()}: Atteindre l'égalité salariale`) +
      '<br>' +
      `L'entreprise décide de conserver chaque année les taux d'évolution des salaires de la deuxième année du plan d'augmentation, à savoir${sp()}:<br>` +
      createList({
        items: [
          "Les hommes bénéficient d'une augmentation salariale de $3\\,\\%$ par an.",
          "Les femmes bénéficient d'une augmentation salariale de $5\\,\\%$ par an.",
        ],
        style: 'puces',
      }) +
      "L'objectif de cette partie est de déterminer au bout de combien d'années les salaires des femmes égaleront ceux des hommes, en maintenant ces taux d'augmentation annuels.<br><br>" +
      `Créer un fichier sur le tableur où${sp()}:<br>` +
      createList({
        items: [
          "la première colonne représente le nombre d'années $n$ d'application du plan d'augmentation ;",
          'la deuxième colonne le salaire moyen mensuel des femmes ;',
          'la troisième colonne le salaire moyen mensuel des hommes.',
        ],
        style: 'puces',
      })
    const correction11 =
      `On crée un tableur à $3$ colonnes A (années $n$), B (salaire des femmes), C (salaire des hommes), avec en ligne $2$ l'état atteint à la fin de la deuxième année du plan ($n=0$${sp()}: $2\\,402{,}4$ € pour les femmes, $2\\,652{,}25$ € pour les hommes).`

    const texte12 =
      `Compléter les deux premières années après l'augmentation salariale. Quelles formules mettre en B3, B4, C3 et C4${sp()}?`
    const correction12 =
      `En B3${sp()}: ${texteCode('=B2*1,05')} (ou ${texteCode('=B2*1.05')}) ; en C3${sp()}: ${texteCode('=C2*1,03')}. On recopie ensuite ces formules vers le bas${sp()}: en B4, ${texteCode('=B3*1,05')} ; en C4, ${texteCode('=C3*1,03')}.`

    let texte13 =
      "Déterminer le nombre d'années nécessaires pour que le salaire moyen des femmes atteigne celui des hommes."
    if (this.interactif)
      texte13 +=
        ajouteChampTexteMathLive(this, 12, '', { texteApres: 'ans' }) + '<br>'
    handleAnswers(this, 12, { reponse: { value: 6 } })
    const correction13 = `On calcule $F_n=2\\,402{,}4\\times 1{,}05^n$ et $H_n=2\\,652{,}25\\times 1{,}03^n$ à la calculatrice ou au tableur${sp()}: pour $n=5$, $F_5\\approx 3\\,066{,}14$ € $< H_5\\approx 3\\,074{,}68$ € ; pour $n=6$, $F_6\\approx 3\\,219{,}45$ € $> H_6\\approx 3\\,166{,}93$ €. C'est donc au bout de $${miseEnEvidence('6')}$ années supplémentaires (soit $8$ ans après le début du plan) que le salaire moyen des femmes dépasse celui des hommes.`

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
    this.listeQuestions[13] = texte13
    this.listeCorrections[13] = correction13
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat

    this.listeReponsesCourtes[11] = null
    this.listeReponsesCourtes[12] =
      `B3${sp()}: =B2*1,05 ; B4${sp()}: =B3*1,05 ; C3${sp()}: =C2*1,03 ; C4${sp()}: =C3*1,03.`

    listeQuestionsToContenu(this)
  }
}
