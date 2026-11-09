<script lang="ts">
  import {
    mobileMenuSectionsForLocale,
    nodeCode,
    nodeLabel,
    resolveNode,
    sectionPath,
    splitChildren,
  } from '../../../lib/components/mobileMenu'
  import { exercicesParams } from '../../../lib/stores/generalStore'
  import { getLang } from '../../../lib/stores/languagesStore'
  import {
    isExerciceItemInReferentiel,
    isTool,
    type JSONReferentielEnding,
    type ReferentielInMenu,
  } from '../../../lib/types/referentiels'
  import MobileCarouselCards from '../start/presentationalComponents/carousel/MobileCarouselCards.svelte'
  import MobileEndingItem from './MobileEndingItem.svelte'
  import MobileSearch from './MobileSearch.svelte'
  import MobileTile from './MobileTile.svelte'

  /**
   * Navigation par tuiles de la vue mobile.
   *
   * Le chemin courant (`path`) est composé de l'identifiant de la rubrique
   * (`college`, `lycee`), puis de l'identifiant du niveau, puis des clés
   * successives dans le référentiel associé à ce niveau.
   */
  type Props = {
    path: string[]
    referentiels: ReferentielInMenu[]
    navigate: (path: string[]) => void
    addExercise: (ending: JSONReferentielEnding) => void
    /** Ouvre la recherche plein écran avec aperçu (Ctrl/Cmd+K mobile). */
    openSearch: () => void
  }

  const {
    path,
    referentiels,
    navigate,
    addExercise,
    openSearch,
  }: Props = $props()

  const lang = getLang()
  const mobileMenuSections = mobileMenuSectionsForLocale(lang)

  const section = $derived(mobileMenuSections.find((s) => s.id === path[0]))
  const entry = $derived(section?.entries.find((e) => e.id === path[1]))
  const node = $derived(
    entry === undefined
      ? undefined
      : resolveNode(referentiels, entry.referentiel, [
          ...entry.path,
          ...path.slice(2),
        ]),
  )
  const children = $derived(splitChildren(node))

  /**
   * Compte le nombre de fois où une ressource est déjà dans la sélection.
   * Les exercices MathALÉA et les outils sont distingués par leur `id` car
   * plusieurs références peuvent partager un même `uuid`.
   */
  function selectedCount(ending: JSONReferentielEnding): number {
    return $exercicesParams.filter((item) => {
      if (item.uuid !== ending.uuid) return false
      if (isExerciceItemInReferentiel(ending) || isTool(ending)) {
        return item.id === ending.id
      }
      return true
    }).length
  }
</script>

{#if path.length === 0}
  <!-- Accueil : actualités puis choix de la rubrique -->
  {#if lang === 'fr-FR'}
    <MobileCarouselCards />
  {/if}
  <div class="px-4 pt-4">
    <MobileSearch onOpen={openSearch} />
  </div>
  <div class="flex flex-col gap-3 p-4">
    {#each mobileMenuSections as menuSection (menuSection.id)}
      <MobileTile
        size="large"
        title={menuSection.title}
        subtitle={menuSection.subtitle}
        icon={menuSection.icon}
        onclick={() => navigate(sectionPath(menuSection))}
      />
    {/each}
  </div>
{:else if path.length === 1}
  <!-- Niveaux de la rubrique choisie -->
  <div class="flex flex-col gap-3 p-4">
    {#each section?.entries ?? [] as menuEntry (menuEntry.id)}
      <MobileTile
        title={menuEntry.title}
        onclick={() => navigate([...path, menuEntry.id])}
      />
    {/each}
  </div>
{:else}
  <!-- Thèmes, sous-thèmes puis exercices -->
  <div class="flex flex-col gap-3 p-4">
    {#if path.length === 2}
      {#each entry?.externalLinks ?? [] as link (link.url)}
        <MobileTile title={link.title} icon={link.icon} href={link.url} />
      {/each}
    {/if}
    {#each children.categories as key (key)}
      <MobileTile
        title={nodeLabel(key)}
        subtitle={nodeCode(key)}
        onclick={() => navigate([...path, key])}
      />
    {/each}
    {#if children.endings.length !== 0}
      <ul
        class="flex flex-col rounded-xl overflow-hidden
        border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
        divide-y divide-coopmaths-canvas-darkest dark:divide-coopmathsdark-canvas-darkest"
      >
        {#each children.endings as [key, ending] (key)}
          <MobileEndingItem
            {ending}
            count={selectedCount(ending)}
            onclick={() => addExercise(ending)}
          />
        {/each}
      </ul>
    {/if}
    {#if children.categories.length === 0 && children.endings.length === 0}
      <p
        class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
      >
        Aucun exercice dans cette rubrique pour le moment.
      </p>
    {/if}
  </div>
{/if}
