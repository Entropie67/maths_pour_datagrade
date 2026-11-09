import type { KeyboardBlock } from '../types/keyboardContent'
import { usualBlockWidth } from '../types/keyboardContent'
import {
  GAP_BETWEEN_BLOCKS,
  GAP_BETWEEN_KEYS,
  KEYCAP_HEIGHT,
  KEYCAP_WIDTH,
  MD_BREAKPOINT,
  SM_BREAKPOINT,
  estSmartphone,
  getMode,
} from './sizes'

/** Clé `localStorage` du dernier choix « réduit / agrandi » de l'élève. */
export const CLE_PREFERENCE_CLAVIER_REDUIT = 'mathaleaClavierReduit'

/**
 * Part maximale de la hauteur de la fenêtre que le clavier agrandi peut
 * occuper pour être ouvert d'office (hors écran tactile).
 */
export const PART_MAX_HAUTEUR_CLAVIER_AGRANDI = 0.4

/** Hauteur des onglets d'unités (Longueurs, Aires…) du clavier agrandi. */
const HAUTEUR_ONGLETS_UNITES = 28

/**
 * Lit le dernier choix de l'élève (bouton agrandir / réduire).
 * @returns `true` pour réduit, `false` pour agrandi, `null` sans choix
 */
export function lisPreferenceClavierReduit(): boolean | null {
  try {
    const valeur = window.localStorage.getItem(CLE_PREFERENCE_CLAVIER_REDUIT)
    return valeur === null ? null : valeur === 'true'
  } catch {
    return null
  }
}

export function enregistrePreferenceClavierReduit(reduit: boolean): void {
  try {
    window.localStorage.setItem(CLE_PREFERENCE_CLAVIER_REDUIT, String(reduit))
  } catch {
    // stockage indisponible (navigation privée…) : le choix vaut pour la page
  }
}

/**
 * Estime l'encombrement du clavier agrandi, sans l'afficher, d'après la
 * disposition de `KeyboardPage` : blocs côte à côte (unités regroupées en
 * onglets quand il y en a plusieurs) suivis de la touche agrandir / réduire.
 * @param usualBlocks blocs hors unités, touches spéciales comprises
 * @param unitsBlocks blocs d'unités
 * @param innerWidth largeur de la fenêtre
 * @param avecToucheBascule la touche agrandir / réduire est affichée (absente sur smartphone)
 */
export function dimensionsClavierAgrandi(
  usualBlocks: KeyboardBlock[],
  unitsBlocks: KeyboardBlock[],
  innerWidth: number,
  avecToucheBascule = true,
): { largeur: number; hauteur: number } {
  const mode = getMode(innerWidth, false)
  const hauteurBloc = (block: KeyboardBlock) => {
    const nbLignes = Math.ceil(block.keycaps.block.length / block.cols)
    return (
      nbLignes * KEYCAP_HEIGHT[innerWidth <= SM_BREAKPOINT ? 'sm' : 'md'] +
      (nbLignes - 1) * GAP_BETWEEN_KEYS[mode]
    )
  }
  const unitesEnOnglets = unitsBlocks.length > 1
  const blocs = unitesEnOnglets ? usualBlocks : [...unitsBlocks, ...usualBlocks]
  const largeurs = blocs.map((block) => usualBlockWidth(block, mode))
  let hauteur = Math.max(0, ...blocs.map(hauteurBloc))
  if (unitesEnOnglets) {
    largeurs.push(
      Math.max(...unitsBlocks.map((block) => usualBlockWidth(block, mode))),
    )
    hauteur = Math.max(
      hauteur,
      HAUTEUR_ONGLETS_UNITES + Math.max(...unitsBlocks.map(hauteurBloc)),
    )
  }
  if (avecToucheBascule) largeurs.push(KEYCAP_WIDTH[mode])
  // Padding du clavier : 8 px de chaque côté (16 px dès `md`). Sous `md`, le
  // conteneur des blocs ajoute 8 px en haut et en bas : 32 px de haut partout.
  const paddingHorizontal = innerWidth >= MD_BREAKPOINT ? 32 : 16
  return {
    largeur:
      largeurs.reduce((total, largeur) => total + largeur, 0) +
      (largeurs.length - 1) * GAP_BETWEEN_BLOCKS[mode] +
      paddingHorizontal,
    hauteur: hauteur + 32,
  }
}

/**
 * Choisit l'affichage du clavier à l'ouverture d'un champ : on évite autant
 * que possible des pages de touches que l'élève devrait découvrir.
 * - sur smartphone, le clavier est toujours agrandi et sans bouton de bascule :
 *   les touches se partagent la largeur disponible, sans largeur fixe ;
 * - le dernier choix de l'élève prime ;
 * - si toutes les touches tiennent sur une ligne, le clavier est réduit ;
 * - sinon il est agrandi, sauf s'il déborde de l'écran ou, hors écran
 *   tactile, s'il occupe trop de hauteur : on garde alors les pages.
 * @returns `true` pour le clavier réduit (en ligne)
 */
export function choisitClavierReduit({
  preference,
  nbPagesEnLigne,
  agrandi,
  innerWidth,
  innerHeight,
  tactile,
}: {
  preference: boolean | null
  nbPagesEnLigne: number
  agrandi: { largeur: number; hauteur: number }
  innerWidth: number
  innerHeight: number
  tactile: boolean
}): boolean {
  if (estSmartphone(innerWidth)) return false
  if (preference !== null) return preference
  if (nbPagesEnLigne <= 1) return true
  // Sur écran tactile, le clavier agrandi reste l'affichage par défaut.
  if (tactile) return false
  if (agrandi.largeur > innerWidth) return true
  return agrandi.hauteur > PART_MAX_HAUTEUR_CLAVIER_AGRANDI * innerHeight
}
