import type {
  CelluleFleche,
  Ligne,
  LigneSigne,
  LigneValeur,
  LigneVariation,
  SigneSymbol,
  TableauSVConfig,
} from './types'

/**
 * Mapping signe → notation tkz-tab.
 * '0' → 'z' (zéro), '|' → 'z' (zéro simple), '||' → 'd' (double barre / discontinuité), '' → vide,
 * '+' et '-' inchangés.
 */
function signeToTkz(s: SigneSymbol): string {
  switch (s) {
    case '+':
      return '+'
    case '-':
      return '-'
    case '0':
      return 'z'
    case '|':
      return 'z'
    case '||':
      return 'd'
    case '|0':
      return 'z'
    case '||0':
      return 'd'
    case '':
      return ''
  }
}

/**
 * Encadre une expression de '$' si pas vide.
 */
function dollar(latex: string): string {
  if (latex === '' || latex == null) return ''
  return `$${latex}$`
}

/**
 * Détermine la position (haut/bas) de chaque valeur d'une ligne de variations
 * à partir des flèches entre antécédents. Les flèches 'interdite' ou vides
 * conservent la position courante.
 */
function positionsFromFleches(
  nbValeurs: number,
  fleches: CelluleFleche[],
): ('haut' | 'bas')[] {
  const positions: ('haut' | 'bas')[] = new Array(nbValeurs)
  let firstSet = false
  for (let i = 0; i < fleches.length; i++) {
    const sens = fleches[i].sens
    if (sens === 'haut') {
      if (!firstSet) {
        positions[i] = 'bas'
        firstSet = true
      }
      positions[i + 1] = 'haut'
    } else if (sens === 'bas') {
      if (!firstSet) {
        positions[i] = 'haut'
        firstSet = true
      }
      positions[i + 1] = 'bas'
    } else {
      if (!firstSet) {
        positions[i] = 'bas'
        firstSet = true
      }
      positions[i + 1] = positions[i]
    }
  }
  if (!firstSet) {
    for (let i = 0; i < nbValeurs; i++) positions[i] = 'bas'
  }
  return positions
}

function buildTkzTabInit(
  config: TableauSVConfig,
  values: ResolvedValues,
  opts: BuildLatexOptions,
): string {
  const variableName = config.variableName ?? 'x'
  const labels: string[] = [`$${variableName}$ / 1`]
  for (let i = 0; i < config.lignes.length; i++) {
    const ligne = config.lignes[i]
    const hauteur = ligne.type === 'variation' ? 2 : 1
    labels.push(`$${escapeLatex(ligne.label)}$ / ${hauteur}`)
  }
  const antecedents = config.colonnes.map((col, j) => {
    const v = values.headerCells[j]
    return dollar(v)
  })
  return `\\tkzTabInit[lgt=${opts.lgt},espcl=${opts.espcl}]{${labels.join(', ')}}{${antecedents.join(', ')}}`
}

function buildTkzTabLine(
  ligne: LigneSigne,
  ligneIndex: number,
  values: ResolvedValues,
): string {
  const cellules = values.cellsByLigne[ligneIndex] as SigneSymbol[]
  const tkz = cellules.map(signeToTkz).join(', ')
  return `\\tkzTabLine{${tkz}}`
}

function buildTkzTabVar(
  ligne: LigneVariation,
  ligneIndex: number,
  values: ResolvedValues,
  state: Record<string, string>,
): string {
  const valeurs = values.cellsByLigne[ligneIndex] as string[]
  const positions = positionsFromFleches(valeurs.length, ligne.fleches)
  const entries: string[] = []

  valeurs.forEach((latex, i) => {
    const prefix = positions[i] === 'haut' ? '+' : '-'
    entries.push(`${prefix}/ ${dollar(latex)}`)

    // Cellule double : ajouter une entrée pour la valeur à droite de la discontinuité.
    const droiteKey = `L${ligneIndex + 1}C${i}R`
    const latexD = state[droiteKey] ?? ligne.valeurs[i].latexDroite
    if (latexD !== undefined) {
      const nextSens = ligne.fleches[i]?.sens ?? ''
      const posD: 'haut' | 'bas' =
        nextSens === 'haut' ? 'bas'
        : nextSens === 'bas' ? 'haut'
        : positions[i]
      entries.push(`${posD === 'haut' ? '+' : '-'}/ ${dollar(latexD)}`)
    }
  })

  return `\\tkzTabVar{${entries.join(', ')}}`
}

function buildTkzTabValeur(
  ligne: LigneValeur,
  ligneIndex: number,
  values: ResolvedValues,
): string {
  // Ligne de valeurs simples : on émet \tkzTabLine avec les valeurs aux antécédents
  // intercalées de cellules vides (pas de signes entre).
  const valeurs = values.cellsByLigne[ligneIndex] as string[]
  const parts: string[] = []
  for (let j = 0; j < valeurs.length; j++) {
    parts.push(dollar(valeurs[j]))
    if (j < valeurs.length - 1) parts.push('')
  }
  return `\\tkzTabLine{${parts.join(', ')}}`
}

/**
 * Échappe les caractères qui posent problème en LaTeX si on est dans un en-tête
 * non encadré de $...$. On préserve les commandes existantes.
 */
function escapeLatex(s: string): string {
  return s
}

interface BuildLatexOptions {
  /** Largeur de la première colonne (cm) */
  lgt: number
  /** Espace entre antécédents (cm) */
  espcl: number
  /** Échelle globale */
  scale: number
}

const DEFAULT_LATEX_OPTIONS: BuildLatexOptions = {
  lgt: 3.5,
  espcl: 2,
  scale: 1,
}

/**
 * Valeurs effectives à exporter : pour chaque cellule, on prend l'éventuelle
 * réponse de l'élève (state[`L${ligne+1}C${col}`]) sinon la valeur de la config.
 * `headerCells` correspond à la ligne 0 (antécédents), `cellsByLigne[i]` au
 * contenu de la ligne i+1.
 */
interface ResolvedValues {
  headerCells: string[]
  cellsByLigne: (string[] | SigneSymbol[])[]
}

/**
 * Combine la configuration de l'enseignant et l'état (saisies de l'élève).
 * - Si une cellule n'est pas éditable, on garde la valeur de la config.
 * - Si elle est éditable, on prend l'entrée de `state` si elle existe, sinon
 *   la valeur courante.
 */
export function resolveValues(
  config: TableauSVConfig,
  state: Record<string, string>,
): ResolvedValues {
  const headerCells = config.colonnes.map((col, j) => {
    const key = `L0C${j}`
    if (col.editable && state[key] != null) return state[key]
    return col.valeur
  })
  const cellsByLigne: (string[] | SigneSymbol[])[] = config.lignes.map(
    (ligne, i) => resolveLigne(ligne, i, state),
  )
  return { headerCells, cellsByLigne }
}

function resolveLigne(
  ligne: Ligne,
  ligneIndex: number,
  state: Record<string, string>,
): string[] | SigneSymbol[] {
  const Lkey = ligneIndex + 1
  if (ligne.type === 'signe') {
    return ligne.cellules.map((c, j) => {
      const key = `L${Lkey}C${j}`
      if (c.editable && state[key] != null) return state[key] as SigneSymbol
      return c.symbole
    })
  }
  if (ligne.type === 'variation') {
    return ligne.valeurs.map((v, j) => {
      const key = `L${Lkey}C${j}`
      if (v.editable && state[key] != null) return state[key]
      return v.latex
    })
  }
  // ligne valeur
  return ligne.valeurs.map((v, j) => {
    const key = `L${Lkey}C${j}`
    if (v.editable && state[key] != null) return state[key]
    return v.latex
  })
}

/**
 * Génère le code LaTeX tkz-tab complet pour un tableau.
 * @param config Configuration figée par l'enseignant.
 * @param state Valeurs courantes (mélange des cellules figées et des saisies de l'élève).
 * @param options Paramètres de mise en page tkz-tab (largeurs, échelle).
 */
export function toLatex(
  config: TableauSVConfig,
  state: Record<string, string> = {},
  options: Partial<BuildLatexOptions> = {},
): string {
  const opts: BuildLatexOptions = { ...DEFAULT_LATEX_OPTIONS, ...options }
  const values = resolveValues(config, state)
  const lines: string[] = []
  lines.push(`\\begin{tikzpicture}[baseline, scale=${opts.scale}]`)
  lines.push(`\t${buildTkzTabInit(config, values, opts)}`)
  for (let i = 0; i < config.lignes.length; i++) {
    const ligne = config.lignes[i]
    if (ligne.type === 'signe') {
      lines.push(`\t${buildTkzTabLine(ligne, i, values)}`)
    } else if (ligne.type === 'variation') {
      lines.push(`\t${buildTkzTabVar(ligne, i, values, state)}`)
    } else {
      lines.push(`\t${buildTkzTabValeur(ligne, i, values)}`)
    }
  }
  lines.push(`\\end{tikzpicture}`)
  if (config.couleur !== undefined) {
    // tkz-tab trace traits et pointillés avec `\tkzTabDefaultWritingColor` (noir)
    return `{\\definecolor{couleurTableau}{HTML}{${config.couleur.replace('#', '')}}\\color{couleurTableau}\\renewcommand{\\tkzTabDefaultWritingColor}{couleurTableau}\n${lines.join('\n')}}`
  }
  return lines.join('\n')
}

// Petite fonction utilitaire pour dépanner depuis la console.
export function internalSigneToTkz(s: SigneSymbol): string {
  return signeToTkz(s)
}

export function internalPositionsFromFleches(
  nbValeurs: number,
  fleches: CelluleFleche[],
): ('haut' | 'bas')[] {
  return positionsFromFleches(nbValeurs, fleches)
}
