import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { combinaisonListes, shuffle, choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Linéariser $\\sin^2(a)$ ou $\\cos^2(a)$'
export const interactifReady = true
export const interactifType = 'mathLive'

export const dateDePublication = '04/11/2026'

export const uuid = 'c9b38'
export const refs = {
  'fr-fr': ['TEC3-11'],
  'fr-ch': [],
}

type Angle = {
  /** numérateur de l'angle k\pi/n */
  k: number
  /** dénominateur de l'angle k\pi/n */
  n: number
  /** radicande du cosinus de 2θ */
  r: 2 | 3
  /** signe du cosinus de 2θ */
  s: 1 | -1
  /** 2θ simplifié, en LaTeX */
  doubleLatex: string
}

// Angles dont le double est un angle remarquable (θ dans ]0 ; π[)
const anglesDeBase: Angle[] = [
  { k: 1, n: 8, r: 2, s: 1, doubleLatex: '\\dfrac{\\pi}{4}' },
  { k: 3, n: 8, r: 2, s: -1, doubleLatex: '\\dfrac{3\\pi}{4}' },
  { k: 5, n: 8, r: 2, s: -1, doubleLatex: '\\dfrac{5\\pi}{4}' },
  { k: 7, n: 8, r: 2, s: 1, doubleLatex: '\\dfrac{7\\pi}{4}' },
  { k: 1, n: 12, r: 3, s: 1, doubleLatex: '\\dfrac{\\pi}{6}' },
  { k: 5, n: 12, r: 3, s: -1, doubleLatex: '\\dfrac{5\\pi}{6}' },
  { k: 7, n: 12, r: 3, s: -1, doubleLatex: '\\dfrac{7\\pi}{6}' },
  { k: 11, n: 12, r: 3, s: 1, doubleLatex: '\\dfrac{11\\pi}{6}' },
]

// Clavier des calculs de valeurs exactes : chiffres, opérations, fraction,
// carré et racine carrée, sans lettres.
const chiffres = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ',']
const operations = ['+', '-', '\\times', '\\div', 'FRAC', '(', ')']
const clavierCalcul = {
  keyboard: KeyboardType.clavierEntierementPersonnalisable,
  dataKeys: [chiffres, [...operations, '^2', 'SQRT']],
}
// Clavier de la linéarisation : cos, sin, π et la lettre a.
const clavierLineaire = {
  keyboard: KeyboardType.clavierEntierementPersonnalisable,
  dataKeys: [chiffres, [...operations, '^2', 'COS', 'SIN', '\\pi', 'a']],
}

const angleLatex =(k: number, n: number) =>
  `\\dfrac{${k === 1 ? '' : k}\\pi}{${n}}`

/**
 * Linéarisation de cos² ou sin² en fonction de cos(2a), puis valeurs exactes
 * de cos ou sin pour deux angles dont le double est remarquable.
 * @author Stéphane Guyon
 */
export default class LineariserCosCarre extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 3
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Fonction à linéariser',
      3,
      '1 : cos²(a)\n2 : sin²(a)\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    const typesDisponibles = this.sup === 1 ? [1] : this.sup === 2 ? [2] : [1, 2]
    const listeTypes = combinaisonListes(typesDisponibles, this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const nom = listeTypes[i] === 1 ? 'cos' : 'sin'
      const nomTex = `\\${nom}`
      const eps = nom === 'cos' ? 1 : -1
      const huit = choice(anglesDeBase.filter((a) => a.n === 8))
      const douze = choice(anglesDeBase.filter((a) => a.n === 12))
      const angles = shuffle([huit, douze])
      if (
        !this.questionJamaisPosee(
          i,
          nom,
          angles[0].k,
          angles[0].n,
          angles[1].k,
          angles[1].n,
        )
      ) {
        continue
      }
      const signeLin = eps === 1 ? '+' : '-'
      const lineaire = `\\dfrac{1${signeLin}\\cos(2a)}{2}`

      const sousQuestions = angles.map((angle) => {
        const { k, n, r, s, doubleLatex } = angle
        const theta = angleLatex(k, n)
        const cosDouble = `${s === -1 ? '-' : ''}\\dfrac{\\sqrt{${r}}}{2}`
        const termeRadical = eps * s === 1 ? '+' : '-'
        const carre = `\\dfrac{2${termeRadical}\\sqrt{${r}}}{4}`
        // Le sinus est positif sur ]0 ; π[ ; le cosinus l'est si θ < π/2.
        const positif = nom === 'sin' || (2 * k < n)
        const racine = `\\dfrac{\\sqrt{2${termeRadical}\\sqrt{${r}}}}{2}`
        const valeur = `${positif ? '' : '-'}${racine}`
        let correction = `On applique la formule avec $a=${theta}$ :<br>$${nomTex}^2\\left(${theta}\\right)=\\dfrac{1${signeLin}\\cos\\left(${doubleLatex}\\right)}{2}$.<br>`
        correction += `Or $\\cos\\left(${doubleLatex}\\right)=${cosDouble}$, donc $${nomTex}^2\\left(${theta}\\right)=\\dfrac{1${signeLin}${s === -1 ? `\\left(${cosDouble}\\right)` : cosDouble}}{2}=${carre}$.<br>`
        correction +=
          nom === 'sin'
            ? `Comme $0<${theta}<\\pi$, $\\sin\\left(${theta}\\right)>0$ :<br>`
            : positif
              ? `Comme $0<${theta}<\\dfrac{\\pi}{2}$, $\\cos\\left(${theta}\\right)>0$ :<br>`
              : `Comme $\\dfrac{\\pi}{2}<${theta}<\\pi$, $\\cos\\left(${theta}\\right)<0$ :<br>`
        correction += `$${nomTex}\\left(${theta}\\right)=${miseEnEvidence(valeur)}$.`
        return {
          champ: `$${nomTex}\\left(${theta}\\right)=$`,
          question: `En déduire la valeur exacte de $${nomTex}\\left(${theta}\\right)$.`,
          answer: [{ value: valeur }],
          field: [clavierCalcul],
          correction,
        }
      })

      // En interactif : pas de repères a), b), c), un seul « En déduire : »
      // puis une ligne par valeur à saisir.
      const deduction = {
        question: `En déduire :<br>${sousQuestions.map((q, k) => `${q.champ} %{${k}}`).join('<br>')}`,
        answer: sousQuestions.map((q) => q.answer[0]),
        field: [clavierCalcul, clavierCalcul],
        correction: sousQuestions
          .map((q) => `Pour ${q.champ.slice(0, -1)}$ :<br>${q.correction}`)
          .join('<br>'),
      }

      createQuestion(this, i, {
        question: '',
        bareme: toutPourUnPoint,
        labels: !this.interactif,
        subQuestions: [
          {
            question: `Exprimer $${nomTex}^2(a)$ en fonction de $\\cos(2a)$ pour un réel $a$.${
              this.interactif ? `<br>$${nomTex}^2(a)=$ %{0}` : ''
            }`,
            answer: [
              {
                value: lineaire,
                options: { fonction: true, variable: 'a' },
              },
            ],
            field: [clavierLineaire],
            correction:
              'Pour tous réels $a$ et $b$, $\\cos(a+b)=\\cos(a)\\cos(b)-\\sin(a)\\sin(b)$.<br>' +
              'Dans cette formule, on prend $b=a$ pour obtenir $\\cos(2a)$ :<br>' +
              '$\\cos(2a)=\\cos(a+a)=\\cos^2(a)-\\sin^2(a)$.<br>' +
              `On utilise ensuite $\\cos^2(a)+\\sin^2(a)=1$, c'est-à-dire $${
                nom === 'cos'
                  ? '\\sin^2(a)=1-\\cos^2(a)'
                  : '\\cos^2(a)=1-\\sin^2(a)'
              }$ :<br>` +
              `$\\cos(2a)=${
                nom === 'cos'
                  ? '\\cos^2(a)-\\left(1-\\cos^2(a)\\right)=2\\cos^2(a)-1'
                  : '\\left(1-\\sin^2(a)\\right)-\\sin^2(a)=1-2\\sin^2(a)'
              }$.<br>` +
              `On isole $${nomTex}^2(a)$ : $${
                nom === 'cos'
                  ? '2\\cos^2(a)=1+\\cos(2a)'
                  : '2\\sin^2(a)=1-\\cos(2a)'
              }$, donc $${nomTex}^2(a)=${miseEnEvidence(lineaire)}$.`,
          },
          ...(this.interactif ? [deduction] : sousQuestions),
        ],
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
