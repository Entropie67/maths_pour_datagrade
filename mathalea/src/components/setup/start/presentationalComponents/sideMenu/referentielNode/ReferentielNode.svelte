<script lang="ts">
  import katex from 'katex'
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { slide } from 'svelte/transition'
  import codeToLevelList from '../../../../../../json/codeToLevelList.json'
  import themesList from '../../../../../../json/levelsThemesList.json'
  import themesListCH from '../../../../../../json/levelsThemesListCH.json'
  import { monthes } from '../../../../../../lib/components/handleDate'
  import { codeToLevelTitle } from '../../../../../../lib/components/refUtils'
  import {
    isSwissCycleCode,
    sortSwissCycleEntries,
  } from '../../../../../../lib/components/swissReferentiel'
  import { toMap } from '../../../../../../lib/components/toMap'
  import {
    bibliothequeDisplayedContent,
    exercicesParams,
  } from '../../../../../../lib/stores/generalStore'
  import {
    isExamItemInReferentiel,
    isJSONReferentielEnding,
    type JSONReferentielObject,
  } from '../../../../../../lib/types/referentiels'
  import { unfoldedNodes } from '../unfoldedNodesStore'
  import ReferentielEnding from './ReferentielEnding.svelte'

  const themes = toMap(themesList)
  const themesCH = toMap(themesListCH)

  export let subset: JSONReferentielObject
  export let unfold: boolean = false
  export let nestedLevelCount: number
  export let indexBase: number
  export let levelTitle: string
  export let pathToThisNode: string[]
  export let parentId: string = ''
  const nodeId = `${parentId}/${levelTitle}`
  const savedUnfold: boolean | undefined = get(unfoldedNodes)[nodeId]
  if (savedUnfold !== undefined) unfold = savedUnfold
  $: items = prepareSubset(subset)
  const levels = Object.keys(codeToLevelList)

  /**
   * Recherche dans la liste des thèmes si le thème est référencé
   * et si oui, renvoie son intitulé
   * @param {string} themeCode code du thème
   * @return {string} intitulé du thème
   * @author Sylvain Chambon & Rémi Angot
   */
  function themeTitle(themeCode: string) {
    let title = ''
    if (themes.has(themeCode)) {
      title = [
        themeCodeisSubthemeCode(
          levelTitle,
          Array.from(levelTitle.replace('auto', ''))[0],
        )
          ? ''
          : ' : ',
        themes.get(themeCode)?.get('titre'),
      ].join('')
    } else if (themesCH.has(themeCode)) {
      title = [
        themeCodeisSubthemeCode(
          levelTitle,
          Array.from(levelTitle.replace('auto', ''))[0],
        )
          ? ''
          : ' : ',
        themesCH.get(themeCode)?.get('titre'),
      ].join('')
    } else {
      title = ''
    }
    if (title.includes('$')) {
      const regexp = /(['$])(.*?)\1/g
      const matchs = title.match(regexp)
      matchs?.forEach((match) => {
        title = title.replace(
          match,
          katex.renderToString(match.replaceAll('$', '')),
        )
      })
    }
    return title
  }

  /**
   * Teste si le code du niveau correspond à un sous-thème :
   * sur la base de la syntaxe adoptée pour les codes des thèmes
   * (à savoir : <NB><UNE OU DEUX LETTRES><NOMBRE>, avec éventuellement un
   * préfixe `can`, ou un infixe `auto` inséré juste avant la lettre finale,
   * ex. `6N2autoA`),
   * la fonction confronte le code à tester à une expression régulière afin de savoir si
   * une lettre suit le code de trois caractères.
   * @param {string} themeCode code du niveau
   * @param {string} level? niveau optionnel (6 par défaut)
   * @author Sylvain Chambon
   */
  function themeCodeisSubthemeCode(
    themeCode: string,
    level: string = '6',
  ): boolean {
    const normalizedThemeCode = themeCode
      .replace(/^can/, '')
      .replace('auto', '')
    const normalizedLevel = /^\d/.test(normalizedThemeCode)
      ? normalizedThemeCode[0]
      : /^CM[12]/.test(normalizedThemeCode)
        ? normalizedThemeCode.slice(0, 3)
        : level
    const regexp = new RegExp(`^${normalizedLevel}[A-Z]{1,2}\\d+[A-Z0-9]$`)
    const regexp3Auto = new RegExp(`^(3Auto)?[A-Z]\\d+[A-Z0-9]$`, `g`)
    const regexp1Auto = new RegExp(`^[12]A-[A-Z]\\d{1,2}$`, `g`)
    // Cycle d'orientation suisse : <année><section><axe><notion><sous-thème>,
    // ex. `9R2NO4C`, `10LSFA1B`
    const regexpCO = /^(9R[123]|1[01](CT|LC|LS))[A-Z]{2}\d+[A-Z]$/
    const regexpQcmCO =
      /^(9R[123]|1[01](CT|LC|LS))QCM(NO|FA|ES|GM)(\d+[A-Z]?)?$/
    // Préqualifiant suisse : PRQ<domaine><notion><feuille>, ex. `PRQNO06A`
    const regexpPRQ = /^PRQ[A-Z]{2}\d+[A-Z]$/
    return (
      regexp.test(normalizedThemeCode) ||
      regexp3Auto.test(themeCode) ||
      regexp1Auto.test(themeCode) ||
      regexpCO.test(themeCode) ||
      regexpQcmCO.test(themeCode) ||
      regexpPRQ.test(themeCode)
    )
  }

  // ===========================================================================
  //  Aides au rangement des entrées du menu (annales)
  // ===========================================================================

  /** Reconnaît une année (chaîne de 4 chiffres). */
  const YEAR_REGEX = /^\d{4}$/

  /** Une entrée `[clé, valeur]` du référentiel. */
  type SubsetEntry = [string, unknown]

  /** Toutes les valeurs sont des terminaisons (niveau feuille). */
  function allValuesAreEndings(entries: SubsetEntry[]): boolean {
    return (
      entries.length > 0 && entries.every(([, v]) => isJSONReferentielEnding(v))
    )
  }

  /** Toutes les clés sont des années (niveau « liste d'années »). */
  function allKeysAreYears(entries: SubsetEntry[]): boolean {
    return entries.length > 0 && entries.every(([k]) => YEAR_REGEX.test(k))
  }

  /** Chaque valeur est un sous-objet dont les enfants sont des terminaisons
   *  (niveau « liste de thèmes »). */
  function allValuesAreEndingContainers(entries: SubsetEntry[]): boolean {
    return (
      entries.length > 0 &&
      entries.every(([, v]) => {
        if (v === null || typeof v !== 'object' || Array.isArray(v))
          return false
        const children = Object.values(v as Record<string, unknown>)
        return (
          children.length > 0 &&
          children.every((c) => isJSONReferentielEnding(c))
        )
      })
    )
  }

  /** Préfixe numérique d'une clé de filière (ex. `00_Général` -> 0). */
  function numericPrefix(key: string): number | undefined {
    const m = key.match(/^(\d+)/)
    return m ? parseInt(m[1], 10) : undefined
  }

  /** Valeur numérique d'une année ; `+Infinity` si absente (repoussée en fin). */
  function anneeValue(v: string | undefined): number {
    if (!v) return Number.POSITIVE_INFINITY
    const n = parseInt(v, 10)
    return Number.isNaN(n) ? Number.POSITIVE_INFINITY : n
  }

  /** Index du mois (0..11) ; `+Infinity` si absent/inconnu (repoussé en fin). */
  function monthIndex(mois: string | undefined): number {
    if (!mois) return Number.POSITIVE_INFINITY
    const i = monthes.indexOf(mois)
    return i === -1 ? Number.POSITIVE_INFINITY : i
  }

  /** Valeur numérique d'un jour (`J1` -> 1) ; `+Infinity` si absent. */
  function jourValue(jour: string | undefined): number {
    if (!jour) return Number.POSITIVE_INFINITY
    const n = parseInt(jour.replace('J', ''), 10)
    return Number.isNaN(n) ? Number.POSITIVE_INFINITY : n
  }

  /** Valeur numérique du `numeroInitial` ; `+Infinity` si absent. */
  function numeroInitialValue(v: string | undefined): number {
    if (!v) return Number.POSITIVE_INFINITY
    const n = parseInt(v, 10)
    return Number.isNaN(n) ? Number.POSITIVE_INFINITY : n
  }

  /** Ordre de regroupement par `typeExercice` (ex. `dnb` avant `dnbpro`).
   *  Les types non listés sont regroupés ensemble en fin, dans un ordre stable. */
  const TYPE_EXERCICE_RANK: Record<string, number> = {
    dnb: 0,
    dnbpro: 1,
  }

  /** Rang de regroupement d'une terminaison selon son `typeExercice` ;
   *  `+Infinity` si absent ou non référencé (repoussé en fin du regroupement). */
  function typeExerciceRank(v: unknown): number {
    if (v && typeof v === 'object' && 'typeExercice' in v) {
      const t = (v as { typeExercice?: string }).typeExercice
      if (t && t in TYPE_EXERCICE_RANK) return TYPE_EXERCICE_RANK[t]
    }
    return Number.POSITIVE_INFINITY
  }

  /** Compare le `lieu` (ascendant, insensible à la casse/accents) ;
   *  les entrées incomplètes sont repoussées en fin. */
  function compareLieu(a: string | undefined, b: string | undefined): number {
    if (!a && b) return 1
    if (a && !b) return -1
    if (!a && !b) return 0
    return a!.localeCompare(b!, 'fr')
  }

  /** Extrait les champs d'une terminaison d'examen ; renvoie `null` sinon. */
  function examFields(v: unknown) {
    return isExamItemInReferentiel(v)
      ? {
          annee: anneeValue((v as { annee?: string }).annee),
          mois: monthIndex((v as { mois?: string }).mois),
          lieu: (v as { lieu?: string }).lieu,
          typeRank: typeExerciceRank(v),
          jour: jourValue((v as { jour?: string }).jour),
          numeroInitial: numeroInitialValue(
            (v as { numeroInitial?: string }).numeroInitial,
          ),
        }
      : null
  }

  /**
   * Comparateur des terminaisons sous un nœud ANNÉE :
   * (A) mois descendant · (B) lieu ascendant · (C) typeExercice regroupé (`dnb` avant `dnbpro`)
   * · (D) jour ascendant · (E) numeroInitial ascendant.
   * Les entrées incomplètes sur un critère sont repoussées en fin de ce critère.
   */
  function compareEndingsByYear(a: SubsetEntry, b: SubsetEntry): number {
    const fa = examFields(a[1])
    const fb = examFields(b[1])
    // une entrée non-examen est repoussée en fin
    if (!fa && fb) return 1
    if (fa && !fb) return -1
    if (!fa && !fb) return 0
    return (
      fb!.mois - fa!.mois ||
      compareLieu(fa!.lieu, fb!.lieu) ||
      fa!.typeRank - fb!.typeRank ||
      fa!.jour - fb!.jour ||
      fa!.numeroInitial - fb!.numeroInitial
    )
  }

  /**
   * Comparateur des terminaisons sous un nœud THÈME :
   * (A) année descendante · (B) mois descendant · (C) lieu ascendant · (D) typeExercice regroupé
   * (`dnb` avant `dnbpro`) · (E) jour ascendant · (F) numeroInitial ascendant.
   * Les entrées incomplètes sur un critère sont repoussées en fin de ce critère.
   */
  function compareEndingsByTheme(a: SubsetEntry, b: SubsetEntry): number {
    const fa = examFields(a[1])
    const fb = examFields(b[1])
    if (!fa && fb) return 1
    if (fa && !fb) return -1
    if (!fa && !fb) return 0
    return (
      fb!.annee - fa!.annee ||
      fb!.mois - fa!.mois ||
      compareLieu(fa!.lieu, fb!.lieu) ||
      fa!.typeRank - fb!.typeRank ||
      fa!.jour - fb!.jour ||
      fa!.numeroInitial - fb!.numeroInitial
    )
  }

  /**
   * Prépare la liste ordonnée des enfants d'un nœud du menu avant déploiement.
   *
   * Le rangement est déterminé par la **nature des enfants** (et non par le libellé
   * du chemin), afin d'être robuste quelle que soit la section (Brevet, Bac,
   * Épreuves de Première…, structurées « Par année » ou « Par thème ») :
   *  - niveau feuille (terminaisons d'examens) :
   *      · sous une année  -> mois desc, lieu asc, typeExercice regroupé, jour asc, numeroInitial asc ;
   *      · sous un thème    -> année desc, mois desc, lieu asc, typeExercice regroupé, jour asc, numeroInitial asc ;
   *  - liste d'années (clés 4 chiffres)        -> années décroissantes ;
   *  - liste de thèmes (sous-objets de terminaisons) -> ordre alphabétique ascendant,
   *      sous-thèmes « automatismes » (code contenant l'infixe `auto`) toujours en dernier ;
   *  - filières / sections                     -> préfixe numérique ascendant (ordre préservé sinon).
   */
  function prepareSubset(s: JSONReferentielObject) {
    const entries = Object.entries(s)
    if (pathToThisNode.length !== 0) {
      const current = pathToThisNode[pathToThisNode.length - 1]
      // CO : l'ordre des catégories suit les moyens d'enseignement et le
      // squelette CH ; seules les références des exercices sont triées.
      if (isSwissCycleCode(current)) {
        return sortSwissCycleEntries(entries)
      }
      // classement entrées CAN (ordre des niveaux)
      if (current.includes('CAN')) {
        return entries.sort(([keyA], [keyB]) => {
          return levels.indexOf(keyA) - levels.indexOf(keyB)
        })
      }
      const normalizedCurrent = current.replace(/^(auto|can)/, '')
      if (
        /^[12T]/.test(normalizedCurrent) &&
        entries.some(([key]) => key.toLowerCase().includes('-flash'))
      ) {
        return entries.sort(([keyA], [keyB]) => {
          const isFlashA = keyA.toLowerCase().includes('-flash')
          const isFlashB = keyB.toLowerCase().includes('-flash')
          if (isFlashA !== isFlashB) return isFlashA ? -1 : 1
          return keyA.localeCompare(keyB, 'fr', { numeric: true })
        })
      }
      // niveau feuille : terminaisons d'examens
      if (allValuesAreEndings(entries)) {
        return YEAR_REGEX.test(current)
          ? entries.sort(compareEndingsByYear)
          : entries.sort(compareEndingsByTheme)
      }
      // liste d'années -> ordre descendant
      if (allKeysAreYears(entries)) {
        return entries.sort(
          ([keyA], [keyB]) => parseInt(keyB, 10) - parseInt(keyA, 10),
        )
      }
      // liste de thèmes -> ordre alphabétique ascendant, sous-thèmes
      // « automatismes » (code contenant l'infixe `auto`) toujours en dernier
      if (allValuesAreEndingContainers(entries)) {
        return entries.sort(([keyA], [keyB]) => {
          const isAutoA = keyA.includes('auto')
          const isAutoB = keyB.includes('auto')
          if (isAutoA !== isAutoB) return isAutoA ? 1 : -1
          return keyA.localeCompare(keyB, 'fr')
        })
      }
      // filières / sections : préfixe numérique ascendant (ordre préservé sinon)
      return entries.sort(([keyA], [keyB]) => {
        const na = numericPrefix(keyA)
        const nb = numericPrefix(keyB)
        if (na === undefined && nb === undefined) return 0
        return (
          (na ?? Number.POSITIVE_INFINITY) - (nb ?? Number.POSITIVE_INFINITY)
        )
      })
    } else {
      // niveau racine : ordre alphabétique pour ces référentiels
      if (
        'Géométrie dynamique' === levelTitle ||
        'Vos ressources' === levelTitle
      ) {
        return entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB, 'fr'))
      }
      return entries
    }
  }

  /**
   * Gestion la bibliothèque de statiques
   */
  let bibliothequeUuidInExercisesList: string[]
  $: {
    bibliothequeUuidInExercisesList = []
    const uuidList: string[] = []
    for (const entry of $exercicesParams) {
      uuidList.push(entry.uuid)
    }
    if ($bibliothequeDisplayedContent) {
      for (const item of Object.values($bibliothequeDisplayedContent)) {
        if (isJSONReferentielEnding(item) && uuidList.includes(item.uuid)) {
          bibliothequeUuidInExercisesList.push(item.uuid)
        }
      }
    }
    bibliothequeUuidInExercisesList = bibliothequeUuidInExercisesList
  }

  onMount(() => {
    //   console.log('******** subset ********')
    //   console.log(Object.entries(subset))
    // console.log('levelTitle: ', levelTitle)
    if (savedUnfold !== undefined) return
    // Garder les nouveaux groupes compacts à leur ouverture, y compris les
    // feuilles reconnues comme sous-thèmes et les subdivisions QCM.
    if (isSwissCycleCode(levelTitle)) return
    if (
      (nestedLevelCount === 1 && levelTitle === 'Exercices aléatoires') ||
      themeCodeisSubthemeCode(
        levelTitle,
        Array.from(levelTitle.replace('auto', ''))[0],
      )
    ) {
      unfold = true
    }
  })
</script>

<!--
  @component
  Composant destiné à afficher la liste des entrées d'un référentiel à un niveau N.
  On affiche le titre du niveau N et un clic sur ce titre déploie la liste des entrées
  du niveau N+1. Lorsque N=1, on considère que c'est un titre de section et le format est différent.

  #### Remarque
  Le composant s'appelle lui-même afin d'assurer récursivement le parcours entier du référentiel.
  On détecte si l'objet passé en paramètre est du type `JSONReferentielEnding` pour s'arrèter.
  Dans ce cas, le composant `ReferentielEnding.svelte` est appelé.

  #### Organisation
  Le rangement des entrées est réalisé **à la volée**, au moment d'afficher un nœud : la
  fonction `prepareSubset` est réexécutée à chaque déploiement (via `$: items = prepareSubset(subset)`)
  et produit la liste ordonnée des enfants directs du nœud courant. Pour le CO suisse,
  l'ordre des catégories est celui du référentiel ; les références des exercices
  suivent un tri numérique naturel. Les autres référentiels suivent les règles ci-dessous.

  Le rangement est déterminé par la **nature des enfants** du nœud courant (et non par le libellé
  du chemin), afin de rester valable quelle que soit la section (Brevet, Baccalauréat, Épreuves de
  Première…) et sa structure (« Par année » ou « Par thème ») :

  - **niveau feuille** (les valeurs sont des terminaisons d'examens) :
      - sous un nœud **année** (clé `YYYY`) : mois descendant, puis lieu ascendant, puis
        `typeExercice` regroupé (`dnb` avant `dnbpro`), puis jour ascendant (`J1` avant `J2`),
        puis `numeroInitial` ascendant ;
      - sous un nœud **thème** : année descendante, puis mois descendant, puis lieu ascendant,
        puis `typeExercice` regroupé (`dnb` avant `dnbpro`), puis jour ascendant,
        puis `numeroInitial` ascendant ;
  - **liste d'années** (clés `YYYY`) : ordre descendant ;
  - **liste de thèmes** (sous-objets dont les enfants sont des terminaisons) : ordre alphabétique
    ascendant, les sous-thèmes « automatismes » (code contenant l'infixe `auto`, ex. `6N2autoA`)
    étant toujours repoussés en dernier ;
  - **filières / sections** (p. ex. `00_Général`, `10_STI2D`) : ordre du préfixe numérique ascendant,
    ordre d'insertion préservé en l'absence de préfixe.

  Sur chaque critère, une entrée incomplète (champ absent ou non numérique) est **repoussée en fin**
  de ce critère ; les critères suivants continuent de s'appliquer dans l'ordre hiérarchique. Les
  entrées CAN ainsi que le niveau racine (`pathToThisNode` vide) suivent un rangement spécifique
  conservé tel quel.

  #### Paramètres
  - **subset** (_JSONReferentielObject_) : la branche du référentiel à afficher.
  - **unfold** (_boolean_) : flag pour savoir si le niveau courant est déployé ou pas.
  - **nestedLevelCount** (_number_) : compteur pour connaître le nombre d'imbrication (utilisé pour la mise en page).
  - **indexBase** (_number_) : nombre utilisé pour identifier les éléments HTML.
  - **levelTitle** (_string_) : titre du niveau courant (clé du nœud retraduite sur la base des fichiers `levelsThemesList.json` et `codeToLevelList.json`).
  - **parentId** (_string_) : identifiant du nœud parent ; l'identifiant du nœud (`parentId/levelTitle`) sert de clé
    dans le store `unfoldedNodes` pour conserver l'état déplié lorsque le menu est démonté puis remonté.

 -->
<div class={`${$$props.class || ''}`}>
  <button
    id={'titre-liste-' + indexBase}
    type="button"
    disabled={Object.keys(subset).length === 0}
    class="w-full flex flex-row text-start items-center justify-between font-bold first-letter:first-linemarker
    {nestedLevelCount !== 1
      ? 'text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest'
      : 'text-coopmaths-struct dark:text-coopmathsdark-struct py-2'}
    {unfold &&
    nestedLevelCount !== 1 &&
    !themeCodeisSubthemeCode(
      levelTitle,
      Array.from(levelTitle.replace('auto', ''))[0],
    )
      ? 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest'
      : 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'}
    {Object.keys(subset).length === 0
      ? 'opacity-10'
      : 'opacity-100 cursor-pointer'}"
    style="padding-left: {(nestedLevelCount * 2) / 5}rem"
    on:click={() => {
      unfold = !unfold
      unfoldedNodes.update((nodes) => ({ ...nodes, [nodeId]: unfold }))
    }}
  >
    <div
      id={'titre-liste-' + indexBase + '-content'}
      class=" {nestedLevelCount === 1
        ? 'text-xl'
        : themeCodeisSubthemeCode(
              levelTitle,
              Array.from(levelTitle.replace('auto', ''))[0],
            )
          ? 'text-base leading-none py-2'
          : 'text-base'}"
    >
      <!-- on va chercher dans les fichiers JSON les significations des clés passées comme titre -->
      {#if !themeCodeisSubthemeCode(levelTitle, Array.from(levelTitle.replace('auto', ''))[0])}
        {codeToLevelTitle(levelTitle)}
      {/if}
      <span
        class={themeCodeisSubthemeCode(
          levelTitle,
          Array.from(levelTitle.replace('auto', ''))[0],
        )
          ? 'font-normal text-sm leading-[80%]'
          : 'font-normal '}>{@html themeTitle(levelTitle)}</span
      >
    </div>
    <div>
      <!-- Suivant que c'est le premier niveau (nestedLevelCount = 1) ou pas, on a un affichage différent :
      le premier niveau correspond au tritre du référentiel -->
      {#if nestedLevelCount !== 1}
        <i
          class=" flex text-xl bg-transparent transition-transform duration-500 ease-in-out
        {unfold && nestedLevelCount !== 1
            ? 'bx bx-plus rotate-[225deg]'
            : 'bx bx-plus'}"
        ></i>
      {/if}

      {#if nestedLevelCount === 1}
        <i
          class="flex text-sm text-coopmaths-action dark:text-coopmathsdark-action bg-transparent transition-transform duration-500 ease-in-out
        {unfold ? 'bx bxs-up-arrow' : 'bx bxs-up-arrow rotate-[180deg]'}"
        ></i>
      {/if}
    </div>
  </button>
  <div>
    {#if unfold}
      <ul transition:slide|global={{ duration: 500 }}>
        {#each items as [key, obj], i}
          <li>
            {#if isJSONReferentielEnding(obj)}
              <ReferentielEnding
                ending={obj}
                nestedLevelCount={nestedLevelCount + 1}
                class={i === items.length - 1 ? 'pb-1' : ''}
              />
            {:else}
              <svelte:self
                parentId={nodeId}
                indexBase={`${indexBase}-${i.toString()}`}
                levelTitle={key}
                nestedLevelCount={nestedLevelCount + 1}
                pathToThisNode={[...pathToThisNode, key]}
                bind:subset={obj}
              />
            {/if}
          </li>
        {/each}
        <!-- Entrée libre ajoutée en fin de nœud par l'appelant, qui fournit son
             propre `<li>` (utilisée par « Ressources partenaires » pour le
             bouton d'ajout de banque). Le slot n'est pas transmis à
             `svelte:self` : il n'apparaît qu'au niveau où il est fourni, jamais
             dans les sous-nœuds. -->
        <slot name="trailing" />
      </ul>
    {/if}
  </div>
</div>
