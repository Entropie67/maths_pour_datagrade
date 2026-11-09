import { beforeEach, describe, expect, it } from 'vitest'

// Assure-toi d'importer le custom element pour l'enregistrer
import '../../src/lib/customElements/ListeDeroulanteElement'

describe('<liste-deroulante>', () => {
  let el: HTMLElement

  beforeEach(() => {
    document.body.innerHTML = ''
    el = document.createElement('liste-deroulante')
    el.setAttribute(
      'choices',
      encodeURIComponent(
        JSON.stringify([
          { label: 'Choisir une des réponses suivantes :', value: '' },
          { label: 'admet une unique solution', value: 'aucune' },
          { label: "n'admet pas de solution", value: 'unique' },
          { label: 'admet une infinité de solutions', value: 'inf' },
        ]),
      ),
    )
    document.body.appendChild(el)
  })

  it('affiche les choix et sélectionne une option', async () => {
    // Simule la sélection d'une option via l'API JS du composant
    // (adapte selon l'API de ton composant)
    // Par exemple, si tu exposes une méthode select(index)
    // @ts-ignore
    el._listeDeroulante?.select(1)
    // Vérifie la valeur sélectionnée
    // @ts-ignore
    expect(el.value).toBe('aucune')
  })
})
