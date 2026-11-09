<!--
  @component
  Permet de dessinner une flash card qui révèle la réponse on hover.
  inspiration : https://jacky-ttt.medium.com/day156-css-card-flip-d25f102547bd
  /!\ si ne marche pas sur smartphone, essayer d'ajouter group-active:flip-rotate-y-180
 -->
<div
  class={`${$$props.class || 'w-[420px] h-[300px]'} bg-transparent group perspective cursor-pointer`}
>
  <div
    class="relative preserve-3d group-hover:flip-rotate-y-180 w-full h-full rounded-xl duration-1000 shadow-xl"
  >
    <div
      class="absolute backface-hidden w-full h-full flex justify-center items-center rounded-xl text-2xl border-2 bg-coopmaths-canvas text-coopmaths-corpus border-coopmaths-struct-lightest dark:bg-coopmathsdark-canvas dark:text-coopmathsdark-corpus dark:border-coopmathsdark-struct-lightest"
    >
      <slot name="question">Question</slot>
    </div>
    <div
      class="absolute flip-rotate-y-180 backface-hidden w-full h-full flex justify-center items-center rounded-xl text-2xl font-light bg-coopmaths-canvas-dark text-coopmaths-corpus dark:bg-coopmathsdark-canvas-dark dark:text-coopmathsdark-corpus"
    >
      <slot name="answer">Réponse</slot>
    </div>
  </div>
</div>
