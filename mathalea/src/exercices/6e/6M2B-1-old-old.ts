import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite, droiteHorizontaleParPoint } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { MetaInteractif2d } from '../../lib/2d/interactif2d'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { projectionOrtho, rotation } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointIntersectionDD } from '../../lib/2d/utilitairesPoint'
import { centreGraviteTriangle } from '../../lib/2d/utilitairesTriangle'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteFeedback } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import type { IExercice } from '../../lib/types'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Calculer l’aire d’un carré ou d’un rectangle'
export const interactifReady = true

export const dateDePublication = '10/01/2026'

/**
 * Calculer l’aire in situ d’un carré ou d’un rectangle
 * @author Jean-claude Lhote
 */

export const uuid = 'f36f4'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
const figureCarre = (cote: number, exercice: IExercice, question: number) => {
  const c = Math.max(5, cote)
  const A = pointAbstrait(0, 0)
  const B = pointAbstrait(c, 0)
  const C = pointAbstrait(c, c)
  const D = pointAbstrait(0, c)
  const ang1 = codageAngleDroit(A, B, C)
  const ang2 = codageAngleDroit(B, C, D)
  const ang3 = codageAngleDroit(C, D, A)
  const ang4 = codageAngleDroit(D, A, B)
  const cotesMarques = codageSegments(
    '//',
    bleuMathalea,
    A,
    B,
    B,
    C,
    C,
    D,
    D,
    A,
  )
  const square = carre(A, B)
  square.hachures = true
  square.couleurDesHachures = colorToLatexOrHTML('lightgray')
  const afficheCote = latex2d(
    `${texNombre(cote, 1)} \\text{ cm}`,
    c / 2,
    c + 0.5,
    {
      letterSize: 'scriptsize',
    },
  )
  const input = new MetaInteractif2d(
    [
      {
        content: '%{champ1}\\text{ cm}^2',
        x: c / 2,
        y: c / 2,
        classe: KeyboardType.clavierNumbers,
        blanc: '\\ldots ',
        opacity: 1,
        index: 0,
      },
    ],
    {
      exercice,
      question,
    },
  )
  const objets: NestedObjetMathalea2dArray = [
    square,
    afficheCote,
    ang1,
    ang2,
    ang3,
    ang4,
    cotesMarques,
    input,
  ]
  return (
    mathalea2d(Object.assign({}, fixeBordures(objets)), objets) +
    `<span id="resultatCheckEx${exercice.numeroExercice}Q${question}"></span>` +
    ajouteFeedback(exercice, question)
  )
}
const figureRectangle = (
  largeur: number,
  longueur: number,
  exercice: IExercice,
  question: number,
) => {
  const l = Math.max(5, largeur)
  const L = Math.max(7, longueur)
  const A = pointAbstrait(0, 0)
  const B = pointAbstrait(L, 0)
  const C = pointAbstrait(L, l)
  const D = pointAbstrait(0, l)
  const ang1 = codageAngleDroit(A, B, C)
  const ang2 = codageAngleDroit(B, C, D)
  const ang3 = codageAngleDroit(C, D, A)
  const ang4 = codageAngleDroit(D, A, B)
  const rect = polygone(A, B, C, D)
  rect.hachures = true
  rect.couleurDesHachures = colorToLatexOrHTML('lightgray')
  const afficheLargeur = latex2d(
    `${texNombre(largeur, 1)} \\text{ cm}`,
    L + 1.5,
    l / 2,
    {
      letterSize: 'scriptsize',
    },
  )
  const afficheLongueur = latex2d(
    `${texNombre(longueur, 1)} \\text{ cm}`,
    L / 2,
    l + 0.5,
    {
      letterSize: 'scriptsize',
    },
  )
  const input = new MetaInteractif2d(
    [
      {
        content: '\\mathcal{A}=%{champ1}\\text{ cm}^2',
        x: L / 2,
        y: l / 2,
        classe: '',
        blanc: '\\ldots ',
        opacity: 1,
        index: 0,
      },
    ],
    {
      exercice,
      question,
    },
  )
  const objets: NestedObjetMathalea2dArray = [
    rect,
    afficheLargeur,
    afficheLongueur,
    ang1,
    ang2,
    ang3,
    ang4,
    input,
  ]
  return (
    mathalea2d(Object.assign({}, fixeBordures(objets)), objets) +
    `<span id="resultatCheckEx${exercice.numeroExercice}Q${question}"></span>` +
    ajouteFeedback(exercice, question)
  )
}
const figureTriangleRectangle = (
  base: number,
  hauteur: number,
  decimal: boolean,
  exercice: IExercice,
  question: number,
) => {
  const precision = decimal ? 1 : 0
  const b = Math.max(7, base)
  const h = Math.max(4, hauteur)
  const A = pointAbstrait(0, 0)
  const B = pointAbstrait(b, 0)
  const C = choice([pointAbstrait(0, h), pointAbstrait(b, h)])
  const ang1 = C.x === 0 ? codageAngleDroit(C, A, B) : codageAngleDroit(C, B, A)
  const cote1 = latex2d(
    `${texNombre(base, precision)}\\text{ cm}`,
    b / 2,
    -0.5,
    {
      letterSize: 'scriptsize',
    },
  )
  const cote2 =
    C.x === 0
      ? latex2d(`${texNombre(hauteur, precision)}\\text{ cm}`, -1, h / 2, {
          letterSize: 'scriptsize',
        })
      : latex2d(`${texNombre(hauteur, precision)}\\text{ cm}`, b + 1, h / 2, {
          letterSize: 'scriptsize',
        })
  const cote3 = placeLatexSurSegment(
    `\\approx${texNombre(Math.sqrt(base * base + hauteur * hauteur), precision)}\\text{ cm}`,
    C.x === 0 ? C : A,
    C.x === 0 ? B : C,
    { distance: 0.5, letterSize: 'scriptsize' },
  )
  const triangle = polygone(A, B, C)
  triangle.hachures = true
  triangle.couleurDesHachures = colorToLatexOrHTML('lightgray')
  const M = centreGraviteTriangle(A, B, C)
  const input = new MetaInteractif2d(
    [
      {
        content: '\\mathcal{A}=%{champ1}\\text{ cm}^2',
        x: M.x,
        y: M.y - 0.5,
        classe: '',
        blanc: '\\ldots ',
        opacity: 1,
        index: 0,
      },
    ],
    {
      exercice,
      question,
    },
  )
  const objets: NestedObjetMathalea2dArray = [
    triangle,
    cote1,
    cote2,
    cote3,
    ang1,
    input,
  ]
  return (
    mathalea2d(Object.assign({}, fixeBordures(objets)), objets) +
    `<span id="resultatCheckEx${exercice.numeroExercice}Q${question}"></span>` +
    ajouteFeedback(exercice, question)
  )
}

const figureTriangleQuelconque = (
  base: number,
  hauteur: number,
  angle: number,
  decimal: boolean,
  exercice: IExercice,
  question: number,
) => {
  const precision = decimal ? 1 : 0
  const b = Math.max(7, base)
  const h = Math.max(4, hauteur)
  const A = pointAbstrait(0, 0)
  const flip = choice([-1, 1])
  const B = pointAbstrait(b * flip, 0)
  const d = droiteHorizontaleParPoint(pointAbstrait(0, h))
  const d1 = droite(A, B)
  const d2 = rotation(d1, B, -flip * angle)
  const C = pointIntersectionDD(d2, d)
  const triangle = polygone(A, B, C)
  triangle.hachures = true
  triangle.couleurDesHachures = colorToLatexOrHTML('lightgray')
  const H = projectionOrtho(C, d1)
  const segHauteur1 = segment(C, H)
  segHauteur1.pointilles = 2
  const segHauteur2 = segment(H, A)
  segHauteur2.pointilles = 2
  const ang1 = codageAngleDroit(A, H, C)
  const afficheHauteur = placeLatexSurSegment(
    `${texNombre(hauteur, precision)}\\text{ cm}`,
    flip === 1 ? C : H,
    flip === 1 ? H : C,
    { letterSize: 'scriptsize' },
  )
  const afficheBase = latex2d(
    `${texNombre(base, precision)}\\text{ cm}`,
    (A.x + B.x) / 2,
    -0.5,
    { letterSize: 'scriptsize' },
  )
  const afficheHypotenuse = placeLatexSurSegment(
    `\\approx${texNombre(longueur(A, C), precision)}\\text{ cm}`,
    flip === 1 ? A : C,
    flip === 1 ? C : A,
    { letterSize: 'scriptsize' },
  )
  const afficheCote = placeLatexSurSegment(
    `\\approx${texNombre(longueur(B, C), precision)}\\text{ cm}`,
    flip === 1 ? B : C,
    flip === 1 ? C : B,
    { distance: 0.5, letterSize: 'scriptsize' },
  )
  const M = centreGraviteTriangle(A, B, C)
  const input = new MetaInteractif2d(
    [
      {
        content: '\\mathcal{A}=%{champ1}\\text{ cm}^2',
        x: M.x,
        y: M.y - 0.8,
        classe: '',
        blanc: '\\ldots ',
        opacity: 1,
        index: 0,
      },
    ],
    {
      exercice,
      question,
    },
  )
  const objets: NestedObjetMathalea2dArray = [
    triangle,
    ang1,
    segHauteur1,
    segHauteur2,
    afficheBase,
    afficheHauteur,
    afficheHypotenuse,
    afficheCote,
    input,
  ]
  return (
    mathalea2d(Object.assign({}, fixeBordures(objets)), objets) +
    `<span id="resultatCheckEx${exercice.numeroExercice}Q${question}"></span>` +
    ajouteFeedback(exercice, question)
  )
}

export default class AireCarreRectangle extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de figure',
      'Nombres séparés par des tirets\n1 : Carré\n2 : Rectangle\n3 : Triangle rectangle\n4 : Triangle quelconque\n5 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Valeurs décimales', false]
    this.sup2 = false
    this.sup = '5'
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 4
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Dans chaque cas, calculer l’aire de la figure donnée.'
        : 'Calculer l’aire de la figure donnée.'
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typeDeQuestion = listeTypeDeQuestions[i]
      let texte = ''
      let texteCorr = ''
      let a = 0
      switch (typeDeQuestion) {
        case 1:
          {
            // carré
            const cote = this.sup2 ? randint(20, 70) / 10 : randint(2, 9)
            a = cote * cote
            texte = figureCarre(cote, this, i)
            texteCorr = `L'aire du carré est de $${texNombre(cote, 1)}\\text{ cm}\\times ${texNombre(cote, 1)}\\text{ cm}=${miseEnEvidence(texNombre(a, 2))}\\text{ cm}^2$.`
          }
          break
        case 2:
          {
            // rectangle
            const largeur = this.sup2 ? randint(20, 50) / 10 : randint(2, 5)
            const longueur = this.sup2 ? randint(55, 100) / 10 : randint(6, 10)
            a = largeur * longueur
            texte = figureRectangle(largeur, longueur, this, i)
            texteCorr = `L'aire du rectangle est de $${texNombre(largeur, 1)}\\text{ cm}\\times ${texNombre(longueur, 1)}\\text{ cm}=${miseEnEvidence(texNombre(a, 2))}\\text{ cm}^2$.`
          }
          break
        case 3:
          {
            // Triangle rectangle
            const base = this.sup2 ? randint(40, 90) / 10 : randint(4, 9)
            const hauteur = this.sup2 ? randint(30, 50) / 10 : randint(3, 5)
            a = (base * hauteur) / 2
            texte = figureTriangleRectangle(base, hauteur, this.sup2, this, i)
            texteCorr = `L'aire du triangle rectangle est de $\\dfrac{${texNombre(base, 1)}\\text{ cm}\\times ${texNombre(hauteur, 1)}\\text{ cm}}{2}=${miseEnEvidence(texNombre(a, 3))}\\text{ cm}^2$.`
          }
          break
        case 4:
        default: {
          // Triangle quelconque
          const base = this.sup2 ? randint(40, 90) / 10 : randint(4, 9)
          const hauteur = this.sup2 ? randint(30, 50) / 10 : randint(3, 5)
          const angle = randint(100, 120)
          a = (base * hauteur) / 2
          texte = figureTriangleQuelconque(
            base,
            hauteur,
            angle,
            this.sup2,
            this,
            i,
          )
          texteCorr = `L'aire du triangle est de $\\dfrac{${texNombre(base, 1)}\\text{ cm}\\times ${texNombre(hauteur, 1)}\\text{ cm}}{2}=${miseEnEvidence(texNombre(a, 3))}\\text{ cm}^2$.`
        }
      }
      if (this.questionJamaisPosee(i, a)) {
        handleAnswers(
          this,
          i,
          {
            field0: { value: texNombre(a, 3), options: { noFeedback: true } },
          },
          {
            formatInteractif: 'MetaInteractif2d',
          },
        )
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
