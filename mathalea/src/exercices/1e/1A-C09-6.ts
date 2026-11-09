import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import {
  doubleDeveloppement,
  ecritureParentheseSiMoins,
  enumeration,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '02/09/2025'
export const uuid = 'b0831'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C09-6', '2A-C2-7'],
  'fr-ch': ['1mQCM-17', '11LSFA3H-7', '11LSQCMFA4-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Factoriser une expression algébrique'

/** Les coefficients $a$ et $b$ d'un facteur du premier degré $ax+b$. */
type Facteur = [a: number, b: number]

/** Le nom de chaque coefficient d'un trinôme, indexé par son degré. */
const nomDuCoefficient = [
  'le terme constant',
  'le coefficient de $x$',
  'le coefficient de $x^2$',
]

/** Le polynôme $ax+b$ (Polynome attend ses coefficients par degré croissant). */
function polynome([a, b]: Facteur): Polynome {
  return new Polynome({ coeffs: [b, a] })
}

/** L'écriture LaTeX du produit de deux facteurs du premier degré. */
function ecritureProduit([a1, b1]: Facteur, [a2, b2]: Facteur): string {
  return `\\left(${reduireAxPlusB(a1, b1)}\\right)\\left(${reduireAxPlusB(a2, b2)}\\right)`
}

/**
 * L'explication d'une proposition dont les deux facteurs sont à coefficients entiers :
 * on développe, on réduit, puis on compare les coefficients obtenus à ceux de l'énoncé.
 * La bonne réponse est mise en évidence, les autres sont éliminées en nommant
 * précisément le (ou les) coefficient(s) qui ne conviennent pas.
 */
function expliqueProduit(f1: Facteur, f2: Facteur, cible: Polynome): string {
  const [a, b] = f1
  const [c, d] = f2
  const produit = ecritureProduit(f1, f2)
  const obtenu = polynome(f1).multiply(polynome(f2))
  const calcul = `$\\begin{aligned}
    ${produit}&=${doubleDeveloppement({ a, b, c, d, reduire: true })[2]}\\\\
    &=${obtenu.toLatex()}.
  \\end{aligned}$`

  // Du degré le plus haut au plus bas, comme le trinôme s'écrit.
  const ecarts = [2, 1, 0].filter(
    (degre) => Number(obtenu.monomes[degre]) !== Number(cible.monomes[degre]),
  )
  if (ecarts.length === 0) {
    return `$${miseEnEvidence(produit)}$ :<br>${calcul}<br>
    On retrouve exactement l'expression de l'énoncé : c'est donc la bonne réponse.`
  }
  const details = ecarts.map(
    (degre) =>
      `${nomDuCoefficient[degre]} vaut $${obtenu.monomes[degre]}$ au lieu de $${cible.monomes[degre]}$`,
  )
  return `$${produit}$ :<br>${calcul}<br>
  Ici, ${enumeration(details)} : cette expression n'est donc pas égale à celle de l'énoncé.`
}

/**
 * L'explication du distracteur obtenu en rendant le premier facteur unitaire :
 * il est inutile de le développer, son coefficient de $x^2$ suffit à l'éliminer.
 */
function expliqueFacteurUnitaire(
  produit: string,
  a2: number,
  cible: Polynome,
): string {
  return `$${produit}$ : inutile de tout développer, le terme en $x^2$ suffit.<br>
  Il s'obtient en multipliant les termes en $x$ des deux facteurs, soit
  $x\\times ${ecritureParentheseSiMoins(rienSi1(a2) + 'x')}=${rienSi1(a2)}x^2$,
  alors que l'énoncé commence par $${rienSi1(Number(cible.monomes[2]))}x^2$ : cette expression
  n'est donc pas égale à celle de l'énoncé.`
}

export default class Puissances extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    const cible = polynome([2, 1]).multiply(polynome([1, -3]))
    const facteurUnitaire = '\\left(x+\\dfrac12\\right)\\left(x-3\\right)'
    this.enonce = `À quelle expression est égale $${cible.toLatex()}$ ?`

    this.reponses = [
      `$${ecritureProduit([2, 1], [1, -3])}$`,
      `$${ecritureProduit([2, -1], [1, 3])}$`,
      `$${facteurUnitaire}$`,
      `$${ecritureProduit([2, 1], [1, 3])}$`,
    ]
    this.corrections = [
      expliqueProduit([2, 1], [1, -3], cible),
      expliqueProduit([2, -1], [1, 3], cible),
      expliqueFacteurUnitaire(facteurUnitaire, 1, cible),
      expliqueProduit([2, 1], [1, 3], cible),
    ]
    this.correction = ''
  }

  versionAleatoire = () => {
    let compteur = 0 // un compteur pour éviter les boucles infinies si le qcm est vraiment problématique
    do {
      let a1, a2, b1, b2
      do {
        // a1 ≠ 1, sans quoi le dernier distracteur serait la bonne réponse
        // et son explication (le coefficient de x² diffère) n'aurait plus de sens.
        a1 = randint(-4, 4, [0, 1])
        b1 = randint(-4, 4, 0)
        a2 = randint(-4, 4, [0, a1, -a1])
        b2 = randint(-4, 4, [0, b1, -b1])
      } while (a1 * b2 + a2 * b1 === 0)
      const distracteur = new FractionEtendue(b1, a1)
      // Le premier facteur rendu unitaire : c'est l'expression de l'énoncé divisée par a1.
      const facteurUnitaire = `\\left(x${distracteur.simplifie().ecritureAlgebrique}\\right)\\left(${reduireAxPlusB(a2, b2)}\\right)`
      const cible = polynome([a1, b1]).multiply(polynome([a2, b2]))
      this.enonce = `À quelle expression est égale $${cible.toLatex()}$ ?`

      this.reponses = [
        `$${ecritureProduit([a1, b1], [a2, b2])}$`,
        `$${ecritureProduit([a1, -b1], [a2, b2])}$`,
        `$${ecritureProduit([a1, -b1], [a2, -b2])}$`,
        `$${facteurUnitaire}$`,
      ]
      this.corrections = [
        expliqueProduit([a1, b1], [a2, b2], cible),
        expliqueProduit([a1, -b1], [a2, b2], cible),
        expliqueProduit([a1, -b1], [a2, -b2], cible),
        expliqueFacteurUnitaire(facteurUnitaire, a2, cible),
      ]
      this.correction = ''
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
    // Ici, on doit avoir une bonne réponse et 3 distracteurs distincts.
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
