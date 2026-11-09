<script lang="ts">
  import type { MathfieldElement } from 'mathlive'
  import { afterUpdate, onDestroy, onMount } from 'svelte'
  import { setSizeWithinSvgContainer } from '../../../../lib/components/sizeTools'
  import type ListeDeroulanteElement from '../../../../lib/customElements/ListeDeroulanteElement'
  import type { MathaleaTextfieldElement } from '../../../../lib/customElements/MathaleaTextfield'
  import {
    questionCliqueFigure,
    type FigureClicable,
  } from '../../../../lib/customElements/CliqueFigureElement'
  import { mathaleaRenderDiv } from '../../../../lib/mathalea'
  import { canOptions } from '../../../../lib/stores/canStore'
  import { loadMathLive } from '../../../../modules/loaders'
  import { keyboardState } from '../../../keyboard/stores/keyboardStore'
  export let question: string
  export let consigne: string
  export let correction: string
  export let consigneCorrection: string
  export let mode: 'display' | 'correction' = 'display'
  export let visible: boolean
  export let index: number
  /**
   * Question verrouillée (feedback après validation) : plus aucune saisie ni
   * clavier virtuel, mais l'affichage du feedback reste visible.
   */
  export let isLocked: boolean = false

  let questionContainer: HTMLDivElement

  $: if (questionContainer) {
    if (isLocked) questionContainer.setAttribute('inert', '')
    else questionContainer.removeAttribute('inert')
  }

  onDestroy(() => {
    const mathfields = questionContainer?.querySelectorAll(
      'math-field',
    ) as NodeListOf<MathfieldElement>
    for (const mf of mathfields ?? []) {
      mf.removeEventListener('input', handleMathfieldElement)
      mf.removeEventListener('focusin', handleMathfieldFocus)
    }
    const listesDeroulantes = questionContainer?.querySelectorAll(
      '[id^="liste-deroulanteEx"]',
    ) as NodeListOf<ListeDeroulanteElement>
    for (const listeDeroulante of listesDeroulantes ?? []) {
      listeDeroulante.removeEventListener(
        'change',
        handleListeDeroulanteElement,
      )
    }
  })
  onMount(() => {
    const questionContent = document.getElementById(
      `question-content-${index}`,
    ) as HTMLDivElement
    if (questionContent) {
      mathaleaRenderDiv(questionContent)
      setSizeWithinSvgContainer(questionContent)
      if (visible) {
        updateInteractivity()
      }
    }
    loadMathLive()
  })

  afterUpdate(() => {
    if (visible) {
      updateInteractivity()
      const questionContent = document.getElementById(
        `question-content-${index}`,
      ) as HTMLDivElement
      setSizeWithinSvgContainer(questionContent)
    }
  })

  function handleMathfieldElement(this: HTMLElement, ev: Event) {
    /* ca peut venir du clavier vituel ou du clavier physique */
    const mathfields = Array.from(
      questionContainer?.querySelectorAll('math-field') ?? [],
    ) as MathfieldElement[]
    const hasAnswer =
      mathfields.length > 1
        ? mathfields.some((mf) => mf.value !== '')
        : (this as MathfieldElement).value !== ''
    if (hasAnswer) {
      if ($canOptions.questionGetAnswer[index] !== true) {
        $canOptions.questionGetAnswer[index] = true
      }
    } else {
      if ($canOptions.questionGetAnswer[index] !== false) {
        $canOptions.questionGetAnswer[index] = false
      }
    }
  }

  function handleMathfieldFocus(this: MathfieldElement) {
    ensureKeyboardVisibleForMathfield(this)
  }

  function handleMultiMathfieldElement(ev: Event) {
    const mf = ev.currentTarget
    if ((mf as MathfieldElement).value !== '') {
      if ($canOptions.questionGetAnswer[index] !== true) {
        $canOptions.questionGetAnswer[index] = true
      }
    } else {
      if ($canOptions.questionGetAnswer[index] !== false) {
        $canOptions.questionGetAnswer[index] = false
      }
    }
  }

  function syncTextfieldsState() {
    const textfields = questionContainer?.querySelectorAll(
      'mathalea-textfield',
    ) as NodeListOf<MathaleaTextfieldElement>
    const hasAnswer = Array.from(textfields ?? []).some(
      (textfield) => textfield.value !== '',
    )
    if ($canOptions.questionGetAnswer[index] !== hasAnswer) {
      $canOptions.questionGetAnswer[index] = hasAnswer
    }
  }

  function handleTextfieldElement(_ev: Event) {
    syncTextfieldsState()
  }

  function syncListeDeroulantesState() {
    const listesDeroulantes = questionContainer?.querySelectorAll(
      '[id^="liste-deroulanteEx"]',
    ) as NodeListOf<ListeDeroulanteElement>
    const hasAnswer = Array.from(listesDeroulantes ?? []).some(
      (listeDeroulante) => listeDeroulante.value !== '',
    )
    if ($canOptions.questionGetAnswer[index] !== hasAnswer) {
      $canOptions.questionGetAnswer[index] = hasAnswer
    }
  }

  function handleListeDeroulanteElement(_ev: Event) {
    syncListeDeroulantesState()
  }

  function ensureKeyboardVisibleForMathfield(mf: MathfieldElement) {
    if (mf.readOnly || mf.classList.contains('corrected')) {
      return
    }
    if (!$keyboardState.isVisible || $keyboardState.idMathField !== mf.id) {
      $keyboardState.idMathField = mf.id
      $keyboardState.isVisible = true
    }
  }

  function updateInteractivity() {
    if (isLocked) return
    if (questionContainer) {
      const multiMf = questionContainer.querySelector('multi-mathfield')
      // gestion des MultiMathfield
      if (multiMf != null) {
        const shadowRoot = multiMf.shadowRoot
        if (shadowRoot) {
          const mathfields = Array.from(
            shadowRoot.querySelectorAll('math-field'),
          ) as MathfieldElement[]
          for (const mf of mathfields) {
            if (!mf.dataset.canListenerAdded) {
              mf.dataset.canListenerAdded = 'true' // Marquer comme ajouté
              mf.addEventListener('input', handleMultiMathfieldElement)
              mf.addEventListener('focusin', handleMathfieldFocus)
            }
          }
          window.setTimeout(() => {
            // Ne focus le premier mathfield que si aucun n'a le focus dans le shadowRoot
            const hasFocus =
              shadowRoot.activeElement &&
              mathfields.includes(shadowRoot.activeElement as MathfieldElement)
            if (!hasFocus) {
              const mf = mathfields[0]
              if (mf) {
                mf.focus()
                ensureKeyboardVisibleForMathfield(mf)
              }
            } else if (shadowRoot.activeElement) {
              ensureKeyboardVisibleForMathfield(
                shadowRoot.activeElement as MathfieldElement,
              )
            }
          }, 0)
        }
        return
      }

      const metaI2d = questionContainer.querySelectorAll('.metaInteractif2d')
      // gestion des metaInteractif2d
      if (metaI2d != null && metaI2d.length > 0) {
        console.info('Je gère le metaInteractif2d')
        const listeMf = Array.from(metaI2d) as MathfieldElement[]
        for (const mf of listeMf) {
          if (!mf.dataset.canListenerAdded) {
            mf.dataset.canListenerAdded = 'true' // Marquer comme ajouté
            mf.addEventListener('input', handleMathfieldElement)
          }
          $keyboardState.idMathField = mf.id
          window.setTimeout(() => {
            const hasFocus =
              document.activeElement &&
              listeMf.includes(document.activeElement as MathfieldElement)
            if (!hasFocus) {
              const mf = listeMf[0]
              if (mf) {
                mf.focus()
                ensureKeyboardVisibleForMathfield(mf)
              }
            } else if (document.activeElement) {
              ensureKeyboardVisibleForMathfield(
                document.activeElement as MathfieldElement,
              )
            }
          }, 0)
        }
        return
      }

      const mathfields = Array.from(
        questionContainer?.querySelectorAll('math-field') ?? [],
      ) as MathfieldElement[]
      const mf = questionContainer?.querySelector(
        'math-field',
      ) as MathfieldElement
      if (mf) {
        for (const mathfield of mathfields) {
          if (!mathfield.dataset.canListenerAdded) {
            mathfield.dataset.canListenerAdded = 'true' // Marquer comme ajouté
            mathfield.addEventListener('input', handleMathfieldElement)
            mathfield.addEventListener('focusin', handleMathfieldFocus)
          }
        }
        $keyboardState.idMathField = mf.id
        window.setTimeout(() => {
          // Sur Safari, notamment dans un iframe, document.activeElement peut
          // rester sur le document hôte alors que le focus est dans le shadow
          // DOM de MathLive. `:focus-within` conserve l'information du champ
          // réellement visé et évite de refocaliser le premier champ.
          const activeMathfield = mathfields.find((mathfield) =>
            mathfield.matches(':focus-within'),
          )
          if (activeMathfield) {
            ensureKeyboardVisibleForMathfield(activeMathfield)
          } else {
            mf.focus()
            ensureKeyboardVisibleForMathfield(mf)
          }
        }, 0)
        return
      }

      const textfields = questionContainer?.querySelectorAll(
        'mathalea-textfield',
      ) as NodeListOf<MathaleaTextfieldElement>
      if (textfields.length > 0) {
        $keyboardState.isVisible = false
        for (const textfield of textfields) {
          if (!textfield.dataset.listenerAdded) {
            textfield.dataset.listenerAdded = 'true' // Marquer comme ajouté
            textfield.addEventListener('input', handleTextfieldElement)
          }
        }
        syncTextfieldsState()
        return
      }

      const figureCliquables = Array.from(
        questionContainer?.querySelectorAll<FigureClicable>(
          '[id^="cliquefigure"]',
        ),
      ) as FigureClicable[]
      if (figureCliquables.length > 0) {
        $keyboardState.isVisible = false
        for (const [index, figureCliquable] of figureCliquables.entries()) {
          questionCliqueFigure(figureCliquable as FigureClicable, index)
          if (!figureCliquable.dataset.listenerAdded) {
            figureCliquable.dataset.listenerAdded = 'true' // Marquer comme ajouté
            figureCliquable.addEventListener('click', () => {
              const val = Array.from(figureCliquables).reduce((acc, b) => {
                if ((b as any).etat) {
                  acc = true
                }
                return acc
              }, false)
              // au moins une figure cochée
              if ($canOptions.questionGetAnswer[index] !== val) {
                $canOptions.questionGetAnswer[index] = val
              }
            })
          }
        }
        return
      }

      const clocks = questionContainer?.querySelectorAll<HTMLInputElement>(
        '[id^="interactive-clockEx"]',
      )
      if (clocks.length > 0) {
        $keyboardState.isVisible = false
        if (!clocks[0].dataset.listenerAdded) {
          clocks[0].dataset.listenerAdded = 'true' // Marquer comme ajouté
          clocks[0].addEventListener('click', () => {
            if ($canOptions.questionGetAnswer[index] !== true) {
              $canOptions.questionGetAnswer[index] = true
            }
          })
        }
        return
      }

      const qcm = questionContainer?.querySelectorAll<HTMLInputElement>(
        'input[id^="checkEx"]',
      )
      if (qcm.length > 0) {
        $keyboardState.isVisible = false
        for (const box of qcm) {
          if (!box.dataset.listenerAdded) {
            box.dataset.listenerAdded = 'true' // Marquer comme ajouté
            box.addEventListener('click', () => {
              const val = Array.from(qcm).reduce((acc, b) => {
                if (b.checked) {
                  acc = true
                }
                return acc
              }, false)
              // au moins 1 coché
              if ($canOptions.questionGetAnswer[index] !== val) {
                $canOptions.questionGetAnswer[index] = val
              }
            })
          }
        }
        return
      }

      const apigeoms =
        questionContainer?.querySelectorAll<HTMLElement>('[id^="apigeom"]')
      if (apigeoms.length > 0) {
        $keyboardState.isVisible = false
        if (!apigeoms[0].dataset.listenerAdded) {
          function handleApigeomClick(this: HTMLElement, ev: Event) {
            // MGu: il faudrait faire mieux mais bon...
            // Un click sur la figure ne fonctionne pas car dans apigeom, il ne se propage pas...
            // donc on surveille mouseleave ou touchend est suffisant pour valider la question
            if ($canOptions.questionGetAnswer[index] !== true) {
              $canOptions.questionGetAnswer[index] = true
            }
          }
          const figureSvg = apigeoms[0].querySelector('#divFigure > svg')
          if (figureSvg) {
            apigeoms[0].dataset.listenerAdded = 'true' // Marquer comme ajouté
            figureSvg.addEventListener('pointerleave', handleApigeomClick)
          } else {
            // Le SVG peut être injecté avec un léger délai: on retente ensuite.
            window.setTimeout(() => {
              if (visible) {
                updateInteractivity()
              }
            }, 50)
          }
        }
        return
      }

      const listesDeroulantes = questionContainer?.querySelectorAll(
        '[id^="liste-deroulanteEx"]',
      ) as NodeListOf<ListeDeroulanteElement>
      if (listesDeroulantes.length > 0) {
        $keyboardState.isVisible = false
        for (const listeDeroulante of listesDeroulantes) {
          if (!listeDeroulante.dataset.listenerAdded) {
            listeDeroulante.dataset.listenerAdded = 'true'
            listeDeroulante.addEventListener(
              'change',
              handleListeDeroulanteElement,
            )
          }
        }
        syncListeDeroulantesState()
        return
      }

      const rectangles = questionContainer?.querySelectorAll<HTMLInputElement>(
        '[id^="rectangle"].rectangleDND',
      )
      if (rectangles.length > 0) {
        $keyboardState.isVisible = false
        for (const rectangle of rectangles) {
          if (!rectangle.dataset.listenerAdded) {
            rectangle.dataset.listenerAdded = 'true' // Marquer comme ajouté
            const onHoverEnd = function () {
              const divCount = rectangle.querySelectorAll(':scope > div').length
              if (divCount > 0) {
                if ($canOptions.questionGetAnswer[index] !== true) {
                  $canOptions.questionGetAnswer[index] = true
                }
              } else {
                if ($canOptions.questionGetAnswer[index] !== false) {
                  $canOptions.questionGetAnswer[index] = false
                }
              }
            }
            rectangle.addEventListener('mouseleave', onHoverEnd)
            rectangle.addEventListener('touchend', onHoverEnd)
            // Dépôt au clavier ou au clic : ni survol ni toucher à attendre.
            rectangle.addEventListener('dnd-change', onHoverEnd)
          }
        }
        return
      }
    }
  }
</script>

<div
  id="question-content-{index}"
  data-prefixe-champs="Question {index + 1}"
  class={visible
    ? 'px-4 md:px-20 lg:px-32 flex flex-col justify-center items-center font-normal leading-relaxed h-[100%]  w-[100%] text-center'
    : 'hidden'}
  bind:this={questionContainer}
>
  {#if mode === 'display' || mode === 'correction'}
    <div
      style="padding:15px;"
      class="flex flex-col overflow-x-auto overflow-y-auto"
    >
      <div class="text-pretty">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html consigne}
      </div>
      <div class="text-pretty" style="">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html question}
      </div>
    </div>
  {/if}

  {#if mode === 'correction'}
    <div
      class="relative flex p-4 mt-10 bg-coopmaths-warn-200 dark:bg-coopmathsdark-warn-lightest text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <div class="text-pretty">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html consigneCorrection}
      </div>
      <div class="text-pretty">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html correction}
      </div>
      <div
        class="flex absolute top-8 -left-12 font-bold text-xl text-coopmaths-warn-1000 dark:text-coopmathsdark-warn-dark -rotate-90"
      >
        Solution
      </div>
    </div>
  {/if}
</div>
