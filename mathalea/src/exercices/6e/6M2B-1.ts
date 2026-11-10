import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { MetaInteractif2d } from '../../lib/2d/interactif2d'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { centreGraviteTriangle } from '../../lib/2d/utilitairesTriangle'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteFeedback } from '../../lib/interactif/questionMathLive'
import TripletPythagoricien from '../../lib/mathFonctions/TripletsPythagoriciens'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import type { IExercice } from '../../lib/types'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre =
  'Calculer l’aire d’un carré, d’un rectangle, ou d’un triangle'
export const interactifReady = true

export const dateDePublication = '10/01/2026'
export const dateDeModifImportante = '06/11/2026'

/**
 * Calculer l’aire in situ d’un carré ou d’un rectangle
 * @author Jean-claude Lhote
 */

export const uuid = 'a4d87'

export const refs = {
  'fr-fr': ['6M2B-1'],
  'fr-2016': [],
  'fr-ch': ['9R1GM2B-4', '9R2GM2B-4', '9R3GM2B-4', 'PRQMG01B-6'],
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
      letterSize: 'small',
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
  const description = `Carré de côté ${stringNombre(cote, 1)}${sp()}cm. Ses quatre côtés sont codés de même longueur et ses quatre angles sont droits.`
  return { objets, description }
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
      letterSize: 'small',
    },
  )
  const afficheLongueur = latex2d(
    `${texNombre(longueur, 1)} \\text{ cm}`,
    L / 2,
    l + 0.5,
    {
      letterSize: 'small',
    },
  )
  const input = new MetaInteractif2d(
    [
      {
        content: '%{champ1}\\text{ cm}^2',
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
  const description = `Rectangle de longueur ${stringNombre(longueur, 1)}${sp()}cm et de largeur ${stringNombre(largeur, 1)}${sp()}cm. Ses quatre angles sont droits.`
  return { objets, description }
}
const figureTriangleRectangle1 = (
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
      letterSize: 'small',
    },
  )
  const cote2 =
    C.x === 0
      ? latex2d(`${texNombre(hauteur, precision)}\\text{ cm}`, -1, h / 2, {
          letterSize: 'small',
        })
      : latex2d(`${texNombre(hauteur, precision)}\\text{ cm}`, b + 1, h / 2, {
          letterSize: 'small',
        })
  const cote3 = placeLatexSurSegment(
    `${texNombre(Math.sqrt(base * base + hauteur * hauteur), precision)}\\text{ cm}`,
    C.x === 0 ? C : A,
    C.x === 0 ? B : C,
    { distance: 0.5, letterSize: 'small' },
  )
  const triangle = polygone(A, B, C)
  triangle.hachures = true
  triangle.couleurDesHachures = colorToLatexOrHTML('lightgray')
  const M = centreGraviteTriangle(A, B, C)
  const input = new MetaInteractif2d(
    [
      {
        content: '%{champ1}\\text{ cm}^2',
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
  const description = `Triangle avec un angle droit. Les deux côtés de cet angle mesurent ${stringNombre(base, precision)}${sp()}cm et ${stringNombre(hauteur, precision)}${sp()}cm. Le troisième côté mesure ${stringNombre(Math.sqrt(base * base + hauteur * hauteur), precision)}${sp()}cm.`
  return { objets, description }
}

const figureTriangleQuelconque1 = (
  base: number,
  hauteur: number,
  hauteurInterieure: boolean,
  decimal: boolean,
  exercice: IExercice,
  question: number,
) => {
  const precision = decimal ? 1 : 0
  const b = Math.max(7, base)
  const h = Math.max(4, hauteur)
  const A = pointAbstrait(0, 0)
  const flip = choice([-1, 1])
  const xH =
    (hauteurInterieure
      ? choice([1 - randint(10, 20) / 100, randint(10, 20) / 100]) * flip
      : (1 + randint(10, 20) / 100) * flip) * b
  const B = pointAbstrait(b * flip, 0)
  const C = pointAbstrait(xH, h)
  const triangle = polygone(A, B, C)
  triangle.hachures = true
  triangle.couleurDesHachures = colorToLatexOrHTML('lightgray')
  const H = pointAbstrait(xH, 0)
  const segHauteur1 = segment(C, H)
  segHauteur1.pointilles = 2
  const segHauteur2 = segment(H, A)
  segHauteur2.pointilles = 2
  const ang1 = codageAngleDroit(A, H, C)
  // L'étiquette d'une hauteur intérieure va du côté du sommet le plus éloigné de son pied, où il y a la place
  const sommetEloigne = Math.abs(xH - A.x) > Math.abs(xH - B.x) ? A : B
  const etiquetteAGauche = hauteurInterieure ? sommetEloigne.x < xH : xH < 0
  const afficheHauteur = placeLatexSurSegment(
    `\\approx${texNombre(hauteur, precision)}\\text{ cm}`,
    etiquetteAGauche ? H : C,
    etiquetteAGauche ? C : H,
    { letterSize: 'small' },
  )
  const afficheBase = latex2d(
    `\\approx${texNombre(base, precision)}\\text{ cm}`,
    (A.x + B.x) / 2,
    -0.5,
    { letterSize: 'small' },
  )
  const afficheHypotenuse = placeLatexSurSegment(
    `\\approx${texNombre(longueur(A, C), 1)}\\text{ cm}`,
    flip === 1 ? A : C,
    flip === 1 ? C : A,
    { letterSize: 'small' },
  )
  const afficheCote = placeLatexSurSegment(
    `\\approx${texNombre(longueur(B, C), 1)}\\text{ cm}`,
    flip === 1 ? (hauteurInterieure ? C : B) : hauteurInterieure ? B : C,
    flip === 1 ? (hauteurInterieure ? B : C) : hauteurInterieure ? C : B,
    { distance: 0.5, letterSize: 'small' },
  )
  // Le champ ne tient pas dans les plus petits triangles : il est placé sous la base
  const input = new MetaInteractif2d(
    [
      {
        content: '%{champ1}\\text{ cm}^2',
        x: (A.x + B.x) / 2,
        y: -1.8,
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
  const description = `Triangle dont un côté mesure environ ${stringNombre(base, precision)}${sp()}cm. Du sommet opposé part un segment en pointillés d’environ ${stringNombre(hauteur, precision)}${sp()}cm, perpendiculaire ${hauteurInterieure ? 'à ce côté' : 'au prolongement de ce côté'}. Les deux autres côtés mesurent environ ${stringNombre(longueur(A, C), 1)}${sp()}cm et ${stringNombre(longueur(B, C), 1)}${sp()}cm.`
  return { objets, description }
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
    this.nbCols = context.isHtml ? 1 : 2
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
    const premiereHauteurInterieure = choice([true, false])
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
            const { objets, description } = figureCarre(cote, this, i)
            if (!context.isHtml || !this.interactif) {
              objets.pop()
            }
            const figure =
              mathalea2d(
                Object.assign(
                  { scale: 0.7, description },
                  fixeBordures(objets),
                ),
                objets,
              ) +
              (context.isHtml
                ? `<span id="resultatCheckEx${this.numeroExercice}Q${i}"></span>` +
                  ajouteFeedback(this, i)
                : '')
            texte =
              figure +
              (!context.isHtml || !this.interactif
                ? 'Quelle est l’aire du carré représenté ci-contre ?'
                : '')
            texteCorr = `L'aire du carré est de $${texNombre(cote, 1)}\\text{ cm}\\times ${texNombre(cote, 1)}\\text{ cm}=${miseEnEvidence(texNombre(a, 2))}\\text{ cm}^2$.`
          }
          break
        case 2:
          {
            // rectangle
            const largeur = this.sup2 ? randint(20, 50) / 10 : randint(2, 5)
            const longueur = this.sup2 ? randint(55, 100) / 10 : randint(6, 10)
            a = largeur * longueur
            const { objets, description } = figureRectangle(
              largeur,
              longueur,
              this,
              i,
            )
            if (!context.isHtml || !this.interactif) {
              objets.pop()
            }
            const figure =
              mathalea2d(
                Object.assign(
                  { scale: 0.7, description },
                  fixeBordures(objets),
                ),
                objets,
              ) +
              (context.isHtml
                ? `<span id="resultatCheckEx${this.numeroExercice}Q${i}"></span>` +
                  ajouteFeedback(this, i)
                : '')
            texte =
              figure +
              (!context.isHtml || !this.interactif
                ? 'Quelle est l’aire du rectangle représenté ci-contre ?'
                : '')
            texteCorr = `L'aire du rectangle est de $${texNombre(largeur, 1)}\\text{ cm}\\times ${texNombre(longueur, 1)}\\text{ cm}=${miseEnEvidence(texNombre(a, 2))}\\text{ cm}^2$.`
          }
          break
        case 3:
          {
            // Triangle rectangle
            const [cote1, cote2] = TripletPythagoricien.getTriplets(25, 1)[0]
            let base = Math.max(cote1, cote2)
            let hauteur = Math.min(cote1, cote2)
            if (this.sup2) {
              base = base / 2.5
              hauteur = hauteur / 2.5
            }
            a = (base * hauteur) / 2

            const { objets, description } = figureTriangleRectangle1(
              base,
              hauteur,
              this.sup2,
              this,
              i,
            )
            if (!context.isHtml || !this.interactif) {
              objets.pop()
            }
            const figure =
              mathalea2d(
                Object.assign(
                  { scale: 0.7, description },
                  fixeBordures(objets),
                ),
                objets,
              ) +
              (context.isHtml
                ? `<span id="resultatCheckEx${this.numeroExercice}Q${i}"></span>` +
                  ajouteFeedback(this, i)
                : '')
            texte =
              figure +
              (!context.isHtml || !this.interactif
                ? 'Quelle est l’aire du triangle rectangle représenté ci-contre ? (avec la précision permise par les indications sur la figure)'
                : '')
            texteCorr = `L'aire du triangle rectangle est de $\\dfrac{${texNombre(base, 1)}\\text{ cm}\\times ${texNombre(hauteur, 1)}\\text{ cm}}{2}=${miseEnEvidence(texNombre(a, 3))}\\text{ cm}^2$.`
          }
          break
        case 4:
        default: {
          // Triangle quelconque
          const base = this.sup2 ? randint(40, 90) / 10 : randint(4, 9)
          const hauteur = this.sup2 ? randint(30, 50) / 10 : randint(3, 5)
          // Hauteur intérieure et extérieure en alternance, à partir d'un premier cas tiré au sort
          const rangTriangle = listeTypeDeQuestions
            .slice(0, i)
            .filter((type) => type === typeDeQuestion).length
          const hauteurInterieure =
            rangTriangle % 2 === 0
              ? premiereHauteurInterieure
              : !premiereHauteurInterieure
          a = (base * hauteur) / 2
          const { objets, description } = figureTriangleQuelconque1(
            base,
            hauteur,
            hauteurInterieure,
            this.sup2,
            this,
            i,
          )
          if (!context.isHtml || !this.interactif) {
            objets.pop()
          }
          const figure =
            mathalea2d(
              Object.assign({ scale: 0.7, description }, fixeBordures(objets)),
              objets,
            ) +
            (context.isHtml
              ? `<span id="resultatCheckEx${this.numeroExercice}Q${i}"></span>` +
                ajouteFeedback(this, i)
              : '')
          texte =
            figure +
            (!context.isHtml || !this.interactif
              ? 'Quelle est l’aire du triangle représenté ci-contre ? (avec la précision permise par les indications sur la figure)'
              : '')
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
