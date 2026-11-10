<script lang="ts">
  /**
   * Onglet Salons : connexion, inscription avec une invitation, salons de la
   * personne et changement de mot de passe. Les salons et les invitations sont
   * gérés par l'administrateur sur le serveur. Les parcours des salons
   * apparaissent dans l'onglet Parcours, à côté de ceux du navigateur.
   */
  import { untrack } from 'svelte'
  import {
    PASSWORD_RULE,
    changePassword,
    invitationInfo,
    joinWithInvitation,
    login,
    logout,
    salonMembers,
    signUp,
    strongPassword,
    type Account,
    type Member,
  } from '../../../../lib/parcours/salon/salonApi'

  let {
    account,
    invitation = '',
    onaccount,
  }: {
    account: Account | null
    invitation?: string // code reçu dans le lien (?invitation=…)
    onaccount: (a: Account | null) => void
  } = $props()

  const label =
    'block text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct'
  const field =
    'w-full rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-3 py-2 text-coopmaths-corpus dark:text-coopmathsdark-corpus focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action'
  const primary =
    'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest disabled:opacity-40'
  const link =
    'inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest disabled:opacity-40'
  const quiet =
    'text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'
  const card =
    'flex flex-col gap-3 rounded-xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'
  const title = 'font-bold text-coopmaths-struct dark:text-coopmathsdark-struct'

  let error = $state('')
  let notice = $state('')
  let busy = $state(false)
  async function run(action: () => Promise<void>) {
    error = ''
    notice = ''
    busy = true
    try {
      await action()
    } catch (e) {
      error = (e as Error).message
    } finally {
      busy = false
    }
  }

  // ---------- Sans compte ----------
  // Avec un code d'invitation, on crée d'abord son compte
  let mode: 'login' | 'signup' = $state(
    untrack(() => (invitation ? 'signup' : 'login')),
  )
  let nom = $state('')
  let password = $state('')
  let password2 = $state('')
  let code = $state(untrack(() => invitation))
  let invitedTo: string | null = $state(null)
  $effect(() => {
    const c = code.trim()
    invitedTo = null
    if (!c) return
    invitationInfo(c)
      .then((i) => (invitedTo = i.salon?.nom ?? ''))
      .catch(() => (invitedTo = null))
  })

  // ---------- Avec un compte ----------
  let members: Record<string, Member[]> = $state({})
  let changing = $state(false)
  let current = $state('')
  let next = $state('')
  let next2 = $state('')
  const joinable = $derived(
    !!invitation &&
      !!invitedTo &&
      !account?.salons.some((s) => s.nom === invitedTo),
  )
</script>

{#snippet passwordFields(
  value: string,
  confirm: string,
  set: (v: string) => void,
  setConfirm: (v: string) => void,
)}
  <label
    ><span class={label}>Mot de passe</span><input
      class={field}
      type="password"
      autocomplete="new-password"
      {value}
      oninput={(e) => set(e.currentTarget.value)}
    /></label
  >
  <label
    ><span class={label}>Mot de passe, une seconde fois</span><input
      class={field}
      type="password"
      autocomplete="new-password"
      value={confirm}
      oninput={(e) => setConfirm(e.currentTarget.value)}
    /></label
  >
  <p class={quiet}>
    {#if value && !strongPassword(value)}Il faut {PASSWORD_RULE}.
    {:else if confirm && confirm !== value}Les deux mots de passe diffèrent.
    {:else}Le mot de passe contient {PASSWORD_RULE}.{/if}
  </p>
{/snippet}

<section class="flex flex-col gap-6 max-w-xl" aria-label="Salons">
  {#if error}
    <p
      class="rounded-lg px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
      role="alert"
    >
      {error}
    </p>
  {/if}
  {#if notice}<p role="status">{notice}</p>{/if}

  {#if !account}
    <p class={quiet}>
      Dans un salon, l’équipe modifie les mêmes parcours en même temps, voit qui
      est là, commente et discute. On y entre sur invitation.
    </p>
    {#if mode === 'login'}
      <form
        class={card}
        onsubmit={(e) => {
          e.preventDefault()
          void run(async () => onaccount(await login(nom, password)))
        }}
      >
        <h3 class={title}>Se connecter</h3>
        <label
          ><span class={label}>Nom</span><input
            class={field}
            autocomplete="username"
            bind:value={nom}
          /></label
        >
        <label
          ><span class={label}>Mot de passe</span><input
            class={field}
            type="password"
            autocomplete="current-password"
            bind:value={password}
          /></label
        >
        <div class="flex flex-row flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="submit"
            class={primary}
            disabled={busy || !nom || !password}>Se connecter</button
          >
          <button type="button" class={link} onclick={() => (mode = 'signup')}
            >J’ai reçu une invitation</button
          >
        </div>
      </form>
    {:else}
      <form
        class={card}
        onsubmit={(e) => {
          e.preventDefault()
          void run(async () =>
            onaccount(await signUp(code.trim(), nom, password)),
          )
        }}
      >
        <h3 class={title}>Créer son compte</h3>
        <label
          ><span class={label}>Code d’invitation</span><input
            class={field}
            bind:value={code}
          /></label
        >
        {#if invitedTo}<p class={quiet}>Salon : {invitedTo}</p>{/if}
        <label
          ><span class={label}>Nom (vu par les collègues)</span><input
            class={field}
            autocomplete="username"
            bind:value={nom}
          /></label
        >
        {@render passwordFields(
          password,
          password2,
          (v) => (password = v),
          (v) => (password2 = v),
        )}
        <div class="flex flex-row flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="submit"
            class={primary}
            disabled={busy ||
              !code.trim() ||
              nom.trim().length < 2 ||
              !strongPassword(password) ||
              password !== password2}>Créer le compte</button
          >
          <button type="button" class={link} onclick={() => (mode = 'login')}
            >J’ai déjà un compte</button
          >
        </div>
      </form>
    {/if}
  {:else}
    <div class="flex flex-row flex-wrap items-center justify-between gap-3">
      <p>
        Connecté : <span class={title}>{account.nom}</span>
      </p>
      <div class="flex flex-row flex-wrap gap-x-6 gap-y-2">
        <button
          type="button"
          class={link}
          onclick={() => (changing = !changing)}
          ><i class="bx bx-key" aria-hidden="true"></i> Changer de mot de passe</button
        >
        <button
          type="button"
          class={link}
          onclick={() =>
            run(async () => {
              await logout()
              onaccount(null)
            })}
          ><i class="bx bx-log-out" aria-hidden="true"></i> Se déconnecter</button
        >
      </div>
    </div>

    {#if changing}
      <form
        class={card}
        onsubmit={(e) => {
          e.preventDefault()
          void run(async () => {
            await changePassword(current, next)
            current = next = next2 = ''
            changing = false
            notice =
              'Mot de passe changé. Les autres appareils sont déconnectés.'
          })
        }}
      >
        <h3 class={title}>Changer de mot de passe</h3>
        <label
          ><span class={label}>Mot de passe actuel</span><input
            class={field}
            type="password"
            autocomplete="current-password"
            bind:value={current}
          /></label
        >
        {@render passwordFields(
          next,
          next2,
          (v) => (next = v),
          (v) => (next2 = v),
        )}
        <button
          type="submit"
          class="{primary} self-start"
          disabled={busy || !current || !strongPassword(next) || next !== next2}
          >Enregistrer</button
        >
      </form>
    {/if}

    {#if joinable}
      <div class={card}>
        <p>Invitation au salon « {invitedTo} ».</p>
        <button
          type="button"
          class="{primary} self-start"
          disabled={busy}
          onclick={() =>
            run(async () => onaccount(await joinWithInvitation(invitation)))}
          >Rejoindre le salon</button
        >
      </div>
    {/if}

    <div class="flex flex-col gap-3">
      <h3 class={title}>Mes salons</h3>
      {#if !account.salons.length}
        <p class={quiet}>Aucun salon pour l’instant.</p>
      {/if}
      {#each account.salons as s (s.id)}
        <div class={card}>
          <span
            class="font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
            >{s.nom}</span
          >
          {#if s.description}<p class={quiet}>{s.description}</p>{/if}
          {#if members[s.id]}
            <p class="text-sm">{members[s.id].map((m) => m.nom).join(', ')}</p>
          {:else}
            <button
              type="button"
              class="{link} self-start"
              onclick={() =>
                run(async () => {
                  members[s.id] = await salonMembers(s.id)
                })}
              ><i class="bx bx-group" aria-hidden="true"></i> Membres</button
            >
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</section>
