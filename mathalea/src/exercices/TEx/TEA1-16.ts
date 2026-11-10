import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Démontrer la non-divisibilité d'une expression affine"
export const uuid = 'eb781'
export const refs = {
  'fr-fr': ['TEA1-16'],
  'fr-ch': [],
}

export default class NonDivisibiliteAffine extends Exercice {
  constructor() {
    super()
    this.titre = titre
    this.consigne = ''
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
    this.spacing = 2
    this.spacingCorr = 2
    this.sup = 2
    this.besoinFormulaireNumerique = [
      'Méthode utilisée dans la correction',
      2,
      '1 : Raisonnement par l’absurde avec la divisibilité\n2 : Division euclidienne',
    ]
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Choix aléatoire d'un nombre premier ou diviseur p
      const p = choice([7, 11, 13, 17, 19])
      // Choix d'un facteur m pour que a = p * m
      const m = randint(2, 5)
      const a = p * m
      // Choix d'un reste b non divisible par p (1 <= b < p)
      const b = randint(1, p - 1)
      const expression = reduireAxPlusB(a, b, 'n')

      // Énoncé de la question
      const texte = `Soit $n \\in \\mathbb{N}$. Montrer que l'expression $${expression}$ n'est pas divisible par $${p}$.`

      let texteCorr: string
      if (this.sup === 2) {
        texteCorr = `Soit $n$ un entier naturel. On écrit $${expression}$ sous la forme d’une division euclidienne par $${p}$ :<br>`
        texteCorr += `$${expression}=${p}\\times${m}n+${b}$<br>`
        texteCorr += `Comme $n\\in\\mathbb{N}$, le quotient $${m}n$ est un entier naturel.<br>`
        texteCorr += `De plus, $0\\leqslant ${b}<${p}$. Ainsi, le reste de la division euclidienne de $${expression}$ par $${p}$ est $${b}$.<br>`
        texteCorr += `Ce reste n’est pas nul, donc $${p}$ ne divise pas $${expression}$.<br>`
      } else {
        texteCorr = `Démontrons par l'absurde que $${expression}$ n'est jamais divisible par $${p}$ pour tout entier naturel $n$.<br>`
        texteCorr += `Supposons qu'il existe un entier $n$ tel que $${expression}$ soit divisible par $${p}$.<br>`
        texteCorr += `Il existe alors un entier $k$ tel que :<br>`
        texteCorr += `$${expression}=${p}k$.<br>`
        texteCorr += `En réorganisant cette égalité pour isoler la constante, on obtient :<br>`
        texteCorr += `$${p}k-${a}n=${b}$.<br>`
        texteCorr += `Puisque $${a}=${p}\\times ${m}$, on peut factoriser par $${p}$ dans le membre de gauche :<br>`
        texteCorr += `$${p}\\left(k-${m}n\\right)=${b}$.<br>`
        texteCorr += `Le membre de gauche, $${p}\\left(k-${m}n\\right)$, est un multiple de $${p}$, car $k-${m}n$ est un entier.<br>`
        texteCorr += `Or, $${b}$ n'est pas un multiple de $${p}$.<br>`
        texteCorr += `C'est une contradiction.<br>`
      }
      texteCorr += `${texteEnCouleurEtGras('Pour tout entier naturel')} $${miseEnEvidence('n')}$${texteEnCouleurEtGras(',')} $${miseEnEvidence(expression)}$ ${texteEnCouleurEtGras("n'est pas divisible par")} $${miseEnEvidence(String(p))}$${texteEnCouleurEtGras('.')}`

      if (this.questionJamaisPosee(i, a, b, p)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
