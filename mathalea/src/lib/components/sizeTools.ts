/**
 * Calcule et attribue la taille (largeur et hauteur) des SVGs et adapte la position des `divLatex` à l'intérieur
 * du SVG. Le principe est le suivant : on récupère la largeur du container parent (passée en paramètre)
 * et on calcule la largeur du SVG en multipliant la largeur du parent par le coefficient passé en paramètre.
 * Les ratioi sont calculés en fonction de ces deux largeurs pour la hauteur et les positions des divLatex.
 * @param parent container contenant la question CAN et des figures SVG éventuelles
 * @param coef coefficient de réduction par rapport à la larguer du parent (sert dans le calcul de la largeur)
 */
export const setSizeWithinSvgContainer = (parent: HTMLDivElement) => {
  if (parent.classList.contains('hidden')) {
    // si la question est cachée, on ne fait rien
    return
  }

  if (parent.firstElementChild === null) {
    return
  }

  const originalClientWidth = parent.clientWidth
  const originalClientHeight = parent.clientHeight

  let zoom = 3 // parseFloat(fontSize) / 16
  parent.style.fontSize = `${zoom}rem` // on remet zoom à 3... au départ

  const svgContainers = parent.getElementsByClassName('svgContainer')

  do {
    if (svgContainers.length > 0) {
      for (const svgContainer of svgContainers) {
        svgContainer.classList.add('flex')
        svgContainer.classList.add('justify-center')
        updateFigures(svgContainer, zoom)
      }
    }
    if (
      parent.firstElementChild.scrollHeight > originalClientHeight ||
      parent.firstElementChild.scrollWidth > originalClientWidth
    ) {
      zoom -= 0.2
      if (zoom >= 1) parent.style.fontSize = `${zoom}rem`
    }
  } while (
    zoom > 0.6 &&
    (parent.firstElementChild.scrollHeight > originalClientHeight ||
      parent.firstElementChild.scrollWidth > originalClientWidth)
  )
}
// Pour les schémas en boite

function resizeSchemaContainer(schemaContainer: HTMLElement, zoom: number) {
  const originalWidth =
    schemaContainer.dataset.originalWidth || schemaContainer.scrollWidth
  const originalHeight =
    schemaContainer.dataset.originalHeight || schemaContainer.scrollHeight

  // Store the original dimensions if not already stored
  if (!schemaContainer.dataset.originalWidth) {
    schemaContainer.dataset.originalWidth = originalWidth.toString()
  }
  if (!schemaContainer.dataset.originalHeight) {
    schemaContainer.dataset.originalHeight = originalHeight.toString()
  }

  // Apply the zoom
  // schemaContainer.style.transform = `scale(${zoom})`
  // schemaContainer.style.transformOrigin = 'top left'

  schemaContainer.style.height = `${Math.round(parseFloat(String(originalHeight)) * zoom)}px`
  schemaContainer.style.width = `${Math.round(parseFloat(String(originalWidth)) * zoom)}px`
}

export const ZOOM_MIN = 0.2
// En dessous, la case d'un QCM devient un point illisible : on garde une taille cliquable
const QCM_INPUT_ZOOM_MIN = 0.7

/**
 * Redimensionne les cases à cocher et boutons radio des QCM selon le zoom,
 * sans les rendre plus petits qu'une taille lisible.
 */
export function resizeQcmInputs(inputs: HTMLElement[], zoom: number) {
  resizeTags(inputs, Math.max(zoom, QCM_INPUT_ZOOM_MIN))
}

export function resizeContent(container: HTMLElement | null, zoom: number) {
  if (!container) return
  // mathalea2d
  const svgContainers = container.getElementsByClassName('svgContainer') ?? []
  for (const svgContainer of svgContainers) {
    updateFigures(svgContainer, Math.max(zoom, ZOOM_MIN))
  }
  // Scratch
  const scratchDivs = container.getElementsByClassName('scratchblocks')
  for (const scratchDiv of scratchDivs) {
    const svgDivs = scratchDiv.getElementsByTagName('svg')
    resizeTags([...svgDivs], Math.max(zoom, ZOOM_MIN))
  }
  // Checkboxes des QCM
  const checkboxes = container.querySelectorAll('input[type="checkbox"]')
  for (const checkbox of checkboxes) {
    if (checkbox instanceof HTMLInputElement) {
      resizeQcmInputs([checkbox], zoom)
    }
  }
  // Schémas en boite
  const schemaContainers =
    container.getElementsByClassName('SchemaContainer') ?? []
  for (const schemaContainer of schemaContainers) {
    resizeSchemaContainer(
      schemaContainer as HTMLElement,
      Math.max(zoom, ZOOM_MIN),
    )
  }
  // Images des exercices statiques (banques externes) : la largeur s'exprime
  // en pourcentage du conteneur, donc elle ne suit pas le `font-size`
  const images = container.getElementsByClassName('imageStatique')
  for (const image of images) {
    if (image instanceof HTMLImageElement) {
      image.style.width = `${Math.min(Math.max(zoom, ZOOM_MIN), 1) * 100}%`
    }
  }
  // Texte
  container.style.fontSize = `${Math.max(zoom, ZOOM_MIN)}rem`
}

export function updateFigures(svgContainer: Element, zoom: number) {
  const svgDivs = svgContainer.querySelectorAll<SVGSVGElement>('.mathalea2d')
  for (const svgDiv of svgDivs) {
    if (svgDiv instanceof SVGSVGElement) {
      const figure = svgDiv
      const width = figure.getAttribute('width')
      const height = figure.getAttribute('height')
      if (!figure.dataset.widthInitiale && width != null)
        figure.dataset.widthInitiale = width
      if (!figure.dataset.heightInitiale && height != null)
        figure.dataset.heightInitiale = height
      if (!figure.dataset.viewBoxInitiale) {
        const viewBox = figure.getAttribute('viewBox')
        if (viewBox != null) figure.dataset.viewBoxInitiale = viewBox
      }

      const initialWidth = Number(figure.dataset.widthInitiale)
      const initialHeight = Number(figure.dataset.heightInitiale)
      const initialViewBox = figure.dataset.viewBoxInitiale ?? null
      const newHeight = (initialHeight * zoom).toString()
      const newWidth = (initialWidth * zoom).toString()
      if (newHeight !== height) {
        figure.setAttribute('height', newHeight)
      }
      if (newWidth !== width) {
        figure.setAttribute('width', newWidth)
      }
      if (initialViewBox !== null) {
        figure.setAttribute('viewBox', initialViewBox)
      }
      if (
        svgContainer instanceof HTMLElement &&
        svgContainer.style.width !== `${newWidth}px`
      ) {
        svgContainer.style.width = `${newWidth}px`
      }
      if (
        svgContainer instanceof HTMLElement &&
        svgContainer.style.height !== `${newHeight}px`
      ) {
        svgContainer.style.height = `${newHeight}px`
      }

      // accorder la position des éléments dans la figure SVG
      const eltsInVariationTables =
        svgContainer.getElementsByClassName('divLatex') ?? []
      for (const elt of eltsInVariationTables) {
        const e = elt as HTMLDivElement
        if (!e.dataset.top) e.dataset.top = e.style.top.replace('px', '')
        if (!e.dataset.left) e.dataset.left = e.style.left.replace('px', '')
        const initialTop = Number(e.dataset.top)
        const initialLeft = Number(e.dataset.left)
        e.style.setProperty('top', (initialTop * zoom).toString() + 'px')
        e.style.setProperty('left', (initialLeft * zoom).toString() + 'px')
      }
    }
  }
}

/**
 * Change la taille de tous les divs passés en paramètres.
 *
 * On teste l'existence des attributs directs `width` et`height`.
 *
 * - S'ils existent, on sauvegarde leurs valeurs initiales dans le data-set (si besoin)
 *  et on applique le facteur d'échelle
 * - S'ils n'existent pas, on travaillent avec le style directement
 * (`width` et `height` peuvent avoir des unités différentes).
 * @param {HTMLOrSVGElement[]} tags Liste des divs à inspecter et changer
 * @param {number} factor facteur d'agrandissement par rapport à la taille initiale
 */
export const resizeTags = (
  tags: HTMLElement[] | SVGElement[],
  factor: number = 1,
) => {
  let widthUnit, heightUnit: string
  for (const tag of tags) {
    const widthAttributeExists: boolean = tag.hasAttribute('width')
    const heightAttributeExists: boolean = tag.hasAttribute('height')
    if (tag.hasAttribute('data-width') === false) {
      let originalWidth: string | null
      if (widthAttributeExists) {
        originalWidth = tag.getAttribute('width')
      } else {
        const width = tag.style.width
        const units = width.match(/\D/g) ?? []
        widthUnit = units.join('')
        originalWidth = String(
          parseFloat(tag.style.width.replace(widthUnit, '')),
        )
      }
      tag.dataset.width = originalWidth ?? '50'
    }
    if (
      !widthAttributeExists &&
      tag.hasAttribute('data-width-unit') === false
    ) {
      tag.dataset.widthUnit = widthUnit
    }
    if (tag.hasAttribute('data-height') === false) {
      let originalHeight: string | null
      if (heightAttributeExists) {
        originalHeight = tag.getAttribute('height')
        heightUnit = 'px'
      } else {
        const height = tag.style.height
        const units = height.match(/\D/g) ?? []
        heightUnit = units.join('')
        originalHeight = String(
          parseFloat(tag.style.height.replace(heightUnit, '')),
        )
      }
      tag.dataset.height = originalHeight ?? '30'
    } else {
      heightUnit = 'px'
    }

    if (
      !heightAttributeExists &&
      tag.hasAttribute('data-height-unit') === false
    ) {
      tag.dataset.heightUnit = heightUnit
    }
    const w = Number(tag.getAttribute('data-width')) * factor
    const h = Number(tag.getAttribute('data-height')) * factor
    if (widthAttributeExists && heightAttributeExists) {
      tag.setAttribute('width', String(w))
      tag.setAttribute('height', String(h))
    } else {
      tag.setAttribute(
        'style',
        'width:' +
          String(w) +
          tag.dataset.widthUnit +
          '; height:' +
          String(h) +
          tag.dataset.heightUnit +
          ';',
      )
    }
  }
}

export const updateIframeSize = (
  container: HTMLDivElement,
  iframe: HTMLIFrameElement,
) => {
  if (container.offsetWidth !== 0) {
    iframe.setAttribute('width', '100%')
    iframe.setAttribute('height', iframe.offsetWidth * 0.75 + '')
  }
}
