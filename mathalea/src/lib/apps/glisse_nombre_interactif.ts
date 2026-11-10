import GlisseNombreElement from 'glisse-nombre'
import { context } from '../../modules/context'

/**
 * Définit le customElement glisse-nombre
 */
if (customElements.get('glisse-nombre') === undefined) {
  customElements.define('glisse-nombre', GlisseNombreElement)
}

type GlisseNombreInteractifOptions = {
  number?: number // pour préremplir le nombre (par défaut 1)
  addZeros?: boolean // pour afficher les zéros automatiquement (par défaut à true)
  animation?: number // pour désactiver le déplacement manuel et animer une multiplication
  showCalculus?: boolean // pour afficher ✕ ou ÷ 10, 100... (par défaut à true)
  showComma1?: boolean // pour afficher la virgule de la première ligne (par défaut à true)
  showComma2?: boolean // pour afficher la virgule de la deuxième ligne (par défaut à true)
  initialPower?: number // pour choisir la colonne de départ des calculs (par défaut à 0)
  removeLeftZeros?: boolean // pour ne pas afficher les zéros à gauche du premier chiffre non nul par exemple n'afficher que le chiffre des centièmes dans 0,01 (par défaut à false)
  integerOnly?: boolean // pour ne travailler qu'avec des entiers sur neuf colonnes, des centaines de millions aux unités (par défaut à false)
}

/**
 * Retourne le code HTML pour afficher un glisse-nombre interactif
 * @param options - options pour personnaliser le glisse-nombre
 * @param options.number - le nombre à afficher (par défaut 1)
 * @param options.addZeros - pour afficher les zéros automatiquement (par défaut à true)
 * @param options.animation - pour désactiver le déplacement manuel et animer une multiplication (par défaut à 0)
 * @param options.showCalculus - pour afficher ✕ ou ÷ 10, 100... (par défaut à true)
 * @param options.showComma1 - pour afficher la virgule de la première ligne (par défaut à true)
 * @param options.showComma2 - pour afficher la virgule de la deuxième ligne (par défaut à true)
 * @param options.removeLeftZeros - pour ne pas afficher les zéros à gauche du premier chiffre non nul pour par exemple n'afficher que le chiffre des centièmes dans 0,01 (par défaut à false)
 * @param options.initialPower - pour choisir la colonne de départ des calculs (par défaut à 0)
 * @param options.integerOnly - pour ne travailler qu'avec des entiers sur neuf colonnes, des centaines de millions aux unités (par défaut à false)
 * @returns le code HTML du glisse-nombre interactif
 */
export function glisseNombreInteractif(
  options?: GlisseNombreInteractifOptions,
): string {
  if (!context.isHtml) {
    return '' // La sortie LaTeX n'est pas encore gérée
  }
  let optionsString = ''
  if (options) {
    if (options.number !== undefined)
      optionsString += `number="${options.number}" `
    if (options.addZeros !== undefined)
      optionsString += `add-zeros="${options.addZeros}" `
    if (options.animation !== undefined)
      optionsString += `animation="${options.animation}" `
    if (options.showCalculus !== undefined)
      optionsString += `show-calculus="${options.showCalculus}" `
    if (options.showComma1 !== undefined)
      optionsString += `show-comma1="${options.showComma1}" `
    if (options.showComma2 !== undefined)
      optionsString += `show-comma2="${options.showComma2}" `
    if (options.removeLeftZeros !== undefined)
      optionsString += `remove-left-zeros="${options.removeLeftZeros}" `
    if (options.initialPower !== undefined)
      optionsString += `initial-power="${options.initialPower}" `
    if (options.integerOnly !== undefined)
      optionsString += `integer-only="${options.integerOnly}" `
  }
  return `<div class="block"><glisse-nombre ${optionsString}></glisse-nombre></div>`
}
