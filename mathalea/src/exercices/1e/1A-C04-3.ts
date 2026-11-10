import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '29/09/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '159be'

export const refs = {
  'fr-fr': ['1A-C04-3', '2A-N4-3'],
  'fr-ch': ['10CTQCMNO-3', '10LCQCMNO-4', '10LSQCMNO-5'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Calculer avec inverse, double, carré, …'

/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC4b extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.versionQcmDisponible = true
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut traduire précisément l'énoncé en calcul.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Identifier les mots clés : inverse, double, moitié, carré.</li>
    <li>Respecter l'ordre des mots : "l'inverse du double" et "le double de l'inverse" ne veulent pas dire la même chose.</li>
    <li>Traduire l'expression étape par étape au brouillon.</li>
    <li>Tester les propositions par essais et erreurs si la traduction reste difficile.</li>
  </ul>`
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const dfrac = (num: number, den: number) => `\\dfrac{${num}}{${den}}`
    let enonce = ''
    let correction = ''
    let num: number // la réponse est num/den
    let den: number
    let distracteurs: string[]

    switch (this.quotaRandint('cas', 1, 7)) {
      case 1: {
        const a = 2 * randint(2, 10) + 1
        enonce = `L'inverse du double de $${a}$`
        correction = `Le double de $${a}$ est $${2 * a}$. <br>
    L'inverse de $${2 * a}$ est $${dfrac(1, 2 * a)}$.<br>
    L'inverse du double de $${a}$ est donc égal à `
        ;[num, den] = [1, 2 * a]
        distracteurs = [`${2 * a}`, dfrac(2, a), dfrac(a, 2)]
        break
      }
      case 2: {
        const a = 2 * randint(2, 10) + 1
        enonce = `Le double de l'inverse de $${a}$`
        correction = `L'inverse de $${a}$ est $${dfrac(1, a)}$. <br>
    Le double de $${dfrac(1, a)}$ est $${dfrac(2, a)}$.<br>
    Le double de l'inverse de $${a}$ est égal à `
        ;[num, den] = [2, a]
        distracteurs = [`${2 * a}`, dfrac(1, 2 * a), dfrac(a, 2)]
        break
      }
      case 3: {
        const a = randint(3, 10)
        enonce = `L'inverse du carré de $${a}$`
        correction = `Le carré de $${a}$ est $${a}^2 = ${a * a}$. <br>
    L'inverse de $${a * a}$ est $${dfrac(1, a * a)}$.<br>
    L'inverse du carré de $${a}$ est donc égal à `
        ;[num, den] = [1, a * a]
        distracteurs = [`${a * a}`, dfrac(1, 2 * a), dfrac(2, a * a)]
        break
      }
      case 4: {
        const a = randint(2, 8)
        enonce = `Le double du carré de $${a}$`
        correction = `Le carré de $${a}$ est $${a}^2 = ${a * a}$. <br>
    Le double de $${a * a}$ est $2 \\times ${a * a} = ${2 * a * a}$.<br>
    Le double du carré de $${a}$ est égal à `
        ;[num, den] = [2 * a * a, 1]
        distracteurs = [
          `${a * a}`,
          `${2 * a}^2`,
          `${2 * a}`,
          `${a ** 3}`,
          `${a * a + 2}`,
        ]
        break
      }
      case 5: {
        const a = randint(3, 6)
        enonce = `Le carré du double de $${a}$`
        correction = `Le double de $${a}$ est $2 \\times ${a} = ${2 * a}$. <br>
    Le carré de $${2 * a}$ est $${2 * a}^2 = ${4 * a * a}$.<br>
    Le carré du double de $${a}$ est égal à `
        ;[num, den] = [4 * a * a, 1]
        distracteurs = [
          `${2 * a * a}`,
          `${4 * a}`,
          `${a * a}`,
          `${2 * a}`,
          `${3 * a * a}`,
        ]
        break
      }
      case 6: {
        const a = 2 * randint(2, 10)
        enonce = `L'inverse de la moitié de $${a}$`
        correction = `La moitié de $${a}$ est $${dfrac(a, 2)} = ${a / 2}$. <br>
    L'inverse de $${a / 2}$ est $${dfrac(1, a / 2)}$.<br>
    L'inverse de la moitié de $${a}$ est donc égal à `
        ;[num, den] = [1, a / 2]
        distracteurs = [dfrac(1, 2 * a), dfrac(1, a), `${a / 2}`]
        break
      }
      default: {
        const a = 2 * randint(2, 10)
        enonce = `La moitié de l'inverse de $${a}$`
        correction = `L'inverse de $${a}$ est $${dfrac(1, a)}$. <br>
    La moitié de $${dfrac(1, a)}$ est $\\dfrac{1}{2} \\times ${dfrac(1, a)} = ${dfrac(1, 2 * a)}$.<br>
    La moitié de l'inverse de $${a}$ est égale à `
        ;[num, den] = [1, 2 * a]
        distracteurs = [dfrac(2, a), dfrac(a, 2), dfrac(1, a)]
        break
      }
    }
    const fraction = new FractionEtendue(num, den)
    const texReponse = den === 1 ? String(num) : fraction.texFraction
    this.correction = `${correction}$${miseEnEvidence(texReponse)}$.`

    if (this.versionQcm) {
      this.question = `${enonce} est égal à : `
      this.reponse = `$${texReponse}$`
      this.distracteurs = distracteurs.map((d) => `$${d}$`)
    } else {
      this.question = `Calculer ${enonce.charAt(0).toLowerCase()}${enonce.slice(1)}.`
      this.optionsDeComparaison =
        den === 1
          ? { nombreDecimalSeulement: true }
          : { fractionIrreductible: true }
      this.reponse = den === 1 ? String(num) : fraction
    }
  }
}
