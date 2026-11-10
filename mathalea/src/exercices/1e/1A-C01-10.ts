import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd, ppcm } from '../../lib/outils/primalite'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const uuid = '7b848'
export const refs = {
  'fr-fr': ['1A-C01-10'],
  'fr-ch': [],
}
export const interactifReady = true
export const interactifType = 'mathLive'

export const titre = 'Comparer un calcul avec des fractions et un nombre'
export const dateDePublication = '30/10/2026'

/** Un nombre écrit sous forme de calcul, avec les étapes qui mènent à sa fraction irréductible */
type Calcul = {
  tex: string
  etapes: string[]
  num: number
  den: number
  /**
   * Bornes qui se lisent sans calculer (par exemple 2/5+1/2 > 1/2 ou 1-(3/4)² < 1) :
   * un nombre situé hors de ]minorant ; majorant[ se compare au calcul sans le faire.
   */
  minorant: number
  majorant: number
}

const typesDeCalculs = [
  'somme',
  'difference',
  'produitEntier',
  'produit',
  'carre',
  'unPlusCarre',
  'unMoinsCarre',
] as const
type TypeDeCalcul = (typeof typesDeCalculs)[number]

function texFrac(num: number, den: number): string {
  return den === 1 ? `${num}` : `\\dfrac{${num}}{${den}}`
}

/** Fraction irréductible num/den avec den entre denMin et denMax et num < den si propre */
function fractionAuHasard(
  denMin: number,
  denMax: number,
  propre = true,
): [number, number] {
  let num: number
  let den: number
  do {
    den = randint(denMin, denMax)
    num = propre ? randint(1, den - 1) : randint(1, den + 2, den)
  } while (pgcd(num, den) !== 1)
  return [num, den]
}

/** Ajoute l'étape de simplification si la fraction num/den n'est pas irréductible */
function finirCalcul(
  tex: string,
  etapes: string[],
  num: number,
  den: number,
  minorants: number[],
  majorants: number[],
): Calcul {
  const g = pgcd(num, den)
  if (g !== 1) etapes.push(texFrac(num / g, den / g))
  return {
    tex,
    etapes,
    num: num / g,
    den: den / g,
    minorant: Math.max(-Infinity, ...minorants),
    majorant: Math.min(Infinity, ...majorants),
  }
}

function sommeOuDifference(somme: boolean): Calcul {
  let a, b, c, d: number
  do {
    ;[a, b] = fractionAuHasard(2, 6)
    ;[c, d] = fractionAuHasard(2, 6)
  } while (b === d || ppcm(b, d) > 24 || (!somme && a * d <= c * b))
  const L = ppcm(b, d)
  const signe = somme ? '+' : '-'
  const num = somme ? (a * L) / b + (c * L) / d : (a * L) / b - (c * L) / d
  const etapes: string[] = []
  if (b !== L)
    etapes.push(
      `\\dfrac{${(a * L) / b}}{${L}}${signe}${d === L ? texFrac(c, d) : `\\dfrac{${(c * L) / d}}{${L}}`}`,
    )
  else etapes.push(`${texFrac(a, b)}${signe}\\dfrac{${(c * L) / d}}{${L}}`)
  etapes.push(texFrac(num, L))
  return finirCalcul(
    `${texFrac(a, b)}${signe}${texFrac(c, d)}`,
    etapes,
    num,
    L,
    // Somme de deux fractions plus petites que 1 : plus grande que chacune, plus petite que 2.
    // Différence : plus petite que le premier terme.
    somme ? [a / b, c / d] : [],
    somme ? [2] : [a / b],
  )
}

function calculAuHasard(type: TypeDeCalcul): Calcul {
  switch (type) {
    case 'somme':
      return sommeOuDifference(true)
    case 'difference':
      return sommeOuDifference(false)
    case 'produitEntier': {
      const [a, b] = fractionAuHasard(2, 7)
      const n = randint(2, 5, [b])
      // n × a/b avec a/b < 1 : compris entre a/b et n
      return finirCalcul(
        `${n}\\times${texFrac(a, b)}`,
        [`\\dfrac{${n}\\times${a}}{${b}}`, texFrac(n * a, b)],
        n * a,
        b,
        [a / b],
        [n],
      )
    }
    case 'produit': {
      let a, b, c, d: number
      do {
        ;[a, b] = fractionAuHasard(2, 6, false)
        ;[c, d] = fractionAuHasard(2, 6, false)
      } while (b === d)
      // Multiplier par un nombre plus petit (plus grand) que 1 diminue (augmente)
      const minorants: number[] = []
      const majorants: number[] = []
      for (const [f, g] of [
        [a / b, c / d],
        [c / d, a / b],
      ])
        (g < 1 ? majorants : minorants).push(f)
      return finirCalcul(
        `${texFrac(a, b)}\\times${texFrac(c, d)}`,
        [`\\dfrac{${a}\\times${c}}{${b}\\times${d}}`, texFrac(a * c, b * d)],
        a * c,
        b * d,
        minorants,
        majorants,
      )
    }
    case 'carre': {
      const [a, b] = fractionAuHasard(2, 5, false)
      // (a/b)² est plus petit que a/b si a/b < 1, plus grand sinon
      return finirCalcul(
        `\\left(${texFrac(a, b)}\\right)^2`,
        [`\\dfrac{${a}^2}{${b}^2}`, texFrac(a * a, b * b)],
        a * a,
        b * b,
        a < b ? [] : [a / b],
        a < b ? [a / b] : [],
      )
    }
    case 'unPlusCarre':
    case 'unMoinsCarre': {
      const [a, b] = fractionAuHasard(2, 4)
      const plus = type === 'unPlusCarre'
      const num = plus ? b * b + a * a : b * b - a * a
      // 1+x² est entre 1 et 2, 1-x² est plus petit que 1 (x < 1)
      return finirCalcul(
        `1${plus ? '+' : '-'}\\left(${texFrac(a, b)}\\right)^2`,
        [
          `1${plus ? '+' : '-'}${texFrac(a * a, b * b)}`,
          `\\dfrac{${b * b}}{${b * b}}${plus ? '+' : '-'}${texFrac(a * a, b * b)}`,
          texFrac(num, b * b),
        ],
        num,
        b * b,
        plus ? [1] : [],
        plus ? [2] : [1],
      )
    }
  }
}

/** Vrai si x ne se compare pas au calcul sans le faire */
function nonEvident(calcul: Calcul, x: number): boolean {
  return x > calcul.minorant + 1e-9 && x < calcul.majorant - 1e-9
}

/**
 * Nombre simple (entier ou fraction) proche de la valeur du calcul et qui ne se compare pas
 * à lui sans calculer (face à 1-(1/2)² ou 2×6/7, les nombres 1 et 2 sont exclus).
 * Renvoie undefined si aucun nombre ne convient.
 */
function nombreProche(calcul: Calcul): Calcul | undefined {
  const valeur = calcul.num / calcul.den
  const entier = Math.round(valeur)
  if (entier >= 1 && nonEvident(calcul, entier) && choice([true, false])) {
    return {
      tex: `${entier}`,
      etapes: [],
      num: entier,
      den: 1,
      minorant: -Infinity,
      majorant: Infinity,
    }
  }
  for (let essai = 0; essai < 50; essai++) {
    const q = randint(2, 6, [calcul.den])
    const p = Math.max(1, Math.round(valeur * q) + randint(-1, 1))
    if (
      pgcd(p, q) === 1 &&
      p % q !== 0 &&
      ppcm(q, calcul.den) <= 60 &&
      nonEvident(calcul, p / q)
    )
      return {
        tex: texFrac(p, q),
        etapes: [],
        num: p,
        den: q,
        minorant: -Infinity,
        majorant: Infinity,
      }
  }
  return undefined
}

/**
 * Comparer un calcul avec des fractions (somme, produit, petite puissance) et un nombre.
 * 1A-C01-11 hérite de cette classe pour comparer deux calculs.
 * @author Gilles Mora
 */
export default class ComparerCalculsFractions extends ExerciceSimple {
  /** true : deux calculs (1A-C01-11) ; false : un calcul et un nombre */
  protected deuxCalculs = false

  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 2
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    let gauche: Calcul
    let droite: Calcul
    if (!this.deuxCalculs) {
      let calcul: Calcul
      let nombre: Calcul | undefined
      do {
        calcul = calculAuHasard(choice([...typesDeCalculs]))
        nombre = nombreProche(calcul)
      } while (nombre == null)
      ;[gauche, droite] = choice([true, false])
        ? [calcul, nombre]
        : [nombre, calcul]
    } else {
      // Deux calculs de types différents, de valeurs proches, qui ne se comparent pas
      // sans calculer (1+x² face à 1-y², par exemple, est écarté par nonEvident)
      do {
        const [type1, type2] = shuffle([...typesDeCalculs])
        gauche = calculAuHasard(type1)
        droite = calculAuHasard(type2)
      } while (
        Math.abs(gauche.num / gauche.den - droite.num / droite.den) >= 0.5 ||
        !nonEvident(gauche, droite.num / droite.den) ||
        !nonEvident(droite, gauche.num / gauche.den) ||
        ppcm(gauche.den, droite.den) > 48
      )
    }

    const produitG = gauche.num * droite.den
    const produitD = droite.num * gauche.den
    const symbole = produitG < produitD ? '<' : produitG > produitD ? '>' : '='

    // Correction : calcul de chaque nombre, puis comparaison au même dénominateur
    const lignesCalcul = [gauche, droite]
      .filter((c) => c.etapes.length > 0)
      .map((c) => `$${[c.tex, ...c.etapes].join('=')}$`)
    const fracG = texFrac(gauche.num, gauche.den)
    const fracD = texFrac(droite.num, droite.den)
    const L = ppcm(gauche.den, droite.den)
    const NG = (gauche.num * L) / gauche.den
    const ND = (droite.num * L) / droite.den
    let comparaison: string
    if (gauche.den === droite.den) {
      comparaison = `Les deux nombres ont le même dénominateur et $${NG} ${symbole} ${ND}$, donc $${fracG} ${symbole} ${fracD}$.`
    } else {
      const reecriture = [
        [fracG, gauche.den, NG],
        [fracD, droite.den, ND],
      ]
        .filter(([, den]) => den !== L)
        .map(([frac, , num]) => `$${frac}=\\dfrac{${num}}{${L}}$`)
        .join(' et ')
      comparaison = `On écrit les deux nombres avec le même dénominateur $${L}$ : ${reecriture}.<br>
      Comme $${NG} ${symbole} ${ND}$, on a $\\dfrac{${NG}}{${L}} ${symbole} \\dfrac{${ND}}{${L}}$.`
    }
    this.correction = `${lignesCalcul.length > 1 ? 'On calcule chacun des deux nombres :' : 'On calcule :'}<br>
    ${lignesCalcul.join('<br>')}<br>
    ${comparaison}<br>
    Ainsi, $${gauche.tex}\\;${miseEnEvidence(symbole)}\\;${droite.tex}$.`

    // En interactif, les deux membres entourent le champ de réponse
    this.consigne = this.interactif
      ? 'Compléter avec le symbole $<$, $>$ ou $=$.'
      : ''
    this.question = this.interactif
      ? ''
      : `Comparer les nombres suivants : $${gauche.tex}$ et $${droite.tex}$.`
    this.optionsChampTexte = {
      texteAvant: `$${gauche.tex}$`,
      texteApres: `$${droite.tex}$`,
      dataKeys: ['<', '>', '='],
    }
    this.optionsDeComparaison = { texteSansCasse: true }
    this.reponse = symbole
  }
}
