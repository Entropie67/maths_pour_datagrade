import {
  addTableauSignesVariations,
  creerTableauSignesVariations,
} from '../../lib/customElements/TableauSignesVariationsElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  celluleFleche,
  celluleSigne,
  celluleValeur,
  colonne,
  configCorrige,
  ligneSigne,
  ligneVariation,
} from '../../lib/interactif/tableauSignesVariations/helpers'
import type {
  SigneSymbol,
  TableauSVConfig,
} from '../../lib/interactif/tableauSignesVariations/types'
import { pgcd } from '../../lib/outils/primalite'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const interactifReady = true
export const titre = 'Compléter un tableau de variations (démo)'
export const dateDePublication = '2026-05-01'
export const uuid = '39232'

export const refs = {
  'fr-fr': ['demoTableau'],
  'fr-ch': [],
}

/**
 * Exercice témoin pour le custom element <tableau-signes-variations>.
 * f'(x) = (ax+b)(cx+d) ou f'(x) = (ax+b)/(cx+d) : signes des facteurs, signe de f',
 * tableau de variations (avec gestion de la valeur interdite pour le cas rationnel).
 * @author Rémi Angot (démo)
 */
export default class TableauSignesVariationsDemo extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.formatChampTexte = 'none' // Pour un exercice de type simple qui n'utilise pas le champ de réponse
    this.nbQuestions = 1
    this.sup = 4
    this.besoinFormulaireNumerique = ['Barème (nombre de points)', 10]
    this.sup2 = 3
    this.besoinFormulaire2Texte = [
      'Type de fonction',
      "Nombres séparés par des tirets :\n1 : f'(x) = (ax+b)(cx+d)\n2 : f'(x) = (ax+b)/(cx+d) (fonction rationnelle)\n3 : Mélange",
    ]
  }

  nouvelleVersion() {
    const estQuotient =
      gestionnaireFormulaireTexte({
        saisie: this.sup2,
        min: 1,
        max: 2,
        melange: 3,
        defaut: 3,
        nbQuestions: 1,
      }).map(Number)[0] === 2

    // Génération des coefficients (non nuls) jusqu'à obtenir deux zéros distincts
    let a: number, b: number, c: number, d: number
    let zero1: number, zero2: number
    do {
      a = randint(-9, 9, [0])
      b = randint(-9, 9, [0])
      c = randint(-9, 9, [0])
      d = randint(-9, 9, [0])
      zero1 = -b / a // zéro de ax+b
      zero2 = -d / c // zéro de cx+d (valeur interdite si fonction rationnelle)
    } while (Math.abs(zero1 - zero2) < 1e-9)

    // Tri des zéros
    const zero1IsLeft = zero1 < zero2

    const xLeft = [zero1IsLeft ? a : c, zero1IsLeft ? b : d]
    const xRight = [zero1IsLeft ? c : a, zero1IsLeft ? d : b]

    // Représentations LaTeX des zéros
    const xLeftLatex = zeroAsLatexSimplified(
      zero1IsLeft ? a : c,
      zero1IsLeft ? b : d,
    )
    const xRightLatex = zeroAsLatexSimplified(
      zero1IsLeft ? c : a,
      zero1IsLeft ? d : b,
    )

    // Signes des facteurs sur chaque intervalle
    type Signe = '+' | '-'
    const signBefore = (coeff: number): Signe => (coeff > 0 ? '-' : '+')
    const signAfter = (coeff: number): Signe => (coeff > 0 ? '+' : '-')
    const signMult = (s1: Signe, s2: Signe): Signe => (s1 === s2 ? '+' : '-')

    // ax+b : zéro en xLeft si zero1IsLeft, sinon en xRight
    const signABLeft = signBefore(a)
    const signABMid: Signe = zero1IsLeft ? signAfter(a) : signBefore(a)
    const signABRight = signAfter(a)

    // cx+d : zéro en xLeft si !zero1IsLeft, sinon en xRight
    const signCDLeft = signBefore(c)
    const signCDMid: Signe = !zero1IsLeft ? signAfter(c) : signBefore(c)
    const signCDRight = signAfter(c)

    // Signe de f'(x) = (ax+b)(cx+d)
    const signFpLeft = signMult(signABLeft, signCDLeft)
    const signFpMid = signMult(signABMid, signCDMid)
    const signFpRight = signMult(signABRight, signCDRight)

    // Sens de variation de f
    type Sens = 'haut' | 'bas'
    const dir = (s: Signe): Sens => (s === '+' ? 'haut' : 'bas')

    // Labels des facteurs en LaTeX
    const labelAB = formatFactor(a, b)
    const labelCD = formatFactor(c, d)

    // Si f' est une fonction rationnelle, le zéro de cx+d annule le dénominateur :
    // c'est une valeur interdite. Seule la ligne f'(x) porte la double barre, et c'est
    // à l'élève de la placer (la cellule part d'une barre simple, comme les autres).
    const expectedFAuZeroCD: SigneSymbol = estQuotient ? '||' : '0'

    // Cellules de la ligne ax+b
    const cellsAB = zero1IsLeft
      ? [
          celluleSigne(''),
          celluleSigne('', { editable: true, expected: signABLeft }),
          celluleSigne('|', { editable: true, expected: '0' }),
          celluleSigne('', { editable: true, expected: signABMid }),
          celluleSigne('|', { editable: true, expected: '' }),
          celluleSigne('', { editable: true, expected: signABRight }),
          celluleSigne(''),
        ]
      : [
          celluleSigne(''),
          celluleSigne('', { editable: true, expected: signABLeft }),
          celluleSigne('|', { editable: true, expected: '' }),
          celluleSigne('', { editable: true, expected: signABMid }),
          celluleSigne('|', { editable: true, expected: '0' }),
          celluleSigne('', { editable: true, expected: signABRight }),
          celluleSigne(''),
        ]

    // Cellules de la ligne cx+d
    const cellsCD = !zero1IsLeft
      ? [
          celluleSigne(''),
          celluleSigne('', { editable: true, expected: signCDLeft }),
          celluleSigne('|', { editable: true, expected: '0' }),
          celluleSigne('', { editable: true, expected: signCDMid }),
          celluleSigne('|', { editable: true, expected: '' }),
          celluleSigne('', { editable: true, expected: signCDRight }),
          celluleSigne(''),
        ]
      : [
          celluleSigne(''),
          celluleSigne('', { editable: true, expected: signCDLeft }),
          celluleSigne('|', { editable: true, expected: '' }),
          celluleSigne('', { editable: true, expected: signCDMid }),
          celluleSigne('|', { editable: true, expected: '0' }),
          celluleSigne('', { editable: true, expected: signCDRight }),
          celluleSigne(''),
        ]

    const config: TableauSVConfig = {
      colonnesEditables: true,
      lignesEditables: true,
      variableName: 'x',
      colonnes: [
        colonne('-\\infty'),
        colonne('', {
          editable: true,
          expected: xLeftLatex,
          clavier: KeyboardType.clavierDeBaseAvecFraction,
        }),
        colonne('', {
          editable: true,
          expected: xRightLatex,
          clavier: KeyboardType.clavierDeBaseAvecFraction,
        }),
        colonne('+\\infty'),
      ],
      lignes: [
        ligneSigne(labelAB, cellsAB),
        ligneSigne(labelCD, cellsCD),
        ligneSigne(
          "f'(x)",
          zero1IsLeft
            ? [
                celluleSigne(''),
                celluleSigne('', { editable: true, expected: signFpLeft }),
                celluleSigne('|', { editable: true, expected: '0' }),
                celluleSigne('', { editable: true, expected: signFpMid }),
                celluleSigne('|', {
                  editable: true,
                  expected: expectedFAuZeroCD,
                }),
                celluleSigne('', { editable: true, expected: signFpRight }),
                celluleSigne(''),
              ]
            : [
                celluleSigne(''),
                celluleSigne('', { editable: true, expected: signFpLeft }),
                celluleSigne('|', {
                  editable: true,
                  expected: expectedFAuZeroCD,
                }),
                celluleSigne('', { editable: true, expected: signFpMid }),
                celluleSigne('|', { editable: true, expected: '0' }),
                celluleSigne('', { editable: true, expected: signFpRight }),
                celluleSigne(''),
              ],
        ),
        ligneVariation(
          'f(x)',
          [
            celluleValeur(''),
            celluleValeur(''),
            celluleValeur(''),
            celluleValeur(''),
          ],
          [
            celluleFleche('', { editable: true, expected: dir(signFpLeft) }),
            celluleFleche('', { editable: true, expected: dir(signFpMid) }),
            celluleFleche('', { editable: true, expected: dir(signFpRight) }),
          ],
        ),
      ],
    }

    const fpLatex = estQuotient
      ? `\\dfrac{${labelAB}}{${labelCD}}`
      : `(${labelAB})(${labelCD})`
    const zeroCDLatex = zero1IsLeft ? xRightLatex : xLeftLatex
    const domaine = estQuotient
      ? `\\mathbb{R} \\smallsetminus \\{${zeroCDLatex}\\}`
      : '\\mathbb{R}'
    const enonce = `Soit $f$ une fonction dérivable sur $${domaine}$ dont la dérivée est $f'(x) = ${fpLatex}$.<br>
Compléter le tableau de signes et de variations ci-dessous.<br><br>`

    // Pour un exercice simple, nouvelleVersion() est appelée une fois par question :
    // this.listeQuestions.length est le nombre de questions déjà validées, donc l'indice
    // de la question en cours.
    const numeroQuestion = this.listeQuestions.length

    let texte = enonce
    if (this.interactif) {
      texte += addTableauSignesVariations(this, numeroQuestion, {
        config,
        bareme: Number(this.sup),
      })
    } else {
      texte += creerTableauSignesVariations(config, {
        readonly: true,
        numeroExercice: this.numeroExercice,
        numeroQuestion,
      })
    }

    const tableauCorrige = creerTableauSignesVariations(configCorrige(config), {
      readonly: true,
      numeroExercice: this.numeroExercice,
      numeroQuestion,
    })

    let texteCorr = ''
    if (zero1IsLeft) {
      texteCorr = `$${labelAB}$ s'annule en $x = ${zeroAsLatexWithSimplification(xLeft)}$ et $${labelCD}$ s'annule en $x = ${zeroAsLatexWithSimplification(xRight)}$.`
    } else {
      texteCorr = `$${labelAB}$ s'annule en $x = ${zeroAsLatexWithSimplification(xRight)}$ et $${labelCD}$ s'annule en $x = ${zeroAsLatexWithSimplification(xLeft)}$.`
    }
    if (estQuotient) {
      texteCorr += ` Comme $${labelCD}$ s'annule en $x = ${zeroCDLatex}$, cette valeur annule le dénominateur : c'est une valeur interdite, $f'$ n'y est pas définie.`
    }
    texteCorr += `<br><br>${tableauCorrige}`

    this.question = texte
    this.correction = texteCorr
  }
}

/** Retourne la valeur LaTeX du zéro de ax+b (i.e. −b/a) simplifiée. */
function zeroAsLatexSimplified(a: number, b: number): string {
  let num = -b
  let den = a
  const g = pgcd(Math.abs(num), Math.abs(den))
  num = num / g
  den = den / g
  if (den < 0) {
    num = -num
    den = -den
  }
  if (den === 1) return String(num)
  if (num < 0) return `-\\dfrac{${-num}}{${den}}`
  return `\\dfrac{${num}}{${den}}`
}

function zeroAsLatexWithSimplification([a, b]: number[]): string {
  const num = -b
  const den = a
  const g = pgcd(Math.abs(num), Math.abs(den))
  if (g === 1) return zeroAsLatexSimplified(a, b)
  return `\\dfrac{${num}}{${den}} = ${zeroAsLatexSimplified(a, b)}`
}

/** Formate ax+b en LaTeX (avec a, b non nuls). */
function formatFactor(a: number, b: number): string {
  const xPart = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`
  const bPart = b > 0 ? `+${b}` : String(b)
  return `${xPart}${bPart}`
}
