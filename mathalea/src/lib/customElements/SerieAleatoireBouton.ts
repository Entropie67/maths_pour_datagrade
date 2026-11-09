import { orangeMathalea } from '../colors'
import {
  exercicesDeLaSelection,
  type ExerciceDuReferentiel,
  lienVersLaSerie,
  parseSelection,
  referentielDesExercices,
  tirageDeLaSerie,
} from '../serieAleatoire/selection'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * Le gros bouton orange de l'app « Série aléatoire ».
 *
 * C'est un custom element parce que le tirage doit avoir lieu **au clic**, et
 * non à la génération de l'énoncé : chaque clic doit ouvrir une autre série,
 * et deux élèves qui suivent le même lien partagé ne doivent pas recevoir les
 * mêmes exercices. Le lien est donc recalculé juste avant que le navigateur ne
 * suive l'ancre.
 *
 * @author Rémi Angot
 */
export type SerieAleatoireBoutonOptions = {
  id?: string
  /** La sélection telle qu'elle est mémorisée dans `sup`. */
  selection: string
  /** Nombre d'exercices tirés au sort. */
  nombre: number
  /** Série interactive ou non. */
  interactif: boolean
}

export class SerieAleatoireBoutonElement extends MathaleaCustomElement {
  static readonly elementTag = 'serie-aleatoire-bouton'

  private disponibles: ExerciceDuReferentiel[] = []

  static create({
    id,
    selection,
    nombre,
    interactif,
  }: SerieAleatoireBoutonOptions): string {
    return super.create({ id, selection, nombre, interactif })
  }

  connectedCallback() {
    this.classList.add('block', 'not-prose')
    this.disponibles = exercicesDeLaSelection(
      referentielDesExercices(),
      parseSelection(this.getAttribute('selection') ?? ''),
    )
    this.innerHTML = ''
    this.appendChild(
      this.disponibles.length === 0 ? this.invitation() : this.bouton(),
    )
  }

  private get nombre(): number {
    return Number(this.getAttribute('nombre') ?? 5)
  }

  private get interactif(): boolean {
    return this.getAttribute('interactif') === 'true'
  }

  /** Tant que rien n'est coché, il n'y a pas de série à proposer. */
  private invitation(): HTMLElement {
    const message = document.createElement('p')
    message.className = 'italic text-center my-8'
    message.innerText =
      'Aucun exercice sélectionné : choisissez un niveau, un thème ou des exercices.'
    return message
  }

  private bouton(): HTMLElement {
    const bloc = document.createElement('div')
    bloc.className = 'flex flex-col items-center my-8'

    const lien = document.createElement('a')
    lien.target = '_blank'
    lien.rel = 'noopener noreferrer'
    lien.className =
      'inline-block px-12 py-5 rounded-xl text-white text-2xl font-bold text-center no-underline shadow-md hover:shadow-lg'
    lien.style.backgroundColor = orangeMathalea
    lien.innerText = "C'est parti !"
    lien.href = this.nouveauLien()
    // Le navigateur lit `href` après les écouteurs de `click` : le tirage
    // affiché à l'ouverture n'est donc jamais celui qui part réellement, et
    // chaque clic ouvre une série différente dans un nouvel onglet.
    const rafraichit = () => {
      lien.href = this.nouveauLien()
    }
    lien.addEventListener('pointerdown', rafraichit)
    lien.addEventListener('click', rafraichit)
    bloc.appendChild(lien)

    const sousTitre = document.createElement('span')
    sousTitre.className =
      'mt-2 text-sm text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus'
    sousTitre.innerText = this.sousTitre()
    bloc.appendChild(sousTitre)
    return bloc
  }

  private nouveauLien(): string {
    return lienVersLaSerie(tirageDeLaSerie(this.disponibles, this.nombre), {
      interactif: this.interactif,
    })
  }

  private sousTitre(): string {
    const taille = Math.min(this.nombre, this.disponibles.length)
    const pluriel = taille > 1 ? 's' : ''
    const parmi = `parmi les ${this.disponibles.length} de la sélection`
    return `${taille} exercice${pluriel} tiré${pluriel} au sort ${parmi} à chaque clic · série ${this.interactif ? 'interactive' : 'non interactive'}`
  }
}

registerMathaleaCustomElement(SerieAleatoireBoutonElement)

/** Helper d'injection depuis l'exercice. */
export function ajouteBoutonSerieAleatoire(
  options: SerieAleatoireBoutonOptions,
): string {
  return SerieAleatoireBoutonElement.create(options)
}
