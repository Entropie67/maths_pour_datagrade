import { randint } from '../../modules/outils'
import { choice, shuffle } from './arrayOutils'
import { balancedLatinSquare } from './grid'

/**
 * Génération et analyse de grilles de KenKen.
 *
 * Une grille de KenKen est un carré latin (les entiers de 1 à n figurent une
 * fois par ligne et une fois par colonne) découpé en cages : chaque cage
 * annonce le résultat obtenu en combinant ses cases avec l'opération indiquée,
 * l'ordre des cases étant libre.
 *
 * Ce module ne dépend ni du DOM ni de MathALÉA : il est testable seul.
 * Seule la génération tire au hasard ; l'analyse (`evalueDifficulte`) et le
 * dénombrement des solutions (`compteSolutions`) sont déterministes, pour ne
 * pas déplacer les tirages d'un exercice (voir `documentation/tests/stabilite-exercices.md`).
 *
 * @author Rémi Angot
 */

/** Opération d'une cage. `'='` désigne une cage d'une seule case : sa valeur est donnée. */
export type OperationKenKen = '+' | '-' | '×' | '÷' | '='

/** Les opérations proposées au professeur, dans l'ordre du formulaire. */
export const OPERATIONS_KENKEN: OperationKenKen[] = ['+', '-', '×', '÷']

export type CageKenKen = {
  /** Index des cases de la cage, `ligne * taille + colonne`. */
  cases: number[]
  operation: OperationKenKen
  resultat: number
}

export type GrilleKenKen = {
  taille: number
  /** La solution complète : `solution[ligne][colonne]`. */
  solution: number[][]
  cages: CageKenKen[]
}

/** Les tailles de grille proposées, dans l'ordre du formulaire ; la grille est notée sur sa taille. */
export const TAILLES_KENKEN = [3, 4, 5, 6]

/** La taille de grille correspondant au rang choisi dans le formulaire. */
export function tailleKenKen(rang: unknown): number {
  const index = Math.round(Number(rang))
  return TAILLES_KENKEN[
    Math.min(TAILLES_KENKEN.length, Math.max(1, index || 2)) - 1
  ]
}

/** 1 : facile, 2 : moyen, 3 : difficile. */
export type NiveauKenKen = 1 | 2 | 3

export type OptionsKenKen = {
  /** Côté de la grille, entre 3 et 6. */
  taille: number
  /** Opérations autorisées, choisies par le professeur. */
  operations: OperationKenKen[]
  niveau: NiveauKenKen
}

export type EvaluationKenKen = {
  /** La grille se résout par déduction, sans essayer de valeur au hasard. */
  resolue: boolean
  /** Niveau de la règle la plus savante utilisée : 0 si aucune, 1 à 3 sinon. */
  niveauMax: number
  /** Nombre de déductions enchaînées avant d'arriver au bout. */
  nbEtapes: number
}

/**
 * Nombre de grilles tirées avant de garder la meilleure : une génération ne
 * doit jamais diverger. Environ un découpage sur dix exige un raisonnement de
 * niveau 3, d'où ce nombre d'essais généreux — la boucle s'arrête dès qu'une
 * grille convient, et le pire cas reste sous la demi-seconde.
 */
const NOMBRE_DE_TENTATIVES = 60
/** Nombre de découpages en cages essayés avant d'abandonner une tentative. */
const NOMBRE_DE_DECOUPAGES = 20
/** Garde-fou du solveur déductif. */
const LIMITE_ETAPES = 400
/** Garde-fou de l'énumération des contenus possibles d'une cage. */
const LIMITE_ENUMERATION = 20000

/** Réglages dérivés du niveau de difficulté demandé. */
function reglagesDuNiveau(niveau: NiveauKenKen): {
  tailleMaxCage: number
  nbCagesSimplesMax: number
} {
  if (niveau === 1) return { tailleMaxCage: 2, nbCagesSimplesMax: 4 }
  if (niveau === 2) return { tailleMaxCage: 3, nbCagesSimplesMax: 1 }
  return { tailleMaxCage: 4, nbCagesSimplesMax: 0 }
}

function ligneDe(index: number, taille: number): number {
  return Math.floor(index / taille)
}

function colonneDe(index: number, taille: number): number {
  return index % taille
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

/**
 * Un carré latin tiré au hasard.
 *
 * `balancedLatinSquare` ne produit que des carrés cycliques : mélanger ensuite
 * les lignes et les colonnes suffit à masquer cette régularité.
 */
export function carreLatinAleatoire(taille: number): number[][] {
  const valeurs = Array.from({ length: taille }, (_, index) => index + 1)
  const base = balancedLatinSquare(valeurs)
  const indices = Array.from({ length: taille }, (_, index) => index)
  const ordreLignes = shuffle(indices)
  const ordreColonnes = shuffle(indices)
  return ordreLignes.map((ligne) =>
    ordreColonnes.map((colonne) => base[ligne][colonne]),
  )
}

/**
 * Découpe la grille en cages de cases contiguës.
 *
 * Une cage grandit en absorbant une voisine libre tirée au hasard : une case
 * voisine de plusieurs cases de la cage a d'autant plus de chances d'être
 * choisie, ce qui donne des cages compactes plutôt que des serpents.
 */
function decoupeEnCages(
  taille: number,
  tailleMaxCage: number,
  nbCagesSimplesMax: number,
): number[][] {
  const nbCases = taille * taille
  const cageDe = new Array<number>(nbCases).fill(-1)
  const cages: number[][] = []
  let libres = Array.from({ length: nbCases }, (_, index) => index)
  while (libres.length > 0) {
    const depart = choice(libres)
    const cage = [depart]
    cageDe[depart] = cages.length
    const cible = randint(1, tailleMaxCage)
    while (cage.length < cible) {
      const candidates = cage
        .flatMap((index) => voisines(index, taille))
        .filter((index) => cageDe[index] === -1)
      if (candidates.length === 0) break
      const suivante = choice(candidates)
      cage.push(suivante)
      cageDe[suivante] = cages.length
    }
    cages.push(cage)
    libres = libres.filter((index) => cageDe[index] === -1)
  }
  return limiteLesCagesSimples(cages, taille, tailleMaxCage, nbCagesSimplesMax)
}

/**
 * Fusionne les cages d'une seule case en trop avec une cage voisine : le
 * nombre de valeurs données dans l'énoncé dépend du niveau de difficulté.
 */
function limiteLesCagesSimples(
  cages: number[][],
  taille: number,
  tailleMaxCage: number,
  nbCagesSimplesMax: number,
): number[][] {
  const restantes = cages.map((cage) => [...cage])
  const simples = restantes.filter((cage) => cage.length === 1)
  const aFusionner = shuffle(simples).slice(nbCagesSimplesMax)
  for (const simple of aFusionner) {
    // Une cage simple a pu grossir en accueillant une autre cage simple.
    if (simple.length !== 1) continue
    const cageDe = new Map<number, number[]>()
    for (const cage of restantes) {
      for (const index of cage) cageDe.set(index, cage)
    }
    const voisinage = voisines(simple[0], taille)
      .map((index) => cageDe.get(index))
      .filter((cage): cage is number[] => cage !== undefined && cage !== simple)
    if (voisinage.length === 0) continue
    // La plus petite cage voisine, pour éviter les cages géantes ; une cage
    // peut dépasser d'une case la taille maximale du niveau, c'est le prix de
    // la suppression d'une valeur donnée.
    const cible = voisinage.reduce((meilleure, cage) =>
      cage.length < meilleure.length ? cage : meilleure,
    )
    if (cible.length >= tailleMaxCage) continue
    cible.push(simple[0])
    restantes.splice(restantes.indexOf(simple), 1)
  }
  return restantes
}

/** Le résultat annoncé par une cage dont les cases contiennent `valeurs`. */
export function resultatCage(
  valeurs: number[],
  operation: OperationKenKen,
): number {
  const maximum = Math.max(...valeurs)
  const minimum = Math.min(...valeurs)
  switch (operation) {
    case '+':
      return valeurs.reduce((somme, valeur) => somme + valeur, 0)
    case '×':
      return valeurs.reduce((produit, valeur) => produit * valeur, 1)
    case '-':
      return maximum - minimum
    case '÷':
      return maximum / minimum
    case '=':
      return valeurs[0]
  }
}

/**
 * Les opérations utilisables pour une cage donnée.
 *
 * La soustraction et la division ne se pratiquent que sur deux cases, et la
 * division doit tomber juste. Une différence nulle ou un quotient égal à 1 ne
 * donneraient aucune information : ils sont écartés.
 */
export function operationsPossibles(
  valeurs: number[],
  autorisees: OperationKenKen[],
): OperationKenKen[] {
  if (valeurs.length === 1) return ['=']
  const possibles: OperationKenKen[] = []
  if (autorisees.includes('+')) possibles.push('+')
  if (autorisees.includes('×')) possibles.push('×')
  if (valeurs.length === 2) {
    const maximum = Math.max(...valeurs)
    const minimum = Math.min(...valeurs)
    if (autorisees.includes('-') && maximum !== minimum) possibles.push('-')
    if (
      autorisees.includes('÷') &&
      maximum !== minimum &&
      maximum % minimum === 0
    ) {
      possibles.push('÷')
    }
  }
  return possibles
}

/** Les valeurs de la solution occupant les cases d'une cage. */
function valeursDeLaCage(
  cases: number[],
  solution: number[][],
  taille: number,
): number[] {
  return cases.map(
    (index) => solution[ligneDe(index, taille)][colonneDe(index, taille)],
  )
}

/**
 * Habille chaque cage d'une opération autorisée.
 *
 * Renvoie `null` quand une cage n'en admet aucune, pour qu'un autre découpage
 * soit tenté — sauf en mode `degrade`, où la cage fautive est éclatée en cases
 * données. Sans ce dernier recours, un professeur qui n'autorise que la
 * division (rarement praticable : il faut que le quotient tombe juste) se
 * retrouverait sans aucune grille.
 */
function attribueLesOperations(
  cages: number[][],
  solution: number[][],
  taille: number,
  operations: OperationKenKen[],
  degrade: boolean,
): CageKenKen[] | null {
  const resultat: CageKenKen[] = []
  for (const cases of cages) {
    const valeurs = valeursDeLaCage(cases, solution, taille)
    const possibles = operationsPossibles(valeurs, operations)
    if (possibles.length === 0) {
      if (!degrade) return null
      cases.forEach((index, rang) => {
        resultat.push({
          cases: [index],
          operation: '=',
          resultat: valeurs[rang],
        })
      })
      continue
    }
    const operation = choice(possibles)
    resultat.push({
      cases,
      operation,
      resultat: resultatCage(valeurs, operation),
    })
  }
  return resultat
}

/* -------------------------------------------------------------------------- */
/* Solveur déductif : c'est lui qui donne son niveau à une grille.             */
/* -------------------------------------------------------------------------- */

type Candidats = Set<number>[]

/** Toutes les répartitions de valeurs compatibles avec la cage et les candidats actuels. */
function assignationsValides(
  cage: CageKenKen,
  candidats: Candidats,
  taille: number,
): number[][] {
  const valides: number[][] = []
  const encours: number[] = []
  let noeuds = 0
  const explore = (position: number, somme: number, produit: number): void => {
    if (noeuds++ > LIMITE_ENUMERATION) return
    if (position === cage.cases.length) {
      if (resultatCage(encours, cage.operation) === cage.resultat) {
        valides.push([...encours])
      }
      return
    }
    const caseCourante = cage.cases[position]
    for (const valeur of candidats[caseCourante]) {
      // Deux cases d'une même cage alignées ne peuvent pas porter la même valeur.
      const conflit = cage.cases.slice(0, position).some((precedente, rang) => {
        const memeLigne =
          ligneDe(precedente, taille) === ligneDe(caseCourante, taille)
        const memeColonne =
          colonneDe(precedente, taille) === colonneDe(caseCourante, taille)
        return (memeLigne || memeColonne) && encours[rang] === valeur
      })
      if (conflit) continue
      if (cage.operation === '+' && somme + valeur > cage.resultat) continue
      if (cage.operation === '×' && cage.resultat % (produit * valeur) !== 0)
        continue
      encours.push(valeur)
      explore(position + 1, somme + valeur, produit * valeur)
      encours.pop()
    }
  }
  explore(0, 0, 1)
  return valides
}

/** Retire des candidats d'une case ; renvoie `true` si quelque chose a changé. */
function retire(
  candidats: Candidats,
  index: number,
  valeurs: Iterable<number>,
): boolean {
  let changement = false
  for (const valeur of valeurs) {
    if (candidats[index].delete(valeur)) changement = true
  }
  return changement
}

/** Les cases de la ligne et de la colonne de `index`, sauf `index`. */
function alignees(index: number, taille: number): number[] {
  const ligne = ligneDe(index, taille)
  const colonne = colonneDe(index, taille)
  const resultat: number[] = []
  for (let autre = 0; autre < taille; autre++) {
    if (autre !== colonne) resultat.push(ligne * taille + autre)
    if (autre !== ligne) resultat.push(autre * taille + colonne)
  }
  return resultat
}

/** Les lignes puis les colonnes, comme listes de cases. */
function unites(taille: number): number[][] {
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
  return resultat
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
export function evalueDifficulte(grille: GrilleKenKen): EvaluationKenKen {
  const taille = grille.taille
  const nbCases = taille * taille
  const candidats: Candidats = Array.from(
    { length: nbCases },
    () => new Set(Array.from({ length: taille }, (_, index) => index + 1)),
  )
  for (const cage of grille.cages) {
    if (cage.operation === '=') {
      candidats[cage.cases[0]] = new Set([cage.resultat])
    }
  }

  /** Niveau 1 : une case déterminée chasse sa valeur de sa ligne et de sa colonne. */
  const propageLesCasesDeterminees = (): boolean => {
    let changement = false
    for (let index = 0; index < nbCases; index++) {
      if (candidats[index].size !== 1) continue
      const [valeur] = candidats[index]
      for (const autre of alignees(index, taille)) {
        if (retire(candidats, autre, [valeur])) changement = true
      }
    }
    return changement
  }

  /** Élimine de chaque case d'une cage les valeurs qu'aucune répartition ne lui donne. */
  const reduitLesCages = (petites: boolean): boolean => {
    let changement = false
    for (const cage of grille.cages) {
      if (cage.cases.length < 2) continue
      if (petites !== (cage.cases.length === 2)) continue
      const valides = assignationsValides(cage, candidats, taille)
      if (valides.length === 0) {
        // Aucune répartition possible : la grille est incohérente, on vide la
        // cage pour que `estIncoherente()` arrête la résolution.
        for (const caseCourante of cage.cases) candidats[caseCourante].clear()
        return true
      }
      cage.cases.forEach((caseCourante, rang) => {
        const utiles = new Set(valides.map((assignation) => assignation[rang]))
        const inutiles = [...candidats[caseCourante]].filter(
          (valeur) => !utiles.has(valeur),
        )
        if (retire(candidats, caseCourante, inutiles)) changement = true
      })
    }
    return changement
  }

  /** Niveau 2 : une valeur n'a plus qu'une case possible dans sa ligne ou sa colonne. */
  const singletonsCaches = (): boolean => {
    let changement = false
    for (const unite of unites(taille)) {
      for (let valeur = 1; valeur <= taille; valeur++) {
        const places = unite.filter((index) => candidats[index].has(valeur))
        if (places.length !== 1) continue
        if (candidats[places[0]].size === 1) continue
        candidats[places[0]] = new Set([valeur])
        changement = true
      }
    }
    return changement
  }

  /** Niveau 3 : deux cases alignées portant les deux mêmes candidats se réservent ce couple. */
  const pairesNues = (): boolean => {
    let changement = false
    for (const unite of unites(taille)) {
      const paires = unite.filter((index) => candidats[index].size === 2)
      for (let premier = 0; premier < paires.length; premier++) {
        for (let second = premier + 1; second < paires.length; second++) {
          const valeurs = [...candidats[paires[premier]]]
          const autres = [...candidats[paires[second]]]
          if (valeurs[0] !== autres[0] || valeurs[1] !== autres[1]) continue
          for (const index of unite) {
            if (index === paires[premier] || index === paires[second]) continue
            if (retire(candidats, index, valeurs)) changement = true
          }
        }
      }
    }
    return changement
  }

  /**
   * Niveau 3 : une valeur que la cage contient forcément, et qui n'y a de place
   * que sur une seule ligne, est chassée du reste de cette ligne.
   */
  const confinementDesCages = (): boolean => {
    let changement = false
    for (const cage of grille.cages) {
      if (cage.cases.length < 2) continue
      const valides = assignationsValides(cage, candidats, taille)
      if (valides.length === 0) {
        for (const caseCourante of cage.cases) candidats[caseCourante].clear()
        return true
      }
      for (let valeur = 1; valeur <= taille; valeur++) {
        if (!valides.every((assignation) => assignation.includes(valeur)))
          continue
        const places = cage.cases.filter((caseCourante, rang) =>
          valides.some((assignation) => assignation[rang] === valeur),
        )
        for (const dimension of ['ligne', 'colonne'] as const) {
          const coordonnee = (index: number) =>
            dimension === 'ligne'
              ? ligneDe(index, taille)
              : colonneDe(index, taille)
          const premiere = coordonnee(places[0])
          if (!places.every((index) => coordonnee(index) === premiere)) continue
          const unite = Array.from({ length: taille }, (_, autre) =>
            dimension === 'ligne'
              ? premiere * taille + autre
              : autre * taille + premiere,
          )
          for (const index of unite) {
            if (cage.cases.includes(index)) continue
            if (retire(candidats, index, [valeur])) changement = true
          }
        }
      }
    }
    return changement
  }

  const regles: { niveau: number; applique: () => boolean }[] = [
    { niveau: 1, applique: propageLesCasesDeterminees },
    { niveau: 1, applique: () => reduitLesCages(true) },
    { niveau: 2, applique: () => reduitLesCages(false) },
    { niveau: 2, applique: singletonsCaches },
    { niveau: 3, applique: pairesNues },
    { niveau: 3, applique: confinementDesCages },
  ]

  const estResolue = (): boolean =>
    candidats.every((possibles) => possibles.size === 1)
  const estIncoherente = (): boolean =>
    candidats.some((possibles) => possibles.size === 0)

  let niveauMax = 0
  let nbEtapes = 0
  while (!estResolue() && !estIncoherente() && nbEtapes < LIMITE_ETAPES) {
    const regle = regles.find((regle) => regle.applique())
    if (regle === undefined) break
    niveauMax = Math.max(niveauMax, regle.niveau)
    nbEtapes++
  }
  return { resolue: estResolue() && !estIncoherente(), niveauMax, nbEtapes }
}

/**
 * Les répartitions de valeurs qu'une cage peut accueillir au tout début de la
 * résolution, les valeurs déjà données étant seules prises en compte.
 *
 * Sert à désigner, dans la correction, la cage par laquelle commencer.
 */
export function repartitionsPossibles(
  grille: GrilleKenKen,
  cage: CageKenKen,
): number[][] {
  const taille = grille.taille
  const candidats: Candidats = Array.from(
    { length: taille * taille },
    () => new Set(Array.from({ length: taille }, (_, index) => index + 1)),
  )
  for (const autre of grille.cages) {
    if (autre.operation !== '=') continue
    const donnee = autre.cases[0]
    candidats[donnee] = new Set([autre.resultat])
    for (const alignee of alignees(donnee, taille)) {
      candidats[alignee].delete(autre.resultat)
    }
  }
  return assignationsValides(cage, candidats, taille)
}

/* -------------------------------------------------------------------------- */
/* Dénombrement des solutions : garde-fou indépendant du solveur déductif.     */
/* -------------------------------------------------------------------------- */

/**
 * Nombre de solutions de la grille, plafonné à `limite`.
 *
 * Les cases sont remplies cage par cage pour que chaque contrainte se vérifie
 * au plus tôt. Sert de contrôle indépendant dans les tests : la génération,
 * elle, s'appuie sur `evalueDifficulte`, dont la réussite prouve déjà l'unicité.
 */
export function compteSolutions(grille: GrilleKenKen, limite = 2): number {
  const taille = grille.taille
  const ordre = grille.cages.flatMap((cage) => cage.cases)
  const cageDe = new Map<number, CageKenKen>()
  for (const cage of grille.cages) {
    for (const index of cage.cases) cageDe.set(index, cage)
  }
  const valeurs = new Array<number>(taille * taille).fill(0)
  /** Une cage encore incomplète ne peut rien contredire ; une cage complète doit tomber juste. */
  const cageSatisfaite = (cage: CageKenKen, valeurs: number[]): boolean => {
    const contenu = cage.cases.map((autre) => valeurs[autre])
    if (contenu.includes(0)) return true
    return resultatCage(contenu, cage.operation) === cage.resultat
  }
  let solutions = 0
  const explore = (position: number): void => {
    if (solutions >= limite) return
    if (position === ordre.length) {
      solutions++
      return
    }
    const index = ordre[position]
    const interdites = new Set(
      alignees(index, taille)
        .map((autre) => valeurs[autre])
        .filter((valeur) => valeur !== 0),
    )
    for (let valeur = 1; valeur <= taille; valeur++) {
      if (interdites.has(valeur)) continue
      valeurs[index] = valeur
      const cage = cageDe.get(index)
      if (cage === undefined || cageSatisfaite(cage, valeurs)) {
        explore(position + 1)
      }
      valeurs[index] = 0
    }
  }
  explore(0)
  return solutions
}

/* -------------------------------------------------------------------------- */
/* Génération                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Dévoile une valeur de plus : une case sort de sa cage pour devenir une cage
 * d'une seule case. Renvoie `false` quand il n'y a plus rien à dévoiler.
 */
function devoileUneValeur(
  grille: GrilleKenKen,
  operations: OperationKenKen[],
): boolean {
  const composees = grille.cages.filter((cage) => cage.cases.length > 1)
  if (composees.length === 0) return false
  const cage = composees.reduce((plusGrande, candidate) =>
    candidate.cases.length > plusGrande.cases.length ? candidate : plusGrande,
  )
  for (const caseADevoiler of shuffle(cage.cases)) {
    const restantes = cage.cases.filter((index) => index !== caseADevoiler)
    // Retirer une case au milieu d'une cage la couperait en deux morceaux.
    if (!estConnexe(restantes, grille.taille)) continue
    const valeursRestantes = valeursDeLaCage(
      restantes,
      grille.solution,
      grille.taille,
    )
    const possibles = operationsPossibles(valeursRestantes, operations)
    if (possibles.length === 0) continue
    const operation = choice(possibles)
    cage.cases = restantes
    cage.operation = operation
    cage.resultat = resultatCage(valeursRestantes, operation)
    const valeur = valeursDeLaCage(
      [caseADevoiler],
      grille.solution,
      grille.taille,
    )[0]
    grille.cages.push({
      cases: [caseADevoiler],
      operation: '=',
      resultat: valeur,
    })
    return true
  }
  return false
}

/** Une grille complète (carré latin, cages, opérations), sans contrôle de difficulté. */
function tenteUneGrille(
  taille: number,
  operations: OperationKenKen[],
  tailleMaxCage: number,
  nbCagesSimplesMax: number,
): GrilleKenKen | null {
  const solution = carreLatinAleatoire(taille)
  for (let essai = 0; essai < NOMBRE_DE_DECOUPAGES; essai++) {
    const decoupage = decoupeEnCages(taille, tailleMaxCage, nbCagesSimplesMax)
    const cages = attribueLesOperations(
      decoupage,
      solution,
      taille,
      operations,
      essai === NOMBRE_DE_DECOUPAGES - 1,
    )
    if (cages !== null) return { taille, solution, cages }
  }
  return null
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
 * Une grille de KenKen conforme aux options demandées.
 *
 * On tire une grille, on dévoile des valeurs jusqu'à ce qu'elle se résolve par
 * déduction sans dépasser le niveau demandé, puis on ne la retient que si elle
 * exige bien une déduction de ce niveau. Faute de mieux au bout de
 * `NOMBRE_DE_TENTATIVES` tirages, la grille résoluble la plus proche du niveau
 * demandé est renvoyée : la génération est bornée en toutes circonstances.
 */
export function genereKenKen(options: OptionsKenKen): GrilleKenKen {
  const taille = Math.min(6, Math.max(3, Math.round(options.taille)))
  const niveau = options.niveau
  const operations =
    options.operations.length > 0 ? [...options.operations] : ['+' as const]
  const { nbCagesSimplesMax } = reglagesDuNiveau(niveau)
  // Sans addition ni multiplication, seules les cages de deux cases ont un sens.
  const accepteLesGrandesCages =
    operations.includes('+') || operations.includes('×')
  const tailleMaxCage = accepteLesGrandesCages
    ? reglagesDuNiveau(niveau).tailleMaxCage
    : 2

  // Une grille dont presque toutes les valeurs sont déjà écrites se résout
  // sans intérêt : au delà de ce seuil, la grille n'est retenue qu'à défaut
  // d'une meilleure.
  const donneesMax = Math.floor((taille * taille) / 3)
  let meilleure: GrilleKenKen | null = null
  let meilleurRang: number[] = []
  for (let tentative = 0; tentative < NOMBRE_DE_TENTATIVES; tentative++) {
    const grille = tenteUneGrille(
      taille,
      operations,
      tailleMaxCage,
      nbCagesSimplesMax,
    )
    if (grille === null) continue
    let evaluation = evalueDifficulte(grille)
    while (
      (!evaluation.resolue || evaluation.niveauMax > niveau) &&
      devoileUneValeur(grille, operations)
    ) {
      evaluation = evalueDifficulte(grille)
    }
    if (!evaluation.resolue) continue
    const nbDonnees = casesDonnees(grille).length
    if (evaluation.niveauMax === niveau && nbDonnees <= donneesMax)
      return grille
    // À défaut, on classe les grilles : d'abord celles dont le niveau est le
    // plus proche de celui demandé (une 3×3 n'a jamais besoin d'un
    // raisonnement de niveau 3), puis celles qui dévoilent le moins de
    // valeurs, puis celles qui demandent le plus d'étapes.
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
  // Dernier recours : une grille entièrement dévoilée est toujours résoluble.
  const grille = tenteUneGrille(
    taille,
    operations,
    tailleMaxCage,
    nbCagesSimplesMax,
  ) ?? {
    taille,
    solution: carreLatinAleatoire(taille),
    cages: [],
  }
  while (devoileUneValeur(grille, operations)) {
    /* on dévoile tout */
  }
  if (grille.cages.length === 0) {
    grille.cages = grille.solution.flatMap((ligne, indexLigne) =>
      ligne.map((valeur, indexColonne) => ({
        cases: [indexLigne * taille + indexColonne],
        operation: '=' as const,
        resultat: valeur,
      })),
    )
  }
  return grille
}

/** L'étiquette affichée dans le coin d'une cage : `12+`, `3-`, `2÷`, ou la valeur seule. */
export function etiquetteCage(cage: CageKenKen): string {
  return cage.operation === '='
    ? `${cage.resultat}`
    : `${cage.resultat}${cage.operation}`
}

/** Les cases dont la valeur est donnée dans l'énoncé, dans l'ordre de la grille. */
export function casesDonnees(grille: GrilleKenKen): number[] {
  return grille.cages
    .filter((cage) => cage.operation === '=')
    .map((cage) => cage.cases[0])
    .sort((premiere, seconde) => premiere - seconde)
}
