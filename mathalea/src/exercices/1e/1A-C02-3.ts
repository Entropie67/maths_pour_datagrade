import { ComputeEngine } from '@cortex-js/compute-engine'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import {
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import type { CompareFunction } from '../../lib/types'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '10/08/2025'
export const dateDeModifImportante = '03/10/2026'
export const uuid = '78fde'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C02-3', '2A-N2-3'],
  'fr-ch': ['1mQCM-13'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Écrire des expressions rationnelles au même dénominateur'

const ce = new ComputeEngine()

type Noeud = unknown
const estNombre = (e: Noeud): boolean =>
  typeof e === 'number' ||
  (Array.isArray(e) && e[0] === 'Negate' && typeof e[1] === 'number')
// Enlève les parenthèses et les signes moins placés devant l'expression
const sansDelimiteur = (e: Noeud): Noeud =>
  Array.isArray(e) && e[0] === 'Delimiter' ? sansDelimiteur(e[1]) : e
const sansSigne = (e: Noeud): Noeud => {
  const f = sansDelimiteur(e)
  return Array.isArray(f) && f[0] === 'Negate' ? sansSigne(f[1]) : f
}
// Nature d'un terme : un nombre, un terme en x (kx) ou autre chose
const nature = (e: Noeud): 'nombre' | 'x' | 'autre' => {
  const f = sansSigne(e)
  if (estNombre(f)) return 'nombre'
  if (f === 'x') return 'x'
  if (
    Array.isArray(f) &&
    (f[0] === 'InvisibleOperator' || f[0] === 'Multiply') &&
    f.length === 3
  ) {
    const facteurs = f.slice(1).map(sansSigne)
    if (facteurs.filter((g) => g === 'x').length === 1)
      return facteurs.every((g) => g === 'x' || estNombre(g)) ? 'x' : 'autre'
  }
  return 'autre'
}
// Liste des termes d'une somme
const termes = (e: Noeud): Noeud[] => {
  const f = sansDelimiteur(e)
  if (Array.isArray(f) && (f[0] === 'Add' || f[0] === 'Subtract'))
    return f.slice(1).flatMap(termes)
  if (Array.isArray(f) && f[0] === 'Negate') {
    const g = sansDelimiteur(f[1])
    if (Array.isArray(g) && (g[0] === 'Add' || g[0] === 'Subtract'))
      return termes(g)
  }
  return [f]
}

/**
 * La saisie doit être égale à la réponse et écrite sous la forme d'un seul
 * quotient (ax+b)/(cx), le signe moins pouvant être placé n'importe où.
 */
const unSeulQuotient: CompareFunction = (saisie, reponse) => {
  const quotient = sansSigne(ce.parse(saisie, { canonical: false }).json)
  if (!Array.isArray(quotient) || quotient[0] !== 'Divide') {
    return {
      isOk: false,
      feedback:
        "L'expression doit être écrite sous la forme d'un seul quotient.",
    }
  }
  const natures = termes(quotient[1]).map(nature)
  const numerateurReduit =
    natures.every((n) => n !== 'autre') &&
    natures.filter((n) => n === 'x').length <= 1 &&
    natures.filter((n) => n === 'nombre').length <= 1
  const denominateur = termes(quotient[2])
  if (
    !numerateurReduit ||
    denominateur.length !== 1 ||
    nature(denominateur[0]) !== 'x'
  ) {
    return {
      isOk: false,
      feedback:
        'La fraction doit être de la forme $\\dfrac{ax+b}{cx}$, avec un numérateur réduit.',
    }
  }
  return fonctionComparaison(saisie, reponse, { fonction: true })
}

export default class Puissances extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut simplifier cette expression algébrique.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Effectuer au brouillon le même genre de calcul avec des nombres si les expressions littérales gênent.</li>
    <li>Identifier la stratégie sur ce calcul plus simple.</li>
    <li>Appliquer ensuite la même méthode à l'expression algébrique.</li>
  </ul>`
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const n = randint(2, 8)
    const a = randint(2, 7)
    const b = randint(2, 5)
    const expression = `\\dfrac{1}{${n}}-\\dfrac{${reduireAxPlusB(a, b)}}{x}`
    // a × n - 1 et b × n sont toujours positifs : le numérateur obtenu est négatif
    const resultat = `\\dfrac{${-a * n + 1}x-${b * n}}{${n}x}`
    const resultatOppose = `-\\dfrac{${a * n - 1}x+${b * n}}{${n}x}`

    this.correction = `On met l'expression au même dénominateur : <br>$\\begin{aligned}
        ${expression}&=\\dfrac{x-${n}\\times \\left(${reduireAxPlusB(a, b)}\\right)}{${n}x}\\\\
        &=\\dfrac{x ${ecritureAlgebriqueSauf1(-a * n)}x ${ecritureAlgebriqueSauf1(-b * n)}}{${n}x}\\\\
        &=${this.versionQcm ? resultat : miseEnEvidence(resultat)}
     \\end{aligned}$`

    if (this.versionQcm) {
      this.consigne = ''
      this.compare = undefined
      this.question = `Soit $x$ un réel non nul.<br>À quelle expression est égale $${expression}$ ?`
      this.correction += `<br>On a aussi $${resultat}=${miseEnEvidence(resultatOppose)}$.`
      this.reponse = `$${resultatOppose}$`
      this.distracteurs = [
        `$\\dfrac{${a * n - 1}x+${b * n}}{${n}x}$`,
        `$\\dfrac{${-a * n + 1}x+${b * n}}{${n}x}$`,
        `$-\\dfrac{${a * n + 1}x+${b * n}}{${n}x}$`,
      ]
    } else {
      this.consigne = ''
      this.question = `Soit $x$ un réel non nul.<br>Écrire $${expression}$ sous la forme d'un quotient dont le numérateur et le dénominateur sont simplifiés.<br>`
      this.optionsChampTexte = { texteAvant: `<br>$${expression}=$` }
      this.compare = unSeulQuotient
      this.reponse = resultat
    }
  }
}
