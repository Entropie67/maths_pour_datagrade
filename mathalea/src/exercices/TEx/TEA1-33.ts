import { tableauColonneLigne } from '../../lib/2d/tableau'
import { bleuMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Résoudre une équation de congruence'
export const interactifReady = true

export const dateDePublication = '26/11/2025'
export const dateDeModifImportante = '14/10/2026'
export const uuid = '94f0d'

export const refs = {
  'fr-fr': ['TEA1-33'],
  'fr-ch': [],
}
/**
 *
 * @author Stéphane Guyon

*/
// modulo positif
function mod(n: number, k: number): number {
  return ((n % k) + k) % k
}

// pgcd
function pgcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

// restes r de 0 à k−1 tels que f(r) ≡ d [k]
function restesSolutions(
  f: (x: number) => number,
  d: number,
  k: number,
): number[] {
  return Array.from({ length: k }, (_, r) => r).filter(
    (r) => mod(f(r) - d, k) === 0,
  )
}

// ensemble des entiers congrus à l'un des restes modulo k
function ensembleSolutions(restes: number[], k: number): string {
  if (restes.length === 0) return 'S=\\emptyset'
  return `S=${restes.map((r) => `\\{  ${r} + ${k}n,\\ n \\in \\mathbb{Z} \\}`).join(' \\cup ')}`
}

/** Équation f(x) ≡ d [k] posée en QCM. */
type EquationQcm = {
  k: number
  f: (x: number) => number
  d: number
  // membre de gauche en LaTeX
  gauche: string
  // équations obtenues par une erreur classique, sous la forme [f, d]
  erreurs: [(x: number) => number, number][]
  // phrase ajoutée à la correction avant la table
  remarque?: string
}

export default class ExerciceEquationAxCongruence extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Type d’équations',
      4,
      '1 : ax ≡ b [k]\n2 : x² ≡ a [k]\n3 : x² + bx + c ≡ 0 [k]\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    const typesDeQuestions =
      this.sup === 4
        ? combinaisonListes([1, 2, 3], this.nbQuestions)
        : Array.from({ length: this.nbQuestions }, () =>
            [1, 2, 3].includes(this.sup) ? this.sup : 1,
          )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      if (this.questionQcm(i, typesDeQuestions[i])) i++
    }
    listeQuestionsToContenu(this)
  }

  /** Tire une équation du type demandé. */
  tirageEquation(type: number): EquationQcm {
    if (type === 1) {
      // ax ≡ b [k] : a inversible modulo k (une solution) ou non (zéro ou plusieurs)
      const inversible = choice([true, false])
      const k = inversible ? randint(3, 9) : choice([4, 6, 8, 9])
      let a: number
      do a = randint(-5, 5, [-1, 0, 1])
      while (
        mod(a, k) === 0 ||
        (inversible ? pgcd(a, k) !== 1 : pgcd(a, k) === 1)
      )
      // Si a n'est pas inversible, b est atteint par ax deux fois sur trois, sinon l'équation n'aurait souvent pas de solution
      const b =
        inversible || randint(1, 3) === 1
          ? randint(0, k - 1)
          : mod(a * randint(0, k - 1), k)
      return {
        k,
        f: (x) => a * x,
        d: b,
        gauche: `${a}x`,
        erreurs: [
          [(x) => -a * x, b],
          [(x) => a * x, b + 1],
          [(x) => a * x, b - 1],
          [(x) => a * x, b + 2],
          [(x) => a * x, -b],
          [(x) => x, b],
        ],
        remarque: inversible
          ? `$${a}$ et $${k}$ sont premiers entre eux : $${a}$ est inversible modulo $${k}$ et l'équation a une unique solution modulo $${k}$.<br>`
          : `$${a}$ et $${k}$ ne sont pas premiers entre eux : $${a}$ n'est pas inversible modulo $${k}$.<br>`,
      }
    }
    if (type === 2) {
      // x² ≡ a [k]
      const k = randint(3, 9)
      const a = randint(0, k - 1)
      return {
        k,
        f: (x) => x * x,
        d: a,
        gauche: 'x^2',
        erreurs: [
          [(x) => x * x, -a],
          [(x) => x * x, a + 1],
          [(x) => x * x, a - 1],
          [(x) => x, a],
        ],
      }
    }
    // x² + bx + c ≡ 0 [k]
    const k = randint(3, 8)
    const b = randint(-5, 5)
    const c = randint(-5, 5, 0)
    return {
      k,
      f: (x) => x * x + b * x + c,
      d: 0,
      gauche: new Polynome({ rand: false, coeffs: [c, b, 1] }).toLatex(),
      erreurs: [
        [(x) => x * x - b * x + c, 0],
        [(x) => x * x + b * x - c, 0],
        [(x) => x * x + b * x + c, 1],
        [(x) => x * x + b * x + c, -1],
      ],
    }
  }

  /** Construit une question en QCM ; renvoie false si elle a déjà été posée. */
  questionQcm(i: number, type: number): boolean {
    let equation: EquationQcm
    let solutions: number[]
    let propositions: number[][]
    let essais = 0
    do {
      equation = this.tirageEquation(type)
      const { k, f, d } = equation
      solutions = restesSolutions(f, d, k)
      const nonSolutions = Array.from({ length: k }, (_, r) => r).filter(
        (r) => !solutions.includes(r),
      )
      // Distracteurs : solution oubliée ou en trop, ensemble vide, erreurs classiques
      const candidats = [
        solutions,
        solutions.length >= 2 ? solutions.slice(0, -1) : [],
        nonSolutions.length > 0
          ? [...solutions, nonSolutions[0]].sort((x, y) => x - y)
          : [],
        [],
        ...equation.erreurs.map(([g, e]) => restesSolutions(g, e, k)),
      ]
      propositions = []
      for (const restes of candidats) {
        if (!propositions.some((p) => p.join() === restes.join())) {
          propositions.push(restes)
        }
      }
      essais++
    } while (propositions.length < 4 && essais < 50)
    const { k, f, gauche, remarque } = equation
    const d = mod(equation.d, k)
    const valeurs = Array.from({ length: k }, (_, n) => mod(f(n), k))

    const texte = `
Résoudre dans $\\mathbb{Z}$ l'équation : $${gauche} \\equiv ${d} \\,[${k}]$.<br>`
    if (!this.questionJamaisPosee(i, texte)) return false

    const entetesColonnes = [
      `x \\equiv \\ldots [${k}]`,
      ...Array.from({ length: k }, (_, n) =>
        solutions.includes(n) ? miseEnEvidence(n) : `${n}`,
      ),
    ]
    const entetesLignes = [`${gauche} \\equiv \\ldots [${k}]`]
    const cellules = valeurs.map((valeur) =>
      valeur === d ? miseEnEvidence(valeur, bleuMathalea) : `${valeur}`,
    )
    const style: { [key: string]: string } = {
      L0C0: '#f4f4f4',
      LC0: '#f5f5f5',
    }
    for (let col = 0; col < k; col++) {
      style[`L0C${col + 1}`] = '#f4f4f4'
    }
    for (const r of solutions) style[`L1C${r + 1}`] = '#fde7dd'
    const table = tableauColonneLigne(
      entetesColonnes,
      entetesLignes,
      cellules,
      1.2,
      true,
      this.numeroExercice ?? 0,
      i,
      this.interactif,
      style,
    )

    let texteCorr = `On cherche les entiers $x$ tels que $${gauche} \\equiv ${d} \\,[${k}]$.<br>`
    texteCorr += remarque ?? ''
    texteCorr += `On procède à une disjonction des cas en dressant une table de congruence modulo $${k}$ :<br>`
    texteCorr += table
    if (solutions.length === 0) {
      texteCorr += `<br>Aucun reste ne donne $${gauche} \\equiv ${d} \\,[${k}]$ : l'équation n'a pas de solution.`
    } else {
      texteCorr += `<br>On en déduit que ${solutions.map((r) => `$x \\equiv ${miseEnEvidence(r)} \\,[${k}]$`).join(' ou ')}.`
      texteCorr += `<br>Réciproquement, la table montre que ces entiers sont bien solutions.`
    }
    texteCorr += `<br>L'ensemble des solutions est donc : $${miseEnEvidence(ensembleSolutions(solutions, k), bleuMathalea)}$.`

    this.autoCorrection[i] = {
      options: { radio: true, vertical: true },
      enonce: texte,
      propositions: propositions.slice(0, 4).map((restes, n) => ({
        texte: `$${ensembleSolutions(restes, k)}$`,
        statut: n === 0,
      })),
    }
    this.listeQuestions[i] = this.interactif
      ? texte + propositionsQcm(this, i).texte
      : texte
    this.listeCorrections[i] = texteCorr
    return true
  }
}
