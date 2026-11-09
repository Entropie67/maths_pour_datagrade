import { randint } from '../../modules/outils'
import { choice, shuffle } from './arrayOutils'

/**
 * Génération et analyse de grilles de Killer Sudoku.
 *
 * Une grille de Killer Sudoku est un sudoku (les chiffres de 1 à n figurent une
 * fois par ligne, par colonne et par bloc) découpé en cages : chaque cage
 * annonce la somme de ses chiffres, et un chiffre ne se répète jamais dans une
 * même cage. Aucun chiffre n'est donné au départ.
 *
 * Ce module ne dépend ni du DOM ni de MathALÉA : il est testable seul.
 * Seule la génération tire au hasard ; l'analyse (`evalueDifficulte`) et le
 * dénombrement des solutions (`compteSolutions`) sont déterministes, pour ne
 * pas déplacer les tirages d'un exercice (voir `documentation/tests/stabilite-exercices.md`).
 *
 * @author Rémi Angot
 */

export type CageKiller = {
  /** Index des cases de la cage, `ligne * taille + colonne`. */
  cases: number[]
  somme: number
}

export type GrilleKiller = {
  taille: number
  /** La solution complète : `solution[ligne][colonne]`. */
  solution: number[][]
  cages: CageKiller[]
}

/** Les tailles de grille proposées, dans l'ordre du formulaire ; la grille est notée sur sa taille. */
export const TAILLES_KILLER = [4, 6, 9]

/** La taille de grille correspondant au rang choisi dans le formulaire. */
export function tailleKiller(rang: unknown): number {
  const index = Math.round(Number(rang))
  return TAILLES_KILLER[
    Math.min(TAILLES_KILLER.length, Math.max(1, index || 2)) - 1
  ]
}

/** 1 : facile, 2 : moyen, 3 : difficile. */
export type NiveauKiller = 1 | 2 | 3

export type OptionsKiller = {
  /** Côté de la grille : 4, 6 ou 9. */
  taille: number
  niveau: NiveauKiller
}

export type EvaluationKiller = {
  /** La grille se résout par déduction, sans essayer de valeur au hasard. */
  resolue: boolean
  /** Niveau de la règle la plus savante utilisée : 0 si aucune, 1 à 3 sinon. */
  niveauMax: number
  /** Nombre de déductions enchaînées avant d'arriver au bout. */
  nbEtapes: number
  /** Les cases qui hésitent encore entre plusieurs chiffres quand la déduction s'arrête. */
  indeterminees: number[]
}

/** Nombre de grilles tirées avant de garder la meilleure : la génération ne doit jamais diverger. */
const NOMBRE_DE_TENTATIVES = 12
/** Garde-fou du solveur déductif. */
const LIMITE_ETAPES = 600
/** Garde-fou de l'énumération des contenus possibles d'une cage. */
const LIMITE_ENUMERATION = 20000

/** Réglages dérivés du niveau de difficulté demandé. */
function reglagesDuNiveau(niveau: NiveauKiller): { tailleMaxCage: number } {
  if (niveau === 1) return { tailleMaxCage: 3 }
  if (niveau === 2) return { tailleMaxCage: 4 }
  return { tailleMaxCage: 5 }
}

/* -------------------------------------------------------------------------- */
/* Géométrie de la grille                                                      */
/* -------------------------------------------------------------------------- */

/** Hauteur et largeur d'un bloc : 2×2 en 4×4, 2×3 en 6×6, 3×3 en 9×9. */
export function dimensionsBloc(taille: number): [number, number] {
  if (taille === 4) return [2, 2]
  if (taille === 6) return [2, 3]
  return [3, 3]
}

function ligneDe(index: number, taille: number): number {
  return Math.floor(index / taille)
}

function colonneDe(index: number, taille: number): number {
  return index % taille
}

/** Le numéro du bloc qui contient la case. */
export function blocDe(index: number, taille: number): number {
  const [hauteur, largeur] = dimensionsBloc(taille)
  const blocsParLigne = taille / largeur
  return (
    Math.floor(ligneDe(index, taille) / hauteur) * blocsParLigne +
    Math.floor(colonneDe(index, taille) / largeur)
  )
}

/** Les lignes, les colonnes puis les blocs, comme listes de cases. */
export function unites(taille: number): number[][] {
  const resultat: number[][] = []
  for (let ligne = 0; ligne < taille; ligne++) {
    resultat.push(
      Array.from({ length: taille }, (_, colonne) => ligne * taille + colonne),
    )
  }
  for (let colonne = 0; colonne < taille; colonne++) {
    resultat.push(
      Array.from({ length: taille }, (_, ligne) => ligne * taille + colonne),
    )
  }
  const blocs: number[][] = Array.from({ length: taille }, () => [])
  for (let index = 0; index < taille * taille; index++) {
    blocs[blocDe(index, taille)].push(index)
  }
  return [...resultat, ...blocs]
}

/** Les cases orthogonalement voisines de `index`. */
function voisines(index: number, taille: number): number[] {
  const ligne = ligneDe(index, taille)
  const colonne = colonneDe(index, taille)
  const resultat: number[] = []
  if (ligne > 0) resultat.push(index - taille)
  if (ligne < taille - 1) resultat.push(index + taille)
  if (colonne > 0) resultat.push(index - 1)
  if (colonne < taille - 1) resultat.push(index + 1)
  return resultat
}

/** Vrai quand les cases se touchent toutes de proche en proche. */
export function estConnexe(cases: number[], taille: number): boolean {
  if (cases.length === 0) return true
  const restantes = new Set(cases)
  const aVisiter = [cases[0]]
  restantes.delete(cases[0])
  while (aVisiter.length > 0) {
    const index = aVisiter.pop() as number
    for (const voisine of voisines(index, taille)) {
      if (restantes.delete(voisine)) aVisiter.push(voisine)
    }
  }
  return restantes.size === 0
}

/* -------------------------------------------------------------------------- */
/* Génération de la solution et des cages                                      */
/* -------------------------------------------------------------------------- */

/**
 * Une solution de sudoku tirée au hasard.
 *
 * Le motif de base est une grille valide ; mélanger ensuite les chiffres, les
 * lignes d'une même bande, les bandes, les colonnes d'une même pile et les
 * piles donne une grille valide quelconque sans aucun retour en arrière.
 */
export function solutionAleatoire(taille: number): number[][] {
  const [hauteur, largeur] = dimensionsBloc(taille)
  const chiffres = shuffle(Array.from({ length: taille }, (_, i) => i + 1))
  const ordre = (groupes: number, parGroupe: number): number[] =>
    shuffle(Array.from({ length: groupes }, (_, groupe) => groupe)).flatMap(
      (groupe) =>
        shuffle(Array.from({ length: parGroupe }, (_, rang) => rang)).map(
          (rang) => groupe * parGroupe + rang,
        ),
    )
  const lignes = ordre(taille / hauteur, hauteur)
  const colonnes = ordre(taille / largeur, largeur)
  return lignes.map((ligne) =>
    colonnes.map((colonne) => {
      const motif =
        (largeur * (ligne % hauteur) + Math.floor(ligne / hauteur) + colonne) %
        taille
      return chiffres[motif]
    }),
  )
}

/** Le chiffre de la solution dans une case. */
function chiffreDe(
  index: number,
  solution: number[][],
  taille: number,
): number {
  return solution[ligneDe(index, taille)][colonneDe(index, taille)]
}

/**
 * Découpe la grille en cages de cases contiguës aux chiffres tous différents.
 *
 * Une cage grandit en absorbant une voisine libre tirée au hasard : une case
 * voisine de plusieurs cases de la cage a d'autant plus de chances d'être
 * choisie, ce qui donne des cages compactes plutôt que des serpents.
 */
function decoupeEnCages(
  solution: number[][],
  taille: number,
  tailleMaxCage: number,
): number[][] {
  const nbCases = taille * taille
  const cageDe = new Array<number>(nbCases).fill(-1)
  const cages: number[][] = []
  let libres = Array.from({ length: nbCases }, (_, index) => index)
  while (libres.length > 0) {
    const depart = choice(libres)
    const cage = [depart]
    cageDe[depart] = cages.length
    const cible = randint(2, tailleMaxCage)
    while (cage.length < cible) {
      const chiffres = new Set(
        cage.map((index) => chiffreDe(index, solution, taille)),
      )
      const candidates = cage
        .flatMap((index) => voisines(index, taille))
        .filter(
          (index) =>
            cageDe[index] === -1 &&
            !chiffres.has(chiffreDe(index, solution, taille)),
        )
      if (candidates.length === 0) break
      const suivante = choice(candidates)
      cage.push(suivante)
      cageDe[suivante] = cages.length
    }
    cages.push(cage)
    libres = libres.filter((index) => cageDe[index] === -1)
  }
  return absorbeLesCasesIsolees(cages, solution, taille, tailleMaxCage)
}

/**
 * Rattache une case restée seule à une cage voisine quand c'est possible : la
 * grille garde ainsi peu de cages d'une seule case, qui donnent directement leur chiffre.
 */
function absorbeLesCasesIsolees(
  cages: number[][],
  solution: number[][],
  taille: number,
  tailleMaxCage: number,
): number[][] {
  const restantes = cages.map((cage) => [...cage])
  for (const simple of restantes.filter((cage) => cage.length === 1)) {
    const cageDe = new Map<number, number[]>()
    for (const cage of restantes) {
      for (const index of cage) cageDe.set(index, cage)
    }
    const chiffre = chiffreDe(simple[0], solution, taille)
    const accueillantes = voisines(simple[0], taille)
      .map((index) => cageDe.get(index))
      .filter(
        (cage): cage is number[] =>
          cage !== undefined &&
          cage !== simple &&
          cage.length < tailleMaxCage &&
          cage.every((index) => chiffreDe(index, solution, taille) !== chiffre),
      )
    if (accueillantes.length === 0) continue
    const cible = accueillantes.reduce((meilleure, cage) =>
      cage.length < meilleure.length ? cage : meilleure,
    )
    cible.push(simple[0])
    restantes.splice(restantes.indexOf(simple), 1)
  }
  return restantes
}

/** La somme des chiffres de la solution sur les cases d'une cage. */
function sommeDeLaCage(
  cases: number[],
  solution: number[][],
  taille: number,
): number {
  return cases.reduce(
    (somme, index) => somme + chiffreDe(index, solution, taille),
    0,
  )
}

/**
 * Coupe une cage en deux morceaux contigus pour apporter de l'information.
 *
 * Un morceau est une région connexe d'environ la moitié de la cage, dont le
 * reste est lui aussi connexe ; à défaut, une seule case est détachée.
 */
function scindeLaCage(
  cage: CageKiller,
  solution: number[][],
  taille: number,
): CageKiller[] {
  const cibleMorceau = Math.max(1, Math.floor(cage.cases.length / 2))
  const enDeuxMorceaux = (morceau: number[]): CageKiller[] => {
    const reste = cage.cases.filter((index) => !morceau.includes(index))
    return [morceau, reste].map((cases) => ({
      cases,
      somme: sommeDeLaCage(cases, solution, taille),
    }))
  }
  for (let essai = 0; essai < 12; essai++) {
    const morceau = [choice(cage.cases)]
    while (morceau.length < cibleMorceau) {
      const candidates = morceau
        .flatMap((index) => voisines(index, taille))
        .filter(
          (index) => cage.cases.includes(index) && !morceau.includes(index),
        )
      if (candidates.length === 0) break
      morceau.push(choice(candidates))
    }
    const reste = cage.cases.filter((index) => !morceau.includes(index))
    if (reste.length > 0 && estConnexe(reste, taille)) {
      return enDeuxMorceaux(morceau)
    }
  }
  // Une case en bout de cage se détache sans couper le reste en deux.
  for (const detachee of shuffle(cage.cases)) {
    const reste = cage.cases.filter((index) => index !== detachee)
    if (estConnexe(reste, taille)) return enDeuxMorceaux([detachee])
  }
  return [cage]
}

/* -------------------------------------------------------------------------- */
/* Solveur déductif : c'est lui qui donne son niveau à une grille.             */
/* -------------------------------------------------------------------------- */

/** Les candidats d'une case sont codés en bits : le bit `v` est levé si `v` est possible. */
type Candidats = number[]

function nbBits(masque: number): number {
  let compte = 0
  for (let reste = masque; reste !== 0; reste &= reste - 1) compte++
  return compte
}

function valeursDuMasque(masque: number): number[] {
  const valeurs: number[] = []
  for (let valeur = 1; masque >> valeur !== 0; valeur++) {
    if ((masque >> valeur) & 1) valeurs.push(valeur)
  }
  return valeurs
}

function masqueDe(valeurs: Iterable<number>): number {
  let masque = 0
  for (const valeur of valeurs) masque |= 1 << valeur
  return masque
}

/**
 * Toutes les répartitions de chiffres distincts compatibles avec la somme de la
 * cage et avec les candidats actuels de ses cases.
 */
function repartitionsValides(
  cage: CageKiller,
  candidats: Candidats,
  taille: number,
): number[][] {
  const valides: number[][] = []
  const encours: number[] = []
  let noeuds = 0
  const maximum = taille
  const explore = (position: number, somme: number, utilises: number): void => {
    if (noeuds++ > LIMITE_ENUMERATION) return
    if (position === cage.cases.length) {
      if (somme === cage.somme) valides.push([...encours])
      return
    }
    // Ce qu'il reste à placer doit pouvoir encore compléter la somme.
    const restantes = cage.cases.length - position
    const manque = cage.somme - somme
    if (
      manque < (restantes * (restantes + 1)) / 2 ||
      manque > restantes * maximum - (restantes * (restantes - 1)) / 2
    ) {
      return
    }
    for (const valeur of valeursDuMasque(candidats[cage.cases[position]])) {
      if ((utilises >> valeur) & 1 || somme + valeur > cage.somme) continue
      encours.push(valeur)
      explore(position + 1, somme + valeur, utilises | (1 << valeur))
      encours.pop()
    }
  }
  explore(0, 0, 0)
  return valides
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
export function evalueDifficulte(grille: GrilleKiller): EvaluationKiller {
  const taille = grille.taille
  const nbCases = taille * taille
  const toutes = masqueDe(Array.from({ length: taille }, (_, i) => i + 1))
  const candidats: Candidats = new Array<number>(nbCases).fill(toutes)
  const lignesColonnesBlocs = unites(taille)
  const sommeDUneUnite = (taille * (taille + 1)) / 2

  const cageDe = new Map<number, CageKiller>()
  for (const cage of grille.cages) {
    for (const index of cage.cases) cageDe.set(index, cage)
  }
  // Les cases qui ne peuvent pas porter le même chiffre qu'une case donnée.
  const pairs: number[][] = Array.from({ length: nbCases }, () => [])
  for (const unite of lignesColonnesBlocs) {
    for (const index of unite) pairs[index].push(...unite)
  }
  for (const cage of grille.cages) {
    for (const index of cage.cases) pairs[index].push(...cage.cases)
  }
  for (let index = 0; index < nbCases; index++) {
    pairs[index] = [...new Set(pairs[index])].filter((autre) => autre !== index)
  }

  const restreint = (index: number, masque: number): boolean => {
    const apres = candidats[index] & masque
    if (apres === candidats[index]) return false
    candidats[index] = apres
    return true
  }

  /** Niveau 1 : une case déterminée chasse son chiffre de ses « voisines » (ligne, colonne, bloc, cage). */
  const propageLesCasesDeterminees = (): boolean => {
    let changement = false
    for (let index = 0; index < nbCases; index++) {
      if (nbBits(candidats[index]) !== 1) continue
      for (const autre of pairs[index]) {
        if (restreint(autre, ~candidats[index])) changement = true
      }
    }
    return changement
  }

  /** Élimine de chaque case d'une cage les chiffres qu'aucune répartition ne lui donne. */
  const reduitLesCages = (tailleMax: number) => (): boolean => {
    let changement = false
    for (const cage of grille.cages) {
      if (cage.cases.length > tailleMax) continue
      const valides = repartitionsValides(cage, candidats, taille)
      if (valides.length === 0) {
        // Aucune répartition possible : la grille est incohérente, on vide la
        // cage pour que `estIncoherente()` arrête la résolution.
        for (const caseCourante of cage.cases) candidats[caseCourante] = 0
        return true
      }
      cage.cases.forEach((caseCourante, rang) => {
        const utiles = masqueDe(valides.map((repartition) => repartition[rang]))
        if (restreint(caseCourante, utiles)) changement = true
      })
    }
    return changement
  }

  /** Niveau 1 : un chiffre n'a plus qu'une case possible dans sa ligne, sa colonne ou son bloc. */
  const singletonsCaches = (): boolean => {
    let changement = false
    for (const unite of lignesColonnesBlocs) {
      for (let valeur = 1; valeur <= taille; valeur++) {
        const places = unite.filter((index) => (candidats[index] >> valeur) & 1)
        if (places.length !== 1) continue
        if (nbBits(candidats[places[0]]) === 1) continue
        candidats[places[0]] = 1 << valeur
        changement = true
      }
    }
    return changement
  }

  /** Niveau 2 : deux cases d'une même unité portant les deux mêmes candidats se réservent ce couple. */
  const pairesNues = (): boolean => {
    let changement = false
    for (const unite of lignesColonnesBlocs) {
      const paires = unite.filter((index) => nbBits(candidats[index]) === 2)
      for (let premier = 0; premier < paires.length; premier++) {
        for (let second = premier + 1; second < paires.length; second++) {
          if (candidats[paires[premier]] !== candidats[paires[second]]) continue
          for (const index of unite) {
            if (index === paires[premier] || index === paires[second]) continue
            if (restreint(index, ~candidats[paires[premier]])) changement = true
          }
        }
      }
    }
    return changement
  }

  /**
   * Niveau 3 : un chiffre que la cage contient forcément, et qui n'y a de place
   * que dans une seule ligne, colonne ou bloc, est chassé du reste de cette unité.
   */
  const confinementDesCages = (): boolean => {
    let changement = false
    for (const cage of grille.cages) {
      if (cage.cases.length < 2) continue
      const valides = repartitionsValides(cage, candidats, taille)
      if (valides.length === 0) {
        for (const caseCourante of cage.cases) candidats[caseCourante] = 0
        return true
      }
      for (let valeur = 1; valeur <= taille; valeur++) {
        if (!valides.every((repartition) => repartition.includes(valeur)))
          continue
        const places = cage.cases.filter((_, rang) =>
          valides.some((repartition) => repartition[rang] === valeur),
        )
        for (const unite of lignesColonnesBlocs) {
          if (!places.every((index) => unite.includes(index))) continue
          for (const index of unite) {
            if (cage.cases.includes(index)) continue
            if (restreint(index, ~(1 << valeur))) changement = true
          }
        }
      }
    }
    return changement
  }

  /**
   * Niveau 3 : la règle des unités. Une ligne, une colonne ou un bloc vaut
   * toujours 1 + 2 + … + n ; en retranchant les cages qu'elle contient en
   * entier, il reste la somme des cases isolées (« innies »). Réciproquement, si
   * les cages qui la touchent la dépassent d'une seule case (« outie »), cette
   * case vaut l'excédent. Dans les deux cas une seule case restante est déterminée.
   */
  const regleDesUnites = (): boolean => {
    let changement = false
    for (const unite of lignesColonnesBlocs) {
      const dans = new Set(unite)
      const contenues = grille.cages.filter((cage) =>
        cage.cases.every((index) => dans.has(index)),
      )
      const couvertes = new Set(contenues.flatMap((cage) => cage.cases))
      const reste = unite.filter((index) => !couvertes.has(index))
      if (reste.length === 1) {
        const valeur =
          sommeDUneUnite - contenues.reduce((s, cage) => s + cage.somme, 0)
        if (valeur >= 1 && valeur <= taille) {
          if (restreint(reste[0], 1 << valeur)) changement = true
        } else {
          candidats[reste[0]] = 0
          return true
        }
      }
      const touchantes = grille.cages.filter((cage) =>
        cage.cases.some((index) => dans.has(index)),
      )
      const union = new Set(touchantes.flatMap((cage) => cage.cases))
      const dehors = [...union].filter((index) => !dans.has(index))
      if (dehors.length === 1 && union.size > dans.size) {
        const valeur =
          touchantes.reduce((s, cage) => s + cage.somme, 0) - sommeDUneUnite
        if (valeur >= 1 && valeur <= taille) {
          if (restreint(dehors[0], 1 << valeur)) changement = true
        } else {
          candidats[dehors[0]] = 0
          return true
        }
      }
    }
    return changement
  }

  const regles: { niveau: number; applique: () => boolean }[] = [
    { niveau: 1, applique: propageLesCasesDeterminees },
    { niveau: 1, applique: reduitLesCages(2) },
    { niveau: 1, applique: singletonsCaches },
    { niveau: 2, applique: reduitLesCages(taille) },
    { niveau: 2, applique: pairesNues },
    { niveau: 3, applique: regleDesUnites },
    { niveau: 3, applique: confinementDesCages },
  ]

  const estResolue = (): boolean =>
    candidats.every((possibles) => nbBits(possibles) === 1)
  const estIncoherente = (): boolean =>
    candidats.some((possibles) => possibles === 0)

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
    indeterminees: candidats
      .map((possibles, index) => (nbBits(possibles) > 1 ? index : -1))
      .filter((index) => index >= 0),
  }
}

/**
 * Les ensembles de chiffres distincts qui peuvent remplir une cage, sans tenir
 * compte du reste de la grille : par exemple `{1, 2}` pour deux cases de somme 3.
 *
 * Sert à désigner, dans la correction, la cage par laquelle commencer.
 */
export function combinaisonsPossibles(
  nbCases: number,
  somme: number,
  taille: number,
): number[][] {
  const resultat: number[][] = []
  const encours: number[] = []
  const explore = (debut: number, reste: number): void => {
    if (encours.length === nbCases) {
      if (reste === 0) resultat.push([...encours])
      return
    }
    for (let valeur = debut; valeur <= taille && valeur <= reste; valeur++) {
      encours.push(valeur)
      explore(valeur + 1, reste - valeur)
      encours.pop()
    }
  }
  explore(1, somme)
  return resultat
}

/* -------------------------------------------------------------------------- */
/* Dénombrement des solutions : garde-fou indépendant du solveur déductif.     */
/* -------------------------------------------------------------------------- */

/**
 * Nombre de solutions de la grille, plafonné à `limite`.
 *
 * La case la plus contrainte est toujours remplie la première. Sert de contrôle
 * indépendant dans les tests : la génération, elle, s'appuie sur
 * `evalueDifficulte`, dont la réussite prouve déjà l'unicité.
 */
export function compteSolutions(grille: GrilleKiller, limite = 2): number {
  const taille = grille.taille
  const nbCases = taille * taille
  const toutes = masqueDe(Array.from({ length: taille }, (_, i) => i + 1))
  const numeroDeCage = new Array<number>(nbCases).fill(-1)
  grille.cages.forEach((cage, numero) => {
    for (const index of cage.cases) numeroDeCage[index] = numero
  })
  const uniteDe = (index: number): number[] => [
    ligneDe(index, taille),
    taille + colonneDe(index, taille),
    2 * taille + blocDe(index, taille),
  ]
  const utilisesParUnite = new Array<number>(3 * taille).fill(0)
  const utilisesParCage = new Array<number>(grille.cages.length).fill(0)
  const sommeParCage = new Array<number>(grille.cages.length).fill(0)
  const restantesParCage = grille.cages.map((cage) => cage.cases.length)
  const valeurs = new Array<number>(nbCases).fill(0)

  /** Les chiffres qu'on peut encore poser dans une case sans contredire sa cage. */
  const possibles = (index: number): number => {
    const cage = numeroDeCage[index]
    let masque = toutes
    for (const unite of uniteDe(index)) masque &= ~utilisesParUnite[unite]
    masque &= ~utilisesParCage[cage]
    let retenus = 0
    const restantes = restantesParCage[cage] - 1
    for (const valeur of valeursDuMasque(masque)) {
      const manque = grille.cages[cage].somme - sommeParCage[cage] - valeur
      const plancher = (restantes * (restantes + 1)) / 2
      const plafond = restantes * taille - (restantes * (restantes - 1)) / 2
      if (manque >= plancher && manque <= plafond) retenus |= 1 << valeur
    }
    return retenus
  }

  let solutions = 0
  const explore = (): void => {
    if (solutions >= limite) return
    let meilleure = -1
    let meilleursPossibles = 0
    let meilleurNombre = taille + 1
    for (let index = 0; index < nbCases; index++) {
      if (valeurs[index] !== 0) continue
      const masque = possibles(index)
      const nombre = nbBits(masque)
      if (nombre < meilleurNombre) {
        meilleure = index
        meilleursPossibles = masque
        meilleurNombre = nombre
        if (nombre <= 1) break
      }
    }
    if (meilleure === -1) {
      solutions++
      return
    }
    const cage = numeroDeCage[meilleure]
    for (const valeur of valeursDuMasque(meilleursPossibles)) {
      valeurs[meilleure] = valeur
      for (const unite of uniteDe(meilleure))
        utilisesParUnite[unite] |= 1 << valeur
      utilisesParCage[cage] |= 1 << valeur
      sommeParCage[cage] += valeur
      restantesParCage[cage]--
      explore()
      restantesParCage[cage]++
      sommeParCage[cage] -= valeur
      utilisesParCage[cage] &= ~(1 << valeur)
      for (const unite of uniteDe(meilleure))
        utilisesParUnite[unite] &= ~(1 << valeur)
      valeurs[meilleure] = 0
    }
  }
  explore()
  return solutions
}

/* -------------------------------------------------------------------------- */
/* Génération                                                                  */
/* -------------------------------------------------------------------------- */

/** Une grille complète (solution, cages, sommes), sans contrôle de difficulté. */
function tenteUneGrille(taille: number, tailleMaxCage: number): GrilleKiller {
  const solution = solutionAleatoire(taille)
  const cages = decoupeEnCages(solution, taille, tailleMaxCage).map(
    (cases) => ({ cases, somme: sommeDeLaCage(cases, solution, taille) }),
  )
  return { taille, solution, cages }
}

/** Le nombre de cages d'une seule case : leur chiffre est donné par la somme. */
export function nbCagesSimples(grille: GrilleKiller): number {
  return grille.cages.filter((cage) => cage.cases.length === 1).length
}

/** Compare deux grilles candidates, critère par critère, du plus important au moins. */
function estMeilleur(rang: number[], reference: number[]): boolean {
  for (let critere = 0; critere < rang.length; critere++) {
    if (rang[critere] !== reference[critere]) {
      return rang[critere] < reference[critere]
    }
  }
  return false
}

/**
 * Une grille de Killer Sudoku conforme aux options demandées.
 *
 * On tire une grille, on scinde des cages jusqu'à ce qu'elle se résolve par
 * déduction sans dépasser le niveau demandé, puis on ne la retient que si elle
 * exige bien une déduction de ce niveau. Faute de mieux au bout de
 * `NOMBRE_DE_TENTATIVES` tirages, la grille résoluble la plus proche du niveau
 * demandé est renvoyée : la génération est bornée en toutes circonstances.
 */
export function genereKillerSudoku(options: OptionsKiller): GrilleKiller {
  const taille = TAILLES_KILLER.includes(Math.round(options.taille))
    ? Math.round(options.taille)
    : 6
  const niveau = options.niveau
  const { tailleMaxCage } = reglagesDuNiveau(niveau)
  // Trop de cages d'une seule case donnent la grille : au delà de ce seuil, la
  // grille n'est retenue qu'à défaut d'une meilleure.
  const simplesMax = Math.floor((taille * taille) / 8)

  let meilleure: GrilleKiller | null = null
  let meilleurRang: number[] = []
  for (let tentative = 0; tentative < NOMBRE_DE_TENTATIVES; tentative++) {
    const grille = tenteUneGrille(taille, tailleMaxCage)
    let evaluation = evalueDifficulte(grille)
    while (!evaluation.resolue || evaluation.niveauMax > niveau) {
      // On scinde la plus grande cage qui laisse encore une case indécise.
      const indecises = new Set(evaluation.indeterminees)
      const aScinder = grille.cages
        .filter(
          (cage) =>
            cage.cases.length > 1 &&
            (indecises.size === 0 ||
              cage.cases.some((index) => indecises.has(index))),
        )
        .sort(
          (premiere, seconde) => seconde.cases.length - premiere.cases.length,
        )
      const cage = aScinder[0] ?? grille.cages.find((c) => c.cases.length > 1)
      if (cage === undefined) break
      grille.cages.splice(
        grille.cages.indexOf(cage),
        1,
        ...scindeLaCage(cage, grille.solution, taille),
      )
      evaluation = evalueDifficulte(grille)
    }
    if (!evaluation.resolue) continue
    const nbSimples = nbCagesSimples(grille)
    if (evaluation.niveauMax === niveau && nbSimples <= simplesMax) {
      return grille
    }
    // À défaut, on classe les grilles : d'abord celles dont le niveau est le
    // plus proche de celui demandé, puis celles qui ont le moins de cages d'une
    // seule case, puis celles qui demandent le plus d'étapes.
    const rang = [
      Math.abs(evaluation.niveauMax - niveau),
      nbSimples,
      -evaluation.nbEtapes,
    ]
    if (meilleure === null || estMeilleur(rang, meilleurRang)) {
      meilleurRang = rang
      meilleure = grille
    }
  }
  if (meilleure !== null) return meilleure
  // Dernier recours : une grille entièrement détaillée est toujours résoluble.
  const solution = solutionAleatoire(taille)
  return {
    taille,
    solution,
    cages: solution.flatMap((ligne, indexLigne) =>
      ligne.map((chiffre, indexColonne) => ({
        cases: [indexLigne * taille + indexColonne],
        somme: chiffre,
      })),
    ),
  }
}
