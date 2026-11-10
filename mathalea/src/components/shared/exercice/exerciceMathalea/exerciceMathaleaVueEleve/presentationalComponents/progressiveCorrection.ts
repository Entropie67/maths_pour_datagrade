/**
 * Insérer des volets indépendants dans l'énoncé HTML, sans modifier l'exercice
 * ni ses sorties papier. Ne découper que des listes ordonnées correspondantes.
 */
export function progressiveCorrection(
  question: string,
  correction: string,
  consigneCorrection = '',
): string {
  const enonce = document.createElement('template')
  enonce.innerHTML = question
  const corrige = document.createElement('template')
  corrige.innerHTML = correction

  function volet(html: string): HTMLElement {
    const details = document.createElement('details')
    details.className = 'correction-progressive relative my-2 ml-5'
    details.hidden = true
    const summary = document.createElement('summary')
    summary.className =
      'katex-ignore absolute -left-4 top-0 cursor-pointer text-xs text-coopmaths-action dark:text-coopmathsdark-action'
    summary.setAttribute('aria-label', 'Afficher ou masquer cette correction')
    summary.innerHTML = '<span class="sr-only">Correction</span>'
    const content = document.createElement('div')
    content.className =
      'border-l-[3px] border-coopmaths-struct dark:border-coopmathsdark-struct pl-4 text-coopmaths-corpus dark:text-coopmathsdark-corpus'
    content.innerHTML = consigneCorrection + html
    details.append(summary, content)
    return details
  }

  function listes(fragment: DocumentFragment): HTMLOListElement[] {
    return Array.from(fragment.children).filter(
      (node): node is HTMLOListElement => node instanceof HTMLOListElement,
    )
  }
  const questions = listes(enonce.content)
  const corrections = listes(corrige.content)
  const listeQ = questions[0]
  const listeC = corrections[0]
  if (
    questions.length === 1 &&
    corrections.length === 1 &&
    listeQ.className === listeC.className &&
    listeQ.type === listeC.type &&
    listeQ.start === listeC.start &&
    listeQ.children.length > 0 &&
    listeQ.children.length === listeC.children.length &&
    [...listeQ.children, ...listeC.children].every(
      (item) => item.tagName === 'LI',
    )
  ) {
    // Conserver l'explication commune dans chaque volet, et la conclusion
    // après la dernière sous-question. Les listes imbriquées restent intactes.
    const avant = document.createElement('div')
    const apres = document.createElement('div')
    let listeRencontree = false
    for (const node of Array.from(corrige.content.childNodes)) {
      if (node === listeC) listeRencontree = true
      else (listeRencontree ? apres : avant).append(node.cloneNode(true))
    }
    Array.from(listeQ.children).forEach((item, index) => {
      item.append(
        volet(
          avant.innerHTML +
            listeC.children[index].innerHTML +
            (index === listeQ.children.length - 1 ? apres.innerHTML : ''),
        ),
      )
    })
  } else if (correction.trim()) {
    enonce.content.append(volet(correction))
  }
  return enonce.innerHTML
}

/** Dévoiler uniquement la prochaine correction ; les volets repliés restent repliés. */
export function revealNextCorrection(root: HTMLElement): boolean {
  const next = root.querySelector<HTMLDetailsElement>(
    'details.correction-progressive[hidden]',
  )
  if (!next) return false
  next.hidden = false
  next.open = true
  return root.querySelector('details.correction-progressive[hidden]') !== null
}

/**
 * Nombre de volets de correction qu'un exercice produirait : une correction
 * pas à pas n'a d'intérêt que s'il y en a au moins deux (plusieurs questions
 * ou sous-questions).
 */
export function countCorrectionSteps(
  questions: string[],
  corrections: string[],
): number {
  const gabarit = document.createElement('template')
  return questions.reduce((total, question, index) => {
    gabarit.innerHTML = progressiveCorrection(question, corrections[index] ?? '')
    return (
      total + gabarit.content.querySelectorAll('details.correction-progressive').length
    )
  }, 0)
}
