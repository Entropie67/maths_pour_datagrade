<script lang="ts">
  import { buildExamExercices } from '../../../lib/LatexGroup'
  import type {
    ExamConfig,
    ExerciceConfig,
    LatexFileInfos,
  } from '../../../lib/LatexTypes'
  import type { IExercice, IExerciceStatique } from '../../../lib/types'
  import SelectUnique from '../../shared/forms/SelectUnique.svelte'

  // Props
  let {
    exercices = [],
    latexFileInfos = $bindable(),
  }: {
    exercices?: (IExercice | IExerciceStatique)[]
    latexFileInfos: LatexFileInfos
  } = $props()

  let modele: 'aucun' | 'Brevet' | 'Bac' | 'DS' = $state(
    latexFileInfos?.modele ?? 'Brevet',
  )

  // svelte-ignore state_referenced_locally
  const snapshotExercices = buildExamExercices(exercices, latexFileInfos)

  let examConfig: ExamConfig = $state(
    cloneExamConfig(
      latexFileInfos?.examConfig ?? {
        type: '',
        titre: '',
        session: '',
        matiere: '',
        duree: '',
        autorisation: '',
        exercices: snapshotExercices,
      },
    ),
  )
  const modeleOptions = [
    { label: '(aucune)', value: '' },
    { label: 'Brevet', value: 'Brevet' },
    { label: 'Bac', value: 'Bac' },
    { label: 'DS', value: 'DS' },
  ]

  // -----------------------------
  // State - Rendre l'objet entier réactif avec $state
  // -----------------------------
  // Fonction pour cloner l'examConfig de manière profonde et supprimer le proxy svelte5
  function cloneExamConfig(config: any) {
    return {
      ...config,
      exercices: (config.exercices ?? []).map((e: ExerciceConfig) => ({
        ...e,
      })),
    }
  }

  handleModeleChange()

  // -----------------------------
  // Functions
  // -----------------------------
  function update() {
    // onChange?.(examConfig)
  }

  function addExercice() {
    examConfig.exercices = [...(examConfig.exercices ?? []), { points: 1 }]
    update()
  }

  function removeExercice(index: number) {
    examConfig.exercices = (examConfig.exercices ?? []).filter(
      (_: ExerciceConfig, i: number) => i !== index,
    )
    update()
  }

  function submit() {
    latexFileInfos.examConfig = cloneExamConfig(examConfig)
    latexFileInfos.modele = modele
  }

  // Fonction pour générer la date courante au format "Mois Année"
  function getCurrentSession(): string {
    const date = new Date()
    const mois = date.toLocaleDateString('fr-FR', { month: 'long' })
    const annee = date.getFullYear()

    // Première lettre en majuscule
    return `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${annee}`
  }

  // Fonction pour gérer le changement de modèle
  function handleModeleChange(newModele: string = modele) {
    modele = newModele as typeof modele

    // Mettre à jour d'autres variables selon le modèle choisi
    switch (newModele) {
      case 'Brevet':
        examConfig.titre = examConfig.titre || 'Brevet des collèges'
        examConfig.duree = examConfig.duree || '2 heures'
        examConfig.session = examConfig.session || getCurrentSession()
        examConfig.matiere = examConfig.matiere || 'MATHÉMATIQUES'
        examConfig.autorisation =
          examConfig.autorisation || "L'usage de la calculatrice est autorisé."
        examConfig.type = 'Brevet'
        break
      case 'Bac':
        examConfig.titre = examConfig.titre || 'Baccalauréat'
        examConfig.duree = examConfig.duree || '4 heures'
        examConfig.type = 'Bac'
        break
      case 'DS':
        examConfig.titre = examConfig.titre || 'Devoir surveillé'
        examConfig.duree = examConfig.duree || '1 heure'
        examConfig.type = 'DS'
        break
      case 'aucun':
      case '':
        // Ne pas écraser si l'utilisateur a déjà saisi quelque chose
        break
    }
  }

  function reinit() {
    modele = 'aucun'
    examConfig.type = ''
    examConfig.titre = ''
    examConfig.session = ''
    examConfig.matiere = ''
    examConfig.duree = ''
    examConfig.autorisation = ''
    examConfig.exercices = snapshotExercices
  }
</script>

<h2>Configuration de l'épreuve</h2>

<!-- Boutons de réinitialisation -->
<div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
  <button type="button" onclick={reinit} class="secondary">
    ↩ Réinitialiser
  </button>
</div>

<div class="grid">
  <label>
    Type <SelectUnique
      id="modele-latex"
      bind:value={modele}
      on:change={(e) => handleModeleChange(e.detail)}
      options={modeleOptions}
    />
  </label>
  <label> Titre <input class="w-full" bind:value={examConfig.titre} /> </label>
  <label>
    Session <input class="w-full" bind:value={examConfig.session} />
  </label>

  <label>
    Matière
    <input class="w-full" bind:value={examConfig.matiere} />
  </label>

  <label>
    Durée
    <input class="w-full" bind:value={examConfig.duree} />
  </label>
</div>

<label>
  Autorisation
  <textarea class="w-full" bind:value={examConfig.autorisation}></textarea>
</label>

<h3>Exercices</h3>

{#each examConfig.exercices as exo, i (i)}
  <div class="exo flex flex-row items-center gap-2 w-60">
    <label for="points-{i}" class="w-40"> Groupe {i + 1} </label>
    <input
      id="points-{i}"
      type="number"
      class="w-20"
      step="0.5"
      bind:value={exo.points}
    />
    pts
    <button type="button" onclick={() => removeExercice(i)}>✖</button>
  </div>
{/each}

<button type="button" onclick={addExercice}>+ Ajouter un exercice</button>

<hr />

<div class="flex gap-2 mt-3">
  <button
    class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500"
    onclick={submit}>Appliquer</button
  >
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .exo {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  textarea {
    width: 100%;
  }
</style>
