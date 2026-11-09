import { shuffle } from './arrayOutils'

/**
 * Génération et analyse de « tables de multiplication effacées ».
 *
 * La grille est un tableau de multiplication de côté `taille` : la première
 * ligne et la première colonne portent les facteurs, chaque case intérieure
 * porte le produit du facteur de sa ligne par celui de sa colonne. La case du
 * coin (en haut à gauche) porte le signe `×` et ne se remplit pas.
 *
 * Règles du jeu :
 * - tous les nombres écrits sont des entiers strictement positifs ;
 * - sur une même ligne ou une même colonne, un nombre n'apparaît jamais deux
 *   fois.
 *
 * Ces deux règles suffisent à imposer des facteurs supérieurs ou égaux à `2` et
 * tous distincts sur la première ligne comme sur la première colonne : un
 * facteur `1` recopierait l'en-tête dans sa rangée, deux facteurs égaux
 * répéteraient un produit dans une colonne. Une grille valide est donc
 * entièrement décrite par ses facteurs de lignes et de colonnes.
 *
 * Ce module ne dépend ni du DOM ni de MathALÉA : il est testable seul. Seule la
 * génération tire au hasard ; le dénombrement des solutions
 * (`compteSolutionsTables`) et le solveur déductif (`estResoluble`) sont
 * déterministes, pour ne pas déplacer les tirages d'un exercice (voir
 * `documentation/tests/stabilite-exercices.md`).
 *
 * @author Rémi Angot
 */

export type GrilleTables = {
  /** Côté du tableau : nombre de facteurs de lignes et de colonnes. */
  taille: number
  /** Facteurs de lignes, de haut en bas. */
  lignes: number[]
  /** Facteurs de colonnes, de gauche à droite. */
  colonnes: number[]
  /**
   * Index des cases dont le contenu est donné dans l'énoncé, triés. Les index
   * parcourent la grille complète de côté `taille + 1`, coin compris
   * (`ligne * (taille + 1) + colonne`).
   */
  donnees: number[]
}

export type OptionsTables = {
  /** Côté du tableau, ramené entre 2 et 6. */
  taille: number
  /** Plus petit facteur possible (au moins 2). */
  facteurMin?: number
  /** Plus grand facteur possible. */
  facteurMax?: number
  /**
   * Ramène le nombre de cases vides à `nbCasesVides(taille)`, pour un score
   * fixe. Sans cette option, le nombre de cases vides varie d'un tirage à
   * l'autre et les tirages restent ceux de la première version de l'exercice.
   */
  casesVidesFixes?: boolean
}

/** Le côté de la grille complète, en-têtes compris. */
export function coteComplet(taille: number): number {
  return taille + 1
}

function ligneDe(index: number, cote: number): number {
  return Math.floor(index / cote)
}

function colonneDe(index: number, cote: number): number {
  return index % cote
}

/**
 * La valeur portée par une case de la grille complète, ou `null` pour le coin
 * qui n'accueille que le signe `×`.
 */
export function valeurCase(grille: GrilleTables, index: number): number | null {
  const cote = coteComplet(grille.taille)
  const ligne = ligneDe(index, cote)
  const colonne = colonneDe(index, cote)
  if (ligne === 0 && colonne === 0) return null
  if (ligne === 0) return grille.colonnes[colonne - 1]
  if (colonne === 0) return grille.lignes[ligne - 1]
  return grille.lignes[ligne - 1] * grille.colonnes[colonne - 1]
}

/** La solution complète, indexée comme la grille ; le coin vaut `0`. */
export function solutionComplete(grille: GrilleTables): number[] {
  const cote = coteComplet(grille.taille)
  return Array.from(
    { length: cote * cote },
    (_, index) => valeurCase(grille, index) ?? 0,
  )
}

/** Toutes les cases à remplir ou à donner : la grille entière sauf le coin. */
export function toutesLesCases(taille: number): number[] {
  const cote = coteComplet(taille)
  const cases: number[] = []
  for (let index = 1; index < cote * cote; index++) cases.push(index)
  return cases
}

/** Les diviseurs `d` de `produit` tels que `d ≥ 2` et `produit / d ≥ 2`. */
function diviseursUtiles(produit: number): number[] {
  const diviseurs: number[] = []
  for (let d = 2; d * 2 <= produit; d++) {
    if (produit % d === 0) diviseurs.push(d)
  }
  return diviseurs
}

/** Ce que l'énoncé révèle, trié par nature de case. */
type Contraintes = {
  /** Facteur de colonne donné, par index de colonne (0 à `taille - 1`). */
  colonneFixee: (number | null)[]
  /** Facteur de ligne donné, par index de ligne. */
  ligneFixee: (number | null)[]
  /** Produits donnés à l'intérieur du tableau. */
  interieur: { ligne: number; colonne: number; produit: number }[]
}

function litLesContraintes(
  grille: GrilleTables,
  donnees: Iterable<number>,
): Contraintes {
  const taille = grille.taille
  const cote = coteComplet(taille)
  const colonneFixee = new Array<number | null>(taille).fill(null)
  const ligneFixee = new Array<number | null>(taille).fill(null)
  const interieur: Contraintes['interieur'] = []
  for (const index of donnees) {
    const ligne = ligneDe(index, cote)
    const colonne = colonneDe(index, cote)
    if (ligne === 0 && colonne === 0) continue
    const valeur = valeurCase(grille, index)
    if (valeur == null) continue
    if (ligne === 0) colonneFixee[colonne - 1] = valeur
    else if (colonne === 0) ligneFixee[ligne - 1] = valeur
    else {
      interieur.push({ ligne: ligne - 1, colonne: colonne - 1, produit: valeur })
    }
  }
  return { colonneFixee, ligneFixee, interieur }
}

/**
 * Nombre de couples (facteurs de lignes, facteurs de colonnes) compatibles avec
 * les cases données, plafonné à `limite`.
 *
 * L'énoncé ne fixe aucune borne supérieure aux facteurs : une ligne ou une
 * colonne sans aucune case donnée en autoriserait une infinité, la grille est
 * alors comptée comme non déterminée (`limite` est renvoyé). Sinon chaque
 * facteur de colonne divise les produits donnés de sa colonne : les candidats
 * se réduisent à quelques diviseurs, et l'énumération reste courte.
 */
export function compteSolutionsTables(
  grille: GrilleTables,
  donnees: Iterable<number>,
  limite = 2,
): number {
  const taille = grille.taille
  const { colonneFixee, ligneFixee, interieur } = litLesContraintes(
    grille,
    donnees,
  )

  const produitsColonne: number[][] = Array.from({ length: taille }, () => [])
  const produitsLigne: number[][] = Array.from({ length: taille }, () => [])
  for (const { ligne, colonne, produit } of interieur) {
    produitsColonne[colonne].push(produit)
    produitsLigne[ligne].push(produit)
  }
  for (let j = 0; j < taille; j++) {
    if (colonneFixee[j] == null && produitsColonne[j].length === 0) return limite
  }
  for (let i = 0; i < taille; i++) {
    if (ligneFixee[i] == null && produitsLigne[i].length === 0) return limite
  }

  const candidatsColonne: number[][] = []
  for (let j = 0; j < taille; j++) {
    if (colonneFixee[j] != null) {
      candidatsColonne.push([colonneFixee[j] as number])
      continue
    }
    const produits = produitsColonne[j]
    const petit = Math.min(...produits)
    candidatsColonne.push(
      diviseursUtiles(petit).filter((d) =>
        produits.every((produit) => produit % d === 0 && produit / d >= 2),
      ),
    )
  }

  // Les colonnes les plus contraintes sont placées d'abord.
  const ordre = Array.from({ length: taille }, (_, j) => j).sort(
    (a, b) => candidatsColonne[a].length - candidatsColonne[b].length,
  )
  const choix = new Array<number>(taille).fill(0)
  const prises = new Set<number>()
  let solutions = 0

  const compteLignes = (): void => {
    const facteurs = new Array<number | null>(taille).fill(null)
    for (let i = 0; i < taille; i++) {
      if (ligneFixee[i] != null) facteurs[i] = ligneFixee[i]
    }
    for (const { ligne, colonne, produit } of interieur) {
      const facteurColonne = choix[colonne]
      if (produit % facteurColonne !== 0) return
      const facteurLigne = produit / facteurColonne
      if (facteurLigne < 2) return
      if (facteurs[ligne] != null && facteurs[ligne] !== facteurLigne) return
      facteurs[ligne] = facteurLigne
    }
    const vues = new Set<number>()
    for (let i = 0; i < taille; i++) {
      const facteur = facteurs[i]
      if (facteur == null || vues.has(facteur)) return
      vues.add(facteur)
    }
    solutions++
  }

  const explore = (rang: number): void => {
    if (solutions >= limite) return
    if (rang === taille) {
      compteLignes()
      return
    }
    const j = ordre[rang]
    for (const facteur of candidatsColonne[j]) {
      if (prises.has(facteur)) continue
      // Les produits donnés de la colonne imposent un facteur de ligne entier ;
      // la cohérence fine (facteurs de lignes fixés, doublons) est tranchée par
      // `compteLignes()` une fois toutes les colonnes choisies.
      const possible = produitsColonne[j].every(
        (produit) => produit % facteur === 0 && produit / facteur >= 2,
      )
      if (!possible) continue
      choix[j] = facteur
      prises.add(facteur)
      explore(rang + 1)
      prises.delete(facteur)
      if (solutions >= limite) return
    }
  }

  explore(0)
  return solutions
}

/**
 * Vrai quand la grille se résout par déductions simples : divisibilité des
 * produits donnés, puis élimination des facteurs déjà placés sur la première
 * ligne ou la première colonne.
 *
 * Toutes les règles employées sont des éliminations logiquement valides : une
 * grille entièrement résolue ici n'admet donc qu'une seule solution. Le
 * générateur s'en sert pour ne retenir que des grilles faisables sans essais.
 */
export function estResoluble(
  grille: GrilleTables,
  donnees: Iterable<number>,
): boolean {
  const taille = grille.taille
  const { colonneFixee, ligneFixee, interieur } = litLesContraintes(
    grille,
    donnees,
  )

  const produitsColonne: number[][] = Array.from({ length: taille }, () => [])
  const produitsLigne: number[][] = Array.from({ length: taille }, () => [])
  for (const { ligne, colonne, produit } of interieur) {
    produitsColonne[colonne].push(produit)
    produitsLigne[ligne].push(produit)
  }
  for (let j = 0; j < taille; j++) {
    if (colonneFixee[j] == null && produitsColonne[j].length === 0) return false
  }
  for (let i = 0; i < taille; i++) {
    if (ligneFixee[i] == null && produitsLigne[i].length === 0) return false
  }

  const candidats = (
    fixe: number | null,
    produits: number[],
  ): Set<number> => {
    if (fixe != null) return new Set([fixe])
    const petit = Math.min(...produits)
    return new Set(
      diviseursUtiles(petit).filter((d) =>
        produits.every((produit) => produit % d === 0 && produit / d >= 2),
      ),
    )
  }

  const candidatsColonne = colonneFixee.map((fixe, j) =>
    candidats(fixe, produitsColonne[j]),
  )
  const candidatsLigne = ligneFixee.map((fixe, i) =>
    candidats(fixe, produitsLigne[i]),
  )

  const retire = (ensemble: Set<number>, valeur: number): boolean =>
    ensemble.delete(valeur)

  const singletonUnique = (ensembles: Set<number>[]): boolean => {
    let changement = false
    for (let a = 0; a < ensembles.length; a++) {
      if (ensembles[a].size !== 1) continue
      const [valeur] = ensembles[a]
      for (let b = 0; b < ensembles.length; b++) {
        if (b !== a && retire(ensembles[b], valeur)) changement = true
      }
    }
    return changement
  }

  const croiseLesProduits = (): boolean => {
    let changement = false
    for (const { ligne, colonne, produit } of interieur) {
      const colonnePossibles = [...candidatsColonne[colonne]].filter((d) =>
        [...candidatsLigne[ligne]].some((e) => d * e === produit),
      )
      const lignePossibles = [...candidatsLigne[ligne]].filter((e) =>
        [...candidatsColonne[colonne]].some((d) => d * e === produit),
      )
      if (colonnePossibles.length !== candidatsColonne[colonne].size) {
        candidatsColonne[colonne] = new Set(colonnePossibles)
        changement = true
      }
      if (lignePossibles.length !== candidatsLigne[ligne].size) {
        candidatsLigne[ligne] = new Set(lignePossibles)
        changement = true
      }
    }
    return changement
  }

  const tous = () => [...candidatsColonne, ...candidatsLigne]
  let etapes = 0
  const LIMITE = taille * taille * 8
  while (etapes++ < LIMITE) {
    if (tous().some((ensemble) => ensemble.size === 0)) return false
    const bouge =
      croiseLesProduits() ||
      singletonUnique(candidatsColonne) ||
      singletonUnique(candidatsLigne)
    if (!bouge) break
  }
  return tous().every((ensemble) => ensemble.size === 1)
}

/** Tire `combien` facteurs distincts dans `[facteurMin ; facteurMax]`. */
function choisitFacteurs(
  facteurMin: number,
  facteurMax: number,
  combien: number,
): number[] {
  const pool: number[] = []
  for (let facteur = facteurMin; facteur <= facteurMax; facteur++) {
    pool.push(facteur)
  }
  return shuffle(pool).slice(0, combien)
}

/**
 * Nombre de cases à compléter, identique pour toutes les grilles d'une taille
 * donnée : le score d'une question interactive vaut un point par case, il doit
 * rester fixe quel que soit le tirage.
 *
 * Ces valeurs sont les plus petits nombres de cases vides que l'effacement
 * glouton de `genereTablesEffacees` atteint en pratique : une grille qui en
 * compte davantage est complétée par des cases révélées, une grille qui en
 * compte moins est retirée.
 */
const CASES_VIDES_PAR_TAILLE: Record<number, number> = {
  2: 4,
  3: 9,
  4: 16,
  5: 25,
  6: 37,
}

/** Le nombre de cases à compléter dans une grille de cette taille. */
export function nbCasesVides(taille: number): number {
  return CASES_VIDES_PAR_TAILLE[Math.min(6, Math.max(2, Math.round(taille)))]
}

/**
 * Une grille de « tables effacées » à solution unique et résoluble sans essais.
 *
 * On tire des facteurs de lignes et de colonnes, on part de la grille toute
 * dévoilée, puis on efface une à une les cases tant que la grille reste à
 * solution unique et déductible. Avec `casesVidesFixes`, le nombre de cases
 * vides est ensuite ramené à `nbCasesVides(taille)` : révéler une case de plus
 * conserve l'unicité et la déductibilité, alors qu'une grille trop peu effacée
 * est tirée à nouveau.
 */
export function genereTablesEffacees(options: OptionsTables): GrilleTables {
  const taille = Math.min(6, Math.max(2, Math.round(options.taille)))
  const facteurMin = Math.max(2, Math.round(options.facteurMin ?? 2))
  const facteurMax = Math.max(
    facteurMin + taille - 1,
    Math.round(options.facteurMax ?? 9),
  )
  const cases = toutesLesCases(taille)
  const viseVides = options.casesVidesFixes ? nbCasesVides(taille) : 0

  for (;;) {
    const lignes = choisitFacteurs(facteurMin, facteurMax, taille)
    const colonnes = choisitFacteurs(facteurMin, facteurMax, taille)
    const grille: GrilleTables = { taille, lignes, colonnes, donnees: [] }

    const revelees = new Set(cases)
    for (const index of shuffle(cases)) {
      revelees.delete(index)
      if (
        compteSolutionsTables(grille, revelees, 2) !== 1 ||
        !estResoluble(grille, revelees)
      ) {
        revelees.add(index)
      }
    }

    const vides = cases.filter((index) => !revelees.has(index))
    if (viseVides > 0) {
      if (vides.length < viseVides) continue
      for (const index of shuffle(vides).slice(0, vides.length - viseVides)) {
        revelees.add(index)
      }
    }

    grille.donnees = [...revelees].sort((a, b) => a - b)
    return grille
  }
}

/**
 * Une case donnée intérieure dont le facteur de colonne (ou de ligne) est déjà
 * connu : c'est par elle qu'il est le plus simple de commencer, la correction
 * s'ouvre donc dessus.
 *
 * Renvoie une phrase toute faite, ou une chaîne vide si aucune amorce évidente
 * ne se dégage.
 */
export function amorceCorrection(grille: GrilleTables): string {
  const cote = coteComplet(grille.taille)
  const donnees = new Set(grille.donnees)
  const colonneDonnee = (j: number) => donnees.has(0 * cote + (j + 1))
  const ligneDonnee = (i: number) => donnees.has((i + 1) * cote + 0)

  for (let i = 0; i < grille.taille; i++) {
    for (let j = 0; j < grille.taille; j++) {
      const index = (i + 1) * cote + (j + 1)
      if (!donnees.has(index)) continue
      const produit = grille.lignes[i] * grille.colonnes[j]
      if (colonneDonnee(j) && !ligneDonnee(i)) {
        return (
          `Commencer par la case $${produit}$ : le facteur $${grille.colonnes[j]}$ ` +
          `en haut de sa colonne est connu, donc le facteur de sa ligne vaut ` +
          `$${produit} \\div ${grille.colonnes[j]} = ${grille.lignes[i]}$.<br>` +
          'Les autres cases se complètent ensuite de proche en proche.<br>'
        )
      }
      if (ligneDonnee(i) && !colonneDonnee(j)) {
        return (
          `Commencer par la case $${produit}$ : le facteur $${grille.lignes[i]}$ ` +
          `au début de sa ligne est connu, donc le facteur de sa colonne vaut ` +
          `$${produit} \\div ${grille.lignes[i]} = ${grille.colonnes[j]}$.<br>` +
          'Les autres cases se complètent ensuite de proche en proche.<br>'
        )
      }
    }
  }

  // À défaut, la plus petite case donnée intérieure : sa décomposition est la
  // plus rapide à chercher.
  let meilleure: { produit: number; i: number; j: number } | null = null
  for (let i = 0; i < grille.taille; i++) {
    for (let j = 0; j < grille.taille; j++) {
      const index = (i + 1) * cote + (j + 1)
      if (!donnees.has(index)) continue
      const produit = grille.lignes[i] * grille.colonnes[j]
      if (meilleure === null || produit < meilleure.produit) {
        meilleure = { produit, i, j }
      }
    }
  }
  if (meilleure === null) return ''
  return (
    `Commencer par la case $${meilleure.produit}$ : chercher les deux facteurs ` +
    `dont le produit vaut $${meilleure.produit}$ sans répéter un nombre déjà ` +
    'présent sur sa ligne ou sa colonne.<br>' +
    'Les autres cases se complètent ensuite de proche en proche.<br>'
  )
}
