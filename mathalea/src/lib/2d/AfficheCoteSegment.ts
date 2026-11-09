import { afficheLongueurSegment } from './afficheLongueurSegment'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { placeLatexSurSegment } from './placeLatexSurSegment'
import { Segment, segment } from './segmentsVecteurs'
import { texteSurSegment } from './texteSurSegment'
import { similitude, translation } from './transformations'
import { longueur } from './utilitairesGeometriques'
import { vecteur } from './Vecteur'
import { Vide2d } from './Vide2d'

/**
 * Affiche la côte d'un segment sous la forme d'une flèche à double sens et d'une valeur associée.
 * @param {Segment} s Segment pour lequel on affiche la côte
 * @param {string} [Cote=''] Si '', alors la longueur en cm est affichée, sinon c'est cette valeur qui s'affiche (et cela peut être une variable).
 * @param {number} [positionCote = 0.5] Position de la flèche par rapport au segment. Valeur négative ou positive selon la position voulue.
 * @param {string} [couleurCote='black'] Couleur de la flèche  : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [epaisseurCote=1] Epaisseur de la flèche.
 * @param {number} [positionValeur=0.5] Position de la valeur par rapport à la flèche. Valeur négative ou positive selon la position voulue.
 * @param {string} [couleurValeur='black']  Couleur de la valeur indiquée : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {boolean} [horizontal=false]  Si true, alors le texte est horizontal, sinon le texte est parallèle au segment.
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @author Jean-claude Lhote
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class AfficheCoteSegment extends ObjetMathalea2D {
  Cote: any
  constructor(
    s: Segment,
    Cote = '',
    positionCote = 0.5,
    couleurCote = 'black',
    epaisseurCote = 1,
    positionValeur = 0.5,
    couleurValeur = 'black',
    horizontal = false,
  ) {
    super()
    let valeur
    const A = s.extremite1
    const B = s.extremite2

    const v = similitude(vecteur(A, B), A, 90, positionCote / s.longueur)
    const cote = segment(translation(A, v), translation(B, v), couleurCote)
    if (longueur(A, B) > 1) cote.styleExtremites = '<->'
    else cote.styleExtremites = '>-<'
    cote.epaisseur = epaisseurCote
    if (Cote.length === 0) {
      valeur = afficheLongueurSegment(
        cote.extremite1,
        cote.extremite2,
        couleurValeur,
        positionValeur,
        'cm',
        horizontal,
      )
    }
    if (Cote.includes('\\')) {
      valeur = placeLatexSurSegment(Cote, cote.extremite1, cote.extremite2, {
        distance: positionValeur,
        horizontal,
        letterSize: 'normalsize',
        color: couleurValeur,
      })
    } else {
      valeur = texteSurSegment(
        String(Cote).replace('.', ','), // Pour les pays utilisant la virgule comme séparateur décimal
        cote.extremite1,
        cote.extremite2,
        couleurValeur,
        positionValeur,
        horizontal,
      )
    }
    const { xmin, xmax, ymin, ymax } = fixeBordures([cote, valeur])
    this.bordures = [xmin, ymin, xmax, ymax]
    this.objets = [cote, valeur]
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    this.objets.forEach((objet) => {
      objet.opacite = this.opacite
    })
    for (const objet of this.objets) code += '\n\t' + objet.svg(coeff)
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    this.objets.forEach((objet) => {
      objet.opacite = this.opacite
    })
    for (const objet of this.objets) code += `\t${objet.tikz()}\n`
    return code
  }
}
/**
 * Affiche la côte d'un segment sous la forme d'une flèche à double sens et d'une valeur associée.
 * @param {Segment} s Segment pour lequel on affiche la côte
 * @param {string} [Cote=''] Si '', alors la longueur en cm est affichée, sinon c'est cette valeur qui s'affiche (et cela peut être une variable).
 * @param {number} [positionCote = 0.5] Position de la flèche par rapport au segment. Valeur négative ou positive selon la position voulue.
 * @param {string} [couleurCote='black'] Couleur de la flèche  : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [epaisseurCote=1] Epaisseur de la flèche.
 * @param {number} [positionValeur=0.5] Position de la valeur par rapport à la flèche. Valeur négative ou positive selon la position voulue.
 * @param {string} [couleurValeur='black']  Couleur de la valeur indiquée : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {boolean} [horizontal=false]  Si true, alors le texte est horizontal, sinon le texte est parallèle au segment.
 * @example afficheCoteSegment(s)
 * // Affiche la côte du segment s (avec une flèche noire d\'épaisseur 1 "cm", placée 0.5 "cm" sous le segment, avec la longueur du segment, en cm, écrite en noir, 0,5 "cm" au-dessus, et parallèle au segment).
 * @example afficheCoteSegment(s,'x',-1,'red',2,1,bleuMathalea,true)
 * // Affiche la côte du segment s, avec une flèche rouge d\'épaisseur 2 "cm", placée 1 "cm" sous le segment, avec le texte 'x' écrit en bleu, 1 "cm" au-dessus, et horizontalement.
 * @return {AfficheCoteSegment|Vide2d}
 * @author Jean-claude Lhote
 */
// JSDOC Validee par EE Juin 2022

export function afficheCoteSegment(
  s: Segment,
  Cote = '',
  positionCote = 0.5,
  couleurCote = 'black',
  epaisseurCote = 1,
  positionValeur = 0.5,
  couleurValeur = 'black',
  horizontal = false,
) {
  if (s.longueur < 1) {
    window.notify(
      'afficheCoteSegment : Segment trop petit pour cette fonction',
      { s },
    )
    return new Vide2d(s.extremite1.x, s.extremite1.y)
  }
  return new AfficheCoteSegment(
    s,
    Cote,
    positionCote,
    couleurCote,
    epaisseurCote,
    positionValeur,
    couleurValeur,
    horizontal,
  )
}
