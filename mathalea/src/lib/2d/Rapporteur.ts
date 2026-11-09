import { arc } from './Arc'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { texteParPoint } from './textes'
import { homothetie, rotation } from './transformations'
import { pointSurSegment } from './utilitairesPoint'

export class Rapporteur extends ObjetMathalea2D {
  x: number
  y: number
  taille: number

  constructor({
    x = 0,
    y = 0,
    taille = 7,
    depart = 0,
    semi = false,
    avecNombre = 'deuxSens',
    precisionAuDegre = 1,
    stepGraduation = 10,
    rayonsVisibles = true,
    color = 'gray',
  }) {
    super()
    this.x = x
    this.y = y
    this.taille = taille
    this.opacite = 0.7
    this.color = colorToLatexOrHTML(color)
    this.objets = []
    let numero
    let azimut
    let rayon
    let nbDivisions
    let arcPlein
    if (semi) {
      arcPlein = 180
      nbDivisions = 18
    } else {
      arcPlein = 360
      nbDivisions = 36
    }

    const centre = pointAbstrait(this.x, this.y)
    azimut = rotation(pointAbstrait(this.x + 1, this.y), centre, depart)
    let azimut2 = pointSurSegment(centre, azimut, this.taille)
    const arc1 = arc(azimut, centre, arcPlein - 0.1, false, 'none', color)
    const arc2 = arc(azimut2, centre, arcPlein - 0.1, false, 'none', color)
    this.objets.push(segment(azimut2, rotation(azimut2, centre, 180), color))
    rayon = segment(azimut, azimut2, color)
    if (rayonsVisibles) this.objets.push(arc1)
    // this.objets.push(arc2, rayon)
    this.objets.push(arc2)
    for (let i = 0; i < nbDivisions; i++) {
      if (avecNombre !== '') {
        if (avecNombre === 'deuxSens') {
          if (i === 0) {
            numero = texteParPoint(
              String(arcPlein),
              rotation(homothetie(azimut2, centre, 0.8), centre, 2),
              -depart,
              color,
              0.65,
            )
            numero.contour = true
            this.objets.push(numero)
          }
          if (i === nbDivisions - 1) {
            numero = texteParPoint(
              String(arcPlein - (1 + i) * 10),
              rotation(
                homothetie(azimut2, centre, 0.8),
                centre,
                arcPlein / nbDivisions - 2,
              ),
              -depart,
              color,
              0.65,
            )
            numero.contour = true
            this.objets.push(numero)
          } else if ((arcPlein - (1 + i) * 10) % stepGraduation === 0) {
            numero = texteParPoint(
              String(arcPlein - (1 + i) * 10),
              rotation(
                homothetie(azimut2, centre, 0.8),
                centre,
                arcPlein / nbDivisions,
              ),
              90 - (1 + i) * 10 - depart,
              color,
              0.78,
            )
            numero.contour = true
            this.objets.push(numero)
          }
        }
        if (i === 0) {
          numero = texteParPoint(
            '0',
            rotation(homothetie(azimut2, centre, 0.9), centre, 2),
            -depart,
            color,
            0.65,
          )
          numero.contour = true
          this.objets.push(numero)
        }
        if (i === nbDivisions - 1) {
          numero = texteParPoint(
            String((1 + i) * 10),
            rotation(
              homothetie(azimut2, centre, 0.9),
              centre,
              arcPlein / nbDivisions - 2,
            ),
            -depart,
            color,
            0.65,
          )
          numero.contour = true
          this.objets.push(numero)
        } else if (((i + 1) * 10) % stepGraduation === 0) {
          numero = texteParPoint(
            String((1 + i) * 10),
            rotation(
              homothetie(azimut2, centre, 0.9),
              centre,
              arcPlein / nbDivisions,
            ),
            90 - (1 + i) * 10 - depart,
            color,
            0.65,
          )
          numero.contour = true
          this.objets.push(numero)
        }
      }
      for (let s = 1, r; s < 10; s++) {
        if (s === 5 && precisionAuDegre < 10) {
          r = segment(
            homothetie(rotation(azimut2, centre, s), centre, 0.92),
            homothetie(rotation(azimut2, centre, s), centre, 0.99),
            color,
          )
          r.opacite = 0.6
          r.tailleExtremites = 0.65
          this.objets.push(r)
        } else if (precisionAuDegre === 1) {
          r = segment(
            homothetie(rotation(azimut2, centre, s), centre, 0.96),
            homothetie(rotation(azimut2, centre, s), centre, 0.99),
            color,
          )
          r.opacite = 0.6
          r.tailleExtremites = 0.65
          this.objets.push(r)
        }
      }
      if (i !== 0 && i !== 36 && i !== 18) this.objets.push(rayon)
      azimut = rotation(azimut, centre, arcPlein / nbDivisions)
      azimut2 = rotation(azimut2, centre, arcPlein / nbDivisions)

      if (rayonsVisibles) rayon = segment(azimut, azimut2, color)
      else rayon = segment(homothetie(azimut2, centre, 0.9), azimut2, color)
      rayon.opacite = this.opacite
    }
    if (!semi) {
      rayon = segment(
        homothetie(rotation(azimut, centre, -90), centre, -0.2),
        homothetie(rotation(azimut, centre, -90), centre, 0.2),
        color,
      )
      this.objets.push(rayon)
      rayon = segment(
        homothetie(azimut, centre, -0.2),
        homothetie(azimut, centre, 0.2),
        color,
      )
    } else {
      rayon = segment(
        centre,
        homothetie(rotation(azimut, centre, -90), centre, 0.2),
        color,
      )
    }
    this.objets.push(rayon)
    const bordures = fixeBordures(this.objets, {
      rxmin: 0,
      rxmax: 0,
      rymin: 0,
      rymax: 0,
    })
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
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
      code += `\t${objet.tikz()}`
    }
    return code
  }
}
/**
 * place un rapporteur centré en (x,y) avec le zéro orienté à depart degrés.
 * @param {object} parametres
 * @param {number} [parametres.x] abscisse du centre du rapporteur
 * @param {number} [parametres.y] ordonnée du centre du rapporteur
 * @param {number} [parametres.taille] taille du rapporteur
 * @param {number} [parametres.depart] orientation du zéro du rapporteur en degrés
 * @param {boolean} [parametres.semi] si semi === false alors les graduations vont de 0 à 180° sinon de 0 à 360°
 * @param {string} [parametres.avecNombre] === "", il n'y a pas de graduations, si avecNombre === "deuxSens" il est gradué dans les deux directions
 * si avecNombre === "unSens" il est gradué dans le sens trigo.
 * @param {number}[parametres. precisionAuDegre] === 10 alors il n'y aura pas de graduations entre les multiples de 10°, les autres valeurs sont 5 et 1.
 * @param {number} [parametres.stepGraduation] est un multiple de 10 qui divise 180 (c'est mieux) donc 10 (par défaut), ou 20, ou 30, ou 60 ou 90.
 * @param {boolean} [parametres.rayonsVisibles] = false permet de supprimer les rayons et le cercle central
 * @param {object} param0 = {x: 'number', y: 'number', taille: 'number', semi: boolean, avecNombre: string}
 * @return {Rapporteur} // crée un instance de l'objet 2d Rapporteur
 */

export function rapporteur({
  x = 0,
  y = 0,
  taille = 7,
  depart = 0,
  semi = false,
  avecNombre = 'deuxSens',
  precisionAuDegre = 1,
  stepGraduation = 10,
  rayonsVisibles = true,
  color = 'gray',
}) {
  return new Rapporteur({
    x,
    y,
    taille,
    depart,
    semi,
    avecNombre,
    precisionAuDegre,
    stepGraduation,
    rayonsVisibles,
    color,
  })
}
