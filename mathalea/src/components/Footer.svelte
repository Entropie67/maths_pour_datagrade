<script>
  import { keyboardState } from './keyboard/stores/keyboardStore'
</script>

<!-- AxioMaths (DataGrade) : pied de page avec la mention MathALÉA / CoopMaths et
     l'accès aux sources de la version déployée (AGPL-3.0). -->
<footer
  class="{$keyboardState.isVisible
    ? 'pt-48 md:pt-60'
    : 'pt-4'} w-full bg-coopmaths-canvas dark:bg-coopmathsdark-canvas h-12 flex flex-wrap justify-center items-center gap-x-3 opacity-100 pb-4 px-4
    text-xs text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
>
  <span class="font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct">AxioMaths</span>
  <span>·</span>
  <span>
    propulsé par
    <a
      class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
      href="https://coopmaths.fr/alea/"
      target="_blank"
      rel="noreferrer"
    >
      MathALÉA
    </a>
    (<a
      class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
      href="https://coopmaths.fr"
      target="_blank"
      rel="noreferrer"
    >
      CoopMaths
    </a>, AGPL-3.0)
  </span>
  <span>·</span>
  <a
    class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
    href="deploiement.json"
    target="_blank"
    rel="noreferrer"
  >
    sources
  </a>
  <span>·</span>
  <a
    class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
    href="https://datagrade.fr/"
  >
    DataGrade
  </a>
</footer>
