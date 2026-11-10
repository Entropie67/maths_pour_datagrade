import { addDeleteButton, retirerEtiquette } from './DragAndDrop'

/*
Alternative au glisser pour le custom element drag-and-drop (RGAA 7.3 et 13.10).

Le clavier et le clic partagent le même modèle : on sélectionne une étiquette,
puis on active la zone où la déposer. Tout est ajouté à l'hydratation : le HTML
généré par DragAndDrop ne change pas, et un MutationObserver tient à jour les
noms accessibles après un glisser, le rendu KaTeX ou une restauration de réponses.

Une étiquette déposée et sa zone ne peuvent pas être imbriquées en role="button" :
la zone reçoit donc un vrai bouton (.zoneDepotDND) et le « x » reste réservé au
pointeur. Le retrait passe par Suppr ou par le bouton .retirerDND.
*/

const SYMBOLES_LUS: Record<string, string> = {
  '×': 'fois',
  '·': 'fois',
  '÷': 'divisé par',
  '+': 'plus',
  '−': 'moins',
  '-': 'moins',
  '=': 'égale',
  '<': 'inférieur à',
  '>': 'supérieur à',
  '≤': 'inférieur ou égal à',
  '⩽': 'inférieur ou égal à',
  '≥': 'supérieur ou égal à',
  '⩾': 'supérieur ou égal à',
  '%': 'pour cent',
}

function mathmlEnTexte(noeud: Element): string {
  const enfants = Array.from(noeud.children)
  const lire = (index: number) =>
    enfants[index] ? mathmlEnTexte(enfants[index]) : ''
  switch (noeud.localName) {
    case 'annotation':
    case 'annotation-xml':
    case 'mspace':
      return ''
    case 'semantics':
      return lire(0)
    case 'mfrac':
      return `${lire(0)} sur ${lire(1)}`
    case 'msup':
      return `${lire(0)} exposant ${lire(1)}`
    case 'msub':
      return `${lire(0)} indice ${lire(1)}`
    case 'msqrt':
      return `racine carrée de ${enfants.map(mathmlEnTexte).join(' ')}`
    case 'mo': {
      const symbole = (noeud.textContent ?? '').trim()
      return SYMBOLES_LUS[symbole] ?? symbole
    }
    default:
      return enfants.length > 0
        ? enfants.map(mathmlEnTexte).join(' ')
        : (noeud.textContent ?? '')
  }
}

function normaliserTexteLu(texte: string): string {
  return (
    texte
      .replace(/\s+/gu, ' ')
      // Les chiffres d'un même nombre restent groupés : « 12 345,6 » se lit d'un bloc.
      .replace(/(\d) ?, ?(?=\d)/gu, '$1,')
      .replace(/(\d) (?=\d)/gu, '$1')
      .trim()
  )
}

/** Le texte d'un contenu d'étiquette tel qu'il doit être lu, formules comprises. */
export function texteLisible(element: Element): string {
  const parcourir = (noeud: Node): string => {
    if (noeud.nodeType === 3) return noeud.textContent ?? ''
    if (noeud.nodeType !== 1) return ''
    const enfant = noeud as Element
    if (enfant.matches('.delete-btn, [aria-hidden="true"]')) return ''
    if (enfant.localName === 'img') return enfant.getAttribute('alt') ?? ''
    if (enfant.localName === 'math') return ` ${mathmlEnTexte(enfant)} `
    return Array.from(enfant.childNodes).map(parcourir).join('')
  }
  return normaliserTexteLu(
    Array.from(element.childNodes).map(parcourir).join(''),
  )
}

/**
 * Pas de <button> natif : par défaut, Safari ne les atteint pas avec Tab, alors
 * qu'il atteint tout élément portant un tabindex.
 */
function creerBouton(classe: string): HTMLElement {
  const bouton = document.createElement('span')
  bouton.className = classe
  bouton.setAttribute('role', 'button')
  bouton.tabIndex = 0
  return bouton
}

function definirAttribut(element: Element, nom: string, valeur: string | null) {
  if (valeur == null) element.removeAttribute(nom)
  else if (element.getAttribute(nom) !== valeur) {
    element.setAttribute(nom, valeur)
  }
}

export function attachDragAndDropAccessibility({
  root,
  numeroExercice,
  question,
}: {
  root: HTMLElement
  numeroExercice: number
  question: number
}): () => void {
  const reserve = root.querySelector<HTMLElement>(
    `#etiquettesEx${numeroExercice}Q${question}`,
  )
  const conteneurZones = root.querySelector<HTMLElement>(
    `#rectanglesEx${numeroExercice}Q${question}`,
  )
  if (reserve == null || conteneurZones == null) return () => {}
  const zones = Array.from(
    conteneurZones.querySelectorAll<HTMLElement>('.rectangleDND'),
  )

  let selection: HTMLElement | null = null
  let tabulationReserve: HTMLElement | null = null
  let zoneDuBoutonSupprimer: HTMLElement | null = null

  const statut = document.createElement('div')
  statut.className = 'sr-only'
  statut.setAttribute('role', 'status')
  statut.setAttribute('aria-live', 'polite')

  const aide = document.createElement('p')
  aide.className = 'aideDND'
  aide.id = `aideDNDEx${numeroExercice}Q${question}`
  aide.textContent =
    'Parcourir les étiquettes avec les flèches. Sélectionner avec Entrée ou Espace. Aller à une zone avec Tab puis déposer avec Entrée. Annuler avec Échap. Retirer une étiquette déposée avec Suppr.'

  const boutonRetirer = creerBouton('retirerDND')
  boutonRetirer.textContent = "Retirer l'étiquette sélectionnée"
  boutonRetirer.hidden = true

  reserve.before(statut, aide)
  reserve.after(boutonRetirer)
  reserve.setAttribute('role', 'group')
  reserve.setAttribute('aria-label', 'Étiquettes disponibles')
  conteneurZones.setAttribute('role', 'group')
  conteneurZones.setAttribute('aria-label', 'Zones de dépôt')

  for (const zone of zones) zone.prepend(creerBouton('zoneDepotDND'))

  const boutonDeZone = (zone: HTMLElement) =>
    zone.querySelector<HTMLElement>(':scope > .zoneDepotDND')
  const nomZone = (zone: HTMLElement) =>
    zone.dataset.nomZone ??
    `Zone ${zones.indexOf(zone) + 1} sur ${zones.length}`
  const etiquettesVisibles = (parent: Element) =>
    Array.from(parent.querySelectorAll<HTMLElement>('.etiquette')).filter(
      (etiquette) => etiquette.style.display !== 'none',
    )

  let derniereAnnonce = ''
  function annoncer(message: string) {
    // Un message identique au précédent ne serait pas relu par certains lecteurs d'écran.
    derniereAnnonce =
      message === derniereAnnonce
        ? `${message}${String.fromCharCode(160)}`
        : message
    statut.textContent = derniereAnnonce
  }

  function synchroniser() {
    if (selection != null && !root.contains(selection)) selection = null
    const dansReserve = etiquettesVisibles(reserve as HTMLElement)
    if (tabulationReserve == null || !dansReserve.includes(tabulationReserve)) {
      tabulationReserve = dansReserve[0] ?? null
    }
    for (const etiquette of root.querySelectorAll<HTMLElement>('.etiquette')) {
      if (etiquette.style.display === 'none') {
        // Emplacement réservé par le glisser tactile : jamais atteignable.
        etiquette.removeAttribute('tabindex')
        continue
      }
      const zone = etiquette.closest<HTMLElement>('.rectangleDND')
      if (zone != null && !etiquette.querySelector(':scope > .delete-btn')) {
        addDeleteButton(etiquette) // Étiquette restaurée depuis une réponse enregistrée.
      }
      const nom = texteLisible(etiquette)
      definirAttribut(etiquette, 'role', 'button')
      definirAttribut(
        etiquette,
        'aria-label',
        zone == null ? nom : `${nom}, dans ${nomZone(zone)}`,
      )
      definirAttribut(
        etiquette,
        'aria-pressed',
        etiquette === selection ? 'true' : 'false',
      )
      definirAttribut(
        etiquette,
        'tabindex',
        zone != null || etiquette === tabulationReserve ? '0' : '-1',
      )
      definirAttribut(
        etiquette,
        'aria-describedby',
        zone == null ? aide.id : null,
      )
    }
    for (const zone of zones) {
      const contenu = etiquettesVisibles(zone).map(texteLisible)
      const bouton = boutonDeZone(zone)
      if (bouton != null) {
        definirAttribut(
          bouton,
          'aria-label',
          `${nomZone(zone)}, ${contenu.length > 0 ? `contient ${contenu.join(' ; ')}` : 'vide'}`,
        )
      }
    }
    boutonRetirer.hidden = selection?.closest('.rectangleDND') == null
    root.classList.toggle('selectionDND', selection != null)
  }

  function signalerChangement(...zonesTouchees: (HTMLElement | null)[]) {
    // Pour la vue CAN, qui suit l'état « répondu » de la question depuis ses zones.
    for (const zone of new Set(zonesTouchees)) {
      zone?.dispatchEvent(new CustomEvent('dnd-change'))
    }
  }

  function selectionner(etiquette: HTMLElement) {
    selection = etiquette
    synchroniser()
    annoncer(`${texteLisible(etiquette)} sélectionné.`)
  }

  function annulerSelection() {
    selection = null
    synchroniser()
    annoncer('Sélection annulée.')
  }

  function deposer(
    etiquette: HTMLElement,
    zone: HTMLElement,
    reference?: { cible: HTMLElement; position: 'avant' | 'apres' },
  ) {
    const zoneOrigine = etiquette.closest<HTMLElement>('.rectangleDND')
    let deposee = etiquette
    if (zoneOrigine == null && etiquette.classList.contains('duplicable')) {
      deposee = etiquette.cloneNode(true) as HTMLElement
      deposee.id = `${etiquette.id}-clone-${Date.now()}`
    }
    if (zoneOrigine == null) addDeleteButton(deposee, reserve)
    if (reference == null) zone.appendChild(deposee)
    else if (reference.position === 'avant') reference.cible.before(deposee)
    else reference.cible.after(deposee)
    selection = null
    synchroniser()
    annoncer(`${texteLisible(deposee)} déposé dans ${nomZone(zone)}.`)
    signalerChangement(zoneOrigine, zone)
    // La cible reste en place : le focus n'est jamais perdu avec l'étiquette déplacée.
    ;(reference?.cible ?? boutonDeZone(zone))?.focus()
  }

  function retirer(
    etiquette: HTMLElement,
    focusApres: () => HTMLElement | null,
  ) {
    const zone = etiquette.closest<HTMLElement>('.rectangleDND')
    if (zone == null) return
    const nom = texteLisible(etiquette)
    retirerEtiquette(etiquette)
    selection = null
    synchroniser()
    annoncer(`${nom} retiré de ${nomZone(zone)}.`)
    signalerChangement(zone)
    focusApres()?.focus()
  }

  function activerEtiquette(etiquette: HTMLElement, clientX?: number) {
    if (selection == null) {
      selectionner(etiquette)
    } else if (selection === etiquette) {
      annulerSelection()
    } else {
      const zone = etiquette.closest<HTMLElement>('.rectangleDND')
      if (zone == null) {
        selectionner(etiquette)
      } else {
        const bords = etiquette.getBoundingClientRect()
        const apres = clientX != null && clientX >= bords.left + bords.width / 2
        deposer(selection, zone, {
          cible: etiquette,
          position: apres ? 'apres' : 'avant',
        })
      }
    }
  }

  const surClicCapture = (e: Event) => {
    const bouton = (e.target as Element).closest('.delete-btn')
    zoneDuBoutonSupprimer =
      bouton?.closest<HTMLElement>('.rectangleDND') ?? null
    const etiquette = bouton?.closest('.etiquette')
    if (etiquette != null && etiquette === selection) selection = null
  }

  const surClic = (e: Event) => {
    const cible = e.target as Element
    if (cible.closest('.delete-btn')) {
      // Le bouton « x » vient de déplacer ou de supprimer l'étiquette qui le portait.
      synchroniser()
      const zone = zoneDuBoutonSupprimer
      zoneDuBoutonSupprimer = null
      if (zone != null) {
        annoncer(`Étiquette retirée de ${nomZone(zone)}.`)
        signalerChangement(zone)
        boutonDeZone(zone)?.focus()
      }
      return
    }
    if (cible === boutonRetirer) {
      if (selection != null) {
        const etiquette = selection
        retirer(etiquette, () =>
          root.contains(etiquette) ? etiquette : tabulationReserve,
        )
      }
      return
    }
    const etiquette = cible.closest<HTMLElement>('.etiquette')
    if (etiquette != null) {
      const estClicSouris = (e as MouseEvent).detail > 0
      activerEtiquette(
        etiquette,
        estClicSouris ? (e as MouseEvent).clientX : undefined,
      )
      return
    }
    const zone = cible.closest<HTMLElement>('.rectangleDND')
    if (zone != null) {
      if (selection != null) deposer(selection, zone)
      else annoncer("Sélectionner d'abord une étiquette.")
      return
    }
    if (reserve.contains(cible) && selection != null) {
      const etiquette = selection
      retirer(etiquette, () =>
        root.contains(etiquette) ? etiquette : tabulationReserve,
      )
    }
  }

  const surToucheEnfoncee = (e: Event) => {
    const evenement = e as KeyboardEvent
    const cible = evenement.target as HTMLElement
    const etiquette = cible.classList.contains('etiquette') ? cible : null
    const toucheTraitee = () => {
      evenement.preventDefault()
      evenement.stopPropagation()
    }
    if (evenement.key === 'Escape') {
      if (selection == null) return
      toucheTraitee()
      const selectionnee = selection
      annulerSelection()
      selectionnee.focus()
      return
    }
    if (
      cible.matches('.zoneDepotDND, .retirerDND') &&
      (evenement.key === 'Enter' || evenement.key === ' ')
    ) {
      toucheTraitee()
      if (!evenement.repeat) cible.click()
      return
    }
    if (etiquette == null) return
    const dansReserve = reserve.contains(etiquette)
    switch (evenement.key) {
      case 'Enter':
      case ' ':
        toucheTraitee()
        if (!evenement.repeat) activerEtiquette(etiquette)
        break
      case 'Delete':
      case 'Backspace':
        if (!dansReserve) {
          toucheTraitee()
          const zone = etiquette.closest<HTMLElement>('.rectangleDND')
          retirer(etiquette, () => (zone ? boutonDeZone(zone) : null))
        }
        break
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        if (dansReserve) {
          toucheTraitee()
          const liste = etiquettesVisibles(reserve)
          const index = liste.indexOf(etiquette)
          const destination = {
            ArrowRight: index + 1,
            ArrowDown: index + 1,
            ArrowLeft: index - 1 + liste.length,
            ArrowUp: index - 1 + liste.length,
            Home: 0,
            End: liste.length - 1,
          }[evenement.key]
          liste[destination % liste.length]?.focus()
        }
        break
    }
  }

  const surToucheRelachee = (e: Event) => {
    // L'aide reste affichée une fois révélée : si elle se repliait quand le focus
    // change, la page bougerait entre l'appui et le relâchement d'un clic de souris.
    if ((e as KeyboardEvent).key === 'Tab') {
      aide.classList.add('aideVisibleDND')
    }
    // La vue CAN passe à la question suivante au relâchement d'Entrée.
    if (
      (e as KeyboardEvent).key === 'Enter' &&
      (e.target as Element).matches('.etiquette, .zoneDepotDND, .retirerDND')
    ) {
      e.stopPropagation()
    }
  }

  const surFocus = (e: Event) => {
    const cible = e.target as HTMLElement
    if (
      cible.classList.contains('etiquette') &&
      reserve.contains(cible) &&
      cible !== tabulationReserve
    ) {
      tabulationReserve = cible
      synchroniser()
    }
  }

  const surDebutGlisser = () => {
    if (selection != null) {
      selection = null
      synchroniser()
    }
  }

  const ecouteurs: [string, EventListener, boolean][] = [
    ['click', surClicCapture, true],
    ['click', surClic, false],
    ['keydown', surToucheEnfoncee, false],
    ['keyup', surToucheRelachee, false],
    ['focusin', surFocus, false],
    ['dragstart', surDebutGlisser, false],
    ['touchmove', surDebutGlisser, false],
  ]
  for (const [type, ecouteur, capture] of ecouteurs) {
    root.addEventListener(type, ecouteur, capture)
  }

  const observateur = new MutationObserver(synchroniser)
  observateur.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
  })
  synchroniser()

  return () => {
    observateur.disconnect()
    for (const [type, ecouteur, capture] of ecouteurs) {
      root.removeEventListener(type, ecouteur, capture)
    }
    statut.remove()
    aide.remove()
    boutonRetirer.remove()
    root.classList.remove('selectionDND')
    for (const zone of zones) boutonDeZone(zone)?.remove()
    for (const conteneur of [reserve, conteneurZones]) {
      conteneur.removeAttribute('role')
      conteneur.removeAttribute('aria-label')
    }
    for (const etiquette of root.querySelectorAll('.etiquette')) {
      for (const attribut of [
        'role',
        'tabindex',
        'aria-label',
        'aria-pressed',
        'aria-describedby',
      ]) {
        etiquette.removeAttribute(attribut)
      }
    }
  }
}
