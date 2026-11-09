import { bleuMathalea } from '../../lib/colors'
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { ecritureAlgebrique, ecritureParentheseSiMoins } from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = "Démontrer qu'un nombre divise un autre"
export const dateDePublication = '08/09/2026'
export const uuid = '6c83f'

export const refs = {
  'fr-fr': ['TEA1-35'],
  'fr-ch': [],
}
/**
 *
 * @author Arnaud Meistermann

*/

// Génère une instance aléatoire de l'exercice "p divise a^(2n) - b^n"
function genererDivisibilite() {
  const premiers = [7, 11, 13, 17, 19, 23]
  const p = choice(premiers)

  let a: number
  do {
    a = randint(4, 25)
  } while (a % p === 0)

  const r = (((a * a) % p) + p) % p // reste positif de a^2 mod p
  const k = randint(0, 4)
  let b = r + k * p
  if (b === a * a) b += p // évite le cas trivial b = a^2 exact
  if (b === 1) b += p // évite le cas trivial b = 1

  return { p, a, b, r }
}

const formulaireMethode: FormulaireComplexe = {
  champs: [
    {
      type: 'selection',
      nom: 'methode',
      label: 'Méthode de démonstration',
      options: [
        { valeur: 'recurrence', label: 'Par récurrence' },
        { valeur: 'congruence', label: 'Par congruence' },
      ],
      defaut: 'recurrence',
    },
  ],
}

export default class ExerciceDivisibiliteRecurrenceCongruence extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
    this.besoinFormulaireComplexe = formulaireMethode
    this.sup = serialiseFormulaireComplexe(
      formulaireMethode,
      valeursParDefaut(formulaireMethode),
    )
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const { p, a, b, r } = genererDivisibilite()
      const methode = lireFormulaireComplexe(
        formulaireMethode,
        this.sup,
      ).selection('methode')
      this.titre = 'Démontrer une divisibilité'
      const texte =
        methode === 'recurrence'
          ? `Démontrer par récurrence que $${p}$ divise $${a}^{2n}-${b}^n$ pour tout entier $n \\geqslant 1$.`
          : `Démontrer que $${p}$ divise $${a}^{2n}-${b}^n$ pour tout entier $n \\geqslant 1$.`

      let texteCorr = ''
      if (methode === 'recurrence') {
        texteCorr += `Pour tout entier $n \\geqslant 1$, notons $\\mathcal{P}(n)$ la propriété : «${sp()}$${p}$ divise $${a}^{2n}-${b}^n$${sp()}».<br><br>`
        texteCorr += `${texteEnCouleur('Initialisation.', bleuMathalea)}<br>`
        texteCorr += `Pour $n=1$, on a : $${a}^{2n}-${b}^n=${a}^{2\\times 1}-${b}^1=${a * a}-${b}=${ecritureParentheseSiMoins(a * a - b)}=${p}\\times ${ecritureParentheseSiMoins((a * a - b) / p)}$.<br>`
        texteCorr += `Donc $${p}$ divise $${a}^2-${b}$. Ainsi, $\\mathcal{P}(1)$ est vraie.<br><br>`
        texteCorr += `${texteEnCouleur('Hérédité.', bleuMathalea)}<br> Soit $n \\geqslant 1$. Supposons que $\\mathcal{P}(n)$ est vraie, c'est-à-dire que $${p}$ divise $${a}^{2n}-${b}^n$.<br>`
        texteCorr += `Démontrons que $\\mathcal{P}(n+1)$ est vraie c'est-à-dire que $${p}$ divise $${a}^{2(n+1)}-${b}^{n+1}$.<br>`

        texteCorr += `Puisque $${p}$ divise $${a}^{2n}-${b}^n$, il existe $k \\in \\mathbb{Z}$ tel que $${a}^{2n}-${b}^n=${p}k$ soit $${a}^{2n}=${b}^n+${p}k$.<br>`
        texteCorr += `$\\begin{aligned}
${a}^{2(n+1)}&=${a}^{2n+2}\\\\
&=${a}^2\\times ${a}^{2n}\\\\
&=${a * a}\\times\\left(${b}^n+${p}k\\right)\\\\
&=${a * a}\\times ${b}^n+${a * a}\\times ${p}k\\\\
&=(${b}${ecritureAlgebrique(a * a - b)})\\times ${b}^n+${a * a}\\times ${p}k\\\\
&=${b}\\times ${b}^n${ecritureAlgebrique(a * a - b)}\\times ${b}^n+${a * a}\\times ${p}k\\\\
&= ${b}^{n+1}${ecritureAlgebrique((a * a - b) / p)}\\times ${p}\\times ${b}^n+${a * a}\\times ${p}k\\\\
&=${b}^{n+1}+${p}\\left(${(a * a - b) / p}\\times ${b}^n+${a * a} k\\right)
\\end{aligned}$<br>`
        texteCorr += `Ainsi, $${a}^{2(n+1)}-${b}^{n+1}=${p}\\left(${(a * a - b) / p}\\times ${b}^n+${a * a} k\\right)$, donc $${p}$ divise $${a}^{2(n+1)}-${b}^{n+1}$. On en déduit que $\\mathcal{P}(n+1)$ est vraie.<br><br>`
        texteCorr += `${texteEnCouleur('Conclusion.', bleuMathalea)}<br> La propriété est initialisée pour $n=1$ et est héréditaire donc elle est vraie pour tout entier $n \\geqslant 1$.<br>`
        texteCorr += `D'après le principe de récurrence, pour tout entier $n \\geqslant 1$, $${miseEnEvidence(String(p))}$ ${texteEnCouleurEtGras('divise')} $${miseEnEvidence(`${a}^{2n}-${b}^n`)}$.`
      } else {
        const q1 = (a * a - r) / p
        const q2 = (b - r) / p
        texteCorr += `On effectue la division euclidienne de $${a}^2=${a * a}$ par $${p}$ :<br>`
        texteCorr += `$${a * a}=${p}\\times ${q1}+${r}$, donc $${a}^2\\equiv ${r}\\,[${p}]$.<br>`
        if (b >= p) {
          texteCorr += `On effectue la division euclidienne de $${b}$ par $${p}$ :<br>`
          texteCorr += `$${b}=${p}\\times ${q2}+${r}$, donc $${b}\\equiv ${r}\\,[${p}]$.<br>`
          texteCorr += `On en déduit que $${a}^2\\equiv ${b}\\,[${p}]$.<br>`
        }
        texteCorr += `En élevant les deux membres de cette congruence à la puissance $n$, pour tout entier $n \\geqslant 1$ :<br>`
        texteCorr += `$\\left(${a}^2\\right)^n\\equiv ${b}^n\\,[${p}]$, c'est-à-dire $${a}^{2n}\\equiv ${b}^n\\,[${p}]$.<br>`
        texteCorr += `Ainsi, pour tout entier $n \\geqslant 1$, $${a}^{2n}-${b}^n\\equiv 0\\ [${p}]$, donc $${miseEnEvidence(String(p))}$ ${texteEnCouleurEtGras('divise')} $${miseEnEvidence(`${a}^{2n}-${b}^n`)}$.`
      }

      if (this.questionJamaisPosee(i, p, a, b, methode)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
