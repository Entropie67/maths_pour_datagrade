import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Étudier une suite arithmético-géométrique dans un contexte'
export const dateDePublication = '10/09/2026'

export const uuid = 'ae586'
export const refs = {
  'fr-fr': ['TSA1-45'],
  'fr-ch': [],
}

type Scenario = {
  debut: string
  evolution: (tauxDepart: number, apport: number) => string
  quantite: string
  unite: string
  q: number
  equilibre: number
  valeursInitiales: number[]
  seuils: number[]
}

const scenarios: Scenario[] = [
  {
    debut: 'la chaîne vidéo d’un professeur de mathématiques compte',
    evolution: (tauxDepart, apport) =>
      `Chaque année, la chaîne perd $${tauxDepart}\\,\\%$ de son audience, tandis que $${texNombre(apport, 0)}$ nouvelles personnes s’y abonnent.`,
    quantite: 'nombre d’abonnés à la chaîne',
    unite: 'abonnés',
    q: 0.9,
    equilibre: 2500,
    valeursInitiales: [1000, 1200, 1500],
    seuils: [2100, 2200, 2300],
  },
  {
    debut: 'une médiathèque compte',
    evolution: (tauxDepart, apport) =>
      `Chaque année, $${tauxDepart}\\,\\%$ des adhérents ne renouvellent pas leur adhésion et $${texNombre(apport, 0)}$ nouvelles personnes adhèrent.`,
    quantite: 'nombre d’adhérents à la médiathèque',
    unite: 'adhérents',
    q: 0.8,
    equilibre: 5000,
    valeursInitiales: [2000, 2500, 3000],
    seuils: [4200, 4400, 4600],
  },
  {
    debut: 'une réserve naturelle compte',
    evolution: (tauxDepart, apport) =>
      `Chaque année, la population diminue de $${tauxDepart}\\,\\%$, puis $${texNombre(apport, 0)}$ tortues naissent ou sont réintroduites dans la réserve.`,
    quantite: 'nombre de tortues dans la réserve',
    unite: 'tortues',
    q: 0.75,
    equilibre: 4000,
    valeursInitiales: [1600, 2000, 2400],
    seuils: [3400, 3600, 3800],
  },
  {
    debut: 'un service numérique compte',
    evolution: (tauxDepart, apport) =>
      `Chaque année, $${tauxDepart}\\,\\%$ des clients résilient leur abonnement et $${texNombre(apport, 0)}$ nouveaux clients souscrivent.`,
    quantite: 'nombre de clients du service',
    unite: 'clients',
    q: 0.85,
    equilibre: 6000,
    valeursInitiales: [2400, 3000, 3600],
    seuils: [5000, 5300, 5600],
  },
]

function termeSuite(u0: number, q: number, equilibre: number, n: number) {
  return equilibre + (u0 - equilibre) * q ** n
}

/** Adaptation aléatoire d'un exercice sur une suite arithmético-géométrique. */
export default class SuiteArithmeticoGeometriqueEnContexte extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const scenario = choice(scenarios)
    const anneeInitiale = choice([2021, 2022, 2023, 2024])
    const u0 = choice(scenario.valeursInitiales)
    const seuil = choice(scenario.seuils)
    const { q, equilibre } = scenario
    const tauxDepart = Math.round((1 - q) * 100)
    const apport = Math.round((1 - q) * equilibre)
    const u1 = q * u0 + apport
    const ecartInitial = equilibre - u0
    const qTex = texNombre(q, 2)

    let rangSeuil = 0
    while (termeSuite(u0, q, equilibre, rangSeuil) <= seuil) rangSeuil++
    const termeAvantSeuil = termeSuite(u0, q, equilibre, rangSeuil - 1)
    const termeAuSeuil = termeSuite(u0, q, equilibre, rangSeuil)
    const anneeSeuil = anneeInitiale + rangSeuil

    let texte = `En ${anneeInitiale}, ${scenario.debut} $${texNombre(u0, 0)}$ ${scenario.unite}. ${scenario.evolution(tauxDepart, apport)}<br><br>`
    texte += `Pour tout entier naturel $n$, on note $u_n$ le ${scenario.quantite} durant l’année $${anneeInitiale}+n$. Ainsi, $u_0=${texNombre(u0, 0)}$ et, pour tout entier naturel $n$, $u_{n+1}=${qTex}u_n+${texNombre(apport, 0)}$.<br><br>`
    texte += `1. Calculer $u_1$.<br><br>`
    texte += `2. Démontrer par récurrence que, pour tout entier naturel $n$, $u_n\\leqslant u_{n+1}\\leqslant ${texNombre(equilibre, 0)}$.<br><br>`
    texte += `3. Pour tout entier naturel $n$, on pose $v_n=u_n-${texNombre(equilibre, 0)}$.<br>`
    texte += `a. Démontrer que la suite $(v_n)$ est une suite géométrique dont on précisera la raison et le premier terme.<br>`
    texte += `b. En déduire une expression de $v_n$ en fonction de $n$.<br>`
    texte += `c. Déterminer une expression de $u_n$ en fonction de $n$.<br><br>`
    texte += `4. À l’aide de la calculatrice, déterminer à partir de quelle année le ${scenario.quantite} dépassera $${texNombre(seuil, 0)}$.`

    let correction = `1. On calcule :<br>`
    correction += `$u_1=${qTex}\\times ${texNombre(u0, 0)}+${texNombre(apport, 0)}=${texNombre(u1, 0)}$<br>`
    correction += `Ainsi, $${miseEnEvidence(`u_1=${texNombre(u1, 0)}`)}$.<br><br>`

    correction += `2. Pour tout entier naturel $n$, notons $\\mathcal P_n$ la propriété : «${sp()}$u_n\\leqslant u_{n+1}\\leqslant ${texNombre(equilibre, 0)}$${sp()}».<br><br>`
    correction += `${texteEnCouleurEtGras('Initialisation :', 'black')}<br><br>`
    correction += `On a $u_0=${texNombre(u0, 0)}$ et $u_1=${texNombre(u1, 0)}$. Ainsi, $u_0\\leqslant u_1\\leqslant ${texNombre(equilibre, 0)}$ : la propriété $\\mathcal P_0$ est vraie.<br><br>`
    correction += `${texteEnCouleurEtGras('Hérédité :', 'black')}<br><br>`
    correction += `Soit $n$ un entier naturel. Supposons que $\\mathcal P_n$ est vraie, c’est-à-dire que $u_n\\leqslant u_{n+1}\\leqslant ${texNombre(equilibre, 0)}$.<br><br>`
    correction += `La propriété $\\mathcal P_{n+1}$ s’écrit : $u_{n+1}\\leqslant u_{n+2}\\leqslant ${texNombre(equilibre, 0)}$. Montrons que $\\mathcal P_{n+1}$ est vraie.<br><br>`
    correction += `On a :<br><br>`
    correction += `$\\begin{aligned}
u_n&\\leqslant u_{n+1}\\leqslant ${texNombre(equilibre, 0)}&&\\text{par hypothèse de récurrence}\\\\
${qTex}u_n&\\leqslant ${qTex}u_{n+1}\\leqslant ${qTex}\\times ${texNombre(equilibre, 0)}&&\\text{car }${qTex}>0\\\\
${qTex}u_n+${texNombre(apport, 0)}&\\leqslant ${qTex}u_{n+1}+${texNombre(apport, 0)}\\leqslant ${qTex}\\times ${texNombre(equilibre, 0)}+${texNombre(apport, 0)}\\\\
u_{n+1}&\\leqslant u_{n+2}\\leqslant ${texNombre(equilibre, 0)}
\\end{aligned}$<br><br>`
    correction += `Ainsi, la propriété $\\mathcal P_{n+1}$ est vraie.<br><br>`
    correction += `${texteEnCouleurEtGras('Conclusion :', 'black')}<br><br>`
    correction += `La propriété est vraie au rang $0$ et elle est héréditaire. Par récurrence, pour tout entier naturel $n$, $${miseEnEvidence(`u_n\\leqslant u_{n+1}\\leqslant ${texNombre(equilibre, 0)}`)}$.<br><br>`

    correction += `3. a. Pour tout entier naturel $n$ :<br>`
    correction += `$\\begin{aligned}v_{n+1}&=u_{n+1}-${texNombre(equilibre, 0)}\\\\&=${qTex}u_n+${texNombre(apport, 0)}-${texNombre(equilibre, 0)}\\\\&=${qTex}\\left(u_n-${texNombre(equilibre, 0)}\\right)\\\\&=${qTex}v_n\\end{aligned}$<br>`
    correction += `De plus, $v_0=u_0-${texNombre(equilibre, 0)}=${texNombre(-ecartInitial, 0)}$. Ainsi, $${miseEnEvidence('(v_n)')}$ ${texteEnCouleurEtGras('est géométrique de raison')} $${miseEnEvidence(qTex)}$ ${texteEnCouleurEtGras('et de premier terme')} $${miseEnEvidence(`v_0=${texNombre(-ecartInitial, 0)}`)}$.<br><br>`
    correction += `b. D’après le cours, si une suite $(v_n)$ est géométrique de raison $q$ et de premier terme $v_0$, alors, pour tout entier naturel $n$, $v_n=v_0\\times q^n$.<br>`
    correction += `Ici, $v_0=${texNombre(-ecartInitial, 0)}$ et $q=${qTex}$. Ainsi, pour tout entier naturel $n$, $${miseEnEvidence(`v_n=${texNombre(-ecartInitial, 0)}\\times (${qTex})^n`)}$.<br><br>`
    correction += `c. Pour tout entier naturel $n$, on a $u_n=v_n+${texNombre(equilibre, 0)}$. On obtient donc $${miseEnEvidence(`u_n=${texNombre(equilibre, 0)}-${texNombre(ecartInitial, 0)}\\times (${qTex})^n`)}$.<br><br>`

    correction += `4. À l’aide de la calculatrice, on obtient :<br>`
    correction += `$u_{${rangSeuil - 1}}\\approx ${texNombre(termeAvantSeuil, 1)}\\leqslant ${texNombre(seuil, 0)}$ et $u_{${rangSeuil}}\\approx ${texNombre(termeAuSeuil, 1)}>${texNombre(seuil, 0)}$<br>`
    correction += `Le plus petit rang qui convient est donc $n=${rangSeuil}$. L’année correspondante est $${anneeInitiale}+${rangSeuil}=${anneeSeuil}$.<br>`
    correction += `Le ${scenario.quantite} dépassera $${texNombre(seuil, 0)}$ à partir de $${miseEnEvidence(`${anneeSeuil}`)}$.`

    this.listeQuestions[0] = texte
    this.listeCorrections[0] = correction
    listeQuestionsToContenu(this)
  }
}
