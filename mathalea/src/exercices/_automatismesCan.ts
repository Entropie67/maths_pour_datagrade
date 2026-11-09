import seedrandom from 'seedrandom'
import Exercice from './Exercice'
import MetaExercice from './MetaExerciceCan'
import { exportedApplyNewSeed } from './exerciseMethods'

/**
 * Code commun aux exercices « Sélection d'automatismes » (1A, 3A, …).
 *
 * Ces exercices tirent aléatoirement, par catégorie, un certain nombre de
 * questions parmi tous les automatismes d'un niveau, puis délèguent l'affichage
 * à {@link MetaExercice} (MetaExerciceCan). Seules la liste des modules, les
 * catégories et le formulaire associé changent d'un niveau à l'autre : tout le
 * reste est factorisé ici.
 *
 * @author Rémi Angot
 */

export type ExerciceModule = {
  default: new () => Exercice
  refs?: Record<string, string[]>
}

type CategoryEntry = {
  loader: () => Promise<ExerciceModule>
  ref: string
  category: string
}

export type CategoriesForm = {
  titre: string
  categories: { label: string; max: number }[]
  defaut: number[]
}

export type AutomatismesCanConfig = {
  /** Modules chargés en lazy via `import.meta.glob` (eager: false) dans le fichier appelant */
  modules: Record<string, () => Promise<ExerciceModule>>
  /** Expression régulière extrayant la lettre de catégorie du nom de fichier (un groupe capturant) */
  refRegex: RegExp
  /** Liste ordonnée des lettres de catégories */
  categories: readonly string[]
  /** Formulaire « nombre de questions par catégorie » */
  categoriesForm: CategoriesForm
  /** Valeur par défaut de `sup` (ex. `'2-2-2-2-2-2'`) */
  defaultSup: string
}

function pickRandom<T>(arr: T[], n: number, rng: () => number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

/**
 * Cache des classes d'exercices déjà chargées, indexé par entrée du catalogue.
 * Une même référence peut désigner une version publiée et sa version courante :
 * leurs classes doivent rester distinctes. Le cache permet de reconstruire une
 * version de façon synchrone une fois les modules téléchargés, notamment en
 * sortie diaporama où `reroll()` lit le contenu immédiatement.
 */
const loadedClassCache = new WeakMap<CategoryEntry, new () => Exercice>()

/**
 * Fabrique la classe d'un exercice « Sélection d'automatismes » à partir de sa
 * configuration de niveau.
 */
export function createAutomatismesCanExercice(config: AutomatismesCanConfig) {
  const { modules, refRegex, categories, categoriesForm, defaultSup } = config

  // Indexation des exercices par catégorie à partir des noms de fichiers (sans chargement)
  const categoryEntries: Record<string, CategoryEntry[]> = {}
  for (const cat of categories) categoryEntries[cat] = []

  for (const [path, loader] of Object.entries(modules)) {
    const filename = path.replace(/^.*\//, '').replace(/\.ts$/, '')
    const match = filename.match(refRegex)
    if (match && match[1] in categoryEntries) {
      categoryEntries[match[1]].push({
        loader,
        ref: filename,
        category: match[1],
      })
    }
  }

  // Ne pas dépendre de l'ordre d'énumération de `import.meta.glob`.
  for (const entries of Object.values(categoryEntries)) {
    entries.sort((a, b) => a.ref.localeCompare(b.ref))
  }
  const entryByRef = new Map(
    Object.values(categoryEntries)
      .flat()
      .map((entry) => [entry.ref, entry]),
  )

  // Une catégorie ne peut pas fournir plus de questions qu'elle n'a
  // d'exercices : on borne le formulaire et les valeurs par défaut sur ce qui
  // existe réellement, sinon l'utilisateur demande 2 questions et n'en obtient
  // qu'une, sans comprendre pourquoi.
  const availableByCategory = categories.map(
    (cat) => categoryEntries[cat].length,
  )
  const defaultParts = categories.map((_, i) => {
    const fromSup = parseInt(String(defaultSup).split('-')[i])
    const wanted = isNaN(fromSup) ? (categoriesForm.defaut[i] ?? 0) : fromSup
    return Math.max(0, Math.min(wanted, availableByCategory[i]))
  })
  const clampedDefaultSup = defaultParts.join('-')
  const clampedCategoriesForm: CategoriesForm = {
    ...categoriesForm,
    categories: categoriesForm.categories.map((categorie, i) => ({
      ...categorie,
      max: Math.min(categorie.max, availableByCategory[i]),
    })),
    defaut: defaultParts,
  }

  return class AutomatismesCan extends MetaExercice {
    private generationRevision = 0
    private isDestroyed = false
    generationStatus: 'loading' | 'ready' | 'error' = 'ready'

    constructor() {
      super([])
      this.sup = clampedDefaultSup
      this.sup3 = false
      this.sup4 = false // graine figée de la sélection quand sup3 est coché
      this.besoinFormulaireCaseACocher = false
      // Le nombre de questions découle des catégories : il ne se règle pas
      // depuis les vues qui proposent un champ « nombre de questions ».
      this.nbQuestionsModifiable = false
      this.besoinFormulaire2CaseACocher = [
        'Afficher la référence de chaque question',
      ]
      this.besoinFormulaire3CaseACocher = ["Garder la sélection d'exercices"]
      this.besoinFormulaireNombresCategories = clampedCategoriesForm
      this.comment = ''
    }

    /**
     * Une nouvelle graine doit aussi provoquer un nouveau tirage des
     * automatismes. `sup5` reste en revanche intact pour une sélection reçue
     * depuis une URL : elle garantit que ce lien retrouve le même sujet.
     */
    override applyNewSeed = (): void => {
      this.sup5 = false
      exportedApplyNewSeed.call(this)
    }

    nouvelleVersion(): void {
      if (this.isDestroyed) return
      this.generationStatus = 'loading'
      // Invalider aussi les chargements précédents lors d'une génération
      // synchrone depuis le cache. Les imports restent utiles au cache partagé.
      const revision = ++this.generationRevision
      const showRefs = !!this.sup2
      const keepSelection = !!this.sup3
      const savedSup = this.sup
      const savedSup2 = this.sup2
      const savedSup3 = this.sup3

      const supParts = String(this.sup || clampedDefaultSup).split('-')
      const parts = categories.map((_, i) => {
        const n = parseInt(supParts[i])
        const wanted = isNaN(n) ? defaultParts[i] : Math.max(0, n)
        return Math.min(wanted, availableByCategory[i])
      })

      // La graine ne suffit pas à figer le tirage si le catalogue est enrichi.
      // On mémorise donc les références effectivement retenues dans `sup5`
      // (sérialisé en `s5` dans les URL et les activités Capytale). Une liste
      // reçue est prioritaire : une ancienne URL retrouve les mêmes questions,
      // même après l'ajout de nouveaux automatismes.
      const requestedRefs =
        typeof this.sup5 === 'string' && this.sup5.length > 0
          ? this.sup5.split('|')
          : []
      const savedSelection = requestedRefs.map((ref) => entryByRef.get(ref))
      const expectedCounts = new Map(
        categories.map((category, i) => [category, parts[i]]),
      )
      const actualCounts = new Map<string, number>()
      for (const entry of savedSelection) {
        if (entry != null) {
          actualCounts.set(
            entry.category,
            (actualCounts.get(entry.category) ?? 0) + 1,
          )
        }
      }
      const hasSavedSelection =
        savedSelection.length === requestedRefs.length &&
        savedSelection.every((entry) => entry != null) &&
        new Set(requestedRefs).size === requestedRefs.length &&
        categories.every(
          (category) =>
            actualCounts.get(category) === expectedCounts.get(category),
        )

      // « Garder la sélection d'exercices » : on fige dans sup4 (paramètre
      // persisté et inutilisé par MetaExerciceCan) la graine de la sélection.
      // Au moment où la case est cochée, this.seed vaut encore la graine de la
      // version affichée (modifier un formulaire ne régénère pas la graine) :
      // on la capture donc telle quelle, ce qui conserve exactement la
      // sélection et l'ordre à l'écran (pas de saut). Les données des questions
      // dépendent de this.seed et continuent d'être aléatoirisées à chaque
      // « Nouvelles données ».
      let selectionSeed: string
      if (keepSelection) {
        const frozen = this.sup4
        if (frozen != null && frozen !== false && String(frozen) !== '') {
          selectionSeed = String(frozen)
        } else {
          selectionSeed = String(this.seed)
          this.sup4 = selectionSeed
        }
      } else {
        selectionSeed = String(this.seed)
        this.sup4 = false
      }
      const rng = seedrandom(selectionSeed)

      const selected: CategoryEntry[] = hasSavedSelection
        ? (savedSelection as CategoryEntry[])
        : []
      if (!hasSavedSelection) {
        for (let i = 0; i < categories.length; i++) {
          const cat = categories[i]
          const picked = pickRandom(categoryEntries[cat], parts[i], rng)
          selected.push(...picked)
        }

        // Mélanger toutes les questions sélectionnées uniquement lors du
        // premier tirage : l'ordre mémorisé fait ensuite partie du sujet.
        selected.sort(() => rng() - 0.5)
        this.sup5 =
          selected.length > 0 ? selected.map((e) => e.ref).join('|') : false
      }

      const totalQuestions = selected.length
      this.nbQuestions = totalQuestions

      // Forcer les params de formulaire avant le retour synchrone — MetaExercice
      // constructor a mis besoinFormulaireCaseACocher = ['Sujet officiel'] et le
      // framework lirait ces valeurs si on ne les corrige pas maintenant.
      this.besoinFormulaireCaseACocher = false
      this.besoinFormulaire2CaseACocher = [
        'Afficher la référence de chaque question',
      ]
      this.besoinFormulaire2Texte = false
      this.besoinFormulaire3CaseACocher = ["Garder la sélection d'exercices"]
      this.besoinFormulaireNombresCategories = clampedCategoriesForm
      this.nbQuestionsModifiable = false

      // Construit les questions à partir des classes chargées puis restaure nos
      // paramètres de formulaire (MetaExerciceCan les écrase pendant le rendu).
      const buildFromClasses = (classes: (new () => Exercice)[]) => {
        // Les imports des sous-exercices sont asynchrones. Entre l'appel à
        // `nouvelleVersion()` et leur résolution, un autre exercice peut avoir
        // changé le générateur global. MetaExerciceCan et ses sous-exercices
        // l'utilisent pour tirer les données : le réamorcer ici garantit donc
        // qu'une même graine produit le même énoncé, y compris à la reprise
        // d'une copie Capytale.
        if (this.seed !== undefined) seedrandom(this.seed, { global: true })
        this.Exercices = classes
        this.sup2 = selected.map((_, i) => i + 1).join('-')
        this.sup = false
        this.sup3 = false

        super.nouvelleVersion()

        this.questionRefs = showRefs ? selected.map((e) => e.ref) : undefined

        // Restaurer nos paramètres de formulaire après l'écrasement par MetaExerciceCan
        this.comment = ''
        this.sup = savedSup
        this.sup2 = savedSup2
        this.sup3 = savedSup3
        // this.sup4 n'est pas restauré : il conserve la graine figée (ou false)
        // afin d'être persisté dans l'URL et réutilisé aux versions suivantes.
        this.besoinFormulaireCaseACocher = false
        this.besoinFormulaire2CaseACocher = [
          'Afficher la référence de chaque question',
        ]
        this.besoinFormulaire2Texte = false
        this.besoinFormulaire3CaseACocher = ["Garder la sélection d'exercices"]
        this.besoinFormulaireNombresCategories = clampedCategoriesForm
        this.nbQuestionsModifiable = false
        this.generationStatus = 'ready'
      }

      // Si tous les modules sélectionnés sont déjà en cache, on reconstruit de
      // façon synchrone, sans déclencher `updateAsyncEx`. Indispensable en
      // diaporama : `reroll()` lit `listeQuestions` juste après l'appel, et un
      // rechargement asynchrone provoquerait une boucle (chaque `updateAsyncEx`
      // relançant un `reroll`) tout en n'affichant que « chargement... ».
      const cachedClasses = selected.map((e) => loadedClassCache.get(e))
      if (cachedClasses.every((c): c is new () => Exercice => c != null)) {
        buildFromClasses(cachedClasses)
        return
      }

      // Placeholders pendant le chargement asynchrone
      this.listeQuestions = Array(totalQuestions).fill('chargement...')
      this.listeCorrections = Array(totalQuestions).fill('')
      this.autoCorrection = Array(totalQuestions).fill(undefined)

      // Chargement uniquement des modules sélectionnés (manquants du cache)
      Promise.all(
        selected.map((e) => {
          const cached = loadedClassCache.get(e)
          if (cached) return Promise.resolve(cached)
          return e.loader().then((m) => {
            loadedClassCache.set(e, m.default)
            return m.default
          })
        }),
      )
        .then((classes) => {
          if (this.isDestroyed || revision !== this.generationRevision) return
          buildFromClasses(classes)
          document.dispatchEvent(
            new window.CustomEvent('updateAsyncEx', {
              bubbles: true,
              detail: { exercise: this },
            }),
          )
        })
        .catch((error) => {
          if (this.isDestroyed || revision !== this.generationRevision) return
          this.generationStatus = 'error'
          // Le `import()` lazy d'un module peut se résoudre après la destruction
          // de l'environnement (ex. suite de tests `all_exercises` : le harnais
          // appelle `nouvelleVersionWrapper()` sans attendre ce chargement).
          // Sans ce `catch`, le rejet non capturé fait échouer toute la suite
          // (`EnvironmentTeardownError`). En usage réel, la question reste
          // affichée en « chargement... » et on trace l'échec.
          try {
            if (
              typeof window !== 'undefined' &&
              typeof window.notify === 'function'
            ) {
              window.notify(
                "AutomatismesCan : échec du chargement d'un module d'automatisme",
                { error: String(error) },
              )
            }
          } catch {
            /* environnement déjà détruit : rien à faire */
          }
        })
    }

    override destroy(): void {
      this.isDestroyed = true
      this.generationRevision++
      super.destroy()
    }
  }
}
