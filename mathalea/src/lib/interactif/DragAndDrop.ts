import type { DragHandler, IExercice, TouchHandler } from '../../lib/types'
import { context } from '../../modules/context'
import { messageFeedback } from '../../modules/messages'
import { get } from '../html/dom'
import { shuffle } from '../outils/arrayOutils'
import { toutPourUnPoint } from './fonctionsBaremes'

export type Etiquette = {
  id: string // Un numéro unique par étiquette ! (valeur réservée : 0 pour signaler l'absence d'étiquette !)
  contenu: string // Ce que contient l'étiquette (aussi bien du texte, que du latex, qu'une image...)
  duplicable?: boolean
  callback?: (e: Event) => void // @todo à implémenter.
}

export type DragAndDropListenerRecord = {
  element: Element
  type: string
  listener: EventListener
  options?: AddEventListenerOptions
}

/*
L'utilisation de l'interactif façon drag&drop nécessite la déclaration des bonnes réponses avec handleHanswers() :
Un exemple :
handleHanswers(this, i, {
rectangle1: {value: etiquetteId, callback?: ()=>void},
rectangle2: {value: etiquetteId, callback?: ()=>void},
....,
{formatInteractif: 'dnd'})

La fonction de callback est exécutée sur le rectangle (div) correspondant.
Par exemple, on peut imaginer un fonction qui regarde le textContent de l'élément précédent et qui,
si c'est un nombre supérieur à 1, ajoute un 's' au contenu de l'étiquette 'droppée' dans le rectangle.
Ce n'est qu'une idée, je ne sais même pas si c'est réalisable, ni même souhaitable à l'heure où je mets au point ces fonctions !
En fait, c'était pour éviter de doubler le nombre d'étiquettes avec des singuliers et des pluriels...
Pour l'instant, l'utilisation de cette callback n'est pas implémentée.
*/

/**
 * On stocke l'élément en déplacement
 * @param e
 */
function dragStartHandler(e: DragEvent) {
  // console.log('dragStartHandler', e)
  if (e.target instanceof HTMLDivElement) {
    e.dataTransfer?.setData('text/plain', e.target.id)
  }
}

function dragOverHandler(e: DragEvent) {
  e.preventDefault() // Nécessaire pour autoriser le drop
  const target = e.target as HTMLElement
  if (target.classList.contains('trashDND')) {
    const icone = target.firstChild
    if (icone && icone instanceof HTMLElement) {
      icone.classList.add('hovered')
    }
  }
}
/**
 * glisser à la souris terminé on relâche...
 * @param e
 */
function dragEndHandler(e: DragEvent) {
  // console.log('dragEndHandler', e)
  e.preventDefault()
  // Réinitialise la position de l'étiquette originale après le drop
  // if (e.target instanceof HTMLElement) {
  //  e.target.style.position = 'relative'
  // }
}
/**
 * gère le dépot à la souris
 * @param e
 */
function dropHandler(e: DragEvent) {
  // console.log('dropHandler', e)
  e.preventDefault()
  const dropTarget = e.target as HTMLDivElement
  const etiquetteId = e.dataTransfer?.getData('text/plain')
  if (etiquetteId) {
    const etiquette = document.getElementById(etiquetteId)
    if (etiquette && dropTarget) {
      if (
        !dropTarget.closest('.rectangleDND') &&
        etiquette.id.includes('clone')
      ) {
        etiquette.parentElement?.removeChild(etiquette)
        return
      }
      const etiquetteSource = etiquette.closest('.rectangleDND')
      const etiquetteCible = dropTarget.closest('.etiquette')
      const rectangleCible = dropTarget.closest('.rectangleDND')
      if (
        etiquetteSource &&
        rectangleCible === etiquetteSource &&
        etiquetteCible &&
        etiquetteCible !== etiquette
      ) {
        const milieu =
          etiquetteCible.getBoundingClientRect().left +
          etiquetteCible.getBoundingClientRect().width / 2
        if (e.clientX < milieu) etiquetteCible.before(etiquette)
        else etiquetteCible.after(etiquette)
        return
      }
      // Expression régulière pour capturer les 3 groupes de chiffres
      const regex = /Ex(\d+)Q(\d+)I(\d+)/
      const matches = etiquette.id.match(regex)
      let numeroExQuest = ''
      if (matches) {
        const numeroEx = matches[1]
        const numeroQuest = matches[2]
        numeroExQuest = `Ex${numeroEx}Q${numeroQuest}`
      }
      if (
        etiquette.classList.contains('duplicable') &&
        dropTarget.classList.contains('rectangleDND') &&
        dropTarget.id.includes(numeroExQuest)
      ) {
        const clonedEtiquette = etiquette.cloneNode(true) as HTMLDivElement
        clonedEtiquette.id = `${etiquette.id}-clone-${Date.now()}`
        addDeleteButton(clonedEtiquette)
        dropTarget.appendChild(clonedEtiquette)
      } else if (
        dropTarget.classList.contains('rectangleDND') &&
        dropTarget.id.includes(numeroExQuest)
      ) {
        addDeleteButton(etiquette, etiquette.parentElement)
        dropTarget.appendChild(etiquette)
      } else if (
        dropTarget.parentElement?.classList.contains('rectangleDND') &&
        dropTarget.parentElement?.id.includes(numeroExQuest)
      ) {
        // on est sur une étiquette déjà deposée
        const clonedEtiquette = etiquette.cloneNode(true) as HTMLDivElement
        clonedEtiquette.id = `${etiquette.id}-clone-${Date.now()}`
        addDeleteButton(clonedEtiquette)
        dropTarget.after(clonedEtiquette)
      }
      dropTarget.classList.remove('hovered') // Enlève l'effet après le drop
    }
  }
}
/**
 *  démarre le déplacement de l'étiquette sur interface tactile et s'assure que toute l'étiquette est déplacée
 */
function touchStartHandler(e: TouchEvent) {
  // console.log('touchStartHandler', e)
  let target = e.target as HTMLElement
  // Si le touch a été déclenché sur un élément interne (comme un <span>), on remonte jusqu'au div parent
  while (target && target.tagName !== 'DIV') {
    target = target.parentElement as HTMLElement
  }

  if (
    target?.classList.contains('etiquette') &&
    target?.classList.contains('dragOk')
  ) {
    // Une étiquette déposée reçoit l'événement deux fois : le sien et celui délégué à la zone.
    const precedent = target.previousElementSibling as HTMLElement | null
    if (precedent?.id === target.id && precedent.style.display === 'none')
      return
    // Stocker l'élément HTML complet (pour clonage)
    const ele = target.cloneNode(true) as HTMLElement
    ele.style.display = 'none'
    target.before(ele)
  }
}

// gère le déplacement de l'étiquette sur interface tactile
function touchMoveHandler(e: TouchEvent) {
  // console.log('touchMoveHandler', e)
  e.preventDefault()
  const touch = e.changedTouches[0]
  let etiquette = touch.target as HTMLElement
  while (etiquette && etiquette.tagName !== 'DIV') {
    etiquette = etiquette.parentElement as HTMLElement
  }

  if (
    etiquette &&
    etiquette.classList.contains('etiquette') &&
    etiquette.classList.contains('dragOk')
  ) {
    if (etiquette.parentElement) {
      const top = etiquette.parentElement.offsetTop
      const left = etiquette.parentElement.offsetLeft
      const rectangleBounds = etiquette.parentElement.getBoundingClientRect()
      if (rectangleBounds) {
        const touchX = touch.clientX
        const touchY = touch.clientY
        ;(etiquette.previousElementSibling as HTMLDivElement).style.display =
          'block'
        ;(etiquette as HTMLDivElement).style.position = 'absolute'
        ;(etiquette as HTMLDivElement).style.left =
          `${touchX - rectangleBounds.left + left - etiquette.clientWidth / 2}px`
        ;(etiquette as HTMLDivElement).style.top =
          `${touchY - rectangleBounds.top + top - etiquette.clientHeight / 2}px`
      }
    }
    // Expression régulière pour capturer les 3 groupes de chiffres
    const regex = /Ex(\d+)Q(\d+)I(\d+)/
    const matches = etiquette.id.match(regex)
    let numeroExQuest = ''
    if (matches) {
      const numeroEx = matches[1]
      const numeroQuest = matches[2]
      numeroExQuest = `Ex${numeroEx}Q${numeroQuest}`
    }

    // rectangleEx0Q0R1 : on s'intéresse qu'au rectangle de la question et NON toute la page
    const rectangles = document.querySelectorAll(
      `div.rectangleDND[id^="rectangle${numeroExQuest}"`,
    )
    for (const rectangle of rectangles) {
      const rectangleBounds = rectangle.getBoundingClientRect()
      const isHovered =
        touch.clientX > rectangleBounds.left &&
        touch.clientX < rectangleBounds.right &&
        touch.clientY > rectangleBounds.top &&
        touch.clientY < rectangleBounds.bottom
      if (isHovered) {
        rectangle.classList.add('hovered')
      } else {
        rectangle.classList.remove('hovered')
      }
    }
  }
}
/**
 * gère le dépot de l'étiquette sur interface tactile
 * @param e
 * @returns
 */
function touchEndHandler(e: TouchEvent) {
  // console.log('touchEndHandler', e)
  const touch = e.changedTouches[0]
  let etiquette = touch.target as HTMLElement
  /* on a fait un TOUCH sur le bouton SUPPRIMER */
  if (
    etiquette &&
    etiquette.tagName === 'BUTTON' &&
    etiquette.classList.contains('delete-btn')
  ) {
    e.preventDefault() // Sinon le clic simulé tomberait sur ce qui a pris la place du bouton.
    etiquette.click()
    return
  }
  // On cherche l'étiquette
  while (etiquette && etiquette.tagName !== 'DIV') {
    etiquette = etiquette.parentElement as HTMLElement
  }
  if (
    etiquette &&
    etiquette.classList.contains('etiquette') &&
    etiquette.classList.contains('dragOk')
  ) {
    // Sans déplacement, l'emplacement réservé est resté masqué : c'est un simple
    // tap, traité comme un clic par dragAndDropAccessible et non comme un dépôt.
    const emplacement = etiquette.previousElementSibling as HTMLElement | null
    const estEmplacement = emplacement?.id === etiquette.id
    if (estEmplacement && emplacement?.style.display === 'none') {
      emplacement.remove()
      return
    }
    const centerX = touch.clientX
    const centerY = touch.clientY
    // Expression régulière pour capturer les 3 groupes de chiffres
    const regex = /Ex(\d+)Q(\d+)I(\d+)/
    const matches = etiquette.id.match(regex)
    let numeroExQuest = ''
    if (matches) {
      const numeroEx = matches[1]
      const numeroQuest = matches[2]
      numeroExQuest = `Ex${numeroEx}Q${numeroQuest}`
    }

    // rectangleEx0Q0R1 : on s'intéresse qu'au rectangle de la question et NON toute la page.
    const rectangles = document.querySelectorAll(
      `div.rectangleDND[id^="rectangle${numeroExQuest}"`,
    )
    let dropTarget: HTMLDivElement | null = null
    for (const rectangle of rectangles) {
      const rectangleBounds = rectangle.getBoundingClientRect()
      if (
        centerX > rectangleBounds.left &&
        centerX < rectangleBounds.right &&
        centerY > rectangleBounds.top &&
        centerY < rectangleBounds.bottom
      ) {
        // on a trouché un rectangle qui peut réceptionner l'étiquette
        dropTarget = rectangle as HTMLDivElement
        break
      }
    }

    if (dropTarget?.children?.length) {
      for (let i = 0; i < dropTarget?.children?.length; i++) {
        if (!dropTarget.children[i].classList.contains('etiquette')) continue
        const rectangleBounds = dropTarget.children[i].getBoundingClientRect()
        if (
          centerX > rectangleBounds.left &&
          centerX < rectangleBounds.right &&
          centerY > rectangleBounds.top &&
          centerY < rectangleBounds.bottom
        ) {
          // on a trouvé une étiquette dans le rectangle qui peut réceptionner l'étiquette
          dropTarget = dropTarget.children[i] as HTMLDivElement
          break
        }
      }
    }
    if (
      dropTarget?.classList.contains('rectangleDND') ||
      dropTarget?.parentElement?.classList.contains('rectangleDND')
    ) {
      const etiquetteSource = etiquette.closest('.rectangleDND')
      const etiquetteCible = dropTarget.classList.contains('etiquette')
        ? dropTarget
        : dropTarget.closest('.etiquette')
      const rectangleCible = dropTarget.closest('.rectangleDND')
      if (
        etiquetteSource &&
        rectangleCible === etiquetteSource &&
        etiquetteCible &&
        etiquetteCible !== etiquette
      ) {
        const cibleBounds = etiquetteCible.getBoundingClientRect()
        if (centerX < cibleBounds.left + cibleBounds.width / 2) {
          etiquetteCible.before(etiquette)
        } else {
          etiquetteCible.after(etiquette)
        }
      } else if (
        etiquette.classList.contains('duplicable') &&
        dropTarget.classList.contains('rectangleDND')
      ) {
        // console.log('cloneEtiquette', etiquette)
        const clonedEtiquette = etiquette.cloneNode(true) as HTMLDivElement
        clonedEtiquette.id = `${etiquette.id}-clone-${Date.now()}`
        addDeleteButton(clonedEtiquette)
        clonedEtiquette.style.position = 'relative'
        clonedEtiquette.style.top = '0px'
        clonedEtiquette.classList.remove('dragOk')
        ;(clonedEtiquette as HTMLDivElement).style.left = '0px'
        ;(clonedEtiquette as HTMLDivElement).style.zIndex = '1'
        dropTarget.appendChild(clonedEtiquette)
      } else if (dropTarget.classList.contains('rectangleDND')) {
        // console.log('cloneEtiquette', etiquette)
        addDeleteButton(etiquette, etiquette.parentElement)
        // etiquette.style.position = 'relative'
        // etiquette.style.top = '0px'
        // etiquette.classList.remove('dragOk')
        // etiquette.style.left = '0px'
        // etiquette.style.zIndex = '1'
        dropTarget.appendChild(etiquette)
      } else {
        // console.log('cloneEtiquette2', etiquette)
        const clonedEtiquette = etiquette.cloneNode(true) as HTMLDivElement
        clonedEtiquette.id = `${etiquette.id}-clone-${Date.now()}`
        addDeleteButton(clonedEtiquette)
        clonedEtiquette.style.position = 'relative'
        clonedEtiquette.style.top = '0px'
        clonedEtiquette.classList.remove('dragOk')
        ;(clonedEtiquette as HTMLDivElement).style.left = '0px'
        ;(clonedEtiquette as HTMLDivElement).style.zIndex = '1'
        dropTarget.after(clonedEtiquette)
      }
      dropTarget.classList.remove('hovered')
    }
    // on remet l'étiquette à sa place
    ;(etiquette as HTMLDivElement).style.position = 'relative'
    ;(etiquette as HTMLDivElement).style.top = '0px'
    ;(etiquette as HTMLDivElement).style.left = '0px'
    // Rendu visible par le déplacement, l'emplacement ferait sinon un doublon de même id.
    if (estEmplacement) emplacement?.remove()
  }
}
// met le rectangle en effet 'green glowing'
function dragEnterHandler(e: DragEvent) {
  if (
    e.target instanceof HTMLElement &&
    e.target.classList.contains('rectangleDND')
  ) {
    e.target.classList.add('hovered')
  }
}
// retire l'effet 'green glowing'
function dragLeaveHandler(e: DragEvent) {
  const target = e.target
  if (
    target instanceof HTMLElement &&
    (target.classList.contains('rectangleDND') ||
      target.classList.contains('trashDND'))
  ) {
    target.classList.remove('hovered')
  }
}

/**
 * Retire une étiquette déposée : un clone disparaît, une étiquette unique retourne
 * dans la réserve de sa question (ou dans `parent` si elle n'est pas trouvée).
 */
export function retirerEtiquette(
  etiquette: HTMLElement,
  parent: HTMLElement | null = null,
) {
  if (etiquette.classList.contains('duplicable')) {
    etiquette.remove() // Supprime l'étiquette du DOM
    return
  }
  const reserve =
    etiquette
      .closest('drag-and-drop')
      ?.querySelector<HTMLElement>('[id^="etiquettesEx"]') ?? parent
  reserve?.appendChild(etiquette)
  etiquette.querySelector(':scope > .delete-btn')?.remove()
}

export function addDeleteButton(
  etiquette: HTMLElement,
  parent: HTMLElement | null = null,
) {
  // Un clone ou une étiquette déplacée d'une zone à l'autre porte déjà un bouton.
  etiquette.querySelector(':scope > .delete-btn')?.remove()
  const deleteBtn = document.createElement('button')
  deleteBtn.textContent = 'x'
  deleteBtn.classList.add('delete-btn')
  // Réservé au pointeur : un bouton ne peut pas être imbriqué dans une étiquette
  // en role="button". Le clavier et les lecteurs d'écran ont dragAndDropAccessible.
  deleteBtn.tabIndex = -1
  deleteBtn.setAttribute('aria-hidden', 'true')
  deleteBtn.addEventListener('click', () => {
    retirerEtiquette(etiquette, parent)
  })
  etiquette.appendChild(deleteBtn)
}

export function attachDragAndDropListeners({
  root,
  numeroExercice,
  question,
}: {
  root: ParentNode
  numeroExercice: number
  question: number
}): DragAndDropListenerRecord[] {
  const listeners: DragAndDropListenerRecord[] = []
  const addListener = (
    element: Element,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ) => {
    element.addEventListener(type, listener, options)
    listeners.push({ element, type, listener, options })
  }

  const divEtiquettes = root.querySelector(
    `#etiquettesEx${numeroExercice}Q${question}`,
  )
  if (divEtiquettes) {
    addListener(divEtiquettes, 'drop', dropHandler as EventListener)
    addListener(divEtiquettes, 'dragover', dragOverHandler as EventListener)
    addListener(divEtiquettes, 'touchmove', touchMoveHandler as EventListener, {
      capture: true,
    })
    addListener(divEtiquettes, 'touchend', touchEndHandler as EventListener)
    for (const etiquette of divEtiquettes.querySelectorAll('.etiquette')) {
      addListener(etiquette, 'dragstart', dragStartHandler as EventListener)
      addListener(etiquette, 'dragend', dragEndHandler as EventListener)
      addListener(etiquette, 'touchstart', touchStartHandler as EventListener, {
        capture: false,
      })
    }
  }

  const rectangles = root.querySelector(
    `#rectanglesEx${numeroExercice}Q${question}`,
  )
  if (rectangles) {
    // Ces écouteurs sont délégués au conteneur afin de fonctionner aussi pour
    // les étiquettes clonées après leur dépôt dans la zone.
    addListener(rectangles, 'dragstart', dragStartHandler as EventListener)
    addListener(rectangles, 'dragend', dragEndHandler as EventListener)
    addListener(rectangles, 'touchstart', touchStartHandler as EventListener)
    for (const rectangle of rectangles.querySelectorAll('.rectangleDND')) {
      addListener(rectangle, 'dragover', dragOverHandler as EventListener)
      addListener(rectangle, 'drop', dropHandler as EventListener)
      addListener(rectangle, 'touchmove', touchMoveHandler as EventListener)
      addListener(rectangle, 'touchend', touchEndHandler as EventListener)
      addListener(rectangle, 'dragenter', dragEnterHandler as EventListener)
      addListener(rectangle, 'dragleave', dragLeaveHandler as EventListener)
    }
  }

  return listeners
}

/**
 * C'est la fonction utilisée par exerciceInteractif pour vérifier ce type de question
 * @param exercice
 * @param question
 * @returns
 */
export function verifDragAndDrop(
  exercice: IExercice,
  question: number,
): {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
} {
  // tout d'abord on va supprimer les listeners !
  const exoDragAndDrops = exercice.dragAndDrops
  if (exoDragAndDrops == null) {
    window.notify(
      "Problème survenu dans verifDragAndDrop : il n'y a pas d'array dragAndDrops dans exercice",
      {},
    )
    return {
      isOk: false,
      feedback: 'Un problème est survenu',
      score: { nbBonnesReponses: 0, nbReponses: 0 },
    }
  }
  const leDragAndDrop = exoDragAndDrops[question]
  if (leDragAndDrop == null) {
    window.notify(
      `Problème survenu dans verifDragAndDrop : il n'y a pas de drag and drop pour la question ${question}`,
      {},
    )
    return {
      isOk: false,
      feedback: 'Un problème est survenu',
      score: { nbBonnesReponses: 0, nbReponses: 0 },
    }
  }
  for (const [element, type, listener] of leDragAndDrop.listeners) {
    element.removeEventListener(type, listener as EventListener)
  }
  // fin de suppression des listeners
  const numeroExercice = exercice.numeroExercice
  const objetReponses = exercice.autoCorrection[question].valeur
  let nbBonnesReponses = 0
  let etiquettesAbsentes = 0
  let etiquettesMalPlacees = 0
  let etiquettesBienPlacees = 0
  if (objetReponses) {
    const bareme = objetReponses.bareme ?? toutPourUnPoint

    const variables = Object.entries(objetReponses).filter(
      ([key]) => key !== 'callback' && key !== 'bareme' && key !== 'feedback',
    )

    let nbReponses = objetReponses != null ? variables.length : 0
    const rectangles = get(
      `rectanglesEx${exercice.numeroExercice}Q${question}`,
      false,
    )
    if (!rectangles) {
      window.notify(
        'Un problème avec verifDragAndDrop, je ne trouve pas la zone de drop !',
        {},
      )
      return {
        isOk: false,
        feedback: 'Un problème est survenu',
        score: { nbBonnesReponses, nbReponses },
      }
    }
    if (objetReponses == null) {
      window.notify(
        "Un problème avec verifDragAndDrop, il n'y a pas de réponses de définies !",
        {},
      )
      return {
        isOk: false,
        feedback: 'Un problème est survenu',
        score: { nbBonnesReponses, nbReponses },
      }
    }
    const reponses = Object.entries(objetReponses)
    const points: number[] = []

    if (!exercice.answers) exercice.answers = {}
    for (let k = 1; k <= nbReponses; k++) {
      const rectangle = get(
        `rectangleEx${numeroExercice}Q${question}R${k}`,
        false,
      )
      if (rectangle) {
        const goodAnswer = reponses.find(([key]) => key === `rectangle${k}`)
        const etiquettesDedans =
          rectangle.querySelectorAll<HTMLElement>('.etiquette')
        if (goodAnswer && !goodAnswer[1]?.options?.multi) {
          // Ici, il ne doit y avoir qu'une seule étiquette dans le rectangle
          etiquettesMalPlacees += etiquettesDedans.length - 1
          const etiquetteDedans = etiquettesDedans[0]
          const id =
            etiquetteDedans?.id ?? `etiquetteEx${numeroExercice}Q${question}I0`
          const etiquetteId = id.split('-')[0].split('I')[1] // on débarasse du nom du clone et de ce qui est avant I pour récupérer juste l'Id
          exercice.answers = Object.assign(
            exercice.answers,
            Object.fromEntries([
              [`rectangleDNDEx${numeroExercice}Q${question}R${k}`, id],
            ]),
          )
          if (!etiquetteDedans) {
            // Faut peut-être pas compter faux si l'absence d'étiquette est normal, mais faut voir comment on fait
            // si le rectangle peut rester vide, il faut que goodAnswer[1].value soit ''
            if (
              goodAnswer &&
              goodAnswer[1] != null &&
              goodAnswer[1].value.length === 0
            ) {
              nbBonnesReponses++
              points.push(1)
            } else {
              rectangle.classList.add('bg-coopmaths-action-200')
              points.push(0)
              etiquettesAbsentes++
            }
          } else if (
            goodAnswer &&
            goodAnswer[1] != null &&
            etiquetteId === goodAnswer[1].value &&
            etiquettesMalPlacees === 0
          ) {
            etiquetteDedans?.classList.remove('bg-gray-200')
            etiquetteDedans.classList.add('bg-coopmaths-warn-100')
            nbBonnesReponses++
            points.push(1)
          } else {
            if (
              goodAnswer &&
              goodAnswer[1] != null &&
              etiquetteId === goodAnswer[1].value
            ) {
              etiquetteDedans?.classList.remove('bg-gray-200')
              etiquetteDedans.classList.add('bg-coopmaths-warn-100')
              for (let z = 1; z < etiquettesDedans.length; z++) {
                etiquettesDedans[z].classList.remove('bg-gray-200')
                etiquettesDedans[z].classList.add('bg-coopmaths-action-200')
              }
            } else {
              etiquetteDedans?.classList.remove('bg-gray-200')
              etiquetteDedans.classList.add('bg-coopmaths-action-200')
            }
            points.push(0)
          }
        } else {
          // Ici, il y a plus d'une étiquette dans le rectangle ! l'option multi est true
          const etiquettesIds = []
          const etiquettesTxts = []
          for (const etiquette of etiquettesDedans) {
            const id = etiquette.id
            // const etiquetteId = id.split('-')[0].split('I')[1] // on débarasse du nom du clone et de ce qui est avant I pour récupérer juste l'Id
            etiquettesIds.push(id) // On doit mettre l'id complète pour mathaleaWriteStudentPreviousAnswers()... qui devra gérer le clonage à son tour
            etiquettesTxts.push(etiquette.innerText.replace('\nx', ''))
          }
          exercice.answers = Object.assign(
            exercice.answers,
            Object.fromEntries([
              [
                `rectangleDNDEx${numeroExercice}Q${question}R${k}`,
                etiquettesIds.join(';'),
              ],
              [
                `texteDNDEx${numeroExercice}Q${question}R${k}`,
                etiquettesTxts.join(' '),
              ],
            ]),
          )
          const goodAnswer = reponses.find(([key]) => key === `rectangle${k}`)
          if (etiquettesDedans.length === 0) {
            // Faut peut-être pas compter faux si l'absence d'étiquette est normal, mais faut voir comment on fait
            // si le rectangle peut rester vide, il faut que goodAnswer[1].value soit ''
            if (
              goodAnswer &&
              goodAnswer[1] != null &&
              goodAnswer[1].value.length === 0
            ) {
              nbBonnesReponses++
              points.push(1)
            } else {
              rectangle.classList.add('bg-coopmaths-action-200')
              points.push(0)
              etiquettesAbsentes++
            }
          } else {
            if (goodAnswer && goodAnswer[1] != null) {
              let isOk: boolean = true
              const value = Array.isArray(goodAnswer[1].value)
                ? goodAnswer[1].value
                : [goodAnswer[1].value]
              for (const val of value) {
                isOk = true
                etiquettesBienPlacees = 0 // on reinitialise car plusieurs réponses possibles, malheureusement on garde la dernière
                etiquettesMalPlacees = 0 // on reinitialise car plusieurs réponses possibles, malheureusement on garde la dernière
                const listeOfIds: string[] = val.split('|')
                const ordered = goodAnswer[1].options.ordered ?? false
                if (listeOfIds.length !== etiquettesDedans.length) {
                  isOk = false
                }
                if (ordered) {
                  for (
                    let j = 0;
                    j < listeOfIds.length && j < etiquettesDedans.length;
                    j++
                  ) {
                    // compare même si pas même longueur
                    const etiquette = etiquettesDedans[j]
                    const id = listeOfIds[j]
                    if (id === etiquette.id.split('I').pop()?.split('-')[0]) {
                      etiquette.classList.add('bg-coopmaths-warn-100')
                      if (goodAnswer[1].options?.feedbackOnLabels) {
                        etiquette.classList.remove('bg-red-100', 'text-red-900')
                        etiquette.classList.add(
                          'bg-green-100',
                          'text-green-900',
                        )
                      }
                      etiquettesBienPlacees++
                    } else {
                      etiquette.classList.add('bg-coopmaths-action-200')
                      if (goodAnswer[1].options?.feedbackOnLabels) {
                        etiquette.classList.remove(
                          'bg-green-100',
                          'text-green-900',
                        )
                        etiquette.classList.add('bg-red-100', 'text-red-900')
                      }
                      etiquettesMalPlacees++
                      isOk = false
                    }
                  }
                  if (goodAnswer[1].options?.feedbackOnLabels) {
                    for (
                      let j = listeOfIds.length;
                      j < etiquettesDedans.length;
                      j++
                    ) {
                      etiquettesDedans[j].classList.add(
                        'bg-red-100',
                        'text-red-900',
                      )
                    }
                  }
                  etiquettesAbsentes =
                    listeOfIds.length -
                    listeOfIds.filter((el: string) =>
                      Array.from(etiquettesDedans).find(
                        (etiquette) =>
                          el === etiquette.id.split('I').pop()?.split('-')[0],
                      ),
                    ).length
                  if (etiquettesAbsentes < 0) etiquettesAbsentes = 0
                  if (isOk === true) break
                } else {
                  for (const etiquette of etiquettesDedans) {
                    const id = etiquette.id.split('I')[1].split('-')[0]
                    if (goodAnswer[1].options?.feedbackOnLabels) {
                      etiquette.classList.remove(
                        'bg-gray-200',
                        'bg-coopmaths-warn-100',
                        'bg-coopmaths-action-200',
                        'bg-green-100',
                        'text-green-900',
                        'bg-red-100',
                        'text-red-900',
                      )
                      etiquette.classList.add(
                        ...(listeOfIds.includes(id)
                          ? ['bg-green-100', 'text-green-900']
                          : ['bg-red-100', 'text-red-900']),
                      )
                    }
                    if (listeOfIds.includes(id)) {
                      if (!goodAnswer[1].options?.feedbackOnLabels)
                        etiquette.classList.add('bg-coopmaths-warn-100')
                    } else {
                      if (!goodAnswer[1].options?.feedbackOnLabels)
                        etiquette.classList.add('bg-coopmaths-action-200')
                      isOk = false
                    }
                  }
                  etiquettesAbsentes =
                    listeOfIds.length -
                    listeOfIds.filter((el: string) =>
                      Array.from(etiquettesDedans).find(
                        (etiquette) =>
                          el === etiquette.id.split('I').pop()?.split('-')[0],
                      ),
                    ).length
                  if (isOk === true && etiquettesAbsentes === 0) break
                }
              }
              if (isOk) {
                nbBonnesReponses++
                points.push(1)
              } else {
                points.push(0)
              }
            }
          }
        }
      }
    }
    // gestion du feedback
    const spanReponseLigne = document.querySelector(
      `#resultatCheckEx${numeroExercice}Q${question}`,
    )

    let typeFeedback = 'positive'
    let resultat: string
    if (nbBonnesReponses === nbReponses) {
      if (spanReponseLigne) {
        spanReponseLigne.innerHTML = '😎'
      }
      resultat = 'OK'
    } else {
      if (spanReponseLigne) spanReponseLigne.innerHTML = '☹️'
      typeFeedback = 'error'
      resultat = 'KO'
    }
    // Gestion du feedback global de la question
    if (spanReponseLigne) {
      ;(spanReponseLigne as HTMLSpanElement).style.fontSize = 'large'
    }
    const eltFeedback = get(`feedbackEx${numeroExercice}Q${question}`, false)
    let message = ''
    if (eltFeedback) {
      eltFeedback.innerHTML = ''
    }
    const feedbackOnLabels = Object.values(objetReponses).some(
      (reponse) => reponse?.options?.feedbackOnLabels,
    )
    if (resultat === 'KO' && !feedbackOnLabels) {
      // Juste mais incomplet
      if (nbBonnesReponses > 0) {
        message = `${nbBonnesReponses} bonne${nbBonnesReponses > 1 ? 's' : ''} réponse${nbBonnesReponses > 1 ? 's' : ''}`
      }
      if (etiquettesBienPlacees > 0) {
        message += ` ${etiquettesBienPlacees} réponse${etiquettesBienPlacees > 1 ? 's' : ''} bien placée${etiquettesBienPlacees > 1 ? 's' : ''}`
      }
      if (etiquettesAbsentes > 0) {
        message += ` ${etiquettesAbsentes} réponse${etiquettesAbsentes > 1 ? 's' : ''} manquante${etiquettesAbsentes > 1 ? 's' : ''}`
      }
      if (etiquettesMalPlacees > 0) {
        message += ` ${etiquettesMalPlacees} réponse${etiquettesMalPlacees > 1 ? 's' : ''} mal placée${etiquettesMalPlacees > 1 ? 's' : ''}`
      }
      messageFeedback({
        id: `feedbackEx${numeroExercice}Q${question}`,
        message,
        type: typeFeedback,
      })
    } else {
      message = ''
    }

    ;[nbBonnesReponses, nbReponses] = bareme(points)

    return {
      isOk: nbBonnesReponses === nbReponses,
      feedback: '',
      score: { nbBonnesReponses, nbReponses },
    }
  }
  window.notify(
    "VerifDragAndDrop a un problème : il n'y a pas d'objet réponse fourni",
    {},
  )
  return {
    isOk: false,
    feedback: 'Un problème est survenu',
    score: { nbBonnesReponses: 0, nbReponses: 0 },
  }
}

class DragAndDrop {
  exercice: IExercice
  question: number
  consigne: string
  etiquettes: Etiquette[][]
  enonceATrous: string
  nomsZones: string[]
  listeners: [Element, string, DragHandler | TouchHandler][]
  constructor({
    exercice,
    question,
    consigne,
    etiquettes,
    enonceATrous,
    nomsZones = [],
  }: {
    exercice: IExercice
    question: number
    consigne: string
    etiquettes: Etiquette[][]
    enonceATrous: string
    /** Noms lus par les lecteurs d'écran : nomsZones[0] pour %{rectangle1}, etc. Sinon, « Zone 1 sur 3 ». */
    nomsZones?: string[]
  }) {
    this.exercice = exercice
    this.question = question
    this.consigne = consigne
    this.etiquettes = etiquettes
    this.enonceATrous = enonceATrous
    this.nomsZones = nomsZones
    this.listeners = []
  }

  /** Une méthode pour ajouter un contenu interactif de type Drag and drop
   *  enonceATrous est une chaine de caractères avec le format suivant: 'blabla..%{rectangle1}blabla%{rectangle2}blibli...'
   *  Les différents % { rectanglen } sont remplacés par des div rectangulaires pouvant accueillir les étiquettes.
   * @param param0
   * @returns
   */
  ajouteDragAndDrop({
    melange = false,
    duplicable = false,
  }: {
    melange: boolean
    duplicable: boolean
  }) {
    const numeroExercice = this.exercice.numeroExercice
    if (context.isHtml) {
      let html = ''
      const rule = '<hr width="100%" height="0px" />'
      html += `<div class="questionDND" id="divDragAndDropEx${numeroExercice}Q${this.question}">\n\t`
      html += `<div class="consigneDND">${this.consigne}</div>\n\t`
      html += `<div  class="etiquettes" id="etiquettesEx${numeroExercice}Q${this.question}">\n\t` // voir si on laisse la bordure : ${this.exercice.interactif ? 'style="border: 1px dashed #AAA" ' : ''}
      for (const etiquetteRaw of this.etiquettes) {
        const etiquettesEnDesordreOuPas = melange
          ? shuffle(etiquetteRaw.slice())
          : etiquetteRaw.slice()
        for (const etiquette of etiquettesEnDesordreOuPas) {
          html += `<div class="etiquette${this.exercice.interactif ? ' dragOk' : ' noDrag'}${duplicable ? ' duplicable' : ''}${this.exercice.interactif ? ' bg-gray-200' : ''}" draggable="${this.exercice.interactif ? 'true' : 'false'}" id="etiquetteEx${numeroExercice}Q${this.question}I${etiquette.id}">${etiquette.contenu}</div>\n\t`
        }

        html += rule
      }
      html = html.substring(0, html.length - rule.length)
      html += '</div>'

      html += `<div class="rectangles" id="rectanglesEx${numeroExercice}Q${this.question}" >\n\t`
      let resteEnonce = this.enonceATrous
      let htmlEnonce = ''
      while (resteEnonce) {
        const chunks = /^(.*?)%\{([^}]+)}(.*?)$/.exec(resteEnonce)
        if (chunks) {
          const [, start, n, end] = chunks
          const name = n
          if (name == null) throw Error(`Définition de ${name} manquante`)
          htmlEnonce += `<span>${start}</span>`
          if (this.exercice.interactif) {
            const nomZone = this.nomsZones[Number(name.substring(9)) - 1]
            const attributNom = nomZone
              ? ` data-nom-zone="${nomZone.replaceAll('"', '&quot;')}"`
              : ''
            htmlEnonce += `<div class="rectangleDND" id="rectangleEx${numeroExercice}Q${this.question}R${name.substring(9)}"${attributNom}></div>`
          } else {
            htmlEnonce +=
              '<hr style="height: 30px; width: 60px; border: 1px dashed #555;">'
          }
          resteEnonce = end ?? ''
        } else {
          htmlEnonce += resteEnonce
          resteEnonce = ''
        }
      }
      html += htmlEnonce
      html += `<span id="resultatCheckEx${numeroExercice}Q${this.question}"></span></div>`
      if (this.exercice.interactif) {
        // ajoutons le div#feedback
        html += `<div class="ml-2 py-2 italic text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest" id="feedbackEx${numeroExercice}Q${this.question}"></div>`
      } else {
        const divEtiquettes = get(
          `etiquettesEx${numeroExercice}Q${this.question}`,
          false,
        )
        if (divEtiquettes) {
          for (const etiquette of divEtiquettes.querySelectorAll(
            '.etiquette',
          )) {
            etiquette.classList.add('noDrag')
          }
        }
      }
      return `<drag-and-drop id="drag-and-dropEx${numeroExercice}Q${this.question}" numero-exercice="${numeroExercice}" question-index="${this.question}" interactivity-on="${this.exercice.interactif ? 'true' : 'false'}">${html}</drag-and-drop>`
    }
    const latex = ''
    return latex
  }
}

export default DragAndDrop
