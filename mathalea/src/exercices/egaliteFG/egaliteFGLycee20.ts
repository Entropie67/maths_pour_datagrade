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

export const titre = 'La féminisation du corps médical'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '7a886'
export const refs = {
  'fr-fr': ['EgaliteFG7-Tle-20'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Statistiques', 'Fonctions']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles (source : IRDES)
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee20 extends Exercice {
  commentaireDebat = ''
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
      `<br><br>Voici l'évolution du taux de femmes parmi les médecins en France, pour certaines années${sp()}:<br>`
    const tableauHtml = `<table style="border-collapse: collapse; margin: 10px 0;">
      <tr><th style="border: 1px solid #888; padding: 4px 10px;">Année</th><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1962</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">1982</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2000</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2010</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2018</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2021</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">2023</td></tr>
      <tr><th style="border: 1px solid #888; padding: 4px 10px;">Taux $y_i$ (%)</th><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">10</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">24</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">37</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">40</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">46</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">48</td><td style="border: 1px solid #888; padding: 4px 10px; text-align:center;">51</td></tr>
      </table>`
    const tableauLatex =
      '\\begin{center}\\begin{tabular}{|l|c|c|c|c|c|c|c|}\n\\hline\n' +
      'Année & 1962 & 1982 & 2000 & 2010 & 2018 & 2021 & 2023 \\\\\n\\hline\n' +
      'Taux $y_i$ (\\%) & 10 & 24 & 37 & 40 & 46 & 48 & 51 \\\\\n\\hline\n' +
      '\\end{tabular}\\end{center}\n'
    this.consigne += context.isHtml ? tableauHtml : tableauLatex
    this.consigne +=
      "On note $x_i$ le rang de l'année, en considérant que 1962 a pour rang $1$ (donc $x_1=1$). Selon certaines projections, les femmes pourraient constituer $66\\,\\%$ des médecins en exercice à l'horizon 2050."
    this.nbQuestions = 9
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras("Pour travailler l'oral") +
      `.<br>Sujet $1$ - Que pensez-vous de cette phrase${sp()}? «\u00a0Pour faire une femme médecin, il faut lui faire perdre la sensibilité, la timidité, la pudeur, l'endurcir par la vue des choses les plus horribles et les plus effrayantes [...] Lorsque la femme en serait arrivée là, je me le demande, que resterait-il de la femme ?\u00a0» (Docteur Montanier, 1868).<br>Sujet $2$ - Comment expliquez-vous la féminisation récente de la profession${sp()}?<br>Sujet $3$ - Rechercher la répartition genrée des spécialités en médecine. Comment expliquez-vous vos résultats${sp()}?`
    this.commentaireApprofondir =
      texteGras('Pour approfondir') +
      ".<br>Découvrez qui est Madeleine Brès, docteur en médecine en 1875, non autorisée à concourir à l'externat des hôpitaux alors qu'elle avait été «\u00a0faisant fonction d'interne provisoire\u00a0» à l'Hôpital de la Pitié pendant la Guerre de 1870.<br>" +
      ajouterLien(
        'https://fr.wikipedia.org/wiki/Madeleine_Brès',
        'Madeleine Brès',
      )
    this.besoinFormulaireCaseACocher = [
      "Afficher «\u00a0Pour travailler l'oral\u00a0»",
      true,
    ]
    this.besoinFormulaire2CaseACocher = ['Afficher «\u00a0Pour approfondir\u00a0»', true]
    this.sup = true
    this.sup2 = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 = `Quel est le rang $x_i$ associé à l'année 1982${sp()}?`
    if (this.interactif) texte0 += ajouteChampTexteMathLive(this, 0) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 21 } })
    const correction0 = `$1982-1962+1=${miseEnEvidence('21')}$.`

    let texte1 = `Quel est le rang $x_i$ associé à l'année 2023${sp()}?`
    if (this.interactif) texte1 += ajouteChampTexteMathLive(this, 1) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 62 } })
    const correction1 = `$2023-1962+1=${miseEnEvidence('62')}$.`

    const texteQ2 =
      `L'allure du nuage de points invite-t-elle à un ajustement affine${sp()}?`
    this.autoCorrection[2] = {
      enonce: texteQ2,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Oui', statut: true },
        { texte: 'Non', statut: false },
      ],
    }
    const monQcm2 = propositionsQcm(this, 2)
    let texte2 = texteQ2
    if (!context.isAmc) texte2 += monQcm2.texte
    const correction2 = `${texteEnCouleurEtGras('Oui')}${sp()}: les points semblent globalement alignés selon une tendance croissante, ce qui invite à un ajustement affine.`

    let texte3 =
      'À la calculatrice, déterminer le coefficient de corrélation linéaire entre $x$ et $y$ (arrondi au millième).'
    if (this.interactif) texte3 += ajouteChampTexteMathLive(this, 3) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 0.997 } })
    const correction3 = `La calculatrice donne $r\\approx ${miseEnEvidence('0{,}997')}$${sp()}: très proche de $1$, ce qui confirme la pertinence d'un ajustement affine.`

    let texte4 =
      'Déterminer le coefficient directeur $a$ de la droite de régression de $y$ en $x$ (arrondi au centième).'
    if (this.interactif) texte4 += ajouteChampTexteMathLive(this, 4) + '<br>'
    handleAnswers(this, 4, { reponse: { value: 0.64 } })
    const correction4 = `La calculatrice donne $a\\approx ${miseEnEvidence('0{,}64')}$.`

    let texte5 =
      "Déterminer l'ordonnée à l'origine $b$ de cette droite (arrondie au centième)."
    if (this.interactif) texte5 += ajouteChampTexteMathLive(this, 5) + '<br>'
    handleAnswers(this, 5, { reponse: { value: 10 } })
    const correction5 = `La calculatrice donne $b\\approx ${miseEnEvidence('10{,}00')}$${sp()}: la droite de régression a pour équation $y\\approx 0{,}64x+10$.`

    let texte6 =
      "À l'aide de ce modèle, déterminer le taux de femmes médecins en $\\%$ en 2050 (arrondi au dixième)."
    if (this.interactif)
      texte6 +=
        ajouteChampTexteMathLive(this, 6, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 6, { reponse: { value: 67.3 } })
    const correction6 = `Le rang de 2050 est $2050-1962+1=89$. $y=0{,}64\\times 89+10\\approx ${miseEnEvidence('67{,}3')}\\,\\%$.`

    let texte7 = 'Même question en 2100 (arrondi au dixième).'
    if (this.interactif)
      texte7 +=
        ajouteChampTexteMathLive(this, 7, '', { texteApres: '%' }) + '<br>'
    handleAnswers(this, 7, { reponse: { value: 99.5 } })
    const correction7 = `Le rang de 2100 est $2100-1962+1=139$. $y=0{,}64\\times 139+10\\approx ${miseEnEvidence('99{,}5')}\\,\\%$. Ce résultat, très proche de $100\\,\\%$ et qui dépasserait cette valeur peu après, n'est pas réaliste${sp()}: un ajustement affine ne peut pas être extrapolé indéfiniment, car un taux ne peut pas dépasser $100\\,\\%$.`

    let texte8 =
      "On propose un modèle logistique $N(t)=\\dfrac{75}{1+e^{-k(t-t_0)}}$ (avec $k,t_0>0$), tenant compte d'un effet de saturation. Déterminer $\\displaystyle\\lim_{t\\to +\\infty} N(t)$."
    if (this.interactif) texte8 += ajouteChampTexteMathLive(this, 8) + '<br>'
    handleAnswers(this, 8, { reponse: { value: 75 } })
    const correction8 = `Comme $k>0$, on a $-k(t-t_0)\\to -\\infty$ quand $t\\to +\\infty$, donc $e^{-k(t-t_0)}\\to 0$, d'où $N(t)\\to \\dfrac{75}{1+0}=${miseEnEvidence('75')}$. Ce modèle logistique prévoit donc une stabilisation du pourcentage de femmes médecins autour de $75\\,\\%$ (et non une croissance illimitée vers $100\\,\\%$ ou au-delà), ce qui est nettement plus réaliste que le modèle affine.`

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
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat

    if (this.sup2)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir

    listeQuestionsToContenu(this)
  }
}
