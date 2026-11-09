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

export const titre = 'Étudier une suite arithmético-géométrique'
export const dateDePublication = '10/09/2026'

export const uuid = '9cae9'
export const refs = {
  'fr-fr': ['TSA1-46'],
  'fr-ch': [],
}

type Configuration = {
  q: number
  borne: number
  termesInitiaux: number[]
  seuils: number[]
}

const configurations: Configuration[] = [
  {
    q: 0.95,
    borne: 4000,
    termesInitiaux: [8000, 10000, 12000],
    seuils: [6000, 7000],
  },
  {
    q: 0.9,
    borne: 5000,
    termesInitiaux: [8000, 10000, 12000],
    seuils: [6500, 7000, 7500],
  },
  {
    q: 0.8,
    borne: 6000,
    termesInitiaux: [9000, 11000, 14000],
    seuils: [7500, 8000, 8500],
  },
  {
    q: 0.75,
    borne: 8000,
    termesInitiaux: [12000, 14000, 16000],
    seuils: [9500, 10000, 11000],
  },
]

function termeSuite(u0: number, q: number, borne: number, n: number) {
  return borne + (u0 - borne) * q ** n
}

/** Adaptation aléatoire d'un exercice sur une suite arithmético-géométrique décroissante. */
export default class SuiteArithmeticoGeometriqueDecroissante extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const configuration = choice(configurations)
    const { q, borne } = configuration
    const u0 = choice(configuration.termesInitiaux)
    const seuil = choice(configuration.seuils)
    const termeConstant = Math.round((1 - q) * borne)
    const qTex = texNombre(q, 2)
    const u1 = q * u0 + termeConstant
    const u2 = q * u1 + termeConstant
    const v0 = u0 - borne

    let rangSeuil = 0
    while (termeSuite(u0, q, borne, rangSeuil) >= seuil) rangSeuil++
    const termeAvantSeuil = termeSuite(u0, q, borne, rangSeuil - 1)
    const termeAuSeuil = termeSuite(u0, q, borne, rangSeuil)

    const sousQuestionsDeux = createList({
      style: 'alpha',
      items: [
        `Démontrer par récurrence que, pour tout entier naturel $n$ :
        \\[u_n>u_{n+1}>${texNombre(borne, 0)}\\]`,
        `En déduire les variations de la suite $(u_n)$.`,
      ],
    })
    const sousQuestionsTrois = createList({
      style: 'alpha',
      items: [
        `Calculer $v_0$.`,
        `Démontrer que la suite $(v_n)$ est géométrique de raison $${qTex}$.`,
        `En déduire une expression de $u_n$ en fonction de $n$.`,
        `À l’aide de la calculatrice, déterminer le plus petit entier $k$ tel que $u_k<${texNombre(seuil, 0)}$.`,
      ],
    })
    const questions = createList({
      style: 'nombres',
      items: [
        `Calculer $u_1$ et $u_2$.`,
        sousQuestionsDeux,
        `Pour tout entier naturel $n$, on définit la suite $(v_n)$ par $v_n=u_n-${texNombre(borne, 0)}$.<br><br>${sousQuestionsTrois}`,
      ],
    })

    const correctionDeuxA = `Pour tout entier naturel $n$, on note $\\mathcal P_n$ la propriété : «${sp()}$u_n>u_{n+1}>${texNombre(borne, 0)}$${sp()}».<br><br>
${texteEnCouleurEtGras('Initialisation :', 'black')}<br><br>
On a $u_0=${texNombre(u0, 0)}$ et $u_1=${texNombre(u1, 0)}$. Ainsi, $u_0>u_1>${texNombre(borne, 0)}$ : la propriété $\\mathcal P_0$ est vraie.<br><br>
${texteEnCouleurEtGras('Hérédité :', 'black')}<br><br>
Soit $n$ un entier naturel. Supposons que $\\mathcal P_n$ est vraie, c’est-à-dire que $u_n>u_{n+1}>${texNombre(borne, 0)}$.<br><br>
La propriété $\\mathcal P_{n+1}$ s’écrit : $u_{n+1}>u_{n+2}>${texNombre(borne, 0)}$. Montrons que $\\mathcal P_{n+1}$ est vraie.<br><br>
On a :<br><br>
$\\begin{aligned}
u_n&>u_{n+1}>${texNombre(borne, 0)}&&\\text{par hypothèse de récurrence}\\\\
${qTex}u_n&>${qTex}u_{n+1}>${qTex}\\times ${texNombre(borne, 0)}&&\\text{car }${qTex}>0\\\\
${qTex}u_n+${texNombre(termeConstant, 0)}&>${qTex}u_{n+1}+${texNombre(termeConstant, 0)}>${qTex}\\times ${texNombre(borne, 0)}+${texNombre(termeConstant, 0)}\\\\
u_{n+1}&>u_{n+2}>${texNombre(borne, 0)}
\\end{aligned}$<br><br>
Ainsi, la propriété $\\mathcal P_{n+1}$ est vraie.<br><br>
${texteEnCouleurEtGras('Conclusion :', 'black')}<br><br>
La propriété est vraie au rang $0$ et elle est héréditaire. Par récurrence, pour tout entier naturel $n$, $${miseEnEvidence(`u_n>u_{n+1}>${texNombre(borne, 0)}`)}$.`

    const correctionDeux = createList({
      style: 'alpha',
      items: [
        correctionDeuxA,
        `On déduit de l’inégalité précédente que, pour tout entier naturel $n$, $u_n>u_{n+1}$. La suite $(u_n)$ est donc ${texteEnCouleurEtGras('strictement décroissante')}.`,
      ],
    })

    const correctionTrois = createList({
      style: 'alpha',
      items: [
        `On a $v_0=u_0-${texNombre(borne, 0)}=${texNombre(u0, 0)}-${texNombre(borne, 0)}=${miseEnEvidence(texNombre(v0, 0))}$.`,
        `Soit $n$ un entier naturel.<br><br>
        $\\begin{aligned}
        v_{n+1}&=u_{n+1}-${texNombre(borne, 0)}\\\\
        &=${qTex}u_n+${texNombre(termeConstant, 0)}-${texNombre(borne, 0)}\\\\
        &=${qTex}u_n-${texNombre(q * borne, 0)}\\\\
        &=${qTex}\\left(u_n-${texNombre(borne, 0)}\\right)\\\\
        &=${qTex}v_n
        \\end{aligned}$<br><br>
        Ainsi, la suite $(v_n)$ est ${texteEnCouleurEtGras('géométrique de raison')} $${miseEnEvidence(qTex)}$.`,
        `D’après le cours, si une suite $(v_n)$ est géométrique de raison $q$ et de premier terme $v_0$, alors, pour tout entier naturel $n$, $v_n=v_0\\times q^n$.<br><br>
        Ici, $v_0=${texNombre(v0, 0)}$ et $q=${qTex}$. Pour tout entier naturel $n$, on a donc $v_n=${texNombre(v0, 0)}\\times ${qTex}^n$.<br><br>
        Or, pour tout entier naturel $n$, $u_n=v_n+${texNombre(borne, 0)}$. Ainsi, $${miseEnEvidence(`u_n=${texNombre(borne, 0)}+${texNombre(v0, 0)}\\times ${qTex}^n`)}$.`,
        `À l’aide de la calculatrice, on obtient :<br><br>
        $u_{${rangSeuil - 1}}\\approx ${texNombre(termeAvantSeuil, 1)}\\geqslant ${texNombre(seuil, 0)}$ et $u_{${rangSeuil}}\\approx ${texNombre(termeAuSeuil, 1)}<${texNombre(seuil, 0)}$<br><br>
        Le plus petit entier $k$ tel que $u_k<${texNombre(seuil, 0)}$ est donc $${miseEnEvidence(`k=${rangSeuil}`)}$.`,
      ],
    })
    const corrections = createList({
      style: 'nombres',
      items: [
        `On calcule :<br><br>
        $\\begin{aligned}
        u_1&=${qTex}\\times ${texNombre(u0, 0)}+${texNombre(termeConstant, 0)}=${texNombre(u1, 0)}\\\\
        u_2&=${qTex}\\times ${texNombre(u1, 0)}+${texNombre(termeConstant, 0)}=${texNombre(u2, 0)}
        \\end{aligned}$<br><br>
        Ainsi, $${miseEnEvidence(`u_1=${texNombre(u1, 0)}`)}$ et $${miseEnEvidence(`u_2=${texNombre(u2, 0)}`)}$.`,
        correctionDeux,
        correctionTrois,
      ],
    })

    this.listeQuestions[0] = `On considère la suite $(u_n)$ définie par $u_0=${texNombre(u0, 0)}$ et, pour tout entier naturel $n$ :
    \\[u_{n+1}=${qTex}u_n+${texNombre(termeConstant, 0)}\\]
    ${questions}`
    this.listeCorrections[0] = corrections
    listeQuestionsToContenu(this)
  }
}
