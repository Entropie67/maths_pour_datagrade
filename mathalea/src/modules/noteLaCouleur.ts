/**
 * Classe NoteLaCouleur (objet Pion)
 * this.plateau est le tableau des couleurs de cases.
 * this.currentPos est {x,y} les coordonnées courantes du pion
 * this.currentOrientation est l'orientation courante du pion
 * this.codeScratch est le programme en code Latex du pion.
 * this.currentIndex est l'index qui parcourt le codeScratch...
 * this.nlc() retourne la couleur de la case sur laquelle est le pion
 * this.tesCoords(x,y) est une méthode qui dit si le point de coordonnées (x,y) est bien dans le plateau de jeu.
 */

import { BoiteBuilder } from '../lib/2d/BoiteBuilder'
import { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'
import { segment } from '../lib/2d/segmentsVecteurs'
import { texteParPositionEchelle } from '../lib/2d/textes'
import { avance, ObjetLutin, tournerD, tournerG } from './2dLutin'
import { randint } from './outils'

export const thePlateau: CouleurNLC[][] = [
  [
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
  ],
  [
    'Blanc',
    'Noir',
    'Jaune',
    'Bleu',
    'Vert',
    'Orange',
    'Rouge',
    'Orange',
    'Noir',
    'Jaune',
    'Gris',
    'Vert',
    'Rose',
    'Noir',
    'Jaune',
    'Blanc',
  ],
  [
    'Blanc',
    'Rouge',
    'Bleu',
    'Orange',
    'Jaune',
    'Rose',
    'Gris',
    'Jaune',
    'Rose',
    'Gris',
    'Jaune',
    'Bleu',
    'Rouge',
    'Gris',
    'Rouge',
    'Blanc',
  ],
  [
    'Blanc',
    'Rose',
    'Vert',
    'Gris',
    'Rouge',
    'Noir',
    'Bleu',
    'Vert',
    'Noir',
    'Vert',
    'Bleu',
    'Rose',
    'Gris',
    'Vert',
    'Orange',
    'Blanc',
  ],
  [
    'Blanc',
    'Vert',
    'Bleu',
    'Rose',
    'Vert',
    'Bleu',
    'Orange',
    'Gris',
    'Rouge',
    'Orange',
    'Jaune',
    'Gris',
    'Rouge',
    'Rose',
    'Bleu',
    'Blanc',
  ],
  [
    'Blanc',
    'Noir',
    'Orange',
    'Rouge',
    'Orange',
    'Jaune',
    'Rouge',
    'Blanc',
    'Blanc',
    'Noir',
    'Gris',
    'Orange',
    'Noir',
    'Jaune',
    'Rose',
    'Blanc',
  ],
  [
    'Blanc',
    'Rose',
    'Gris',
    'Noir',
    'Bleu',
    'Vert',
    'Bleu',
    'Blanc',
    'Blanc',
    'Rouge',
    'Bleu',
    'Gris',
    'Vert',
    'Rouge',
    'Noir',
    'Blanc',
  ],
  [
    'Blanc',
    'Noir',
    'Rouge',
    'Rose',
    'Vert',
    'Orange',
    'Rose',
    'Noir',
    'Orange',
    'Vert',
    'Jaune',
    'Rose',
    'Noir',
    'Rose',
    'Vert',
    'Blanc',
  ],
  [
    'Blanc',
    'Orange',
    'Gris',
    'Rouge',
    'Jaune',
    'Noir',
    'Vert',
    'Rouge',
    'Rose',
    'Noir',
    'Bleu',
    'Vert',
    'Jaune',
    'Orange',
    'Gris',
    'Blanc',
  ],
  [
    'Blanc',
    'Bleu',
    'Jaune',
    'Orange',
    'Vert',
    'Gris',
    'Jaune',
    'Gris',
    'Orange',
    'Gris',
    'Rose',
    'Bleu',
    'Rouge',
    'Bleu',
    'Orange',
    'Blanc',
  ],
  [
    'Blanc',
    'Rose',
    'Bleu',
    'Jaune',
    'Rose',
    'Orange',
    'Rouge',
    'Bleu',
    'Noir',
    'Jaune',
    'Gris',
    'Vert',
    'Jaune',
    'Noir',
    'Rouge',
    'Blanc',
  ],
  [
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
    'Blanc',
  ],
]

export type CouleurNLC =
  | 'Blanc'
  | 'Noir'
  | 'Rouge'
  | 'Bleu'
  | 'Orange'
  | 'Rose'
  | 'Jaune'
  | 'Vert'
  | 'Gris'
  | '(0) Blanc'
  | '(1) Noir'
  | '(2) Rouge'
  | '(3) Bleu'
  | '(4) Orange'
  | '(5) Rose'
  | '(6) Jaune'
  | '(7) Vert'
  | '(8) Gris'
/**
 *
 * @param {number} repetitions
 * @param {string[]} codes la séquence d'instructions à répéter
 * @returns {boolean} true si la boucle n'a à aucun moment fait sortir le lutin du plateau, false sinon
 */
export function testBoucle(
  repetitions: number,
  codes: string[],
  nlc: NoteLaCouleur,
) {
  let sortiboucle = false
  let test
  const pionfantome = noteLaCouleur({
    x: 0,
    y: 0,
    orientation: 0,
    plateau: nlc.plateauNLC,
    relatif: nlc.relatif,
    nx: nlc.nx,
    ny: nlc.ny,
    pas: nlc.pas,
  })
  pionfantome.currentPos.x = nlc.currentPos.x
  pionfantome.currentPos.y = nlc.currentPos.y
  pionfantome.currentOrientation = nlc.currentOrientation
  for (let i = 0; i < repetitions; i++) {
    test = testSequence(codes, pionfantome)
    if (!test[0]) {
      // si le lutin est sorti pendant la séquence alors la boucle n'est pas valide.
      sortiboucle = true
      break
    } else {
      // il n'est pas sorti, on continue le test à partir de la nouvelle position
      pionfantome.currentPos.x = test[1] as number
      pionfantome.currentPos.y = test[2] as number
      pionfantome.currentOrientation = test[3] as number
    }
  }
  // Si il est sorti, alors on retourne false en premier argument, sinon, on retourne true.
  return [
    !sortiboucle,
    pionfantome.currentPos.x,
    pionfantome.currentPos.y,
    pionfantome.currentOrientation,
  ]
}
/**
 * Pour tester une instruction : retourne un tableau dont le premier élément indique si l'instruction est valide.
 * c'est à dire qu'elle n'entraine pas une sortie de plateau.
 * true -> l'instruction maintient le lutin sur le plateau
 * false -> l'instruction le fait sortir du plateau
 * Les autres éléments du tableau sont dans cet ordre :
 * - les positions x et y du pion après l'instruction
 * - son orientation après l'instruction
 * - le code Latex de l'instruction
 */
export function testInstruction(
  code: string,
  lutin: ObjetLutin,
  nlc: NoteLaCouleur,
): [boolean, number, number, number, string, ObjetLutin] {
  const avancepion = function (d: number, x: number, y: number, s: number) {
    switch (s) {
      case 0:
      case 360:
        y += d
        break
      case 90:
      case -270:
        x += d
        break
      case 180:
      case -180:
        y -= d
        break
      case 270:
      case -90:
        x -= d
        break
    }
    return [x, y]
  }
  let x = nlc.currentPos.x
  let y = nlc.currentPos.y
  let orientation = nlc.currentOrientation
  let latex
  switch (code) {
    case 'AV20':
      ;[x, y] = avancepion(20, x, y, orientation)
      latex = '\\blockmove{avancer de \\ovalnum{20} pas}'
      if (lutin !== undefined) {
        avance(20, lutin)
      }
      break
    case 'AV30':
      ;[x, y] = avancepion(30, x, y, orientation)
      latex = '\\blockmove{avancer de \\ovalnum{30} pas}'
      if (lutin !== undefined) {
        avance(30, lutin)
      }
      break
    case 'AV40':
      ;[x, y] = avancepion(40, x, y, orientation)
      latex = '\\blockmove{avancer de \\ovalnum{40} pas}'
      if (lutin !== undefined) {
        avance(40, lutin)
      }
      break
    case 'AV60':
      ;[x, y] = avancepion(60, x, y, orientation)
      latex = '\\blockmove{avancer de \\ovalnum{60} pas}'
      if (lutin !== undefined) {
        avance(60, lutin)
      }
      break
    case 'AV80':
      ;[x, y] = avancepion(80, x, y, orientation)
      latex = '\\blockmove{avancer de \\ovalnum{80} pas}'
      if (lutin !== undefined) {
        avance(80, lutin)
      }
      break
    case 'AV90':
      ;[x, y] = avancepion(90, x, y, orientation)
      latex = '\\blockmove{avancer de \\ovalnum{90} pas}'
      if (lutin !== undefined) {
        avance(90, lutin)
      }
      break
    case 'AV100':
      ;[x, y] = avancepion(100, x, y, orientation)
      latex = '\\blockmove{avancer de \\ovalnum{100} pas}'
      if (lutin !== undefined) {
        avance(100, lutin)
      }
      break
    case 'AV120':
      ;[x, y] = avancepion(120, x, y, orientation)
      latex = '\\blockmove{avancer de \\ovalnum{120} pas}'
      if (lutin !== undefined) {
        avance(120, lutin)
      }
      break
    case 'AV150':
      ;[x, y] = avancepion(150, x, y, orientation)
      latex = '\\blockmove{avancer de \\ovalnum{150} pas}'
      if (lutin !== undefined) {
        avance(150, lutin)
      }
      break

    case 'TD90':
      if (orientation === 180) orientation = -90
      else orientation += 90
      latex = '\\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}'
      if (lutin !== undefined) {
        tournerD(90, lutin)
      }
      break
    case 'TG90':
      if (orientation === -90) orientation = 180
      else orientation -= 90
      latex = '\\blockmove{tourner \\turnleft{} de \\ovalnum{90} degrés}'
      if (lutin !== undefined) {
        tournerG(90, lutin)
      }
      break
    case 'TD180':
    case 'TG180':
      if (orientation === 0) orientation = 180
      else if (orientation === -90) orientation = 90
      else if (orientation === 90) orientation = -90
      else orientation = 0
      latex = '\\blockmove{tourner \\turnright{} de \\ovalnum{180} degrés}'
      if (lutin !== undefined) {
        tournerD(180, lutin)
      }
      break
    case 'NLC':
    default:
      latex = '\\blocklist{Note la couleur}'
      break
  }
  if (nlc.testCoords(x, y)) {
    return [true, x, y, orientation, latex, lutin]
  } else
    return [
      false,
      nlc.currentPos.x,
      nlc.currentPos.y,
      nlc.currentOrientation,
      latex,
      lutin,
    ]
}

/**
 * Pour tester une séquence : retourne
 *
 * [true,x,y,orientation] si la séquence reste dans le jeu
 * [false,x,y,orientation] en cas de sortie de plateau.
 */
export function testSequence(
  codes: string[],
  nlc: NoteLaCouleur,
): [boolean, number, number, number] {
  let sorti = false
  let test
  const pionfantome = noteLaCouleur({
    x: 0,
    y: 0,
    orientation: 0,
    plateau: nlc.plateauNLC,
    relatif: nlc.relatif,
    nx: nlc.nx,
    ny: nlc.ny,
    pas: nlc.pas,
  })
  pionfantome.currentPos.x = nlc.currentPos.x
  pionfantome.currentPos.y = nlc.currentPos.y
  pionfantome.currentOrientation = nlc.currentOrientation
  for (let i = 0; i < codes.length; i++) {
    test = testInstruction(codes[i], pionfantome.objetLutin, pionfantome)
    if (!test[0]) {
      // si le lutin est sorti du plateau pendant l'instruction
      sorti = true
      break
    } else {
      pionfantome.currentPos.x = test[1] as number
      pionfantome.currentPos.y = test[2] as number
      pionfantome.currentOrientation = test[3] as number
    }
  }
  // si il est sorti, alors la séquence est false, sinon, elle est true.
  return [
    !sorti,
    pionfantome.currentPos.x,
    pionfantome.currentPos.y,
    pionfantome.currentOrientation,
  ]
}
export function traducColor(couleur: CouleurNLC) {
  switch (couleur) {
    case 'Blanc':
      return 'white'
    case 'Bleu':
      return 'DodgerBlue'
    case 'Noir':
      return 'black'
    case 'Rouge':
      return 'red'
    case 'Jaune':
      return 'yellow'
    case 'Rose':
      return 'HotPink'
    case 'Vert':
      return 'green'
    case 'Orange':
      return 'DarkOrange'
    case 'Gris':
      return 'gray'
  }
}

export function traducNum(couleur: CouleurNLC) {
  switch (couleur) {
    case 'Blanc':
      return '0'
    case 'Bleu':
      return '3'
    case 'Noir':
      return '1'
    case 'Rouge':
      return '2'
    case 'Jaune':
      return '6'
    case 'Rose':
      return '5'
    case 'Vert':
      return '7'
    case 'Orange':
      return '4'
    case 'Gris':
      return '8'
  }
}

class NoteLaCouleur {
  objetLutin: ObjetLutin
  plateauNLC: CouleurNLC[][]
  currentPos: { x: number; y: number }
  currentOrientation: number
  codeScratch: string
  currentIndex: number
  relatif: boolean
  pas: number
  nx: number
  ny: number
  constructor({
    x = 15,
    y = 15,
    orientation = 90,
    relatif = true,
    nx = 16,
    ny = 12,
    pas = 30,
    plateau = thePlateau,
  }: {
    x?: number
    y?: number
    orientation?: number
    relatif?: boolean
    nx?: number
    ny?: number
    pas?: number
    plateau?: CouleurNLC[][]
  }) {
    this.plateauNLC = plateau
    this.currentPos = { x, y }
    this.currentOrientation = orientation
    this.codeScratch = ''
    this.currentIndex = 0
    this.relatif = relatif
    this.pas = pas
    this.nx = nx
    this.ny = ny
    this.objetLutin = new ObjetLutin()
    this.objetLutin.x = x
    this.objetLutin.y = y
    this.objetLutin.orientation = orientation
  }

  nlc(): CouleurNLC {
    return this.plateauNLC[
      Math.ceil(
        ((this.relatif
          ? ((this.ny - 1) * this.pas) >> 1
          : (this.ny - 1) * this.pas) -
          this.currentPos.y) /
          this.pas,
      )
    ][
      Math.ceil(
        ((this.relatif ? ((this.nx - 1) * this.pas) >> 1 : -this.pas >> 1) +
          this.currentPos.x) /
          this.pas,
      )
    ] as CouleurNLC
  }

  testCoords(x: number, y: number) {
    if (
      x < (this.relatif ? ((1 - this.nx) * this.pas) >> 1 : this.pas >> 1) ||
      x >
        (this.relatif
          ? (this.nx * this.pas) >> 1
          : (this.nx - 0.5) * this.pas) ||
      y < (this.relatif ? ((1 - this.ny) * this.pas) >> 1 : this.pas >> 1) ||
      y >
        (this.relatif ? (this.ny * this.pas) >> 1 : (this.ny - 0.5) * this.pas)
    )
      return false
    return true
  }
}

/**
 *
 * @param {NoteLaCouleurParams} param0
 * @returns
 */
export function noteLaCouleur({
  x = 15,
  y = 15,
  orientation = 90,
  plateau = thePlateau,
  relatif = true,
  nx = 16,
  ny = 12,
  pas = 30,
}: {
  x?: number
  y?: number
  orientation?: number
  plateau?: CouleurNLC[][]
  relatif?: boolean
  nx?: number
  ny?: number
  pas?: number
} = {}) {
  return new NoteLaCouleur({ x, y, orientation, relatif, plateau, nx, ny, pas })
}

export class Plateau2dNLC extends ObjetMathalea2D {
  relatif: boolean
  pas: number
  type: number
  scale: number
  nx: number
  ny: number
  plateauNLC: CouleurNLC[][]
  objets: ObjetMathalea2D[]
  constructor({
    type = 1,
    melange = false,
    scale = 0.5,
    relatif = true,
    pas = 30,
    nx = 16,
    ny = 12,
    plateau = thePlateau,
  } = {}) {
    super()
    this.relatif = relatif
    this.pas = pas
    this.type = 1
    this.scale = scale
    this.nx = nx
    this.ny = ny
    this.plateauNLC = plateau
    this.objets = []
    if (melange) {
      for (let i = 0, x1, x2, y1, y2, kase; i < 20; i++) {
        y1 = randint(1, this.ny - 2)
        y2 = randint(1, this.ny - 2, y1)
        x1 = randint(1, this.nx - 2)
        x2 = randint(1, this.nx - 2)
        kase = this.plateauNLC[y1][x1] // case est un mot réservé
        this.plateauNLC[y1][x1] = this.plateauNLC[y2][x2]
        this.plateauNLC[y2][x2] = kase
      }
    }

    this.objets = []
    let b: BoiteBuilder
    for (let X = 0; X < this.nx; X++) {
      for (let Y = 0; Y < this.ny; Y++) {
        switch (type) {
          case 1: // plateau couleur classique
            b = new BoiteBuilder({
              xMin: X * 1.5 + (nx >> 1) * (relatif ? -1.5 : 0),
              yMin: Y * 1.5 + (ny >> 1) * (relatif ? -1.5 : 0),
              xMax: (X + 1) * 1.5 + (nx >> 1) * (relatif ? -1.5 : 0),
              yMax: (Y + 1) * 1.5 + (ny >> 1) * (relatif ? -1.5 : 0),
            }).addColor({
              color: 'black',
              opacity: 0.8,
              backgroudOpacity: 0.7,
              colorBackground: traducColor(
                this.plateauNLC[ny - 1 - Y][X] as
                  | 'Blanc'
                  | 'Bleu'
                  | 'Noir'
                  | 'Rouge'
                  | 'Jaune'
                  | 'Rose'
                  | 'Vert'
                  | 'Orange'
                  | 'Gris',
              ),
            })
            break
          case 2: // plateau couleur avec numéros
            b = new BoiteBuilder({
              xMin: X * 1.5 + (nx >> 1) * (relatif ? -1.5 : 0),
              yMin: Y * 1.5 + (ny >> 1) * (relatif ? -1.5 : 0),
              xMax: (X + 1) * 1.5 + (nx >> 1) * (relatif ? -1.5 : 0),
              yMax: (Y + 1) * 1.5 + (ny >> 1) * (relatif ? -1.5 : 0),
            })
              .addColor({
                color: 'black',
                opacity: 0.8,
                backgroudOpacity: 0.7,
                colorBackground: traducColor(
                  this.plateauNLC[ny - 1 - Y][X] as
                    | 'Blanc'
                    | 'Bleu'
                    | 'Noir'
                    | 'Rouge'
                    | 'Jaune'
                    | 'Rose'
                    | 'Vert'
                    | 'Orange'
                    | 'Gris',
                ),
              })
              .addTextIn({
                size: 1.2,
                textIn:
                  traducNum(this.plateauNLC[ny - 1 - Y][X] as CouleurNLC) ?? '',
                color: 'black',
                opacity: 0.8,
              })
            break
          case 3: // plateau N&B avec nom des couleurs
            b = new BoiteBuilder({
              xMin: X * 1.5 + (nx >> 1) * (relatif ? -1.5 : 0),
              yMin: Y * 1.5 + (ny >> 1) * (relatif ? -1.5 : 0),
              xMax: (X + 1) * 1.5 + (nx >> 1) * (relatif ? -1.5 : 0),
              yMax: (Y + 1) * 1.5 + (ny >> 1) * (relatif ? -1.5 : 0),
            })
              .addColor({
                color: 'black',
                opacity: 0.8,
                backgroudOpacity: 1,
                colorBackground: 'white',
              })
              .addTextIn({
                color: 'black',
                opacity: 0.9,
                textIn: this.plateauNLC[ny - 1 - Y][X],
                size: 0.9,
              })
            break
          case 4: // Plateau N&B avec numéros des couleurs
          default:
            b = new BoiteBuilder({
              xMin: X * 1.5 + (nx >> 1) * (relatif ? -1.5 : 0),
              yMin: Y * 1.5 + (ny >> 1) * (relatif ? -1.5 : 0),
              xMax: (X + 1) * 1.5 + (nx >> 1) * (relatif ? -1.5 : 0),
              yMax: (Y + 1) * 1.5 + (ny >> 1) * (relatif ? -1.5 : 0),
            })
              .addColor({
                color: 'black',
                backgroudOpacity: 1,
                colorBackground: 'white',
                opacity: 0.8,
              })
              .addTextIn({
                size: 1.2,
                color: 'black',
                opacity: 0.9,
                textIn:
                  traducNum(this.plateauNLC[ny - 1 - Y][X] as CouleurNLC) ?? '',
              })
            break
        }
        const rendered = b.render()
        this.objets.push(...(Array.isArray(rendered) ? rendered : [rendered]))
      }
    }
    if (this.relatif)
      this.objets.push(
        texteParPositionEchelle(
          `-${this.pas}`,
          -1.6,
          -0.4,
          0,
          'black',
          1.2,
          'milieu',
          true,
          scale,
        ),
      )
    this.objets.push(
      texteParPositionEchelle(
        `${this.pas}`,
        1.5,
        -0.4,
        0,
        'black',
        1.2,
        'milieu',
        true,
        scale,
      ),
    )
    this.objets.push(
      texteParPositionEchelle(
        '0',
        -0.3,
        -0.4,
        0,
        'black',
        1.2,
        'milieu',
        true,
        scale,
      ),
    )
    if (this.relatif)
      this.objets.push(
        texteParPositionEchelle(
          `-${this.pas}`,
          -0.5,
          -1.5,
          0,
          'black',
          1.2,
          'milieu',
          true,
          scale,
        ),
      )
    this.objets.push(
      texteParPositionEchelle(
        `${this.pas}`,
        -0.5,
        1.5,
        0,
        'black',
        1.2,
        'milieu',
        true,
        scale,
      ),
    )
    this.objets.push(
      texteParPositionEchelle(
        'x',
        this.nx * (this.relatif ? 0.75 : 1.5) + 0.7,
        -(this.relatif ? 0.6 : 0.6),
        0,
        'purple',
        1.2,
        'milieu',
        true,
        scale,
      ),
    )
    this.objets.push(
      texteParPositionEchelle(
        'y',
        -0.4,
        this.ny * (this.relatif ? 0.75 : 1.5) + 0.7,
        0,
        'purple',
        1.2,
        'milieu',
        true,
        scale,
      ),
    )
    if (this.relatif) {
      this.objets.push(
        texteParPositionEchelle(
          '+',
          (this.nx >> 1) * 1.5 + 0.8,
          0,
          0,
          'purple',
          1.2,
          'milieu',
          true,
          scale,
        ),
      )
      this.objets.push(
        texteParPositionEchelle(
          '-',
          -(this.nx >> 1) * 1.5 - 0.5,
          0.2,
          0,
          'purple',
          1.2,
          'milieu',
          true,
          scale,
        ),
      )
      this.objets.push(
        texteParPositionEchelle(
          '+',
          0,
          (this.ny >> 1) * 1.5 + 0.8,
          0,
          'purple',
          1.2,
          'milieu',
          true,
          scale,
        ),
      )
      this.objets.push(
        texteParPositionEchelle(
          '-',
          0,
          -(this.ny >> 1) * 1.5 - 0.5,
          0,
          'purple',
          1.2,
          'milieu',
          true,
          scale,
        ),
      )
    }
    const flechey = segment(
      0,
      (this.ny >> 1) * (this.relatif ? -1.5 : 0),
      0,
      (this.ny >> 1) * (this.relatif ? 1.5 : 3) + 0.5,
      'purple',
    )
    flechey.styleExtremites = '->'
    const flechex = segment(
      (this.nx >> 1) * (this.relatif ? -1.5 : 0),
      0,
      (this.nx >> 1) * (this.relatif ? 1.5 : 3) + 0.5,
      0,
      'purple',
    )
    flechex.styleExtremites = '->'
    this.objets.push(flechey)
    this.objets.push(flechex)
  }
}

export function plateau2dNLC({
  type = 1,
  melange = false,
  scale = 0.5,
  relatif = true,
  pas = 30,
  nx = 16,
  ny = 12,
  plateau,
}: {
  type?: number
  melange?: boolean
  scale?: number
  relatif?: boolean
  pas?: number
  nx?: number
  ny?: number
  plateau?: CouleurNLC[][]
} = {}) {
  if (plateau !== undefined) {
    return new Plateau2dNLC({
      type,
      melange,
      scale,
      relatif,
      pas,
      nx,
      ny,
      plateau,
    })
  }
  return new Plateau2dNLC({
    type,
    melange,
    scale,
    relatif,
    pas,
    nx,
    ny,
  })
}
