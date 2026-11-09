import { Arc, arc } from '../../lib/2d/Arc'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { rotation } from '../../lib/2d/transformations'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
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

export const uuid = 'fb238'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
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
        // '6 : Découpage non apparent',
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
    this.sup = '0'
    this.sup2 = '0'
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = [
      'Polygones',
      'Disques',
      'RectangleEnligne',
      'RectangleAvecTriangles',
      'RectangleAvecCarreaux',
      'DecoupagePasApparent',
      // 'FiguresComplexes' cf APMEP,
      // 'DecoupagePasApparent',
    ]
    /* const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) */
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
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
      let numerateur: number = 1
      let denominateur: number = 1
      const figure2D: NestedObjetMathalea2dArray = []
      let codeSvgOuTikz: string = ''
      let secteursAColorier: number[] = []
      let paramsEnonce = {}

      const zonesContigues = typesDeColoriage[i] === 1
      // listeTypeQuestions[i] = 'RectangleAvecCarreaux' // for tests

      switch (listeTypeQuestions[i]) {
        case 'Polygones': {
          denominateur = choice([3, 4, 5, 6, 8])
          numerateur = tireNumerateur(denominateur, zonesContigues)
          secteursAColorier = zonesAColorier(
            numerateur,
            denominateur,
            zonesContigues,
            true,
          )
          const O = pointAbstrait(0, 0)
          const A = pointAdistance(
            O,
            tailleFigure / 1.5,
            270 - 180 / denominateur,
          ) // pour que le premier secteur donne un côté horizontal
          for (let i = 0; i < denominateur; i++) {
            const triangle = polygone(
              O,
              rotation(A, O, (360 / denominateur) * i),
              rotation(A, O, (360 / denominateur) * (i + 1)),
            )
            if (secteursAColorier.includes(i)) {
              triangle.couleurDeRemplissage = colorToLatexOrHTML('gray') // texcolors(i + 2) cf import { texcolors } from '../format/style'
              triangle.opaciteDeRemplissage = 0.3
            }
            figure2D.push(triangle)
          }

          break
        }
        case 'Disques': {
          denominateur = choice([2, 3, 4, 5, 6, 8])
          numerateur = tireNumerateur(denominateur, zonesContigues)
          const angle = 360 / denominateur
          secteursAColorier = zonesAColorier(
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
            a = arc(rotation(A, O, angle * i), O, angle, true)
            if (secteursAColorier.includes(i)) {
              a.couleurDeRemplissage = colorToLatexOrHTML('gray') // texcolors(i + 2) cf import { texcolors } from '../format/style'
              a.opaciteDeRemplissage = 0.3
            }
            figure2D.push(a)
          }
          break
        }
        case 'RectangleEnligne': {
          const { longueur, hauteur, vertical } = dimRectangle(tailleFigure)
          denominateur = choice([2, 3, 4, 5, 6])
          const pLongueur = longueur / denominateur
          const pHauteur = hauteur / denominateur
          numerateur = tireNumerateur(denominateur, zonesContigues)
          secteursAColorier = zonesAColorier(
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
          figure2D.push(rectangle)
          for (let i = 0; i < denominateur; i++) {
            if (vertical) {
              A = pointAbstrait(0, pHauteur * i)
              B = pointAbstrait(longueur, pHauteur * i)
              C = pointAbstrait(longueur, pHauteur * (i + 1))
              D = pointAbstrait(0, pHauteur * (i + 1))
            } else {
              A = pointAbstrait(pLongueur * i, 0)
              B = pointAbstrait(pLongueur * (i + 1), 0)
              C = pointAbstrait(pLongueur * (i + 1), hauteur)
              D = pointAbstrait(pLongueur * i, hauteur)
            }
            rectangle = polygone([A, B, C, D])
            if (secteursAColorier.includes(i)) {
              rectangle.couleurDeRemplissage = colorToLatexOrHTML('gray') // texcolors(i + 2) cf import { texcolors } from '../format/style'
            }
            figure2D.push(rectangle)
          }
          break
        }
        case 'RectangleAvecTriangles': {
          const { longueur, hauteur, vertical } = dimRectangle(tailleFigure)
          denominateur = choice([2, 4, 6, 8])
          const pLongueur = (2 * longueur) / denominateur
          const pHauteur = (2 * hauteur) / denominateur
          numerateur = tireNumerateur(denominateur, zonesContigues)
          secteursAColorier = zonesAColorier(
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
          figure2D.push(rectangle)
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
            const triangle = polygone(A, B, C)
            if (secteursAColorier.includes(i)) {
              triangle.couleurDeRemplissage = colorToLatexOrHTML('gray') // texcolors(i + 2) cf import { texcolors } from '../format/style'
              triangle.opaciteDeRemplissage = 0.3
            }
            figure2D.push(triangle)
          }
          break
        }
        case 'RectangleAvecCarreaux': {
          denominateur = choice([4, 6, 8, 9, 10, 12, 15])
          numerateur = tireNumerateur(denominateur, zonesContigues)
          secteursAColorier = zonesAColorier(
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
          const longueur = (tailleFigure * nbColonnes) / 2
          const hauteur = (tailleFigure * nbLignes) / 2
          let A, B, C, D: PointAbstrait
          A = pointAbstrait(0, 0)
          B = pointAbstrait(longueur, 0)
          C = pointAbstrait(longueur, hauteur)
          D = pointAbstrait(0, hauteur)
          const rectangle = polygone([A, B, C, D])
          figure2D.push(rectangle)
          for (let i = 0; i < nbLignes; i++) {
            for (let j = 0; j < nbColonnes; j++) {
              A = pointAbstrait(
                (longueur * j) / nbColonnes,
                (hauteur * i) / nbLignes,
              )
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
              const carreau = polygone([A, B, C, D])
              if (secteursAColorier.includes(i * nbColonnes + j)) {
                carreau.couleurDeRemplissage = colorToLatexOrHTML('gray') // texcolors(i + 2) cf import { texcolors } from '../format/style'
                carreau.opaciteDeRemplissage = 0.3
              }
              figure2D.push(carreau)
            }
          }
          break
        }
        case 'DecoupagePasApparent': {
          denominateur = choice([2, 3, 4, 5, 6, 8])
          numerateur = randint(1, denominateur - 1)
          break
        }
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
      texteCorr += `La figure est divisée en $${denominateur}$ secteurs de même aire.<br>`
      const unOuPlus = numerateur > 1 ? 'sont colorés' : 'est coloré'
      texteCorr += `Parmi ces secteurs, $${numerateur}$ ${unOuPlus}.<br>`
      const laFraction = fraction(numerateur, denominateur)
      texteCorr += `La fraction de la figure qui est colorée est donc $${miseEnEvidence(laFraction.texFraction)}$`
      if (laFraction.texFraction !== laFraction.texFractionSimplifiee) {
        texteCorr += `, on peut aussi ecrire $${laFraction.texFractionSimplifiee}$`
      }
      texteCorr += `.<br>`
      if (
        this.questionJamaisPosee(
          i,
          numerateur,
          denominateur,
          listeTypeQuestions[i],
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
function zonesAColorier(
  numerateur: number,
  denominateur: number,
  contigue: boolean,
  rotation: boolean,
): number[] {
  const lesSecteurs: number[] = []

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
      longueur = tailleFigure * 3
      hauteur = tailleFigure / 3
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
