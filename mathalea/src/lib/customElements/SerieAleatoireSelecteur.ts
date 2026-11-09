import { context } from '../../modules/context'
import {
  type CibleDeSelection,
  type EnfantDeNoeud,
  enfantsVisibles,
  type ExerciceDuReferentiel,
  exercicesDeLaSelection,
  exercicesDuNoeud,
  formatSelection,
  ajouteALaSelection,
  etatDeLaCible,
  libelleDeLExercice,
  libelleDuNoeud,
  parseSelection,
  referentielDesExercices,
  retireDeLaSelection,
  SEPARATEUR_CHEMIN,
} from '../serieAleatoire/selection'
import type { JSONReferentielObject } from '../types/referentiels'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'
import {
  STYLE_BOUTON_TEXTE,
  STYLE_CASE,
  STYLE_CHAMP,
} from './stylesFormulaires'

/**
 * Sélecteur d'exercices de l'app « Série aléatoire », affiché au-dessus du
 * bouton en vue enseignante uniquement.
 *
 * Comme `QuestionsDeCoursSelecteur`, c'est un custom element *technique* : il
 * ne porte aucune réponse d'élève et se contente de demander de nouveaux
 * réglages en émettant l'événement DOM `settings`, écouté par
 * `ExerciceMathaleaVueProf`. L'exercice est alors régénéré et le lien du bouton
 * est recalculé.
 *
 * @author Rémi Angot
 */

/** Nombre maximal d'exercices listés par une recherche. */
const MAX_RESULTATS_RECHERCHE = 200

/** Ce que l'enseignant a ouvert, cherché ou fait défiler. */
type EtatInterface = {
  recherche: string
  cheminsOuverts: Set<string>
  defilement: number
}

/**
 * L'élément est détruit puis recréé à chaque régénération de l'exercice :
 * son état d'affichage est conservé ici, par numéro d'exercice.
 */
const etatsParExercice = new Map<number, EtatInterface>()

export type SerieAleatoireSelecteurOptions = {
  id?: string
  numeroExercice: number
  /** La sélection telle qu'elle est mémorisée dans `sup`. */
  selection: string
  /** Nombre d'exercices tirés au sort (`sup2`). */
  nombre: number
  /** Série interactive ou non (`sup3`). */
  interactif: boolean
}

export class SerieAleatoireSelecteurElement extends MathaleaCustomElement {
  static readonly elementTag = 'serie-aleatoire-selecteur'

  private selection: string[] = []
  private referentiel: JSONReferentielObject = {}
  private conteneurListe: HTMLDivElement | null = null
  private compteur: HTMLSpanElement | null = null

  static create({
    id,
    numeroExercice,
    selection,
    nombre,
    interactif,
  }: SerieAleatoireSelecteurOptions): string {
    if (!context.isHtml) return ''
    return super.create({
      id:
        id ?? `${SerieAleatoireSelecteurElement.elementTag}Ex${numeroExercice}`,
      numeroExercice,
      selection,
      nombre,
      interactif,
    })
  }

  connectedCallback() {
    this.referentiel = referentielDesExercices()
    this.selection = parseSelection(this.getAttribute('selection') ?? '')
    this.classList.add('block', 'not-prose')
    this.construitInterface()
  }

  disconnectedCallback() {
    if (this.conteneurListe != null) {
      this.etat.defilement = this.conteneurListe.scrollTop
    }
  }

  private get numeroExercice(): number {
    return Number(this.getAttribute('numero-exercice') ?? 0)
  }

  private get nombre(): number {
    return Number(this.getAttribute('nombre') ?? 5)
  }

  private get interactif(): boolean {
    return this.getAttribute('interactif') === 'true'
  }

  private get etat(): EtatInterface {
    let etat = etatsParExercice.get(this.numeroExercice)
    if (etat === undefined) {
      etat = { recherche: '', cheminsOuverts: new Set(), defilement: 0 }
      etatsParExercice.set(this.numeroExercice, etat)
    }
    return etat
  }

  private construitInterface() {
    const etat = this.etat
    this.innerHTML = ''
    const cadre = document.createElement('div')
    cadre.className =
      'text-sm border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest rounded-md p-3 mb-4 print-hidden'
    this.appendChild(cadre)

    const entete = document.createElement('div')
    entete.className = 'flex flex-wrap items-center gap-x-4 gap-y-2'
    cadre.appendChild(entete)

    const titre = document.createElement('span')
    titre.className =
      'font-bold text-coopmaths-struct dark:text-coopmathsdark-struct'
    titre.innerText = 'Choisir les exercices'
    entete.appendChild(titre)

    this.compteur = document.createElement('span')
    this.compteur.className =
      'text-coopmaths-corpus dark:text-coopmathsdark-corpus'
    entete.appendChild(this.compteur)

    const boutonVider = document.createElement('button')
    boutonVider.type = 'button'
    boutonVider.className = STYLE_BOUTON_TEXTE
    boutonVider.innerText = 'Tout décocher'
    boutonVider.addEventListener('click', () => {
      if (this.selection.length === 0) return
      this.selection = []
      this.demandeMiseAJour()
    })
    entete.appendChild(boutonVider)

    const filtres = document.createElement('div')
    filtres.className = 'flex flex-wrap items-center gap-2 mt-2'
    cadre.appendChild(filtres)

    const recherche = document.createElement('input')
    recherche.type = 'search'
    recherche.value = etat.recherche
    recherche.placeholder = 'Rechercher un exercice'
    recherche.setAttribute('aria-label', 'Rechercher un exercice')
    recherche.className = STYLE_CHAMP
    recherche.addEventListener('input', () => {
      etat.recherche = recherche.value
      this.remplitListe()
    })
    filtres.appendChild(recherche)

    this.conteneurListe = document.createElement('div')
    this.conteneurListe.className = 'mt-3 max-h-80 overflow-y-auto pr-1'
    this.conteneurListe.addEventListener('scroll', () => {
      etat.defilement = this.conteneurListe?.scrollTop ?? 0
    })
    cadre.appendChild(this.conteneurListe)

    cadre.appendChild(this.piedDeCadre())

    this.remplitListe()
    this.conteneurListe.scrollTop = etat.defilement
  }

  /** Le nombre d'exercices tirés au sort et le choix du mode interactif. */
  private piedDeCadre(): HTMLElement {
    const pied = document.createElement('div')
    pied.className =
      'flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'

    const blocNombre = document.createElement('label')
    blocNombre.className = 'flex items-center gap-2'
    const libelleNombre = document.createElement('span')
    libelleNombre.className =
      'text-coopmaths-struct dark:text-coopmathsdark-struct'
    libelleNombre.innerText = "Nombre d'exercices tirés au sort"
    const champNombre = document.createElement('input')
    champNombre.type = 'number'
    champNombre.min = '1'
    champNombre.max = '30'
    champNombre.value = String(this.nombre)
    champNombre.className = `${STYLE_CHAMP} w-20`
    champNombre.addEventListener('change', () => {
      const valeur = Math.max(1, Math.min(30, Number(champNombre.value) || 1))
      champNombre.value = String(valeur)
      if (valeur === this.nombre) return
      this.demandeMiseAJour({ sup2: String(valeur) })
    })
    blocNombre.append(libelleNombre, champNombre)
    pied.appendChild(blocNombre)

    const blocMode = document.createElement('div')
    blocMode.className = 'flex flex-wrap items-center gap-x-4 gap-y-1'
    const libelleMode = document.createElement('span')
    libelleMode.className =
      'text-coopmaths-struct dark:text-coopmathsdark-struct'
    libelleMode.innerText = 'Série'
    blocMode.appendChild(libelleMode)
    const nomGroupe = `serie-aleatoire-mode-${this.numeroExercice}`
    for (const [valeur, libelle] of [
      ['1', 'interactive'],
      ['0', 'non interactive'],
    ] as const) {
      const choix = document.createElement('label')
      choix.className = 'flex items-center gap-1 cursor-pointer'
      const bouton = document.createElement('input')
      bouton.type = 'radio'
      bouton.name = nomGroupe
      bouton.value = valeur
      bouton.checked = this.interactif === (valeur === '1')
      // `rounded-full` : la case partagée est carrée, un bouton radio est rond.
      bouton.className = `${STYLE_CASE} rounded-full`
      bouton.addEventListener('change', () => {
        if (!bouton.checked) return
        this.demandeMiseAJour({ sup3: valeur === '1' ? 'true' : 'false' })
      })
      const texte = document.createElement('span')
      texte.className = 'text-coopmaths-corpus dark:text-coopmathsdark-corpus'
      texte.innerText = libelle
      choix.append(bouton, texte)
      blocMode.appendChild(choix)
    }
    pied.appendChild(blocMode)
    return pied
  }

  private remplitListe() {
    const conteneur = this.conteneurListe
    if (conteneur == null) return
    conteneur.innerHTML = ''
    const recherche = normalise(this.etat.recherche.trim())
    if (recherche === '') {
      for (const enfant of enfantsVisibles(this.referentiel)) {
        conteneur.appendChild(this.ligneEnfant([], enfant))
      }
    } else {
      this.remplitResultatsDeRecherche(conteneur, recherche)
    }
    this.majCompteur()
  }

  /**
   * La recherche court sur tout le référentiel : plutôt que de déplier
   * l'arborescence, elle affiche une liste à plat d'exercices, chacun précédé
   * du chemin qui y mène.
   */
  private remplitResultatsDeRecherche(
    conteneur: HTMLElement,
    recherche: string,
  ) {
    const trouves: { chemin: string[]; exercice: ExerciceDuReferentiel }[] = []
    let total = 0
    const parcours = (noeud: JSONReferentielObject, chemin: string[]) => {
      for (const enfant of enfantsVisibles(noeud)) {
        const cheminEnfant = [...chemin, enfant.cle]
        if (enfant.type === 'noeud') {
          parcours(enfant.noeud, cheminEnfant)
          continue
        }
        const exercice = enfant.exercice
        if (
          !normalise(exercice.titre).includes(recherche) &&
          !normalise(exercice.id).includes(recherche)
        ) {
          continue
        }
        total++
        if (trouves.length < MAX_RESULTATS_RECHERCHE) {
          trouves.push({ chemin: cheminEnfant, exercice })
        }
      }
    }
    parcours(this.referentiel, [])

    if (trouves.length === 0) {
      const vide = document.createElement('p')
      vide.className = 'italic'
      vide.innerText = 'Aucun exercice ne correspond à cette recherche.'
      conteneur.appendChild(vide)
      return
    }
    if (total > trouves.length) {
      const avertissement = document.createElement('p')
      avertissement.className = 'italic mb-1'
      avertissement.innerText = `${total} exercices trouvés, seuls les ${trouves.length} premiers sont affichés.`
      conteneur.appendChild(avertissement)
    }
    for (const { chemin, exercice } of trouves) {
      const ligne = this.ligneExercice(chemin, exercice)
      const filAriane = document.createElement('span')
      filAriane.className =
        'text-xs text-coopmaths-corpus dark:text-coopmathsdark-corpus opacity-70'
      filAriane.innerHTML = ` — ${chemin
        .slice(0, -1)
        .map((cle) => libelleDuNoeud(cle))
        .join(' › ')}`
      ligne.appendChild(filAriane)
      conteneur.appendChild(ligne)
    }
  }

  private ligneEnfant(chemin: string[], enfant: EnfantDeNoeud): HTMLElement {
    const cheminEnfant = [...chemin, enfant.cle]
    return enfant.type === 'noeud'
      ? this.ligneNoeud(cheminEnfant, enfant.noeud)
      : this.ligneExercice(cheminEnfant, enfant.exercice)
  }

  /**
   * Un nœud (niveau, thème ou sous-thème) : une case à cocher qui vaut pour
   * tout son contenu, et un bloc repliable. Les enfants ne sont construits
   * qu'à la première ouverture : le référentiel compte près de 4 000 exercices.
   */
  private ligneNoeud(
    chemin: string[],
    noeud: JSONReferentielObject,
  ): HTMLElement {
    const cle = chemin.join(SEPARATEUR_CHEMIN)
    const bloc = document.createElement('details')
    bloc.className = 'mb-0.5'
    const titre = document.createElement('summary')
    titre.className = 'cursor-pointer flex items-center gap-2 py-0.5'
    titre.appendChild(this.caseACocher({ chemin }))
    const libelle = document.createElement('span')
    libelle.className =
      'font-medium text-coopmaths-struct dark:text-coopmathsdark-struct'
    libelle.innerHTML = libelleDuNoeud(chemin[chemin.length - 1])
    titre.appendChild(libelle)
    const effectif = document.createElement('span')
    effectif.className =
      'text-xs text-coopmaths-corpus dark:text-coopmathsdark-corpus opacity-70'
    effectif.innerText = `(${exercicesDuNoeud(noeud).length})`
    titre.appendChild(effectif)
    bloc.appendChild(titre)

    const liste = document.createElement('div')
    liste.className = 'pl-6'
    bloc.appendChild(liste)
    const remplit = () => {
      if (liste.childElementCount > 0) return
      for (const enfant of enfantsVisibles(noeud)) {
        liste.appendChild(this.ligneEnfant(chemin, enfant))
      }
    }
    bloc.open = this.etat.cheminsOuverts.has(cle)
    if (bloc.open) remplit()
    bloc.addEventListener('toggle', () => {
      if (bloc.open) {
        this.etat.cheminsOuverts.add(cle)
        remplit()
      } else {
        this.etat.cheminsOuverts.delete(cle)
      }
    })
    return bloc
  }

  private ligneExercice(
    chemin: string[],
    exercice: ExerciceDuReferentiel,
  ): HTMLElement {
    const ligne = document.createElement('label')
    ligne.className = 'flex items-baseline gap-2 py-0.5 cursor-pointer'
    ligne.appendChild(this.caseACocher({ chemin, uuid: exercice.uuid }))
    const texte = document.createElement('span')
    texte.className = 'text-coopmaths-corpus dark:text-coopmathsdark-corpus'
    texte.innerHTML = `<span class="font-medium">${exercice.id}</span> ${libelleDeLExercice(exercice)}`
    ligne.appendChild(texte)
    return ligne
  }

  private caseACocher(cible: CibleDeSelection): HTMLInputElement {
    const etat = etatDeLaCible(this.referentiel, this.selection, cible)
    const case_ = document.createElement('input')
    case_.type = 'checkbox'
    case_.checked = etat === 'oui'
    case_.indeterminate = etat === 'partiel'
    case_.className = STYLE_CASE
    case_.setAttribute('aria-label', 'Ajouter à la sélection')
    // Sans ça, cocher la case d'un nœud replierait aussi son bloc.
    case_.addEventListener('click', (event) => event.stopPropagation())
    case_.addEventListener('change', () => {
      this.selection = case_.checked
        ? ajouteALaSelection(this.referentiel, this.selection, cible)
        : retireDeLaSelection(this.referentiel, this.selection, cible)
      this.demandeMiseAJour()
    })
    return case_
  }

  private majCompteur() {
    if (this.compteur == null) return
    const nb = exercicesDeLaSelection(this.referentiel, this.selection).length
    this.compteur.innerText =
      nb === 0
        ? 'aucun exercice sélectionné'
        : `${nb} exercice${nb > 1 ? 's' : ''} sélectionné${nb > 1 ? 's' : ''}`
  }

  /**
   * Demande à la vue enseignante de régénérer l'exercice avec les nouveaux
   * réglages : la sélection dans `sup`, et le cas échéant le nombre
   * d'exercices (`sup2`) ou le mode interactif (`sup3`).
   */
  private demandeMiseAJour(reglages: { sup2?: string; sup3?: string } = {}) {
    this.dispatchEvent(
      new CustomEvent('settings', {
        detail: { sup: formatSelection(this.selection), ...reglages },
        bubbles: true,
        composed: true,
      }),
    )
  }
}

/** Comparaison insensible à la casse et aux accents. */
function normalise(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

registerMathaleaCustomElement(SerieAleatoireSelecteurElement)

/** Helper d'injection depuis l'exercice. */
export function ajouteSelecteurSerieAleatoire(
  options: SerieAleatoireSelecteurOptions,
): string {
  return SerieAleatoireSelecteurElement.create(options)
}
