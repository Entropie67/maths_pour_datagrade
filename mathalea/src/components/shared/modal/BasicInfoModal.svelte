<script lang="ts">
  import BasicClassicModal from './BasicClassicModal.svelte'

  export let contentDisplayed: 'success' | 'error' | 'none' // à bind avec le parent
  export let successMessage: string
  export let errorMessage: string
  export let displayDuration: number = 3000

  let isSuccessDisplayed: boolean
  $: if (contentDisplayed === 'success') {
    isSuccessDisplayed = true
    setTimeout(() => {
      contentDisplayed = 'none'
    }, displayDuration)
  }

  let isErrorDisplayed: boolean
  $: if (contentDisplayed === 'error') {
    isErrorDisplayed = true
    setTimeout(() => {
      contentDisplayed = 'none'
    }, displayDuration)
  }

  $: if (contentDisplayed === 'none') {
    isSuccessDisplayed = false
    isErrorDisplayed = false
  }
</script>

<BasicClassicModal
  isWithCloseButton={false}
  bind:isDisplayed={isSuccessDisplayed}
  on:close={() => (contentDisplayed = 'none')}
>
  <div slot="content">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html successMessage}
  </div>
</BasicClassicModal>

<BasicClassicModal
  isWithCloseButton={false}
  bind:isDisplayed={isErrorDisplayed}
  on:close={() => (contentDisplayed = 'none')}
>
  <div slot="content">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html errorMessage}
  </div>
</BasicClassicModal>
