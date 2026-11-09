/**
 * Fait défiler la liste des exercices jusqu'au dernier exercice ajouté afin
 * de le rendre visible après son ajout depuis le menu latéral.
 *
 * `scrollIntoView` trouve automatiquement le bon conteneur scrollable (la
 * fenêtre en mode smartphone, `#exercisesPart` en mode normal).
 *
 * Le contenu des exercices se met en page de façon asynchrone après l'insertion
 * (MathJax, figures…) : la position du nouvel exercice se décale alors, soit
 * parce que la hauteur totale augmente (conteneur), soit par un simple reflow à
 * hauteur totale constante (le dernier exercice lui-même change de taille). On
 * observe donc à la fois le conteneur et le dernier exercice, et on le re-cale
 * en haut à chaque changement de taille, pendant une fenêtre bornée
 * (`TRACK_DURATION` ms). Comme on ne défile qu'en réaction à un changement de
 * taille, on ne gêne pas un défilement manuel tant que le contenu est stable ;
 * on l'interrompt malgré tout dès que l'utilisateur défile lui-même.
 *
 * Un état au niveau module garantit qu'un seul suivi est actif à la fois :
 * ajouter un nouvel exercice annule celui du précédent.
 */

const TRACK_DURATION = 5000

let observer: ResizeObserver | null = null
let cleanup: (() => void) | null = null

function stop(): void {
  observer?.disconnect()
  observer = null
  cleanup?.()
  cleanup = null
}

export function scrollToLastExercise(): void {
  stop()
  const wrapper = document.getElementById('exercisesWrapper')
  const exercises = wrapper?.querySelectorAll<HTMLElement>(
    '[id^="exo"]:not([id^="exotitle"])',
  )
  const lastExercise = exercises?.[exercises.length - 1]
  if (!wrapper || !lastExercise) return

  // Le défilement animé pourrait entrer en conflit avec les
  // corrections successives et pourrait se terminer sur une position obsolète.
  // À voir si on repasse de smooth à auto
  const pinToTop = () =>
    lastExercise.scrollIntoView({ behavior: 'smooth', block: 'start' })
  pinToTop()

  observer = new ResizeObserver(pinToTop)
  observer.observe(wrapper)
  observer.observe(lastExercise)

  // Interruption du suivi : délai de sécurité, ou prise de main de l'utilisateur.
  const stopTimer = setTimeout(stop, TRACK_DURATION)
  const onUserScroll = () => stop()
  const events = ['wheel', 'touchmove', 'keydown'] as const
  events.forEach((type) =>
    window.addEventListener(type, onUserScroll, { passive: true }),
  )
  cleanup = () => {
    clearTimeout(stopTimer)
    events.forEach((type) => window.removeEventListener(type, onUserScroll))
  }
}
