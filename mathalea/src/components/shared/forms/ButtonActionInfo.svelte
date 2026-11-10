<script lang="ts">
  import { buildMathAleaURL } from '../../../lib/components/urls'
  import { copyTextToClipboard } from '../../../lib/components/clipboard'
  import { downloadFile } from '../../../lib/files'
  import BasicInfoModal from '../modal/BasicInfoModal.svelte'
  import ButtonIconTooltip from './ButtonIconTooltip.svelte'
  import ButtonTextAction from './ButtonTextAction.svelte'

  export let action: 'copy' | 'download'
  export let textToCopy: string = ''
  export let urlToDownload: string = ''
  export let fileName: string = 'mathAlea'
  export let useCurrentUrl: boolean = false
  export let removeSeed: boolean = false

  export let icon: string = ''
  export let tooltip: string = ''
  export let disabled: boolean = false
  export let floatUnderText: string = ''
  export let cornerIcon: string = ''
  export let cornerIconClass: string = ''

  export let text: string = ''
  export let title: string = ''
  export let inverted: boolean = false

  export let successMessage: string = 'Copié dans le presse-papier'
  export let errorMessage: string =
    'Une erreur est survenue lors de la copie dans le presse-papier.'
  export let displayDuration: number = 3000

  let contentDisplayed: 'success' | 'error' | 'none' = 'none'

  let actionFunction: () => void
  $: actionFunction = action === 'copy' ? copyToClipboard : download

  // Reactive statement to update actionFunction when textToCopy changes
  $: if (action === 'copy') {
    actionFunction = copyToClipboard
  } else {
    actionFunction = download
  }

  function copyToClipboard() {
    if (textToCopy === '' && !useCurrentUrl) {
      console.error('Le texte à copier est vide')
      contentDisplayed = 'error'
      return
    }
    // copyTextToClipboard gère les contextes non sécurisés (http://IP-du-LAN)
    // où navigator.clipboard est absent, via un repli execCommand.
    const text = useCurrentUrl
      ? buildMathAleaURL({ removeSeed }).toString()
      : textToCopy
    void copyTextToClipboard(text).then((success) => {
      if (!success) {
        console.error('Impossible de copier le texte dans le presse-papier')
      }
      contentDisplayed = success ? 'success' : 'error'
    })
  }

  function download() {
    if (urlToDownload === '' && !useCurrentUrl) {
      console.error("L'URL à télécharger est vide")
      return
    }
    const text = `<html><head><meta http-equiv="refresh" content="0;URL=${encodeURI(useCurrentUrl ? buildMathAleaURL({}).toString() : urlToDownload)}"></head></html>`
    downloadFile(text, `${fileName}.html`).then((returnString) => {
      contentDisplayed = returnString
    })
  }
</script>

{#if text === ''}
  <ButtonIconTooltip
    {icon}
    {tooltip}
    {disabled}
    {floatUnderText}
    {cornerIcon}
    {cornerIconClass}
    class={$$props.class || ''}
    on:click={actionFunction}
  />
{:else}
  <ButtonTextAction
    {text}
    {title}
    {disabled}
    {icon}
    {inverted}
    class={$$props.class || ''}
    on:click={actionFunction}
  />
{/if}

<BasicInfoModal
  bind:contentDisplayed
  {successMessage}
  {errorMessage}
  {displayDuration}
/>
