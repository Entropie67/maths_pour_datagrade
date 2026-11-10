<script lang="ts">
  import type { CanOptions } from '../../../../lib/types/can'
  import ButtonToggleAlt from '../../../shared/forms/ButtonToggleAlt.svelte'
  import FormRadio from '../../../shared/forms/FormRadio.svelte'
  import InputNumber from '../../../shared/forms/InputNumber.svelte'
  import InputText from '../../../shared/forms/InputText.svelte'
  import type { ReglagesEleveMode } from './types'

  export let canOptions: CanOptions
  export let mode: ReglagesEleveMode = 'lien'

  // Sans champ de saisie, il n'y a aucune réponse à corriger
  $: isFeedbackAvailable = mode !== 'lien' || canOptions.isInteractive

  $: labelClass = canOptions.isChoosen
    ? 'text-coopmaths-corpus-light dark:text-coopmathsdark-corpus'
    : 'text-coopmaths-corpus-light/10 dark:text-coopmathsdark-corpus/10'
</script>

<div class="pt-2 px-4 grid grid-flow-row md:grid-cols-2 gap-4">
  <div class="pb-2 w-full flex flex-col md:col-start-1 md:row-start-1">
    <div
      class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
    >
      Présentation
    </div>
    <div class="flex flex-col items-stretch space-y-2 px-4">
      <FormRadio
        title="can-timer-mode"
        bind:valueSelected={canOptions.timerMode}
        isDisabled={!canOptions.isChoosen || canOptions.isTimerDisabled}
        labelsValues={[
          { label: 'Temps global pour toute la course.', value: 'global' },
          {
            label: 'Temps par question (on ne peut pas revenir en arrière).',
            value: 'question',
          },
        ]}
      />
      <div class="flex flex-row items-center">
        <div
          class="w-24 shrink-0 whitespace-nowrap text-sm font-light {labelClass}"
        >
          Durée&nbsp;:
        </div>
        <div class="flex flex-row items-center space-x-2">
          {#if canOptions.timerMode === 'question'}
            <InputNumber
              id="config-eleve-can-duration-per-question-input"
              min={5}
              max={600}
              bind:value={canOptions.durationPerQuestionInSeconds}
              isDisabled={!canOptions.isChoosen || canOptions.isTimerDisabled}
            />
          {:else}
            <InputNumber
              id="config-eleve-can-duration-input"
              min={1}
              max={60}
              bind:value={canOptions.durationInMinutes}
              isDisabled={!canOptions.isChoosen || canOptions.isTimerDisabled}
            />
          {/if}
          <div
            class="text-sm font-light {canOptions.isChoosen &&
            !canOptions.isTimerDisabled
              ? 'text-coopmaths-corpus-light dark:text-coopmathsdark-corpus'
              : 'text-coopmaths-corpus-light/10 dark:text-coopmathsdark-corpus/10'}"
          >
            {#if canOptions.timerMode === 'question'}
              seconde{canOptions.durationPerQuestionInSeconds !== undefined &&
              canOptions.durationPerQuestionInSeconds > 1
                ? 's'
                : ''} par question.
            {:else}
              minute{canOptions.durationInMinutes !== undefined &&
              canOptions.durationInMinutes > 1
                ? 's'
                : ''}.
            {/if}
          </div>
        </div>
      </div>
      <ButtonToggleAlt
        title={'Désactiver le chronomètre'}
        id={'config-eleve-can-no-timer-toggle'}
        bind:value={canOptions.isTimerDisabled}
        isDisabled={!canOptions.isChoosen}
        explanations={[
          'La course se déroule sans limite de temps : les élèves la terminent en rendant leur copie.',
          'La course est chronométrée et se termine automatiquement au bout de la durée indiquée.',
        ]}
      />
      <div class="flex flex-row items-center">
        <div
          class="w-24 shrink-0 whitespace-nowrap text-sm font-light {labelClass}"
        >
          Titre&nbsp;:
        </div>
        <InputText
          inputID="config-eleve-can-title-input"
          bind:value={canOptions.title}
          isDisabled={!canOptions.isChoosen}
          showTitle={false}
          classAddenda="font-light"
        />
      </div>
      <div class="flex flex-row items-center">
        <div
          class="w-24 shrink-0 whitespace-nowrap text-sm font-light {labelClass}"
        >
          Sous-titre&nbsp;:
        </div>
        <InputText
          inputID="config-eleve-can-subtitle-input"
          bind:value={canOptions.subTitle}
          isDisabled={!canOptions.isChoosen}
          showTitle={false}
          classAddenda="font-light"
        />
      </div>
    </div>
  </div>
  <!-- Sous Capytale, l'interactivité de la course suit le réglage global
       « Interactif » (voir handleCapytale) -->
  {#if mode === 'lien'}
    <div class="pb-2 md:col-start-1 md:row-start-2">
      <div
        class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
      >
        Interactivité
      </div>
      <div class="flex flex-col items-start justify-start space-y-2 px-4">
        <ButtonToggleAlt
          title={'Questions interactives'}
          id={'config-eleve-can-interactif-toggle'}
          bind:value={canOptions.isInteractive}
          isDisabled={!canOptions.isChoosen}
          explanations={[
            'Les élèves saisissent leurs réponses et obtiennent un score à la fin de la course.',
            'Les questions sont affichées sans champ de saisie : les élèves répondent sur une autre feuille.',
          ]}
        />
      </div>
    </div>
  {/if}
  <div
    class="pb-2 md:row-start-2 {mode === 'lien'
      ? 'md:col-start-2'
      : 'md:col-start-1'}"
  >
    <div
      class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
    >
      Solutions
    </div>
    <div class="flex flex-col items-start justify-start space-y-2 px-4">
      <ButtonToggleAlt
        title={'Accès aux solutions'}
        id={'config-eleve-solutions-can-toggle'}
        bind:value={canOptions.solutionsAccess}
        isDisabled={!canOptions.isChoosen}
        explanations={[
          'Les élèves auront accès aux solutions dans le format défini ci-dessous.',
          "Les élèves n'auront pas accès aux solutions.",
        ]}
      />
      <FormRadio
        title="can-solutions-config"
        bind:valueSelected={canOptions.solutionsMode}
        isDisabled={!canOptions.isChoosen || !canOptions.solutionsAccess}
        labelsValues={[
          {
            label: 'Solutions rassemblées à la fin.',
            value: 'gathered',
          },
          {
            label: 'Solutions avec les questions.',
            value: 'split',
          },
        ]}
      />
    </div>
  </div>
  <div class="pb-2 md:col-start-1 md:row-start-3">
    <div
      class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
    >
      Feedback
    </div>
    <div class="flex flex-col items-start justify-start space-y-2 px-4">
      <FormRadio
        title="can-feedback-mode"
        bind:valueSelected={canOptions.feedbackMode}
        isDisabled={!canOptions.isChoosen || !isFeedbackAvailable}
        labelsValues={[
          {
            label: 'Après toutes les questions.',
            value: 'end',
          },
          {
            label: 'Après chaque question (on ne peut pas revenir en arrière).',
            value: 'each',
          },
        ]}
      />
      <div class="text-sm font-light {labelClass}">
        {#if isFeedbackAvailable}
          Le score et les solutions sont de toute façon affichés à la fin de la
          course.
        {:else}
          Le feedback nécessite des questions interactives.
        {/if}
      </div>
    </div>
  </div>
</div>
