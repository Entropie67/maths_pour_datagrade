import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cea04'
export const refs = {
  'fr-fr': ['3AutoG13-3'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = 'Compléter une égalité avec le cosinus, le sinus ou la tangente dans un triangle rectangle'
export const dateDePublication = '11/08/2026'

const lengthButtonsAction = 'dnb-2026-centres-etrangers-q4-length-buttons'

const triangleJlk = (nom: string) => {
  const [sommet1, sommetRectangle, sommetAngle] = nom
  const B = pointAbstrait(0, 0, sommetRectangle, 'above')
  const C = pointAbstrait(3.5, 0, sommetAngle, 'below right')
  const A = pointAbstrait(0, -2.6, sommet1, 'below left')
  const objets = [polygoneAvecNom(A, C, B), codageAngleDroit(C, B, A)]
  return mathalea2d(
    { ...fixeBordures(objets), scale: 0.65, pixelsParCm: 25 },
    objets,
  )
}

const longueursTriangle = (nom: string): [string, string, string] => [
  `${nom[0]}${nom[1]}`,
  `${nom[0]}${nom[2]}`,
  `${nom[1]}${nom[2]}`,
]

/**
 * DNB Centres étrangers juin 2026 - Question 4
 * @author Jean-Claude Lhote
 */
export default class AutoQ4CentresEtrangersBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    registerLengthButtons()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { texteSansCasse: true }
  }

  enonce(nom?: string, fonctionTrigo?: 'cos' | 'sin' | 'tan') {
    if (nom == null || fonctionTrigo == null) {
      nom = creerNomDePolygone(3, 'Q')
      fonctionTrigo = choice(['cos', 'sin', 'tan'])
    }
    const [coteOppose, hypotenuse, coteAdjacent] = longueursTriangle(nom)
    const angle = `${nom[1]}${nom[2]}${nom[0]}`
    this.reponse =
      fonctionTrigo === 'cos'
        ? `\\dfrac{${coteAdjacent}}{${hypotenuse}}`
        : fonctionTrigo === 'sin'
          ? `\\dfrac{${coteOppose}}{${hypotenuse}}`
          : `\\dfrac{${coteOppose}}{${coteAdjacent}}`
    const colonne1 = `Compléter avec des longueurs des côtés du triangle $${nom}$ pour que l'égalité ci-dessous soit vraie.<br>
$\\${fonctionTrigo}\\left(\\widehat{${angle}}\\right)=\\dfrac{\\ldots}{\\ldots}$`
    this.question = deuxColonnesResp(colonne1, triangleJlk(nom), {
      largeur1: 65,
      widthmincol1: '320px',
      widthmincol2: '180px',
    })
    if (this.interactif && context.isHtml) {
      this.question += DomReadyActionElement.create({
        action: lengthButtonsAction,
        payload: {
          numeroExercice: this.numeroExercice,
          indiceQuestion: 0,
          longueurs: longueursTriangle(nom),
        },
      })
    }
    this.correction = `Dans le triangle $${nom}$ rectangle en $${nom[1]}$, par rapport à l'angle $\\widehat{${angle}}$, le côté opposé est $[${coteOppose}]$, le côté adjacent est $[${coteAdjacent}]$ et l'hypoténuse est $[${hypotenuse}]$.<br>
Donc $\\${fonctionTrigo}\\left(\\widehat{${angle}}\\right)=${miseEnEvidence(this.reponse)}$.`
  }
  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce('JLK', 'cos')
    } else {
      this.enonce()
    }
  }
}

let lengthButtonsRegistered = false

function registerLengthButtons() {
  if (lengthButtonsRegistered) return
  lengthButtonsRegistered = true
  DomReadyActionElement.registerCallback<{
    numeroExercice: number
    indiceQuestion: number
    longueurs: string[]
  }>(lengthButtonsAction, ({ element, payload }) => {
    element.innerHTML = ''
    element.classList.add('my-2', 'block')
    const wrapper = document.createElement('div')
    wrapper.className = 'inline-flex items-center gap-2 flex-wrap'
    const label = document.createElement('span')
    label.textContent = 'Longueurs possibles :'
    label.className = 'text-sm'
    wrapper.appendChild(label)

    const listeners: Array<{ button: HTMLButtonElement; onClick: () => void }> =
      []
    for (const longueur of payload.longueurs ?? []) {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = longueur
      button.className =
        'px-3 py-1 rounded border border-coopmaths-action text-sm font-medium hover:bg-coopmaths-action hover:text-coopmaths-canvas transition'
      const onClick = () => {
        const mathfield = document.getElementById(
          `champTexteEx${payload.numeroExercice}Q${payload.indiceQuestion}`,
        ) as {
          executeCommand?: (command: unknown) => void
          value?: string
        } | null
        if (mathfield?.executeCommand != null) {
          mathfield.executeCommand(['insert', longueur])
        } else if (mathfield != null) {
          mathfield.value = `${mathfield.value ?? ''}${longueur}`
        }
      }
      button.addEventListener('click', onClick)
      listeners.push({ button, onClick })
      wrapper.appendChild(button)
    }
    element.appendChild(wrapper)

    return () => {
      for (const { button, onClick } of listeners) {
        button.removeEventListener('click', onClick)
      }
      element.innerHTML = ''
    }
  })
}
