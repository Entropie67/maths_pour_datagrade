import { bleuMathalea } from '../../lib/colors'
import { randint } from '../../modules/outils'
import { arrondi } from '../outils/nombres'
import { lettreDepuisChiffre } from '../outils/outilString'
import { nombreAvecEspace } from '../outils/texNombre'
import { arc } from './Arc'
import { cercle } from './cercle'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { grille } from './Grille'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { TexteParPoint, texteParPoint, texteParPosition } from './textes'
import { rotation, similitude } from './transformations'
import { longueur } from './utilitairesGeometriques'
import { milieu, pointSurSegment } from './utilitairesPoint'

/**  Retourne un couple de coordonnées correspondant au centre d'une cible, connaissant les coordonnées du point réponse et de la cellule dans laquelle on veut qu'il soit
 * @param {number} x Abscisse du point réponse
 * @param {number} y Ordonnée du point réponse
 * @param {number} rang Nombre de cases en largeur
 * @param {number} taille Taille des cases
 * @param {string} cellule Cellule de la réponse, chaine définie par exemple comme 'A1' ou 'B3'
 * @example dansLaCibleCarree(-1, -3, 4, 0.6, 'B2')
 // Retourne les coordonnées du centre d'une cible carrée de rang 4 et de taille 0.6 dont la réponse est le point (-1;-3) dans la cellule B2
 * @return {number[]|string} Ce sont les coordonnées du centre de la cible ou bien 'Cette cellule n'existe pas dans la cible'
 * @author Jean-claude Lhote
 */
// JSDOC Validee par EE Aout 2022
export function dansLaCibleCarree(
  x: number,
  y: number,
  rang: number,
  taille: number,
  cellule: string,
): [number, number] {
  const lettre = cellule[0]
  const chiffrelettre = lettre.charCodeAt(0) - 64
  const chiffre = parseInt(cellule[1])
  // dx et dy étaient utilisés pour décentrer le point dans la cellule... cela pouvait entrainer des points très proches des cellules voisines
  // en recentrant les points dans les cellules, on tolère une plus grande marge d'erreur.
  const dx = 0 // Devenu inutile
  const dy = 0 // Devenu inutile
  const delta = taille / 2
  if (chiffre > rang || chiffrelettre > rang) {
    window.notify("Cette cellule n'existe pas dans la cible", {
      x,
      y,
      rang,
      taille,
      cellule,
    })
    return [0, 0]
  } else {
    return [
      x + dx - chiffrelettre * taille + delta + rang * delta,
      y + dy - chiffre * 2 * delta + (rang + 1) * delta,
    ]
  }
}

/**
 * Crée une cible carrée pour l'auto-correction
 * @param {number} [x=0] Abscisse du point au centre de la cible
 * @param {number} [y=0] Ordonnée du point au centre de la cible
 * @param {number} [rang=4] Nombre de cases en largeur
 * @param {number} [num] Numéro (ou rien) pour identifier la cible (quand il y en a plusieurs)
 * @param {number} [taille=0.6] Taille des cases
 * @param {string} [color='gray'] Couleur de la cible. Code couleur HTML acceptée
 * @param {number} [opacite=0.5] Opacité de la cible
 * @param {string} [colorNum = color] Couleur du numéro identifiant la cible. Code couleur HTML acceptée
 * @param {number} [opaciteNum = 0.5] Opacité du numéro identifiant la cible
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {number} x Abscisse du point au centre de la cible
 * @property {number} y Ordonnée du point au centre de la cible
 * @property {number} rang Nombre de cases en largeur
 * @property {number} taille Taille des cases
 * @property {string} color Couleur de la cible. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} opacite Opacité de la cible
 * @property {string} colorNum Couleur du numéro identifiant la cible. Code couleur HTML acceptée
 * @property {number} opaciteNum Opacité du numéro identifiant la cible
 * @author Jean-claude Lhote
 * @class
 */
// JSDOC Validee par EE Juin 2022
export class CibleCarree extends ObjetMathalea2D {
  x: number
  y: number
  rang: number
  taille: number
  colorNum: string
  opaciteNum: number
  stringColor: string
  constructor({
    x = 0,
    y = 0,
    rang = 4,
    num,
    taille = 0.6,
    color = 'gray',
    opacite = 0.5,
    colorNum = color,
    opaciteNum = 1,
  }: {
    x?: number
    y?: number
    rang?: number
    num?: number
    taille?: number
    color?: string
    opacite?: number
    colorNum?: string
    opaciteNum?: number
  } = {}) {
    super()
    this.stringColor = color
    this.x = x
    this.y = y
    this.rang = rang
    this.taille = taille
    this.color = colorToLatexOrHTML(color)
    this.colorNum = colorNum
    this.opacite = opacite
    this.opaciteNum = opaciteNum
    const objets: any[] = []
    let numero
    // Si un numéro est donné, alors on l'ajoute en filigrane.
    if (typeof num !== 'undefined') {
      numero = texteParPosition(
        String(num),
        this.x - (this.rang * this.taille) / 4,
        this.y - (this.rang * this.taille) / 4,
        0,
        this.colorNum,
        1,
        'milieu',
        false,
        this.opaciteNum,
      ) as TexteParPoint
      // numero.opacite = 0.1 TOTALEMENT INUTILE CAR NON FONCTIONNEL
      numero.taille = 30 * this.taille
      numero.contour = true
      objets.push(numero)
    }
    let lettre, chiffre
    // la grille de la cible
    objets.push(
      grille(
        arrondi(this.x - (this.rang * this.taille) / 2),
        arrondi(this.y - (this.rang * this.taille) / 2),
        arrondi(this.x + (this.rang * this.taille) / 2),
        arrondi(this.y + (this.rang * this.taille) / 2),
        this.stringColor,
        this.opacite,
        this.taille,
        0,
      ),
    )
    for (let i = 0; i < rang; i++) {
      lettre = texteParPosition(
        lettreDepuisChiffre(1 + i),
        this.x -
          (this.rang * this.taille) / 2 +
          ((2 * i + 1) * this.taille) / 2,
        this.y - ((this.rang + 1) * this.taille) / 2,
        0,
        bleuMathalea,
        0.5,
        'milieu',
        false,
        0.2,
      ) as TexteParPoint
      chiffre = texteParPosition(
        String(i + 1),
        this.x - ((this.rang + 1) * this.taille) / 2,
        this.y -
          (this.rang * this.taille) / 2 +
          ((2 * i + 1) * this.taille) / 2,
        0,
        bleuMathalea,
        0.5,
        'milieu',
        false,
        0.2,
      ) as TexteParPoint
      lettre.taille = 10 * this.taille
      chiffre.taille = 10 * this.taille
      objets.push(lettre)
      objets.push(chiffre)
    }
    // on définit les bordures (important car les cibles se placent souvent aléatoirement)
    let xmin = 1000
    let ymin = 1000
    let xmax = -1000
    let ymax = -1000
    for (const objet of objets) {
      if (objet.bordures !== undefined) {
        xmin = Math.min(xmin, objet.bordures[0])
        ymin = Math.min(ymin, objet.bordures[1])
        xmax = Math.max(xmax, objet.bordures[2])
        ymax = Math.max(ymax, objet.bordures[3])
      }
    }
    this.bordures = [xmin, ymin, xmax, ymax]
    this.objets = objets
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}

/**
 * Crée une cible carrée pour l'auto-correction
 * @param {number} [x = 0] Abscisse du point au centre de la cible
 * @param {number} [y = 0] Ordonnée du point au centre de la cible
 * @param {number} [rang = 4] Nombre de cases en largeur
 * @param {number} [num] Numéro (ou rien) pour identifier la cible (quand il y en a plusieurs)
 * @param {number} [taille = 0.6] Taille des cases
 * @param {string} [color = 'gray'] Couleur de la cible. Code couleur HTML acceptée
 * @param {number} [opacite = 0.5] Opacité de la cible
 * @param {string} [colorNum = color] Couleur du numéro identifiant la cible. Code couleur HTML acceptée
 * @param {number} [opaciteNum = 0.5] Opacité du numéro identifiant la cible
 * @example cibleCarree({})
 * // Crée une cible Carree, de centre (0,0), avec 4 carrés en largeur dont chacune a pour côté 0.6, de couleur grise avec une opacité de 50 %
 * @example cibleCarree({ x: 2, y: -1, rang: 5, num: 17, taille: 0.5, color: bleuMathalea, opacite: 0.8 })
 * // Crée une cible Carree, de centre (2,-1), avec 5 carrés en largeur dont chacune a pour côté 0.5, de couleur bleue avec une opacité de 80 %, portant le numéro 17
 * @author Jean-claude Lhote
 * @return {CibleCarree}
 */
// JSDOC Validee par EE Juin 2022
export function cibleCarree({
  x = 0,
  y = 0,
  rang = 4,
  num = 1,
  taille = 0.6,
  color = 'gray',
  opacite = 0.5,
  colorNum = color,
  opaciteNum = 1,
}: {
  x?: number
  y?: number
  rang?: number
  num?: number
  taille?: number
  color?: string
  opacite?: number
  colorNum?: string
  opaciteNum?: number
} = {}) {
  return new CibleCarree({
    x,
    y,
    rang,
    num,
    taille,
    color,
    opacite,
    colorNum,
    opaciteNum,
  })
}

/**  Retourne un couple de coordonnées correspondant au centre d'une cible, connaissant les coordonnées du point réponse et de la cellule dans laquelle on veut qu'il soit
 * @param {number} x Abscisse du point réponse
 * @param {number} y Ordonnée du point réponse
 * @param {number} rang Nombre de cases sur une couronne
 * @param {number} taille Différence entre deux rayons successifs
 * @param {string} cellule Cellule de la réponse, chaine définie par exemple comme 'A1' ou 'B3'
 * @example dansLaCibleCarree(-1, -3, 4, 0.6, 'B2')
 // Retourne les coordonnées du centre d'une cible ronde de rang 4 et de taille 0.6 dont la réponse est le point (-1;-3) dans la cellule B2
 * @return {number[]|string} Ce sont les coordonnées du centre de la cible ou bien 'Cette cellule n'existe pas dans la cible'
 * @author Jean-claude Lhote
 */
// JSDOC Validee par EE Aout 2022
export function dansLaCibleRonde(
  x: number,
  y: number,
  rang: number,
  taille: number,
  cellule: string,
) {
  const lettre = cellule[0]
  const chiffrelettre = lettre.charCodeAt(0) - 64
  const chiffre = parseInt(cellule[1])
  const drayon = 0
  const dangle = randint(-7, 7)
  const angle = (chiffrelettre - 1) * 45 - 157.5 + dangle
  const rayon = taille / 2 + (chiffre - 1) * taille + drayon
  const P = similitude(pointAbstrait(1, 0), pointAbstrait(0, 0), angle, rayon)
  P.x += x
  P.y += y
  if (chiffre > rang || chiffrelettre > 8) {
    console.error("Cette cellule n'existe pas dans la cible")
    return [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
  } else {
    return [P.x, P.y]
  }
}

/**
 * Crée une cible ronde pour l'auto-correction
 * @param {number} [x=0] Abscisse du point au centre de la cible
 * @param {number} [y=0] Ordonnée du point au centre de la cible
 * @param {number} [rang=3] Nombre de cercles centrés sur le centre de la cible
 * @param {number} [taille=0.3] Distance entre le centre de la cible et le premier cercle (et entre chaque cercle consécutif)
 * @param {string} [color='gray'] Couleur de la cible. Code couleur HTML acceptée
 * @param {number} [opacite=0.5] Opacité de la cible
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {number} x Abscisse du point au centre de la cible
 * @property {number} y Ordonnée du point au centre de la cible
 * @property {number} rang Nombre de cercles centrés sur le centre de la cible
 * @property {number} taille Distance entre le centre de la cible et le premier cercle (et entre chaque cercle consécutif)
 * @property {string} color Couleur de la cible. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} opacite Opacité de la cible
 * @author Jean-claude Lhote
 * @class
 */
// JSDOC Validee par EE Juin 2022
export class CibleRonde extends ObjetMathalea2D {
  stringColor: string
  x: number
  y: number
  rang: number
  taille: number
  constructor({
    x = 0,
    y = 0,
    rang = 3,
    num,
    taille = 0.3,
    color = 'gray',
    opacite = 0.5,
  }: {
    x?: number
    y?: number
    rang?: number
    num?: number
    taille?: number
    color?: string
    opacite?: number
  } = {}) {
    super()
    this.objets = []
    this.stringColor = color
    this.x = x
    this.y = y
    this.taille = taille
    this.rang = rang
    this.opacite = opacite
    this.color = colorToLatexOrHTML(color)
    let c
    let rayon
    const centre = pointAbstrait(this.x, this.y)
    const azimut = pointAbstrait(this.x + this.rang * this.taille, this.y)
    // objets.push(labelPoint(centre))
    const azimut2 = pointSurSegment(
      centre,
      azimut,
      longueur(centre, azimut) + 0.3,
    )
    this.bordures = [
      this.x - this.rang * this.taille - 1,
      this.y - this.rang * this.taille - 1,
      this.x + this.rang * this.taille + 1,
      this.y + this.rang * this.taille + 1,
    ]
    for (let i = 0; i < 8; i++) {
      rayon = segment(
        centre,
        rotation(azimut, centre, 45 * i),
        this.stringColor,
      )
      rayon.opacite = this.opacite
      this.objets.push(rayon)
      this.objets.push(
        texteParPoint(
          lettreDepuisChiffre(1 + i),
          rotation(azimut2, centre, 45 * i + 22.5),
          0,
        ),
      )
    }
    for (let i = 0; i < this.rang; i++) {
      c = cercle(centre, arrondi(this.taille * (1 + i)), this.stringColor)
      c.opacite = this.opacite
      this.objets.push(c)
    }
    if (num !== undefined) {
      const numero = texteParPosition(
        nombreAvecEspace(num),
        this.x,
        this.y,
        0,
        this.stringColor,
      ) as TexteParPoint
      numero.opacite = 0.5
      numero.taille = 30
      numero.contour = true
      this.objets.push(numero)
    }
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  ttikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}

/**
 * Crée une cible ronde pour l'auto-correction
 * @param {number} [x=0] Abscisse du point au centre de la cible
 * @param {number} [y=0] Ordonnée du point au centre de la cible
 * @param {number} [rang=3] Nombre de cercles centrés sur le centre de la cible
 * @param {number} [taille=0.3] Distance entre le centre de la cible et le premier cercle (et entre chaque cercle consécutif)
 * @param {string} [color='gray'] Couleur de la cible. Code couleur HTML acceptée
 * @param {number} [opacite=0.5] Opacité de la cible
 * @example cibleRonde({})
 * // Crée une cible ronde, de centre (0,0), possédant 3 cercles, avec une distance de 0,3 entre chaque cercle consécutifu cercle intérieur est 5, de couleur grise avec une opacité de 50 %.
 * @example cibleRonde({ x: 2, y: -1, rang: 10, taille: 1, color: bleuMathalea, opacite: 0.8 })
 * // Crée une cible ronde, de centre (2,-1), possédant 10 cercles, avec une distance de 1 entre chaque cercle consécutifu cercle intérieur est 5, de couleur bleue avec une opacité de 80 %.
 * @author Jean-claude Lhote
 * @return {CibleRonde}
 */
// JSDOC Validee par EE Juin 2022
export function cibleRonde({
  x = 0,
  y = 0,
  rang = 3,
  num,
  taille = 0.3,
  color = 'gray',
  opacite = 0.5,
}: {
  x?: number
  y?: number
  rang?: number
  num?: number
  taille?: number
  color?: string
  opacite?: number
} = {}) {
  return new CibleRonde({ x, y, rang, num, taille, color, opacite })
}

/**
 * Crée une cible couronne pour l'auto-correction
 * @param {number} [x=0] Abscisse du point au centre de la cible
 * @param {number} [y=0] Ordonnée du point au centre de la cible
 * @param {number} [taille=5] Rayon du cercle intérieur
 * @param {number} [taille2=1] Longueur des segments dans la couronne
 * @param {number} [depart=0] Valeur angulaire en degré du départ de la couronne
 * @param {number} [nbDivisions=18] Nombre de divisions de la couronne
 * @param {number} [nbSubDivisions=3] Nombre de subdivisions dans chaque division de la couronne
 * @param {boolean} [semi=false] Pour obtenir une cible semi-circulaire ou circulaire
 * @param {boolean} [label=true] Pour faire apparaître ou disparaître les lettres dans la couronne
 * @param {string} [color='gray'] Couleur de la cible. Code couleur HTML acceptée
 * @param {number} [opacite=0.5] Opacité de la cible
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {number} x Abscisse du point au centre de la cible
 * @property {number} y Ordonnée du point au centre de la cible
 * @property {number} depart Valeur angulaire en degré du départ de la couronne
 * @property {number} taille Rayon du cercle intérieur
 * @property {number} taille2 Longueur des segments dans la couronne
 * @property {string} color Couleur de la cible. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} opacite Opacité de la cible
 * @author Jean-claude Lhote
 * @class
 */
// JSDOC Validee par EE Juin 2022
export class CibleCouronne extends ObjetMathalea2D {
  x: number
  y: number
  taille: number
  taille2: number
  depart: number
  objets: any[] = []
  stringColor: string

  constructor({
    x = 0,
    y = 0,
    taille = 5,
    taille2 = 1,
    depart = 0,
    nbDivisions = 18,
    nbSubDivisions = 3,
    semi = false,
    label = true,
    color = 'gray',
    opacite = 0.5,
  }: {
    x?: number
    y?: number
    taille?: number
    taille2?: number
    depart?: number
    nbDivisions?: number
    nbSubDivisions?: number
    semi?: boolean
    label?: boolean
    color?: string
    opacite?: number
  } = {}) {
    super()
    this.x = x
    this.stringColor = color
    this.y = y
    this.taille = taille
    this.taille2 = taille2
    this.opacite = opacite
    this.color = colorToLatexOrHTML(color)
    this.depart = depart
    let numero
    let azimut
    let rayon
    const arcPlein = semi ? 180 : 360
    const centre = pointAbstrait(this.x, this.y)
    azimut = rotation(
      pointAbstrait(this.x + this.taille, this.y),
      centre,
      this.depart,
    )
    let azimut2 = pointSurSegment(
      centre,
      azimut,
      longueur(centre, azimut) + this.taille2,
    )
    const rayons = []
    const arc1 = arc(
      azimut,
      centre,
      arcPlein - 0.1,
      false,
      'none',
      this.stringColor,
    )
    const arc2 = arc(
      azimut2,
      centre,
      arcPlein - 0.1,
      false,
      'none',
      this.stringColor,
    )
    rayon = segment(azimut, azimut2)
    this.objets.push(arc1, arc2, rayon)
    for (let i = 0; i < nbDivisions; i++) {
      for (let j = 1; j < nbSubDivisions; j++) {
        rayons[j - 1] = rotation(
          rayon,
          centre,
          (j * arcPlein) / nbDivisions / nbSubDivisions,
          this.stringColor,
        )
        rayons[j - 1].pointilles = 5
        rayons[j - 1].opacite = this.opacite
        this.objets.push(rayons[j - 1])
      }
      if (label) {
        numero = texteParPoint(
          lettreDepuisChiffre(1 + i),
          rotation(milieu(azimut, azimut2), centre, arcPlein / nbDivisions / 2),
          0,
          'black',
          1,
          'milieu',
          true,
        )
        numero.contour = true
        this.objets.push(numero)
      }
      rayon.color = colorToLatexOrHTML(this.stringColor)
      rayon.opacite = this.opacite
      this.objets.push(rayon)
      azimut = rotation(azimut, centre, arcPlein / nbDivisions)
      azimut2 = rotation(azimut2, centre, arcPlein / nbDivisions)
      rayon = segment(azimut, azimut2, this.stringColor)
    }
    if (semi) {
      this.objets.push(rayon)
    }
    this.bordures = [
      this.x - taille - 1,
      this.y - this.taille - 1,
      this.x + this.taille + 1,
      this.y + this.taille + 1,
    ]
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}

/**
 * Crée une cible couronne pour l'auto-correction
 * @param {number} [x=0] Abscisse du point au centre de la cible
 * @param {number} [y=0] Ordonnée du point au centre de la cible
 * @param {number} [taille=5] Rayon du cercle intérieur
 * @param {number} [taille2=1] Longueur des segments dans la couronne
 * @param {number} [depart=0] Valeur angulaire en degré du départ de la couronne
 * @param {number} [nbDivisions=18] Nombre de divisions de la couronne
 * @param {number} [nbSubDivisions=3] Nombre de subdivisions dans chaque division de la couronne
 * @param {boolean} [semi=false] Pour obtenir une cible semi-circulaire ou circulaire
 * @param {boolean} [label=true] Pour faire apparaître ou disparaître les lettres dans la couronne
 * @param {string} [color='gray'] Couleur de la cible. Code couleur HTML acceptée
 * @param {number} [opacite=0.5] Opacité des segments de divisions et subdivisions
 * @example cibleCouronne({})
 * // Crée une cible couronne circulaire, de centre (0,0), dont le rayon du cercle intérieur est 5, la longueur des segments est 1, la première lettre démarre à 0°,
 * //    le nombre de divisions de la couronne est 18, le nombre de subdivisions est 3, leur opacité est 50 %, avec les lettres apparentes, de couleur grise
 * @example cibleCouronne({ x: 2, y: -1, taille: 4, taille2: 2, depart: 35, nbDivisions: 12, nbSubDivisions: 2, semi: true, label: false, color: bleuMathalea, opacite: 0.8 })
 * // Crée une cible couronne semi-circulaire, de centre (2,-1), dont le rayon du cercle intérieur est 4, la longueur des segments est 2, la première lettre démarre à 35°,
 * //    le nombre de divisions de la couronne est 12, le nombre de subdivisions est 2, leur opacité est 80 %, avec les lettres non apparentes, de couleur bleue
 * @author Jean-claude Lhote
 * @return {CibleCouronne}
 */
// JSDOC Validee par EE Juin 2022
export function cibleCouronne({
  x = 0,
  y = 0,
  taille = 5,
  taille2 = 1,
  depart = 0,
  nbDivisions = 18,
  nbSubDivisions = 3,
  semi = false,
  label = true,
  color = 'gray',
  opacite = 0.5,
}) {
  return new CibleCouronne({
    x,
    y,
    taille,
    taille2,
    depart,
    nbDivisions,
    nbSubDivisions,
    semi,
    label,
    color,
    opacite,
  })
}
