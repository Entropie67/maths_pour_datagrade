import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { grille } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { texteParPosition } from '../../lib/2d/textes'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Calculer une aire en carreaux'
export const interactifReady = true

export const dateDePublication = '24/04/2024'
export const dateDeModifImportante = '31/07/2025' // Rajout de différentes unités par Éric Elter

/**
 * @author Jean-claude Lhote
 */
export const uuid = '83be9'

export const refs = {
  'fr-fr': ['6M2autoC-1'],
  'fr-2016': ['6M10-2'],
  'fr-ch': ['9R1GM2A-2', '9R2GM2A-2', '9R3GM2A-2'],
}
export default class AireParComptage extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de surface',
      'Nombres séparés par des tirets :\n1 : Carré\n2 : Rectangle\n3 : Triangle rectangle\n4 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Avec des fractions de carreaux',
      false,
    ]
    this.besoinFormulaire3Numerique = [
      "Choix de l'unité d'aire",
      4,
      '1 : Le carreau entier\n2 : Le demi carreau rectangulaire\n3 : Le demi carreau triangulaire\n4 : Le quart de carreau',
    ]
    this.besoinFormulaire4Texte = [
      'Unités',
      'Nombres séparés par des tirets :\n1 : u.a\n2 : cm²\n3 : m²\n4 : Mélange',
    ]
    this.sup = '4'
    this.sup2 = false
    this.sup3 = 1
    this.sup4 = '2'
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const typeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
    })
    const coeff =
      this.sup3 === 1 ? 1 : this.sup3 === 2 ? 2 : this.sup3 === 3 ? 2 : 4
    const unites = gestionnaireFormulaireTexte({
      saisie: this.sup4,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 1,
    })
    let unite = ''

    for (let i = 0; i < this.nbQuestions; i++) {
      let a: number
      let a2: number
      let b: number
      let b2: number
      let objets: NestedObjetMathalea2dArray = []
      const choix = choice([true, false])
      let value1: string[]
      let value2: string[]
      let aire1: string
      let aire2: string
      switch (unites[i]) {
        case 1:
          unite = 'u.a'
          break
        case 2:
          unite = 'cm²'
          break
        case 3:
          unite = 'm²'
          break
      }
      do {
        if (choix) {
          a = randint(4, 10)
          b = this.sup2 ? randint(3, 9, [4, 6, 8]) / 2 : randint(2, 5, a)
          a2 = this.sup2
            ? (randint(3, 5) * 2 + 1) / 2
            : randint(4, 10, Math.floor(a))
          b2 = randint(2, 5, [Math.floor(b), Math.floor(a2)])
        } else {
          a = this.sup2 ? (randint(3, 5) * 2 + 1) / 2 : randint(4, 10)
          b = randint(2, 5, Math.floor(a))
          a2 = randint(4, 10, Math.floor(a))
          b2 = this.sup2
            ? randint(3, 9) / 2
            : randint(2, 5, [Math.floor(b), Math.floor(a2)])
        }
      } while (a + b > 17 || a2 + b2 > 17 || a + a > 17 || a2 + a2 > 17)

      switch (typeDeQuestion[i]) {
        case 1:
          b = a
          b2 = a2
          objets = this.questionCarre(a, a2)
          value1 =
            coeff === 1
              ? [
                  `${texNombre(a, 1)}\\times${texNombre(a, 1)}`,
                  `${texNombre(a, 1)}^2`,
                ]
              : [
                  `${texNombre(a, 1)}\\times${texNombre(a, 1)}\\times${coeff}`,
                  `${texNombre(a, 1)}^2\\times${coeff}`,
                ]
          value2 =
            coeff === 1
              ? [
                  `${texNombre(a2, 1)}\\times${texNombre(a2, 1)}`,
                  `${texNombre(a2, 1)}^2`,
                ]
              : [
                  `${texNombre(a2, 1)}\\times${texNombre(a2, 1)}\\times${coeff}`,
                  `${texNombre(a2, 1)}^2\\times${coeff}`,
                ]
          aire1 = texNombre(a * a * coeff, 2)
          aire2 = texNombre(a2 * a2 * coeff, 2)
          break
        case 2:
          objets = this.questionRectangle(a, b, a2, b2)
          value1 =
            coeff === 1
              ? [
                  `${texNombre(a, 1)}\\times${texNombre(b, 1)}`,
                  `${texNombre(b, 1)}\\times${texNombre(a, 1)}`,
                ]
              : [
                  `${texNombre(a, 1)}\\times${texNombre(b, 1)}\\times${coeff}`,
                  `${texNombre(b, 1)}\\times${texNombre(a, 1)}\\times${coeff}`,
                ]
          value2 =
            coeff === 1
              ? [
                  `${texNombre(a2, 1)}\\times${texNombre(b2, 1)}`,
                  `${texNombre(b2, 1)}\\times${texNombre(a2, 1)}`,
                ]
              : [
                  `${texNombre(a2, 1)}\\times${texNombre(b2, 1)}\\times${coeff}`,
                  `${texNombre(b2, 1)}\\times${texNombre(a2, 1)}\\times${coeff}`,
                ]
          aire1 = texNombre(a * b * coeff, 2)
          aire2 = texNombre(a2 * b2 * coeff, 2)
          break
        case 3:
        default:
          objets = this.questionTriangle(a, b, a2, b2)
          value1 =
            coeff === 1
              ? [
                  `${texNombre(a, 1)}\\times${texNombre(b, 1)}\\div2`,
                  `${texNombre(b, 1)}\\times${texNombre(a, 1)}\\div2`,
                ]
              : [
                  `${texNombre(a, 1)}\\times${texNombre(b, 1)}\\div2\\times${coeff}`,
                  `${texNombre(b, 1)}\\times${texNombre(a, 1)}\\div2\\times${coeff}`,
                ]
          value2 =
            coeff === 1
              ? [
                  `${texNombre(a2, 1)}\\times${texNombre(b2, 1)}\\div2`,
                  `${texNombre(b2, 1)}\\times${texNombre(a2, 1)}\\div2`,
                ]
              : [
                  `${texNombre(a2, 1)}\\times${texNombre(b2, 1)}\\div2\\times${coeff}`,
                  `${texNombre(b2, 1)}\\times${texNombre(a2, 1)}\\div2\\times${coeff}`,
                ]
          aire1 = texNombre(((a * b) / 2) * coeff, 2)
          aire2 = texNombre(((a2 * b2) / 2) * coeff, 2)
          break
      }
      const xmin = -1
      const ymin = -1
      const xmax = Math.ceil(a + a2 + 5)
      const ymax = Math.ceil(Math.max(a, a2) + 1)
      const texFig1 = texteParPosition('Figure 1', (a + 1) / 2, -0.5)
      const texFig2 = texteParPosition('Figure 2', a + 1 + a2 / 2, -0.5)
      const uniteAire =
        this.sup3 === 1
          ? carre(
              pointAbstrait(xmax - 2, ymax - 2),
              pointAbstrait(xmax - 1, ymax - 2),
            )
          : this.sup3 === 2
            ? polygone(
                pointAbstrait(xmax - 2, ymax - 2),
                pointAbstrait(xmax - 1, ymax - 2),
                pointAbstrait(xmax - 1, ymax - 1.5),
                pointAbstrait(xmax - 2, ymax - 1.5),
              )
            : this.sup3 === 3
              ? polygone(
                  pointAbstrait(xmax - 2, ymax - 2),
                  pointAbstrait(xmax - 1, ymax - 2),
                  pointAbstrait(xmax - 2, ymax - 1),
                )
              : polygone(
                  pointAbstrait(xmax - 2, ymax - 2),
                  pointAbstrait(xmax - 1.5, ymax - 2),
                  pointAbstrait(xmax - 1.5, ymax - 1.5),
                  pointAbstrait(xmax - 2, ymax - 1.5),
                )
      uniteAire.couleurDeRemplissage = colorToLatexOrHTML('gray')
      const texteUniteAire = texteParPosition(
        '1 ' + unite,
        xmax - 1.5,
        ymax - 2.5,
      )

      objets.push(texFig1, texFig2, uniteAire, texteUniteAire)
      if (this.sup2) {
        objets.push(grille(xmin, ymin, xmax, ymax, 'gray', 0.3, 0.5))
      }
      const figure = mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: 0.5 },
          { xmin, ymin, xmax, ymax },
        ),
        [grille(xmin, ymin, xmax, ymax, 'gray', 0.6, 1), ...objets],
      )
      const texte = `${figure}<br><br>
      ${
        this.interactif
          ? `Quelle est l'aire de la figure $1$ ? ${ajouteQuestionMathlive({ exercice: this, question: 2 * i, typeInteractivite: 'mathlive', texteApres: unite, reponseParams: { formatInteractif: 'mathalea-mathfield' }, objetReponse: { reponse: { value: aire1 } } })}<br>
      Quelle est l'aire de la figure $2$ ? ${ajouteQuestionMathlive({ exercice: this, question: 2 * i + 1, typeInteractivite: 'mathlive', texteApres: unite, reponseParams: { formatInteractif: 'mathalea-mathfield' }, objetReponse: { reponse: { value: aire2 } } })}`
          : "Calculer l'aire de la figure $1$ et l'aire de la figure $2$ en écrivant les calculs."
      }`

      const texteCorr = `L'aire de la figure $1$ est donnée par : $${miseEnEvidence(value1[0])}\\text{ soit }${miseEnEvidence(aire1)}$ ${unite}, et l'aire de la figure $2$ est donnée par : $${miseEnEvidence(value2[0])}\\text{ soit }${miseEnEvidence(aire2)}$ ${unite}.`

      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
  }

  questionCarre(a: number, a2: number): NestedObjetMathalea2dArray {
    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(a, 0)
    const quad = carre(A, B)
    const A2 = pointAbstrait(Math.ceil(a) + 1, 0)
    const B2 = pointAbstrait(Math.ceil(a) + a2 + 1, 0)
    const quad2 = carre(A2, B2)
    quad.couleurDeRemplissage = colorToLatexOrHTML('orange')
    quad2.couleurDeRemplissage = colorToLatexOrHTML('orange')
    return [quad, quad2]
  }

  questionRectangle(
    a: number,
    b: number,
    a2: number,
    b2: number,
  ): NestedObjetMathalea2dArray {
    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(a, 0)
    const C = pointAbstrait(a, b)
    const D = pointAbstrait(0, b)
    const rect = polygone(A, B, C, D)
    const A2 = pointAbstrait(Math.ceil(a) + 1, 0)
    const B2 = pointAbstrait(Math.ceil(a) + a2 + 1, 0)
    const C2 = pointAbstrait(Math.ceil(a) + a2 + 1, b2)
    const D2 = pointAbstrait(Math.ceil(a) + 1, b2)
    const rect2 = polygone(A2, B2, C2, D2)
    rect.couleurDeRemplissage = colorToLatexOrHTML('orange')
    rect2.couleurDeRemplissage = colorToLatexOrHTML('orange')
    return [rect, rect2]
  }

  questionTriangle(
    a: number,
    b: number,
    a2: number,
    b2: number,
  ): NestedObjetMathalea2dArray {
    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(a, 0)
    const C = pointAbstrait(0, b)
    const tri = polygone(A, B, C)
    const A2 = pointAbstrait(Math.ceil(a) + 1, 0)
    const B2 = pointAbstrait(Math.ceil(a) + a2 + 1, 0)
    const C2 = pointAbstrait(Math.ceil(a) + a2 + 1, b2)
    const tri2 = polygone(A2, B2, C2)
    tri.couleurDeRemplissage = colorToLatexOrHTML('orange')
    tri2.couleurDeRemplissage = colorToLatexOrHTML('orange')
    return [tri, tri2]
  }
}
