<script lang="ts">
  /**
   * L'ensemble de ce fichier : code typescript, contenu Html est le fruit du travail exclusif de Jean-claude Lhote.
   * @author Jean-claude Lhote
   */
  import { tick } from 'svelte'
  import { renderKatex } from '../../../../lib/mathalea'

  export let content = ''
  export let svgScale = 1

  let el: HTMLDivElement
  let scaledContent = ''

  function normalizeSvgScale(value: number): number {
    if (!Number.isFinite(value)) return 1
    return Math.max(0.5, Math.min(1.5, value))
  }

  function applySvgScale(container: HTMLDivElement, scale: number): void {
    const normalizedScale = normalizeSvgScale(scale)
    const transform = `scale(${normalizedScale})`

    for (const svg of container.querySelectorAll('svg')) {
      svg.style.transformOrigin = 'top left'
      if (Math.abs(normalizedScale - 1) < 0.0001) {
        svg.style.removeProperty('transform')
      } else {
        svg.style.transform = transform
      }
    }
  }

  function injectSvgScaleInMarkup(rawHtml: string, scale: number): string {
    if (typeof rawHtml !== 'string' || rawHtml.length === 0) return ''

    const normalizedScale = normalizeSvgScale(scale)
    const needsScale = Math.abs(normalizedScale - 1) >= 0.0001

    return rawHtml.replace(
      /<svg\b([^>]*)>/gi,
      (fullMatch, attrsRaw: string) => {
        const attrs = attrsRaw ?? ''
        const styleMatch = attrs.match(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/i)
        const scaleStyle = needsScale
          ? `transform-origin: top left; transform: scale(${normalizedScale});`
          : 'transform-origin: top left;'

        if (styleMatch) {
          const quote = styleMatch[1]
          const existingStyle = styleMatch[2]
          const cleanedStyle = existingStyle
            .replace(/transform-origin\s*:[^;]*;?/gi, '')
            .replace(/transform\s*:[^;]*;?/gi, '')
            .trim()
          const nextStyle = `${cleanedStyle}${cleanedStyle ? ' ' : ''}${scaleStyle}`
          const nextAttrs = attrs.replace(
            /\sstyle\s*=\s*(["'])[\s\S]*?\1/i,
            ` style=${quote}${nextStyle}${quote}`,
          )
          return `<svg${nextAttrs}>`
        }

        return `<svg${attrs} style="${scaleStyle}">`
      },
    )
  }

  $: scaledContent = injectSvgScaleInMarkup(content, svgScale)

  // Re-render KaTeX every time content changes (covers onMount + updates).
  $: if (el && content !== undefined) {
    const normalizedScale = normalizeSvgScale(svgScale)
    tick().then(() => {
      if (el) {
        try {
          renderKatex(el)
        } catch {
          // Ignore KaTeX errors in preview (commandes LaTeX non supportées).
        }
        applySvgScale(el, normalizedScale)
      }
    })
  }
</script>

<div
  class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus [&_svg]:inline-block [&_svg]:max-w-full [&_svg]:h-auto"
  bind:this={el}
>
  {@html scaledContent}
</div>
