import katex from 'katex'
import { beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import { DragAndDropElement } from '../../src/lib/customElements/DragAndDropElement'
import DragAndDrop from '../../src/lib/interactif/DragAndDrop'
import { texteLisible } from '../../src/lib/interactif/dragAndDropAccessible'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import { setOutputHtml } from '../../src/modules/context'

function preparer({ duplicable = false } = {}) {
  const exercice = new Exercice()
  exercice.numeroExercice = 0
  exercice.interactif = true
  const dnd = new DragAndDrop({
    exercice,
    question: 0,
    consigne: '',
    enonceATrous: '%{rectangle1} et %{rectangle2}',
    etiquettes: [
      [
        { id: 'a', contenu: 'alpha' },
        { id: 'b', contenu: 'beta' },
      ],
    ],
    nomsZones: ['Première zone'],
  })
  exercice.dragAndDrops = [dnd as never]
  handleAnswers(
    exercice,
    0,
    {
      rectangle1: { value: 'a' },
      rectangle2: { value: 'b' },
    },
    { formatInteractif: 'dnd' },
  )
  document.body.innerHTML = dnd.ajouteDragAndDrop({
    melange: false,
    duplicable,
  })
  const element = document.querySelector('drag-and-drop') as DragAndDropElement
  element.querySelectorAll<HTMLElement>('.etiquette').forEach((etiquette) => {
    Object.defineProperty(etiquette, 'innerText', {
      get: () => etiquette.textContent ?? '',
    })
  })
  return { exercice, element }
}

const etiquette = (id: string) =>
  document.getElementById(`etiquetteEx0Q0I${id}`) as HTMLElement
const zone = (k: number) =>
  document.getElementById(`rectangleEx0Q0R${k}`) as HTMLElement
const boutonZone = (k: number) =>
  zone(k).querySelector<HTMLButtonElement>(':scope > .zoneDepotDND')!
const statut = () => document.querySelector('[role="status"]')?.textContent
function touche(cible: Element, key: string) {
  const evenement = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  })
  cible.dispatchEvent(evenement)
  return evenement
}
const clic = (cible: Element) =>
  cible.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))

beforeEach(() => {
  setOutputHtml()
  document.body.innerHTML = ''
})

describe('texteLisible', () => {
  function rendu(latex: string) {
    const div = document.createElement('div')
    div.innerHTML = katex.renderToString(latex)
    return texteLisible(div)
  }

  it('lit les formules en français à partir du MathML, sans le LaTeX', () => {
    expect(rendu('\\dfrac{3}{4}')).toBe('3 sur 4')
    expect(rendu('\\times 100')).toBe('fois 100')
    expect(rendu('-2{,}33')).toBe('moins 2,33')
    expect(rendu('12\\,345')).toBe('12345')
    expect(rendu('5^{2}')).toBe('5 exposant 2')
  })

  it('ignore le bouton de suppression et lit le texte alternatif des images', () => {
    const div = document.createElement('div')
    div.innerHTML =
      'dix <img alt="une image" src="x.png"><button class="delete-btn">x</button>'
    expect(texteLisible(div)).toBe('dix une image')
  })
})

describe('glisser-déposer sans glisser', () => {
  it('expose étiquettes et zones sans modifier le HTML généré', () => {
    const { element } = preparer()
    expect(etiquette('a').getAttribute('role')).toBe('button')
    expect(etiquette('a').getAttribute('aria-label')).toBe('alpha')
    expect(etiquette('a').getAttribute('aria-pressed')).toBe('false')
    // Tabulation itinérante : un seul arrêt pour la réserve.
    expect(etiquette('a').getAttribute('tabindex')).toBe('0')
    expect(etiquette('b').getAttribute('tabindex')).toBe('-1')
    expect(boutonZone(1).getAttribute('aria-label')).toBe('Première zone, vide')
    expect(boutonZone(2).getAttribute('aria-label')).toBe('Zone 2 sur 2, vide')
    expect(element.value).toBe(JSON.stringify(['', '']))
  })

  it('un dépôt au clavier produit la même réponse vérifiée qu’un dépôt à la souris', () => {
    const { exercice } = preparer()
    touche(etiquette('a'), 'Enter')
    expect(etiquette('a').getAttribute('aria-pressed')).toBe('true')
    expect(statut()).toBe('alpha sélectionné.')
    clic(boutonZone(1))
    expect(statut()).toBe('alpha déposé dans Première zone.')
    expect(etiquette('a').parentElement).toBe(zone(1))
    expect(etiquette('a').getAttribute('aria-pressed')).toBe('false')
    expect(boutonZone(1).getAttribute('aria-label')).toBe(
      'Première zone, contient alpha',
    )
    touche(etiquette('b'), ' ')
    clic(boutonZone(2))
    const resultat = DragAndDropElement.verifQuestion(exercice, 0)
    expect(resultat.score).toEqual({ nbBonnesReponses: 1, nbReponses: 1 })
    expect(resultat.isOk).toBe(true)
    expect(exercice.answers?.rectangleDNDEx0Q0R1).toBe('etiquetteEx0Q0Ia')
    // Plus aucun attribut interactif après la vérification.
    expect(etiquette('a').hasAttribute('role')).toBe(false)
    expect(etiquette('a').hasAttribute('tabindex')).toBe(false)
    expect(document.querySelector('.zoneDepotDND')).toBeNull()
  })

  it('clone une étiquette duplicable, laisse l’originale et supprime le clone au retrait', () => {
    preparer({ duplicable: true })
    touche(etiquette('a'), 'Enter')
    clic(boutonZone(1))
    const clone = zone(1).querySelector<HTMLElement>('.etiquette')!
    expect(clone.id).toMatch(/^etiquetteEx0Q0Ia-clone-\d+$/)
    expect(etiquette('a').closest('[id^="etiquettesEx"]')).not.toBeNull()
    expect(clone.querySelectorAll('.delete-btn')).toHaveLength(1)
    touche(clone, 'Delete')
    expect(zone(1).querySelector('.etiquette')).toBeNull()
    expect(document.activeElement).toBe(boutonZone(1))
  })

  it('Échap annule, et réactiver l’étiquette désélectionne', () => {
    preparer()
    const echapSansSelection = touche(etiquette('a'), 'Escape')
    expect(echapSansSelection.defaultPrevented).toBe(false)
    touche(etiquette('a'), 'Enter')
    expect(touche(etiquette('a'), 'Escape').defaultPrevented).toBe(true)
    expect(etiquette('a').getAttribute('aria-pressed')).toBe('false')
    expect(statut()).toBe('Sélection annulée.')
    expect(document.activeElement).toBe(etiquette('a'))
    clic(etiquette('a'))
    clic(etiquette('a'))
    expect(etiquette('a').getAttribute('aria-pressed')).toBe('false')
  })

  it('insère avant une étiquette déposée pour permettre de réordonner', () => {
    preparer()
    clic(etiquette('a'))
    clic(zone(1))
    clic(etiquette('b'))
    expect(etiquette('b').getAttribute('aria-pressed')).toBe('true')
    touche(etiquette('a'), 'Enter')
    expect(
      Array.from(zone(1).querySelectorAll('.etiquette')).map((e) => e.id),
    ).toEqual(['etiquetteEx0Q0Ib', 'etiquetteEx0Q0Ia'])
    expect(document.activeElement).toBe(etiquette('a'))
  })

  it('le bouton de retrait n’apparaît que pour une étiquette déposée, et le « x » n’est pas tabulable', () => {
    preparer()
    const bouton = document.querySelector('.retirerDND') as HTMLButtonElement
    touche(etiquette('a'), 'Enter')
    expect(bouton.hidden).toBe(true)
    clic(boutonZone(1))
    const x = etiquette('a').querySelector('.delete-btn') as HTMLButtonElement
    expect(x.tabIndex).toBe(-1)
    expect(x.getAttribute('aria-hidden')).toBe('true')
    touche(etiquette('a'), 'Enter')
    expect(bouton.hidden).toBe(false)
    clic(bouton)
    expect(etiquette('a').closest('[id^="etiquettesEx"]')).not.toBeNull()
    expect(etiquette('a').querySelector('.delete-btn')).toBeNull()
    expect(bouton.hidden).toBe(true)
    expect(document.activeElement).toBe(etiquette('a'))
  })

  it('demande de sélectionner d’abord, et les flèches bouclent dans la réserve', () => {
    preparer()
    clic(boutonZone(1))
    expect(statut()).toBe("Sélectionner d'abord une étiquette.")
    etiquette('a').focus()
    touche(etiquette('a'), 'ArrowLeft')
    expect(document.activeElement).toBe(etiquette('b'))
    expect(etiquette('b').getAttribute('tabindex')).toBe('0')
    expect(etiquette('a').getAttribute('tabindex')).toBe('-1')
    touche(etiquette('b'), 'Home')
    expect(document.activeElement).toBe(etiquette('a'))
  })

  it('tient les noms à jour après une modification extérieure et signale le changement', async () => {
    preparer()
    let signaux = 0
    zone(2).addEventListener('dnd-change', () => signaux++)
    touche(etiquette('b'), 'Enter')
    clic(boutonZone(2))
    expect(signaux).toBe(1)
    zone(1).appendChild(etiquette('a')) // comme mathaleaWriteStudentPreviousAnswers
    await new Promise((resolve) => setTimeout(resolve))
    expect(boutonZone(1).getAttribute('aria-label')).toBe(
      'Première zone, contient alpha',
    )
    expect(etiquette('a').querySelectorAll('.delete-btn')).toHaveLength(1)
  })
})
