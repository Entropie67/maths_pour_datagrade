import { orangeMathalea } from '../../colors'
import { resolveValues, internalPositionsFromFleches } from './latexExport'
import type {
  CelluleValeur,
  LigneVariation,
  SigneSymbol,
  TableauSVConfig,
} from './types'

/**
 * Convertit un fragment LaTeX simple (issu de la config : antécédents,
 * labels, valeurs) en syntaxe mathématique Typst.
 *
 * Ce n'est volontairement pas un convertisseur LaTeX général (voir
 * `latexMathToTypst`/tex2typst dans `src/components/setup/typst/`, qui gère
 * le HTML complet d'un exercice) : ce module vit dans `src/lib/interactif`
 * et ne doit pas dépendre de `src/components` (romprait la séparation des
 * couches, et entraînerait ce fichier — et le code DOM-dépendant qu'il
 * importe — dans des contextes où il n'a pas sa place, ex. les tests unitaires).
 * Il couvre seulement le sous-ensemble de LaTeX réellement utilisé dans un
 * tableau de signes/variations (infinis, fractions, racines, constante e,
 * exposants et indices, opérateurs usuels).
 */
function latexFragmentToTypstMath(latex: string): string {
  let s = latex
  // \mathrm{e}^{2} → upright(e)^(2), avant les fractions qui n'acceptent pas
  // d'accolades dans leurs arguments
  s = s.replace(/\\mathrm\{([a-zA-Z])\}/g, 'upright($1)')
  s = s.replace(/([_^])\{([^{}]*)\}/g, '$1($2)')
  // \dfrac{a}{b} et \frac{a}{b} → (a)/(b) (pas d'imbrication gérée : un seul niveau)
  s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
  s = s.replace(/\\infty/g, 'infinity')
  s = s.replace(/\\pm/g, 'plus.minus')
  s = s.replace(/\\times/g, 'times')
  s = s.replace(/\\cdot/g, 'dot.op')
  return s
}

/** Couleur de la config (`#RRGGBB`) sous forme d'expression Typst. */
function typstColor(couleur: string): string {
  return `rgb("${couleur}")`
}

/**
 * Contenu Typst (`$...$`) pour une expression, `$ $` (espace) si vide (cellule
 * à compléter). `couleur` met l'expression en évidence : couleur, gras et léger
 * contour, comme `evidence()` (voir `typstHighlights.ts`).
 */
function typstMathContent(
  latex: string | undefined,
  couleur?: string,
): string {
  const converted = latexFragmentToTypstMath(latex ?? '').trim()
  if (converted === '') return '$ $'
  if (couleur === undefined) return `$${converted}$`
  // expression de code (comme les `$...$` des autres cellules), pas une formule
  const c = typstColor(couleur)
  return `text(fill: ${c}, stroke: (paint: ${c}, thickness: 0.025em), math.bold($${converted}$))`
}

/** Contenu Typst pour un label de ligne (encadré `[...]`). */
function typstLabelContent(label: string): string {
  const converted = latexFragmentToTypstMath(label).trim()
  return converted === '' ? '[]' : `[$${converted}$]`
}

/**
 * Mapping SigneSymbol → type de barre `vartable`.
 * Contrairement à `signeToTkz` (voir latexExport.ts, où tkz-tab affiche
 * systématiquement le zéro pour son marqueur 'z'), `vartable` distingue une
 * barre simple sans zéro (marqueur `"|"`) d'une barre avec zéro (marqueur
 * `"0"`, qui affiche `$0$` de façon inconditionnelle) : cf. `SIGNE_DISPLAY`
 * dans `render.ts`, où `'|'`/`'||'` n'affichent rien et seuls `'|0'`/`'||0'`
 * affichent le zéro. `'||0'` (double barre + zéro) n'a pas d'équivalent
 * direct dans `vartable` ; on retombe sur une double barre sans zéro (même
 * limitation que pour l'export LaTeX).
 * `null` signifie « pas de marquage » : `vartable` trace alors une barre
 * simple par défaut entre deux signes consécutifs.
 */
function signeToVartableBar(s: SigneSymbol): '0' | '|' | '||' | null {
  switch (s) {
    case '0':
    case '|0':
      return '0'
    case '|':
      return '|'
    case '||':
    case '||0':
      return '||'
    default:
      return null
  }
}

function signBodyLatex(sym: SigneSymbol): string {
  return sym === '+' || sym === '-' ? sym : ''
}

/**
 * Contenu `contents` (un array Typst, en texte) pour une ligne de signes.
 * `cellules` a 2n-1 éléments (n = nb colonnes) : indices pairs = barres sous
 * les antécédents, indices impairs = signes des intervalles (voir types.ts).
 */
function buildSignRowContents(
  cellules: SigneSymbol[],
  highlights: boolean[],
  couleurMiseEnEvidence: string,
): string {
  const nbIntervalles = (cellules.length - 1) / 2
  const parts: string[] = []
  for (let i = 0; i < nbIntervalles; i++) {
    const body = typstMathContent(
      signBodyLatex(cellules[2 * i + 1]),
      highlights[2 * i + 1] ? couleurMiseEnEvidence : undefined,
    )
    if (i === 0) {
      const barreGauche = signeToVartableBar(cellules[0])
      parts.push(barreGauche === '||' ? `("||", ${body})` : body)
    } else {
      const barre = signeToVartableBar(cellules[2 * i])
      parts.push(barre != null ? `("${barre}", ${body})` : body)
    }
  }
  const barreDroite = signeToVartableBar(cellules[cellules.length - 1])
  if (barreDroite === '||') parts.push('"||"')
  return `(${parts.join(', ')},)`
}

/**
 * Contenu `contents` pour une ligne de variations. Les flèches (sens de
 * variation) sont lues directement dans `ligne.fleches` (config figée, ou
 * déjà corrigée par `configCorrige`) : comme pour l'export LaTeX
 * (`buildTkzTabVar`), l'état de l'élève ne les modifie pas.
 */
function buildVariationRowContents(
  ligne: { fleches: LigneVariation['fleches']; valeurs: CelluleValeur[] },
  ligneIndex: number,
  valeurs: string[],
  state: Record<string, string>,
  couleurMiseEnEvidence: string,
): string {
  const positions = internalPositionsFromFleches(valeurs.length, ligne.fleches)
  const parts: string[] = []
  valeurs.forEach((latex, i) => {
    const pos = positions[i] === 'haut' ? 'top' : 'bottom'
    const mark = ligne.valeurs[i].highlight ? couleurMiseEnEvidence : undefined
    const body = typstMathContent(latex, mark)
    const droiteKey = `L${ligneIndex + 1}C${i}R`
    const latexD = state[droiteKey] ?? ligne.valeurs[i].latexDroite
    if (latexD !== undefined) {
      const nextSens = ligne.fleches[i]?.sens ?? ''
      const posD =
        nextSens === 'haut' ? 'bottom'
        : nextSens === 'bas' ? 'top'
        : pos
      const bodyD = typstMathContent(latexD, mark)
      parts.push(
        posD === pos
          ? `(${pos}, "||", ${body}, ${bodyD})`
          : `(${pos}, ${posD}, "||", ${body}, ${bodyD})`,
      )
    } else {
      parts.push(`(${pos}, ${body})`)
    }
  })
  return `(${parts.join(', ')},)`
}

/**
 * Hauteur imposée aux lignes de signes, en mm : par défaut `vartable`
 * réserve un minimum de 13,5mm par ligne, ce qui est inutilement haut pour
 * des cellules ne contenant qu'un symbole (`+`, `-`, `0`). `vartable`
 * accepte une hauteur explicite en 2ᵉ position du `label` (cf. doc
 * `vartable` §4.3 « Redimensionner la hauteur des sous-tableaux ») qui
 * remplace ce calcul automatique.
 *
 * Volontairement PAS appliqué aux lignes de variations : leur hauteur code
 * l'information visuelle (l'amplitude du zigzag des flèches montantes/
 * descendantes) — une hauteur imposée trop petite aplatit les flèches au
 * point de rendre haut/bas indiscernables (vérifié empiriquement : à 9mm,
 * un zigzag haut/bas/haut devient visuellement une ligne quasi droite). Le
 * calcul automatique s'adapte aussi à la taille du contenu (ex. fractions
 * en valeur de `f(x)`), qu'une hauteur fixe risquerait de tronquer.
 */
const SIGN_ROW_HEIGHT = '9mm'

/**
 * Un tableau « à compléter » (élève) a toutes ses flèches de variation
 * vides (`sens: ''`) : `vartable` dessine pourtant une flèche horizontale
 * par défaut entre deux valeurs sans sens connu, ce qui donnerait à tort
 * l'impression que le sens de variation est déjà indiqué. On désactive donc
 * le dessin des flèches (tête ET trait, via `arrow-mark`/`arrow-style`)
 * lorsqu'aucune flèche de variation n'a de sens renseigné dans la config
 * passée à `toTypst` (le cas du corrigé, où `configCorrige` a rempli les
 * flèches attendues, n'est pas concerné).
 */
function hasAnyFlecheSens(config: TableauSVConfig): boolean {
  return config.lignes.some(
    (ligne) => ligne.type === 'variation' && ligne.fleches.some((f) => f.sens !== ''),
  )
}

/**
 * Génère le code Typst (package `vartable`, fonction `tabvar`) pour un
 * tableau de signes/variations. Miroir de `toLatex` (tkz-tab) : mêmes
 * valeurs effectives (`resolveValues`), mêmes conventions (cellule éditable
 * sans saisie → valeur de la config, donc vide pour un tableau « à
 * compléter »).
 *
 * Le résultat est destiné à être inséré tel quel dans le document via le
 * marqueur `<mathalea-typst>` (voir `latexToTypst.ts`), pas à être imbriqué
 * dans du HTML converti.
 *
 * Limitations volontaires (cas non rencontrés dans les exercices actuels) :
 * pas de gestion des lignes `type: 'valeur'` avec une sémantique propre (
 * rendues comme une ligne de variations sans flèches, faute d'équivalent
 * natif dans `vartable`), pas de hachurage pour les flèches `'interdite'`
 * (déjà non géré par l'export LaTeX), pas de discontinuité aux antécédents
 * extrêmes (colonne 0 ou dernière colonne).
 */
export function toTypst(
  config: TableauSVConfig,
  state: Record<string, string> = {},
): string {
  const values = resolveValues(config, state)
  const variableName = config.variableName ?? 'x'
  const domain = config.colonnes
    .map((colonne, j) =>
      typstMathContent(
        values.headerCells[j],
        colonne.highlight ? orangeMathalea : undefined,
      ),
    )
    .join(', ')
  const hideFleches =
    config.lignes.some((ligne) => ligne.type === 'variation') && !hasAnyFlecheSens(config)
  const flecheMiseEnEvidence = config.lignes.some(
    (ligne) => ligne.type === 'variation' && ligne.fleches.some((f) => f.highlight === true),
  )
  const couleurFleches =
    config.couleur ?? (flecheMiseEnEvidence ? orangeMathalea : undefined)

  const labelParts: string[] = []
  const contentParts: string[] = []
  config.lignes.forEach((ligne, i) => {
    const labelBody = typstLabelContent(ligne.label)
    if (ligne.type === 'signe') {
      labelParts.push(`(${labelBody}, ${SIGN_ROW_HEIGHT}, "s")`)
      contentParts.push(
        buildSignRowContents(
          values.cellsByLigne[i] as SigneSymbol[],
          ligne.cellules.map((cellule) => cellule.highlight === true),
          orangeMathalea,
        ),
      )
    } else if (ligne.type === 'variation') {
      labelParts.push(`(${labelBody}, "v")`)
      contentParts.push(
        buildVariationRowContents(
          ligne,
          i,
          values.cellsByLigne[i] as string[],
          state,
          orangeMathalea,
        ),
      )
    } else {
      labelParts.push(`(${labelBody}, "v")`)
      contentParts.push(
        buildVariationRowContents(
          { fleches: [], valeurs: ligne.valeurs },
          i,
          values.cellsByLigne[i] as string[],
          state,
          orangeMathalea,
        ),
      )
    }
  })

  const lines: string[] = []
  if (config.couleur !== undefined) {
    const c = typstColor(config.couleur)
    lines.push(`#text(fill: ${c})[`)
  }
  lines.push('#tabvar(')
  lines.push(`  variable: $${latexFragmentToTypstMath(variableName)}$,`)
  // Virgule finale obligatoire : en Typst, `(a,)` est un array à 1 élément,
  // `(a)` n'est qu'une expression parenthésée (ambiguïté qui ne se manifeste
  // que pour un tableau à 1 seule colonne / 1 seule ligne).
  lines.push(`  domain: (${domain},),`)
  lines.push(`  label: (${labelParts.join(', ')},),`)
  if (hideFleches) {
    lines.push('  arrow-mark: (end: none),')
    lines.push('  arrow-style: (stroke: (thickness: 0pt)),')
  }
  if (config.couleur !== undefined) {
    const c = typstColor(config.couleur)
    lines.push(`  table-style: (stroke: 1pt + ${c}, mark: (symbol: none)),`)
    lines.push(`  line-style: (stroke: 1pt + ${c}),`)
  }
  // Flèches mises en évidence (correction) : `arrow-style` les colore toutes,
  // ce qui convient car seules les flèches à compléter sont marquées.
  if (!hideFleches && couleurFleches !== undefined) {
    lines.push(`  arrow-style: (stroke: 1pt + ${typstColor(couleurFleches)}),`)
  }
  lines.push('  contents: (')
  for (const part of contentParts) lines.push(`    ${part},`)
  lines.push('  ),')
  lines.push(')')
  if (config.couleur !== undefined) lines.push(']')
  return lines.join('\n')
}
