import { arc } from '../../lib/2d/Arc'
import { cercle } from '../../lib/2d/cercle'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { noirMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { zonesAColorier } from './6N3autoA'

export const titre =
  'Reconnaître une fraction supérieure à $1$ sur des représentations variées'

export const interactifReady = true
export const interactifType = 'mathLive'

export const dateDePublication = '25/09/2026'

export const uuid = '794d3'

export const refs = {
  'fr-fr': ['6N3autoA-1', '6AutoF1-7'],
  'fr-ch': ['9R1NO4A-8', '9R2NO4A-8', '9R3NO4A-8', 'PRQNO10A-9'],
}

/**
 * Reconnaître une fraction supérieure à 1 sur des représentations variées,
 * l'unité étant donnée dans l'énoncé.
 * Adaptation de 6N3autoA (Olivier Mimeau)
 * @author Rémi Angot
 */

type TypeFigure =
  | 'Polygones'
  | 'Disques'
  | 'RectangleEnligne'
  | 'RectangleAvecTriangles'
  | 'RectangleAvecCarreaux'
  | 'Segments'

type Forme = {
  type: TypeFigure
  denominateur: number
  taille: number
  longueur: number
  hauteur: number
  vertical: boolean
  nbLignes: number
}

type Figures = {
  unite: NestedObjetMathalea2dArray
  coloriage: NestedObjetMathalea2dArray
}

const gris = colorToLatexOrHTML('gray')

export default class ReconnaitreDesFractionsSuperieuresA1 extends Exercice {
  constructor() {
    super()
    this.consigne =
      "Donner la fraction de l'unité représentée par la partie colorée."
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de découpage',
      [
        'Nombres séparés par des tirets  :',
        '1 : Polygones',
        '2 : Disques',
        '3 : Rectangles en ligne',
        '4 : Rectangles coupés en deux',
        '5 : Grilles',
        '6 : Segments',
        '0 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de coloriage',
      [
        'Nombres séparés par des tirets  :',
        '1 : Secteurs consécutifs',
        '2 : Secteurs éventuellement non consécutifs',
        '0 : Mélange',
      ].join('\n'),
    ]
    this.sup = '1-2-3-4-5'
    this.sup2 = '1'
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles: TypeFigure[] = [
      'Polygones',
      'Disques',
      'RectangleEnligne',
      'RectangleAvecTriangles',
      'RectangleAvecCarreaux',
      'Segments',
    ]

    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 0,
      defaut: 0,
      listeOfCase: typeQuestionsDisponibles,
      nbQuestions: this.nbQuestions,
    }) as TypeFigure[]
    const typesDeColoriage = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })
    const tailleFigure = 3

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = listeTypeQuestions[i]
      const denominateur = choisitDenominateur(type)
      const forme = choisitForme(type, denominateur, tailleFigure)
      // Nombre d'unités dessinées (la dernière n'est que partiellement colorée)
      const nbUnites = randint(2, denominateur <= 6 ? 3 : 2)
      const zonesContigues = typesDeColoriage[i] === 1 || denominateur <= 3
      const reste = zonesContigues
        ? randint(1, denominateur - 1)
        : randint(2, denominateur - 2)
      const numerateur = (nbUnites - 1) * denominateur + reste
      const secteursDerniereUnite = zonesAColorier(
        reste,
        denominateur,
        zonesContigues,
        type === 'Polygones' || type === 'Disques',
      )

      const figures = dessineFigures(forme, nbUnites, secteursDerniereUnite)
      const paramsUnite = Object.assign(
        { pixelsParCm: 20, scale: context.isHtml ? 1 : 0.5, mainlevee: false },
        fixeBordures(figures.unite),
      )
      const paramsColoriage = Object.assign(
        { pixelsParCm: 20, scale: context.isHtml ? 1 : 0.5, mainlevee: false },
        fixeBordures(figures.coloriage),
      )

      const nomUnite = type === 'Segments' ? 'le segment' : 'la figure'
      let texte = `L'unité est représentée par ${nomUnite} ci-dessous.<br>`
      texte += mathalea2d(paramsUnite, figures.unite) + '<br>'
      texte += 'Partie colorée :<br>'
      texte += mathalea2d(paramsColoriage, figures.coloriage)
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
      )
      const laFraction = new FractionEtendue(numerateur, denominateur)
      handleAnswers(this, i, { reponse: { value: laFraction.texFraction } })

      const estSegment = type === 'Segments'
      const nom = estSegment ? 'segment' : 'part'
      const e = estSegment ? '' : 'e'
      const k = nbUnites - 1
      let texteCorr = `L'unité est partagée en $${denominateur}$ ${nom}s de même ${estSegment ? 'longueur' : 'aire'}, donc chacun${e} représente $${new FractionEtendue(1, denominateur).texFraction}$ de l'unité.<br>`
      texteCorr +=
        k === 1
          ? `Une unité entière est colorée, soit $${denominateur}$ ${nom}s, `
          : `$${k}$ unités entières sont colorées, soit $${k}\\times ${denominateur}=${k * denominateur}$ ${nom}s, `
      texteCorr += `ainsi que $${reste}$ ${nom}${reste > 1 ? 's' : ''} de l'unité suivante.<br>`
      texteCorr += `En tout, $${k * denominateur}+${reste}=${numerateur}$ ${nom}s sont coloré${e}s.<br>`
      texteCorr += `La partie colorée représente donc $${miseEnEvidence(laFraction.texFraction)}$ de l'unité.`

      if (this.questionJamaisPosee(i, numerateur, denominateur, type)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function choisitDenominateur(type: TypeFigure): number {
  switch (type) {
    case 'Polygones':
      return choice([3, 4, 5, 6, 8])
    case 'Disques':
      return choice([2, 3, 4, 5, 6, 8])
    case 'RectangleEnligne':
      return choice([2, 3, 4, 5, 6])
    case 'RectangleAvecTriangles':
      return choice([2, 4, 6, 8])
    case 'RectangleAvecCarreaux':
      return choice([4, 6, 8, 9, 10, 12])
    case 'Segments':
      return choice([2, 3, 4, 5, 6, 7, 8])
  }
}

/**
 * Les paramètres de la forme sont tirés une seule fois par question pour que
 * toutes les unités dessinées soient identiques.
 */
function choisitForme(
  type: TypeFigure,
  denominateur: number,
  taille: number,
): Forme {
  let longueur = taille * 1.5
  let hauteur = taille
  let vertical = false
  let nbLignes = 1
  if (type === 'RectangleEnligne' || type === 'RectangleAvecTriangles') {
    const orientation = choice(['horizontal', 'vertical'])
    if (orientation === 'horizontal') {
      longueur = taille * 2
      hauteur = taille / 2
    } else {
      longueur = taille
      hauteur = taille * 1.2
      vertical = true
    }
  } else if (type === 'RectangleAvecCarreaux') {
    const nbDiv: number[] = []
    for (let k = 2; k <= 4; k++) {
      if (denominateur % k === 0 && denominateur / k <= 4) nbDiv.push(k)
    }
    nbLignes = choice(nbDiv)
    const nbColonnes = denominateur / nbLignes
    longueur = (taille * nbColonnes) / 3
    hauteur = (taille * nbLignes) / 3
  } else if (type === 'Segments') {
    longueur = taille * 1.5
  }
  return { type, denominateur, taille, longueur, hauteur, vertical, nbLignes }
}

function secteurColorie(
  objet: ReturnType<typeof polygone> | ReturnType<typeof arc>,
): ReturnType<typeof polygone> | ReturnType<typeof arc> {
  objet.couleurDeRemplissage = gris
  objet.opaciteDeRemplissage = 0.3
  objet.epaisseur = 0
  return objet
}

function dessineFigures(
  forme: Forme,
  nbUnites: number,
  secteursDerniereUnite: number[],
): Figures {
  const d = forme.denominateur
  const tousLesSecteurs = Array.from({ length: d }, (_, k) => k)
  if (forme.type === 'Segments') {
    return dessineSegments(forme, nbUnites, secteursDerniereUnite)
  }
  const ecart = forme.taille / 2
  const largeur =
    forme.type === 'Polygones' || forme.type === 'Disques'
      ? (2 * forme.taille) / 1.5
      : forme.longueur
  const unite = dessineUnite(forme, 0, true, [])
  const coloriage: NestedObjetMathalea2dArray = []
  for (let j = 0; j < nbUnites; j++) {
    const secteurs = j < nbUnites - 1 ? tousLesSecteurs : secteursDerniereUnite
    coloriage.push(
      ...dessineUnite(forme, j * (largeur + ecart), false, secteurs),
    )
  }
  return { unite, coloriage }
}

/**
 * Dessine une unité dont le coin inférieur gauche (ou le bord gauche pour les
 * figures centrées) est en abscisse ox.
 * Si sansDecoupage est vrai, seul le contour est tracé.
 */
function dessineUnite(
  forme: Forme,
  ox: number,
  sansDecoupage: boolean,
  secteurs: number[],
): NestedObjetMathalea2dArray {
  const d = forme.denominateur
  const objets: NestedObjetMathalea2dArray = []
  switch (forme.type) {
    case 'Polygones': {
      const rayon = forme.taille / 1.5
      const O = pointAbstrait(ox + rayon, 0)
      const sommets = Array.from({ length: d }, (_, k) => {
        const angle = ((270 - 180 / d + (360 / d) * k) * Math.PI) / 180
        return pointAbstrait(
          O.x + rayon * Math.cos(angle),
          O.y + rayon * Math.sin(angle),
        )
      })
      for (let k = 0; k < d; k++) {
        if (secteurs.includes(k)) {
          objets.push(
            secteurColorie(polygone(O, sommets[k], sommets[(k + 1) % d])),
          )
        }
      }
      objets.push(polygone(sommets))
      if (!sansDecoupage) {
        for (const sommet of sommets) objets.push(segment(O, sommet))
      }
      break
    }
    case 'Disques': {
      const rayon = forme.taille / 1.5
      const O = pointAbstrait(ox + rayon, 0)
      const angle = 360 / d
      for (let k = 0; k < d; k++) {
        const a = (angle * k * Math.PI) / 180
        const B = pointAbstrait(O.x + rayon * Math.cos(a), rayon * Math.sin(a))
        if (secteurs.includes(k)) {
          objets.push(secteurColorie(arc(B, O, angle, true)))
        }
        if (!sansDecoupage) objets.push(segment(O, B))
      }
      objets.push(cercle(O, rayon))
      break
    }
    case 'RectangleEnligne': {
      const { longueur, hauteur, vertical } = forme
      for (let k = 0; k < d; k++) {
        const [A, B, C, D] = vertical
          ? [
              pointAbstrait(ox, (hauteur * k) / d),
              pointAbstrait(ox + longueur, (hauteur * k) / d),
              pointAbstrait(ox + longueur, (hauteur * (k + 1)) / d),
              pointAbstrait(ox, (hauteur * (k + 1)) / d),
            ]
          : [
              pointAbstrait(ox + (longueur * k) / d, 0),
              pointAbstrait(ox + (longueur * (k + 1)) / d, 0),
              pointAbstrait(ox + (longueur * (k + 1)) / d, hauteur),
              pointAbstrait(ox + (longueur * k) / d, hauteur),
            ]
        if (secteurs.includes(k))
          objets.push(secteurColorie(polygone([A, B, C, D])))
        if (!sansDecoupage && k > 0) objets.push(segment(A, vertical ? B : D))
      }
      objets.push(rectangleContour(ox, longueur, hauteur))
      break
    }
    case 'RectangleAvecTriangles': {
      const { longueur, hauteur, vertical } = forme
      const nbBandes = d / 2
      for (let k = 0; k < d; k++) {
        const b = Math.floor(k / 2)
        let A, B, C
        if (vertical) {
          const y0 = (hauteur * b) / nbBandes
          const y1 = (hauteur * (b + 1)) / nbBandes
          if (k % 2 === 0) {
            A = pointAbstrait(ox, y0)
            B = pointAbstrait(ox + longueur, y0)
            C = pointAbstrait(ox + longueur, y1)
          } else {
            A = pointAbstrait(ox, y0)
            B = pointAbstrait(ox, y1)
            C = pointAbstrait(ox + longueur, y1)
          }
        } else {
          const x0 = ox + (longueur * b) / nbBandes
          const x1 = ox + (longueur * (b + 1)) / nbBandes
          if (k % 2 === 0) {
            A = pointAbstrait(x0, 0)
            B = pointAbstrait(x0, hauteur)
            C = pointAbstrait(x1, hauteur)
          } else {
            A = pointAbstrait(x0, 0)
            B = pointAbstrait(x1, 0)
            C = pointAbstrait(x1, hauteur)
          }
        }
        if (secteurs.includes(k)) objets.push(secteurColorie(polygone(A, B, C)))
        if (!sansDecoupage) {
          objets.push(segment(A, C))
          objets.push(segment(B, C))
        }
      }
      objets.push(rectangleContour(ox, longueur, hauteur))
      break
    }
    case 'RectangleAvecCarreaux': {
      const { longueur, hauteur, nbLignes } = forme
      const nbColonnes = d / nbLignes
      const l = longueur / nbColonnes
      const h = hauteur / nbLignes
      for (let ligne = 0; ligne < nbLignes; ligne++) {
        for (let colonne = 0; colonne < nbColonnes; colonne++) {
          if (secteurs.includes(ligne * nbColonnes + colonne)) {
            const x = ox + colonne * l
            const y = ligne * h
            objets.push(
              secteurColorie(
                polygone([
                  pointAbstrait(x, y),
                  pointAbstrait(x + l, y),
                  pointAbstrait(x + l, y + h),
                  pointAbstrait(x, y + h),
                ]),
              ),
            )
          }
        }
      }
      if (!sansDecoupage) {
        for (let colonne = 1; colonne < nbColonnes; colonne++) {
          objets.push(
            segment(
              pointAbstrait(ox + colonne * l, 0),
              pointAbstrait(ox + colonne * l, hauteur),
            ),
          )
        }
        for (let ligne = 1; ligne < nbLignes; ligne++) {
          objets.push(
            segment(
              pointAbstrait(ox, ligne * h),
              pointAbstrait(ox + longueur, ligne * h),
            ),
          )
        }
      }
      objets.push(rectangleContour(ox, longueur, hauteur))
      break
    }
  }
  return objets
}

function rectangleContour(ox: number, longueur: number, hauteur: number) {
  return polygone([
    pointAbstrait(ox, 0),
    pointAbstrait(ox + longueur, 0),
    pointAbstrait(ox + longueur, hauteur),
    pointAbstrait(ox, hauteur),
  ])
}

/**
 * Les unités sont mises bout à bout sur une même ligne ; des graduations plus
 * grandes marquent les extrémités de chaque unité.
 */
function dessineSegments(
  forme: Forme,
  nbUnites: number,
  secteursDerniereUnite: number[],
): Figures {
  const d = forme.denominateur
  const L = forme.longueur * 2
  const pas = L / d
  const unite: NestedObjetMathalea2dArray = [
    segment(pointAbstrait(0, 0), pointAbstrait(L, 0), noirMathalea),
    segment(pointAbstrait(0, -0.4), pointAbstrait(0, 0.4), noirMathalea),
    segment(pointAbstrait(L, -0.4), pointAbstrait(L, 0.4), noirMathalea),
  ]
  const coloriage: NestedObjetMathalea2dArray = []
  const partsColoriees: number[] = []
  for (let j = 0; j < nbUnites - 1; j++) {
    for (let k = 0; k < d; k++) partsColoriees.push(j * d + k)
  }
  for (const k of secteursDerniereUnite)
    partsColoriees.push((nbUnites - 1) * d + k)
  for (const k of partsColoriees) {
    const bande = polygone([
      pointAbstrait(pas * k, 0.2),
      pointAbstrait(pas * (k + 1), 0.2),
      pointAbstrait(pas * (k + 1), -0.2),
      pointAbstrait(pas * k, -0.2),
    ])
    bande.couleurDeRemplissage = gris
    bande.opaciteDeRemplissage = 0.7
    bande.color = ['gray', '{black}']
    coloriage.push(bande)
  }
  coloriage.push(
    segment(pointAbstrait(0, 0), pointAbstrait(nbUnites * L, 0), noirMathalea),
  )
  for (let k = 0; k <= nbUnites * d; k++) {
    const h = k % d === 0 ? 0.4 : 0.25
    coloriage.push(
      segment(
        pointAbstrait(pas * k, -h),
        pointAbstrait(pas * k, h),
        noirMathalea,
      ),
    )
  }
  return { unite, coloriage }
}
