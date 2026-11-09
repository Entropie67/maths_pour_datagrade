import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Étudier l’évolution d’une population à l’aide d’une suite'
export const dateDePublication = '22/09/2026'

export const uuid = '432d0'
export const refs = {
  'fr-fr': ['TSA1-47'],
  'fr-ch': [],
}

type Configuration = {
  q: number
  borne: number
  termesInitiauxReponseFavorable: number[]
  termesInitiauxReponseDefavorable: number[]
}

const configurations: Configuration[] = [
  {
    q: 0.95,
    borne: 4000,
    termesInitiauxReponseFavorable: [10000, 12000, 14000],
    termesInitiauxReponseDefavorable: [6000, 7000, 8000],
  },
  {
    q: 0.9,
    borne: 5000,
    termesInitiauxReponseFavorable: [12000, 14000, 16000],
    termesInitiauxReponseDefavorable: [7000, 8000, 10000],
  },
  {
    q: 0.8,
    borne: 6000,
    termesInitiauxReponseFavorable: [14000, 16000, 18000],
    termesInitiauxReponseDefavorable: [9000, 10000, 12000],
  },
  {
    q: 0.75,
    borne: 8000,
    termesInitiauxReponseFavorable: [18000, 20000, 22000],
    termesInitiauxReponseDefavorable: [12000, 14000, 16000],
  },
]

const especes = ['éléphants', 'gorilles', 'lynx', 'tortues marines']

/** Adaptation aléatoire d'un exercice sur l'évolution d'une population. */
export default class EvolutionPopulationSuite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const {
      q,
      borne,
      termesInitiauxReponseFavorable,
      termesInitiauxReponseDefavorable,
    } = choice(configurations)
    const reponseFavorable = choice([true, false])
    const termesInitiaux = reponseFavorable
      ? termesInitiauxReponseFavorable
      : termesInitiauxReponseDefavorable
    const u0 = choice(termesInitiaux)
    const espece = choice(especes)
    const anneeInitiale = 2024
    const tauxBaisse = Math.round((1 - q) * 100)
    const apport = Math.round((1 - q) * borne)
    const u1 = q * u0 + apport
    const u2 = q * u1 + apport
    const v0 = u0 - borne
    const qTex = texNombre(q, 2)

    const sousQuestionsDeux = createList({
      style: 'alpha',
      items: [
        `Démontrer par récurrence que, pour tout entier naturel $n$, $u_n>${texNombre(borne, 0)}$.`,
        `Étudier les variations de la suite $(u_n)$, puis justifier qu’elle converge.`,
      ],
    })
    const sousQuestionsTrois = createList({
      style: 'alpha',
      items: [
        `Calculer $v_0$.`,
        `Démontrer que la suite $(v_n)$ est géométrique de raison $${qTex}$.`,
        `En déduire que, pour tout entier naturel $n$ :
        \\[u_n=${texNombre(borne, 0)}+${texNombre(v0, 0)}\\times ${qTex}^n\\]`,
        `Déterminer la limite de la suite $(u_n)$. Justifier la réponse.`,
      ],
    })
    const questions = createList({
      style: 'nombres',
      items: [
        `Calculer $u_1$ et vérifier que $u_2=${texNombre(u2, 0)}$.`,
        sousQuestionsDeux,
        `Pour tout entier naturel $n$, on définit la suite $(v_n)$ par $v_n=u_n-${texNombre(borne, 0)}$.<br><br>${sousQuestionsTrois}`,
        `En ${anneeInitiale}, une population de ${espece} comptait $${texNombre(u0, 0)}$ individus. À partir de l’année ${anneeInitiale + 1}, cette population baisse de $${tauxBaisse}\\,\\%$ au début de chaque année. Afin de ralentir cette baisse, $${texNombre(apport, 0)}$ individus sont réintroduits à la fin de chaque année.<br><br>
        Une responsable d’une association soutenant cette stratégie affirme : «${sp()}L’espèce ne devrait pas s’éteindre, mais nous n’empêcherons malheureusement pas la disparition de plus de la moitié de la population initiale.${sp()}»<br><br>
        Déterminer si cette affirmation est cohérente avec le modèle. Justifier la réponse.`,
      ],
    })

    const correctionDeux = createList({
      style: 'alpha',
      items: [
        `Pour tout entier naturel $n$, on note $\\mathcal P_n$ la propriété : «${sp()}$u_n>${texNombre(borne, 0)}$${sp()}».<br><br>
        ${texteEnCouleurEtGras('Initialisation :', 'black')}<br><br>
        On a $u_0=${texNombre(u0, 0)}>${texNombre(borne, 0)}$. La propriété $\\mathcal P_0$ est donc vraie.<br><br>
        ${texteEnCouleurEtGras('Hérédité :', 'black')}<br><br>
        Soit $n$ un entier naturel. Supposons que $\\mathcal P_n$ est vraie, c’est-à-dire que $u_n>${texNombre(borne, 0)}$. Montrons que $\\mathcal P_{n+1}$ est vraie.<br><br>
        Comme $${qTex}>0$, on a :<br><br>
        $\\begin{aligned}
        u_n&>${texNombre(borne, 0)}\\\\
        ${qTex}u_n&>${qTex}\\times ${texNombre(borne, 0)}\\\\
        ${qTex}u_n+${texNombre(apport, 0)}&>${qTex}\\times ${texNombre(borne, 0)}+${texNombre(apport, 0)}\\\\
        u_{n+1}&>${texNombre(borne, 0)}
        \\end{aligned}$<br><br>
        Ainsi, la propriété $\\mathcal P_{n+1}$ est vraie.<br><br>
        ${texteEnCouleurEtGras('Conclusion :', 'black')}<br><br>
        La propriété est vraie au rang $0$ et elle est héréditaire. Par récurrence, pour tout entier naturel $n$, $${miseEnEvidence(`u_n>${texNombre(borne, 0)}`)}$.`,
        `Soit $n\\in\\mathbb N$. On calcule $u_{n+1}-u_n$ :<br><br>
        $\\begin{aligned}
        u_{n+1}-u_n
        &=${qTex}u_n+${texNombre(apport, 0)}-u_n\\\\
        &=-${texNombre(1 - q, 2)}u_n+${texNombre(apport, 0)}\\\\
        &=${texNombre(1 - q, 2)}\\left(${texNombre(borne, 0)}-u_n\\right)
        \\end{aligned}$<br><br>
        Or, pour tout entier naturel $n$, $u_n>${texNombre(borne, 0)}$, donc $${texNombre(borne, 0)}-u_n\\leqslant 0$. De plus, $${texNombre(1 - q, 2)}>0$. Ainsi, $u_{n+1}-u_n\\leqslant 0$.<br><br>
        La suite $(u_n)$ est donc ${texteEnCouleurEtGras('décroissante', 'red')}. Comme elle est minorée par $${texNombre(borne, 0)}$, le théorème de convergence monotone permet d’affirmer qu’elle est ${texteEnCouleurEtGras('convergente', 'red')}.`,
      ],
    })

    const correctionTrois = createList({
      style: 'alpha',
      items: [
        `On a $v_0=u_0-${texNombre(borne, 0)}=${texNombre(u0, 0)}-${texNombre(borne, 0)}=${miseEnEvidence(texNombre(v0, 0))}$.`,
        `Soit $n$ un entier naturel.<br><br>
        $\\begin{aligned}
        v_{n+1}&=u_{n+1}-${texNombre(borne, 0)}\\\\
        &=${qTex}u_n+${texNombre(apport, 0)}-${texNombre(borne, 0)}\\\\
        &=${qTex}u_n-${texNombre(q * borne, 0)}\\\\
        &=${qTex}u_n-${qTex}\\times ${texNombre(borne, 0)}\\\\
        &=${qTex}\\left(u_n-${texNombre(borne, 0)}\\right)\\\\
        &=${qTex}v_n
        \\end{aligned}$<br><br>
        Ainsi, la suite $(v_n)$ est ${texteEnCouleurEtGras('géométrique', 'red')} de raison $${qTex}$.`,
        `La suite $(v_n)$ est géométrique de raison $${qTex}$ et de premier terme $v_0=${texNombre(v0, 0)}$. Donc, pour tout entier naturel $n$, $v_n=${texNombre(v0, 0)}\\times ${qTex}^n$.<br><br>
        Or, $u_n=v_n+${texNombre(borne, 0)}$. Ainsi, pour tout entier naturel $n$, $${miseEnEvidence(`u_n=${texNombre(borne, 0)}+${texNombre(v0, 0)}\\times ${qTex}^n`)}$.`,
        `Comme $0<${qTex}<1$, $\\displaystyle\\lim_{n\\to+\\infty}${qTex}^n=0$. Par somme de limites, $\\displaystyle\\lim_{n\\to+\\infty}u_n=${miseEnEvidence(texNombre(borne, 0))}$.`,
      ],
    })

    const corrections = createList({
      style: 'nombres',
      items: [
        `On calcule :<br><br>
        $\\begin{aligned}
        u_1&=${qTex}\\times ${texNombre(u0, 0)}+${texNombre(apport, 0)}=${texNombre(u1, 0)}\\\\
        u_2&=${qTex}\\times ${texNombre(u1, 0)}+${texNombre(apport, 0)}=${texNombre(u2, 0)}
        \\end{aligned}$<br><br>
        Ainsi, $${miseEnEvidence(`u_1=${texNombre(u1, 0)}`)}$ et $${miseEnEvidence(`u_2=${texNombre(u2, 0)}`)}$.`,
        correctionDeux,
        correctionTrois,
        reponseFavorable
          ? `Pour tout entier naturel $n$, on a $u_n>${texNombre(borne, 0)}>0$ : selon ce modèle, la population ne s’éteint donc pas.<br><br>
          De plus, la population se rapproche de $${texNombre(borne, 0)}$ individus. Or, la moitié de la population initiale est égale à $\\dfrac{${texNombre(u0, 0)}}{2}=${texNombre(u0 / 2, 0)}$ et $${texNombre(borne, 0)}<${texNombre(u0 / 2, 0)}$. À long terme, la population devient donc inférieure à la moitié de sa valeur initiale.<br><br>
          L’affirmation de la responsable est donc ${texteEnCouleurEtGras('cohérente avec le modèle', 'red')}.`
          : `Pour tout entier naturel $n$, on a $u_n>${texNombre(borne, 0)}>0$ : selon ce modèle, la population ne s’éteint donc pas.<br><br>
          De plus, la population se rapproche de $${texNombre(borne, 0)}$ individus. Or, la moitié de la population initiale est égale à $\\dfrac{${texNombre(u0, 0)}}{2}=${texNombre(u0 / 2, 0)}$ et $${texNombre(borne, 0)}\\geqslant ${texNombre(u0 / 2, 0)}$. La population reste donc supérieure à la moitié de sa valeur initiale.<br><br>
          La seconde partie de l’affirmation est fausse : l’affirmation de la responsable est donc ${texteEnCouleurEtGras('incohérente avec le modèle', 'red')}.`,
      ],
    })

    this.listeQuestions[0] = `On considère la suite $(u_n)$ définie par $u_0=${texNombre(u0, 0)}$ et, pour tout entier naturel $n$ :
    \\[u_{n+1}=${qTex}u_n+${texNombre(apport, 0)}\\]
    ${questions}`
    this.listeCorrections[0] = corrections
    listeQuestionsToContenu(this)
  }
}
