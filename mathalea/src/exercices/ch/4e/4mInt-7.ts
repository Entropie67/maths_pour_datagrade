import {
    addMultiMathfield,
    type DataOptionsMultiMathfield,
} from '../../../lib/customElements/MultiMathfield'
import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { noDecimal } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ce, {
    fonctionComparaison,
} from '../../../lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { extraireRacineNieme } from '../../../lib/outils/calculs'
import {
    ecritureAlgebrique,
    ecritureParentheseSiNegatif,
    reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { numAlpha } from '../../../lib/outils/outilString'
import type { CompareFunction, Valeur } from '../../../lib/types'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Déterminer une valeur moyenne et appliquer le théorème de la moyenne'
export const dateDePublication = '14/09/2026'
export const uuid = '00e95'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-7'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Familles de fonctions',
      items: [
        { nom: 'affine', label: 'Affine' },
        { nom: 'quadratique', label: 'Quadratique' },
        { nom: 'inverse', label: 'Inverse cubique' },
        { nom: 'racine', label: 'Inverse de racine affine' },
        { nom: 'sin', label: 'Sinus' },
        { nom: 'cos', label: 'Cosinus' },
      ],
    },
    {
      type: 'case',
      nom: 'integraleDonnee',
      label: 'Donner la valeur de l’intégrale',
      defaut: false,
    },
  ],
}

/**
 * Écrit la racine cubique d'un rationnel strictement positif en extrayant les
 * facteurs cubiques : ∛(n/d) = ∛(n·d²)/d.
 */
function texRacineCubique(q: FractionEtendue): string {
  const [facteur, reste] = extraireRacineNieme(q.num * q.den * q.den, 3)
  const coefficient = new FractionEtendue(facteur, q.den).simplifie()
  if (reste === 1) return coefficient.texFractionSimplifiee
  const racine = `${coefficient.num === 1 ? '' : coefficient.num}\\sqrt[3]{${reste}}`
  return coefficient.den === 1
    ? racine
    : `\\frac{${racine}}{${coefficient.den}}`
}

const differenceTex = (fb: FractionEtendue, fa: FractionEtendue) =>
  `${fb.simplifie().texFractionSimplifiee}-${ecritureParentheseSiNegatif(fa.simplifie())}`

type CandidatTrinome = { a: number; b: number; c1: number; c2: FractionEtendue }

/**
 * Trinômes (x - c1)(x - c2) de moyenne nulle sur [a ; b] : pour a, b et c1
 * entiers, c2 = (2(a² + ab + b²) - 3c1(a + b)) / (3(a + b - 2c1)). Les cas sont
 * séparés selon le nombre de racines dans [a ; b] pour varier les réponses.
 */
function candidatsTrinome() {
  const deuxRacines: CandidatTrinome[] = []
  const uneRacine: CandidatTrinome[] = []
  for (let a = -3; a <= 2; a++)
    for (let b = a + 2; b <= a + 4; b++)
      for (let c1 = a - 2; c1 <= b + 2; c1++) {
        const denominateur = 3 * (a + b - 2 * c1)
        if (denominateur === 0) continue
        const c2 = new FractionEtendue(
          2 * (a * a + a * b + b * b) - 3 * c1 * (a + b),
          denominateur,
        ).simplifie()
        if (
          Math.abs(c2.den) > 3 ||
          Math.abs(c2.valeurDecimale) > 6 ||
          c2.valeurDecimale === c1
        )
          continue
        const dedans = [c1, c2.valeurDecimale].filter(
          (x) => x >= a && x <= b,
        ).length
        if (dedans === 2) deuxRacines.push({ a, b, c1, c2 })
        else if (dedans === 1) uneRacine.push({ a, b, c1, c2 })
      }
  return [deuxRacines, uneRacine].filter((liste) => liste.length > 0)
}

const CANDIDATS_TRINOME = candidatsTrinome()

/** Écrit qπ pour un rationnel q : 0, \pi, -2\pi, \dfrac{3\pi}{2}… */
function piTex(q: FractionEtendue): string {
  const r = q.simplifie()
  if (r.valeurDecimale === 0) return '0'
  const signe = r.valeurDecimale < 0 ? '-' : ''
  const num = Math.abs(r.num)
  const den = Math.abs(r.den)
  const numerateur = `${num === 1 ? '' : num}\\pi`
  return den === 1
    ? `${signe}${numerateur}`
    : `${signe}\\dfrac{${numerateur}}{${den}}`
}

/**
 * Compare un ensemble fini de valeurs exactes pouvant contenir π, que le
 * comparateur `ensembleDeNombres` refuse : les éléments sont évalués puis triés.
 */
const compareEnsembleExact: CompareFunction = (saisie, attendu) => {
  const elements = (texte: string) => {
    const interieur = texte
      .replaceAll('\\left', '')
      .replaceAll('\\right', '')
      .replaceAll('\\lbrace', '\\{')
      .replaceAll('\\rbrace', '\\}')
      .trim()
      .replace(/^\\?\{/, '')
      .replace(/\\?\}$/, '')
      .trim()
    if (interieur === '') return []
    return interieur
      .split(';')
      .map((element) => Number(ce.parse(element).N().valueOf()))
      .sort((x, y) => x - y)
  }
  const recus = elements(saisie)
  const attendus = elements(attendu)
  if (recus.some((valeur) => !Number.isFinite(valeur)))
    return {
      isOk: false,
      feedback:
        'Chaque élément doit être une valeur exacte, séparée des autres par un point-virgule.',
    }
  return {
    isOk:
      recus.length === attendus.length &&
      recus.every((valeur, j) => Math.abs(valeur - attendus[j]) < 1e-9),
  }
}

/**
 * Refuse toute écriture décimale avant de comparer : les valeurs exactes sont
 * demandées, et une approximation comme 1,5707963268 ne doit pas valoir π/2.
 */
const sansDecimale =
  (compare: CompareFunction): CompareFunction =>
  (saisie, attendu, options) => {
    const decimale = noDecimal({
      feedbackKo: 'Donner la valeur exacte, sans écriture décimale.',
    }).run(saisie, attendu)
    return decimale.passed
      ? compare(saisie, attendu, options)
      : { isOk: false, feedback: decimale.feedbackKo ?? '' }
  }

/** @author Nathan Scheinmann */
export default class ValeurMoyenneIntegrale extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    // Mélanger les items tire au hasard les familles qui reçoivent les questions restantes.
    const familles = repartitionPonderee(
      shuffle(params.liste('familles')),
      this.nbQuestions,
      shuffle(params.declares('familles')),
    )
    const donnee = params.case('integraleDonnee')
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const famille = familles[i]
      // Partir de la moyenne cible ; I = (b - a)m sera donc rationnelle.
      const m = new FractionEtendue(
        randint(-6, 6, 0),
        randint(1, 4),
      ).simplifie()
      const k = randint(-3, 3, 0)
      let a = randint(-2, 2)
      let b = a + randint(2, 3)
      let fDe: (variable: string) => string
      let primitive: string
      let difference: string
      let resolution: string
      let solutions: string[]
      // Familles trigonométriques : bornes, longueur et intégrale s'écrivent avec π.
      let bornesTex: [string, string] | undefined
      let longueurTex: string | undefined
      let integraleAvecPi: string | undefined
      const moyenne = m.texFractionSimplifiee
      const kTex = new FractionEtendue(k, 1).texFractionSaufUn
      if (famille === 'affine' || famille === 'quadratique') {
        const trinome =
          famille === 'quadratique'
            ? choice(choice(CANDIDATS_TRINOME))
            : undefined
        let coeffs: FractionEtendue[]
        if (trinome) {
          // f(x) = m + coef(x - c1)(x - c2), où (x - c1)(x - c2) est de moyenne nulle sur [a ; b].
          a = trinome.a
          b = trinome.b
          const denominateur = Math.abs(trinome.c2.den)
          const coef = denominateur === 1 ? k : Math.sign(k) * denominateur
          coeffs = [
            m.sommeFraction(trinome.c2.multiplieEntier(coef * trinome.c1)),
            trinome.c2
              .sommeFraction(new FractionEtendue(trinome.c1, 1))
              .multiplieEntier(-coef),
            new FractionEtendue(coef, 1),
          ]
        } else {
          coeffs = [
            m.differenceFraction(new FractionEtendue(k * (a + b), 2)),
            new FractionEtendue(k, 1),
          ]
        }
        coeffs = coeffs.map((c) => c.simplifie())
        fDe = (variable) =>
          new Polynome({
            coeffs,
            useFraction: true,
            letter: variable,
          }).toLatex()
        primitive = new Polynome({ coeffs, useFraction: true })
          .primitive0()
          .toLatex()
        const coeffsPrimitive = [
          new FractionEtendue(0, 1),
          ...coeffs.map((c, j) =>
            c.diviseFraction(new FractionEtendue(j + 1, 1)),
          ),
        ]
        const primitiveEn = (x: number) =>
          coeffsPrimitive
            .reduce(
              (somme, c, j) => somme.sommeFraction(c.multiplieEntier(x ** j)),
              new FractionEtendue(0, 1),
            )
            .simplifie()
        difference = differenceTex(primitiveEn(b), primitiveEn(a))
        if (famille === 'affine') {
          const milieu = new FractionEtendue(a + b, 2).simplifie()
          solutions = [milieu.texFractionSimplifiee]
          resolution =
            `$${fDe('c')}=${moyenne}\\iff ${kTex}c=${new FractionEtendue(k * (a + b), 2).simplifie().texFractionSimplifiee}` +
            (k === 1 ? '' : `\\iff c=${milieu.texFractionSimplifiee}`) +
            `$. Cette valeur appartient à $[${a};${b}]$.`
        } else {
          const { c1, c2 } = trinome as CandidatTrinome
          const racines = [
            { valeur: c1, tex: String(c1) },
            { valeur: c2.valeurDecimale, tex: c2.texFractionSimplifiee },
          ].sort((p, q) => p.valeur - q.valeur)
          const dedans = racines.filter(
            (racine) => racine.valeur >= a && racine.valeur <= b,
          )
          solutions = dedans.map((racine) => racine.tex)
          const equation = new Polynome({
            coeffs: [
              coeffs[0].differenceFraction(m).simplifie(),
              coeffs[1],
              coeffs[2],
            ],
            useFraction: true,
            letter: 'c',
          }).toLatex()
          resolution =
            `$f(c)=${moyenne}\\iff ${equation}=0$. Les racines sont $${racines[0].tex}$ et $${racines[1].tex}$. ` +
            (dedans.length === 2
              ? `Les deux racines appartiennent à $[${a};${b}]$.`
              : `Seule la racine $${dedans[0].tex}$ appartient à $[${a};${b}]$.`)
        }
      } else if (famille === 'sin' || famille === 'cos') {
        // Une période du sinus ou une demi-période du cosinus : k·sin(x) ou k·cos(x) y est de moyenne nulle.
        // a et b désignent ici les multiples de π des bornes.
        const [debut, fin] =
          famille === 'sin'
            ? choice([
                [0, 2],
                [-1, 1],
              ])
            : choice([
                [0, 1],
                [1, 2],
              ])
        a = debut
        b = fin
        bornesTex = [
          piTex(new FractionEtendue(a, 1)),
          piTex(new FractionEtendue(b, 1)),
        ]
        longueurTex = piTex(new FractionEtendue(b - a, 1))
        integraleAvecPi = piTex(m.multiplieEntier(b - a))
        fDe = (variable) =>
          `${kTex}\\${famille}\\left(${variable}\\right)${m.signe > 0 ? '+' : ''}${moyenne}`
        const autre = famille === 'sin' ? 'cos' : 'sin'
        // Primitive : mx - k·cos(x) pour le sinus, mx + k·sin(x) pour le cosinus.
        const signePrimitive = (famille === 'sin') === k > 0 ? '-' : '+'
        const mx =
          m.valeurDecimale === 1
            ? 'x'
            : m.valeurDecimale === -1
              ? '-x'
              : `${m.texFractionSimplifiee}x`
        primitive = `${mx}${signePrimitive}${Math.abs(k) === 1 ? '' : Math.abs(k)}\\${autre}\\left(x\\right)`
        const valeurF = (n: number) => {
          const partiePi = piTex(m.multiplieEntier(n))
          if (famille === 'cos') return partiePi
          const constante = -k * (n % 2 === 0 ? 1 : -1)
          return partiePi === '0'
            ? String(constante)
            : `${partiePi}${ecritureAlgebrique(constante)}`
        }
        const entreParentheses = (texte: string) =>
          /^-|.[+-]/.test(texte) ? `\\left(${texte}\\right)` : texte
        difference = `${valeurF(b)}-${entreParentheses(valeurF(a))}`
        const intervalle = `[${bornesTex[0]};${bornesTex[1]}]`
        if (famille === 'sin') {
          solutions = [a, a + 1, b].map((n) => piTex(new FractionEtendue(n, 1)))
          resolution =
            `$${fDe('c')}=${moyenne}\\iff \\sin\\left(c\\right)=0$. ` +
            `Sur $${intervalle}$, les solutions sont $${solutions.join('$, $')}$.`
        } else {
          solutions = [piTex(new FractionEtendue(2 * a + 1, 2))]
          resolution =
            `$${fDe('c')}=${moyenne}\\iff \\cos\\left(c\\right)=0$. ` +
            `Sur $${intervalle}$, la seule solution est $c=${solutions[0]}$.`
        }
      } else if (famille === 'inverse') {
        a = randint(1, 3)
        b = a + randint(2, 3)
        const coefficient = m
          .produitFraction(new FractionEtendue(2 * a * a * b * b, a + b))
          .simplifie()
        const denominateur =
          coefficient.den === 1 ? '' : String(coefficient.den)
        fDe = (variable) =>
          `${coefficient.num < 0 ? '-' : ''}\\dfrac{${Math.abs(coefficient.num)}}{${denominateur}${variable}^3}`
        const coefPrimitive = coefficient
          .diviseFraction(new FractionEtendue(-2, 1))
          .simplifie()
        primitive = `${coefPrimitive.num < 0 ? '-' : ''}\\dfrac{${Math.abs(coefPrimitive.num)}}{${coefPrimitive.den === 1 ? '' : coefPrimitive.den}x^2}`
        difference = differenceTex(
          coefficient.diviseFraction(new FractionEtendue(-2 * b * b, 1)),
          coefficient.diviseFraction(new FractionEtendue(-2 * a * a, 1)),
        )
        const cube = coefficient.diviseFraction(m).simplifie()
        const racineCubique = texRacineCubique(cube)
        const racineBrute = `\\sqrt[3]{${cube.texFractionSimplifiee}}`
        solutions = [racineCubique]
        resolution =
          `$${fDe('c')}=${moyenne}\\iff c^3=${cube.texFractionSimplifiee}\\iff c=${racineBrute === racineCubique ? racineBrute : `${racineBrute}=${racineCubique.replaceAll('\\frac', '\\dfrac')}`}$. ` +
          `Cette valeur appartient à $[${a};${b}]$.`
      } else {
        // Imposer des carrés parfaits aux bornes évite les valeurs moyennes irrationnelles.
        const gauche = randint(1, 3)
        // √u passe de gauche à gauche + 2 sur [a ; a + 2] : la pente (d² - g²)/2 reste entière.
        const droite = gauche + 2
        b = a + 2
        const pente = (droite * droite - gauche * gauche) / 2
        const decalage = gauche * gauche - pente * a
        const uDe = (variable: string) =>
          reduireAxPlusB(pente, decalage, variable)
        const coefficient = m
          .produitFraction(new FractionEtendue(gauche + droite, 2))
          .simplifie()
        const coefPrimitive = coefficient
          .produitFraction(new FractionEtendue(2, pente))
          .simplifie()
        const denominateur =
          coefficient.den === 1 ? '' : String(coefficient.den)
        const signe = coefficient.num < 0 ? '-' : ''
        const numerateur = Math.abs(coefficient.num)
        fDe = (variable) =>
          `${signe}\\dfrac{${numerateur}}{${denominateur}\\sqrt{${uDe(variable)}}}`
        primitive = `${coefPrimitive.texFractionSaufUn}\\sqrt{${uDe('x')}}`
        difference = differenceTex(
          coefPrimitive.multiplieEntier(droite),
          coefPrimitive.multiplieEntier(gauche),
        )
        const racine = new FractionEtendue(gauche + droite, 2).simplifie()
        const racineTex = racine.texFractionSimplifiee
        const c = racine
          .puissanceFraction(2)
          .differenceFraction(new FractionEtendue(decalage, 1))
          .diviseFraction(new FractionEtendue(pente, 1))
          .simplifie()
        const cTex = c.texFractionSimplifiee
        solutions = [cTex]
        const radicande = racine
          .puissanceFraction(2)
          .simplifie().texFractionSimplifiee
        resolution =
          `$${fDe('c')}=${moyenne}\\iff \\sqrt{${uDe('c')}}=${racineTex}$. ` +
          `Comme $${racineTex}>0$, cela équivaut à $${uDe('c')}=${radicande}$, d'où $c=${cTex}$. Cette valeur appartient à $[${a};${b}]$.`
      }
      const f = fDe('x')
      const aTex = bornesTex?.[0] ?? String(a)
      const bTex = bornesTex?.[1] ?? String(b)
      const integrale =
        integraleAvecPi ?? m.multiplieEntier(b - a).texFractionSimplifiee
      if (!this.questionJamaisPosee(i, f, aTex, bTex)) continue
      const ensemble = `\\left\\{${solutions.join(';')}\\right\\}`.replaceAll(
        '\\frac',
        '\\dfrac',
      )
      const integraleTex = `I=\\displaystyle\\int_{${aTex}}^{${bTex}}f(x)\\,\\mathrm{d}x`
      const sousQuestions = [
        ...(donnee
          ? []
          : [
              {
                consigne: `Calculer la valeur de $${integraleTex}$.`,
                nom: 'I',
                valeur: integrale,
                ensembleDeNombres: false,
              },
            ]),
        {
          consigne: `Déterminer la valeur moyenne $m$ de $f$ sur $[${aTex};${bTex}]$.`,
          nom: 'm',
          valeur: moyenne,
          ensembleDeNombres: false,
        },
        {
          consigne: `Déterminer l'ensemble $C$ des nombres $c\\in[${aTex};${bTex}]$ tels que $f(c)=m$.`,
          nom: 'C',
          valeur: ensemble,
          ensembleDeNombres: true,
        },
      ]
      const enonce =
        `Soit $f\\colon[${aTex};${bTex}]\\to\\mathbb{R}$ la fonction définie par $f(x)=${f}$.` +
        (donnee ? `<br>On donne $${integraleTex}=${integrale}$.` : '')
      let texte = `${enonce} On attend pour chaque réponse une valeur exacte.<br><br>`
      const reponses: Valeur = {}
      if (this.interactif) {
        const dataOptions: DataOptionsMultiMathfield = {}
        const lignes = sousQuestions.map((sousQuestion, j) => {
          dataOptions[`field${j}` as 'field0'] = {
            keyboard: bornesTex
              ? KeyboardType.clavierEnsembleAvecPi
              : KeyboardType.clavierFonctionsTerminales,
            minWidth: 100,
          }
          return `${String.fromCharCode(97 + j)}) ${sousQuestion.consigne}\n$${sousQuestion.nom}=$ %{field${j}}`
        })
        texte += addMultiMathfield(this, i, {
          dataTemplate: lignes.join('\n\n'),
          dataOptions,
        })
      } else {
        texte += sousQuestions
          .map((sousQuestion, j) => numAlpha(j) + sousQuestion.consigne)
          .join('<br>')
      }
      sousQuestions.forEach((sousQuestion, j) => {
        // Valeurs exactes exigées pour l'intégrale avec π et pour l'ensemble C.
        reponses[`field${j}` as 'field0'] = !sousQuestion.ensembleDeNombres
          ? sousQuestion.nom === 'I' && bornesTex
            ? {
                value: sousQuestion.valeur,
                compare: sansDecimale(fonctionComparaison),
              }
            : { value: sousQuestion.valeur }
          : bornesTex
            ? {
                value: sousQuestion.valeur,
                compare: sansDecimale(compareEnsembleExact),
              }
            : {
                value: sousQuestion.valeur,
                options: { ensembleDeNombres: true },
                compare: sansDecimale(fonctionComparaison),
              }
      })
      handleAnswers(this, i, reponses, { formatInteractif: 'multi-mathfield' })
      this.listeQuestions[i] = texte
      let rang = 0
      let correction = ''
      if (!donnee) {
        correction +=
          `${numAlpha(rang++)}La fonction $F(x)=${primitive}$ est une primitive de $f$ sur l'intervalle $[${aTex};${bTex}]$.<br>` +
          `$I=\\left[${primitive}\\right]_{${aTex}}^{${bTex}}=F(${bTex})-F(${aTex})=${difference}=${miseEnEvidence(integrale)}$.<br>`
      }
      correction +=
        `${numAlpha(rang++)}La valeur moyenne de $f$ sur $[${aTex};${bTex}]$ est $m=\\dfrac{I}{b-a}=\\dfrac{${integrale}}{${longueurTex ?? `${bTex}-${ecritureParentheseSiNegatif(a)}`}}=${miseEnEvidence(moyenne)}$.<br>` +
        `${numAlpha(rang)}La fonction $f$ est continue sur $[${aTex};${bTex}]$, donc le théorème de la moyenne garantit l'existence d'au moins un $c\\in[${aTex};${bTex}]$ tel que $f(c)=m$.<br>` +
        resolution +
        `<br>Ainsi, $C=${miseEnEvidence(ensemble)}$.`
      this.listeCorrections[i] = correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
