import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '29/09/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '84689'

export const refs = {
  'fr-fr': ['1A-C04-4', '2A-N4-4'],
  'fr-ch': ['9R1NO4I-1', '9R2NO4I-1', '9R3NO4I-1'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Calculer avec tiers, quart, demi, …'

/**
 *
 * @author Gilles Mora
 *
 */

// [fraction d'un autre nombre, numérateur p, dénominateur q, fraction de r, r]
const situations: [string, number, number, string, number][] = [
  ['Le tiers', 1, 3, "d'un quart", 4],
  ['Le tiers', 1, 3, "d'un demi", 2],
  ['La moitié', 1, 2, "d'un tiers", 3],
  ['La moitié', 1, 2, "d'un quart", 4],
  ['Le cinquième', 1, 5, "d'un tiers", 3],
  ['Le cinquième', 1, 5, "d'un quart", 4],
  ['La moitié', 1, 2, "d'un cinquième", 5],
  ['Le quart', 1, 4, "d'un tiers", 3],
  ['Le sixième', 1, 6, "d'un demi", 2],
  ['Le tiers', 1, 3, "d'un sixième", 6],
  ['Le quart', 1, 4, "d'un cinquième", 5],
  ['Le huitième', 1, 8, "d'un demi", 2],
  ['Le dixième', 1, 10, "d'un tiers", 3],
  ['Le septième', 1, 7, "d'un quart", 4],
  ['Le neuvième', 1, 9, "d'un demi", 2],
  ['Le cinquième', 1, 5, "d'un sixième", 6],
  ['Les deux tiers', 2, 3, "d'un quart", 4],
  ['Les trois quarts', 3, 4, "d'un demi", 2],
  ['Les deux cinquièmes', 2, 5, "d'un tiers", 3],
  ['Les deux cinquièmes', 2, 5, "d'un quart", 4],
  ['Les trois cinquièmes', 3, 5, "d'un demi", 2],
  ['Les quatre cinquièmes', 4, 5, "d'un tiers", 3],
  ['Les trois quarts', 3, 4, "d'un cinquième", 5],
  ['Les cinq sixièmes', 5, 6, "d'un quart", 4],
  ['Les deux tiers', 2, 3, "d'un cinquième", 5],
  ['Les trois septièmes', 3, 7, "d'un demi", 2],
]

export default class AutoC4c extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut traduire une expression du type "une fraction d'une fraction".
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Repérer les deux fractions mentionnées dans l'énoncé.</li>
    <li>Comprendre que "de" ou "d'un" peut se traduire par une multiplication.</li>
  </ul>`
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const [debut, p, q, fin, r] = this.quotaChoice('situation', situations)
    const pluriel = p > 1
    const fractionP = `\\dfrac{${p}}{${q}}`
    const fractionR = `\\dfrac{1}{${r}}`
    const produit = new FractionEtendue(p, q * r).simplifie()
    const simplifiee = produit.texFraction
    const dfrac = (num: number, den: number) => `\\dfrac{${num}}{${den}}`

    this.correction = `${debut} ${fin} correspond${pluriel ? 'ent' : ''} à $${fractionP}\\times ${fractionR}$, soit $${
      simplifiee === dfrac(p, q * r)
        ? miseEnEvidence(simplifiee)
        : `${dfrac(p, q * r)} = ${miseEnEvidence(simplifiee)}`
    }$.`

    if (this.versionQcm) {
      this.question = `${debut} ${fin} correspond${pluriel ? 'ent' : ''} à la fraction : `
      this.reponse = `$${simplifiee}$`
      this.distracteurs = [
        dfrac(p, q + r),
        dfrac(q, p * r),
        dfrac(p * r, q),
        dfrac(q + r, p),
        dfrac(p + 1, q + r),
      ].map((d) => `$${d}$`)
    } else {
      this.question = `Écrire ${debut.charAt(0).toLowerCase()}${debut.slice(1)} ${fin} sous la forme d'une fraction irréductible.`
      this.reponse = produit
    }
  }
}
