import renderMathInElement from 'katex/contrib/auto-render'
import { context } from '../../modules/context'
import { orangeMathalea } from '../colors'
import { optionsKatex } from '../latex/Katex'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'
import { STYLE_SELECT } from './stylesFormulaires'

type Diviseur = number

export type CribleEratostheneOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  diviseur?: Diviseur
  max?: number
}

const MAX_PAR_DEFAUT = 100
const COULEURS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea']

function estDiviseur(value: number, max: number): value is Diviseur {
  return Number.isInteger(value) && value >= 2 && value < max
}

function normaliserMax(value: number | undefined): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 3
    ? value
    : MAX_PAR_DEFAUT
}

function couleurPourDiviseur(diviseur: Diviseur): string {
  return COULEURS[(diviseur - 2) % COULEURS.length]
}

function grilleLatex(max: number): string {
  const nombres = [
    '',
    ...Array.from({ length: max - 1 }, (_, index) => index + 2),
  ]
  const lignes = Array.from(
    { length: Math.ceil(nombres.length / 10) },
    (_, ligne) => nombres.slice(ligne * 10, ligne * 10 + 10).join(' & '),
  )
  return `\\begin{center}\n\\renewcommand{\\arraystretch}{1.35}\n\\begin{tabular}{|*{10}{c|}}\n\\hline\n${lignes.join(' \\\\\n\\hline\n')} \\\\\n\\hline\n\\end{tabular}\n\\end{center}`
}

function grilleTypst(max: number): string {
  const cases = [
    '[]',
    ...Array.from({ length: max - 1 }, (_, index) => `[${index + 2}]`),
  ]
  return `#table(columns: 10, inset: 6pt, stroke: 0.5pt, ${cases.join(', ')})`
}

/** Support visuel pour présenter le crible d'Ératosthène en classe. */
export class CribleEratostheneElement extends MathaleaCustomElement {
  static readonly elementTag = 'crible-eratosthene'

  private diviseur: Diviseur | null = null
  private cellules: HTMLButtonElement[] = []
  private selecteur: HTMLSelectElement | null = null
  private boutonRejouer: HTMLButtonElement | null = null
  private boutonAnnuler: HTMLButtonElement | null = null
  private nombresRestants: HTMLDivElement | null = null
  private temporisateur: number | null = null
  private numeroAnime = 0
  private animationEnCours: Diviseur | null = null
  private diviseursColories = new Map<Diviseur, Set<number>>()
  private max = MAX_PAR_DEFAUT

  static create(options: CribleEratostheneOptions = {}): string {
    const max = normaliserMax(options.max)
    if (context.isTypst)
      return `<mathalea-typst>${grilleTypst(max)}</mathalea-typst>`
    if (!context.isHtml) return grilleLatex(max)
    const diviseur = estDiviseur(Number(options.diviseur), max)
      ? (Number(options.diviseur) as Diviseur)
      : null
    return super.create({
      ...options,
      max,
      diviseur,
      id:
        options.id ??
        `${CribleEratostheneElement.elementTag}Ex${options.numeroExercice ?? 0}Q${options.questionIndex ?? 0}`,
    })
  }

  connectedCallback() {
    const diviseur = Number(this.getAttribute('diviseur'))
    this.max = normaliserMax(Number(this.getAttribute('max')))
    this.diviseur = estDiviseur(diviseur, this.max) ? diviseur : null
    this.construireInterface()
  }

  disconnectedCallback() {
    this.annulerAnimation()
  }

  render() {
    return ''
  }

  private construireInterface() {
    this.innerHTML = ''
    this.className = 'crible-eratosthene'
    const style = document.createElement('style')
    style.textContent = `
      .crible-eratosthene { display: block; max-width: 36rem; margin: 1rem auto; font-family: sans-serif; }
      .crible-eratosthene__commandes { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin-bottom: .8rem; }
      .crible-eratosthene__grille { display: grid; grid-template-columns: repeat(10, minmax(2rem, 1fr)); border-top: 1px solid #64748b; border-left: 1px solid #64748b; }
      .crible-eratosthene__case { aspect-ratio: 1; border: 0; border-right: 1px solid #64748b; border-bottom: 1px solid #64748b; background: white; color: #111827; font: inherit; cursor: default; transition: background-color .2s, color .2s; }
      .crible-eratosthene__case--coloree { color: #111827; font-weight: 700; }
      .crible-eratosthene__restants { margin-top: .8rem; }
      @media (max-width: 34rem) { .crible-eratosthene__case { font-size: .8rem; } }
    `
    this.appendChild(style)

    const commandes = document.createElement('div')
    commandes.className = 'crible-eratosthene__commandes'
    this.selecteur = document.createElement('select')
    this.selecteur.className = `${STYLE_SELECT} w-full md:w-auto focus:border-coopmaths-action-lightest dark:focus:border-coopmathsdark-action-lightest`
    this.selecteur.setAttribute('aria-label', 'Choisir la consigne')
    const choixInitial = document.createElement('option')
    choixInitial.value = ''
    choixInitial.textContent = 'Colorier les multiples de…'
    choixInitial.selected = this.diviseur === null
    this.selecteur.appendChild(choixInitial)
    Array.from({ length: this.max - 2 }, (_, index) => index + 2).forEach(
      (diviseur) => {
        const option = document.createElement('option')
        option.value = String(diviseur)
        option.textContent = `Colorier les multiples de ${diviseur} supérieurs à ${diviseur}`
        option.selected = diviseur === this.diviseur
        this.selecteur?.appendChild(option)
      },
    )
    this.selecteur.addEventListener('change', () => {
      const valeur = Number(this.selecteur?.value)
      if (estDiviseur(valeur, this.max)) this.lancerAnimation(valeur)
    })
    commandes.appendChild(this.selecteur)

    this.boutonRejouer = this.creerBouton('Rejouer', () =>
      this.diviseur === null
        ? undefined
        : this.lancerAnimation(this.diviseur, true),
    )
    this.boutonAnnuler = this.creerBouton('Annuler', () =>
      this.annulerAnimation(true),
    )
    const boutonReinitialiser = this.creerBouton('Tout réinitialiser', () =>
      this.reinitialiser(),
    )
    const classeBouton =
      'inline-flex items-center px-3 py-2 bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas font-medium text-sm rounded shadow-md hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest focus:bg-coopmaths-action-lightest dark:focus:bg-coopmathsdark-action-lightest focus:outline-none transition'
    this.boutonRejouer.className = classeBouton
    this.boutonAnnuler.className = classeBouton
    boutonReinitialiser.className = classeBouton
    this.afficherBoutons(false, false)
    commandes.append(
      this.boutonRejouer,
      this.boutonAnnuler,
      boutonReinitialiser,
    )
    this.appendChild(commandes)

    const grille = document.createElement('div')
    grille.className = 'crible-eratosthene__grille'
    this.cellules = Array.from({ length: this.max }, (_, index) => {
      const cellule = document.createElement('button')
      cellule.type = 'button'
      cellule.className = 'crible-eratosthene__case'
      if (index > 0) {
        cellule.textContent = String(index + 1)
        cellule.setAttribute('aria-label', String(index + 1))
      } else {
        cellule.setAttribute('aria-hidden', 'true')
      }
      grille.appendChild(cellule)
      return cellule
    })
    this.appendChild(grille)

    this.nombresRestants = document.createElement('div')
    this.nombresRestants.className = 'crible-eratosthene__restants'
    this.nombresRestants.setAttribute('aria-live', 'polite')
    this.nombresRestants.hidden = true
    this.appendChild(this.nombresRestants)
  }

  private creerBouton(label: string, action: () => void) {
    const bouton = document.createElement('button')
    bouton.type = 'button'
    bouton.textContent = label
    bouton.addEventListener('click', action)
    return bouton
  }

  private lancerAnimation(diviseur: Diviseur, rejouer = false) {
    this.annulerAnimation()
    this.diviseur = diviseur
    if (!rejouer && this.diviseursColories.has(diviseur)) {
      this.animationEnCours = diviseur
      this.afficherBoutons(true, true)
      return
    }
    this.animationEnCours = diviseur
    this.numeroAnime = 0
    if (!this.diviseursColories.has(diviseur)) {
      this.diviseursColories.set(diviseur, new Set())
    }
    if (rejouer) {
      const nombresColories = this.diviseursColories.get(diviseur) ?? new Set()
      this.diviseursColories.delete(diviseur)
      this.diviseursColories.set(diviseur, nombresColories)
      for (let nombre = diviseur; nombre <= this.max; nombre += diviseur) {
        this.diviseursColories.get(diviseur)?.delete(nombre)
        this.actualiserCellule(nombre)
      }
    }
    this.afficherBoutons(false, true)
    this.animerProchainMultiple(diviseur)
  }

  private animerProchainMultiple(diviseur: Diviseur) {
    const multiples = Array.from(
      { length: Math.floor(this.max / diviseur) - 1 },
      (_, index) => (index + 2) * diviseur,
    )
    if (this.numeroAnime >= multiples.length) {
      this.afficherBoutons(true, true)
      return
    }
    const nombre = multiples[this.numeroAnime++]
    this.diviseursColories.get(diviseur)?.add(nombre)
    this.actualiserCellule(nombre)
    this.actualiserNombresRestants()
    this.temporisateur = window.setTimeout(
      () => this.animerProchainMultiple(diviseur),
      110,
    )
  }

  private actualiserCellule(nombre: number) {
    const cellule = this.cellules[nombre - 1]
    if (!cellule) return
    const couleurs = [...this.diviseursColories.entries()]
      .filter(([, nombres]) => nombres.has(nombre))
      .map(([diviseur]) => `${couleurPourDiviseur(diviseur)}55`)
      .reverse()
    cellule.style.background =
      couleurs.length === 0
        ? 'white'
        : couleurs
            .map((couleur) => `linear-gradient(${couleur}, ${couleur})`)
            .join(', ')
    cellule.classList.toggle(
      'crible-eratosthene__case--coloree',
      couleurs.length > 0,
    )
  }

  private actualiserNombresRestants() {
    if (!this.nombresRestants) return
    const nombresColories = new Set(
      [...this.diviseursColories.values()].flatMap((nombres) => [...nombres]),
    )
    const nombresRestants = Array.from(
      { length: this.max - 1 },
      (_, index) => index + 2,
    ).filter((nombre) => !nombresColories.has(nombre))
    const coloriageEffectue = nombresColories.size > 0
    this.nombresRestants.hidden = !coloriageEffectue
    this.nombresRestants.innerHTML = coloriageEffectue
      ? `<span style="color: ${orangeMathalea}; font-weight: bold;">Nombres restants</span> : ${nombresRestants.map((nombre) => `$${nombre}$`).join('\u00a0; ')}.`
      : ''
    if (coloriageEffectue) {
      try {
        renderMathInElement(this.nombresRestants, optionsKatex as never)
      } catch (error) {
        window.notify(
          'Erreur lors du rendu KaTeX des nombres restants du crible.',
          { error },
        )
      }
    }
  }

  private annulerAnimation(effacer = false) {
    if (this.temporisateur !== null) {
      window.clearTimeout(this.temporisateur)
      this.temporisateur = null
    }
    if (effacer && this.animationEnCours !== null) {
      const diviseur = this.animationEnCours
      for (let nombre = diviseur; nombre <= this.max; nombre += diviseur) {
        this.diviseursColories.get(diviseur)?.delete(nombre)
        this.actualiserCellule(nombre)
      }
      this.diviseursColories.delete(diviseur)
      this.animationEnCours = null
      this.numeroAnime = 0
      this.actualiserNombresRestants()
      if (this.selecteur) this.selecteur.value = ''
      this.afficherBoutons(false, false)
    }
  }

  private afficherBoutons(rejouer: boolean, annuler: boolean) {
    if (this.boutonRejouer)
      this.boutonRejouer.style.visibility = rejouer ? 'visible' : 'hidden'
    if (this.boutonAnnuler)
      this.boutonAnnuler.style.visibility = annuler ? 'visible' : 'hidden'
  }

  private reinitialiser() {
    this.annulerAnimation()
    this.diviseursColories.clear()
    for (let nombre = 1; nombre <= this.max; nombre++) {
      this.actualiserCellule(nombre)
    }
    this.diviseur = null
    this.animationEnCours = null
    this.numeroAnime = 0
    if (this.selecteur) this.selecteur.value = ''
    this.afficherBoutons(false, false)
    this.actualiserNombresRestants()
  }
}

export function addCribleEratosthene(
  exercice: IExercice,
  questionIndex: number,
  options: Omit<
    CribleEratostheneOptions,
    'numeroExercice' | 'questionIndex'
  > = {},
): string {
  return CribleEratostheneElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice,
    questionIndex,
  })
}

registerMathaleaCustomElement(CribleEratostheneElement)
