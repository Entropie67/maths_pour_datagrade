import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { Polygone, polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import {
  latexParCoordonnees,
  texteParPositionEchelle,
} from '../../lib/2d/textes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const dateDePublication = '09/04/2022'
export const dateDeModifImportante = '27/03/2024'
export const titre = "Résoudre des problèmes d'aires de rectangles"
export const interactifReady = true

export const uuid = '9a5fe'

export const refs = {
  'fr-fr': ['6M2C-3', 'BP1AUTO107'],
  'fr-2016': ['6M10-1'],
  'fr-ch': ['9R1GM2D-3', '9R2GM2D-3', '9R3GM2D-3'],
}
/**
 * @author Jean-claude Lhote
 */

type ItemType = {
  type: string
  indice: number
  longueur: number
}
interface Rectangle extends Polygone {
  numero: number
}

function rangeLesLongueurs(
  longueursHorizontales: number[],
  longueursVerticales: number[],
  typeDeGrille: number[],
): ItemType[] {
  const longueursPossibles = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5]
  let tableau = longueursHorizontales.concat(longueursVerticales)
  tableau = tableau.sort((a, b) => a - b)
  for (let i = 0; i < tableau.length - 1; i++) {
    // On élimine les doublons
    if (tableau[i] === tableau[i + 1]) tableau.splice(i, 1)
  }
  const liste: ItemType[] = [] // liste contiendra un objet qui renseigne sur la taille affichée de chacun des segments horizontaux et verticaux.
  for (let i = 0; i < typeDeGrille[0]; i++) {
    liste.push({
      type: 'h',
      indice: i,
      longueur: longueursPossibles[tableau.indexOf(longueursHorizontales[i])],
    })
  }
  for (let i = 0; i < typeDeGrille[1]; i++) {
    liste.push({
      type: 'v',
      indice: i,
      longueur: longueursPossibles[tableau.indexOf(longueursVerticales[i])],
    })
  }
  return liste
}

function choisitFormatGrille(nombreEtapes: number): [number, number] {
  switch (nombreEtapes) {
    case 1:
      return [1, 1]
    case 2:
      return choice([true, false]) ? [2, 1] : [1, 2]
    case 3:
      return [2, 2]
    case 4:
      return choice([true, false]) ? [2, 3] : [3, 2]
    case 5:
      return [3, 3]
    case 6:
      return choice([true, false]) ? [3, 4] : [4, 3]
    case 7:
    default:
      return [4, 4]
  }
}

function choisitLongueurs(tables: number[], typeDeGrille: number[]) {
  const longueursHorizontales = [choice(tables)]
  for (let i = 1; i < typeDeGrille[0]; i++)
    longueursHorizontales.push(choice(tables, longueursHorizontales))
  const longueursVerticales = [choice(tables)]
  for (let i = 1; i < typeDeGrille[1]; i++)
    longueursVerticales.push(choice(tables, longueursVerticales))
  return [longueursHorizontales, longueursVerticales]
}

function fixeBordures(listeDeTailles: ItemType[], typeDeGrille: number[]) {
  const listeEcartsHorizontaux = []
  const listeEcartsVerticaux = []
  for (const item of listeDeTailles) {
    // on récupère les dimensions affichées des rectangles
    if (item.type === 'h') listeEcartsHorizontaux.push(item.longueur)
    else listeEcartsVerticaux.push(item.longueur)
  }
  const xBordures = [0] // tableau des coordonnées des bordures verticales
  const yBordures = [0] // tableau des coordonnées des bordures horizontales
  for (let i = 0; i < typeDeGrille[0]; i++) {
    xBordures.push(xBordures[i] + listeEcartsHorizontaux[i])
  }
  for (let i = 0; i < typeDeGrille[1]; i++) {
    yBordures.push(yBordures[i] + listeEcartsVerticaux[i])
  }
  return [xBordures, yBordures]
}

function creeRectangles(
  typeDeGrille: number[],
  xBordures: number[],
  yBordures: number[],
): Rectangle[][] {
  const rectangles: Rectangle[][] = []
  for (let i = 0; i < typeDeGrille[0]; i++) {
    rectangles[i] = []
    for (let j = 0; j < typeDeGrille[1]; j++) {
      rectangles[i].push(
        polygone(
          [
            pointAbstrait(xBordures[i], yBordures[j]),
            pointAbstrait(xBordures[i + 1], yBordures[j]),
            pointAbstrait(xBordures[i + 1], yBordures[j + 1]),
            pointAbstrait(xBordures[i], yBordures[j + 1]),
          ],
          'black',
        ) as Rectangle,
      )
    }
  }
  return rectangles
}

function calculAires(
  typeDeGrille: number[],
  longueursHorizontales: number[],
  longueursVerticales: number[],
) {
  const aires: number[][] = []
  for (let x = 0; x < typeDeGrille[0]; x++) {
    aires[x] = []
    for (let y = 0; y < typeDeGrille[1]; y++) {
      aires[x].push(longueursHorizontales[x] * longueursVerticales[y])
    }
  }
  return aires
}

function dessineGrille(
  typeDeGrille: number[],
  xBordures: number[],
  yBordures: number[],
) {
  let segTemp
  const objets = []
  for (let i = 0; i < typeDeGrille[0] + 1; i++) {
    segTemp = segment(xBordures[i], 0, xBordures[i], yBordures[typeDeGrille[1]])
    segTemp.pointilles = 5
    objets.push(segTemp)
  }
  for (let i = 0; i < typeDeGrille[1] + 1; i++) {
    segTemp = segment(0, yBordures[i], xBordures[typeDeGrille[0]], yBordures[i])
    segTemp.pointilles = 5
    objets.push(segTemp)
  }
  return objets
}

function dessineCheminAires(
  objetsEnonce: NestedObjetMathalea2dArray,
  rectangles: Rectangle[][],
  typeDeGrille: number[],
  longueursHorizontales: number[],
  longueursVerticales: number[],
  aires: number[][],
  xBordures: number[],
  yBordures: number[],
  nombreTotalEtapes: number,
  etapeAireInconnue: number | boolean,
): [string, 'colonne' | 'ligne', number, number[][]] {
  const colonneDisponible = Array(typeDeGrille[0]).fill(true)
  const ligneDisponible = Array(typeDeGrille[1]).fill(true)
  let alternance: 'colonne' | 'ligne'
  if (typeDeGrille[0] < typeDeGrille[1]) alternance = 'ligne'
  else if (typeDeGrille[0] > typeDeGrille[1]) alternance = 'colonne'
  else alternance = choice(['colonne', 'ligne'])
  let x = 0
  let y = 0
  let index = 0
  const listeCellules = []
  for (let etape = 0; etape <= nombreTotalEtapes;) {
    switch (alternance) {
      case 'colonne':
        do {
          index = randint(0, typeDeGrille[0] - 1)
        } while (!colonneDisponible[index])
        x = index
        colonneDisponible[index] = false
        if (etape === 0) {
          objetsEnonce.push(
            texteParPositionEchelle(
              stringNombre(longueursHorizontales[x]) + ' cm',
              (xBordures[x] + xBordures[x + 1]) / 2,
              yBordures[typeDeGrille[1]] + 0.65,
              0,
              'black',
              1,
              'milieu',
              false,
              0.5,
            ),
          )
        } else {
          listeCellules.push([x, y])
          if (etape === etapeAireInconnue) {
            objetsEnonce.push(
              latexParCoordonnees(
                '?',
                (xBordures[x] + xBordures[x + 1]) / 2,
                (yBordures[y] + yBordures[y + 1]) / 2 + 0.65,
                'red',
                30,
                10,
                '',
                30,
              ),
            )
          } else {
            objetsEnonce.push(
              latexParCoordonnees(
                texNombre(aires[x][y]) + '\\text{ cm}^2',
                (xBordures[x] + xBordures[x + 1]) / 2,
                (yBordures[y] + yBordures[y + 1]) / 2 + 0.65,
                'black',
                30,
                10,
                '',
                10,
              ),
            )
          }
        }
        alternance = 'ligne'
        break
      case 'ligne':
        do {
          index = randint(0, typeDeGrille[1] - 1)
        } while (!ligneDisponible[index])
        y = index
        ligneDisponible[index] = false
        if (etape === 0) {
          objetsEnonce.push(
            texteParPositionEchelle(
              stringNombre(longueursVerticales[index]) + ' cm',
              -1,
              (yBordures[y] + yBordures[y + 1]) / 2,
              0,
              'black',
              1,
              'milieu',
              false,
              0.5,
            ),
          )
        } else {
          listeCellules.push([x, y])
          if (etape === etapeAireInconnue) {
            objetsEnonce.push(
              latexParCoordonnees(
                '?',
                (xBordures[x] + xBordures[x + 1]) / 2,
                (yBordures[y] + yBordures[y + 1]) / 2 + 0.65,
                'red',
                30,
                10,
                '',
                30,
              ),
            )
          } else {
            objetsEnonce.push(
              latexParCoordonnees(
                texNombre(aires[x][y]) + '\\text{ cm}^2',
                (xBordures[x] + xBordures[x + 1]) / 2,
                (yBordures[y] + yBordures[y + 1]) / 2 + 0.65,
                'black',
                30,
                10,
                '',
                10,
              ),
            )
          }
        }
        alternance = 'colonne'
        break
    }
    etape++
  }
  if (etapeAireInconnue) {
    if (alternance === 'ligne') {
      objetsEnonce.push(
        texteParPositionEchelle(
          longueursHorizontales[index].toString() + ' cm',
          (xBordures[x] + xBordures[x + 1]) / 2,
          yBordures[typeDeGrille[1]] + 1,
          0,
          'black',
          1,
          'milieu',
          true,
          0.5,
        ),
      )
    } else {
      objetsEnonce.push(
        texteParPositionEchelle(
          longueursVerticales[index].toString() + ' cm',
          xBordures[typeDeGrille[0]] + 1,
          (yBordures[y] + yBordures[y + 1]) / 2,
          0,
          'black',
          1,
          'milieu',
          true,
          0.5,
        ),
      )
    }
  } else {
    if (alternance === 'ligne') {
      objetsEnonce.push(
        texteParPositionEchelle(
          '?',
          (xBordures[x] + xBordures[x + 1]) / 2,
          yBordures[typeDeGrille[1]] + 1,
          0,
          'red',
          2,
          'milieu',
          false,
          0.7,
        ),
      )
    } else {
      objetsEnonce.push(
        texteParPositionEchelle(
          '?',
          xBordures[typeDeGrille[0]] + 1,
          (yBordures[y] + yBordures[y + 1]) / 2,
          0,
          'red',
          2,
          'milieu',
          false,
          0.7,
        ),
      )
    }
  }
  let numeroteur = 0
  for (let j = 0; j < typeDeGrille[1]; j++) {
    for (let i = 0; i < typeDeGrille[0]; i++) {
      if (listeCellules.find((el) => el[0] === i && el[1] === j)) {
        rectangles[i][j].numero = numeroteur + 1
        objetsEnonce.push(rectangles[i][j])
        objetsEnonce.push(
          latexParCoordonnees(
            `\\fcolorbox{black}{pink}{${(numeroteur + 1).toString()}}`,
            (xBordures[i] + xBordures[i + 1]) / 2,
            (yBordures[j] + yBordures[j + 1]) / 2 - 0.65,
            'black',
            30,
            10,
            '',
            10,
          ),
        )
        numeroteur++
      }
    }
  }
  const paramsEnonce = {
    xmin: -3.5,
    ymin: -0.5,
    xmax: xBordures[typeDeGrille[0]] + 2.5,
    ymax: yBordures[typeDeGrille[1]] + 2,
    pixelsParCm: 30,
    scale: 0.7,
    mainlevee: false,
  }
  const texte = mathalea2d(paramsEnonce, objetsEnonce)
  return [texte, alternance, numeroteur, listeCellules]
}

function redigeCorrection(
  rectangles: Rectangle[][],
  longueursHorizontales: number[],
  longueursVerticales: number[],
  aires: number[][],
  nombreTotalEtapes: number,
  etapeAireInconnue: number | boolean,
  alternance: 'colonne' | 'ligne',
  numeroteur: number,
  listeCellules: number[][],
) {
  let texteCorr = ''
  let reponse
  let colonneOuLigne
  if (
    (alternance === 'ligne' && numeroteur % 2 === 0) ||
    (alternance === 'colonne' && numeroteur % 2 === 1)
  )
    colonneOuLigne = true
  else colonneOuLigne = false
  if (etapeAireInconnue) {
    etapeAireInconnue = etapeAireInconnue as number
    texteCorr = "D'une part :<br>"
    ;[texteCorr, colonneOuLigne] = etapesDeUnAEtapeInconnue(
      texteCorr,
      longueursHorizontales,
      longueursVerticales,
      listeCellules,
      rectangles,
      aires,
      etapeAireInconnue - 1,
      colonneOuLigne,
    )
    texteCorr += "D'autre part :<br>"
    ;[texteCorr, colonneOuLigne] = etapesDeLaFinAEtapeInconnue(
      texteCorr,
      longueursHorizontales,
      longueursVerticales,
      listeCellules,
      rectangles,
      aires,
      etapeAireInconnue,
      alternance === 'colonne',
    ) as [string, boolean]
    texteCorr += `Nous venons de calculer la largeur et la longueur du rectangle numéro $${miseEnEvidence(rectangles[listeCellules[etapeAireInconnue - 1][0]][listeCellules[etapeAireInconnue - 1][1]].numero)}$.<br>`
    texteCorr += `On en déduit que son aire est $${texNombre(longueursHorizontales[listeCellules[etapeAireInconnue - 1][0]], 1)}\\times ${texNombre(longueursVerticales[listeCellules[etapeAireInconnue - 1][1]], 1)} = ${miseEnEvidence(texNombre(aires[listeCellules[etapeAireInconnue - 1][0]][listeCellules[etapeAireInconnue - 1][1]], 2))}\\text{ cm}^2$.<br>`
    reponse = [
      aires[listeCellules[etapeAireInconnue - 1][0]][
        listeCellules[etapeAireInconnue - 1][1]
      ],
    ]
  } else {
    ;[texteCorr, colonneOuLigne] = etapesDeUnAEtapeInconnue(
      texteCorr,
      longueursHorizontales,
      longueursVerticales,
      listeCellules,
      rectangles,
      aires,
      nombreTotalEtapes,
      colonneOuLigne,
    )
    if (colonneOuLigne) {
      if (
        longueursVerticales[listeCellules[listeCellules.length - 1][1]] ===
        longueursHorizontales[listeCellules[listeCellules.length - 1][0]]
      ) {
        texteCorr += `La mesure demandée est la longueur du côté du carré numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[listeCellules.length - 1][0]][listeCellules[listeCellules.length - 1][1]].numero}}$`, 'red')}, soit
  $${miseEnEvidence(texNombre(longueursHorizontales[listeCellules[listeCellules.length - 1][0]], 1))} \\text{ cm}$.`
      } else {
        texteCorr += `La mesure demandée est la ${longueursVerticales[listeCellules[listeCellules.length - 1][1]] > longueursHorizontales[listeCellules[listeCellules.length - 1][0]] ? 'largeur' : 'longueur'}
  du rectangle numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[listeCellules.length - 1][0]][listeCellules[listeCellules.length - 1][1]].numero}}$`, 'red')}, soit
  $${miseEnEvidence(texNombre(longueursHorizontales[listeCellules[listeCellules.length - 1][0]], 1))} \\text{ cm}$.`
      }
      reponse = [
        longueursHorizontales[listeCellules[listeCellules.length - 1][0]],
      ]
    } else {
      if (
        longueursHorizontales[listeCellules[listeCellules.length - 1][0]] ===
        longueursVerticales[listeCellules[listeCellules.length - 1][1]]
      ) {
        texteCorr += `La mesure demandée est la longueur du côté du carré numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[listeCellules.length - 1][0]][listeCellules[listeCellules.length - 1][1]].numero}}$`, 'red')}, soit
  $${miseEnEvidence(texNombre(longueursVerticales[listeCellules[listeCellules.length - 1][1]], 1))} \\text{ cm}$.`
      } else {
        texteCorr += `La mesure demandée est la ${longueursHorizontales[listeCellules[listeCellules.length - 1][0]] > longueursVerticales[listeCellules[listeCellules.length - 1][1]] ? 'largeur' : 'longueur'}
du rectangle numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[listeCellules.length - 1][0]][listeCellules[listeCellules.length - 1][1]].numero}}$`, 'red')}, soit
$${miseEnEvidence(texNombre(longueursVerticales[listeCellules[listeCellules.length - 1][1]], 1))} \\text{ cm}$.`
      }
      reponse = [
        longueursVerticales[listeCellules[listeCellules.length - 1][1]],
      ]
    }
  }
  return [texteCorr, reponse]
}

function etapesDeLaFinAEtapeInconnue(
  texteCorr: string,
  longueursHorizontales: number[],
  longueursVerticales: number[],
  listeCellules: number[][],
  rectangles: Rectangle[][],
  aires: number[][],
  etapeAireInconnue: number,
  colonneOuLigne: boolean,
) {
  for (let i = listeCellules.length - 1; i >= etapeAireInconnue; i--) {
    if (!colonneOuLigne) {
      texteCorr += `Puisque la ${longueursHorizontales[listeCellules[i][0]] >= longueursVerticales[listeCellules[i][1]] ? 'longueur' : 'largeur'}
  du rectangle numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[i][0]][listeCellules[i][1]].numero}}$`, 'red')}
  est $${texNombre(longueursHorizontales[listeCellules[i][0]], 1)}\\text{ cm}$ et
  que son aire est $${texNombre(aires[listeCellules[i][0]][listeCellules[i][1]], 2)}\\text{ cm}^2$,
  sa ${longueursHorizontales[listeCellules[i][0]] < longueursVerticales[listeCellules[i][1]] ? 'longueur' : 'largeur'} est :
  $\\dfrac{${texNombre(aires[listeCellules[i][0]][listeCellules[i][1]], 2)}\\text{ cm}^2}{${texNombre(longueursHorizontales[listeCellules[i][0]], 1)}\\text{ cm}}=${texNombre(longueursVerticales[listeCellules[i][1]], 1)}\\text{ cm}$.`
      if (
        longueursHorizontales[listeCellules[i][0]] ===
        longueursVerticales[listeCellules[i][1]]
      ) {
        texteCorr += ` Le rectangle numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[i][0]][listeCellules[i][1]].numero}}$`, 'red')} est un carré.<br>`
      } else {
        texteCorr += '<br>'
      }
    } else {
      texteCorr += `Comme la ${longueursVerticales[listeCellules[i][1]] >= longueursHorizontales[listeCellules[i][0]] ? 'longueur' : 'largeur'}
  du rectangle numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[i][0]][listeCellules[i][1]].numero}}$`, 'red')}
  est $${texNombre(longueursVerticales[listeCellules[i][1]], 1)}\\text{ cm}$ et
  que son aire est $${texNombre(aires[listeCellules[i][0]][listeCellules[i][1]], 2)}\\text{ cm}^2$,
  sa ${longueursVerticales[listeCellules[i][1]] < longueursHorizontales[listeCellules[i][0]] ? 'longueur' : 'largeur'} est :
  $\\dfrac{${texNombre(aires[listeCellules[i][0]][listeCellules[i][1]], 2)}\\text{ cm}^2}{${texNombre(longueursVerticales[listeCellules[i][1]], 1)}\\text{ cm}}=${texNombre(longueursHorizontales[listeCellules[i][0]], 1)}\\text{ cm}$.`
      if (
        longueursVerticales[listeCellules[i][1]] ===
        longueursHorizontales[listeCellules[i][0]]
      ) {
        texteCorr += ` Le rectangle numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[i][0]][listeCellules[i][1]].numero}}$`, 'red')} est un carré.<br>`
      } else {
        texteCorr += '<br>'
      }
    }
    colonneOuLigne = !colonneOuLigne
  }

  return [texteCorr, colonneOuLigne]
}

function etapesDeUnAEtapeInconnue(
  texteCorr: string,
  longueursHorizontales: number[],
  longueursVerticales: number[],
  listeCellules: number[][],
  rectangles: Rectangle[][],
  aires: number[][],
  etapeInconnue: number,
  colonneOuLigne: boolean,
): [string, boolean] {
  for (let i = 0; i < etapeInconnue; i++) {
    if (colonneOuLigne) {
      texteCorr += `Puisque la ${longueursHorizontales[listeCellules[i][0]] <= longueursVerticales[listeCellules[i][1]] ? 'largeur' : 'longueur'}
  du rectangle numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[i][0]][listeCellules[i][1]].numero}}$`, 'red')}
  est $${texNombre(longueursHorizontales[listeCellules[i][0]], 1)}\\text{ cm}$ et
  que son aire est $${texNombre(aires[listeCellules[i][0]][listeCellules[i][1]], 2)}\\text{ cm}^2$,
  sa ${longueursHorizontales[listeCellules[i][0]] > longueursVerticales[listeCellules[i][1]] ? 'largeur' : 'longueur'} est :
  $\\dfrac{${texNombre(aires[listeCellules[i][0]][listeCellules[i][1]], 2)}\\text{ cm}^2}{${texNombre(longueursHorizontales[listeCellules[i][0]], 1)}\\text{ cm}}=${texNombre(longueursVerticales[listeCellules[i][1]], 1)}\\text{ cm}$.`
      if (
        longueursHorizontales[listeCellules[i][0]] ===
        longueursVerticales[listeCellules[i][1]]
      ) {
        texteCorr += ` Le rectangle numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[i][0]][listeCellules[i][1]].numero}}$`, 'red')} est un carré.<br>`
      } else {
        texteCorr += '<br>'
      }
    } else {
      texteCorr += `Comme la ${longueursVerticales[listeCellules[i][1]] <= longueursHorizontales[listeCellules[i][0]] ? 'largeur' : 'longueur'}
  du rectangle numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[i][0]][listeCellules[i][1]].numero}}$`, 'red')}
  est $${texNombre(longueursVerticales[listeCellules[i][1]], 1)}\\text{ cm}$ et
  que son aire est $${texNombre(aires[listeCellules[i][0]][listeCellules[i][1]], 2)}\\text{ cm}^2$,
  sa ${longueursVerticales[listeCellules[i][1]] > longueursHorizontales[listeCellules[i][0]] ? 'largeur' : 'longueur'} est :
  $\\dfrac{${texNombre(aires[listeCellules[i][0]][listeCellules[i][1]], 2)}\\text{ cm}^2}{${texNombre(longueursVerticales[listeCellules[i][1]], 1)}\\text{ cm}}=${texNombre(longueursHorizontales[listeCellules[i][0]], 1)}\\text{ cm}$.`
      if (
        longueursVerticales[listeCellules[i][1]] ===
        longueursHorizontales[listeCellules[i][0]]
      ) {
        texteCorr += ` Le rectangle numéro ${texteEnCouleurEtGras(`$\\mathbf{${rectangles[listeCellules[i][0]][listeCellules[i][1]].numero}}$`, 'red')} est un carré.<br>`
      } else {
        texteCorr += '<br>'
      }
    }
    colonneOuLigne = !colonneOuLigne
  }

  return [texteCorr, colonneOuLigne]
}

function prepareProblemeAire(
  objetsEnonce: NestedObjetMathalea2dArray,
  rectangles: Rectangle[][],
  typeDeGrille: number[],
  longueursHorizontales: number[],
  longueursVerticales: number[],
  aires: number[][],
  xBordures: number[],
  yBordures: number[],
  nombreTotalEtapes: number,
  etapeAireInconnue: number | boolean,
) {
  const [texte, alternance, numeroteur, listeCellules] = dessineCheminAires(
    objetsEnonce,
    rectangles,
    typeDeGrille,
    longueursHorizontales,
    longueursVerticales,
    aires,
    xBordures,
    yBordures,
    nombreTotalEtapes,
    etapeAireInconnue,
  )
  const [texteCorr, rep] = redigeCorrection(
    rectangles,
    longueursHorizontales,
    longueursVerticales,
    aires,
    nombreTotalEtapes,
    etapeAireInconnue,
    alternance,
    numeroteur,
    listeCellules,
  )
  // const reponse = new Grandeur(rep[0], rep[1])
  const reponse = rep[0]
  return [texte, texteCorr, reponse]
}

export default class ProblemesAiresRectangles extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      "Nombre d'étapes (de 1 à 7)",
      'Nombres séparés par des tirets :',
    ]
    this.besoinFormulaire2Numerique = [
      'Difficulté',
      2,
      '1 : Facile\n2 : Moins facile',
    ]
    this.besoinFormulaire3CaseACocher = ['Longueurs entières', true]
    this.besoinFormulaire4Texte = [
      'Choix des problèmes',
      'Nombres séparés par des tirets :\n1 : Longueur finale\n2 : Aire intermédiaire',
    ]
    this.consigne = "Trouver la mesure désignée par un point d'interrogation."
    this.nbQuestions = 1

    this.sup = 5
    this.sup2 = 2
    this.sup4 = 1
    this.sup3 = true
    this.spacingCorr = context.isHtml ? 3 : 2
  }

  nouvelleVersion() {
    let choixDesTables

    const nombreTotalEtapes = gestionnaireFormulaireTexte({
      max: 7,
      defaut: 5,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      melange: 0,
    }).map(Number)

    const typesDeProblemes = gestionnaireFormulaireTexte({
      max: 2,
      defaut: 1,
      nbQuestions: this.nbQuestions,
      saisie: this.sup4,
      melange: 0,
    })

    if (this.sup2 === 1) choixDesTables = [2, 3, 4, 5, 6, 7, 8, 9]
    else choixDesTables = [3, 4, 6, 7, 8, 9, 11, 12]

    for (
      let q = 0, cpt = 0, texte, texteCorr, reponse;
      q < this.nbQuestions && cpt < 50;
    ) {
      const typeDeGrille = choisitFormatGrille(nombreTotalEtapes[q])
      // On détermine les 8 longueurs nécessaires et on prépare la grille de rectangles
      const [longueursHorizontales, longueursVerticales] = choisitLongueurs(
        choixDesTables,
        typeDeGrille,
      )
      if (!this.sup3) {
        for (let i = 0; i < longueursHorizontales.length; i++) {
          longueursHorizontales[i] = arrondi(
            longueursHorizontales[i] + (randint(0, 1) * randint(1, 9)) / 10,
            1,
          )
        }
        for (let i = 0; i < longueursVerticales.length; i++) {
          longueursVerticales[i] = arrondi(
            longueursVerticales[i] + (randint(0, 1) * randint(1, 9)) / 10,
            1,
          )
        }
      }
      const listeDeTailles = rangeLesLongueurs(
        longueursHorizontales,
        longueursVerticales,
        typeDeGrille,
      )
      const [xBordures, yBordures] = fixeBordures(listeDeTailles, typeDeGrille)
      const rectangles = creeRectangles(typeDeGrille, xBordures, yBordures)
      // On trace une grille en pointillés pour prolonger les rectangles
      const objetsEnonce = dessineGrille(typeDeGrille, xBordures, yBordures) // Grille en pointillés sur laquelle on ajoutera les rectangles
      const aires = calculAires(
        typeDeGrille,
        longueursHorizontales,
        longueursVerticales,
      ) // tableau contenant toutes les aires des rectangles
      // on crée la question
      const tablo = prepareProblemeAire(
        objetsEnonce,
        rectangles,
        typeDeGrille,
        longueursHorizontales,
        longueursVerticales,
        aires,
        xBordures,
        yBordures,
        nombreTotalEtapes[q],
        typesDeProblemes[q] === 1
          ? false
          : Math.floor((nombreTotalEtapes[q] + 1) / 2),
      ) as [string, string, number]
      texte = tablo[0]
      texteCorr = tablo[1]
      reponse = tablo[2]
      handleAnswers(this, q, { reponse: { value: reponse } })
      texte += ajouteChampTexteMathLive(this, q, KeyboardType.clavierNumbers, {
        texteAvant: 'Réponse : ',
        texteApres: this.sup4 === 1 ? '$ \\text{ cm}$' : '$ \\text{ cm}^2$',
      })
      if (
        this.questionJamaisPosee(
          q,
          ...longueursHorizontales,
          ...longueursVerticales,
        )
      ) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr

        q++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
