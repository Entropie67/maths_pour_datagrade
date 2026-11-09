import { compile } from '@cortex-js/compute-engine'
import {
  insertImplicitProducts,
  normalizeLatexArithmetic,
} from '../interactif/checks/latexArithmetic'

/** Règle affichée par le solveur lorsque l'élève choisit « Équation produit ». */
export const regleProduitNul =
  'Si un produit de facteurs est nul, alors l’un au moins de ses facteurs est nul.'

const TOLERANCE = 1e-9

/**
 * MathLive écrit les parenthèses tapées au clavier `\lparen` et `\rparen`
 * (ou `\mleft(` et `\mright)`) : les remplacer par des parenthèses simples.
 */
export function normaliseParentheses(latex: string): string {
  return latex
    .replaceAll('\\lparen', '(')
    .replaceAll('\\rparen', ')')
    .replaceAll('\\mleft', '')
    .replaceAll('\\mright', '')
}

/**
 * Repère une équation produit : un produit de deux expressions affines égal à
 * zéro (ex : `(2x+1)(x-3)=0`, `3x(2x+1)=0`, `0=(x+2)(x-5)`). Les facteurs
 * constants non nuls sont ignorés (`2(x+1)(x-3)=0`).
 *
 * Retourne les deux équations à résoudre, dans l'ordre d'écriture des facteurs
 * (ex : `['2x+1=0', 'x-3=0']`), ou `null` si l'équation n'est pas de cette forme.
 * Un carré `(x+3)^2=0` n'est pas reconnu : il faut l'écrire `(x+3)(x+3)=0`.
 */
export function equationsProduitNul(
  equation: string,
  variable = 'x',
): [string, string] | null {
  const parties = normaliseParentheses(equation)
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')
    .split('=')
  if (parties.length !== 2) return null
  const [gauche, droite] = parties.map((partie) => partie.trim())
  let produit: string
  if (droite === '0') produit = gauche
  else if (gauche === '0') produit = droite
  else return null

  const facteurs = decoupeProduit(produit)
  if (facteurs == null) return null
  const variables: string[] = []
  for (const facteur of facteurs) {
    const nature = natureFacteur(facteur, variable)
    if (nature === 'autre' || nature === 'nul') return null
    if (nature === 'affine') variables.push(facteur)
  }
  if (variables.length !== 2) return null
  return [`${variables[0]}=0`, `${variables[1]}=0`]
}

/**
 * Découpe un produit en facteurs : groupes entre parenthèses (sans leurs
 * parenthèses) et atomes séparés par une parenthèse ou un signe de
 * multiplication. Retourne `null` pour une somme, une différence, une
 * puissance de groupe ou des parenthèses mal appariées.
 */
function decoupeProduit(produit: string): string[] | null {
  const facteurs: string[] = []
  let atome = ''
  let profondeurAccolades = 0
  const viderAtome = () => {
    const texte = atome.trim()
    // Un signe isolé (ex : `-(x+1)(x+2)`) est un facteur constant.
    if (texte !== '' && texte !== '-' && texte !== '+') facteurs.push(texte)
    atome = ''
  }
  for (let index = 0; index < produit.length; index++) {
    const caractere = produit[index]
    if (caractere === '{') profondeurAccolades++
    if (caractere === '}') profondeurAccolades--
    if (profondeurAccolades > 0 || caractere === '}') {
      atome += caractere
      continue
    }
    if (caractere === '(') {
      viderAtome()
      let profondeur = 1
      let fin = index + 1
      for (; fin < produit.length && profondeur > 0; fin++) {
        if (produit[fin] === '(') profondeur++
        if (produit[fin] === ')') profondeur--
      }
      if (profondeur !== 0) return null
      if (produit[fin] === '^') return null
      facteurs.push(produit.slice(index + 1, fin - 1).trim())
      index = fin - 1
    } else if (caractere === ')') {
      return null
    } else if (caractere === '*' || produit.startsWith('\\times', index)) {
      viderAtome()
      if (caractere !== '*') index += '\\times'.length - 1
    } else if (produit.startsWith('\\cdot', index)) {
      viderAtome()
      index += '\\cdot'.length - 1
    } else if ((caractere === '+' || caractere === '-') && index > 0) {
      return null
    } else {
      atome += caractere
    }
  }
  viderAtome()
  return profondeurAccolades === 0 && facteurs.length > 0 ? facteurs : null
}

/**
 * - `affine` : `ax+b` avec `a` non nul ;
 * - `constant` : nombre non nul ;
 * - `nul` : constante nulle (le produit serait nul quel que soit `x`) ;
 * - `autre` : toute autre expression (degré supérieur à 1, autre lettre...).
 */
function natureFacteur(
  texte: string,
  variable: string,
): 'affine' | 'constant' | 'nul' | 'autre' {
  if (texte === '') return 'autre'
  const lettres = texte.replace(/\\[a-z]+/gi, '').match(/[a-z]/gi) ?? []
  if (lettres.some((lettre) => lettre !== variable)) return 'autre'
  const expression = insertImplicitProducts(normalizeLatexArithmetic(texte))
  const valeurs = [-2, -1, 0, 1, 2].map((x) =>
    valeurEn(expression, variable, x),
  )
  if (valeurs.some((valeur) => valeur === undefined)) return 'autre'
  const [m2, m1, z, p1, p2] = valeurs as number[]
  const pente = p1 - z
  const estAffine =
    Math.abs(z - m1 - pente) < TOLERANCE &&
    Math.abs(p2 - p1 - pente) < TOLERANCE &&
    Math.abs(m1 - m2 - pente) < TOLERANCE
  if (!estAffine) return 'autre'
  if (Math.abs(pente) > TOLERANCE) return 'affine'
  return Math.abs(z) < TOLERANCE ? 'nul' : 'constant'
}

function valeurEn(
  expression: string,
  variable: string,
  x: number,
): number | undefined {
  try {
    const valeur = compile(expression)?.run?.({ [variable]: x })
    return typeof valeur === 'number' && Number.isFinite(valeur)
      ? valeur
      : undefined
  } catch {
    return undefined
  }
}
