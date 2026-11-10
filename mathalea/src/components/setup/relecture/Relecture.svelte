<script lang="ts">
  import referentiel from '../../../json/referentiel2022FR.json'
  import {
    buildRelectureUrls,
    collectExercicesARelire,
    filterExercices,
    loadEtatsDeRelecture,
    saveEtatsDeRelecture,
    sortByDate,
    toggleEtatDeRelecture,
    VUES_DE_RELECTURE,
    type EtatDeRelecture,
    type EtatsDeRelecture,
    type ExerciceARelire,
    type LienDeRelecture,
  } from '../../../lib/components/relecture'
  import { darkMode } from '../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import Footer from '../../Footer.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'

  const PAR_PAGE = 20

  const exercices = collectExercicesARelire(referentiel)
  const nouveaux = sortByDate(exercices, 'datePublication')
  const modifies = sortByDate(exercices, 'dateModification')

  let recherche = ''
  let pageNouveaux = 0
  let pageModifies = 0

  $: nouveauxFiltres = filterExercices(nouveaux, recherche)
  $: modifiesFiltres = filterExercices(modifies, recherche)
  // une nouvelle recherche ramène les deux colonnes à leur première page
  $: (recherche, (pageNouveaux = 0), (pageModifies = 0))

  $: colonnes = [
    {
      titre: 'Nouveaux exercices',
      dateKey: 'datePublication' as const,
      liste: nouveauxFiltres,
      page: pageNouveaux,
      setPage: (page: number) => (pageNouveaux = page),
    },
    {
      titre: 'Exercices mis à jour',
      dateKey: 'dateModification' as const,
      liste: modifiesFiltres,
      page: pageModifies,
      setPage: (page: number) => (pageModifies = page),
    },
  ]

  function nbPages(liste: ExerciceARelire[]): number {
    return Math.max(1, Math.ceil(liste.length / PAR_PAGE))
  }

  /** Exercices dont la liste des vues est dépliée, par uuid */
  let vuesDepliees: Record<string, boolean> = {}
  /**
   * Exercices pour lesquels le navigateur a bloqué une partie des onglets.
   * Safari n'ouvre qu'une fenêtre par clic (sauf si les fenêtres surgissantes
   * sont autorisées pour le site).
   */
  let ongletsBloques: Record<string, boolean> = {}

  function basculerVues(exercice: ExerciceARelire) {
    vuesDepliees = {
      ...vuesDepliees,
      [exercice.uuid]: !vuesDepliees[exercice.uuid],
    }
  }

  function liensDe(exercice: ExerciceARelire): LienDeRelecture[] {
    return buildRelectureUrls(
      exercice,
      window.location.origin + window.location.pathname,
    )
  }

  function ouvrirToutesLesVues(exercice: ExerciceARelire) {
    let bloque = false
    for (const lien of liensDe(exercice)) {
      // pas de `noopener` : window.open renverrait toujours null et on ne
      // pourrait pas savoir si l'onglet a été bloqué
      const onglet = window.open(lien.url, '_blank')
      if (onglet == null) bloque = true
      else onglet.opener = null
    }
    ongletsBloques = { ...ongletsBloques, [exercice.uuid]: bloque }
  }

  function getStorage(): Storage | undefined {
    try {
      return window.localStorage
    } catch {
      return undefined
    }
  }

  /** Suivi local de ce que le relecteur a déjà relu */
  let etats: EtatsDeRelecture = loadEtatsDeRelecture(getStorage())

  function choisirEtat(exercice: ExerciceARelire, etat: EtatDeRelecture) {
    etats = toggleEtatDeRelecture(etats, exercice.uuid, etat)
    saveEtatsDeRelecture(getStorage(), etats)
  }

  const FOND_PAR_ETAT: Record<EtatDeRelecture, string> = {
    valide: 'bg-green-100 dark:bg-green-900',
    refuse: 'bg-red-100 dark:bg-red-900',
  }
  const FOND_PAR_DEFAUT =
    'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'
</script>

<main
  class="min-h-screen flex flex-col bg-coopmaths-canvas dark:bg-coopmathsdark-canvas {$darkMode.isActive
    ? 'dark'
    : ''}"
>
  <NavBar
    subtitle="Relecture"
    subtitleType="design"
    handleLanguage={() => {}}
    locale={$referentielLocale}
  />

  <section
    class="flex-1 px-4 py-4 md:py-6 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  >
    <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mb-6">
      <label class="flex flex-row items-center gap-2 w-full md:w-1/2">
        <i class="bx bx-search text-2xl" aria-hidden="true"></i>
        <input
          type="search"
          bind:value={recherche}
          placeholder="Rechercher par référence, titre ou uuid"
          aria-label="Rechercher un exercice"
          class="w-full rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
                 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark px-3 py-2
                 focus:outline-none focus:ring-2 focus:ring-coopmaths-action dark:focus:ring-coopmathsdark-action"
        />
      </label>
      <p
        class="text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
      >
        Le bouton <i class="bx bx-window-open" aria-hidden="true"></i> affiche
        les {VUES_DE_RELECTURE.length} vues de relecture de l'exercice. Les boutons
        <i class="bx bx-check" aria-hidden="true"></i> et
        <i class="bx bx-x" aria-hidden="true"></i> gardent la trace de la relecture
        dans ce navigateur.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {#each colonnes as colonne (colonne.dateKey)}
        {@const debut = colonne.page * PAR_PAGE}
        {@const pages = nbPages(colonne.liste)}
        <div class="flex flex-col">
          <h2
            class="text-2xl font-bold mb-3 text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            {colonne.titre}
            <span class="text-base font-normal">({colonne.liste.length})</span>
          </h2>
          {#if colonne.liste.length === 0}
            <p class="italic">Aucun exercice ne correspond à la recherche.</p>
          {:else}
            <ul class="flex flex-col gap-1">
              {#each colonne.liste.slice(debut, debut + PAR_PAGE) as exercice (exercice.uuid)}
                {@const etat = etats[exercice.uuid]}
                {@const deplie = vuesDepliees[exercice.uuid] === true}
                <li
                  class="flex flex-col rounded-md px-2 py-1 {etat
                    ? FOND_PAR_ETAT[etat]
                    : FOND_PAR_DEFAUT}"
                >
                  <div class="flex flex-row items-center gap-2">
                    <span class="text-xs font-mono shrink-0 w-20">
                      {exercice[colonne.dateKey]}
                    </span>
                    <span class="text-sm">
                      <span class="font-bold">{exercice.id}</span> - {exercice.titre}
                    </span>
                    <button
                      type="button"
                      class="ml-auto shrink-0 tooltip tooltip-left tooltip-neutral
                             text-coopmaths-action hover:text-coopmaths-action-lightest
                             dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                      data-tip={deplie
                        ? 'Masquer les vues de relecture'
                        : 'Afficher les vues de relecture'}
                      aria-label="Vues de relecture de {exercice.id}"
                      aria-expanded={deplie}
                      on:click={() => basculerVues(exercice)}
                    >
                      <i aria-hidden="true" class="bx bx-window-open text-2xl"
                      ></i>
                    </button>
                    <button
                      type="button"
                      class="shrink-0 rounded-full w-7 h-7 flex items-center justify-center
                             {etat === 'valide'
                        ? 'bg-green-600 text-white'
                        : 'text-green-600 hover:bg-green-200 dark:text-green-400 dark:hover:bg-green-800'}"
                      title="Relu, rien à signaler"
                      aria-label="Marquer {exercice.id} comme relu sans problème"
                      aria-pressed={etat === 'valide'}
                      on:click={() => choisirEtat(exercice, 'valide')}
                    >
                      <i aria-hidden="true" class="bx bx-check text-2xl"></i>
                    </button>
                    <button
                      type="button"
                      class="shrink-0 rounded-full w-7 h-7 flex items-center justify-center
                             {etat === 'refuse'
                        ? 'bg-red-600 text-white'
                        : 'text-red-600 hover:bg-red-200 dark:text-red-400 dark:hover:bg-red-800'}"
                      title="Relu, problème repéré"
                      aria-label="Marquer {exercice.id} comme relu avec un problème"
                      aria-pressed={etat === 'refuse'}
                      on:click={() => choisirEtat(exercice, 'refuse')}
                    >
                      <i aria-hidden="true" class="bx bx-x text-2xl"></i>
                    </button>
                  </div>
                  {#if deplie}
                    <div
                      class="flex flex-row flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm"
                    >
                      <button
                        type="button"
                        class="rounded-md px-2 py-0.5 font-bold text-coopmaths-canvas bg-coopmaths-action
                               hover:bg-coopmaths-action-lightest
                               dark:text-coopmathsdark-canvas dark:bg-coopmathsdark-action
                               dark:hover:bg-coopmathsdark-action-lightest"
                        on:click={() => ouvrirToutesLesVues(exercice)}
                      >
                        Toutes
                      </button>
                      {#each liensDe(exercice) as lien (lien.url)}
                        <a
                          href={lien.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="underline text-coopmaths-action hover:text-coopmaths-action-lightest
                                 dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                          >{lien.label}</a
                        >
                      {/each}
                    </div>
                    {#if ongletsBloques[exercice.uuid]}
                      <p
                        class="mb-2 rounded-md px-2 py-1 text-sm bg-coopmaths-warn-100 dark:bg-coopmathsdark-warn-dark"
                      >
                        Le navigateur a bloqué l'ouverture de certains onglets.
                        Cliquer sur chaque vue ou autoriser les fenêtres
                        surgissantes pour ce site (sous Safari : Réglages &gt;
                        Sites web &gt; Fenêtres surgissantes).
                      </p>
                    {/if}
                  {/if}
                </li>
              {/each}
            </ul>
            {#if pages > 1}
              <nav
                class="flex flex-row items-center justify-center gap-4 mt-3"
                aria-label="Pagination - {colonne.titre}"
              >
                <button
                  type="button"
                  class="disabled:opacity-30 text-coopmaths-action dark:text-coopmathsdark-action"
                  disabled={colonne.page === 0}
                  aria-label="Page précédente"
                  on:click={() => colonne.setPage(colonne.page - 1)}
                >
                  <i aria-hidden="true" class="bx bx-chevron-left text-3xl"></i>
                </button>
                <span class="text-sm">Page {colonne.page + 1} / {pages}</span>
                <button
                  type="button"
                  class="disabled:opacity-30 text-coopmaths-action dark:text-coopmathsdark-action"
                  disabled={colonne.page >= pages - 1}
                  aria-label="Page suivante"
                  on:click={() => colonne.setPage(colonne.page + 1)}
                >
                  <i aria-hidden="true" class="bx bx-chevron-right text-3xl"
                  ></i>
                </button>
              </nav>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <Footer />
</main>
