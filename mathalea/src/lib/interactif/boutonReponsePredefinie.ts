import type { MathfieldElement } from 'mathlive'
import { DomReadyActionElement } from '../customElements/DomReadyAction'

const actionBoutonReponsePredefinie = 'bouton-reponse-predefinie'

type PayloadBoutonReponsePredefinie = {
  numeroExercice: number | undefined
  indiceQuestion: number
  label: string
  valeur: string
}

/**
 * Bouton discret : pas d'aplat de couleur ni de majuscules, il se contente de
 * border le champ de saisie et ne prend la couleur d'action qu'au survol.
 *
 * Les tailles sont en `em` pour suivre le zoom du document (loupes de la barre
 * d'outils, projection au tableau).
 */
const classesBouton = [
  'ml-[0.4em]',
  'px-[0.5em]',
  'py-[0.15em]',
  'align-middle',
  'whitespace-nowrap',
  'text-[0.75em]',
  'font-light',
  'rounded-[0.25em]',
  'border',
  'bg-transparent',
  'border-coopmaths-canvas-moredark',
  'dark:border-coopmathsdark-canvas-moredark',
  'text-coopmaths-corpus-lightest',
  'dark:text-coopmathsdark-corpus',
  'hover:border-coopmaths-action',
  'dark:hover:border-coopmathsdark-action',
  'hover:text-coopmaths-action',
  'dark:hover:text-coopmathsdark-action',
  'focus:border-coopmaths-action',
  'dark:focus:border-coopmathsdark-action',
  'focus:outline-none',
  'focus:ring-0',
  'transition-colors',
  'duration-150',
  'ease-in-out',
]

let callbackEnregistre = false

function enregistreCallback() {
  if (callbackEnregistre) return
  callbackEnregistre = true
  DomReadyActionElement.registerCallback<PayloadBoutonReponsePredefinie>(
    actionBoutonReponsePredefinie,
    ({ element, payload }) => {
      element.innerHTML = ''
      const button = document.createElement('button')
      button.classList.add(...classesBouton)
      button.textContent = payload.label
      const onClick = () => {
        const mathfield = document.getElementById(
          `champTexteEx${payload.numeroExercice}Q${payload.indiceQuestion}`,
        ) as MathfieldElement | null
        mathfield?.setValue(payload.valeur)
      }
      button.addEventListener('click', onClick)
      element.appendChild(button)
      return () => {
        button.removeEventListener('click', onClick)
        element.innerHTML = ''
      }
    },
  )
}

/**
 * Renvoie le code d'un bouton qui, une fois cliqué, remplit le champ MathLive
 * de la question avec une réponse prédéfinie (par exemple « Pas factorisable »).
 *
 * À n'ajouter à l'énoncé qu'en mode interactif et, si une seule des questions
 * appelle cette réponse, sur toutes les questions pour ne pas la trahir.
 *
 * @param numeroExercice numéro de l'exercice dans la page (`this.numeroExercice`)
 * @param indiceQuestion indice de la question
 * @param label texte affiché sur le bouton
 * @param valeur code LaTeX écrit dans le champ (par défaut `\text{label}`)
 */
export function boutonReponsePredefinie({
  numeroExercice,
  indiceQuestion,
  label,
  valeur = `\\text{${label}}`,
}: {
  numeroExercice: number | undefined
  indiceQuestion: number
  label: string
  valeur?: string
}): string {
  enregistreCallback()
  return DomReadyActionElement.create({
    action: actionBoutonReponsePredefinie,
    payload: { numeroExercice, indiceQuestion, label, valeur },
  })
}
