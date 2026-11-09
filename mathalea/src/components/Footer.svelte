<script>
  import { keyboardState } from './keyboard/stores/keyboardStore'
</script>

<footer
  class="{$keyboardState.isVisible
    ? 'pt-48 md:pt-60'
    : 'pt-4'} w-full bg-coopmaths-canvas dark:bg-coopmathsdark-canvas h-12 flex justify-center items-center opacity-100 pb-4 px-4"
>
  <a
    class="flex flex-row items-center mx-1
    text-coopmaths-action hover:text-coopmaths-action-lightest
    dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
    href="mailto:contact@coopmaths.fr"
    aria-label="enveloppe"
  >
    <i class="bx bx-sm bx-envelope"></i>
  </a>
  <a
    href="https://coopmaths.fr/www/mentions_legales/"
    target="_blank"
    class="mx-2"
  >
    <img
      style="height: 20px"
      src="assets/images/logo2.png"
      alt="Logo Coopmaths 2"
    />
  </a>
  <a
    class="flex flex-row items-center mx-1
    text-coopmaths-action hover:text-coopmaths-action-lightest
    dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
    href="https://www.helloasso.com/associations/coopmaths/formulaires/2"
    target="_blank"
    aria-label="faire un don"
  >
    <i class="bx bx-sm bx-donate-heart"></i>
  </a>
</footer>
