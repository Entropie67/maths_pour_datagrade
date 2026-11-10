<script lang="ts">
  import BasicClassicModal from '../modal/BasicClassicModal.svelte'
  import ButtonIconTooltip from './ButtonIconTooltip.svelte'
  import BasicInfoModal from '../modal/BasicInfoModal.svelte'
  import QRCode from 'qrcode'
  import { notify } from '../../../bugsnag'
  import { mathaleaGenerateSeed } from '../../../lib/mathalea'
  import { buildMathAleaURL } from '../../../lib/components/urls'

  export let customUrl: string = ''
  export let icon: string = 'bx-qr text-2xl'
  export let cornerIcon: string = ''
  export let cornerIconClass: string = ''
  export let tooltip: string = ''
  export let useCurrentUrl: boolean = false
  export let removeSeed: boolean = false

  const imageId: string = mathaleaGenerateSeed()

  const QRCodeOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.9,
    margin: 1,
    scale: 2,
    width: 400,
    color: {
      dark: '#000',
      light: '#fff',
    },
  }

  let isDisplayed = false
  let QRCodeCopyState: 'success' | 'error' | 'none' = 'none'

  async function updateQRCodeImage() {
    const url = useCurrentUrl
      ? buildMathAleaURL({ removeSeed }).toString()
      : customUrl
    QRCode.toDataURL(url, QRCodeOptions, (error: Error, url: string) => {
      const imageElement = document.getElementById(imageId)
      if (!imageElement || !(imageElement instanceof HTMLImageElement)) {
        notify('QR-Code image element not found', { imageId })
        return
      }
      if (error) {
        notify('Error generating QR-Code', { error })
        return
      }
      imageElement.setAttribute('src', url)
    })
  }

  async function copyQRCodeImageToClipboard() {
    updateQRCodeImage()
    const imageElement = document.getElementById(imageId)
    if (!imageElement || !(imageElement instanceof HTMLImageElement)) {
      notify(`ImageElement with ID: ${imageId} not found.`, {})
      QRCodeCopyState = 'error'
      return
    }

    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      console.error('Copying images to clipboard is not supported.')
      QRCodeCopyState = 'error'
      return
    }

    try {
      const response = await fetch(imageElement.src)
      const blob = await response.blob()
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      QRCodeCopyState = 'success'
    } catch (error) {
      notify('Error copying QR Code to clipboard:', { error })
      QRCodeCopyState = 'error'
    }
  }

  async function downloadQRCodeImage() {
    updateQRCodeImage()
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')

    const imageElement = document.getElementById(imageId)
    if (!imageElement || !(imageElement instanceof HTMLImageElement)) {
      notify('QR-Code image element not found', { imageId, imageElement })
      return
    }

    const imageSrc = imageElement.getAttribute('src')
    if (!imageSrc) {
      notify(`Image with ID: ${imageId} has no attribute "src".`, {})
      return
    }

    try {
      const response = await fetch(imageSrc)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Creating virtual link for download
      const downloadLink = document.createElement('a')
      downloadLink.style.display = 'none'
      downloadLink.href = url
      downloadLink.download = `qrcode_coopmaths_${timestamp}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      notify('Error downloading the QR Code image:', { error })
    }
  }
</script>

<ButtonIconTooltip
  {icon}
  {cornerIcon}
  {cornerIconClass}
  {tooltip}
  on:click={() => {
    updateQRCodeImage()
    isDisplayed = !isDisplayed
  }}
/>

<BasicClassicModal bind:isDisplayed>
  <h3 slot="header">QR-Code</h3>
  <div slot="content" class="flex flex-col items-center">
    <div class="flex flex-col justify-center">
      <div class="flex flex-row justify-center p-4">
        <img id={imageId} alt="QR-Code" width="200px" />
      </div>
    </div>
  </div>
  <div slot="footer">
    <div class="flex flex-row justify-center">
      <ButtonIconTooltip
        icon="bx-copy-alt text-[30px] mx-3"
        tooltip="Copier le QR-Code"
        on:click={copyQRCodeImageToClipboard}
      />
      <ButtonIconTooltip
        icon="bx-download text-[30px] mx-3"
        tooltip="Télécharger le QR-Code"
        on:click={downloadQRCodeImage}
      />
    </div>
  </div>
</BasicClassicModal>

<BasicInfoModal
  bind:contentDisplayed={QRCodeCopyState}
  successMessage="Le QR-Code est copié dans le presse-papier !"
  errorMessage="Impossible de copier le QR-Code dans ce navigateur !<br /> Vérifier les permissions."
/>
