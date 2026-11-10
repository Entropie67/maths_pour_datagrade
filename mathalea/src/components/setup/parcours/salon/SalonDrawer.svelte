<script lang="ts">
  /**
   * Volet d'un salon, à droite de l'éditeur : discussion de l'équipe et
   * commentaires sur les éléments du parcours (ou de la fiche) ouvert.
   */
  import { tick, type Snippet } from 'svelte'
  import type { SalonSnapshot } from '../../../../lib/parcours/salon/salonPresence'
  import { initials } from '../../../../lib/parcours/salon/salonPresence'
  import { splitMentions } from '../../../../lib/parcours/salon/mentions'
  import MentionField from './MentionField.svelte'

  let {
    snapshot,
    docId,
    members = [],
    discussionMentions = 0,
    describe,
    whole,
    tab = $bindable('commentaires'),
    element = $bindable(null),
    onmessage,
    oncomment,
    onresolve,
    onshow,
    onclose,
    versions,
  }: {
    snapshot: SalonSnapshot
    docId: string // parcours ou fiche ouvert
    members?: string[] // noms des membres du salon (mentions « @Nom »)
    discussionMentions?: number // mentions pas encore lues dans la discussion
    describe: (element: string) => string // nom d'un élément
    whole: string // « Tout le parcours », « Toute la fiche »
    tab?: 'discussion' | 'commentaires' | 'versions'
    element?: string | null // commentaires d'un seul élément
    onmessage: (texte: string) => void
    oncomment: (element: string, texte: string, parent?: string) => void
    onshow?: (element: string) => void // amène l'élément à l'écran (exercice ouvert)
    onresolve: (id: string, resolu: boolean) => void
    onclose: () => void
    versions?: Snippet // onglet Versions (parcours seulement)
  } = $props()

  const field =
    'w-full rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-3 py-2 text-coopmaths-corpus dark:text-coopmathsdark-corpus focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action'
  const link =
    'inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest disabled:opacity-40'
  const quiet =
    'text-xs text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'
  const tabClass = (on: boolean) =>
    `flex-1 px-3 py-2 text-sm font-semibold border-b-2 ${
      on
        ? 'border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-struct dark:text-coopmathsdark-struct'
        : 'border-transparent text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light hover:text-coopmaths-struct dark:hover:text-coopmathsdark-struct'
    }`

  /** Commentaires de cet élément, et l'élément ouvert dans l'éditeur */
  function show(el: string) {
    element = el
    onshow?.(el)
  }

  const when = (iso: string) => {
    const d = new Date(iso)
    const today = new Date().toDateString() === d.toDateString()
    return today
      ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  // Conversations : un premier commentaire et ses réponses ; « Résolu » vaut
  // pour toute la conversation
  let showResolved = $state(false)
  const threads = $derived(
    snapshot.comments.filter(
      (c) =>
        c.parcours === docId &&
        !c.parent &&
        (element === null || c.element === element),
    ),
  )
  const comments = $derived(threads.filter((c) => showResolved || !c.resolu))
  const resolvedCount = $derived(threads.filter((c) => c.resolu).length)
  const repliesTo = (id: string) =>
    snapshot.comments.filter((c) => c.parent === id)
  let replyTo: string | null = $state(null)
  let replyDraft = $state('')
  function sendReply(root: { id: string; element: string }) {
    if (!replyDraft.trim()) return
    oncomment(root.element, replyDraft, root.id)
    replyDraft = ''
    replyTo = null
  }

  let draft = $state('')
  let messageDraft = $state('')
  function sendComment() {
    if (!draft.trim()) return
    oncomment(element ?? 'parcours', draft)
    draft = ''
  }
  function sendMessage() {
    if (!messageDraft.trim()) return
    onmessage(messageDraft)
    messageDraft = ''
  }
  let messagesBox: HTMLElement | undefined = $state()
  const color = (nom: string) =>
    nom === snapshot.me.nom
      ? snapshot.me.couleur
      : (snapshot.presences.find((p) => p.nom === nom)?.couleur ?? '#64748b')

  // Noms qu'on peut mentionner : membres du salon, et ceux déjà vus ici
  const names = $derived([
    ...new Set([
      ...members,
      snapshot.me.nom,
      ...snapshot.presences.map((p) => p.nom),
      ...snapshot.comments.map((c) => c.auteur),
      ...snapshot.messages.map((m) => m.auteur),
    ]),
  ])
  const isMe = (nom: string) =>
    nom.toLocaleLowerCase('fr') === snapshot.me.nom.toLocaleLowerCase('fr')

  // La discussion s'ouvre sur les derniers messages
  $effect(() => {
    void snapshot.messages.length
    if (tab !== 'discussion') return
    void tick().then(() =>
      messagesBox?.scrollTo({ top: messagesBox.scrollHeight }),
    )
  })
</script>

{#snippet rich(texte: string)}
  <p class="text-sm whitespace-pre-wrap break-words">
    {#each splitMentions(texte, names) as part, k (k)}{#if part.mention}<span
          class="font-semibold rounded px-0.5 {isMe(part.mention)
            ? 'bg-coopmaths-action text-coopmaths-canvas dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas'
            : 'text-coopmaths-action dark:text-coopmathsdark-action'}"
          >{part.text}</span
        >{:else}{part.text}{/if}{/each}
  </p>
{/snippet}

{#snippet avatar(nom: string)}
  <span
    class="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
    style="background-color: {color(nom)}"
    title={nom}>{initials(nom)}</span
  >
{/snippet}

<aside
  class="flex flex-col h-full min-h-0 rounded-xl border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  aria-label="Discussion, commentaires et versions"
>
  <div class="flex flex-row items-center">
    <div class="flex-1 flex flex-row" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'commentaires'}
        class={tabClass(tab === 'commentaires')}
        onclick={() => (tab = 'commentaires')}>Commentaires</button
      >
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'discussion'}
        class={tabClass(tab === 'discussion')}
        onclick={() => (tab = 'discussion')}
        >Discussion{#if discussionMentions}<span
            class="ml-1 rounded-full px-1.5 text-xs font-bold bg-coopmaths-action text-coopmaths-canvas dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas"
            aria-label="{discussionMentions} mention{discussionMentions > 1
              ? 's'
              : ''} pour vous">@{discussionMentions}</span
          >{/if}</button
      >
      {#if versions}
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'versions'}
          class={tabClass(tab === 'versions')}
          onclick={() => (tab = 'versions')}>Versions</button
        >
      {/if}
    </div>
    <button
      type="button"
      class="px-3 text-coopmaths-action dark:text-coopmathsdark-action"
      aria-label="Fermer le volet"
      onclick={onclose}
      ><i class="bx bx-x text-2xl" aria-hidden="true"></i></button
    >
  </div>

  {#if tab === 'versions' && versions}
    {@render versions()}
  {:else if tab === 'commentaires'}
    <div class="flex flex-row flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-3">
      {#if element}
        <span class="text-sm font-semibold"
          >{describe(element)}</span
        >
        <button type="button" class={link} onclick={() => (element = null)}
          >{whole}</button
        >
      {:else}
        <span class="text-sm font-semibold">{whole}</span>
      {/if}
      {#if resolvedCount}
        <button
          type="button"
          class="{link} ml-auto font-normal"
          aria-pressed={showResolved}
          onclick={() => (showResolved = !showResolved)}
          >{showResolved ? 'Masquer' : 'Afficher'} les résolus ({resolvedCount})</button
        >
      {/if}
    </div>
    <ul class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 px-4 py-3">
      {#each comments as c (c.id)}
        <!-- Clic à la souris n'importe où sur la conversation ; au clavier : le lien de l'élément -->
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
        <li
          class="flex flex-col gap-2 rounded-lg p-2 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark {c.resolu
            ? 'opacity-60'
            : ''} {c.element !== 'parcours'
            ? 'cursor-pointer hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest'
            : ''}"
          onclick={(e) => {
            if (c.element === 'parcours') return
            // Boutons, réponse en cours et texte sélectionné gardent leur rôle
            if ((e.target as HTMLElement).closest('button, a, form, textarea'))
              return
            if (window.getSelection()?.toString()) return
            show(c.element)
          }}
        >
          <div class="flex flex-row gap-2">
            {@render avatar(c.auteur)}
            <div class="min-w-0 flex-1">
              <p class={quiet}>
                {c.auteur} · {when(c.le)}{#if c.element !== 'parcours'}
                  · <button
                    type="button"
                    class="underline"
                    title="Montrer dans l’éditeur"
                    onclick={() => show(c.element)}>{describe(c.element)}</button
                  >{/if}
              </p>
              {@render rich(c.texte)}
            </div>
          </div>
          {#each repliesTo(c.id) as r (r.id)}
            <div class="flex flex-row gap-2 pl-6">
              {@render avatar(r.auteur)}
              <div class="min-w-0 flex-1">
                <p class={quiet}>{r.auteur} · {when(r.le)}</p>
                {@render rich(r.texte)}
              </div>
            </div>
          {/each}
          {#if replyTo === c.id}
            <form
              class="flex flex-col gap-2 pl-6"
              onsubmit={(e) => {
                e.preventDefault()
                sendReply(c)
              }}
            >
              <MentionField
                fieldClass={field}
                {names}
                label="Réponse à {c.auteur}"
                autofocus
                bind:value={replyDraft}
                onsubmit={() => sendReply(c)}
                onescape={() => (replyTo = null)}
              />
              <div class="flex flex-row gap-4">
                <button
                  type="submit"
                  class={link}
                  disabled={!replyDraft.trim()}>Répondre</button
                >
                <button
                  type="button"
                  class={link}
                  onclick={() => (replyTo = null)}>Annuler</button
                >
              </div>
            </form>
          {:else}
            <div class="flex flex-row gap-4 pl-9">
              <button
                type="button"
                class={link}
                onclick={() => {
                  replyTo = c.id
                  replyDraft = ''
                }}>Répondre</button
              >
              <button
                type="button"
                class={link}
                onclick={() => onresolve(c.id, !c.resolu)}
                >{c.resolu ? 'Rouvrir' : 'Résolu'}</button
              >
            </div>
          {/if}
        </li>
      {:else}
        <li class={quiet}>Aucun commentaire.</li>
      {/each}
    </ul>
    <form
      class="flex flex-col gap-2 p-4 border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
      onsubmit={(e) => {
        e.preventDefault()
        sendComment()
      }}
    >
      <MentionField
        fieldClass={field}
        {names}
        label="Commentaire sur : {describe(element ?? 'parcours')}"
        bind:value={draft}
        onsubmit={sendComment}
      />
      <div class="flex flex-row items-center justify-between gap-3">
        <span class={quiet}
          >Sur : {describe(element ?? 'parcours')}</span
        >
        <button type="submit" class="{link} shrink-0" disabled={!draft.trim()}
          >Commenter</button
        >
      </div>
    </form>
  {:else}
    <ul
      class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 px-4 py-3"
      bind:this={messagesBox}
    >
      {#each snapshot.messages as m (m.id)}
        <li class="flex flex-row gap-2">
          {@render avatar(m.auteur)}
          <div class="min-w-0">
            <p class={quiet}>{m.auteur} · {when(m.le)}</p>
            {@render rich(m.texte)}
          </div>
        </li>
      {:else}
        <li class={quiet}>Aucun message.</li>
      {/each}
    </ul>
    <form
      class="flex flex-row gap-2 p-4 border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
      onsubmit={(e) => {
        e.preventDefault()
        sendMessage()
      }}
    >
      <MentionField
        fieldClass={field}
        {names}
        multiline={false}
        label="Message à l’équipe du salon"
        bind:value={messageDraft}
        onsubmit={sendMessage}
      />
      <button
        type="submit"
        class="shrink-0 text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40"
        aria-label="Envoyer"
        disabled={!messageDraft.trim()}
        ><i class="bx bx-send text-2xl" aria-hidden="true"></i></button
      >
    </form>
  {/if}
</aside>
