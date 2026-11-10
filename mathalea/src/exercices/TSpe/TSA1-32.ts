import { choice } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleurEtGras,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Étudier une évolution de population avec une suite arithmético-géométrique'
export const dateDePublication = '05/08/2026'

export const uuid = '00f79'
export const refs = {
  'fr-fr': ['TSA1-32', 'TCA1-22'],
  'fr-ch': [],
}

type Configuration = {
  q: number
  equilibre: number
  populationsInitiales: number[]
}

const configurations: Configuration[] = [
  { q: 0.8, equilibre: 6, populationsInitiales: [4, 5, 7, 8] },
  { q: 0.9, equilibre: 8, populationsInitiales: [5, 6, 10, 11] },
  { q: 0.75, equilibre: 8, populationsInitiales: [5, 6, 10, 12] },
  { q: 0.8, equilibre: 10, populationsInitiales: [6, 8, 12, 14] },
]

function termeSuite(u0: number, q: number, equilibre: number, n: number) {
  return equilibre + (u0 - equilibre) * q ** n
}

/**
 * Étude d'une population modélisée par une suite arithmético-géométrique.
 * @author Stéphane Guyon
 */
export default class EvolutionPopulation extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const anneeInitiale = choice([2022, 2023, 2024])
    const configuration = choice(configurations)
    const { q, equilibre } = configuration
    const u0 = choice(configuration.populationsInitiales)
    const tauxDepart = Math.round((1 - q) * 100)
    const apport = (1 - q) * equilibre
    const apportHabitants = Math.round(1000 * apport)
    const anneeProche = anneeInitiale + 2
    const rangLointain = 12
    const anneeLointaine = anneeInitiale + rangLointain
    const v0 = u0 - equilibre
    const u1 = termeSuite(u0, q, equilibre, 1)
    const u2 = termeSuite(u0, q, equilibre, 2)
    const uLointain = termeSuite(u0, q, equilibre, rangLointain)
    const habitantsLointains = Math.round(1000 * uLointain)
    const qTex = texNombre(q, 2)
    const apportTex = texNombre(apport, 2)

    let texte = `En ${anneeInitiale}, une ville compte $${texNombre(1000 * u0, 0)}$ habitants. La mairie prévoit que, chaque année :<br>`
    texte += `$\\bullet$ $${tauxDepart}\\,\\%$ des habitants meurent ou quittent la ville ;<br>`
    texte += `$\\bullet$ $${texNombre(apportHabitants, 0)}$ personnes naissent ou s’installent dans la ville.<br><br>`
    texte += `${texteEnCouleurEtGras('Partie 1', 'black')}<br>`
    texte += `On note $u_n$ le nombre d’habitants, exprimé en milliers, l’année $${anneeInitiale}+n$.<br><br>`
    texte += `1. Expliquer pourquoi $u_0=${u0}$.<br><br>`
    texte += `2. Montrer que, pour tout entier naturel $n$, $u_{n+1}=${qTex}u_n+${apportTex}$.<br><br>`
    texte += `3. Calculer le nombre d’habitants de la ville en ${anneeProche}.<br><br>`
    texte += `${texteEnCouleurEtGras('Partie 2', 'black')}<br>`
    texte += `On pose, pour tout entier naturel $n$, $v_n=u_n-${equilibre}$.<br><br>`
    texte += `1. Démontrer que $(v_n)$ est une suite géométrique dont on précisera le premier terme et la raison.<br><br>`
    texte += `2. Exprimer $v_n$, puis $u_n$, en fonction de $n$.<br><br>`
    texte += `3. Combien y aura-t-il d’habitants dans la ville en ${anneeLointaine} ? Arrondir au nombre entier d’habitants.<br><br>`
    texte += `4. Déterminer la limite de la suite $(u_n)$ lorsque $n$ tend vers $+\\infty$, puis interpréter le résultat dans le contexte de l’exercice, en admettant que ce modèle soit réaliste sur une longue période.`

    let correction = `${texteEnCouleurEtGras('Partie 1', 'black')}<br><br>`
    correction += `1. La population est exprimée en milliers. En ${anneeInitiale}, la ville compte $${texNombre(1000 * u0, 0)}$ habitants, soit $${u0}$ milliers d’habitants. Ainsi, $u_0=${miseEnEvidence(u0)}$.<br><br>`
    correction += `2. Chaque année, la ville conserve $${100 - tauxDepart}\\,\\%$ de sa population, ce qui revient à multiplier $u_n$ par $${qTex}$. De plus, elle gagne $${texNombre(apportHabitants, 0)}$ habitants, soit $${apportTex}$ ${apport > 1 ? 'milliers' : 'millier'} d’habitants.<br>`
    correction += `Ainsi, pour tout entier naturel $n$, $u_{n+1}=${miseEnEvidence(`${qTex}u_n+${apportTex}`)}$.<br><br>`
    correction += `3. L’année ${anneeProche} correspond au rang $n=2$.<br>`
    correction += `$\\begin{aligned}
u_1&=${qTex}\\times ${u0}+${apportTex}=${texNombre(u1, 3)}\\\\
u_2&=${qTex}\\times ${texNombre(u1, 3)}+${apportTex}=${texNombre(u2, 3)}.
\\end{aligned}$<br>`
    correction += `En ${anneeProche}, la ville comptera donc $${miseEnEvidence(texNombre(1000 * u2, 0))}$ habitants.<br><br>`

    correction += `${texteEnCouleurEtGras('Partie 2', 'black')}<br><br>`
    correction += `1. Pour tout entier naturel $n$ :<br>`
    correction += `$\\begin{aligned}
v_{n+1}&=u_{n+1}-${equilibre}\\\\
&=${qTex}u_n+${apportTex}-${equilibre}\\\\
&=${qTex}u_n-${texNombre(q * equilibre, 3)}\\\\
&=${qTex}\\left(u_n-${equilibre}\\right)\\\\
&=${qTex}v_n.
\\end{aligned}$<br>`
    correction += `La suite $(v_n)$ est donc géométrique de raison $${qTex}$ et de premier terme $v_0=u_0-${equilibre}=${v0}$.<br><br>`
    correction += `2. Pour tout entier naturel $n$ :<br>`
    correction += `On sait qu’une suite géométrique de premier terme $v_0$ et de raison $q$ vérifie, pour tout entier naturel $n$ :<br>
$v_n=v_0\\times q^n$.<br>
Ici, $v_0=${v0}$ et $q=${qTex}$. On obtient donc :<br>
$v_n=${v0}\\times ${qTex}^n$.<br>`
    correction += `Comme $u_n=v_n+${equilibre}$, on obtient :<br>`
    correction += `$u_n=${miseEnEvidence(`${equilibre}${ecritureAlgebrique(v0)}\\times ${qTex}^n`)}$.<br><br>`
    correction += `3. L’année ${anneeLointaine} correspond au rang $n=${rangLointain}$.<br>`
    correction += `$\\begin{aligned}
u_{${rangLointain}}&=${equilibre}${ecritureAlgebrique(v0)}\\times ${qTex}^{${rangLointain}}\\\\
&\\approx ${texNombre(uLointain, 6)}.
\\end{aligned}$<br>`
    correction += `Cela représente environ $${miseEnEvidence(texNombre(habitantsLointains, 0))}$ habitants.<br><br>`
    correction += `4. Comme $${qTex}\\in]0\\,;\\,1[$, on sait que $\\displaystyle \\lim_{n\\to+\\infty}${qTex}^n=0$.<br>`
    correction += `Par produit, $\\displaystyle \\lim_{n\\to+\\infty}${v0}\\times ${qTex}^n=0$.<br>`
    correction += `Or, $u_n=${equilibre}${ecritureAlgebrique(v0)}\\times ${qTex}^n$. Par somme :<br>
$\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence(equilibre)}$.<br>
La population de la ville tend ainsi vers $${miseEnEvidence(texNombre(1000 * equilibre, 0))}$ habitants.`

    this.listeQuestions[0] = texte
    this.listeCorrections[0] = correction
    listeQuestionsToContenu(this)
  }
}
