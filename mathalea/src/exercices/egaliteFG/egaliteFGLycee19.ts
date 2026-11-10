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

export const titre = "Étudiantes en école d'ingénieurs"
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '86049'
export const refs = {
  'fr-fr': ['EgaliteFG7-Tle-19'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Suites numériques']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee19 extends Exercice {
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
      "<br><br>En 2015, une école d'ingénieures et d'ingénieurs en informatique compte $650$ étudiants et $150$ étudiantes. La direction observe chaque année une diminution de $16\\,\\%$ du nombre d'étudiantes ; des mesures d'inclusivité permettent l'inscription de $20$ nouvelles étudiantes supplémentaires chaque année.<br>" +
      "Pour tout entier $n$, on note $u_n$ le nombre d'étudiantes en $2015+n$, avec $u_0=150$."
    this.nbQuestions = 7
    this.nbQuestionsModifiable = false
    this.comment =
      `Piste 8 du livret${sp()}: comment animer un débat à partir de cet exercice${sp()}?`
    this.commentaireApprofondir =
      texteGras('Pour approfondir') +
      '.<br>' +
      "$\\bullet$ Le livre <i>Les oubliées du Numérique</i> d'Isabelle Collet.<br>" +
      `$\\bullet$ Deux vidéos${sp()}:<br>` +
      ajouterLien(
        'https://www.youtube.com/watch?v=K33QXGzrH_M',
        `Absence des femmes dans le numérique${sp()}: Les solutions existent (HUB Institute)`,
      ) +
      '<br>' +
      ajouterLien(
        'https://www.youtube.com/watch?v=4DQo4hy5wMg',
        'Les oubliées du numérique | Épisode 2 | Les femmes dans la Tech (ETNA)',
      )
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour approfondir\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 = 'Calculer $u_1$ et interpréter le résultat.'
    if (this.interactif) texte0 += ajouteChampTexteMathLive(this, 0) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 146 } })
    const correction0 = `$u_1=0{,}84\\times 150+20=126+20=146$${sp()}: en 2016, l'école compte $${miseEnEvidence('146')}$ étudiantes (une diminution malgré les mesures d'inclusivité).`

    const texte1 =
      `Justifier que, pour tout entier $n$${sp()}: $u_{n+1}=0{,}84\\,u_n+20$, puis démontrer par récurrence que la suite $(u_n)$ est décroissante.`
    const correction1 = `Une diminution de $16\\,\\%$ correspond à un coefficient multiplicateur de $1-0{,}16=0{,}84$ ; en ajoutant les $20$ nouvelles inscriptions, on obtient $u_{n+1}=0{,}84\\,u_n+20$.<br>Pour la récurrence${sp()}: au rang $0$, $u_1=146\\leqslant 150=u_0$. En supposant $u_{n+1}\\leqslant u_n$ à un rang $n$, on a $0{,}84\\,u_{n+1}\\leqslant 0{,}84\\,u_n$ (car $0{,}84>0$), donc $u_{n+2}=0{,}84\\,u_{n+1}+20\\leqslant 0{,}84\\,u_n+20=u_{n+1}$${sp()}: la propriété est donc vraie à tous les rangs, la suite $(u_n)$ est ${texteEnCouleurEtGras('décroissante')}.`

    const texteQ2 = `La suite $(u_n)$ est-elle convergente${sp()}?`
    this.autoCorrection[2] = {
      enonce: texteQ2,
      options: { ordered: true, radio: true },
      propositions: [
        {
          texte:
            'Oui, car elle est décroissante et minorée (par exemple par $0$)',
          statut: true,
        },
        { texte: 'Non', statut: false },
      ],
    }
    const monQcm2 = propositionsQcm(this, 2)
    let texte2 = texteQ2
    if (!context.isAmc) texte2 += monQcm2.texte
    const correction2 = `La suite $(u_n)$ est décroissante (question précédente) et minorée par $0$ (un effectif ne peut pas être négatif)${sp()}: elle est donc ${texteEnCouleurEtGras('convergente')}, d'après le théorème de la limite monotone.`

    let texte3 =
      'On pose $V_n=u_n-125$ pour tout entier $n$. Montrer que $(V_n)$ est géométrique et donner sa raison.'
    if (this.interactif) texte3 += ajouteChampTexteMathLive(this, 3) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 0.84 } })
    const correction3 = `$V_{n+1}=u_{n+1}-125=0{,}84\\,u_n+20-125=0{,}84\\,u_n-105=0{,}84\\,(u_n-125)+0{,}84\\times 125-105=0{,}84\\,V_n+105-105=0{,}84\\,V_n$ (car $0{,}84\\times 125=105$)${sp()}: $(V_n)$ est donc géométrique de raison $${miseEnEvidence('0{,}84')}$.`

    let texte4 =
      `En déduire que, pour tout entier $n$, $u_n=25\\times 0{,}84^n+125$. Quel est le premier terme $V_0$ de la suite $(V_n)$${sp()}?`
    if (this.interactif) texte4 += ajouteChampTexteMathLive(this, 4) + '<br>'
    handleAnswers(this, 4, { reponse: { value: 25 } })
    const correction4 = `$V_0=u_0-125=150-125=25$, donc $V_n=25\\times 0{,}84^n$ (suite géométrique), d'où $${miseEnEvidence('u_n=25\\times 0{,}84^n+125')}$.`

    let texte5 =
      'Déterminer la limite de $(u_n)$ quand $n$ tend vers $+\\infty$.'
    if (this.interactif) texte5 += ajouteChampTexteMathLive(this, 5) + '<br>'
    handleAnswers(this, 5, { reponse: { value: 125 } })
    const correction5 = `Comme $0<0{,}84<1$, on a $0{,}84^n\\to 0$ quand $n\\to +\\infty$, donc $u_n=25\\times 0{,}84^n+125\\to ${miseEnEvidence('125')}$.`

    const texteQ6 =
      `Les mesures d'inclusivité de l'école d'ingénieurs ont-elles été efficaces${sp()}?`
    this.autoCorrection[6] = {
      enonce: texteQ6,
      options: { ordered: true, radio: true },
      propositions: [
        {
          texte:
            `Totalement${sp()}: le nombre d'étudiantes a fini par augmenter au-delà de $150$`,
          statut: false,
        },
        {
          texte:
            `Partiellement${sp()}: elles stabilisent le nombre d'étudiantes à $125$ au lieu de le laisser tendre vers $0$, mais n'inversent pas la baisse initiale`,
          statut: true,
        },
        {
          texte:
            `Pas du tout${sp()}: le nombre d'étudiantes continue de diminuer indéfiniment`,
          statut: false,
        },
      ],
    }
    const monQcm6 = propositionsQcm(this, 6)
    let texte6 = texteQ6
    if (!context.isAmc) texte6 += monQcm6.texte
    const correction6 =
      `Sans les $20$ inscriptions annuelles, la suite serait $150\\times 0{,}84^n$, qui tend vers $0$ (disparition progressive des étudiantes). Grâce aux mesures d'inclusivité, le nombre d'étudiantes se stabilise à $125$ au lieu de tendre vers $0$${sp()}: les mesures sont donc efficaces pour stopper le déclin, mais insuffisantes pour inverser la baisse initiale (de $150$ à $125$) ou pour revenir à la parité.`

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

    listeQuestionsToContenu(this)
  }
}
