import { MathfieldElement } from 'mathlive'
import { context } from '../../modules/context'
import { parseHexColor } from '../colors'
import { AddTabDbleEntryMathlive } from '../interactif/tableaux/AjouteTableauMathlive'
import { stringNombre, texNombre } from '../outils/texNombre'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { PointAbstrait, pointAbstrait } from './PointAbstrait'
import { polygone } from './polygones'
import { Polyline, polyline } from './Polyline'
import { Segment, segment } from './segmentsVecteurs'
import './tableau2x2.scss'
import {
  latex2d,
  latexParCoordonnees,
  TexteParPoint,
  texteParPosition,
} from './textes'
import { milieu } from './utilitairesPoint'

export type StyledText = {
  texte: string
  gras?: boolean
  math?: boolean
  latex?: boolean
  color?: string
}

/**
 * Fonction utilisée par la classe Tableau pour créer une flèche
 * Pour l'objet texte : si texte.latex est true, alors les autres paramètres sont ignorés et tout le formatage doit être contenu dans texte
 * Si texte.latex est false, alors c'est texteParPosition qui est utilisé avec possibilité de mise en gras, en caractères spéciaux, en couleur
 * @author Rémi Angot
 */
function flecheH(
  D: PointAbstrait,
  A: PointAbstrait,
  texte: StyledText,
  h: number = 1,
): (Polyline | Segment | TexteParPoint | ObjetMathalea2D)[] {
  const D1 = new PointAbstrait(D.x, D.y + h)
  const A1 = pointAbstrait(A.x, A.y + h)
  const fleche = polyline(D, D1, A1)
  const eFleche = segment(A1, A)
  eFleche.styleExtremites = '->'
  const M = milieu(D1, A1)
  const objets: (Polyline | Segment | TexteParPoint | ObjetMathalea2D)[] = [
    fleche,
    eFleche,
  ]
  let t
  if (texte) {
    const color = texte.color ?? 'black'
    if (texte.latex) {
      t = latexParCoordonnees(
        texte.texte,
        M.x,
        M.y + (h > 0 ? 0.5 : -0.8),
        color,
        50,
        20,
        '',
        10,
      )
    } else {
      const math = texte.math ?? false
      t = texteParPosition(
        texte.texte,
        M.x,
        M.y + (h > 0 ? 0.5 : -0.8),
        0,
        color,
        1,
        'gauche',
        math,
      ) as TexteParPoint
      t.gras = texte.gras ?? false
    }
    objets.push(t)
  }
  return objets
}

/**
 * Fonction utilisée par la classe Tableau pour créer une flèche
 * Pour l'objet texte : si texte.latex est true, alors les autres paramètres sont ignorés et tout le formatage doit être contenu dans texte
 * Si texte.latex est false, alors c'est texteParPosition qui est utilisé avec possibilité de mise en gras, en caractères spéciaux, en couleur
 * @author Rémi Angot
 */
function flecheV(
  D: PointAbstrait,
  A: PointAbstrait,
  texte: StyledText,
  h: number = 1,
  flip: boolean = false,
): (Polyline | Segment | TexteParPoint | ObjetMathalea2D)[] {
  if (flip) h = -h
  const D1 = pointAbstrait(D.x + h, D.y)
  const A1 = pointAbstrait(A.x + h, A.y)
  const fleche = polyline(D, D1, A1)
  const eFleche = segment(A1, A)
  eFleche.styleExtremites = '->'
  const M = milieu(D1, A1)
  const objets: Polyline | Segment | TexteParPoint | ObjetMathalea2D[] = [
    fleche,
    eFleche,
  ]
  let t
  const color = texte.color ?? 'black'
  const math = texte.math ?? false
  if (texte) {
    if (texte.latex) {
      // t = latexParCoordonnees(texte.texte, M.x + h, M.y - 0.6, color, 50, 20, '', 10)
      // EE : Changement 19/04/2024 pour 5P13 et tenir compte de grands coefficients de proportionnalité
      t = latex2d(texte.texte, M.x + h / 2, M.y, {
        color,
        justify: flip ? 'gauche' : 'droite',
      })
    } else {
      t = texteParPosition(
        texte.texte,
        M.x + h,
        M.y - 0.6,
        0,
        color,
        1,
        flip ? 'droite' : 'gauche',
        math,
      ) as TexteParPoint
      t.gras = texte.gras ?? false
    }
    objets.push(t)
  }
  return objets
}

type TableauParams = {
  largeurTitre?: number
  largeur?: number
  hauteur?: number
  nbColonnes?: number
  origine?: PointAbstrait
  ligne1: StyledText[] // Si texte.latex est false, alors c'est texteParPosition qui est utilisé avec possibilité de mise en gras, en caractères spéciaux, en couleur. Si texte.latex est true, les autres paramètres sont ignorés et le mise en forme devra être contenue dans le texte
  ligne2: StyledText[] // Si texte.latex est false, alors c'est texteParPosition qui est utilisé avec possibilité de mise en gras, en caractères spéciaux, en couleur. Si texte.latex est true, les autres paramètres sont ignorés et le mise en forme devra être contenue dans le texte
  flecheHaut?: [number, number, StyledText, number?][]
  flecheBas?: [number, number, StyledText, number?][]
  flecheDroite?: StyledText
  flecheDroiteSens?: 'bas' | 'haut'
  flecheGauche?: StyledText
  flecheGaucheSens?: 'bas' | 'haut'
}
export class Tableau extends ObjetMathalea2D {
  /**
   * Réalise un tableau typique des exercices de proportionnalité avec d'éventuelles flèches
   * @author Rémi Angot
   */
  constructor({
    largeurTitre = 7,
    largeur = 3,
    hauteur = 2,
    nbColonnes = 3,
    origine = pointAbstrait(0, 0),
    ligne1,
    ligne2,
    flecheHaut = [], // [[1, 2, '\\times 6,4', 3], [2, 3, '\\div 6']]
    flecheBas = [],
    flecheDroite,
    flecheDroiteSens = 'bas',
    flecheGauche,
    flecheGaucheSens = 'haut',
  }: TableauParams) {
    super()
    // Jean-claude Lhote 15/08/2023
    if (ligne1 && ligne2 && Array.isArray(ligne1) && Array.isArray(ligne2)) {
      nbColonnes = Math.max(ligne1.length, ligne2.length, nbColonnes)
    }
    const A = origine
    const B = pointAbstrait(
      A.x + largeurTitre + largeur * (nbColonnes - 1),
      A.y,
    )
    const C = pointAbstrait(B.x, B.y + 2 * hauteur)
    const D = pointAbstrait(A.x, A.y + 2 * hauteur)
    // ABCD est le cadre extérieur (A en bas à gauche et B en bas à droite)
    this.objets = []
    this.objets.push(polygone(A, B, C, D))
    this.objets.push(
      segment(
        pointAbstrait(A.x, A.y + hauteur),
        pointAbstrait(B.x, B.y + hauteur),
      ),
    )
    // trait horizontal au milieu
    let x = A.x + largeurTitre
    // x est l'abscisse de la première séparation verticale
    // Ecrit le texte dans les colonnes
    for (let i = 0; i < nbColonnes; i++) {
      this.objets.push(segment(pointAbstrait(x, A.y), pointAbstrait(x, C.y)))
      if (ligne1[i + 1]) {
        if (ligne1[i + 1].latex) {
          this.objets.push(
            latex2d(
              ligne1[i + 1].texte ?? '',
              x + largeur / 2,
              A.y + 1.4 * hauteur,
              {
                letterSize: 'normalsize',
                color: ligne1[i + 1].color || 'black',
                gras: ligne1[i + 1].gras || false,
              },
            ),
          )
        } else {
          const color = ligne1[i + 1].color ?? 'black'
          const math = ligne1[i + 1].math ?? false
          const texte = texteParPosition(
            ligne1[i + 1].texte ?? '',
            x + largeur / 2,
            A.y + 1.4 * hauteur,
            0,
            color,
            1.2,
            'milieu',
            math,
          ) as TexteParPoint
          texte.gras = ligne1[i + 1].gras ?? false
          this.objets.push(texte)
        }
      }
      if (ligne2[i + 1]) {
        if (ligne2[i + 1].latex) {
          this.objets.push(
            latex2d(
              ligne2[i + 1].texte ?? '',
              x + largeur / 2,
              A.y + 0.4 * hauteur,
              {
                letterSize: 'normalsize',
                gras: ligne2[i + 1].gras || false,
                color: ligne2[i + 1].color || 'black',
              },
            ),
          )
        } else {
          const color = ligne2[i + 1].color ?? 'black'
          const math = ligne2[i + 1].math ?? false
          const texte = texteParPosition(
            ligne2[i + 1].texte ?? '',
            x + largeur / 2,
            A.y + 0.4 * hauteur,
            0,
            color,
            1.2,
            'milieu',
            math,
          ) as TexteParPoint
          texte.gras = ligne2[i + 1].gras ?? false
          this.objets.push(texte)
        }
      }
      x += largeur
    }
    // Ecrit les titres
    if (ligne1[0]) {
      if (ligne1[0].latex) {
        // on utilise latexParCoordonnees() tant pis pour le zoom qui devient impossible !
        this.objets.push(
          latex2d(
            ligne1[0].texte ?? '',
            A.x + largeurTitre / 2,
            A.y + 1.4 * hauteur,
            {
              letterSize: 'normalsize',
              color: ligne1[0].color || 'black',
              gras: ligne1[0].gras || false,
            },
          ),
        )
      } else {
        const color = ligne1[0].color ?? 'black'
        const math = ligne1[0].math ?? false
        const texte = texteParPosition(
          ligne1[0].texte ?? '',
          A.x + largeurTitre / 2,
          A.y + 1.4 * hauteur,
          0,
          color,
          1.2,
          'milieu',
          math,
        ) as TexteParPoint
        texte.gras = ligne1[0].gras ?? false
        this.objets.push(texte)
      }
    }
    if (ligne2[0]) {
      if (ligne2[0].latex) {
        // on utilise latex2d() tant pis pour le zoom qui devient impossible !
        this.objets.push(
          latex2d(
            ligne2[0].texte ?? '',
            A.x + largeurTitre / 2,
            A.y + 0.4 * hauteur,
            {
              letterSize: 'normalsize',
              color: ligne2[0].color || 'black',
              gras: ligne2[0].gras || false,
            },
          ),
        )
      } else {
        const color = ligne2[0].color ?? 'black'
        const math = ligne2[0].math ?? false
        const texte = texteParPosition(
          ligne2[0].texte ?? '',
          A.x + largeurTitre / 2,
          A.y + 0.4 * hauteur,
          0,
          color,
          1.2,
          'milieu',
          math,
        ) as TexteParPoint
        texte.gras = ligne2[0].gras ?? false
        this.objets.push(texte)
      }
    }
    for (const fleche of flecheHaut) {
      const Depart = pointAbstrait(
        A.x + largeurTitre + fleche[0] * largeur - 0.4 * largeur,
        A.y + 2.1 * hauteur,
      )
      const Arrivee = pointAbstrait(
        A.x + largeurTitre + fleche[1] * largeur - 0.6 * largeur,
        A.y + 2.1 * hauteur,
      )
      if (fleche[3]) {
        this.objets.push(...flecheH(Depart, Arrivee, fleche[2], fleche[3]))
      } else {
        this.objets.push(...flecheH(Depart, Arrivee, fleche[2]))
      }
    }
    for (const fleche of flecheBas) {
      const Depart = pointAbstrait(
        A.x + largeurTitre + fleche[0] * largeur - 0.4 * largeur,
        A.y - 0.1 * hauteur,
      )
      const Arrivee = pointAbstrait(
        A.x + largeurTitre + fleche[1] * largeur - 0.6 * largeur,
        A.y - 0.1 * hauteur,
      )
      let hFleche
      if (fleche[3]) {
        hFleche = -Math.abs(fleche[3])
      } else {
        hFleche = -1
      }
      this.objets.push(...flecheH(Depart, Arrivee, fleche[2], hFleche))
    }

    // if (flecheDroite && typeof flecheDroite === 'string') {
    if (flecheDroite) {
      const Depart = pointAbstrait(
        A.x + largeurTitre + (nbColonnes - 1) * largeur + 0.2,
        A.y + 1.5 * hauteur,
      )
      const Arrivee = pointAbstrait(
        A.x + largeurTitre + (nbColonnes - 1) * largeur + 0.2,
        A.y + 0.5 * hauteur,
      )
      if (flecheDroiteSens === 'bas') {
        this.objets.push(...flecheV(Depart, Arrivee, flecheDroite))
      } else {
        this.objets.push(...flecheV(Arrivee, Depart, flecheDroite))
      }
      /*const { xmin, ymin, xmax, ymax } = fixeBordures(this.objets, {
        rxmin: 0,
        rxmax: 0,
        rymin: 0,
        rymax: 0,
      })
      this.bordures = [xmin, ymin, xmax, ymax]*/
    }
    // if (flecheGauche && typeof flecheGauche === 'string') {
    if (flecheGauche) {
      const Depart = pointAbstrait(A.x, A.y + 1.5 * hauteur)
      const Arrivee = pointAbstrait(A.x, A.y + 0.5 * hauteur)
      if (flecheGaucheSens === 'bas') {
        this.objets.push(...flecheV(Depart, Arrivee, flecheGauche, 1, true))
      } else {
        this.objets.push(...flecheV(Arrivee, Depart, flecheGauche, 1, true))
      }
    }
    const { xmin, ymin, xmax, ymax } = fixeBordures(this.objets, {
      rxmin: 0,
      rxmax: 0,
      rymin: 0,
      rymax: 0,
    })
    this.bordures = [xmin - 1, ymin, xmax, ymax] // EE : -1 nécessaire pour afficher le x dans 5P10-2
    return this
  }
}
export function tableau(tableauParams: TableauParams) {
  return new Tableau(tableauParams)
}

/**
 * Crée un tableau avec un nombre de lignes et de colonnes déterminées
 * par la longueur des tableaux des entetes passés en paramètre
 * Les contenus sont en mode maths par défaut, il faut donc penser à remplir les tableaux
 * en utilisant éventuellement la commande \\text{}
 *
 * @example
 * tableauColonneLigne(['coin','A','B'],['1','2'],['A1','B1','A2','B2']) affiche le tableau ci-dessous
 * ------------------
 * | coin | A  | B  |
 * ------------------
 * |  1   | A1 | B1 |
 * ------------------
 * |  2   | A2 | B2 |
 * ------------------
 *
 * @example
 * tableauColonneLigne(['coin','A','B','C'],['1','2'],['A1','B1','C1','A2','B2','C2']) affiche le tableau ci-dessous
 * -----------------------
 * | coin | A  | B  | C  |
 * -----------------------
 * |  1   | A1 | B1 | C1 |
 * -----------------------
 * |  2   | A2 | B2 | C2 |
 * -----------------------
 *
 * @example
 * tableauColonneLigne(['coin','A','B'],['1','2','3'],['A1','B1','A2','B2','A3','B3']) affiche le tableau ci-dessous
 * ------------------
 * | coin | A  | B  |
 * ------------------
 * |  1   | A1 | B1 |
 * ------------------
 * |  2   | A2 | B2 |
 * ------------------
 * |  3   | A3 | B3 |
 * ------------------
 *
 * @example
 * tableauColonneLigne(['coin','A','B','C'],['1','2','3'],['A1','B1','C1','A2','B2','C2','A3','B3','C3']) affiche le tableau ci-dessous
 * -----------------------
 * | coin | A  | B  | C  |
 * -----------------------
 * |  1   | A1 | B1 | C1 |
 * -----------------------
 * |  2   | A2 | B2 | C2 |
 * -----------------------
 * |  3   | A3 | B3 | C3 |
 * -----------------------
 *
 * @example avec fin de ligne
 * tableauColonneLigne(['~1','A','B','C','coin2'],['1','2'],['A1','B1','C1','A2','B2','C2'],['f1','f2']) affiche le tableau ci-dessous
 * --------------------------
 * | ~1 | A  | B  | C  | ~1 |
 * --------------------------
 * | 1  | A1 | B1 | C1 | f1 |
 * --------------------------
 * | 2  | A2 | B2 | C2 | f2 |
 * --------------------------
 *
 * @example sans entête de colonne
 * tableauColonneLigne([],['1','2'],['A1','B1','C1','A2','B2','C2']) affiche le tableau ci-dessous
 * -----------------------
 * |  1   | A1 | B1 | C1 |
 * -----------------------
 * |  2   | A2 | B2 | C2 |
 * -----------------------
 * 
 * @author Sébastien Lozano
 */
export function tableauColonneLigne(
  tabEntetesColonnes: (string | number)[],
  tabEntetesLignes: (string | number)[],
  tabLignes: (string | number)[],
  arraystretch = 1,
  latex = true,
  exo = 0,
  question = 0,
  isInteractif = false,
  style: { [key: string]: string } = {},
  tabColFooters: (string | number)[] = [],
  tabLineFooters: (string | number)[] = [],
): string {
  // On construit le string pour obtenir le tableau pour compatibilité HTML et LaTeX
  if (context.isHtml && !context.isTypst) {
    const tableauCL = AddTabDbleEntryMathlive.create(
      exo,
      question,
      AddTabDbleEntryMathlive.convertTclToTableauMathlive(
        tabEntetesColonnes,
        tabEntetesLignes,
        tabLignes,
        tabColFooters,
        tabLineFooters,
      ),
      `tableauMathlive ${style.classes ? style.classes : ''}`,
      isInteractif,
      style,
    )
    return tableauCL.output
  } else {
    // on définit le nombre de data colonnes (sans header ni footer)
    // on définit le nombre de tab colonnes (avec header et footer)
    let nbTabCols = tabEntetesColonnes.length
    let nbDataCols = tabLignes.length / tabEntetesLignes.length
    if (tabEntetesColonnes.length === 0) {
      nbTabCols = nbDataCols
      if (tabEntetesLignes.length > 0) nbTabCols++;
      if (tabLineFooters.length > 0) nbTabCols++;
    }

    // on définit le nombre de lignes (sans header ni footer)
    const nbLignes = tabEntetesLignes.length
    let tableauCL = ''
      if (arraystretch === undefined || typeof arraystretch === 'boolean') {
        arraystretch = 1
      }

    tableauCL += `$\\renewcommand{\\arraystretch}{${arraystretch}}\n`
    tableauCL += '\\begin{array}{|'

    // on construit la 1ere ligne avec toutes les colonnes
    for (let k = 0; k < nbTabCols; k++) {
      tableauCL += 'c|'
    }
    tableauCL += '}\n'

    tableauCL += '\\hline\n'
    const color0 = style.L0C0 ? style.L0C0 : 'lightgray'
    const color0Hex = parseHexColor(color0)
    if (tabEntetesColonnes.length > 0) {
      if (typeof tabEntetesColonnes[0] === 'number') {
        tableauCL += `\\cellcolor${color0Hex ? '[HTML]' : ''}{${color0Hex ? color0Hex.withoutHash : color0}} ${latex ? texNombre(tabEntetesColonnes[0], 2) : '\\text{' + stringNombre(tabEntetesColonnes[0], 2) + '}'}`
      } else {
        tableauCL += `\\cellcolor${color0Hex ? '[HTML]' : ''}{${color0Hex ? color0Hex.withoutHash : color0}} ${latex ? tabEntetesColonnes[0] : '\\text{' + tabEntetesColonnes[0] + '}'}`
      }
      for (let k = 1; k < tabEntetesColonnes.length; k++) {
        const enTeteColonne = tabEntetesColonnes[k]
        const color = style[`L0C${k}`] != null ? style[`L0C${k}`] : 'lightgray'
        const colorHex = parseHexColor(color)
        if (typeof enTeteColonne === 'number') {
          tableauCL += ` & \\cellcolor${colorHex ? '[HTML]' : ''}{${colorHex ? colorHex.withoutHash : color}} ${latex ? texNombre(enTeteColonne, 6) : '\\text{' + stringNombre(enTeteColonne, 6) + '}'}`
        } else {
          tableauCL += ` & \\cellcolor${colorHex ? '[HTML]' : ''}{${colorHex ? colorHex.withoutHash : color}} ${latex ? enTeteColonne : '\\text{' + enTeteColonne + '}'}`
        }
      }
      tableauCL += '\\\\\n'
      // tableauCL += '\\hline\n \\rule[-2ex]{0pt} {6ex}\\ '
      tableauCL += '\\hline\n'
    }
    // on construit toutes les lignes
    for (let k = 0; k < nbLignes; k++) {
      const enTeteLigne = tabEntetesLignes[k]
      const color = style[`L${k + 1}C0`]
        ? style[`L${k + 1}C0`]
        : style.LC0
          ? style.LC0
          : 'lightgray'
      const colorHex = parseHexColor(color)
      if (typeof enTeteLigne === 'number') {
        tableauCL += `\\cellcolor${colorHex ? '[HTML]' : ''}{${colorHex ? colorHex.withoutHash : color}} ${latex ? texNombre(enTeteLigne, 6) : '\\text{' + stringNombre(enTeteLigne, 6) + '}'}`
      } else {
        tableauCL += `\\cellcolor${colorHex ? '[HTML]' : ''}{${colorHex ? colorHex.withoutHash : color}} ${latex ? enTeteLigne : '\\text{' + enTeteLigne + '}'}`
      }
      for (let m = 0; m < nbDataCols; m++) {
        const cellule = tabLignes[nbDataCols * k + m]
        const color =
          style[`L${k + 1}C${m + 1}`] != null ? style[`L${k + 1}C${m + 1}`] : ''
        const colorHex = parseHexColor(color)
        if (typeof cellule === 'number') {
          if (color !== '') {
            tableauCL += ` & \\cellcolor${colorHex ? '[HTML]' : ''}{${colorHex ? colorHex.withoutHash : color}} ${latex ? texNombre(cellule, 6) : '\\text{' + stringNombre(cellule, 6) + '}'}`
          } else {
            tableauCL += ` & ${latex ? texNombre(cellule, 6) : '\\text{' + stringNombre(cellule, 6) + '}'}`
          }
        } else {
          if (color !== '') {
            tableauCL += ` & \\cellcolor${colorHex ? '[HTML]' : ''}{${colorHex ? colorHex.withoutHash : color}} ${latex ? cellule : '\\text{' + cellule + '}'}`
          } else {
            tableauCL += ` & ${latex ? cellule : '\\text{' + cellule + '}'}`
          }
        }
      }
      if (tabLineFooters.length > 0) {
        const lineFooter = tabLineFooters[k]
        const color = style[`L${k + 1}C${nbTabCols}`]
        ? style[`L${k + 1}C${nbTabCols}`]
          : style.LC0
            ? style.LC0
            : 'lightgray'
        const colorHex = parseHexColor(color)
        if (typeof lineFooter === 'number') {
          tableauCL += ` & \\cellcolor${colorHex ? '[HTML]' : ''}{${colorHex ? colorHex.withoutHash : color}} ${latex ? texNombre(lineFooter, 6) : '\\text{' + stringNombre(lineFooter, 6) + '}'}`
        } else {
          tableauCL += ` & \\cellcolor${colorHex ? '[HTML]' : ''}{${colorHex ? colorHex.withoutHash : color}} ${latex ? lineFooter : '\\text{' + lineFooter + '}'}`
        }
      }
      tableauCL += '\\\\\n'
      tableauCL += '\\hline\n '
      // tableauCL += k === nbLignes - 1 ? '' : '\\rule[-2ex]{0pt} {6ex}\\ '
    }

    if (tabColFooters.length > 0) {
      if (typeof tabColFooters[0] === 'number') {
        tableauCL += `\\cellcolor${color0Hex ? '[HTML]' : ''}{${color0Hex ? color0Hex.withoutHash : color0}} ${latex ? texNombre(tabColFooters[0], 2) : '\\text{' + stringNombre(tabColFooters[0], 2) + '}'}`
      } else {
        tableauCL += `\\cellcolor${color0Hex ? '[HTML]' : ''}{${color0Hex ? color0Hex.withoutHash : color0}} ${latex ? tabColFooters[0] : '\\text{' + tabColFooters[0] + '}'}`
      }
      for (let k = 1; k < nbTabCols; k++) {
        const lineFooter = tabColFooters[k]
        const color = style[`L0C${k}`] != null ? style[`L0C${k}`] : 'lightgray'
        const colorHex = parseHexColor(color)
        if (typeof lineFooter === 'number') {
          tableauCL += ` & \\cellcolor${colorHex ? '[HTML]' : ''}{${colorHex ? colorHex.withoutHash : color}} ${latex ? texNombre(lineFooter, 6) : '\\text{' + stringNombre(lineFooter, 6) + '}'}`
        } else {
          tableauCL += ` & \\cellcolor${colorHex ? '[HTML]' : ''}{${colorHex ? colorHex.withoutHash : color}} ${latex ? lineFooter : '\\text{' + lineFooter + '}'}`
        }
      }
      tableauCL += '\\\\\n'
      tableauCL += '\\hline\n'
    }
    tableauCL += '\\end{array}\n'

    tableauCL += '\\renewcommand{\\arraystretch}{1}$\n'
    return tableauCL
  }
}

type Cellule = {
  content: string
  latex?: boolean
  color?: string
  background?: string
}
/**
 * produit un tableau 2x2 pour calcul de 4e proportionnelle par exemple
 */
export function tableau2x2(
  {
    L0C0,
    L0C1,
    L1C0,
    L1C1,
  }: { L0C0: Cellule; L0C1: Cellule; L1C0: Cellule; L1C1: Cellule },
  numeroExercice: number,
  question: number,
  isInteractif: boolean,
  classes: string,
) {
  let tableau
  if (context.isHtml) {
    const ajouteClass = function (element: HTMLElement, classes: string) {
      for (const classe of classes.split(' ')) {
        if (classe !== '') element.classList.add(classe)
      }
    }
    const table = document.createElement('table')
    table.className = 'tableau2x2'
    table.id = `tableau2x2Ex${numeroExercice}Q${question}`
    const firstLine = document.createElement('tr')
    const secondLine = document.createElement('tr')
    table.appendChild(firstLine)
    table.appendChild(secondLine)
    const l0c0 = document.createElement('td')
    const l0c1 = document.createElement('td')
    const l1c0 = document.createElement('td')
    const l1c1 = document.createElement('td')
    firstLine.appendChild(l0c0)
    firstLine.appendChild(l0c1)
    secondLine.appendChild(l1c0)
    secondLine.appendChild(l1c1)
    if (isInteractif) {
      if (L0C0.content === '') {
        const mf00 = new MathfieldElement()
        mf00.id = `champTexteEx${numeroExercice}Q${question}L0C0`
        mf00.setAttribute('virtual-keyboard-mode', 'manual')
        l0c0.appendChild(mf00)
        ajouteClass(mf00, classes)
        l0c0.appendChild(mf00)
      } else {
        const span00 = document.createElement('span')
        span00.textContent = L0C0.content
        if (span00) l0c0.appendChild(span00)
      }
      if (L0C1.content === '') {
        const mf01 = new MathfieldElement()
        mf01.id = `champTexteEx${numeroExercice}Q${question}L0C1`
        mf01.setAttribute('virtual-keyboard-mode', 'manual')
        l0c1.appendChild(mf01)
        ajouteClass(mf01, classes)
      } else {
        const span01 = document.createElement('span')
        span01.textContent = L0C1.content
        if (span01) l0c1.appendChild(span01)
      }
      if (L1C0.content === '') {
        const mf10 = new MathfieldElement()
        mf10.id = `champTexteEx${numeroExercice}Q${question}L1C0`
        mf10.setAttribute('virtual-keyboard-mode', 'manual')
        l1c0.appendChild(mf10)
        ajouteClass(mf10, classes)
      } else {
        const span10 = document.createElement('span')
        span10.textContent = L1C0.content
        if (span10) l1c0.appendChild(span10)
      }
      if (L1C1.content === '') {
        const mf11 = new MathfieldElement()
        mf11.id = `champTexteEx${numeroExercice}Q${question}L1C1`
        mf11.setAttribute('virtual-keyboard-mode', 'manual')
        l1c1.appendChild(mf11)
        ajouteClass(mf11, classes)
      } else {
        const span11 = document.createElement('span')
        span11.textContent = L1C1.content
        if (span11) l1c1.appendChild(span11)
      }
    } else {
      l0c0.textContent = L0C0.content ?? ''
      l0c1.textContent = L0C1.content ?? ''
      l1c0.textContent = L1C0.content ?? ''
      l1c1.textContent = L1C1.content ?? ''
    }
    if (L0C0.background != null) l0c0.style.backgroundColor = L0C0.background
    if (L0C1.background != null) l0c1.style.backgroundColor = L0C1.background
    if (L1C0.background != null) l1c0.style.backgroundColor = L1C0.background
    if (L1C1.background != null) l1c1.style.backgroundColor = L1C1.background
    if (L0C0.color != null) l0c0.style.color = L0C0.color
    if (L0C1.color != null) l0c1.style.color = L0C1.color
    if (L1C0.color != null) l1c0.style.color = L1C0.color
    if (L1C1.color != null) l1c1.style.color = L1C1.color

    tableau = table.outerHTML
  } else {
    tableau =
      '$\\renewcommand{\\arraystretch}{1.5}\n\\begin{array}{|c|c|}\n\\hline'
    if (L0C0 != null && L0C0.content !== '') {
      tableau += `${L0C0.background !== null && L0C0.background !== undefined ? '\\cellcolor{' + L0C0.background + '}' : ''} ${L0C0.content} `
    }
    tableau += ' & '
    if (L0C1 != null && L0C1.content !== '') {
      tableau += `${L0C1.background != null && L0C1.background !== undefined ? '\\cellcolor{' + L0C1.background + '}' : ''} ${L0C1.content} `
    }
    tableau += '\\\\\n \\hline\n '
    if (L1C0 != null && L1C0.content !== '') {
      tableau += `${L1C0.background !== null && L1C0.background !== undefined ? '\\cellcolor{' + L1C0.background + '}' : ''} ${L1C0.content} `
    }
    tableau += ' & '
    if (L1C1 != null && L1C1.content !== '') {
      tableau += `${L1C1.background !== null && L1C1.background !== undefined ? '\\cellcolor{' + L1C1.background + '}' : ''} ${L1C1.content} `
    }
    tableau += '\\\\\n \\hline\n '
    tableau += '\\end{array}\n\\renewcommand{\\arraystretch}{1}$'
  }
  return tableau
}
