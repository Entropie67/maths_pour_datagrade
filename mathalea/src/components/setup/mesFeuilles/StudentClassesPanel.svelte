<script lang="ts">
  import { normalize } from '../../../lib/mesFeuilles/library'
  import {
    addStudentClass,
    deleteStudentClass,
    drawProbabilities,
    parseStudentNames,
    renameStudentClass,
    resetStudentDraws,
    setStudentDraws,
    setStudentNames,
    sortedStudentClasses,
    studentNamesText,
    type StudentClass,
    type StudentClasses,
  } from '../../../lib/mesFeuilles/studentClasses'
  import SheetDialog from './SheetDialog.svelte'
  import {
    dangerButton,
    iconButton,
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from './styles'

  /**
   * Classes du widget « Tirage au sort » de la vue TBI, dans « Mes
   * sauvegardes » : liste des élèves de chaque classe, nombre de fois où
   * chacun a été tiré au sort et chance de l'être au prochain tirage.
   */
  interface Props {
    classes: StudentClasses
    /** Recherche de la vue (noms des classes et des élèves) */
    search: string
    /** Enregistre les classes modifiées */
    onchange: (update: (value: StudentClasses) => StudentClasses) => void
    formatDate: (iso: string) => string
  }

  let { classes, search, onchange, formatDate }: Props = $props()

  const percent = new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    maximumFractionDigits: 1,
  })

  const sorted = $derived(sortedStudentClasses(classes))
  const shown = $derived.by(() => {
    const words = normalize(search)
      .split(' ')
      .filter((word) => word !== '')
    return sorted.filter((studentClass) => {
      const text = normalize(
        `${studentClass.name} ${studentClass.students.map((s) => s.name).join(' ')}`,
      )
      return words.every((word) => text.includes(word))
    })
  })

  // fenêtres
  let isCreating = $state(false)
  let newName = $state('')
  let newStudents = $state('')
  const parsedNew = $derived(parseStudentNames(newStudents))
  /** Classe dont on modifie la liste des élèves */
  let editing = $state<StudentClass | null>(null)
  let editText = $state('')
  const parsedEdit = $derived(parseStudentNames(editText))
  let deleting = $state<StudentClass | null>(null)
  let resetting = $state<StudentClass | null>(null)
  // renommage en place
  let renamingId = $state('')
  let renameValue = $state('')
  /** Classes dépliées */
  let openIds = $state(new Set<string>())

  function isOpen(studentClass: StudentClass): boolean {
    return openIds.has(studentClass.id) || shown.length === 1
  }

  function toggle(id: string, open: boolean) {
    const next = new Set(openIds)
    if (open) next.add(id)
    else next.delete(id)
    openIds = next
  }

  function openCreate() {
    newName = ''
    newStudents = ''
    isCreating = true
  }

  function create() {
    if (parsedNew.length === 0) return
    const name = newName
    const names = parsedNew
    let id = ''
    onchange((value) => {
      const added = addStudentClass(value, name, names)
      id = added.studentClass.id
      return added.classes
    })
    isCreating = false
    toggle(id, true)
  }

  function openEdit(studentClass: StudentClass) {
    editing = studentClass
    editText = studentNamesText(studentClass)
  }

  function saveEdit() {
    const studentClass = editing
    editing = null
    if (studentClass === null) return
    const names = parsedEdit
    onchange((value) => setStudentNames(value, studentClass.id, names))
  }

  function startRename(studentClass: StudentClass) {
    renamingId = studentClass.id
    renameValue = studentClass.name
  }

  function commitRename(studentClass: StudentClass) {
    if (renamingId === '') return
    const value = renameValue.trim()
    renamingId = ''
    if (value === '' || value === studentClass.name) return
    onchange((classes) => renameStudentClass(classes, studentClass.id, value))
  }

  function changeDraws(studentClass: StudentClass, name: string, draws: number) {
    onchange((value) => setStudentDraws(value, studentClass.id, name, draws))
  }

  function removeStudent(studentClass: StudentClass, name: string) {
    onchange((value) =>
      setStudentNames(
        value,
        studentClass.id,
        studentClass.students.map((s) => s.name).filter((n) => n !== name),
      ),
    )
  }

  function confirmReset() {
    const studentClass = resetting
    resetting = null
    if (studentClass !== null) {
      onchange((value) => resetStudentDraws(value, studentClass.id))
    }
  }

  function confirmDelete() {
    const studentClass = deleting
    deleting = null
    if (studentClass !== null) {
      onchange((value) => deleteStudentClass(value, studentClass.id))
    }
  }

  function totalDraws(studentClass: StudentClass): number {
    return studentClass.students.reduce((sum, s) => sum + s.draws, 0)
  }
</script>

<div class="flex flex-row flex-wrap items-center gap-3">
  <h2
    class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    <i class="bx bx-group" aria-hidden="true"></i> Classes
  </h2>
  <span class={quietText}>
    {classes.classes.length} classe{classes.classes.length > 1 ? 's' : ''}
  </span>
  <span class="grow"></span>
  <button
    type="button"
    class="{primaryButton} py-1 text-sm"
    onclick={openCreate}
  >
    <i class="bx bx-plus" aria-hidden="true"></i> Nouvelle classe
  </button>
</div>
<p class={quietText}>
  Les classes du widget « Tirage au sort » de la vue vidéoprojecteur. Moins un
  élève a été tiré au sort, plus il a de chances de l’être au prochain tirage.
  Les prénoms ne quittent pas ce navigateur, sauf dans le fichier que vous
  exportez.
</p>

{#if classes.classes.length === 0}
  <div
    class="flex flex-col items-start gap-2 max-w-2xl rounded-xl px-6 py-5 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <p class="font-semibold">Aucune classe pour l’instant.</p>
    <p class={quietText}>
      Créer une classe ici ou depuis le widget « Tirage au sort » de la vue
      vidéoprojecteur.
    </p>
  </div>
{:else if shown.length === 0}
  <p class={quietText}>Aucune classe ne correspond à la recherche.</p>
{:else}
  <div class="flex flex-col gap-3">
    {#each shown as studentClass (studentClass.id)}
      {@const probabilities = drawProbabilities(studentClass.students)}
      <details
        class="rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
        open={isOpen(studentClass)}
        ontoggle={(event) => toggle(studentClass.id, event.currentTarget.open)}
      >
        <summary
          class="flex flex-row flex-wrap items-center gap-3 px-4 py-3 cursor-pointer select-none"
        >
          <i
            class="bx bx-group text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
            aria-hidden="true"
          ></i>
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            {#if renamingId === studentClass.id}
              <!-- svelte-ignore a11y_autofocus -->
              <input
                type="text"
                class="{textInput} py-1"
                aria-label="Nouveau nom"
                maxlength="200"
                autofocus
                bind:value={renameValue}
                onclick={(event) => event.preventDefault()}
                onkeydown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    commitRename(studentClass)
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    renamingId = ''
                  } else if (event.key === ' ') {
                    // l'espace replierait la classe
                    event.stopPropagation()
                  }
                }}
                onkeyup={(event) => event.preventDefault()}
                onblur={() => commitRename(studentClass)}
              />
            {:else}
              <h3 class="font-semibold">{studentClass.name}</h3>
            {/if}
            <span class={quietText}>
              {studentClass.students.length} élève{studentClass.students
                .length > 1
                ? 's'
                : ''} · {totalDraws(studentClass)} tirage{totalDraws(
                studentClass,
              ) > 1
                ? 's'
                : ''} · modifiée le {formatDate(studentClass.updatedAt)}
            </span>
          </div>
          <span class="flex flex-row">
            <button
              type="button"
              class={iconButton}
              title="Renommer"
              aria-label="Renommer {studentClass.name}"
              onclick={(event) => {
                event.preventDefault()
                startRename(studentClass)
              }}
            >
              <i class="bx bx-rename text-lg"></i>
            </button>
            <button
              type="button"
              class={iconButton}
              title="Supprimer"
              aria-label="Supprimer {studentClass.name}"
              onclick={(event) => {
                event.preventDefault()
                deleting = studentClass
              }}
            >
              <i class="bx bx-trash text-lg"></i>
            </button>
          </span>
        </summary>
        <div class="flex flex-col gap-3 px-4 pb-4">
          <div class="flex flex-row flex-wrap gap-2">
            <button
              type="button"
              class="{secondaryButton} py-1 text-sm"
              onclick={() => openEdit(studentClass)}
            >
              <i class="bx bx-edit" aria-hidden="true"></i> Modifier la liste des
              élèves
            </button>
            <button
              type="button"
              class="{secondaryButton} py-1 text-sm"
              disabled={totalDraws(studentClass) === 0}
              onclick={() => (resetting = studentClass)}
            >
              <i class="bx bx-reset" aria-hidden="true"></i> Remettre les compteurs
              à zéro
            </button>
          </div>
          {#if studentClass.students.length === 0}
            <p class={quietText}>Cette classe n’a aucun élève.</p>
          {:else}
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl text-sm">
                <thead>
                  <tr
                    class="text-left border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
                  >
                    <th class="py-1 pr-3 font-semibold">Élève</th>
                    <th class="py-1 pr-3 font-semibold">Tirages</th>
                    <th
                      class="py-1 pr-3 font-semibold"
                      title="Chance d’être tiré au sort au prochain tirage"
                      >Prochain tirage</th
                    >
                    <th class="py-1"><span class="sr-only">Retirer</span></th>
                  </tr>
                </thead>
                <tbody>
                  {#each studentClass.students as student, i (student.name)}
                    <tr
                      class="border-b border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
                    >
                      <td class="py-1 pr-3">{student.name}</td>
                      <td class="py-1 pr-3">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          class="{textInput} max-w-20 py-0.5"
                          aria-label="Nombre de tirages de {student.name}"
                          value={student.draws}
                          onchange={(event) =>
                            changeDraws(
                              studentClass,
                              student.name,
                              event.currentTarget.valueAsNumber,
                            )}
                        />
                      </td>
                      <td class="py-1 pr-3">
                        <span class="flex flex-row items-center gap-2">
                          <span
                            class="h-1.5 w-16 overflow-hidden rounded-full bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
                            aria-hidden="true"
                          >
                            <span
                              class="block h-full bg-coopmaths-action dark:bg-coopmathsdark-action"
                              style="width: {Math.min(
                                100,
                                probabilities[i] *
                                  studentClass.students.length *
                                  50,
                              )}%"
                            ></span>
                          </span>
                          {percent.format(probabilities[i])}
                        </span>
                      </td>
                      <td class="py-1 text-right">
                        <button
                          type="button"
                          class={iconButton}
                          title="Retirer de la classe"
                          aria-label="Retirer {student.name} de la classe"
                          onclick={() =>
                            removeStudent(studentClass, student.name)}
                        >
                          <i class="bx bx-x text-lg"></i>
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      </details>
    {/each}
  </div>
{/if}

<SheetDialog
  open={isCreating}
  title="Nouvelle classe"
  onclose={() => (isCreating = false)}
>
  <form
    class="flex flex-col gap-4"
    onsubmit={(event) => {
      event.preventDefault()
      create()
    }}
  >
    <label class="flex flex-col gap-1 text-sm">
      Nom de la classe
      <!-- svelte-ignore a11y_autofocus -->
      <input
        type="text"
        class={textInput}
        maxlength="200"
        placeholder="5e B"
        autofocus
        bind:value={newName}
      />
    </label>
    <label class="flex flex-col gap-1 text-sm">
      Élèves
      <textarea
        class="{textInput} min-h-48 font-mono text-sm"
        placeholder={'Alice\nBastien\nChloé\n…'}
        bind:value={newStudents}
      ></textarea>
    </label>
    <p class={quietText}>
      Un élève par ligne, ou séparés par des virgules ou des points-virgules.
      {#if parsedNew.length > 0}
        <strong
          >{parsedNew.length} élève{parsedNew.length > 1 ? 's' : ''}.</strong
        >
      {/if}
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (isCreating = false)}>Annuler</button
      >
      <button
        type="submit"
        class={primaryButton}
        disabled={parsedNew.length === 0}
      >
        <i class="bx bx-check" aria-hidden="true"></i> Créer
      </button>
    </div>
  </form>
</SheetDialog>

<SheetDialog
  open={editing !== null}
  title="Élèves de « {editing?.name ?? ''} »"
  onclose={() => (editing = null)}
>
  <form
    class="flex flex-col gap-4"
    onsubmit={(event) => {
      event.preventDefault()
      saveEdit()
    }}
  >
    <label class="flex flex-col gap-1 text-sm">
      Élèves
      <textarea
        class="{textInput} min-h-64 font-mono text-sm"
        bind:value={editText}
      ></textarea>
    </label>
    <p class={quietText}>
      Un élève par ligne, ou séparés par des virgules ou des points-virgules.
      <strong
        >{parsedEdit.length} élève{parsedEdit.length > 1 ? 's' : ''}.</strong
      >
      Un élève qui reste dans la liste garde son nombre de tirages ; un élève renommé
      repart de zéro.
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (editing = null)}>Annuler</button
      >
      <button type="submit" class={primaryButton}>
        <i class="bx bx-check" aria-hidden="true"></i> Enregistrer
      </button>
    </div>
  </form>
</SheetDialog>

<SheetDialog
  open={resetting !== null}
  title="Remettre les compteurs à zéro ?"
  onclose={() => (resetting = null)}
>
  <div class="flex flex-col gap-4">
    <p>
      Les nombres de tirages des élèves de « {resetting?.name ?? ''} » seront remis
      à zéro : tous auront de nouveau la même chance d’être tirés au sort.
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (resetting = null)}>Annuler</button
      >
      <button type="button" class={dangerButton} onclick={confirmReset}>
        <i class="bx bx-reset" aria-hidden="true"></i> Remettre à zéro
      </button>
    </div>
  </div>
</SheetDialog>

<SheetDialog
  open={deleting !== null}
  title="Supprimer cette classe ?"
  onclose={() => (deleting = null)}
>
  <div class="flex flex-col gap-4">
    <p>
      La classe « {deleting?.name ?? ''} » et ses compteurs de tirages seront supprimés
      de ce navigateur. Cette action est définitive, sauf si vous avez exporté vos
      sauvegardes.
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (deleting = null)}>Annuler</button
      >
      <button type="button" class={dangerButton} onclick={confirmDelete}>
        <i class="bx bx-trash" aria-hidden="true"></i> Supprimer
      </button>
    </div>
  </div>
</SheetDialog>
