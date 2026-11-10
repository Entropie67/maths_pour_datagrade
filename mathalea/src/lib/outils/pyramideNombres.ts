import { randint } from '../../modules/outils'
import { choice, shuffle } from './arrayOutils'

/**
 * Génération et résolution de pyramides de nombres.
 *
 * Une pyramide de nombres empile des étages de cases : l'étage du bas en
 * compte autant que la pyramide a d'étages, et chaque étage supérieur en
 * compte une de moins. Entre deux cases voisines d'un même étage est écrite
 * une opération : elle donne la valeur de la case posée juste au-dessus
 * d'elles.
 *
 * Contrairement à la pyramide additive classique (`src/modules/pyramide.ts`),
 * l'opération change d'une paire de cases à l'autre et toutes les valeurs sont
 * entières, division comprise.
 *
 * Ce module ne dépend ni du DOM ni de MathALÉA : il est testable seul. Seules
 * `generePyramide()` et ses fonctions de tirage utilisent le hasard ; la
 * résolution (`resoutPyramide`) est déterministe, pour ne pas déplacer les
 * tirages d'un exercice (voir `documentation/tests/stabilite-exercices.md`).
 *
 * @author Rémi Angot
 */

export type OperationPyramide = '+' | '-' | '×' | '÷'

/** Les opérations utilisables entre deux cases voisines. */
export const OPERATIONS_PYRAMIDE: OperationPyramide[] = ['+', '-', '×', '÷']

/**
 * `'base'` : tout l'étage du bas est donné, la pyramide se remplit de bas en
 * haut. `'trous'` : les valeurs données sont éparpillées, certaines cases se
 * trouvent donc en remontant un calcul.
 */
export type ModePyramide = 'base' | 'trous'

export type PyramideNombres = {
  nbEtages: number
  /** `valeurs[etage][index]`, l'étage 0 étant celui du bas. */
  valeurs: number[][]
  /**
   * `operations[etage][index]` relie `valeurs[etage][index]` et
   * `valeurs[etage][index + 1]` pour donner `valeurs[etage + 1][index]`.
   * L'étage du sommet ne relie rien : sa liste est vide.
   */
  operations: OperationPyramide[][]
  /** `donnees[etage][index]` : la valeur est écrite dans l'énoncé. */
  donnees: boolean[][]
}

export type OptionsPyramide = {
  /** Nombre d'étages, entre 2 et 6. */
  nbEtages: number
  mode: ModePyramide
  /** Autorise les valeurs négatives, dans l'étage du bas comme au-dessus. */
  nombresNegatifs: boolean
  /** Valeur absolue maximale d'une case, étage du bas compris. */
  valeurMax: number
}

/** Une déduction du solveur, dans l'ordre où elle devient possible. */
export type EtapePyramide = {
  /** Étage du bas du triangle concerné (celui qui porte l'opération). */
  etage: number
  /** Index, dans cet étage, de la case de gauche du triangle. */
  index: number
  operation: OperationPyramide
  /** La case du triangle que cette étape détermine. */
  trouvee: 'sommet' | 'gauche' | 'droite'
  /** Les trois valeurs du triangle, une fois l'étape faite. */
  gauche: number
  droite: number
  sommet: number
}

export type ResolutionPyramide = {
  /** `connus[etage][index]` après propagation. */
  connus: boolean[][]
  etapes: EtapePyramide[]
  /** Toutes les cases ont été déterminées. */
  resolue: boolean
}

/** Plafond retenu quand le professeur n'en demande pas d'autre. */
export const VALEUR_MAX_PAR_DEFAUT = 99
/** Valeur absolue maximale d'une case de l'étage du bas. */
const VALEUR_MAX_BASE = 9
/** Nombre de pyramides tirées avant d'accepter la dernière telle quelle. */
const NOMBRE_DE_TENTATIVES = 100

function bornesEtages(nbEtages: number): number {
  const nombre = Math.round(Number(nbEtages))
  if (!Number.isFinite(nombre)) return 5
  return Math.min(6, Math.max(2, nombre))
}

/**
 * Le plafond des cases. Un plafond trop bas ne laisserait plus assez de place
 * pour empiler les étages : l'étage du bas est déjà tiré jusqu'à 9.
 */
export function bornesValeurMax(valeurMax: number): number {
  const nombre = Math.round(Number(valeurMax))
  if (!Number.isFinite(nombre)) return VALEUR_MAX_PAR_DEFAUT
  return Math.min(9999, Math.max(10, nombre))
}

/** Le nombre de cases d'un étage, l'étage 0 étant celui du bas. */
export function nbCasesDeLEtage(etage: number, nbEtages: number): number {
  return nbEtages - etage
}

/**
 * Le résultat de l'opération, ou `null` quand elle ne tombe pas juste : toutes
 * les valeurs d'une pyramide sont entières.
 */
export function appliqueOperation(
  gauche: number,
  droite: number,
  operation: OperationPyramide,
): number | null {
  switch (operation) {
    case '+':
      return gauche + droite
    case '-':
      return gauche - droite
    case '×':
      return gauche * droite
    case '÷':
      return droite !== 0 && gauche % droite === 0 ? gauche / droite : null
  }
}

/** Les opérations qui donnent une case acceptable au-dessus de deux voisines. */
export function operationsPossibles(
  gauche: number,
  droite: number,
  nombresNegatifs: boolean,
  valeurMax: number = VALEUR_MAX_PAR_DEFAUT,
): OperationPyramide[] {
  return OPERATIONS_PYRAMIDE.filter((operation) => {
    // Diviser par 1 ou par −1 recopie la case de gauche : le calcul n'apprend
    // rien et la division devient invisible dans la pyramide.
    if (operation === '÷' && Math.abs(droite) < 2) return false
    const resultat = appliqueOperation(gauche, droite, operation)
    return (
      resultat !== null &&
      Math.abs(resultat) <= valeurMax &&
      (nombresNegatifs || resultat >= 0)
    )
  })
}

/** La case de gauche déduite du sommet et de la case de droite, si elle l'est. */
export function deduitGauche(
  sommet: number,
  droite: number,
  operation: OperationPyramide,
): number | null {
  switch (operation) {
    case '+':
      return sommet - droite
    case '-':
      return sommet + droite
    case '×':
      // Avec une case de droite nulle, le sommet est nul quelle que soit la
      // case de gauche : rien ne la détermine.
      return droite !== 0 && sommet % droite === 0 ? sommet / droite : null
    case '÷':
      return sommet * droite
  }
}

/** La case de droite déduite du sommet et de la case de gauche, si elle l'est. */
export function deduitDroite(
  sommet: number,
  gauche: number,
  operation: OperationPyramide,
): number | null {
  switch (operation) {
    case '+':
      return sommet - gauche
    case '-':
      return gauche - sommet
    case '×':
      return gauche !== 0 && sommet % gauche === 0 ? sommet / gauche : null
    case '÷':
      return sommet !== 0 && gauche % sommet === 0 ? gauche / sommet : null
  }
}

/** Toutes les cases de la pyramide, de l'étage du bas au sommet. */
export function toutesLesCases(
  nbEtages: number,
): { etage: number; index: number }[] {
  const cases: { etage: number; index: number }[] = []
  for (let etage = 0; etage < nbEtages; etage++) {
    for (let index = 0; index < nbCasesDeLEtage(etage, nbEtages); index++) {
      cases.push({ etage, index })
    }
  }
  return cases
}

/**
 * Remplit la pyramide de proche en proche à partir des valeurs données.
 *
 * Une case se déduit soit en descendant l'opération (les deux cases du dessous
 * sont connues), soit en la remontant (le sommet du triangle et une des deux
 * cases du dessous sont connus). Une déduction n'est retenue que lorsqu'elle
 * détermine la case sans ambiguïté et donne un entier : la pyramide obtenue
 * est donc l'unique solution des valeurs données.
 */
export function resoutPyramide(
  pyramide: PyramideNombres,
  donnees: boolean[][],
): ResolutionPyramide {
  const { nbEtages, valeurs, operations } = pyramide
  const connus = donnees.map((etage) => [...etage])
  const etapes: EtapePyramide[] = []
  let progres = true
  while (progres) {
    progres = false
    for (let etage = 0; etage < nbEtages - 1; etage++) {
      for (let index = 0; index < operations[etage].length; index++) {
        const operation = operations[etage][index]
        const gauche = valeurs[etage][index]
        const droite = valeurs[etage][index + 1]
        const sommet = valeurs[etage + 1][index]
        const etape = { etage, index, operation, gauche, droite, sommet }
        if (
          connus[etage][index] &&
          connus[etage][index + 1] &&
          !connus[etage + 1][index]
        ) {
          connus[etage + 1][index] = true
          etapes.push({ ...etape, trouvee: 'sommet' })
          progres = true
        } else if (
          connus[etage + 1][index] &&
          connus[etage][index + 1] &&
          !connus[etage][index] &&
          deduitGauche(sommet, droite, operation) !== null
        ) {
          connus[etage][index] = true
          etapes.push({ ...etape, trouvee: 'gauche' })
          progres = true
        } else if (
          connus[etage + 1][index] &&
          connus[etage][index] &&
          !connus[etage][index + 1] &&
          deduitDroite(sommet, gauche, operation) !== null
        ) {
          connus[etage][index + 1] = true
          etapes.push({ ...etape, trouvee: 'droite' })
          progres = true
        }
      }
    }
  }
  return {
    connus,
    etapes,
    resolue: connus.every((etage) => etage.every(Boolean)),
  }
}

/** Tire les valeurs et les opérations, sans choisir encore les cases données. */
function tirePyramide(
  nbEtages: number,
  nombresNegatifs: boolean,
  valeurMax: number,
  amplitudeBase: number,
): PyramideNombres | null {
  const base: number[] = []
  for (let index = 0; index < nbEtages; index++) {
    base.push(
      nombresNegatifs
        ? randint(-amplitudeBase, amplitudeBase, [0])
        : randint(1, amplitudeBase),
    )
  }
  const valeurs: number[][] = [base]
  const operations: OperationPyramide[][] = []
  for (let etage = 0; etage < nbEtages - 1; etage++) {
    const operationsDeLEtage: OperationPyramide[] = []
    const etageSuivant: number[] = []
    for (let index = 0; index < nbCasesDeLEtage(etage, nbEtages) - 1; index++) {
      const gauche = valeurs[etage][index]
      const droite = valeurs[etage][index + 1]
      const possibles = operationsPossibles(
        gauche,
        droite,
        nombresNegatifs,
        valeurMax,
      )
      // Deux cases dont aucune opération ne donne une case acceptable : la
      // pyramide est abandonnée, l'appelant en tire une autre.
      if (possibles.length === 0) return null
      const operation = choice(possibles)
      operationsDeLEtage.push(operation)
      etageSuivant.push(appliqueOperation(gauche, droite, operation) as number)
    }
    operations.push(operationsDeLEtage)
    valeurs.push(etageSuivant)
  }
  operations.push([])
  return {
    nbEtages,
    valeurs,
    operations,
    donnees: valeurs.map((etage) => etage.map(() => false)),
  }
}

/**
 * L'amplitude de l'étage du bas pour une tentative donnée.
 *
 * Plus le plafond demandé est bas, plus les grands nombres de l'étage du bas
 * mènent vite à une impasse : les premières tentatives gardent l'amplitude
 * maximale, puis elle se resserre pour finir par tenir dans n'importe quel
 * plafond.
 */
function amplitudeDeLaTentative(essai: number, valeurMax: number): number {
  const plafond = Math.min(VALEUR_MAX_BASE, valeurMax)
  const resserrement = Math.floor(essai / 20)
  return Math.max(2, plafond - resserrement)
}

/**
 * Les cases écrites dans l'énoncé.
 *
 * En mode « trous », les cases sont retirées une à une, dans un ordre au
 * hasard, tant que la pyramide reste entièrement déductible : il ne reste donc
 * que des valeurs indispensables, et aucune case ne s'obtient sans calcul.
 */
function choisitLesDonnees(
  pyramide: PyramideNombres,
  mode: ModePyramide,
): boolean[][] {
  const { nbEtages, valeurs } = pyramide
  if (mode === 'base') {
    return valeurs.map((etage, rang) => etage.map(() => rang === 0))
  }
  const donnees = valeurs.map((etage) => etage.map(() => true))
  for (const { etage, index } of shuffle(toutesLesCases(nbEtages))) {
    donnees[etage][index] = false
    if (!resoutPyramide(pyramide, donnees).resolue) donnees[etage][index] = true
  }
  return donnees
}

/** Vrai dès qu'une case de la pyramide porte un nombre négatif. */
function contientUnNegatif(pyramide: PyramideNombres): boolean {
  return pyramide.valeurs.some((etage) => etage.some((valeur) => valeur < 0))
}

/**
 * Une pyramide complète : ses valeurs, ses opérations et les cases données.
 *
 * Le tirage est relancé tant que la pyramide ne convient pas — aucune
 * opération possible entre deux cases, ou aucun nombre négatif alors que le
 * professeur en a demandé.
 */
export function generePyramide(options: OptionsPyramide): PyramideNombres {
  const nbEtages = bornesEtages(options.nbEtages)
  const valeurMax = bornesValeurMax(options.valeurMax)
  let derniere: PyramideNombres | null = null
  for (let essai = 0; essai < NOMBRE_DE_TENTATIVES; essai++) {
    const pyramide = tirePyramide(
      nbEtages,
      options.nombresNegatifs,
      valeurMax,
      amplitudeDeLaTentative(essai, valeurMax),
    )
    if (pyramide === null) continue
    derniere = pyramide
    if (options.nombresNegatifs && !contientUnNegatif(pyramide)) continue
    pyramide.donnees = choisitLesDonnees(pyramide, options.mode)
    return pyramide
  }
  // Toutes les tentatives ont échoué : la dernière pyramide tirée reste juste,
  // seule la présence d'un nombre négatif n'est pas garantie.
  const pyramide = derniere ?? pyramideDeSecours(nbEtages)
  pyramide.donnees = choisitLesDonnees(pyramide, options.mode)
  return pyramide
}

/**
 * La pyramide de secours : que des 1 reliés par des multiplications.
 *
 * Elle ne sert que si toutes les tentatives ont échoué, ce qui suppose un
 * plafond si bas qu'aucune pyramide ordinaire n'y tient. Elle reste juste et
 * respecte n'importe quel plafond, l'addition et la soustraction n'étant pas
 * les seules à pouvoir sortir de la borne demandée.
 */
function pyramideDeSecours(nbEtages: number): PyramideNombres {
  const valeurs: number[][] = []
  const operations: OperationPyramide[][] = []
  for (let etage = 0; etage < nbEtages; etage++) {
    const nbCases = nbCasesDeLEtage(etage, nbEtages)
    valeurs.push(Array.from({ length: nbCases }, () => 1))
    operations.push(Array.from({ length: nbCases - 1 }, () => '×' as const))
  }
  return {
    nbEtages,
    valeurs,
    operations,
    donnees: valeurs.map((etage) => etage.map(() => false)),
  }
}
