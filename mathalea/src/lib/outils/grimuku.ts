import { randint } from '../../modules/outils'
import { choice, shuffle } from './arrayOutils'

/**
 * Génération et analyse de grilles de grimuku.
 *
 * Une grille de grimuku est un damier de cases blanches à remplir avec des
 * chiffres de 1 à 9, entrecoupé de cases grises. Chaque case grise porte une ou
 * deux flèches : le nombre écrit avant la flèche est le produit des chiffres
 * des cases blanches qu'elle désigne. Contrairement au kakuro, un même chiffre
 * peut se répéter dans une flèche : le produit 27 sur quatre cases impose par
 * exemple 1, 1, 3 et 9, ou 1, 3, 3 et 3.
 *
 * Ce module ne dépend ni du DOM ni de MathALÉA : il est testable seul.
 * Seule la génération tire au hasard ; l'analyse (`evalueDifficulte`) est
 * déterministe, pour ne pas déplacer les tirages d'un exercice (voir
 * `documentation/tests/stabilite-exercices.md`).
 *
 * @author Rémi Angot
 */

/** Sens de lecture d'une flèche, depuis sa case grise. */
export type DirectionGrimuku = 'droite' | 'gauche' | 'haut' | 'bas'

export type FlecheGrimuku = {
  /** Index de la case grise qui porte le nombre. */
  indice: number
  direction: DirectionGrimuku
  /** Cases blanches désignées, de la plus proche de la case grise à la plus lointaine. */
  cases: number[]
  /** Produit des chiffres des cases. */
  produit: number
}

export type GrilleGrimuku = {
  lignes: number
  colonnes: number
  /** `true` pour une case grise, indexé par `ligne * colonnes + colonne`. */
  grises: boolean[]
  /** Chiffre attendu dans chaque case blanche ; 0 pour une case grise. */
  solution: number[]
  fleches: FlecheGrimuku[]
  /** Cases blanches dont le chiffre est écrit d'avance dans l'énoncé. */
  donnees: number[]
}

/** Un format de grille proposé au professeur, avec le barème qui lui correspond. */
export type FormatGrimuku = { lignes: number; colonnes: number; points: number }

/**
 * Les formats de grille proposés, dans l'ordre du formulaire, avec le nombre
 * de points sur lequel la grille est notée : autant que son côté pour une
 * grille carrée, 8 pour la grille 6 × 9.
 */
export const FORMATS_GRIMUKU: FormatGrimuku[] = [
  { lignes: 5, colonnes: 5, points: 5 },
  { lignes: 6, colonnes: 6, points: 6 },
  { lignes: 7, colonnes: 7, points: 7 },
  { lignes: 6, colonnes: 9, points: 8 },
]

/** Le format de grille correspondant au rang choisi dans le formulaire. */
export function formatGrimuku(rang: unknown): FormatGrimuku {
  const index = Math.round(Number(rang))
  return FORMATS_GRIMUKU[
    Math.min(FORMATS_GRIMUKU.length, Math.max(1, index || 2)) - 1
  ]
}

/** 1 : facile, 2 : moyen, 3 : difficile. */
export type NiveauGrimuku = 1 | 2 | 3

export type OptionsGrimuku = {
  lignes: number
  colonnes: number
  niveau: NiveauGrimuku
}

export type EvaluationGrimuku = {
  /** La grille se résout par déduction, sans essayer de chiffre au hasard. */
  resolue: boolean
  /** Niveau de la règle la plus savante utilisée : 0 si aucune, 1 à 3 sinon. */
  niveauMax: number
  /** Nombre de déductions enchaînées. */
  nbEtapes: number
  /** Cases blanches que la déduction n'a pas déterminées. */
  nonResolues: number[]
}

/** Nombre de grilles tirées avant de garder la meilleure : une génération ne doit jamais diverger. */
const NOMBRE_DE_TENTATIVES = 40
/** Nombre de remplissages essayés avant d'accepter des produits trop grands. */
const NOMBRE_DE_REMPLISSAGES = 30
/** Garde-fou du solveur déductif. */
const LIMITE_ETAPES = 600
/** Garde-fou de l'énumération des contenus possibles d'une flèche. */
const LIMITE_ENUMERATION = 40000

/** Les chiffres utilisables dans une case blanche. */
const CHIFFRES = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/**
 * Réglages dérivés du niveau de difficulté.
 *
 * La période du motif fixe la longueur des flèches : des cases grises tous les
 * `longueurMax + 1` pas laissent des suites de `longueurMax` cases blanches.
 * Plus les flèches sont longues, plus les chiffres doivent être petits pour que
 * les produits restent calculables de tête.
 */
function reglagesDuNiveau(niveau: NiveauGrimuku): {
  longueurMax: number
  produitMax: number
  chiffres: number[]
  partDesDonnees: number
} {
  if (niveau === 1) {
    return {
      longueurMax: 2,
      produitMax: 81,
      chiffres: CHIFFRES,
      partDesDonnees: 0.4,
    }
  }
  if (niveau === 2) {
    return {
      longueurMax: 3,
      produitMax: 150,
      chiffres: [1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8, 9],
      partDesDonnees: 0.2,
    }
  }
  return {
    longueurMax: 4,
    produitMax: 250,
    chiffres: [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6, 7, 8, 9],
    partDesDonnees: 0.1,
  }
}

function ligneDe(index: number, colonnes: number): number {
  return Math.floor(index / colonnes)
}

function colonneDe(index: number, colonnes: number): number {
  return index % colonnes
}

/**
 * Le motif des cases grises : une diagonale sur `periode`.
 *
 * Ce motif régulier laisse partout des suites de `periode - 1` cases blanches,
 * bordées d'une case grise à chaque extrémité : chaque flèche a donc où
 * s'accrocher, et la grille garde l'allure d'un damier en escalier.
 */
export function motifDesCasesGrises(
  lignes: number,
  colonnes: number,
  periode: number,
  decalage: number,
  montante: boolean,
): boolean[] {
  const grises = new Array<boolean>(lignes * colonnes).fill(false)
  for (let ligne = 0; ligne < lignes; ligne++) {
    for (let colonne = 0; colonne < colonnes; colonne++) {
      const diagonale = montante ? ligne + colonne : ligne - colonne
      const reste = (((diagonale + decalage) % periode) + periode) % periode
      grises[ligne * colonnes + colonne] = reste === 0
    }
  }
  return grises
}

/** Les suites maximales de cases blanches, dans un sens ou dans l'autre. */
function suitesDeCasesBlanches(
  grises: boolean[],
  lignes: number,
  colonnes: number,
  horizontal: boolean,
): number[][] {
  const suites: number[][] = []
  const nbExterieur = horizontal ? lignes : colonnes
  const nbInterieur = horizontal ? colonnes : lignes
  for (let exterieur = 0; exterieur < nbExterieur; exterieur++) {
    let courante: number[] = []
    for (let interieur = 0; interieur < nbInterieur; interieur++) {
      const index = horizontal
        ? exterieur * colonnes + interieur
        : interieur * colonnes + exterieur
      if (grises[index]) {
        if (courante.length > 0) suites.push(courante)
        courante = []
      } else {
        courante.push(index)
      }
    }
    if (courante.length > 0) suites.push(courante)
  }
  return suites
}

/**
 * Accroche une flèche à chaque suite d'au moins deux cases blanches.
 *
 * Une case grise ne porte qu'une flèche horizontale et une flèche verticale au
 * plus : c'est ce qui permet de l'afficher en deux moitiés, comme sur les
 * grilles imprimées. Chaque suite a donc au plus deux points d'accrochage, un à
 * chaque extrémité, et il faut les répartir sans conflit.
 *
 * Un simple « premier arrivé, premier servi » laisserait des suites sans
 * flèche, donc des cases à écrire d'avance dans l'énoncé : on cherche un
 * couplage maximal (algorithme de Kuhn), quitte à déplacer une flèche déjà
 * posée vers son autre extrémité.
 */
function accrocheLesFleches(
  grises: boolean[],
  lignes: number,
  colonnes: number,
): { indice: number; direction: DirectionGrimuku; cases: number[] }[] {
  const suites = shuffle([
    ...suitesDeCasesBlanches(grises, lignes, colonnes, true).map((cases) => ({
      cases,
      horizontal: true,
    })),
    ...suitesDeCasesBlanches(grises, lignes, colonnes, false).map((cases) => ({
      cases,
      horizontal: false,
    })),
  ]).filter((suite) => suite.cases.length >= 2)

  const memeLigne = (premiere: number, seconde: number): boolean =>
    ligneDe(premiere, colonnes) === ligneDe(seconde, colonnes)

  /** Les extrémités grises où la flèche d'une suite peut s'accrocher. */
  const accrochesPossibles = suites.map(({ cases, horizontal }) => {
    const pas = horizontal ? 1 : colonnes
    const avant = cases[0] - pas
    const apres = cases[cases.length - 1] + pas
    const possibles: { indice: number; direction: DirectionGrimuku }[] = []
    // Une case grise placée avant la suite la pointe dans le sens de lecture ;
    // placée après, elle la lit à rebours.
    if (
      avant >= 0 &&
      grises[avant] &&
      (!horizontal || memeLigne(avant, cases[0]))
    ) {
      possibles.push({
        indice: avant,
        direction: horizontal ? 'droite' : 'bas',
      })
    }
    if (
      apres < grises.length &&
      grises[apres] &&
      (!horizontal || memeLigne(apres, cases[cases.length - 1]))
    ) {
      possibles.push({
        indice: apres,
        direction: horizontal ? 'gauche' : 'haut',
      })
    }
    return shuffle(possibles)
  })

  const emplacement = (numero: number, indice: number): string =>
    `${indice}${suites[numero].horizontal ? 'h' : 'v'}`
  const occupant = new Map<string, number>()
  const retenue = new Map<
    number,
    { indice: number; direction: DirectionGrimuku }
  >()
  const attache = (numero: number, vus: Set<string>): boolean => {
    for (const possible of accrochesPossibles[numero]) {
      const place = emplacement(numero, possible.indice)
      if (vus.has(place)) continue
      vus.add(place)
      const precedent = occupant.get(place)
      // La place est libre, ou son occupant peut déménager sur son autre extrémité.
      if (precedent === undefined || attache(precedent, vus)) {
        occupant.set(place, numero)
        retenue.set(numero, possible)
        return true
      }
    }
    return false
  }
  // Les suites les plus contraintes d'abord : une suite qui n'a qu'une seule
  // extrémité grise doit la réserver avant les autres.
  const ordre = suites
    .map((_, numero) => numero)
    .sort(
      (premier, second) =>
        accrochesPossibles[premier].length - accrochesPossibles[second].length,
    )
  for (const numero of ordre) attache(numero, new Set())

  return [...retenue.entries()].map(([numero, accroche]) => ({
    ...accroche,
    // Les cases sont rangées depuis la case grise : la première est celle que
    // la flèche touche.
    cases:
      accroche.direction === 'gauche' || accroche.direction === 'haut'
        ? [...suites[numero].cases].reverse()
        : suites[numero].cases,
  }))
}

/** Le produit des chiffres d'une flèche. */
function produitDesCases(cases: number[], solution: number[]): number {
  return cases.reduce((produit, index) => produit * solution[index], 1)
}

/* -------------------------------------------------------------------------- */
/* Solveur déductif : c'est lui qui donne son niveau à une grille.             */
/* -------------------------------------------------------------------------- */

type Candidats = Set<number>[]

/** Les répartitions de chiffres compatibles avec la flèche et les candidats actuels. */
function repartitionsValides(
  fleche: FlecheGrimuku,
  candidats: Candidats,
): number[][] {
  const valides: number[][] = []
  const encours: number[] = []
  let noeuds = 0
  const explore = (position: number, restant: number): void => {
    if (noeuds++ > LIMITE_ENUMERATION) return
    if (position === fleche.cases.length) {
      if (restant === 1) valides.push([...encours])
      return
    }
    for (const chiffre of candidats[fleche.cases[position]]) {
      if (restant % chiffre !== 0) continue
      encours.push(chiffre)
      explore(position + 1, restant / chiffre)
      encours.pop()
    }
  }
  explore(0, fleche.produit)
  return valides
}

/** Retire des candidats d'une case ; renvoie `true` si quelque chose a changé. */
function retire(
  candidats: Candidats,
  index: number,
  chiffres: Iterable<number>,
): boolean {
  let changement = false
  for (const chiffre of chiffres) {
    if (candidats[index].delete(chiffre)) changement = true
  }
  return changement
}

/**
 * Résout la grille par déductions successives et note la plus savante d'entre elles.
 *
 * Les règles sont classées par difficulté croissante et toujours essayées dans
 * cet ordre : le niveau retenu est celui de la règle la plus savante dont
 * l'élève ne peut pas se passer. Toutes les règles sont des éliminations
 * logiquement valides, donc une grille entièrement résolue ici n'admet qu'une
 * seule solution.
 */
export function evalueDifficulte(grille: GrilleGrimuku): EvaluationGrimuku {
  const nbCases = grille.lignes * grille.colonnes
  const candidats: Candidats = Array.from(
    { length: nbCases },
    () => new Set(CHIFFRES),
  )
  const donnees = new Set(grille.donnees)
  for (const index of donnees) {
    candidats[index] = new Set([grille.solution[index]])
  }
  const blanches: number[] = []
  for (let index = 0; index < nbCases; index++) {
    if (!grille.grises[index]) blanches.push(index)
  }

  /**
   * Niveau 1 : chaque chiffre d'une flèche divise son produit, et une flèche
   * dont une seule case reste inconnue se termine par une division.
   */
  const diviseursEtDivision = (): boolean => {
    let changement = false
    for (const fleche of grille.fleches) {
      for (const index of fleche.cases) {
        const inutiles = [...candidats[index]].filter(
          (chiffre) => fleche.produit % chiffre !== 0,
        )
        if (retire(candidats, index, inutiles)) changement = true
      }
      const inconnues = fleche.cases.filter(
        (index) => candidats[index].size > 1,
      )
      if (inconnues.length !== 1) continue
      const connu = fleche.cases
        .filter((index) => candidats[index].size === 1)
        .reduce((produit, index) => produit * [...candidats[index]][0], 1)
      const manquant = fleche.produit / connu
      const inutiles = [...candidats[inconnues[0]]].filter(
        (chiffre) => chiffre !== manquant,
      )
      if (retire(candidats, inconnues[0], inutiles)) changement = true
    }
    return changement
  }

  /** Ne garde dans chaque case que les chiffres qu'une répartition valide lui donne. */
  const reduitLesFleches = (courtes: boolean): boolean => {
    let changement = false
    for (const fleche of grille.fleches) {
      if (courtes !== fleche.cases.length <= 3) continue
      const valides = repartitionsValides(fleche, candidats)
      if (valides.length === 0) {
        // Aucune répartition possible : la grille est incohérente, on vide la
        // flèche pour que la résolution s'arrête.
        for (const index of fleche.cases) candidats[index].clear()
        return true
      }
      fleche.cases.forEach((index, rang) => {
        const utiles = new Set(valides.map((repartition) => repartition[rang]))
        const inutiles = [...candidats[index]].filter(
          (chiffre) => !utiles.has(chiffre),
        )
        if (retire(candidats, index, inutiles)) changement = true
      })
    }
    return changement
  }

  const regles: { niveau: number; applique: () => boolean }[] = [
    { niveau: 1, applique: diviseursEtDivision },
    { niveau: 2, applique: () => reduitLesFleches(true) },
    { niveau: 3, applique: () => reduitLesFleches(false) },
  ]

  const estResolue = (): boolean =>
    blanches.every((index) => candidats[index].size === 1)
  const estIncoherente = (): boolean =>
    blanches.some((index) => candidats[index].size === 0)

  let niveauMax = 0
  let nbEtapes = 0
  while (!estResolue() && !estIncoherente() && nbEtapes < LIMITE_ETAPES) {
    const regle = regles.find((regle) => regle.applique())
    if (regle === undefined) break
    niveauMax = Math.max(niveauMax, regle.niveau)
    nbEtapes++
  }
  return {
    resolue: estResolue() && !estIncoherente(),
    niveauMax,
    nbEtapes,
    nonResolues: blanches.filter((index) => candidats[index].size !== 1),
  }
}

/**
 * Nombre de solutions de la grille, plafonné à `limite`.
 *
 * Les cases sont remplies flèche par flèche pour que chaque contrainte se
 * vérifie au plus tôt. Sert de contrôle indépendant dans les tests : la
 * génération, elle, s'appuie sur `evalueDifficulte`, dont la réussite prouve
 * déjà l'unicité.
 */
export function compteSolutions(grille: GrilleGrimuku, limite = 2): number {
  const flechesDeLaCase = new Map<number, FlecheGrimuku[]>()
  for (const fleche of grille.fleches) {
    for (const index of fleche.cases) {
      flechesDeLaCase.set(index, [
        ...(flechesDeLaCase.get(index) ?? []),
        fleche,
      ])
    }
  }
  const donnees = new Set(grille.donnees)
  const ordre = [
    ...new Set([
      ...grille.fleches.flatMap((fleche) => fleche.cases),
      ...casesBlanches(grille),
    ]),
  ].filter((index) => !donnees.has(index))
  const valeurs = new Array<number>(grille.lignes * grille.colonnes).fill(0)
  for (const index of donnees) valeurs[index] = grille.solution[index]

  /** Une flèche incomplète ne peut rien contredire ; complète, elle doit tomber juste. */
  const flecheSatisfaite = (fleche: FlecheGrimuku): boolean => {
    let partiel = 1
    let complete = true
    for (const index of fleche.cases) {
      if (valeurs[index] === 0) complete = false
      else partiel *= valeurs[index]
    }
    return complete
      ? partiel === fleche.produit
      : fleche.produit % partiel === 0
  }

  let solutions = 0
  const explore = (position: number): void => {
    if (solutions >= limite) return
    if (position === ordre.length) {
      solutions++
      return
    }
    const index = ordre[position]
    for (const chiffre of CHIFFRES) {
      valeurs[index] = chiffre
      if ((flechesDeLaCase.get(index) ?? []).every(flecheSatisfaite)) {
        explore(position + 1)
      }
      valeurs[index] = 0
    }
  }
  explore(0)
  return solutions
}

/**
 * Les répartitions de chiffres qu'une flèche peut accueillir au tout début de
 * la résolution, seuls les chiffres écrits d'avance étant pris en compte.
 *
 * Sert à désigner, dans la correction, la flèche par laquelle commencer.
 */
export function repartitionsPossibles(
  grille: GrilleGrimuku,
  fleche: FlecheGrimuku,
): number[][] {
  const candidats: Candidats = Array.from(
    { length: grille.lignes * grille.colonnes },
    () => new Set(CHIFFRES),
  )
  for (const index of grille.donnees) {
    candidats[index] = new Set([grille.solution[index]])
  }
  return repartitionsValides(fleche, candidats)
}

/* -------------------------------------------------------------------------- */
/* Génération                                                                  */
/* -------------------------------------------------------------------------- */

/** Compare deux grilles candidates, critère par critère, du plus important au moins. */
function estMeilleur(rang: number[], reference: number[]): boolean {
  for (let critere = 0; critere < rang.length; critere++) {
    if (rang[critere] !== reference[critere]) {
      return rang[critere] < reference[critere]
    }
  }
  return false
}

/** Une grille complète (motif, flèches, chiffres), sans contrôle de difficulté. */
function tenteUneGrille(
  lignes: number,
  colonnes: number,
  niveau: NiveauGrimuku,
): GrilleGrimuku | null {
  const { longueurMax, produitMax, chiffres } = reglagesDuNiveau(niveau)
  const periode = longueurMax + 1
  const grises = motifDesCasesGrises(
    lignes,
    colonnes,
    periode,
    randint(0, periode - 1),
    choice([true, false]),
  )
  const attaches = accrocheLesFleches(grises, lignes, colonnes)
  if (attaches.length === 0) return null

  let meilleure: GrilleGrimuku | null = null
  let meilleurProduit = Number.POSITIVE_INFINITY
  for (let essai = 0; essai < NOMBRE_DE_REMPLISSAGES; essai++) {
    const solution = new Array<number>(lignes * colonnes).fill(0)
    for (let index = 0; index < solution.length; index++) {
      if (!grises[index]) solution[index] = choice(chiffres)
    }
    const fleches: FlecheGrimuku[] = attaches.map((attache) => ({
      ...attache,
      produit: produitDesCases(attache.cases, solution),
    }))
    const plusGrandProduit = Math.max(
      ...fleches.map((fleche) => fleche.produit),
    )
    // Les cases qu'aucune flèche ne désigne sont écrites d'avance : sans cela
    // elles seraient libres et la grille aurait plusieurs solutions.
    const couvertes = new Set(fleches.flatMap((fleche) => fleche.cases))
    const donnees: number[] = []
    for (let index = 0; index < solution.length; index++) {
      if (!grises[index] && !couvertes.has(index)) donnees.push(index)
    }
    const grille: GrilleGrimuku = {
      lignes,
      colonnes,
      grises,
      solution,
      fleches,
      donnees,
    }
    if (plusGrandProduit <= produitMax) return grille
    if (plusGrandProduit < meilleurProduit) {
      meilleurProduit = plusGrandProduit
      meilleure = grille
    }
  }
  return meilleure
}

/**
 * Écrit d'avance le chiffre d'une case blanche : en priorité une case que la
 * déduction n'atteint pas, car c'est elle qui bloque.
 */
function devoileUneCase(grille: GrilleGrimuku, nonResolues: number[]): boolean {
  const donnees = new Set(grille.donnees)
  const bloquees = nonResolues.filter((index) => !donnees.has(index))
  // Quand la grille se résout déjà mais demande un raisonnement trop savant
  // pour le niveau visé, il n'y a plus de case bloquée : on en dévoile alors
  // une au hasard pour raccourcir le raisonnement.
  const candidates =
    bloquees.length > 0
      ? bloquees
      : casesBlanches(grille).filter((index) => !donnees.has(index))
  if (candidates.length === 0) return false
  grille.donnees = [...grille.donnees, choice(candidates)].sort(
    (premiere, seconde) => premiere - seconde,
  )
  return true
}

/**
 * Une grille de grimuku conforme aux options demandées.
 *
 * On tire une grille, on écrit d'avance des chiffres jusqu'à ce qu'elle se
 * résolve par déduction sans dépasser le niveau demandé, puis on ne la retient
 * que si elle exige bien une déduction de ce niveau. Faute de mieux au bout de
 * `NOMBRE_DE_TENTATIVES` tirages, la grille résoluble la plus proche du niveau
 * demandé est renvoyée : la génération est bornée en toutes circonstances.
 */
export function genereGrimuku(options: OptionsGrimuku): GrilleGrimuku {
  const lignes = Math.min(9, Math.max(3, Math.round(options.lignes)))
  const colonnes = Math.min(9, Math.max(3, Math.round(options.colonnes)))
  const niveau = options.niveau
  const { partDesDonnees } = reglagesDuNiveau(niveau)
  const donneesMax = Math.ceil(lignes * colonnes * partDesDonnees)

  let meilleure: GrilleGrimuku | null = null
  let meilleurRang: number[] = []
  for (let tentative = 0; tentative < NOMBRE_DE_TENTATIVES; tentative++) {
    const grille = tenteUneGrille(lignes, colonnes, niveau)
    if (grille === null) continue
    let evaluation = evalueDifficulte(grille)
    while (
      (!evaluation.resolue || evaluation.niveauMax > niveau) &&
      devoileUneCase(grille, evaluation.nonResolues)
    ) {
      evaluation = evalueDifficulte(grille)
    }
    if (!evaluation.resolue) continue
    const nbDonnees = grille.donnees.length
    if (evaluation.niveauMax === niveau && nbDonnees <= donneesMax)
      return grille
    // À défaut, on classe les grilles : d'abord celles dont le niveau est le
    // plus proche de celui demandé, puis celles qui écrivent le moins de
    // chiffres d'avance, puis celles qui demandent le plus d'étapes.
    const rang = [
      Math.abs(evaluation.niveauMax - niveau),
      nbDonnees,
      -evaluation.nbEtapes,
    ]
    if (meilleure === null || estMeilleur(rang, meilleurRang)) {
      meilleurRang = rang
      meilleure = grille
    }
  }
  if (meilleure !== null) return meilleure
  // Dernier recours : une grille entièrement écrite est toujours résoluble.
  const grille =
    tenteUneGrille(lignes, colonnes, niveau) ??
    tenteUneGrille(lignes, colonnes, 1)
  if (grille === null) {
    throw new Error('genereGrimuku : aucun motif de grille exploitable')
  }
  grille.donnees = grille.solution
    .map((_, index) => index)
    .filter((index) => !grille.grises[index])
  return grille
}

/** Les cases blanches d'une grille, dans l'ordre de lecture. */
export function casesBlanches(grille: GrilleGrimuku): number[] {
  const blanches: number[] = []
  for (let index = 0; index < grille.grises.length; index++) {
    if (!grille.grises[index]) blanches.push(index)
  }
  return blanches
}

/** Les cases blanches que l'élève doit trouver : toutes sauf celles déjà écrites. */
export function casesAChercher(grille: GrilleGrimuku): number[] {
  const donnees = new Set(grille.donnees)
  return casesBlanches(grille).filter((index) => !donnees.has(index))
}

/** La flèche horizontale portée par une case grise, s'il y en a une. */
export function flecheHorizontale(
  grille: GrilleGrimuku,
  indice: number,
): FlecheGrimuku | undefined {
  return grille.fleches.find(
    (fleche) =>
      fleche.indice === indice &&
      (fleche.direction === 'droite' || fleche.direction === 'gauche'),
  )
}

/** La flèche verticale portée par une case grise, s'il y en a une. */
export function flecheVerticale(
  grille: GrilleGrimuku,
  indice: number,
): FlecheGrimuku | undefined {
  return grille.fleches.find(
    (fleche) =>
      fleche.indice === indice &&
      (fleche.direction === 'bas' || fleche.direction === 'haut'),
  )
}

export { colonneDe, ligneDe }
