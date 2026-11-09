import { randint } from '../../modules/outils'
import { bleuMathalea } from '../colors'
import { miseEnEvidence } from './embellissements'
import { ppcm, ppcmListe } from './primalite'
import { texNombre } from './texNombre'

/**
 * Un train d'engrenages : des roues alignées de la gauche vers la droite.
 * Toutes les roues retrouvent leur position initiale ensemble après que
 * `cycle` dents ont défilé devant le point de contact.
 */
export type Train = {
  /** nombre de dents de chaque roue, de gauche à droite */
  dents: number[]
  /** plus petit multiple commun des nombres de dents */
  cycle: number
  /** nombre de tours de chaque roue pendant un cycle */
  tours: number[]
}

export function creeTrain(dents: number[]): Train {
  const cycle = ppcmListe(dents)
  return { dents, cycle, tours: dents.map((d) => cycle / d) }
}

/** Nombre de tours de la première roue quand elle est synchronisée avec la roue `rang`. */
export function toursAvec(train: Train, rang: number) {
  const { dents } = train
  return ppcm(dents[0], dents[rang]) / dents[0]
}

/** Aucune des deux roues ne divise l'autre : elles font toutes les deux au moins deux tours. */
function sontIndependantes(a: number, b: number) {
  return a % b !== 0 && b % a !== 0
}

/** Deux roues dont l'une fait au plus quatre tours avant la synchronisation. */
export function tireDeuxRoues() {
  let train: Train
  do {
    const a = randint(8, 25)
    const b = randint(8, 25, a)
    train = creeTrain([a, b])
  } while (
    !sontIndependantes(...(train.dents as [number, number])) ||
    Math.min(...train.tours) > 4
  )
  return train
}

/**
 * Trois roues pour lesquelles :
 * - la roue de gauche est indépendante de celle du milieu et de celle de droite ;
 * - quand la roue de gauche est synchronisée avec celle de droite,
 *   celle du milieu n'est pas dans sa position initiale ;
 * - aucune roue ne fait plus de 60 tours pendant le cycle complet.
 */
export function tireTroisRoues() {
  let train: Train
  do {
    const a = randint(8, 25)
    const b = randint(8, 25, a)
    const c = randint(8, 25, [a, b])
    train = creeTrain([a, b, c])
  } while (
    !sontIndependantes(train.dents[0], train.dents[1]) ||
    !sontIndependantes(train.dents[0], train.dents[2]) ||
    ppcm(train.dents[0], train.dents[2]) % train.dents[1] === 0 ||
    Math.max(...train.tours) > 60
  )
  return train
}

/** `1 tour`, `3 tours` : le nombre est en mode mathématique. */
export function tours(n: number) {
  return `$${texNombre(n, 0)}$ tour${n > 1 ? 's' : ''}`
}

/** `1 dent`, `12 dents` : le nombre est en mode mathématique. */
export function dents(n: number) {
  return `$${texNombre(n, 0)}$ dent${n > 1 ? 's' : ''}`
}

/**
 * Multiples successifs de `nbDents`, par lignes de cinq, jusqu'au multiple commun `commun` mis en évidence.
 */
export function multiplesJusqua(nbDents: number, commun: number) {
  const lignes: string[][] = []
  for (let k = 1; k <= commun / nbDents; k++) {
    const produit = k * nbDents
    const resultat =
      produit === commun
        ? miseEnEvidence(texNombre(produit, 0), bleuMathalea)
        : texNombre(produit, 0)
    if ((k - 1) % 5 === 0) lignes.push([])
    lignes[lignes.length - 1].push(`$${k}\\times${nbDents}=${resultat}$`)
  }
  return `Multiples de $${nbDents}$ :<br>${lignes.map((l) => l.join(' ; ')).join('<br>')}<br>`
}
