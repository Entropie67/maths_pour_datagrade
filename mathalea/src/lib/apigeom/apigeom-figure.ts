import Figure from 'apigeom'
import type BaseFigure from 'apigeom/src/Figure'
import { addTextElementsToSvg } from 'apigeom/src/lib/addTextElementsToSvg'
import { get } from 'svelte/store'
import { canOptions } from '../../../src/lib/stores/canStore'
import { globalOptions } from '../../../src/lib/stores/globalOptions'
import { context } from '../../../src/modules/context'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from '../customElements/MathaleaCustomElement'
import { setupFractionFigureIfNeeded } from './setupFractionFigure'
import { enableFigureUiRecovery } from './recoverFigureUi'

export type ApigeomVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

export type ApigeomVerificationCallback = (
  exercice: IExercice,
  questionIndex: number,
  element: ApigeomFigureElement,
) => string | string[] | ApigeomVerificationResult

type ApigeomVerificationEntry = {
  callback: ApigeomVerificationCallback
  pointsMax: number
}

export class ApigeomFigureElement extends MathaleaCustomElement {
  static readonly elementTag = 'apigeom-figure'
  static autoIndex = 0
  private static readonly verificationCallbacks = new Map<
    string,
    ApigeomVerificationEntry
  >()

  static get observedAttributes() {
    return [
      'figure-json',
      'numero-exercice',
      'auto-index',
      'index',
      'x-min',
      'y-min',
      'width',
      'height',
      'animation',
      'default-action',
      'interactive',
      'has-feedback',
      'id-addendum',
      'verify-callback-name',
      'legacy-mount',
    ]
  }

  private figure?: Figure
  private destroyed = false
  private oldZoom = 1
  private idApigeom!: string

  private resolveIndex(): string {
    const attr = this.hasAttribute('auto-index')
    if (attr) {
      return 'A' + ApigeomFigureElement.autoIndex++
    }
    return ''
  }

  /* ==============================
     Lifecycle
  ============================== */

  connectedCallback() {
    this.hydrateCommonAttributes()
    if (!context.isHtml) return
    // `figureApigeom()` conserve l'instance Figure de l'exercice et fournit
    // déjà son montage différé. Dans ce mode, l'élément ne sert que de wrapper
    // MathALÉA pour router la vérification vers correctionInteractive().
    if (this.hasAttribute('legacy-mount')) return
    this.render()
    this.createFigure()
    this.bindEvents()
  }

  disconnectedCallback() {
    this.destroy()
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    // if (!this.isConnected) return
    // console.log(`Attribute ${name} changed from ${oldValue} to ${newValue}`)
  }

  /* ==============================
     Rendering
     ============================== */

  render(): void {
    const index = Number(this.getAttribute('index') ?? 0)
    const numeroExercice = Number(this.getAttribute('numero-exercice') ?? 0)
    const hasFeedback = this.hasAttribute('has-feedback')
    const autoIndex = this.resolveIndex()

    this.idApigeom = `apigeomEx${numeroExercice}F${index}${this.getAttribute('id-addendum') ?? ''}${autoIndex}`

    this.figure = new Figure({
      xMin: Number(this.getAttribute('x-min') ?? 0),
      yMin: Number(this.getAttribute('y-min') ?? 0),
      width: Number(this.getAttribute('width') ?? 400),
      height: Number(this.getAttribute('height') ?? 400),
    })

    const script = this.querySelector('script[type="application/json"]')
    if (!script) return

    const jsonText = script.textContent?.trim()
    if (!jsonText) return
    this.figure.loadJson(JSON.parse(jsonText))

    setupFractionFigureIfNeeded(this.figure)

    this.innerHTML = `
      <script type="application/json">${jsonText}</script>
      <div class="m-6 leading-none" id="${this.idApigeom}"></div>
      ${
        hasFeedback && !autoIndex
          ? `
        <span id="resultatCheckEx${numeroExercice}Q${index}"></span>
        <div class="ml-2 py-2 text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest"
             id="feedbackEx${numeroExercice}Q${index}"></div>`
          : ''
      }
    `
  }

  /* ==============================
     Figure creation
     ============================== */

  private createFigure() {
    if (this.figure === undefined) return

    const interactive = this.hasAttribute('interactive')
    this.figure.isDynamic = interactive
    this.figure.divButtons.style.display = interactive ? 'grid' : 'none'

    const container = this.querySelector(`#${this.idApigeom}`) as HTMLDivElement
    if (!container) return

    this.figure.setContainer(container)
    enableFigureUiRecovery(this.figure)

    const defaultAction = this.getAttribute('default-action')
    if (defaultAction) {
      this.figure.buttons.get(defaultAction)?.click()
    }

    this.applyZoom()
  }

  /* ==============================
     Events
     ============================== */

  private onReload = (event: Event) => {
    if (!this.figure?.options) return
    const json = (event as CustomEvent).detail
    this.figure.loadJson(JSON.parse(json))

    if (get(canOptions).isChoosen && get(canOptions).state === 'solutions') {
      this.figure.divButtons.style.display = 'none'
      this.figure.divUserMessage.style.display = 'none'
    }
  }

  private onReloadBound = this.onReload.bind(this)

  private onZoom = (event: Event) => {
    if (!this.figure?.options) return
    const detail = (event as CustomEvent).detail
    const targetContainer = detail.container
    if (
      targetContainer instanceof HTMLElement &&
      !targetContainer.contains(this)
    ) {
      return
    }
    const zoom = Number(detail.zoom)
    if (zoom !== this.oldZoom) {
      this.oldZoom = zoom
      this.figure.zoom(zoom, {
        changeHeight: true,
        changeWidth: true,
        changeLeft: false,
        changeBottom: false,
      })
    }
  }

  private onZoomBound = this.onZoom.bind(this)

  private applyZoom() {
    const zoom = Number(get(globalOptions).z)
    if (zoom !== this.oldZoom && this.figure) {
      this.oldZoom = zoom
      this.figure.zoom(zoom, {
        changeHeight: true,
        changeWidth: true,
        changeLeft: false,
        changeBottom: false,
      })
    }
  }

  private bindEvents() {
    document.addEventListener(this.idApigeom, this.onReloadBound)
    document.addEventListener('zoomChanged', this.onZoomBound)
  }

  /* ==============================
     Cleanup
     ============================== */

  private destroy() {
    if (this.destroyed) return
    this.destroyed = true

    document.removeEventListener(this.idApigeom, this.onReloadBound)
    document.removeEventListener('zoomChanged', this.onZoomBound)

    this.figure?.destroy?.()
    this.figure = undefined
  }

  static registerVerificationCallback(
    name: string,
    callback: ApigeomVerificationCallback,
    pointsMax = 1,
  ): void {
    this.verificationCallbacks.set(name, {
      callback,
      pointsMax: Number.isFinite(pointsMax) && pointsMax > 0 ? pointsMax : 1,
    })
  }

  static unregisterVerificationCallback(
    name: string,
    callback?: ApigeomVerificationCallback,
  ): void {
    if (
      callback != null &&
      this.verificationCallbacks.get(name)?.callback !== callback
    ) {
      return
    }
    this.verificationCallbacks.delete(name)
  }

  private static elementFor(
    exercice: IExercice,
    questionIndex: number,
  ): ApigeomFigureElement | null {
    return document.querySelector(
      `${this.elementTag}[numero-exercice="${exercice.numeroExercice ?? 0}"][index="${questionIndex}"]`,
    ) as ApigeomFigureElement | null
  }

  private static normalizeVerificationResult(
    result: string | string[] | ApigeomVerificationResult,
  ): ApigeomVerificationResult {
    if (typeof result === 'object' && !Array.isArray(result)) return result
    const results = Array.isArray(result) ? result : [result]
    const nbBonnesReponses = results.filter((value) => value === 'OK').length
    return {
      isOk: results.length > 0 && nbBonnesReponses === results.length,
      feedback: '',
      score: { nbBonnesReponses, nbReponses: results.length },
    }
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): ApigeomVerificationResult {
    const element = this.elementFor(exercice, questionIndex)
    const callbackName = element?.getAttribute('verify-callback-name')
    const entry =
      callbackName == null
        ? undefined
        : this.verificationCallbacks.get(callbackName)
    if (element == null || entry == null) {
      return {
        isOk: false,
        feedback: 'Vérificateur apiGeom introuvable.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    return this.normalizeVerificationResult(
      entry.callback(exercice, questionIndex, element),
    )
  }

  static pointsMaxQuestion(exercice: IExercice, questionIndex: number): number {
    const element = this.elementFor(exercice, questionIndex)
    const callbackName = element?.getAttribute('verify-callback-name')
    return callbackName == null
      ? 1
      : (this.verificationCallbacks.get(callbackName)?.pointsMax ?? 1)
  }
}

export default function handleApigeomFigureElement() {
  registerMathaleaCustomElement(ApigeomFigureElement)
}

registerMathaleaCustomElement(ApigeomFigureElement)

/**
 * Marge (px) ajoutée sur chaque bord du viewBox exporté : les labels sont
 * positionnés en `<div>` HTML, qui débordent librement du cadre géométrique
 * de la figure (ex. `labelDxInPixels` décalant un nom de point vers
 * l'extérieur du quadrillage). Le SVG, lui, rogne tout ce qui dépasse son
 * viewBox — sans cette marge, ces labels seraient coupés une fois intégrés
 * en `<text>`. Valeur heuristique (~2 lignes de texte), pas un calcul exact
 * de la boîte englobante réelle du texte (non mesurable sans le rendre).
 */
const TEXT_OVERFLOW_MARGIN_PX = 30

/**
 * Nettoyage minimal des macros LaTeX pouvant apparaître dans le texte des
 * labels apigeom (ex. `1~\text{u.l}`, `$\dfrac{3}{4}~\text{u.l}$`,
 * `-2{,}5` — apigeom `displayNumber` entoure la virgule décimale de `{,}`
 * pour l'espacement KaTeX ; `$\vec \jmath$` / `$\vec{u}$` — labels des
 * vecteurs de base du repère `repereOij` et des vecteurs nommés ; `$\mathcal
 * C_f$` — nom d'une courbe représentative, cf. TSA2-12/TCA1-23 ; `$\ell$` —
 * nom d'une limite ; `{\color{X}\boldsymbol{?}}` — labels mis en évidence
 * via `miseEnEvidence()`, ex. le « ? » d'un point à retrouver sur une droite
 * graduée) : `addTextElementsToSvg` (paquet apigeom) retire seulement les
 * `$` de bordure, il ne connaît pas KaTeX et poserait sinon le code LaTeX
 * brut tel quel comme texte SVG. Rendu approximatif (pas un vrai typeset,
 * donc pas de véritable police calligraphique pour `\mathcal`, ni de gras
 * pour `\boldsymbol`/`\textbf` — la couleur de `\color` est de toute façon
 * redondante avec celle déjà posée par l'option `color` du label), suffisant
 * pour les libellés courts utilisés ici (unités, fractions simples,
 * graduations décimales, vecteurs, noms de courbes, mise en évidence).
 */
function cleanLatexLabel(text: string): string {
  return (
    text
      .replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '$1/$2')
      .replace(/\\text\s*\{([^{}]*)\}/g, '$1')
      // i/j sans point de `\vec\imath` / `\vec\jmath`, réduits avant `\vec`
      .replace(/\\imath(?![a-zA-Z])/g, 'ı')
      .replace(/\\jmath(?![a-zA-Z])/g, 'ȷ')
      // flèche de vecteur : U+20D7 (combining right arrow above) accolé au
      // dernier caractère du contenu (`\vec{u}` → `u⃗`, `\overrightarrow{AB}`
      // → `AB⃗`, `\vec \jmath` → `ȷ⃗`)
      .replace(/\\(?:vec|overrightarrow)\s*\{([^{}]*)\}/g, '$1⃗')
      .replace(/\\(?:vec|overrightarrow)\s+([^\s{}\\])/g, '$1⃗')
      // \mathcal{C} / \mathcal C (nom de courbe, ex. $\mathcal C_f$) : pas de
      // police calligraphique disponible en texte SVG brut, la commande est
      // simplement retirée pour ne garder que la lettre
      .replace(/\\mathcal\s*\{([^{}]*)\}/g, '$1')
      .replace(/\\mathcal\s+([^\s{}\\])/g, '$1')
      // \boldsymbol{X} / \textbf{X} (mise en évidence, cf. miseEnEvidence()) :
      // exécuté après \frac et \text ci-dessus, qui ont déjà aplati les
      // accolades imbriquées que ce contenu pouvait porter
      .replace(/\\(?:boldsymbol|textbf)\s*\{([^{}]*)\}/g, '$1')
      // {\color{X}CONTENU} (couleur LaTeX déclarative, produite par
      // miseEnEvidence()) : le contenu est déjà sans accolades une fois
      // \boldsymbol dépouillé ci-dessus
      .replace(/\{\\color(?:\[HTML\])?\{[^{}]*\}([^{}]*)\}/g, '$1')
      // \ell (nom usuel d'une limite, ex. TSA2-12) : lettre calligraphique
      // dédiée en Unicode
      .replace(/\\ell\b/g, 'ℓ')
      .replace(/\{,\}/g, ',')
      .replace(/~/g, ' ')
  )
}

/**
 * SVG autonome d'une figure apigeom déjà construite (`figure.create(...)`),
 * texte compris (labels de points, etc.) : contrairement à `getStaticHtml()`,
 * qui pose ce texte dans des `<div>` positionnés en CSS à côté du `<svg>`
 * (correct à l'écran, mais invisible/détaché une fois converti en image pour
 * Typst — voir `svgToTypstImage`/`htmlToTypst` dans `latexToTypst.ts`), les
 * éléments de texte sont ici ajoutés en tant que vrais noeuds SVG `<text>`,
 * via `addTextElementsToSvg` (package apigeom).
 *
 * La classe `apigeom-svg` posée sur la racine permet à `latexToTypst.ts`
 * (`protectApigeomSvgContainers`) de repérer ce SVG et de l'insérer avec les
 * mêmes contrôles de zoom/alignement de la palette de mise en page qu'une
 * figure mathalea2d (`#mathalea-figure-block`), plutôt que le simple
 * `#mathalea-fit` appliqué aux SVG génériques.
 *
 * Limite connue : `addTextElementsToSvg` ne couvre que les éléments de type
 * `TextByPosition`/`TextByPoint`/`TextDynamicByPosition`/`TextDynamicByPoint`
 * (donc les labels de points, qui sont des `TextByPoint`). Les codages
 * textuels (`MarkBetweenPoints`, `MarkArc`), qui héritent pourtant de
 * `TextByPosition`, sont contournés en réécrivant temporairement leur `type`
 * avant l'appel (cf. `MARK_TYPES_WITH_TEXT_TYPE` ci-dessous) — le texte porté
 * par `MeasureSegment` n'est en revanche pas repris par cette fonction.
 */
export function apigeomFigureToSvg(figure: BaseFigure): string {
  // Assure que la figure est attachée à un conteneur et dimensionnée
  // (viewBox, width, height posés par adjustSize()) : nécessaire avant de
  // cloner figure.svg pour obtenir un SVG autonome valide.
  figure.getStaticHtml()
  const svg = figure.svg.cloneNode(true) as SVGElement
  svg.classList.add('apigeom-svg')
  const xMin = figure.xToSx(figure.xMin) - TEXT_OVERFLOW_MARGIN_PX
  const yMax = figure.yToSy(figure.yMax) - TEXT_OVERFLOW_MARGIN_PX
  const width = figure.width + TEXT_OVERFLOW_MARGIN_PX * 2
  const height = figure.height + TEXT_OVERFLOW_MARGIN_PX * 2
  svg.setAttribute('viewBox', `${xMin} ${yMax} ${width} ${height}`)
  svg.setAttribute('width', width.toString())
  svg.setAttribute('height', height.toString())

  // Ces marques héritent de TextByPosition mais réécrivent `type` dans leur
  // constructeur, ce qui les fait ignorer par addTextElementsToSvg (filtre
  // par égalité stricte de `type`). On bascule temporairement leur `type`
  // pour les lui faire reconnaître, plutôt que de dupliquer sa logique de
  // positionnement/anti-débordement.
  const marksWithHiddenType = [...figure.elements.values()].filter(
    (e) => e.type === 'MarkBetweenPoints' || e.type === 'MarkArc',
  )
  const originalTypes = marksWithHiddenType.map((mark) => mark.type)
  for (const mark of marksWithHiddenType) mark.type = 'TextByPosition'
  addTextElementsToSvg(svg, figure, { xMin, yMax, width, height })
  marksWithHiddenType.forEach((mark, i) => {
    mark.type = originalTypes[i]
  })

  for (const textNode of svg.querySelectorAll('text')) {
    textNode.textContent = cleanLatexLabel(textNode.textContent ?? '')
  }
  return svg.outerHTML
}

/**
 * HTML d'une figure apigeom déjà construite (`figure.create(...)`) : balise
 * interactive `<apigeom-figure>` pour l'affichage HTML, ou SVG autonome
 * (`apigeomFigureToSvg`) quand `context.isTypst` est actif.
 *
 * En Typst, le web component ne peut pas être « rejoué » par `htmlToTypst`
 * (JS exécuté après montage dans le DOM, cf. documentation/developpement/
 * auteurs-exercices/complements/variantes-exercices.md#branches-de-rendu).
 */
export function createApigeomFigureHtml(
  figure: BaseFigure,
  {
    numeroExercice,
    index = 0,
    indexQuestionHote = 0,
  }: {
    numeroExercice: number | undefined
    index?: number
    /** Décalage des questions quand l'exercice est réhébergé par un méta-exercice */
    indexQuestionHote?: number
  },
): string {
  if (context.isTypst) {
    return apigeomFigureToSvg(figure)
  }
  handleApigeomFigureElement()
  const indexQuestionAffichee = index + indexQuestionHote
  return `<apigeom-figure interactive default-action='FILL' x-min=${figure.xMin} y-min=${figure.yMin} width=${figure.width} height=${figure.height} numero-exercice=${numeroExercice ?? 0} index=${indexQuestionAffichee} auto-index><script type="application/json">${figure.json}</script></apigeom-figure>`
}
