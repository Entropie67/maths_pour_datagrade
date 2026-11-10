import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnCouleur, miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Résoudre une inéquation $ax+b>cx+d$'
export const dateDePublication = '16/08/2026'
export const amcReady = true
export const interactifReady = true

/**
 * Résoudre une inéquation du type ax+b < cx+d.
 * @author Arnaud Meistermann
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '3d6d3'

export const refs = {
  'fr-fr': ['1A-C10-14', '2A-C3-10'],
  'fr-ch': ['2mIneq-11'],
}

const symbols = ['\\leqslant', '<', '\\geqslant', '>'] as const
type InequalitySymbol = (typeof symbols)[number]

function inverseSymbol(symbol: InequalitySymbol): InequalitySymbol {
  const inverses: Record<InequalitySymbol, InequalitySymbol> = {
    '\\leqslant': '\\geqslant',
    '<': '>',
    '\\geqslant': '\\leqslant',
    '>': '<',
  }
  return inverses[symbol]
}

function isStrict(symbol: InequalitySymbol): boolean {
  return symbol === '<' || symbol === '>'
}

function withStrictness(
  symbol: InequalitySymbol,
  strict: boolean,
): InequalitySymbol {
  if (symbol === '<' || symbol === '\\leqslant') {
    return strict ? '<' : '\\leqslant'
  }
  return strict ? '>' : '\\geqslant'
}

function makeInterval(symbol: InequalitySymbol, root: number): string {
  const strict = isStrict(symbol)

  if (symbol === '<' || symbol === '\\leqslant') {
    return `]-\\infty~;~${root}${strict ? '[' : ']'}`
  }
  return `${strict ? ']' : '['}${root}~;~+\\infty[`
}

export default class Auto1AC1014 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    // Clavier allégé : crochets, point-virgule et infini
    this.optionsChampTexte = {
      dataKeys: ['[', ']', ';', '\\infty'],
    }
    this.optionsDeComparaison = { intervalle: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.versionQcmOptions = {
      radio: true,
      format: 'caseLettre',
      compact: true,
    }
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = false

    const difference =
      this.quotaRandint('difference', 2, 6) *
      this.quotaChoice('signeDifference', [-1, 1])
    const c = this.quotaRandint('c', -6, 6, [0, -difference])
    const a = c + difference
    const root =
      this.quotaRandint('root', 2, 7) * this.quotaChoice('signeRoot', [-1, 1])
    const b = this.quotaRandint('b', -9, 9, [0, -difference * root])
    const d = b + difference * root

    const symbol = symbols[this.quotaRandint('symbol', 0, symbols.length - 1)]
    const finalSymbol = difference < 0 ? inverseSymbol(symbol) : symbol
    const wrongDirection = inverseSymbol(finalSymbol)
    const wrongStrictness = withStrictness(finalSymbol, !isStrict(finalSymbol))

    const inequation = (align = false) =>
      `${reduireAxPlusB(a, b)}${align ? '&' : ''}${symbol} ${reduireAxPlusB(c, d)}`

    // En interactif, S= à la ligne devant le champ ; sur papier (PDF), consigne classique
    this.question = this.versionQcm
      ? `L'inéquation $${inequation()}$ a pour ensemble de solutions${sp()}:`
      : this.interactif
        ? `L'inéquation $${inequation()}$ a pour ensemble de solutions${sp()}:<br>$S=$`
        : `Résoudre, dans $\\mathbb{R}$, l'inéquation $${inequation()}$.`

    this.correction = `$
\\begin{aligned}
${inequation(true)}\\\\
${reduireAxPlusB(difference, b)}&${symbol}${d}\\\\
${reduireAxPlusB(difference, 0)}&${symbol}${d - b}\\\\
x&${difference < 0 ? miseEnCouleur(finalSymbol) : finalSymbol}\\dfrac{${d - b}}{${difference}}\\\\
x&${finalSymbol}${root}
\\end{aligned}
$<br>`
    this.correction += `L'ensemble de solutions est${sp()}: $${miseEnEvidence(`${makeInterval(finalSymbol, root)}`)}$.<br>`

    this.reponse = makeInterval(finalSymbol, root)

    if (this.versionQcm) {
      // Les trois caractéristiques visibles sont équilibrées pour éviter qu'une
      // réponse puisse être devinée par fréquence : deux directions, deux
      // bornes et deux types d'inégalité de chaque sorte.
      const propositions = [
        makeInterval(finalSymbol, root),
        makeInterval(inverseSymbol(wrongStrictness), root),
        makeInterval(wrongStrictness, -root),
        makeInterval(wrongDirection, -root),
      ]
      this.distracteurs = shuffle(propositions).map(
        (proposition) => `$${proposition}$`,
      )
      this.reponse = `$${this.reponse}$`
    }
  }
}
