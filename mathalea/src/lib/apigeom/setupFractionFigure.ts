import erase from 'apigeom/src/assets/svg/erase.svg'
import minus from 'apigeom/src/assets/svg/minus.svg'
import plus from 'apigeom/src/assets/svg/plus.svg'
import RectangleFractionDiagram from 'apigeom/src/elements/diagrams/RectangleFractionDiagram'
import TextByPosition from 'apigeom/src/elements/text/TextByPosition'
import type Figure from 'apigeom/src/Figure'

export function setupFractionFigureIfNeeded(figure: Figure): void {
  if (
    !Array.from(figure.elements.values()).some(
      (ele) => ele instanceof RectangleFractionDiagram,
    )
  ) {
    return // ❌ Rien à injecter
  }

  // 🔥 À partir d’ici on sait que la figure est compatible
  function decreaseDenominator(): void {
    let denominator = 2
    figure.elements.forEach((ele) => {
      if (ele instanceof RectangleFractionDiagram) {
        if (ele.denominator === 2) return
        const num = ele.numerator
        ele.denominator--
        denominator = ele.denominator
        ele.redraw()
        ele.numerator = num
      }
      if (ele instanceof TextByPosition) {
        ele.text = `L'unité est partagée en ${denominator} parts égales.`
      }
    })
  }

  function increaseDenominator(): void {
    let denominator = 2
    figure.elements.forEach((ele) => {
      if (ele instanceof RectangleFractionDiagram) {
        const num = ele.numerator
        ele.denominator++
        denominator = ele.denominator
        ele.redraw()
        ele.numerator = num
      }
      if (ele instanceof TextByPosition) {
        ele.text = `L'unité est partagée en ${denominator} parts égales.`
      }
    })
  }

  function clearFill(): void {
    figure.elements.forEach((ele) => {
      if (ele instanceof RectangleFractionDiagram) {
        ele.numerator = 0
      }
    })
  }

  // Toolbar
  figure.setToolbar({ position: 'top', tools: ['FILL'] })

  // Label
  const p = document.createElement('p')
  p.textContent = 'Brouillon non évalué'
  p.classList.add(
    'italic',
    'font-black',
    'text-coopmaths-struct',
    'ml-10',
    'my-auto',
  )

  figure.addCustomButton({
    action: decreaseDenominator,
    tooltip: 'Diminuer le nombre de parts',
    url: minus,
  })

  figure.addCustomButton({
    action: increaseDenominator,
    record: true,
    tooltip: 'Augmenter le nombre de parts',
    url: plus,
  })

  figure.addCustomButton({
    action: clearFill,
    tooltip: 'Réinitialiser le coloriage',
    url: erase,
  })

  figure.divButtons.appendChild(p)
  figure.container.classList.add(
    'border-2',
    'border-coopmaths-struct',
    'p-2',
    'rounded-md',
  )

  figure.container.style.overflowX = 'auto'
  figure.divUserMessage.style.display = 'none'

  // Texte initial seulement s’il n’existe pas déjà
  const hasText = Array.from(figure.elements.values()).some(
    (ele: any) => ele instanceof TextByPosition,
  )

  if (!hasText) {
    figure.create('TextByPosition', {
      text: `L'unité est partagée en 2 parts égales.`,
      x: 0,
      y: -1.5,
      anchor: 'bottomLeft',
      isChild: false,
    })
  }
}
