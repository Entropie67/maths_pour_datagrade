import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { round } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Multiplier deux nombres décimaux astucieusement'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Rémi Angot
 * Pour multiplier deux nombres comme 8 000 et 0,09, on multiplie
 * d'abord leurs chiffres non nuls entre eux (8 x 9), puis on combine
 * séparément les opérations par 10, 100, 1000... qui accompagnent
 * chaque facteur (x 1 000 et : 100) en une seule opération
 * (x 1 000 : 100 = x 10).
 */
export const uuid = '0a3f4'

export const refs = {
  'fr-fr': ['can5C2-06'],
  'fr-ch': [],
}

// décalages individuels possibles sur chaque facteur (positif : le
// facteur est un multiple de 10 du chiffre ; négatif : c'est un
// nombre décimal)
const decalages = [-3, -2, -1, 0, 1, 2, 3]
const exposantMin = -4
const exposantMax = 4

interface Decalage {
  symbole: '\\times' | '\\div'
  valeurAbs: number
}

function decritDecalage(k: number): Decalage | null {
  if (k === 0) return null
  return { symbole: k > 0 ? '\\times' : '\\div', valeurAbs: 10 ** Math.abs(k) }
}

export default class MultiplierDeuxDecimauxAstucieusement extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const p = randint(2, 9)
    const q = randint(2, 9)

    let decalageA = 0
    let decalageB = 0
    let exposant = 0
    for (let essai = 0; essai < 20; essai++) {
      decalageA = choice(decalages)
      decalageB = choice(decalages)
      if (decalageA === 0 && decalageB === 0) continue // sinon simple produit à un chiffre
      exposant = decalageA + decalageB
      if (exposant >= exposantMin && exposant <= exposantMax) break
    }

    const precisionA = Math.max(0, -decalageA)
    const precisionB = Math.max(0, -decalageB)
    const aDecale = round(p * 10 ** decalageA, precisionA)
    const bDecale = round(q * 10 ** decalageB, precisionB)

    const precisionReponse = Math.max(0, -exposant)
    this.reponse = round(p * q * 10 ** exposant, precisionReponse)

    const aTex = texNombre(aDecale, precisionA)
    const bTex = texNombre(bDecale, precisionB)
    const produitTex = texNombre(p * q)
    const reponseTex = texNombre(this.reponse, precisionReponse)

    const decA = decritDecalage(decalageA)
    const decB = decritDecalage(decalageB)

    // Étape 1 : $aTex \times bTex$ réécrit en séparant chiffre non nul et opération par 10, 100, 1000...
    const detailFacteurs = `${p}${decA ? ` ${decA.symbole} ${texNombre(decA.valeurAbs)}` : ''} \\times ${q}${decB ? ` ${decB.symbole} ${texNombre(decB.valeurAbs)}` : ''}`

    // Étape 2 : on combine les opérations des deux facteurs en une seule
    let symboleFinal: '\\times' | '\\div' = '\\times'
    let valeurFinale = 1
    let groupementTex: string | null = null

    if (decA && decB) {
      if (decA.symbole === decB.symbole) {
        symboleFinal = decA.symbole
        valeurFinale = decA.valeurAbs * decB.valeurAbs
        groupementTex = `${texNombre(decA.valeurAbs)} \\times ${texNombre(decB.valeurAbs)}`
      } else {
        const mult = decA.symbole === '\\times' ? decA : decB
        const div = decA.symbole === '\\div' ? decA : decB
        groupementTex = `${texNombre(mult.valeurAbs)} \\div ${texNombre(div.valeurAbs)}`
        if (mult.valeurAbs === div.valeurAbs) {
          symboleFinal = '\\times'
          valeurFinale = 1
        } else if (mult.valeurAbs > div.valeurAbs) {
          symboleFinal = '\\times'
          valeurFinale = mult.valeurAbs / div.valeurAbs
        } else {
          symboleFinal = '\\div'
          valeurFinale = div.valeurAbs / mult.valeurAbs
        }
      }
    } else if (decA) {
      symboleFinal = decA.symbole
      valeurFinale = decA.valeurAbs
    } else if (decB) {
      symboleFinal = decB.symbole
      valeurFinale = decB.valeurAbs
    }

    this.question = `Calculer $${aTex} \\times ${bTex}$.`

    const etapes = [`${aTex} \\times ${bTex}`, detailFacteurs]
    if (groupementTex) {
      etapes.push(`${produitTex} \\times (${groupementTex})`)
    }
    etapes.push(`${produitTex} ${symboleFinal} ${texNombre(valeurFinale)}`)
    this.correction = `$${etapes.join(' = ')} = ${miseEnEvidence(reponseTex)}$`

    this.correction += texteEnCouleur(
      `<br> Mentalement : <br>
On multiplie d'abord les chiffres sans tenir compte des zéros : $${p} \\times ${q} = ${produitTex}$.<br>
On combine ensuite les opérations par $10$, $100$, $1\\,000$ $\\ldots$ de chaque facteur en une seule opération : $${symboleFinal} ${texNombre(valeurFinale)}$.<br>
On obtient ainsi $${produitTex} ${symboleFinal} ${texNombre(valeurFinale)} = ${reponseTex}$.
  `,
      bleuMathalea,
    )
  }
}
