import { context } from '../../modules/context'
import { renderKatex } from '../latex/renderKatex'
import {
  formatFiltreNiveauQuestionsDeCours,
  type ModeNiveauQuestionDeCours,
  type NiveauQuestionDeCours,
  NIVEAUX_QUESTIONS_DE_COURS,
  parseFiltreNiveauQuestionsDeCours,
  questionCorrespondAuNiveau,
  type QuestionDeCours,
  questionsDeCoursParTheme,
} from '../questionsDeCours/banque'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'
import {
  STYLE_BOUTON_TEXTE,
  STYLE_CASE,
  STYLE_CHAMP,
  STYLE_SELECT,
} from './stylesFormulaires'

/**
 * Sélecteur de questions de cours, affiché au-dessus de l'énoncé en vue
 * enseignante uniquement (l'exercice ne l'injecte pas ailleurs).
 *
 * C'est un custom element *technique* : il ne porte aucune réponse d'élève,
 * il n'est donc ni dans `InteractivityType` ni dans `listOfCustomElements`.
 * Il se contente de demander une nouvelle sélection en émettant l'événement
 * DOM `settings`, écouté par `ExerciceMathaleaVueProf`, exactement comme le
 * panneau de réglages. L'exercice est alors régénéré : l'énoncé affiché sous
 * le sélecteur sert d'aperçu.
 */

/** Ce que l'enseignant a ouvert, cherché ou fait défiler. */
type EtatInterface = {
  recherche: string
  niveau: NiveauQuestionDeCours
  mode: ModeNiveauQuestionDeCours
  themesOuverts: Set<string>
  defilement: number
  dernierIdCoche: string | null
}

/**
 * L'élément est détruit puis recréé à chaque régénération de l'exercice :
 * son état d'affichage est conservé ici, par numéro d'exercice.
 */
const etatsParExercice = new Map<number, EtatInterface>()

const LIBELLES_NIVEAUX: Record<NiveauQuestionDeCours, string> = {
  '6': '6e',
  '5': '5e',
  '4': '4e',
  '3': '3e',
  '2': '2de',
  '1': '1re',
  T: 'Terminale',
}

export type QuestionsDeCoursSelecteurOptions = {
  id?: string
  numeroExercice: number
  /** Les identifiants déjà choisis, dans l'ordre voulu par l'enseignant. */
  selection: string[]
  /** Nombre de questions tirées, pour rester synchronisé avec la sélection. */
  nbQuestions: number
  /**
   * Le filtre de niveau mémorisé dans `sup2` (ex : `avant:5`), pour
   * restaurer le sélecteur dans le même état après un partage d'URL. Vide
   * quand aucun filtre n'est actif.
   */
  filtreNiveau?: string
}
/**
 * @author Rémi Angot
 */
export class QuestionsDeCoursSelecteurElement extends MathaleaCustomElement {
  static readonly elementTag = 'questions-de-cours-selecteur'

  private selection: string[] = []
  private conteneurListe: HTMLDivElement | null = null
  private compteur: HTMLSpanElement | null = null

  static create({
    id,
    numeroExercice,
    selection,
    nbQuestions,
    filtreNiveau,
  }: QuestionsDeCoursSelecteurOptions): string {
    if (!context.isHtml) return ''
    return super.create({
      id:
        id ??
        `${QuestionsDeCoursSelecteurElement.elementTag}Ex${numeroExercice}`,
      numeroExercice,
      selection: selection.join(','),
      nbQuestions,
      filtreNiveau: filtreNiveau ?? '',
    })
  }

  connectedCallback() {
    this.selection = (this.getAttribute('selection') ?? '')
      .split(',')
      .filter((id) => id !== '')
    this.classList.add('block', 'not-prose')
    this.construitInterface()
  }

  disconnectedCallback() {
    const etat = this.etat
    if (this.conteneurListe != null) {
      etat.defilement = this.conteneurListe.scrollTop
    }
  }

  private get numeroExercice(): number {
    return Number(this.getAttribute('numero-exercice') ?? 0)
  }

  private get nbQuestions(): number {
    return Number(this.getAttribute('nb-questions') ?? 0)
  }

  private get etat(): EtatInterface {
    let etat = etatsParExercice.get(this.numeroExercice)
    if (etat === undefined) {
      // Au premier affichage de la session (ex : ouverture d'une URL
      // partagée), on restaure le filtre mémorisé dans `sup2` plutôt que de
      // repartir de « Terminale ».
      const filtre = parseFiltreNiveauQuestionsDeCours(
        this.getAttribute('filtre-niveau') ?? '',
      )
      etat = {
        recherche: '',
        niveau: filtre?.niveau ?? 'T',
        mode: filtre?.mode ?? 'avant',
        themesOuverts: new Set(),
        defilement: 0,
        dernierIdCoche: null,
      }
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
    titre.innerText = 'Choisir les questions'
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
      etat.dernierIdCoche = null
      this.demandeMiseAJour()
    })
    entete.appendChild(boutonVider)

    const filtres = document.createElement('div')
    filtres.className = 'flex flex-wrap items-center gap-2 mt-2'
    cadre.appendChild(filtres)

    const recherche = document.createElement('input')
    recherche.type = 'search'
    recherche.value = etat.recherche
    recherche.placeholder = 'Rechercher une question'
    recherche.setAttribute('aria-label', 'Rechercher une question')
    recherche.className = STYLE_CHAMP
    recherche.addEventListener('input', () => {
      etat.recherche = recherche.value
      this.remplitListe()
    })
    filtres.appendChild(recherche)

    const mode = document.createElement('select')
    mode.setAttribute('aria-label', 'Comparaison au niveau choisi')
    mode.className = STYLE_SELECT
    for (const [valeur, libelle] of [
      ['avant', "Jusqu'au niveau"],
      ['egal', 'Niveau'],
      ['apres', 'À partir du niveau'],
    ] as const) {
      const option = document.createElement('option')
      option.value = valeur
      option.innerText = libelle
      mode.appendChild(option)
    }
    mode.value = etat.mode
    mode.addEventListener('change', () => {
      etat.mode = mode.value as ModeNiveauQuestionDeCours
      this.remplitListe()
      // Sans sélection explicite, ce filtre pilote directement le tirage au
      // hasard (mémorisé dans `sup2`) : on régénère l'aperçu tout de suite.
      if (this.selection.length === 0) this.demandeMiseAJour()
    })
    filtres.appendChild(mode)

    const niveau = document.createElement('select')
    niveau.setAttribute('aria-label', 'Niveau')
    niveau.className = mode.className
    for (const valeur of NIVEAUX_QUESTIONS_DE_COURS) {
      const option = document.createElement('option')
      option.value = valeur
      option.innerText = LIBELLES_NIVEAUX[valeur]
      niveau.appendChild(option)
    }
    niveau.value = etat.niveau
    niveau.addEventListener('change', () => {
      etat.niveau = niveau.value as NiveauQuestionDeCours
      this.remplitListe()
      if (this.selection.length === 0) this.demandeMiseAJour()
    })
    filtres.appendChild(niveau)

    this.conteneurListe = document.createElement('div')
    this.conteneurListe.className = 'mt-3 max-h-80 overflow-y-auto pr-1'
    this.conteneurListe.addEventListener('scroll', () => {
      etat.defilement = this.conteneurListe?.scrollTop ?? 0
    })
    cadre.appendChild(this.conteneurListe)

    this.remplitListe()
    this.conteneurListe.scrollTop = etat.defilement
    if (etat.dernierIdCoche != null) {
      const case_ = this.querySelector<HTMLInputElement>(
        `input[type="checkbox"][value="${etat.dernierIdCoche}"]`,
      )
      case_?.focus()
    }
  }

  /** Les questions visibles, thème par thème, filtres appliqués. */
  private questionsVisibles(): Map<string, QuestionDeCours[]> {
    const etat = this.etat
    const correspondAuNiveau = (question: QuestionDeCours) =>
      questionCorrespondAuNiveau(question, etat.mode, etat.niveau)
    const recherche = normalise(etat.recherche.trim())
    const correspondALaRecherche = (question: QuestionDeCours) =>
      recherche === '' ||
      normalise(question.title).includes(recherche) ||
      normalise(question.question).includes(recherche)
    const visibles = new Map<string, QuestionDeCours[]>()
    for (const [theme, questions] of questionsDeCoursParTheme) {
      const retenues = questions.filter(
        (question) =>
          correspondAuNiveau(question) && correspondALaRecherche(question),
      )
      if (retenues.length > 0) visibles.set(theme, retenues)
    }
    return visibles
  }

  private remplitListe() {
    const conteneur = this.conteneurListe
    if (conteneur == null) return
    const etat = this.etat
    conteneur.innerHTML = ''
    const visibles = this.questionsVisibles()
    if (visibles.size === 0) {
      const vide = document.createElement('p')
      vide.className = 'italic'
      vide.innerText = 'Aucune question ne correspond à ces filtres.'
      conteneur.appendChild(vide)
    }
    // Une recherche en cours ouvre tous les thèmes : sinon ses résultats
    // resteraient cachés dans des blocs repliés.
    const rechercheEnCours = etat.recherche.trim() !== ''
    for (const [theme, questions] of visibles) {
      const bloc = document.createElement('details')
      bloc.className = 'mb-1'
      bloc.open = rechercheEnCours || etat.themesOuverts.has(theme)
      const titre = document.createElement('summary')
      titre.className =
        'cursor-pointer font-medium text-coopmaths-struct dark:text-coopmathsdark-struct'
      const nbChoisies = questions.filter((question) =>
        this.selection.includes(question.id),
      ).length
      const libelle = document.createElement('span')
      libelle.innerText = `${theme} (${nbChoisies}/${questions.length})`
      titre.appendChild(libelle)
      const bascule = this.basculeDuTheme(questions, nbChoisies)
      bascule.classList.toggle('hidden', !bloc.open)
      titre.appendChild(bascule)
      bloc.appendChild(titre)
      bloc.addEventListener('toggle', () => {
        if (bloc.open) etat.themesOuverts.add(theme)
        else etat.themesOuverts.delete(theme)
        // Le raccourci ne sert que sur le thème ouvert.
        bascule.classList.toggle('hidden', !bloc.open)
      })
      const liste = document.createElement('div')
      liste.className = 'pl-4 py-1'
      for (const question of questions) {
        liste.appendChild(this.ligneQuestion(question))
      }
      bloc.appendChild(liste)
      conteneur.appendChild(bloc)
      if (bloc.open) renderKatex(liste)
      else {
        // Le LaTeX des thèmes repliés n'est rendu qu'à leur ouverture :
        // la banque compte plusieurs centaines de questions.
        bloc.addEventListener('toggle', () => {
          if (bloc.open) renderKatex(liste)
        })
      }
    }
    this.majCompteur()
  }

  /**
   * Le raccourci « Tout cocher / Tout décocher » d'un thème. Il ne porte que
   * sur les questions visibles : avec une recherche ou un filtre de niveau en
   * cours, on ne coche pas des questions qui ne sont pas sous les yeux.
   */
  private basculeDuTheme(
    questions: QuestionDeCours[],
    nbChoisies: number,
  ): HTMLButtonElement {
    const toutEstChoisi = nbChoisies === questions.length
    const bascule = document.createElement('button')
    bascule.type = 'button'
    bascule.className = `${STYLE_BOUTON_TEXTE} ml-3 text-xs font-normal`
    bascule.innerText = toutEstChoisi ? 'Tout décocher' : 'Tout cocher'
    bascule.addEventListener('click', (event) => {
      // Sans ça, le clic dans le `summary` replierait le thème.
      event.preventDefault()
      event.stopPropagation()
      const ids = questions.map((question) => question.id)
      if (toutEstChoisi) {
        this.selection = this.selection.filter((id) => !ids.includes(id))
      } else {
        for (const id of ids) {
          if (!this.selection.includes(id)) this.selection.push(id)
        }
      }
      this.etat.dernierIdCoche = null
      this.demandeMiseAJour()
    })
    return bascule
  }

  private ligneQuestion(question: QuestionDeCours): HTMLElement {
    const ligne = document.createElement('label')
    ligne.className = 'flex items-start gap-2 py-0.5 cursor-pointer'
    const case_ = document.createElement('input')
    case_.type = 'checkbox'
    case_.value = question.id
    case_.checked = this.selection.includes(question.id)
    case_.className = `${STYLE_CASE} mt-1`
    case_.addEventListener('change', () => {
      if (case_.checked) {
        if (!this.selection.includes(question.id)) {
          this.selection.push(question.id)
        }
      } else {
        this.selection = this.selection.filter((id) => id !== question.id)
      }
      this.etat.dernierIdCoche = question.id
      this.demandeMiseAJour()
    })
    const texte = document.createElement('span')
    texte.className = 'text-coopmaths-corpus dark:text-coopmathsdark-corpus'
    const titre = document.createElement('span')
    titre.className = 'font-medium'
    titre.innerText = `${LIBELLES_NIVEAUX[question.level]} · ${question.title}`
    texte.appendChild(titre)
    const enonce = document.createElement('span')
    enonce.innerHTML = ` — ${question.question}`
    texte.appendChild(enonce)
    ligne.append(case_, texte)
    return ligne
  }

  private majCompteur() {
    if (this.compteur == null) return
    const nb = this.selection.length
    this.compteur.innerText =
      nb === 0
        ? 'aucune question choisie (toute la banque est tirée au hasard)'
        : `${nb} question${nb > 1 ? 's' : ''} choisie${nb > 1 ? 's' : ''}`
  }

  /**
   * Demande à la vue enseignante de régénérer l'exercice avec la nouvelle
   * sélection. Le nombre de questions suit la sélection tant que l'enseignant
   * ne l'a pas réglé lui-même à une autre valeur.
   *
   * Sans sélection, le filtre de niveau du sélecteur est mémorisé dans
   * `sup2` pour que le tirage au hasard s'y limite ; dès qu'une question est
   * choisie, `sup2` est effacé pour ne pas rester actif à tort.
   */
  private demandeMiseAJour() {
    const etat = this.etat
    const detail: { sup: string; sup2: string; nbQuestions?: number } = {
      sup: this.selection.join(','),
      sup2:
        this.selection.length === 0
          ? formatFiltreNiveauQuestionsDeCours(etat.mode, etat.niveau)
          : '',
    }
    const nbPrecedent = (this.getAttribute('selection') ?? '')
      .split(',')
      .filter((id) => id !== '').length
    // Le nombre de questions suit la sélection dans deux cas : au premier choix
    // (on quittait le tirage dans toute la banque) et tant qu'il lui est resté
    // égal. S'il en diffère, c'est un réglage voulu par l'enseignant (« 4
    // questions parmi les 10 choisies ») : on n'y touche pas.
    const suitLaSelection =
      nbPrecedent === 0 || this.nbQuestions === nbPrecedent
    if (suitLaSelection && this.selection.length > 0) {
      detail.nbQuestions = this.selection.length
    }
    this.dispatchEvent(
      new CustomEvent('settings', { detail, bubbles: true, composed: true }),
    )
  }
}

/** Comparaison insensible à la casse et aux accents, comme dans l'app. */
function normalise(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

registerMathaleaCustomElement(QuestionsDeCoursSelecteurElement)

/** Helper d'injection depuis l'exercice. */
export function ajouteSelecteurQuestionsDeCours(
  options: QuestionsDeCoursSelecteurOptions,
): string {
  return QuestionsDeCoursSelecteurElement.create(options)
}
