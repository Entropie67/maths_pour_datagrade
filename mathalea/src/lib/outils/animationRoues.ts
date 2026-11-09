import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { fixeBordures } from '../2d/fixeBordures'
import { RoueDentee, rouesDentees } from '../2d/rouesDentees'
import { DomReadyActionElement } from '../customElements/DomReadyAction'

const ACTION = 'roues-dentees:animation'
const PARAMETRES_FIGURE = { pixelsParCm: 20, scale: 0.75 }
const CLASSES_BOUTON = [
  'my-5 ml-6 mr-10 px-6 py-2.5 rounded shadow-md',
  'bg-coopmaths text-white text-xs font-medium uppercase leading-tight',
  'transition duration-150 ease-in-out',
  'hover:scale-110 hover:bg-coopmaths-dark hover:shadow-lg',
  'focus:outline-none focus:ring-0',
].join(' ')

/** Les trains de trois roues sont resserrés pour tenir dans la largeur de la page. */
function moduleDe(dents: number[]) {
  return dents.length > 2 ? 0.3 : 0.4
}

function svgDe(roues: RoueDentee[]) {
  return mathalea2d({ ...fixeBordures(roues), ...PARAMETRES_FIGURE }, roues)
}

/**
 * Figure immobile.
 * @param dents nombres de dents réellement dessinés, de gauche à droite
 */
export function figureImmobile(dents: number[]) {
  return svgDe(rouesDentees({ module: moduleDe(dents) }, ...dents))
}

/**
 * Durée d'un tour de la première roue : le cycle complet dure environ vingt secondes,
 * mais la roue la plus rapide ne fait jamais plus d'un tour par seconde.
 */
function dureeTourPremiereRoue(dents: number[], tours: number[]) {
  const plusPetite = Math.min(...dents)
  return Math.round(Math.max(20 / tours[0], dents[0] / plusPetite) * 10) / 10
}

/**
 * Figure animée pour la correction, avec un bouton qui lance l'animation.
 * Les marqueurs de couleur permettent de voir quand deux roues voisines retrouvent leur position initiale.
 * Renvoie une chaîne vide hors du HTML interactif (LaTeX, Typst…).
 * @param dents nombres de dents, de gauche à droite
 * @param tours nombre de tours de chaque roue pendant un cycle complet
 * @param idUnique identifiant unique de la figure dans la page
 * @param unSeulCycle arrête l'animation quand la première roue a effectué ses tours
 */
export function figureAnimee(
  dents: number[],
  tours: number[],
  idUnique: string,
  unSeulCycle: boolean,
) {
  if (!context.isHtml || context.isTypst) return ''
  const dureeTourBase = dureeTourPremiereRoue(dents, tours)
  const roues = rouesDentees(
    {
      dureeTourBase,
      module: moduleDe(dents),
      marqueurs: true,
    },
    ...dents,
  )
  registreLecteur()
  return (
    `<div id="figure-${idUnique}">${svgDe(roues)}</div>` +
    `<button id="bouton-${idUnique}" class="${CLASSES_BOUTON}">Lancer l'animation</button>` +
    DomReadyActionElement.create({
      action: ACTION,
      payload: { idUnique, unSeulCycle, cycle: tours[0] * dureeTourBase },
    })
  )
}

/**
 * Pilote l'animation SMIL d'une figure : démarre, arrête et met à jour les
 * compteurs de tours à partir de l'horloge de la page.
 */
class LecteurAnimation {
  private readonly animations: SVGAnimationElement[]
  private readonly compteurs: SVGTextElement[]
  private readonly periodes: number[]
  private image: number | null = null

  constructor(
    figure: HTMLElement,
    private readonly bouton: HTMLElement,
    private readonly unSeulCycle: boolean,
    /** durée en secondes pour que toutes les roues retrouvent leur position initiale */
    private readonly cycle: number,
  ) {
    this.animations = [
      ...figure.querySelectorAll<SVGAnimationElement>('[id^=animRoue]'),
    ]
    this.compteurs = [
      ...figure.querySelectorAll<SVGTextElement>('text.compteurDeTours'),
    ]
    this.periodes = this.animations.map((a) =>
      Number.parseFloat(a.getAttribute('dur') ?? '1'),
    )
    // Les roues commencent immobiles : l'animation ne démarre qu'au clic.
    this.arrete()
  }

  lance() {
    // `beginElement()` relance aussi une animation déjà en cours
    if (this.image !== null) cancelAnimationFrame(this.image)
    this.animations.forEach((a) => a.beginElement())
    const debut = performance.now()
    this.bouton.textContent = "Relancer l'animation"
    const suivre = () => {
      const ecoule = (performance.now() - debut) / 1000
      if (this.unSeulCycle && ecoule >= this.cycle) {
        this.compteurs.forEach((c, i) => {
          c.textContent = String(Math.round(this.cycle / this.periodes[i]))
        })
        this.animations.forEach((a) => a.endElement())
        this.image = null
        return
      }
      this.compteurs.forEach((c, i) => {
        c.textContent = String(Math.floor(ecoule / this.periodes[i]))
      })
      this.image = requestAnimationFrame(suivre)
    }
    suivre()
  }

  arrete() {
    if (this.image !== null) cancelAnimationFrame(this.image)
    this.image = null
    this.animations.forEach((a) => a.endElement())
    this.compteurs.forEach((c) => {
      c.textContent = '0'
    })
  }
}

type ChargeUtile = { idUnique: string; unSeulCycle: boolean; cycle: number }

function registreLecteur() {
  DomReadyActionElement.registerCallback<ChargeUtile>(
    ACTION,
    ({ payload: { idUnique, unSeulCycle, cycle } }) => {
      const figure = document.getElementById(`figure-${idUnique}`)
      const bouton = document.getElementById(`bouton-${idUnique}`)
      if (!figure || !bouton) return
      const lecteur = new LecteurAnimation(figure, bouton, unSeulCycle, cycle)
      const demarre = () => lecteur.lance()
      bouton.addEventListener('click', demarre)
      return () => {
        bouton.removeEventListener('click', demarre)
        lecteur.arrete()
      }
    },
  )
}
