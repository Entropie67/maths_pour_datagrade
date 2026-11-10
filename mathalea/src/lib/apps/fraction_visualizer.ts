import FractionVisualizer from 'fraction-visualizer'
import { context } from '../../modules/context'

export type ShapeName = 'square' | 'disk' | 'rectangle' | 'bar' | 'segment'
export type BorderMode = 'none' | 'filled' | 'all' | 'cursor'

/**
 * Définit le customElement fraction-visualizer
 */
if (customElements.get('fraction-visualizer') === undefined) {
  customElements.define('fraction-visualizer', FractionVisualizer)
}

type FractionVisualizerOptions = {
  shape?: ShapeName
  filled?: number
  total?: number
  showFilledSlider?: boolean
  borderMode?: BorderMode
  showPartNumbers?: boolean
  showLabels?: boolean
  labelStart?: number
  labelValues?: string
  sliderMaxInput?: number
  borderCount?: number
}

/**
 * Retourne le code HTML pour afficher un fraction-visualizer interactif
 * @param options - options pour personnaliser le composant
 * @param options.shape - forme de la fraction ('square', 'disk', 'rectangle', 'bar', 'segment')
 * @param options.filled - nombre de parties remplies
 * @param options.total - nombre total de parties par unité
 * @param options.showFilledSlider - afficher le curseur pour ajuster les parties remplies
 * @param options.sliderMaxInput - valeur maximale pour les curseurs
 * @param options.borderMode - mode des bordures ('none', 'filled', 'all', 'cursor')
 * @param options.showPartNumbers - afficher les numéros des parties
 * @param options.showLabels - afficher les abscisses
 * @param options.labelStart - valeur de départ des abscisses
 * @param options.labelValues - abscisses à afficher
 * @param options.borderCount - nombre de bordures à afficher
 * @returns le code HTML du fraction-visualizer interactif
 * @author Guillaume Valmont
 */
export function fractionVisualizer(
  options?: FractionVisualizerOptions,
): string {
  if (!context.isHtml) {
    return '' // La sortie LaTeX n'est pas encore gérée
  }
  let optionsString: string = ''
  if (options) {
    if (options.shape !== undefined)
      optionsString += `shape="${options.shape}" `
    if (options.filled !== undefined)
      optionsString += `filled="${options.filled}" `
    if (options.total !== undefined)
      optionsString += `total="${options.total}" `
    if (options.showFilledSlider !== undefined)
      optionsString += `show-filled-slider="${options.showFilledSlider}" `
    if (options.borderMode !== undefined)
      optionsString += `border-mode="${options.borderMode}" `
    if (options.showPartNumbers !== undefined)
      optionsString += `show-part-numbers="${options.showPartNumbers}" `
    if (options.showLabels !== undefined)
      optionsString += `show-labels="${options.showLabels}" `
    if (options.labelStart !== undefined)
      optionsString += `label-start="${options.labelStart}" `
    if (options.labelValues !== undefined)
      optionsString += `label-values="${options.labelValues}" `
    if (options.sliderMaxInput !== undefined)
      optionsString += `slider-max-input="${options.sliderMaxInput}" `
    if (options.borderCount !== undefined)
      optionsString += `border-count="${options.borderCount}" `
  }
  return `<div class="block"><fraction-visualizer ${optionsString}></fraction-visualizer></div>`
}
