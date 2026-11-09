import { miseEnEvidence } from '../../lib/outils/embellissements'
// on importe les fonctions nécessaires.
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { listeShapes2DInfos } from '../../lib/2d/figures2d/shapes2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { latex2d, type Latex2d } from '../../lib/2d/textes'
import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { createList } from '../../lib/format/lists'
import { deuxColonnesResp, troisColonnes } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { numAlpha, sp } from '../../lib/outils/outilString'
import type { Valeur } from '../../lib/types'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
// Ici ce sont les fonctions de la librairie maison 2d.js qui gèrent tout ce qui est graphique (SVG/tikz) et en particulier ce qui est lié à l'objet lutin

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

export const titre = 'Se déplacer et se repérer'
export const uuid = 'e9dac'

export const refs = {
  'fr-fr': ['6I1B-8'],
  'fr-2016': [],
  'fr-ch': [],
}
type Position = {
  x: number
  y: number
  angle: number
}

const directions = {
  0: '$\\uparrow$',
  90: '$\\rightarrow$',
  180: '$\\downarrow$',
  270: '$\\leftarrow$',
}
type Deplacement = 'avancer' | 'reculer'
type TypeDeRotation =
  | 'tournerD90'
  | 'tournerG90'
  | 'tournerD180'
  | 'tournerG180'
  | 'orienter90'
  | 'orienter-90'
  | 'orienter180'
  | 'orienter0'

const instructionsDeRotation: {
  typeDeRotation: TypeDeRotation | Deplacement
  traduction: string
  pictogramme: string
}[] = [
  {
    typeDeRotation: 'tournerD90',
    traduction: 'Tourner à droite de $90^\\circ$',
    pictogramme: '$\\circlearrowright$',
  },
  {
    typeDeRotation: 'tournerG90',
    traduction: 'Tourner à gauche de $90^\\circ$',
    pictogramme: '$\\circlearrowleft$',
  },
  {
    typeDeRotation: 'tournerD180',
    traduction: 'Faire demi-tour',
    pictogramme: '$\\leftrightarrows$',
  },
  {
    typeDeRotation: 'orienter90',
    traduction: "S'orienter vers l'Est",
    pictogramme: '$\\rightarrow$',
  },
  {
    typeDeRotation: 'orienter-90',
    traduction: "S'orienter vers l'Ouest",
    pictogramme: '$\\leftarrow$',
  },
  {
    typeDeRotation: 'orienter180',
    traduction: "S'orienter vers le Sud",
    pictogramme: '$\\downarrow$',
  },
  {
    typeDeRotation: 'orienter0',
    traduction: "S'orienter vers le Nord",
    pictogramme: '$\\uparrow$',
  },
  {
    typeDeRotation: 'avancer',
    traduction: 'Avancer',
    pictogramme: '$\\rhd$',
  },
  {
    typeDeRotation: 'reculer',
    traduction: 'Reculer',
    pictogramme: '$\\lhd$',
  },
]

function traduire(instruction: string): string {
  const inst = instructionsDeRotation.find(
    (s) => s.typeDeRotation === instruction,
  )
  if (!inst) {
    throw new Error(`Instruction inconnue : ${instruction}`)
  }
  return inst.traduction
}

function traduireEnPictogramme(instruction: string): string {
  const inst = instructionsDeRotation.find(
    (s) => s.typeDeRotation === instruction,
  )
  if (!inst) {
    throw new Error(`Instruction inconnue : ${instruction}`)
  }
  return inst.pictogramme
}

function angleToScratch(x: number) {
  if (x === 360) return 0
  return x % 360
}

function tournerOuBouger(
  position: Position,
  instruction: TypeDeRotation | Deplacement,
): Position {
  const nouvellePosition = { ...position }
  switch (instruction) {
    case 'tournerD90':
      nouvellePosition.angle = angleToScratch(nouvellePosition.angle + 90)
      break
    case 'tournerG90':
      nouvellePosition.angle = angleToScratch(nouvellePosition.angle + 270)
      break
    case 'tournerD180':
      nouvellePosition.angle = angleToScratch(nouvellePosition.angle + 180)
      break

    case 'orienter90':
      nouvellePosition.angle = 90
      break
    case 'orienter-90':
      nouvellePosition.angle = 270
      break
    case 'orienter180':
      nouvellePosition.angle = 180
      break
    case 'orienter0':
      nouvellePosition.angle = 0
      break
    case 'avancer':
      if (nouvellePosition.angle === 0) {
        nouvellePosition.y += 2
      } else if (nouvellePosition.angle === 90) {
        nouvellePosition.x += 2
      } else if (
        nouvellePosition.angle === 270 ||
        nouvellePosition.angle === -90
      ) {
        nouvellePosition.x -= 2
      } else if (
        nouvellePosition.angle === 180 ||
        nouvellePosition.angle === -180
      ) {
        nouvellePosition.y -= 2
      }
      break
    case 'reculer':
      if (nouvellePosition.angle === 0) {
        nouvellePosition.y -= 2
      } else if (nouvellePosition.angle === 90) {
        nouvellePosition.x -= 2
      } else if (
        nouvellePosition.angle === 270 ||
        nouvellePosition.angle === -90
      ) {
        nouvellePosition.x += 2
      } else if (
        nouvellePosition.angle === 180 ||
        nouvellePosition.angle === -180
      ) {
        nouvellePosition.y += 2
      }
      break
  }
  return nouvellePosition
}

/**
 * @author Jean-claude Lhote
 */
export default class DeplacerReperer extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireNumerique = [
      "Nombre d'instructions de déplacement",
      10,
    ]
    this.besoinFormulaire2CaseACocher = ['Avec instruction "reculer"', false]
    this.besoinFormulaire3Numerique = [
      "Types d'instructions",
      2,
      '1: pictogrammes\n2: texte',
    ]
    this.besoinFormulaire4Texte = [
      'Types de questions',
      'Nombres séparés par des tirets\n1: Donner la direction finale\n2: Donner la liste des positions successives\n3: Donner la liste des directions successives',
    ]
    this.sup4 = '1'
    this.sup = 3
    this.sup2 = false
    this.sup3 = 2
  }

  nouvelleVersion() {
    const typeDeQuestions = Array.from(
      new Set(
        gestionnaireFormulaireTexte({
          saisie: this.sup4,
          min: 1,
          max: 3,
          defaut: 1,
          melange: 0,
          nbQuestions: 10,
        }).map(Number),
      ),
    ).sort((a, b) => a - b)

    const withReculer = this.sup2
    const pictogrammes = this.sup3 === 1
    this.consigne = pictogrammes
      ? `Legende utilisée${sp()}:<br>
    ${instructionsDeRotation
      .map((s) => `${s.pictogramme}${sp()}: ${s.traduction}`)
      .join('<br>')}`
      : ''
    const tortue = listeShapes2DInfos['tortue'].shapeDef
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const positionDepart: Position = {
        x: 0,
        y: 0,
        angle: choice([0, 90, 180, 270]),
      }
      const positions: Position[] = [positionDepart]

      const sequence: string[] = []
      sequence.push(
        choice(
          instructionsDeRotation.filter((s) =>
            s.typeDeRotation.startsWith('orienter'),
          ),
        ).typeDeRotation,
      )
      for (let j = 0; j < Number(this.sup); j++) {
        sequence.push(withReculer ? choice(['avancer', 'reculer']) : 'avancer')
        sequence.push(
          choice(
            instructionsDeRotation.filter((s) =>
              s.typeDeRotation.startsWith('tour'),
            ),
          ).typeDeRotation,
        )
      }
      let positionCourante = {
        x: positionDepart.x,
        y: positionDepart.y,
        angle: positionDepart.angle,
      }
      const listItems: string[] = []
      for (let j = 0; j < sequence.length; j++) {
        positionCourante = tournerOuBouger(
          positionCourante,
          sequence[j] as TypeDeRotation | Deplacement,
        )
        listItems.push(
          pictogrammes
            ? traduireEnPictogramme(sequence[j])
            : `${traduire(sequence[j])}`, // $${miseEnEvidence(`\\leadsto ${positionCourante.x}, ${positionCourante.y}, ${directions[positionCourante.angle as 0 | 90 | 180 | 270]}`, 'blue')}$<br>`,
        )
        positions.push({
          x: positionCourante.x,
          y: positionCourante.y,
          angle: positionCourante.angle,
        })
      }
      const xmin = Math.min(...positions.map((p) => p.x)) - 2
      const xmax = Math.max(...positions.map((p) => p.x)) + 2
      const ymin = Math.min(...positions.map((p) => p.y)) - 2
      const ymax = Math.max(...positions.map((p) => p.y)) + 2
      const largeur = Math.max(12, xmax - xmin + 2)
      const hauteur = Math.max(12, ymax - ymin + 2)

      const laGrille = grille(
        xmin,
        ymin,
        xmin + largeur,
        ymin + hauteur,
        'black',
        2,
        2,
      )

      const numerosPositionsSuccessives = positions.map((p) => {
        const x = (p.x - xmin) / 2
        const y = (p.y - ymin) / 2
        return x + (largeur / 2) * y
      })

      let texte = `On programme un petit robot posé sur la case $${numerosPositionsSuccessives[0]}$ qui se déplace sur la grille selon la séquence suivante${sp()}:<br><br>`
      const numeros: Latex2d[] = []
      let numero = 0
      for (let y = ymin; y < ymin + hauteur; y += 2) {
        for (let x = xmin; x < xmin + largeur; x += 2) {
          numeros.push(
            latex2d(numero.toString(), x + 1, y + 1, {
              color:
                numero === numerosPositionsSuccessives[0] ? 'blue' : 'black',
              letterSize:
                numero === numerosPositionsSuccessives[0]
                  ? 'normalsize'
                  : 'small',
              gras: numero === numerosPositionsSuccessives[0] ? true : false,
            }),
          )
          numero++
        }
      }
      const caseDepart = carre(
        pointAbstrait(positionDepart.x, positionDepart.y),
        pointAbstrait(positionDepart.x + 2, positionDepart.y),
      )
      caseDepart.couleurDeRemplissage = colorToLatexOrHTML('yellow')
      const objets: NestedObjetMathalea2dArray = [
        laGrille,
        caseDepart,
        numeros,
        tortue,
      ]
      texte += pictogrammes
        ? deuxColonnesResp(
            `${listItems.join(sp(6))}`,
            mathalea2d(
              Object.assign({ pixelsParCm: 20 }, fixeBordures(objets)),
              objets,
            ),
            { largeur1: 30, widthmincol1: '50%', widthmincol2: '50%' },
          )
        : troisColonnes(
            pictogrammes
              ? listItems
                  .slice(0, Math.floor(listItems.length / 2))
                  .join(sp(6)) + '<br>'
              : createList({
                  items: listItems.slice(0, Math.floor(listItems.length / 2)),
                  style: 'fleches',
                }),
            pictogrammes
              ? listItems.slice(Math.floor(listItems.length / 2)).join(sp(6))
              : createList({
                  items: listItems.slice(Math.floor(listItems.length / 2)),
                  style: 'fleches',
                }),

            mathalea2d(
              Object.assign({ pixelsParCm: 20 }, fixeBordures(objets)),
              objets,
            ),
            50,
            50,
          ) + '<br>'
      let dataTemplate = ''
      const dataOptions: DataOptionsMultiMathfield = {}
      let compteurQuestion = 1
      for (let q = 0; q < typeDeQuestions.length; q++) {
        if (typeDeQuestions[q] === 1) {
          if (this.interactif) {
            dataTemplate += `${String.fromCharCode(97 + compteurQuestion - 1)}) Dans quelle direction regarde-t-il à la fin de son déplacement${sp()}? %{champ1}<br>`
            dataOptions.champ1 = {
              placeholder: `Exemple${sp()}: $\\uparrow$`,
              keyboard: KeyboardType.algo,
              minWidth: 200,
            }
          } else {
            texte += `${numAlpha(q)}Dans quelle direction regarde-t-il à la fin de son déplacement${sp()}?<br>`
          }
          compteurQuestion++
        } else if (typeDeQuestions[q] === 2) {
          if (this.interactif) {
            dataTemplate += `${String.fromCharCode(97 + compteurQuestion - 1)}) Quelles sont les positions successives du robot${sp()}? %{champ2}<br>`
            dataOptions.champ2 = {
              placeholder: `Exemple${sp()}: 1;2;3`,
              keyboard: KeyboardType.algo,
              minWidth: 200,
            }
          } else {
            texte += `${numAlpha(q)}Quelles sont les positions successives du robot${sp()}?<br>`
          }
          compteurQuestion++
        } else if (typeDeQuestions[q] === 3) {
          if (this.interactif) {
            dataTemplate += `${String.fromCharCode(97 + compteurQuestion - 1)}) Quelles sont les directions successives du robot${sp()}? %{champ3}<br>`
            dataOptions.champ3 = {
              placeholder: `Exemple${sp()}: $\\uparrow\\rightarrow\\downarrow$`,
              keyboard: KeyboardType.algo,
              minWidth: 200,
            }
          } else {
            texte += `${numAlpha(q)}Quelles sont les directions successives du robot${sp()}?<br>`
          }
          compteurQuestion++
        }
      }
      if (this.interactif) {
        texte += addMultiMathfield(this, i, { dataTemplate, dataOptions })
        const valeur: Valeur = {}
        if (typeDeQuestions.includes(1)) {
          valeur['champ1'] = {
            value: directions[
              positionCourante.angle as 0 | 90 | 180 | 270
            ].replaceAll('$', ''),
            options: {
              texteSansCasse: true,
            },
          }
        }
        if (typeDeQuestions.includes(2)) {
          valeur['champ2'] = {
            value: numerosPositionsSuccessives
              .filter((p, i) => i % 2 === 0)
              .join(';'),
          }
        }
        if (typeDeQuestions.includes(3)) {
          valeur['champ3'] = {
            value: positions
              .filter((p, i) => i % 2 === 1)
              .map((p) =>
                directions[p.angle as 0 | 90 | 180 | 270].replaceAll('$', ''),
              )
              .join(''),
          }
        }
        handleAnswers(this, i, valeur, { formatInteractif: 'multi-mathfield' })
      }

      const directionFinale =
        directions[positionCourante.angle as 0 | 90 | 180 | 270]
      const positionsSuccessives = numerosPositionsSuccessives.filter(
        (p, i) => i % 2 === 0,
      )
      const directionsSuccessives = positions
        .filter((p, i) => i % 2 === 1)
        .map((p) => directions[p.angle as 0 | 90 | 180 | 270])
      const texteCorr = `À la fin de son déplacement, le robot se trouve sur la case $${numerosPositionsSuccessives[numerosPositionsSuccessives.length - 1]}$, et il regarde vers le ${typeDeQuestions.includes(1) ? `$${miseEnEvidence(directionFinale.replaceAll('$', ''))}$` : directionFinale}.<br>
      Voici la séquence complète des positions successives du robot${sp()}:<br>
      ${
        typeDeQuestions.includes(2)
          ? `$${miseEnEvidence(positionsSuccessives.join(';'))}$`
          : positionsSuccessives.map((p) => `$${p}$`).join(' ; ')
      }<br>
      Et voici la séquence complète des directions successives du robot${sp()}:<br>
      ${
        typeDeQuestions.includes(3)
          ? `$${miseEnEvidence(directionsSuccessives.join('').replaceAll('$', ''))}$`
          : directionsSuccessives.join('')
      }<br>`
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
    }
  }
}
