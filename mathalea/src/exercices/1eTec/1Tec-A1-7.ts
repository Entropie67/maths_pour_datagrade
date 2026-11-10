import { miseEnEvidence } from '../../lib/outils/embellissements'
import { choice } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Déterminer un effectif à partir d'une proportion"
export const interactifReady = true
export const dateDeModifImportante = '10/10/2026'

export const amcReady = true
export const amcType = 'AMCNum'
/**
* @author Stéphane Guyon

* Date de publication
*/
export const uuid = '5b5c0'

export const refs = {
  'fr-fr': ['2I11-7'],
  'fr-ch': [],
}
export default class Effectif extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ['Sans calculatrice', false]
    this.sup = false
  }

  nouvelleVersion() {
    let a, b, c
    const contexte = choice(['association', 'lycée', 'election'])
    if (this.sup) {
      this.versionSansCalculatrice(contexte)
      return
    }
    switch (contexte) {
      case 'association':
        b = randint(3, 80) /* Pourcentage */
        a = randint(20, 50) /* Valeur */
        c = randint(20, 100) /* effectif sous population */

        this.question = `Dans une association, environ $${b}\\,\\%$ des adhérents ont plus de $${a}$ ans. <br>
       Sachant qu'ils représentent $${c}$ personnes, combien de personnes sont adhérentes à l'association ?<br>`

        this.correction = `La population de référence est celle des membres du club.<br>
        La sous-population est celle des plus de $${a}$ ans,
        qui représente $p=${b}\\,\\%$ des membres d'après l'énoncé. <br>
        Appellons $N$ l'effectif de la population de référence, c'est-à-dire le nombre d'adhérents de l'association,<br>
        et $n$ l'effectif de la sous population étudiée. On a donc $n=${c}$ .<br>
        D'après le cours, on sait que $p=\\dfrac{\\text{effectif étudié}}{\\text{effectif total}}=\\dfrac{n}{N}=\\dfrac{${c}}{N}$.
        <br><br>Ainsi, $p=\\dfrac{${b}}{${100}}= \\dfrac{${c}}{N}$.<br>
        Avec un produit en croix, on en déduit que : $${b}\\times N= 100\\times ${c}$.<br>
        On en déduit que $N=\\dfrac{100\\times ${c}}{${b}}\\approx ${arrondi((100 * c) / b, 0)}$.<br>
      Il y a $${miseEnEvidence(arrondi((100 * c) / b, 0))}$ adhérents dans ce club.`
        this.reponse = arrondi((100 * c) / b, 0)
        break
      case 'lycée':
        b = randint(25, 35) /* Pourcentage */
        a = randint(20, 50) /* Valeur */
        c = randint(25, 200) /* Dénominateur fraction */
        this.question = `Dans un lycée, $${b}\\,\\%$ des lycéens sont en classe de 1ère. <br>
            Sachant qu'il y a $${c}$ élèves en classe de 1ère,
            déterminer le nombre total d'élèves de ce lycée ?`
        this.correction = `La population de référence est celle des élèves du lycée.<br>
            La sous-population est celle des élèves de 1ère,
            qui représente $p=${b}\\,\\%$ des membres d'après l'énoncé. <br>
            Appellons $N$ l'effectif de la population de référence, c'est-à-dire le nombre d'élèves du lycée,<br>
            et $n$ l'effectif de la sous population étudiée. On a donc $n=${c}$ .<br>
            D'après le cours, on sait que $p=\\dfrac{\\text{effectif étudié}}{\\text{effectif total}}=\\dfrac{n}{N}=\\dfrac{${c}}{N}$.
            <br><br>Ainsi, $p=\\dfrac{${b}}{${100}}= \\dfrac{${c}}{N}$.<br>
            Avec un produit en croix, on en déduit que : $${b}\\times N= 100\\times ${c}$.<br>
            On en déduit que $N=\\dfrac{100\\times ${c}}{${b}}\\approx ${arrondi((100 * c) / b, 0)}$.<br>
          Il y a $${miseEnEvidence(arrondi((100 * c) / b, 0))}$ élèves dans ce lycée.`
        this.reponse = arrondi((100 * c) / b, 0)
        break
      case 'election':
        b = randint(20, 40) /* Pourcentage */
        a = randint(20, 50) /* Valeur */
        c = randint(10, 70) /* Dénominateur fraction */
        this.question = `Lors d'une élection, un candidat a obtenu environ $${b}\\,\\%$ des suffrages exprimés, soit un total de $${c}$ voix.<br>
  Calculer le nombre de suffrages exprimés lors de cette élection.`
        this.correction = `La population de référence est celle des suffrages exprimés.<br>
                La sous-population est celle des suffrages obtenus par le candidat.<br>
                d'après l'énoncé, $p_1=${b}\\,\\%$.<br>
                Appellons $N$ l'effectif de la population de référence, c'est-à-dire le nombre suffrages exprimés,<br>
            et $n$ l'effectif de la sous population étudiée. On a donc $n=${c}$ .<br>
            D'après le cours, on sait que $p=\\dfrac{\\text{effectif étudié}}{\\text{effectif total}}=\\dfrac{n}{N}=\\dfrac{${c}}{N}$.
            <br><br>Ainsi, $p=\\dfrac{${b}}{${100}}= \\dfrac{${c}}{N}$.<br>
            Avec un produit en croix, on en déduit que : $${b}\\times N= 100\\times ${c}$.<br>
            On en déduit que $N=\\dfrac{100\\times ${c}}{${b}}\\approx ${arrondi((100 * c) / b, 0)}$.<br>
          Il y a eu $${miseEnEvidence(arrondi((100 * c) / b, 0))}$ suffrages exprimés lors de cette élection.`
        this.reponse = arrondi((100 * c) / b, 0)
        break
    }
    if (this.interactif) this.question += '<br>'
  }

  // Sans calculatrice : le pourcentage correspond à une fraction simple num/den.
  // On tire m (multiple rond) puis n = num × m et N = den × m : le calcul se fait de tête.
  versionSansCalculatrice(contexte: string) {
    const pourcentages: Record<string, [number, number, number][]> = {
      association: [
        [10, 1, 10],
        [20, 1, 5],
        [25, 1, 4],
        [50, 1, 2],
        [75, 3, 4],
      ],
      lycée: [
        [20, 1, 5],
        [25, 1, 4],
        [30, 3, 10],
      ],
      election: [
        [10, 1, 10],
        [20, 1, 5],
        [25, 1, 4],
        [40, 2, 5],
      ],
    }
    const [b, num, den] = choice(pourcentages[contexte])
    let m: number
    switch (contexte) {
      case 'association':
        m = num === 1 ? 5 * randint(2, 12) : 10 * randint(1, 6)
        break
      case 'lycée':
        m = num === 1 ? 10 * randint(5, 15) : 10 * randint(10, 20)
        break
      default:
        m = num === 1 ? 10 * randint(2, 30) : 100 * randint(1, 9)
        break
    }
    const N = den * m
    let question: string
    let reference: string
    let sousPopulation: string
    let nomN: string
    let conclusion: string
    switch (contexte) {
      case 'association': {
        const a = randint(20, 50)
        question = `Dans une association, $${b}\\,\\%$ des adhérents ont plus de $${a}$ ans.<br>
        Sachant qu'ils représentent $${texNombre((N * num) / den)}$ personnes, combien de personnes sont adhérentes à l'association ?`
        reference = 'celle des membres du club'
        sousPopulation = `celle des plus de $${a}$ ans`
        nomN = "le nombre d'adhérents de l'association"
        conclusion = `Il y a $${miseEnEvidence(texNombre(N))}$ adhérents dans ce club.`
        break
      }
      case 'lycée':
        question = `Dans un lycée, $${b}\\,\\%$ des lycéens sont en classe de 1ère.<br>
        Sachant qu'il y a $${texNombre((N * num) / den)}$ élèves en classe de 1ère, déterminer le nombre total d'élèves de ce lycée.`
        reference = 'celle des élèves du lycée'
        sousPopulation = 'celle des élèves de 1ère'
        nomN = "le nombre d'élèves du lycée"
        conclusion = `Il y a $${miseEnEvidence(texNombre(N))}$ élèves dans ce lycée.`
        break
      default:
        question = `Lors d'une élection, un candidat a obtenu $${b}\\,\\%$ des suffrages exprimés, soit un total de $${texNombre((N * num) / den)}$ voix.<br>
        Calculer le nombre de suffrages exprimés lors de cette élection.`
        reference = 'celle des suffrages exprimés'
        sousPopulation = 'celle des suffrages obtenus par le candidat'
        nomN = 'le nombre de suffrages exprimés'
        conclusion = `Il y a eu $${miseEnEvidence(texNombre(N))}$ suffrages exprimés lors de cette élection.`
        break
    }
    const c = num * m
    const calcul =
      num === 1
        ? `${den}\\times ${texNombre(c)}`
        : `\\dfrac{${den}\\times ${texNombre(c)}}{${num}}=${den}\\times ${texNombre(m)}`
    this.question = question
    this.correction = `La population de référence est ${reference}.<br>
    La sous-population est ${sousPopulation}, qui représente $p=${b}\\,\\%$ de la population de référence d'après l'énoncé.<br>
    Appelons $N$ l'effectif de la population de référence, c'est-à-dire ${nomN}, et $n$ l'effectif de la sous-population étudiée. On a donc $n=${texNombre(c)}$.<br>
    D'après le cours, on sait que $p=\\dfrac{\\text{effectif étudié}}{\\text{effectif total}}=\\dfrac{n}{N}=\\dfrac{${texNombre(c)}}{N}$.<br>
    Or $p=${b}\\,\\%=\\dfrac{${num}}{${den}}$, donc $\\dfrac{${num}}{${den}}=\\dfrac{${texNombre(c)}}{N}$.<br>
    Avec un produit en croix, on en déduit que $N=${calcul}=${texNombre(N)}$.<br>
    ${conclusion}`
    this.reponse = N
    if (this.interactif) this.question += '<br>'
  }
}
