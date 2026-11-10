import { updateFigures } from '../../../lib/components/sizeTools'
import { mathaleaRenderDiv } from '../../../lib/mathalea'

/**
 * Rend le HTML MathALÉA (KaTeX, figures SVG, scratch) dans le conteneur,
 * puis retire le `font-size` inline posé par `resizeContent`
 * (src/lib/components/sizeTools.ts) : ce style inline écraserait la
 * typographie fluide des classes `.quizz-text-*` (clamp en cqw).
 *
 * Le zoom des figures est orchestré au niveau de la phase par
 * {@link fitQuizzContent} (le conteneur `main` de la vue) — pas ici.
 */
export function quizzRenderDiv(div: HTMLElement | null): void {
  if (div == null) return
  mathaleaRenderDiv(div)
  div.style.fontSize = ''
}

/** Plancher du facteur de réduction : en dessous, on préfère le défilement. */
const FIT_MIN_SCALE = 0.55
/** Pas de descente du facteur de réduction entre deux mesures. */
const FIT_STEP = 0.05

/**
 * Ajuste le contenu d'une phase du quizz pour qu'il tienne dans la fenêtre,
 * sans défilement (philosophie « shrink-to-fit » de la vue CAN) :
 *
 * 1. les figures mathalea2d sont zoomées comme le texte de leur conteneur
 *    (via `updateFigures` : largeurs, hauteurs et divLatex — vectoriel
 *    grâce au viewBox) ; elles sont centrées par CSS
 *    (`.quizz-container .svgContainer`) ;
 * 2. si l'ensemble dépasse la hauteur de la fenêtre, texte (conteneurs
 *    `.quizz-text-*`) et figures sont réduits d'un MÊME facteur, appliqué
 *    puis MESURÉ en boucle (comme `setSizeWithinSvgContainer` de la CAN) :
 *    on descend par pas de {@link FIT_STEP} jusqu'à ce que le document
 *    tienne dans la fenêtre, avec plancher {@link FIT_MIN_SCALE} — les
 *    boutons de réponse ne passent plus sous la ligne de flottaison.
 *
 * Chaque passage repart de l'état fluide (les font-sizes inline posées au
 * passage précédent sont marquées puis retirées) et capture les tailles de
 * référence AVANT d'écrire quoi que ce soit : le calcul est déterministe
 * et idempotent. Un ResizeObserver sur `main` ré-applique l'ajustement à
 * chaque changement de contenu ou de taille (nouvelle question, rotation
 * d'écran, chargement des fontes KaTeX).
 *
 * Renvoie la fonction de nettoyage (déconnexion de l'observateur).
 */
export function fitQuizzContent(main: HTMLElement): () => void {
  const zoomOfContainer = (el: HTMLElement | null): number => {
    if (el == null) return 1
    const px = parseFloat(getComputedStyle(el).fontSize)
    return Number.isFinite(px) && px > 0 ? px / 16 : 1
  }

  const rescale = (): void => {
    // 1. État fluide de référence : on retire les font-sizes inline posées
    //    par un passage précédent (marquées dans dataset).
    const texts = [
      ...main.querySelectorAll<HTMLElement>('[class*="quizz-text-"]'),
    ]
    for (const el of texts) {
      if (el.dataset.quizzFitScale != null) {
        el.style.fontSize = ''
        delete el.dataset.quizzFitScale
      }
    }
    // 2. Capture des tailles de référence AVANT toute écriture : tailles de
    //    police fluides (texte) et zooms de référence des figures (relus
    //    tels quels ensuite — jamais depuis un état déjà réduit).
    const textRefs = texts.map((el) => ({
      el,
      fluidPx: parseFloat(getComputedStyle(el).fontSize),
    }))
    const figureRefs = [
      ...(main.getElementsByClassName(
        'svgContainer',
      ) as HTMLCollectionOf<HTMLElement>),
    ].map((container) => ({
      container,
      zoom: zoomOfContainer(
        container.closest('[class*="quizz-text-"]') as HTMLElement | null,
      ),
    }))

    const applyAll = (scale: number): void => {
      for (const { el, fluidPx } of textRefs) {
        if (scale >= 1) {
          el.style.fontSize = ''
          delete el.dataset.quizzFitScale
        } else if (Number.isFinite(fluidPx) && fluidPx > 0) {
          el.style.fontSize = `${(fluidPx * scale).toFixed(1)}px`
          el.dataset.quizzFitScale = '1'
        }
      }
      for (const { container, zoom } of figureRefs) {
        updateFigures(container, zoom * scale)
      }
    }

    // 3. Mesure puis descente par paliers jusqu'à tenir dans la fenêtre.
    //    Attention à mesurer main.scrollHeight (et non le document) :
    //    `main` est en min-h-screen — le document vaut toujours ≥ la
    //    fenêtre, même quand le contenu est petit, et la descente
    //    partirait systématiquement au plancher.
    let scale = 1
    applyAll(1)
    while (main.scrollHeight > window.innerHeight && scale > FIT_MIN_SCALE) {
      scale = Math.max(FIT_MIN_SCALE, scale - FIT_STEP)
      applyAll(scale)
    }
  }

  // Garde anti-boucle : les écritures de rescale sont des mutations livrées
  // au microtâche suivant — on les ignore, puis on ré-arme le déclencheur.
  let internal = false
  const trigger = (): void => {
    if (internal) return
    internal = true
    rescale()
    queueMicrotask(() => {
      internal = false
    })
  }

  // Le ResizeObserver couvre les changements de taille de la fenêtre ;
  // le MutationObserver les changements de contenu (nouvelle question,
  // rendu KaTeX) — le contenu naturel peut tenir sous la fenêtre sans
  // jamais redimensionner `main` (min-h-screen).
  const mutationObserver = new MutationObserver(trigger)
  mutationObserver.observe(main, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'width', 'height'],
  })
  const resizeObserver = new ResizeObserver(trigger)
  resizeObserver.observe(main)

  rescale()
  return () => {
    mutationObserver.disconnect()
    resizeObserver.disconnect()
  }
}
