import { Arc, arc } from '../../lib/2d/Arc'
import { cercle } from '../../lib/2d/cercle'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { rotation } from '../../lib/2d/transformations'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { noirMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre = 'Reconnaître une fraction sur des représentations variées'

export const interactifReady = true

export const dateDePublication = '14/03/2026'
export const dateDeModifImportante = '20/05/2026'

export const uuid = '50d4f'

export const refs = {
  'fr-fr': ['6N3autoA', '6AutoF1'],
  'fr-ch': ['9R1NO4A-7', '9R2NO4A-7', '9R3NO4A-7', 'PRQNO10A-8'],
}
/**
 * reconnaître une fraction sur des représentations variées
 * @author Olivier Mimeau
 */

export default class reconnaitreDesFractions extends Exercice {
  constructor() {
    super()
    this.consigne = `Quelle fraction de la figure est colorée${sp()}?`
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de découpage',
      [
        'Nombres séparés par des tirets :',
        '1 : Polygones',
        '2 : Disques',
        '3 : Rectangles en ligne',
        '4 : Rectangles coupés en deux',
        '5 : Grilles',
        '6 : Segments',
        '7 : Découpage non apparent',
        '0 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de coloriage',
      [
        'Nombres séparés par des tirets :',
        '1 : Secteurs consécutifs',
        '2 : Secteurs éventuellement non consécutifs',
        '0 : Mélange',
      ].join('\n'),
    ]
    this.sup = '1-2-3-4-5'
    this.sup2 = '0'
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = [
      'Polygones',
      'Disques',
      'RectangleEnligne',
      'RectangleAvecTriangles',
      'RectangleAvecCarreaux',
      'Segments',
      'DecoupagePasApparent',
      // 'FiguresComplexes' cf APMEP,
    ]

    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 0,
      defaut: 0,
      listeOfCase: typeQuestionsDisponibles,
      nbQuestions: this.nbQuestions,
    })
    const typesDeColoriage = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
    })
    const tailleFigure = 3

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let typeDeNonCoupe = ''
      let numerateur: number = 1
      let denominateur: number = 1
      const figure2D: NestedObjetMathalea2dArray = []
      const figure2DCorrection: NestedObjetMathalea2dArray = []
      let codeSvgOuTikz: string = ''
      let paramsEnonce = {}

      const zonesContigues = typesDeColoriage[i] === 1
      // listeTypeQuestions[i] = 'RectangleAvecCarreaux' // for tests

      switch (listeTypeQuestions[i]) {
        case 'Polygones': {
          denominateur = choice([3, 4, 5, 6, 8])
          numerateur = tireNumerateur(denominateur, zonesContigues)
          const fig = dessinePolygones(
            numerateur,
            denominateur,
            tailleFigure,
            zonesContigues,
          )
          figure2D.push(...fig.coloriage)
          figure2D.push(...fig.decoupage)
          break
        }
        case 'Disques': {
          denominateur = choice([2, 3, 4, 5, 6, 8])
          numerateur = tireNumerateur(denominateur, zonesContigues)
          const fig = dessineDisques(
            numerateur,
            denominateur,
            tailleFigure,
            zonesContigues,
          )
          figure2D.push(...fig.coloriage)
          figure2D.push(...fig.decoupage)
          break
        }
        case 'RectangleEnligne':
          {
            denominateur = choice([2, 3, 4, 5, 6])
            numerateur = tireNumerateur(denominateur, zonesContigues)
            const fig = dessineRectangleEnligne(
              numerateur,
              denominateur,
              tailleFigure,
              zonesContigues,
            )
            figure2D.push(...fig.coloriage)
            figure2D.push(...fig.decoupage)
          }
          break
        case 'RectangleAvecTriangles': {
          denominateur = choice([2, 4, 6, 8])
          numerateur = tireNumerateur(denominateur, zonesContigues)
          const fig = dessineRectangleAvecTriangles(
            numerateur,
            denominateur,
            tailleFigure,
            zonesContigues,
          )
          figure2D.push(...fig.coloriage)
          figure2D.push(...fig.decoupage)
          break
        }
        case 'RectangleAvecCarreaux': {
          denominateur = choice([4, 6, 8, 9, 10, 12, 15])
          numerateur = tireNumerateur(denominateur, zonesContigues)
          const fig = dessineRectangleAvecCarreaux(
            numerateur,
            denominateur,
            tailleFigure,
            zonesContigues,
          )
          figure2D.push(...fig.coloriage)
          figure2D.push(...fig.decoupage)
          break
        }
        case 'Segments': {
          denominateur = choice([2, 3, 4, 5, 7, 6, 8])
          numerateur = tireNumerateur(denominateur, zonesContigues)
          const fig = dessineSegments(
            numerateur,
            denominateur,
            tailleFigure,
            zonesContigues,
          )
          figure2D.push(...fig.coloriage)
          figure2D.push(...fig.decoupage)
          break
        }
        case 'DecoupagePasApparent':
          {
            const typeDecoupageFract = [
              { decoupe: 'Polygones', numerateur: 1, denominateur: 4 },
              { decoupe: 'Polygones', numerateur: 3, denominateur: 4 },
              { decoupe: 'disques', numerateur: 1, denominateur: 2 },
              { decoupe: 'disques', numerateur: 1, denominateur: 3 },
              { decoupe: 'disques', numerateur: 2, denominateur: 3 },
              { decoupe: 'disques', numerateur: 1, denominateur: 4 },
              { decoupe: 'disques', numerateur: 3, denominateur: 4 },
              { decoupe: 'rect en ligne', numerateur: 1, denominateur: 2 },
              { decoupe: 'rect en ligne', numerateur: 1, denominateur: 3 },
              { decoupe: 'rect en ligne', numerateur: 2, denominateur: 3 },
              { decoupe: 'rect en ligne', numerateur: 1, denominateur: 4 },
              { decoupe: 'rect en ligne', numerateur: 3, denominateur: 4 },
              { decoupe: 'RectAvecTri', numerateur: 1, denominateur: 2 },
              { decoupe: 'RectAvecTri', numerateur: 1, denominateur: 4 },
              { decoupe: 'RectAvecTri', numerateur: 3, denominateur: 4 },
              { decoupe: 'RectAvecCarr', numerateur: 1, denominateur: 4 },
              { decoupe: 'RectAvecCarr', numerateur: 3, denominateur: 4 },
              { decoupe: 'RectAvecCarr', numerateur: 1, denominateur: 9 },
              { decoupe: 'RectAvecCarr', numerateur: 2, denominateur: 9 },
              { decoupe: 'RectAvecCarr', numerateur: 4, denominateur: 9 },
            ]
            const typeDecoupageChoisi = choice(typeDecoupageFract)
            // typeDecoupageFract[modulo(i, typeDecoupageFract.length)] // choice(typeDecoupageFract)
            denominateur = typeDecoupageChoisi.denominateur
            numerateur = typeDecoupageChoisi.numerateur
            typeDeNonCoupe = `${typeDecoupageChoisi.decoupe}${numerateur}/${denominateur}` // amodulerselon type de figure et num, den
            let fig: RepresentationFrac = { coloriage: [], decoupage: [] }
            switch (typeDecoupageChoisi.decoupe) {
              case 'Polygones':
                {
                  fig = dessinePolygones(
                    numerateur,
                    denominateur,
                    tailleFigure,
                    true,
                  )
                }
                break
              case 'disques':
                {
                  fig = dessineDisques(
                    numerateur,
                    denominateur,
                    tailleFigure,
                    true,
                  )
                }
                break
              case 'rect en ligne': {
                fig = dessineRectangleEnligne(
                  numerateur,
                  denominateur,
                  tailleFigure,
                  true,
                )
                break
              }
              case 'RectAvecTri':
                {
                  fig = dessineRectangleAvecTriangles(
                    numerateur,
                    denominateur,
                    tailleFigure,
                    true,
                  )
                }
                break
              case 'RectAvecCarr': {
                fig = dessineRectangleAvecCarreaux(
                  numerateur,
                  denominateur,
                  tailleFigure,
                  true,
                )
                break
              }
            }
            figure2D.push(...fig.coloriage)
            figure2DCorrection.push(...figure2D)
            figure2DCorrection.push(...fig.decoupage)
          }
          break
      }

      paramsEnonce = Object.assign(
        {
          pixelsParCm: 20,
          scale: context.isHtml ? 1 : 0.5,
          mainlevee: false,
        },
        fixeBordures(figure2D),
      )
      codeSvgOuTikz = mathalea2d(paramsEnonce, figure2D)
      // texte += `${numerateur}/${denominateur}<br>`
      texte += codeSvgOuTikz

      const reponse = new FractionEtendue(numerateur, denominateur).texFraction
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
      ) //+ '<br>'
      handleAnswers(this, i, { reponse: { value: reponse } })

      if (listeTypeQuestions[i] === 'DecoupagePasApparent') {
        const codeSvgOuTikzCorrection = mathalea2d(
          paramsEnonce,
          figure2DCorrection,
        )
        texteCorr += codeSvgOuTikzCorrection + '<br>'
      }

      let secteursSegments = ['secteurs de même aire', 'secteurs']
      if (listeTypeQuestions[i] === 'Segments') {
        secteursSegments = ['segments de même longueur', 'segments']
      }
      texteCorr += `La figure est divisée en $${denominateur}$ ${secteursSegments[0]}.<br>`
      const unOuPlus = numerateur > 1 ? 'sont colorés' : 'est coloré'
      texteCorr += `Parmi ces ${secteursSegments[1]}, $${numerateur}$ ${unOuPlus}.<br>`
      const laFraction = fraction(numerateur, denominateur)
      texteCorr += `La fraction de la figure qui est colorée est donc $${miseEnEvidence(laFraction.texFraction)}$`
      if (laFraction.texFraction !== laFraction.texFractionSimplifiee) {
        texteCorr += `, on peut aussi écrire $${laFraction.texFractionSimplifiee}$`
      }
      texteCorr += `.<br>`
      if (
        this.questionJamaisPosee(
          i,
          numerateur,
          denominateur,
          listeTypeQuestions[i],
          typeDeNonCoupe,
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function tireNumerateur(denominateur: number, contigue: boolean): number {
  const maxNumerateur = denominateur - (contigue ? 1 : 2)
  return randint(denominateur > 3 && !contigue ? 2 : 1, maxNumerateur)
}

// rotation : faire tourner les secteurs si polygone ou disque
export function zonesAColorier(
  numerateur: number,
  denominateur: number,
  contigue: boolean,
  rotation: boolean,
): number[] {
  const lesSecteurs: number[] = []
  if (numerateur > 0) {
    if (contigue) {
      for (let i = 0; i < numerateur; i++) {
        lesSecteurs.push(i)
      }
    } else {
      /* choixSecteurs = combinaisonListes(
      lesSecteurs, // .slice(0, numerateur),
      numerateur,
    ).slice(0, numerateur) */
      let indiceCoupure = 0
      let indiceAjout = 0
      let nbEmplacementLibre = denominateur - numerateur - (rotation ? 1 : 0)
      let indice = 0
      let nbPush = 0

      while (nbEmplacementLibre > 0) {
        nbEmplacementLibre -= indiceAjout
        indiceCoupure = randint(1, numerateur - indice - 1)
        nbPush = nbPush + indiceAjout
        for (let i = 0; i < indiceCoupure; i++) {
          lesSecteurs.push(nbPush)
          indice++
          nbPush++
        }
        indiceAjout = randint(1, nbEmplacementLibre)
      }

      for (let i = lesSecteurs.length; i < numerateur; i++) {
        lesSecteurs.push(nbPush)
        nbPush++
      }
    }
    const max: number = Math.max(...lesSecteurs)
    const decalage = randint(0, denominateur - 1 - (rotation ? 0 : max))
    for (let i = 0; i < lesSecteurs.length; i++) {
      lesSecteurs[i] = (lesSecteurs[i] + decalage) % denominateur
    }
  }
  return lesSecteurs.slice(0, numerateur)
}

function dimRectangle(tailleFigure: number): {
  longueur: number
  hauteur: number
  vertical: boolean
} {
  const typeRectangleEnligne = choice([
    'RectangleEnligneHorizontal',
    'RectangleEnligneVertical',
    'RectangleEnlignesCompactes',
  ])
  let longueur: number = 0
  let hauteur: number = 0
  // typeRectangleEnligne = 'RectangleEnligneVertical' // for tests
  switch (typeRectangleEnligne) {
    case 'RectangleEnligneHorizontal':
      longueur = tailleFigure * 2.3
      hauteur = tailleFigure / 2.3
      break
    case 'RectangleEnligneVertical':
      longueur = tailleFigure * 1.5
      hauteur = tailleFigure
      break
    case 'RectangleEnlignesCompactes':
      longueur = tailleFigure * 1.5
      hauteur = tailleFigure
      break
  }
  const vertical = typeRectangleEnligne === 'RectangleEnligneVertical'
  return { longueur, hauteur, vertical }
}

type RepresentationFrac = {
  coloriage: NestedObjetMathalea2dArray
  decoupage: NestedObjetMathalea2dArray
}

function dessinePolygones(
  numerateur: number,
  denominateur: number,
  tailleFigure: number,
  zonesContigues: boolean,
): RepresentationFrac {
  const coloriage: NestedObjetMathalea2dArray = []
  const decoupage: NestedObjetMathalea2dArray = []
  const secteursAColorier = zonesAColorier(
    numerateur,
    denominateur,
    zonesContigues,
    true,
  )
  const O = pointAbstrait(0, 0)
  const A = pointAdistance(O, tailleFigure / 1.5, 270 - 180 / denominateur) // pour que le premier secteur donne un côté horizontal
  for (let i = 0; i < denominateur; i++) {
    const B = rotation(A, O, (360 / denominateur) * i)
    const C = rotation(A, O, (360 / denominateur) * (i + 1))

    if (secteursAColorier.includes(i)) {
      const triangle = polygone(O, B, C)
      triangle.couleurDeRemplissage = colorToLatexOrHTML('gray') // texcolors(i + 2) cf import { texcolors } from '../format/style'
      triangle.opaciteDeRemplissage = 0.3
      triangle.epaisseur = 0
      coloriage.push(triangle)
    }

    coloriage.push(segment(B, C))
    decoupage.push(segment(O, B))
  }
  return { coloriage, decoupage }
}

function dessineDisques(
  numerateur: number,
  denominateur: number,
  tailleFigure: number,
  zonesContigues: boolean,
): RepresentationFrac {
  const coloriage: NestedObjetMathalea2dArray = []
  const decoupage: NestedObjetMathalea2dArray = []
  const angle = 360 / denominateur
  const secteursAColorier = zonesAColorier(
    numerateur,
    denominateur,
    zonesContigues,
    true,
  )
  const A = pointAbstrait(tailleFigure / 1.5, 0)
  const O = pointAbstrait(0, 0)
  // const c = cercle(O, tailleFigure / 1.5)
  //          figure2D.push(c)
  let a: Arc
  for (let i = 0; i < denominateur; i++) {
    const B = rotation(A, O, angle * i)
    if (secteursAColorier.includes(i)) {
      a = arc(B, O, angle, true)
      a.couleurDeRemplissage = colorToLatexOrHTML('gray') // texcolors(i + 2) cf import { texcolors } from '../format/style'
      a.opaciteDeRemplissage = 0.3
      a.epaisseur = 0
      coloriage.push(a)
    }
    decoupage.push(segment(O, B))
  }
  coloriage.push(cercle(O, tailleFigure / 1.5))
  return { coloriage, decoupage }
}

function dessineRectangleEnligne(
  numerateur: number,
  denominateur: number,
  tailleFigure: number,
  zonesContigues: boolean,
): RepresentationFrac {
  const coloriage: NestedObjetMathalea2dArray = []
  const decoupage: NestedObjetMathalea2dArray = []
  const { longueur, hauteur, vertical } = dimRectangle(tailleFigure)
  const pLongueur = longueur / denominateur
  const pHauteur = hauteur / denominateur
  const secteursAColorier = zonesAColorier(
    numerateur,
    denominateur,
    zonesContigues,
    false,
  )
  let A, B, C, D: PointAbstrait
  A = pointAbstrait(0, 0)
  B = pointAbstrait(longueur, 0)
  C = pointAbstrait(longueur, hauteur)
  D = pointAbstrait(0, hauteur)
  let rectangle = polygone([A, B, C, D])
  coloriage.push(rectangle)
  for (let i = 0; i < denominateur; i++) {
    if (vertical) {
      A = pointAbstrait(0, pHauteur * i)
      B = pointAbstrait(longueur, pHauteur * i)
      C = pointAbstrait(longueur, pHauteur * (i + 1))
      D = pointAbstrait(0, pHauteur * (i + 1))
      decoupage.push(segment(C, D))
    } else {
      A = pointAbstrait(pLongueur * i, 0)
      B = pointAbstrait(pLongueur * (i + 1), 0)
      C = pointAbstrait(pLongueur * (i + 1), hauteur)
      D = pointAbstrait(pLongueur * i, hauteur)
      decoupage.push(segment(B, C))
    }
    if (secteursAColorier.includes(i)) {
      rectangle = polygone([A, B, C, D])
      rectangle.couleurDeRemplissage = colorToLatexOrHTML('gray') // texcolors(i + 2) cf import { texcolors } from '../format/style'
      rectangle.opaciteDeRemplissage = 0.3
      rectangle.epaisseur = 0
      coloriage.push(rectangle)
    }
  }

  return { coloriage, decoupage }
}

function dessineRectangleAvecTriangles(
  numerateur: number,
  denominateur: number,
  tailleFigure: number,
  zonesContigues: boolean,
): RepresentationFrac {
  const coloriage: NestedObjetMathalea2dArray = []
  const decoupage: NestedObjetMathalea2dArray = []
  const { longueur, hauteur, vertical } = dimRectangle(tailleFigure)
  const pLongueur = (2 * longueur) / denominateur
  const pHauteur = (2 * hauteur) / denominateur
  const secteursAColorier = zonesAColorier(
    numerateur,
    denominateur,
    zonesContigues,
    false,
  )
  let A = pointAbstrait(0, 0)
  let B = pointAbstrait(longueur, 0)
  let C = pointAbstrait(longueur, hauteur)
  const D = pointAbstrait(0, hauteur)
  const rectangle = polygone([A, B, C, D])
  coloriage.push(rectangle)
  for (let i = 0; i < denominateur; i++) {
    if (vertical) {
      if (i % 2 === 0) {
        A = pointAbstrait(0, (pHauteur * i) / 2)
        B = pointAbstrait(longueur, (pHauteur * i) / 2)
        C = pointAbstrait(longueur, pHauteur * (i / 2 + 1))
      } else {
        A = pointAbstrait(0, (pHauteur * (i - 1)) / 2)
        B = pointAbstrait(0, (pHauteur * (i + 1)) / 2)
        C = pointAbstrait(longueur, (pHauteur * (i + 1)) / 2)
      }
    } else {
      if (i % 2 === 0) {
        A = pointAbstrait((pLongueur * i) / 2, 0)
        B = pointAbstrait((pLongueur * i) / 2, hauteur)
        C = pointAbstrait(pLongueur * (i / 2 + 1), hauteur)
      } else {
        A = pointAbstrait((pLongueur * (i - 1)) / 2, 0)
        B = pointAbstrait((pLongueur * (i + 1)) / 2, 0)
        C = pointAbstrait((pLongueur * (i + 1)) / 2, hauteur)
      }
    }
    decoupage.push(segment(A, C))
    decoupage.push(segment(B, C))
    if (secteursAColorier.includes(i)) {
      const triangle = polygone(A, B, C)
      triangle.couleurDeRemplissage = colorToLatexOrHTML('gray') // texcolors(i + 2) cf import { texcolors } from '../format/style'
      triangle.opaciteDeRemplissage = 0.3
      triangle.epaisseur = 0
      coloriage.push(triangle)
    }
  }
  return { coloriage, decoupage }
}

function dessineRectangleAvecCarreaux(
  numerateur: number,
  denominateur: number,
  tailleFigure: number,
  zonesContigues: boolean,
): RepresentationFrac {
  const coloriage: NestedObjetMathalea2dArray = []
  const decoupage: NestedObjetMathalea2dArray = []
  const secteursAColorier = zonesAColorier(
    numerateur,
    denominateur,
    zonesContigues,
    false,
  )
  const nbDiv: number[] = []
  for (let i = 2; i <= 5; i++) {
    if (denominateur % i === 0) {
      nbDiv.push(i)
    }
  }
  const nbLignes = choice(nbDiv, [denominateur])
  const nbColonnes = denominateur / nbLignes
  const longueur = (tailleFigure * Math.max(nbColonnes, 3)) / 2
  const hauteur = (tailleFigure * Math.max(nbLignes, 3)) / 2
  let A, B, C, D: PointAbstrait
  A = pointAbstrait(0, 0)
  B = pointAbstrait(longueur, 0)
  C = pointAbstrait(longueur, hauteur)
  D = pointAbstrait(0, hauteur)
  const rectangle = polygone([A, B, C, D])
  coloriage.push(rectangle)
  for (let i = 0; i < nbLignes; i++) {
    for (let j = 0; j < nbColonnes; j++) {
      A = pointAbstrait((longueur * j) / nbColonnes, (hauteur * i) / nbLignes)
      B = pointAbstrait(
        (longueur * (j + 1)) / nbColonnes,
        (hauteur * i) / nbLignes,
      )
      C = pointAbstrait(
        (longueur * (j + 1)) / nbColonnes,
        (hauteur * (i + 1)) / nbLignes,
      )
      D = pointAbstrait(
        (longueur * j) / nbColonnes,
        (hauteur * (i + 1)) / nbLignes,
      )
      decoupage.push(segment(A, B))
      decoupage.push(segment(B, C))
      if (secteursAColorier.includes(i * nbColonnes + j)) {
        const carreau = polygone([A, B, C, D])
        carreau.couleurDeRemplissage = colorToLatexOrHTML('gray') // texcolors(i + 2) cf import { texcolors } from '../format/style'
        carreau.opaciteDeRemplissage = 0.3
        carreau.epaisseur = 0
        coloriage.push(carreau)
      }
    }
  }
  return { coloriage, decoupage }
}

function dessineSegments(
  numerateur: number,
  denominateur: number,
  tailleFigure: number,
  zonesContigues: boolean,
  // decoupageApparent = true,
): RepresentationFrac {
  const coloriage: NestedObjetMathalea2dArray = []
  const decoupage: NestedObjetMathalea2dArray = []
  const longueur = tailleFigure * 3
  const pLongueur = longueur / denominateur
  const secteursAColorier = zonesAColorier(
    numerateur,
    denominateur,
    zonesContigues,
    false,
  )
  let A, B: PointAbstrait
  A = pointAbstrait(0, 0)
  B = pointAbstrait(longueur, 0)
  let leSegment = segment(A, B, noirMathalea, '||')
  //coloriage.push(leSegment)
  for (let i = 0; i < denominateur; i++) {
    B = pointAbstrait(pLongueur * (i + 1), 0)
    leSegment = segment(A, B, noirMathalea, '||')
    coloriage.push(leSegment)
    A = B
  }
  for (let i = 0; i < numerateur; i++) {
    A = pointAbstrait(pLongueur * secteursAColorier[i], 0.05)
    B = pointAbstrait(pLongueur * (secteursAColorier[i] + 1), 0.05)
    const C = pointAbstrait(pLongueur * secteursAColorier[i], -0.05)
    const D = pointAbstrait(pLongueur * (secteursAColorier[i] + 1), -0.05)
    const carreau = polygone([A, B, C, D])
    carreau.couleurDeRemplissage = colorToLatexOrHTML('gray')
    carreau.color = ['gray', '{black}']
    coloriage.push(carreau)
  }
  return { coloriage, decoupage }
}

function modulo(a: number, n: number): number {
  return ((a % n) + n) % n
}
