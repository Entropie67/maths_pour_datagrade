import ce from '../../lib/interactif/comparisonFunctions'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '21eb5'
export const refs = {
  'fr-fr': ['1A-C01-6', '2A-N1-5'],
  'fr-ch': ['10LCQCMNO-1', '10LSQCMNO-1'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Trouver le plus grand ou le plus petit nombre avec des puissances'
export const dateDePublication = '06/07/2026'
/**
 *
 * @author Jean-Claude Lhote (sans IA) légèrement corrigé (avec IA !) par Stéphane Guyon
 * correction parenthèses harmonisées, argumentation de la réponse reprise et choix de la valeur décimale réduite pour simplifier les calculs.
 */
export default class Auto1AC16 extends ExerciceQcmA {
  private appliquerLesValeurs(
    den1: number,
    exp1: number,
    dec: number,
    denExp: number,
    plusGrand: boolean,
  ): void {
    const valeur1 = `\\left(\\frac{1}{${den1}}\\right)^{${exp1}}`
    const valeur2 = `\\left(\\frac{1}{${exp1}}\\right)^{${den1}}`
    const valeur3 = `${texNombre(dec, 5)}`
    const valeur4 = `\\left(\\frac{1}{${denExp}}\\right)^{${denExp}}`
    const valeurs = [valeur1, valeur2, valeur3, valeur4]
    const valeursNum = valeurs.map((v) =>
      parseFloat(ce.parse(v.replace(',', '.')).N().toString()),
    )
    const numForDec = Math.pow(
      10,
      dec.toFixed(5).replace(/0+$/, '').split('.')[1].length,
    )
    const isGood = new Set(valeursNum).size === 4
    const greater = Math.max(...valeursNum)
    const smaller = Math.min(...valeursNum)
    const indexBr = valeursNum.indexOf(plusGrand ? greater : smaller)
    const bonneReponse = valeurs[indexBr]
    const otherReponses = valeurs.filter((v) => v !== bonneReponse)
    this.reponses = [bonneReponse, ...otherReponses].map(
      (v) => `$${v.replace('\\frac', '\\dfrac')}$`,
    )
    this.enonce = `Quel est le ${plusGrand ? 'plus grand' : 'plus petit'} nombre parmi les quatre suivants ?`
    this.correction = `$${valeur1.replace('\\frac', '\\dfrac')} = \\dfrac{1}{${den1}^{${exp1}}} = \\dfrac{1}{${texNombre(Math.pow(den1, exp1), 0)}}$<br><br>
    $${valeur2.replace('\\frac', '\\dfrac')} = \\dfrac{1}{${exp1}^{${den1}}} = \\dfrac{1}{${texNombre(Math.pow(exp1, den1), 0)}}$<br><br>
    $${valeur3} = \\dfrac{${texNombre(dec * numForDec, 0)}}{${texNombre(numForDec, 0)}}=\\dfrac{1}{${(1 / dec).toFixed(0)}}$<br><br>
$${valeur4.replace('\\frac', '\\dfrac')} = \\dfrac{1}{${denExp}^{${denExp}}} = \\dfrac{1}{${texNombre(Math.pow(denExp, denExp), 0)}}$<br><br>`
    const denominateurs = [
      texNombre(Math.pow(den1, exp1), 0),
      texNombre(Math.pow(exp1, den1), 0),
      (1 / dec).toFixed(0),
      texNombre(Math.pow(denExp, denExp), 0),
    ]
    const denominateursOrdonnes = denominateurs
      .map<[string, number]>((v, i) => [v, valeursNum[i]])
      .sort((a, b) => (plusGrand ? b[1] - a[1] : a[1] - b[1]))
      .map((v) => v[0])

    this.correction += `$${denominateursOrdonnes.join(
      plusGrand ? '<' : '>',
    )}$<br><br>
      La fonction inverse étant strictement décroissante sur $\\mathbb{R}_+^*$, on a :<br>
      $${denominateursOrdonnes
        .map((denominateur) => `\\dfrac{1}{${denominateur}}`)
        .join(plusGrand ? '>' : '<')}$.<br><br>`
    this.correction += `$${[valeur1, valeur2, valeur3, valeur4]
      .map<[string, number]>((v, i) => [
        v.replace('\\frac', '\\dfrac'),
        valeursNum[i],
      ])
      .sort((a, b) => (plusGrand ? b[1] - a[1] : a[1] - b[1]))
      .map((v, i) => (i === 0 ? `${miseEnEvidence(v[0])}` : `${v[0]}`))
      .join(`${plusGrand ? '>' : '<'}`)}$<br><br>`
    if (!isGood) this.reponses.pop() // j'enlève une réponse si les 4 valeurs ne sont pas différentes, pour éviter d'avoir 2 réponses identiques
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(5, 2, 0.05, 3, true)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    let den1: number
    let exp1: number
    let dec: number
    let denExp: number
    let plusGrand: boolean
    do {
      den1 = choice([2, 3, 4])
      exp1 = choice([2, 3, 4], den1)
      dec = choice([0.01, 0.02, 0.04, 0.05, 0.025, 0.002, 0.005])
      denExp = choice([2, 3, 4], [den1, exp1])
      plusGrand = choice([true, false])
      this.appliquerLesValeurs(den1, exp1, dec, denExp, plusGrand)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Pour comparer des nombres, selon les situations, il est souvent plus pratique de tous les écrire :
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>sous forme de fractions de même dénominateur,</li>
    <li>sous forme décimale,</li>
    <li>en notation scientifique.</li>
  </ul>
   <p style="margin: 0 0 10px 0;">
   Le plus simple dans cet exercice est sans doute de les écrire sous forme fractionnaire de même numérateur.
  </p>
 `
    this.versionAleatoire()
    this.spacing = 1
    this.spacingCorr = 1
  }
}
