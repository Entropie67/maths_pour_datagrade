import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { isEqual, sameSet, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../../lib/interactif/createQuestion'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Résoudre des problèmes de valeur moyenne'
export const dateDePublication = '27/10/2026'
export const uuid = 'c9471'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-12'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Type de problème',
      items: [
        { nom: 'debit', label: "Débit d'un réservoir" },
        { nom: 'puissance', label: 'Puissance solaire' },
        { nom: 'vitesse', label: "Vitesse d'un vélo" },
        { nom: 'temperature', label: 'Température' },
      ],
    },
  ],
}

const frac = (num: number, den = 1) => new FractionEtendue(num, den).simplifie()
const pgcd = (x: number, y: number): number =>
  y === 0 ? Math.abs(x) : pgcd(y, x % y)

/** Calcul en mode affiché : en Typst, un aligned en ligne n'aligne pas sa première ligne. */
const bloc = (tex: string) =>
  context.isTypst ? `$$${tex}$$` : `<br>$${tex}$<br>`

type SousQuestion = {
  question: string
  reponse: string
  correction: string
  ensemble?: boolean
  clavier?: string
  avant: string
  apres?: string
}

type Probleme = { enonce: string; sousQuestions: [SousQuestion, SousQuestion] }

/** Modèle f(t) = α + βt + γt² sur [0 ; T]. */
type Modele = { f: Polynome; T: number }

const polynome = (coeffs: FractionEtendue[], lettre: string) =>
  Polynome.fromRationalCoefficients(coeffs, lettre)

const primitive = (f: Polynome) =>
  Polynome.fromRationalCoefficients(f.primitive0().monomes, f.letter)

/** Valeur moyenne de f sur [0 ; T] et intégrale correspondante. */
function moyenne({ f, T }: Modele) {
  const integrale = primitive(f).evaluateExact(T)
  return { integrale, moyenne: integrale.diviseFraction(frac(T)).simplifie() }
}

/**
 * Tire α, β, γ jusqu'à une moyenne entière et un modèle positif sur [0 ; T]
 * (γ < 0 : la grandeur croît puis décroît, comme dans les problèmes du cours).
 */
function tirerModele(
  lettre: string,
  tirage: () => {
    alpha: number
    beta: number
    gamma: FractionEtendue
    T: number
  },
  accepte: (m: Modele) => boolean = () => true,
): Modele {
  for (;;) {
    const { alpha, beta, gamma, T } = tirage()
    const f = polynome([frac(alpha), frac(beta), gamma.oppose()], lettre)
    const modele = { f, T }
    if (f.evaluateExact(T).valeurDecimale < 0) continue
    if (moyenne(modele).moyenne.den !== 1) continue
    if (accepte(modele)) return modele
  }
}

/** f_moy = 1/T ∫₀ᵀ f(t) dt = … : calcul affiché de la valeur moyenne. */
function calculMoyenne(nom: string, indice: string, modele: Modele): string {
  const { f, T } = modele
  const { integrale, moyenne: m } = moyenne(modele)
  const lettre = f.letter
  return (
    `\\begin{aligned}${nom}_{\\text{${indice}}}&=\\dfrac{1}{${T}-0}\\int_{0}^{${T}}${nom}(${lettre})\\,\\mathrm{d}${lettre}` +
    `\\\\&=\\dfrac{1}{${T}}\\left[${primitive(f).toLatex()}\\right]_{0}^{${T}}` +
    `\\\\&=\\dfrac{${integrale.texFractionSimplifiee}}{${T}}` +
    `\\\\&=${miseEnEvidence(m.texFractionSimplifiee)}\\end{aligned}`
  )
}

/** Problème « grandeur moyenne puis grandeur totale » (débit, puissance, vitesse). */
function problemeTotal(
  modele: Modele,
  textes: {
    enonce: string
    nom: string
    indice: string
    questionA: string
    phraseA: string
    uniteA: string
    questionB: string
    phraseB: string
    total: string
    uniteB: string
  },
): Probleme {
  const { T } = modele
  const { integrale, moyenne: m } = moyenne(modele)
  return {
    enonce: textes.enonce,
    sousQuestions: [
      {
        question: textes.questionA,
        reponse: m.texFractionSimplifiee,
        correction:
          `${textes.phraseA} est la valeur moyenne de $${textes.nom}$ sur $[0;${T}]$ :` +
          bloc(calculMoyenne(textes.nom, textes.indice, modele)) +
          `${textes.phraseA} vaut donc $${miseEnEvidence(m.texFractionSimplifiee)}$ ${textes.uniteA}.`,
        avant: `$${textes.nom}_{\\text{${textes.indice}}}=$`,
        apres: textes.uniteA,
      },
      {
        question: textes.questionB,
        reponse: integrale.texFractionSimplifiee,
        correction:
          `${textes.phraseB} est l'intégrale de $${textes.nom}$ sur $[0;${T}]$, déjà calculée en a) : ` +
          `$${textes.total}=\\displaystyle\\int_{0}^{${T}}${textes.nom}(t)\\,\\mathrm{d}t=${T}\\times ${textes.nom}_{\\text{${textes.indice}}}=${T}\\times ${m.texFractionSimplifiee}=${miseEnEvidence(integrale.texFractionSimplifiee)}$ ${textes.uniteB}.`,
        avant: `$${textes.total}=$`,
        apres: textes.uniteB,
      },
    ],
  }
}

function tirerDebit(): Probleme {
  const modele = tirerModele('t', () => ({
    alpha: 10 * randint(4, 12),
    beta: randint(-4, 4),
    gamma: choice([frac(1, 4), frac(1, 2), frac(1)]),
    T: choice([6, 8, 10, 12]),
  }))
  const { f, T } = modele
  return problemeTotal(modele, {
    enonce: `Un réservoir se vide avec un débit volumique $d(t)=${f.toLatex()}$ en litres par seconde, où $t$ est le temps en secondes et $0\\leqslant t\\leqslant ${T}$. Le réservoir est plein au temps $t=0$ et vide au temps $t=${T}$.`,
    nom: 'd',
    indice: 'moy',
    questionA: `Calculer le débit volumique moyen entre $t=0$ et $t=${T}$.`,
    phraseA: 'Le débit volumique moyen',
    uniteA: 'litres par seconde',
    questionB: 'Calculer la contenance du réservoir, en litres.',
    phraseB:
      'Le réservoir se vide entièrement, donc sa contenance est le volume écoulé. Ce volume',
    total: 'V',
    uniteB: 'litres',
  })
}

function tirerPuissance(): Probleme {
  const modele = tirerModele('t', () => ({
    alpha: 50 * randint(6, 12),
    beta: 20 * randint(2, 8),
    gamma: frac(5 * randint(2, 6)),
    T: choice([6, 8]),
  }))
  const { f, T } = modele
  const debut = 12 - T / 2
  return problemeTotal(modele, {
    enonce: `Entre $${debut}\\,\\text{h}$ et $${debut + T}\\,\\text{h}$, la puissance solaire reçue par un mètre carré de panneau est modélisée par $p(t)=${f.toLatex()}$ en watts par mètre carré, où $t$ est le nombre d'heures écoulées depuis $${debut}\\,\\text{h}$.`,
    nom: 'p',
    indice: 'moy',
    questionA: `Calculer la puissance solaire moyenne reçue par mètre carré entre $${debut}\\,\\text{h}$ et $${debut + T}\\,\\text{h}$.`,
    phraseA: 'La puissance moyenne',
    uniteA: 'watts par mètre carré',
    questionB: `Calculer l'énergie solaire reçue par un mètre carré de panneau pendant ces $${T}$ heures, en wattheures.`,
    phraseB: "L'énergie reçue",
    total: 'E',
    uniteB: 'wattheures',
  })
}

function tirerVitesse(): Probleme {
  const modele = tirerModele('t', () => ({
    alpha: randint(1, 6),
    beta: randint(1, 4),
    gamma: choice([frac(1, 6), frac(1, 4), frac(1, 3), frac(1, 2)]),
    T: choice([4, 6, 8, 12]),
  }))
  const { f, T } = modele
  return problemeTotal(modele, {
    enonce: `Lors d'un trajet, la vitesse d'un vélo électrique est modélisée par $v(t)=${f.toLatex()}$ en mètres par seconde, où $t$ est le temps en secondes et $0\\leqslant t\\leqslant ${T}$.`,
    nom: 'v',
    indice: 'moy',
    questionA: `Calculer la vitesse moyenne du vélo pendant ces $${T}$ secondes.`,
    phraseA: 'La vitesse moyenne',
    uniteA: 'mètres par seconde',
    questionB: `Calculer la distance parcourue pendant ces $${T}$ secondes.`,
    phraseB:
      'La vitesse est positive sur cet intervalle : la distance parcourue',
    total: 'D',
    uniteB: 'mètres',
  })
}

/** Équation ax² + bx + c = 0 à coefficients entiers, a > 0, simplifiée par le pgcd. */
function trinomeEntier(coeffs: FractionEtendue[]): [number, number, number] {
  const den = coeffs.reduce((d, c) => (d * c.den) / pgcd(d, c.den), 1)
  let [c, b, a] = coeffs.map((x) => (x.num * den) / x.den)
  if (a < 0) [a, b, c] = [-a, -b, -c]
  const g = pgcd(pgcd(a, b), c)
  return [a / g, b / g, c / g]
}

const trinomeTex = (a: number, b: number, c: number, lettre: string) =>
  polynome([frac(c), frac(b), frac(a)], lettre).toLatex()

/** Racines rationnelles de ax² + bx + c (Δ carré parfait), ou null. */
function racines(a: number, b: number, c: number) {
  const delta = b * b - 4 * a * c
  if (delta < 0) return null
  const r = Math.round(Math.sqrt(delta))
  if (r * r !== delta) return null
  return {
    delta,
    racines: [frac(-b - r, 2 * a), frac(-b + r, 2 * a)].filter(
      (x, k, tab) =>
        k === 0 || x.texFractionSimplifiee !== tab[0].texFractionSimplifiee,
    ),
  }
}

/** Résolution détaillée de ax² + bx + c = 0 par le discriminant. */
function resolution(a: number, b: number, c: number, lettre: string): string {
  const res = racines(a, b, c)
  if (res == null) return ''
  const noms =
    res.racines.length === 1 ? [lettre] : [`${lettre}_1`, `${lettre}_2`]
  return (
    `$\\Delta=${b < 0 ? `(${b})` : b}^2-4\\cdot ${a}\\cdot ${c < 0 ? `(${c})` : c}=${res.delta}$, d'où ` +
    res.racines
      .map((x, k) => `$${noms[k]}=${x.texFractionSimplifiee}$`)
      .join(' et ') +
    '.'
  )
}

function tirerTemperature(): Probleme {
  const T = 12
  let solutions: FractionEtendue[] = []
  let equation: [number, number, number] = [1, 0, 0]
  const modele = tirerModele(
    't',
    () => ({
      alpha: randint(8, 18),
      beta: randint(1, 6),
      gamma: choice([
        frac(1, 12),
        frac(1, 6),
        frac(1, 4),
        frac(1, 3),
        frac(1, 2),
      ]),
      T,
    }),
    ({ f, T }) => {
      // Maximum raisonnable (au sommet de la parabole) et instants entiers.
      const [c0, c1, c2] = f.monomes as FractionEtendue[]
      const sommet = Math.min(
        T,
        Math.max(0, -c1.valeurDecimale / (2 * c2.valeurDecimale)),
      )
      const max =
        c0.valeurDecimale +
        c1.valeurDecimale * sommet +
        c2.valeurDecimale * sommet ** 2
      if (max > 38) return false
      const m = moyenne({ f, T }).moyenne
      equation = trinomeEntier([c0.differenceFraction(m), c1, c2])
      const res = racines(...equation)
      if (res == null) return false
      solutions = res.racines.filter(
        (x) => x.den === 1 && x.valeurDecimale >= 0 && x.valeurDecimale <= T,
      )
      return solutions.length > 0 && res.racines.every((x) => x.den === 1)
    },
  )
  const { f } = modele
  const m = moyenne(modele).moyenne
  const ensemble = `\\left\\{${solutions.map((x) => x.texFractionSimplifiee).join(';')}\\right\\}`
  const [a, b, c] = equation
  const heures = solutions.map((x) => `$${6 + x.valeurDecimale}\\,\\text{h}$`)
  return {
    enonce: `Un jour d'été, la température extérieure entre $6\\,\\text{h}$ et $18\\,\\text{h}$ est modélisée par $\\theta(t)=${f.toLatex()}$ en degrés Celsius, où $t$ est le nombre d'heures écoulées depuis $6\\,\\text{h}$.`,
    sousQuestions: [
      {
        question:
          'Calculer la température moyenne entre $6\\,\\text{h}$ et $18\\,\\text{h}$.',
        reponse: m.texFractionSimplifiee,
        correction:
          'La température moyenne est la valeur moyenne de $\\theta$ sur $[0;12]$ :' +
          bloc(calculMoyenne('\\theta', 'moy', modele)) +
          `La température moyenne vaut donc $${miseEnEvidence(m.texFractionSimplifiee)}$ degrés Celsius.`,
        avant: '$\\theta_{\\text{moy}}=$',
        apres: 'degrés Celsius',
      },
      {
        question:
          "Déterminer l'ensemble $S$ des instants $t\\in[0;12]$ où la température est égale à la température moyenne.",
        reponse: ensemble,
        ensemble: true,
        correction:
          `Le théorème de la moyenne garantit au moins une solution. ` +
          `$\\theta(t)=${m.texFractionSimplifiee}\\iff ${trinomeTex(a, b, c, 't')}=0$ : ` +
          `${resolution(a, b, c, 't')} ` +
          `On ne garde que les valeurs de $[0;12]$ : $S=${miseEnEvidence(ensemble)}$. ` +
          `La température est égale à la moyenne à ${heures.join(' et à ')}.`,
        avant: '$S=$',
        clavier: KeyboardType.clavierEnsemble,
      },
    ],
  }
}

/** Trouver b > 0 tel que la valeur moyenne de f sur [0 ; b] soit m (ex40 du cours). */
const tirages: Record<string, () => Probleme> = {
  debit: tirerDebit,
  puissance: tirerPuissance,
  vitesse: tirerVitesse,
  temperature: tirerTemperature,
}

/**
 * Valeur moyenne en contexte : débit, puissance, vitesse, température.
 * @author Nathan Scheinmann
 */
export default class ValeurMoyenneProblemes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacingCorr = 2
    this.comment =
      "Dans les problèmes en contexte, la grandeur totale (volume, énergie, distance) est l'intégrale de la grandeur donnée, et sa valeur moyenne est cette intégrale divisée par la durée : la question b) réutilise le calcul de a). Pour la température, b) applique le théorème de la moyenne. Les données sont tirées pour que les moyennes soient entières. Chaque question compte deux réponses, donc deux points."
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const familles = repartitionPonderee(
      shuffle(params.liste('familles')),
      this.nbQuestions,
      shuffle(params.declares('familles')),
    )
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const p = tirages[familles[i]]()
      if (!this.questionJamaisPosee(i, p.enonce)) continue
      createQuestion(this, i, {
        question: p.enonce,
        correction: '',
        subQuestions: p.sousQuestions.map((s) => ({
          question:
            s.question +
            (this.interactif ? `<br>${s.avant} %{0} ${s.apres ?? ''}` : ''),
          answer: {
            value: s.reponse,
            compare: s.ensemble ? seq([sameSet()]) : seq([isEqual()]),
          },
          field: { keyboard: s.clavier ?? KeyboardType.clavierDeBase },
          correction: s.correction,
        })),
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
