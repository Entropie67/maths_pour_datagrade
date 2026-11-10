/*
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%% LES LUTINS %%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
*/

import { colorToLatexOrHTML } from '../lib/2d/colorToLatexOrHtml'
import { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../lib/2d/PointAbstrait'
import { angleModulo } from '../lib/2d/utilitairesGeometriques'
import { context } from './context'

/**
 * Convertit un angle en degrés vers des radians
 */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Renvoie la mesure d'angle (entre -180° et 180°) dans le cercle trigonométrique à partir d'une mesure d'angle donnée en degrés, qu'utilise Scratch.
 * Parce que le 0 angulaire de Scratch est dirigé vers le Nord et qu'il croît dans le sens indirect
 * @param {number} x Angle Scratch
 * @example x=angleScratchTo2d(0) // x=90
 * @example x=angleScratchTo2d(90) // x=0
 * @example x=angleScratchTo2d(-90) // x=180
 * @example x=angleScratchTo2d(-120) // x=-150
 * @return {number}
 */
// JSDOC Validee par EE Juin 2022
export const angleScratchTo2d = (x: number) => angleModulo(90 - x)

export class ObjetLutin extends ObjetMathalea2D {
  x: number
  y: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xSVG: (coeff: number) => number
  ySVG: (coeff: number) => number
  orientation: number
  historiquePositions: number[][]
  crayonBaisse: boolean
  isVisible: boolean
  costume: string
  updateBordures: () => void
  listeTraces: [
    number,
    number,
    number,
    number,
    string,
    number,
    number,
    number,
  ][]

  animation: string
  stringColor: string
  codeScratch?: string
  constructor() {
    super()
    this.x = 0
    this.y = 0
    this.xMin = 0
    this.xMax = 0
    this.yMin = 0
    this.yMax = 0
    this.bordures = [0, 0, 0, 0] // désolé, mais pour pouvoir définir les bordures, il faudrait avoir déjà les traces. Or au moment de la création du lutin, il n'a encore pas bougé !
    this.updateBordures = function () {
      let xmin = 1000
      let xmax = -1000
      let ymin = 1000
      let ymax = -1000
      for (const p of this.listeTraces) {
        xmin = Math.min(xmin, p[0], p[2])
        xmax = Math.max(xmax, p[0], p[2])
        ymin = Math.min(ymin, p[1], p[3])
        ymax = Math.max(ymax, p[1], p[3])
      }
      this.bordures = [xmin, ymin, xmax, ymax]
    }

    this.xSVG = function (coeff) {
      return this.x * coeff
    }
    this.ySVG = function (coeff) {
      return -this.y * coeff
    }
    this.orientation = 0
    this.historiquePositions = []
    this.crayonBaisse = false
    this.isVisible = true
    this.costume = ''
    this.listeTraces = [] // [[x0,y0,x1,y1,style]...]
    this.stringColor = 'black'
    this.color = colorToLatexOrHTML('black')
    this.epaisseur = 2
    this.pointilles = 0
    this.opacite = 1
    this.style = ''
    this.animation = ''
  }

  svg(coeff: number) {
    let code = ''
    for (const trace of this.listeTraces) {
      const A = pointAbstrait(trace[0], trace[1])
      const B = pointAbstrait(trace[2], trace[3])
      const color = colorToLatexOrHTML(String(trace[4]))
      const epaisseur = trace[5]
      const pointilles = trace[6]
      const opacite = trace[7]
      let style = ''
      if (epaisseur !== 1) {
        style += ` stroke-width="${epaisseur}" `
      }
      if (pointilles) {
        style += ' stroke-dasharray="4 3" '
      }
      if (opacite !== 1) {
        style += ` stroke-opacity="${opacite}" `
      }
      code += `\n\t<line x1="${A.xSVG(coeff)}" y1="${A.ySVG(
        coeff,
      )}" x2="${B.xSVG(coeff)}" y2="${B.ySVG(coeff)}" stroke="${color[0]}" ${style}  />`
    }
    if (this.isVisible && this.animation !== '') {
      code += '\n <g>' + this.animation + '</g>'
    }
    return code
  }

  tikz() {
    let code = ''
    for (const trace of this.listeTraces) {
      const A = pointAbstrait(trace[0], trace[1])
      const B = pointAbstrait(trace[2], trace[3])
      const color = colorToLatexOrHTML(String(trace[4]))
      const epaisseur = trace[5]
      const pointilles = trace[6]
      const opacite = trace[7]
      let optionsDraw = ''
      const tableauOptions = []
      if (color[1].length > 1 && color[1] !== 'black') {
        tableauOptions.push(`color =${color[1]}`)
      }
      if (!isNaN(epaisseur) && epaisseur !== 1) {
        tableauOptions.push(`line width = ${epaisseur}`)
      }
      if (!isNaN(opacite) && opacite !== 1) {
        tableauOptions.push(`opacity = ${opacite}`)
      }
      if (pointilles) {
        tableauOptions.push('dashed')
      }
      if (tableauOptions.length > 0) {
        optionsDraw = '[' + tableauOptions.join(',') + ']'
      }
      code += `\n\t\\draw${optionsDraw} (${A.x},${A.y})--(${B.x},${B.y});`
    }
    return code
  }
}

/**
 * Crée une nouvelle instance de l'objet lutin
 * @param  {...any} args En fait, il n'y a pas d'argument... il faudra les renseigner après la création de l'objet.
 * Voire l'objet lutin pour la liste de ses attributs (lutin.x, lutin.y, lutin.orientation, ...)
 * @returns {ObjetLutin} Instance d'un lutin
 */
export function creerLutin() {
  return new ObjetLutin()
}

/**
 * Fait avancer le lutin de d unités de lutin dans la direction de son orientation
 * @param {number} d Nombre d'unités choisi pour avancer
 * @param {ObjetLutin} lutin Lutin
 * @example avance(5, lutin) // Fait avancer le lutin de 5 unités
 * @author Jean-claude Lhote
 */
// JSDOC Validee par EE Juin 2022
export function avance(d: number, lutin: ObjetLutin) {
  // A faire avec pointSurCercle pour tenir compte de l'orientation
  const xdepart = lutin.x
  const ydepart = lutin.y
  lutin.x =
    lutin.x +
    (d / context.unitesLutinParCm) * Math.cos(degToRad(lutin.orientation))
  lutin.y =
    lutin.y +
    (d / context.unitesLutinParCm) * Math.sin(degToRad(lutin.orientation))
  lutin.historiquePositions.push([lutin.x, lutin.y])
  if (lutin.crayonBaisse) {
    lutin.listeTraces.push([
      xdepart,
      ydepart,
      lutin.x,
      lutin.y,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
  }
  lutin.xMin = Math.min(lutin.xMin, lutin.x)
  lutin.yMin = Math.min(lutin.yMin, lutin.y)
  lutin.xMax = Math.max(lutin.xMax, lutin.x)
  lutin.yMax = Math.max(lutin.yMax, lutin.y)
}

/**
 * Fait entrer le lutin dans le mode "trace"
 * @param {ObjetLutin} lutin
 * @example baisseCrayon(lutin) // Met lutin en mode "trace"
 */
export function baisseCrayon(lutin: ObjetLutin) {
  lutin.crayonBaisse = true
}

/**
 * Fait sortir le lutin du mode "trace"
 * @param {ObjetLutin} lutin
 * @example leveCrayon(lutin) // Sort lutin du mode "trace"
 */
// JSDOC Validee par EE Juin 2022
export function leveCrayon(lutin: ObjetLutin) {
  lutin.crayonBaisse = false
}

/**
 * Fixe l'orientation du lutin à a degrés (au sens Mathalea2d=trigo)
 * Voire la fonction angleScratchTo2d(angle_scratch) pour la conversion
 * @param {number} a
 * @param {ObjetLutin} lutin
 */
export function orienter(a: number, lutin: ObjetLutin) {
  lutin.orientation = angleModulo(a)
}

/**
 * Fait tourner de a degrés le lutin dans le sens direct
 * @param {number} a
 * @param {ObjetLutin} lutin
 */
export function tournerG(a: number, lutin: ObjetLutin) {
  lutin.orientation = angleModulo(lutin.orientation + a)
}

/**
 * Fait tourner de a degrés le lutin dans le sens indirect
 * @param {number} a
 * @param {ObjetLutin} lutin
 */
export function tournerD(a: number, lutin: ObjetLutin) {
  lutin.orientation = angleModulo(lutin.orientation - a)
}

/**
 * Déplace le lutin de sa position courante à (x;y)
 * @param {number} x Nouvelle abscisse
 * @param {number} y Nouvelle ordonnée
 * @param {ObjetLutin} lutin Lutin
 * @example allerA(10,-5,lutin) // Le lutin prend pour coordonnées (10 ; -5).
 */
// JSDOC Validee par EE Juin 2022
export function allerA(x: number, y: number, lutin: ObjetLutin) {
  const xdepart = lutin.x
  const ydepart = lutin.y
  lutin.x = x / context.unitesLutinParCm
  lutin.y = y / context.unitesLutinParCm
  lutin.historiquePositions.push([lutin.x, lutin.y])
  if (lutin.crayonBaisse) {
    lutin.listeTraces.push([
      xdepart,
      ydepart,
      lutin.x,
      lutin.y,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
  }
  lutin.xMin = Math.min(lutin.xMin, lutin.x)
  lutin.yMin = Math.min(lutin.yMin, lutin.y)
  lutin.xMax = Math.max(lutin.xMax, lutin.x)
  lutin.yMax = Math.max(lutin.yMax, lutin.y)
}

/**
 * Change en x à l'abscisse du lutin
 * @param {number} x Nouvelle abscisse
 * @param {ObjetLutin} lutin Lutin
 * @example mettrexA(10,lutin) // L'abscisse de lutin devient 10.
 */
export function mettrexA(x: number, lutin: ObjetLutin) {
  const xdepart = lutin.x
  lutin.x = x / context.unitesLutinParCm
  lutin.historiquePositions.push([lutin.x, lutin.y])
  if (lutin.crayonBaisse) {
    lutin.listeTraces.push([
      xdepart,
      lutin.y,
      lutin.x,
      lutin.y,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
  }
  lutin.xMin = Math.min(lutin.xMin, lutin.x)
  lutin.xMax = Math.max(lutin.xMax, lutin.x)
}

/**
 * change en y l'ordonnée du lutin
 * @param {number} y Nouvelle ordonnée
 * @param {ObjetLutin} lutin Lutin
 * @example mettreyA(10,lutin) // L'ordonnée de lutin devient 10.
 */
export function mettreyA(y: number, lutin: ObjetLutin) {
  const ydepart = lutin.y
  lutin.y = y / context.unitesLutinParCm
  lutin.historiquePositions.push([lutin.x, lutin.y])
  if (lutin.crayonBaisse) {
    lutin.listeTraces.push([
      lutin.x,
      ydepart,
      lutin.x,
      lutin.y,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
  }
  lutin.yMin = Math.min(lutin.yMin, lutin.y)
  lutin.yMax = Math.max(lutin.yMax, lutin.y)
}

/**
 * Ajoute x à l'abscisse du lutin
 * @param {number} x Valeur à ajouter à l'abscisse
 * @param {ObjetLutin} lutin Lutin
 * @example ajouterAx(10,lutin) // L'abscisse de lutin est augmentée de 10.
 */
// JSDOC Non Validee EE Juin 2022 (impossible à tester car non utilisée)
export function ajouterAx(x: number, lutin: ObjetLutin) {
  const xdepart = lutin.x
  lutin.x += x / context.unitesLutinParCm
  lutin.historiquePositions.push([lutin.x, lutin.y])
  if (lutin.crayonBaisse) {
    lutin.listeTraces.push([
      xdepart,
      lutin.y,
      lutin.x,
      lutin.y,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
  }
  lutin.xMin = Math.min(lutin.xMin, lutin.x)
  lutin.xMax = Math.max(lutin.xMax, lutin.x)
}

/**
 * Ajoute y à l'ordonnée du lutin
 * @param {number} y Valeur à ajouter à l'ordonnée
 * @param {ObjetLutin} lutin Lutin
 * @example ajouterAy(10,lutin) // L'ordonnée de lutin est augmentée de 10.
 */
// JSDOC Non Validee EE Juin 2022 (impossible à tester car non utilisée)
export function ajouterAy(y: number, lutin: ObjetLutin) {
  const ydepart = lutin.y
  lutin.y += y / context.unitesLutinParCm
  lutin.historiquePositions.push([lutin.x, lutin.y])
  if (lutin.crayonBaisse) {
    lutin.listeTraces.push([
      lutin.x,
      ydepart,
      lutin.x,
      lutin.y,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
  }
  lutin.yMin = Math.min(lutin.yMin, lutin.y)
  lutin.yMax = Math.max(lutin.yMax, lutin.y)
}

/**
 * Fait "vibrer" le lutin, tempo fois autour de sa position courante
 * @param {number} tempo Nombre de vibrations
 * @param {ObjetLutin} lutin Lutin
 * @example attendre(5, lutin) // Fait "vibrer" 5 fois le lutin
 * @author Jean-claude Lhote
 */
// JSDOC Validee par EE Juin 2022
export function attendre(tempo: number, lutin: ObjetLutin) {
  const x = lutin.x
  const y = lutin.y
  lutin.listeTraces.push([
    x,
    y,
    x + 0.08,
    y,
    lutin.stringColor,
    lutin.epaisseur,
    lutin.pointilles,
    lutin.opacite,
  ])
  for (let i = 0; i < tempo; i++) {
    lutin.listeTraces.push([
      x + 0.08,
      y,
      x + 0.08,
      y + 0.08,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
    lutin.listeTraces.push([
      x + 0.08,
      y + 0.08,
      x - 0.08,
      y + 0.08,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
    lutin.listeTraces.push([
      x + 0.08,
      y + 0.08,
      x - 0.08,
      y + 0.08,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
    lutin.listeTraces.push([
      x - 0.08,
      y + 0.08,
      x - 0.08,
      y - 0.08,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
    lutin.listeTraces.push([
      x - 0.08,
      y - 0.08,
      x + 0.08,
      y - 0.08,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
    lutin.listeTraces.push([
      x + 0.08,
      y - 0.08,
      x + 0.08,
      y,
      lutin.stringColor,
      lutin.epaisseur,
      lutin.pointilles,
      lutin.opacite,
    ])
  }
  lutin.listeTraces.push([
    x + 0.03,
    y,
    x,
    y,
    lutin.stringColor,
    lutin.epaisseur,
    lutin.pointilles,
    lutin.opacite,
  ])
}

/**
 * Pour faire une copie du lutin (ça crée un nouveau lutin retorné par la fonction)
 * @param {ObjetMathalea2D} originalObject
 * @returns {object} copie de cet objet.
 */
export function clone(lutin: ObjetLutin): ObjetLutin {
  const clone = new ObjetLutin()
  clone.x = lutin.x
  clone.y = lutin.y
  clone.xMin = lutin.xMin
  clone.xMax = lutin.xMax
  clone.yMin = lutin.yMin
  clone.yMax = lutin.yMax
  clone.xSVG = lutin.xSVG
  clone.ySVG = lutin.ySVG
  clone.orientation = lutin.orientation
  clone.historiquePositions = lutin.historiquePositions
  return clone
}
