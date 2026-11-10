import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { orangeMathalea } from '../../lib/colors'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer dans un triangle équilatéral (longueur, aire)'
export const dateDePublication = '12/12/2025'
export const interactifReady = true

export const uuid = 'b18e9'

export const refs = {
  'fr-fr': ['4G22-0'],
  'fr-ch': ['NR'],
}

function figureTriangleEquilateral(
  nomTriangle: string,
  cote: number,
  hauteur: number,
  nomPied: string,
  afficheQuelleLongueur: 'hauteur' | 'cote',
): { figureEnonce: string; figureCorrection: string } {
  const A = pointAbstrait(0, 0, nomTriangle.slice(0, 1))
  const B = pointAbstrait(7, 0, nomTriangle.slice(1, 2))
  const C = pointAbstrait(3.5, (Math.sqrt(3) / 2) * 7, nomTriangle.slice(2, 3))
  const triangleInitial = polygone(A, B, C)
  const labels = nommePolygone(triangleInitial, nomTriangle)
  const H = pointAbstrait(3.5, 0, nomPied, 'below')
  const nomH = labelPoint(H)
  const hauteurSeg = segment(C, H)
  const angledroit = codageAngleDroit(B, H, C, 'red', 0.7)
  const codageCotes = codageSegments('//', 'black', B, C, C, A)
  const longueurCoteAB = placeLatexSurSegment(
    `${texNombre(cote, 0)}\\text{ cm}`,
    A,
    B,
    { distance: -1.2 },
  )
  const longueurCoteBC = placeLatexSurSegment(
    `${texNombre(cote, 0)}\\text{ cm}`,
    C,
    B,
    { distance: 0.6 },
  )
  const afficheHauteur = placeLatexSurSegment(
    `${texNombre((cote * Math.sqrt(3)) / 2, 1)}\\text{ cm}`,
    C,
    H,
    { distance: 0.5 },
  )
  const afficheLongeurs =
    afficheQuelleLongueur === 'hauteur'
      ? [afficheHauteur, codageCotes]
      : [longueurCoteAB, longueurCoteBC, codageCotes]
  const egalitesLongueurs = codageSegments('O', 'black', A, H, H, B)
  const objets = [
    triangleInitial,
    hauteurSeg,
    angledroit,
    labels,
    ...afficheLongeurs,
  ]
  const objetsCorrection = [...objets, nomH, egalitesLongueurs]
  return {
    figureEnonce: mathalea2d(Object.assign({}, fixeBordures(objets)), objets),
    figureCorrection: mathalea2d(
      Object.assign({}, fixeBordures(objetsCorrection)),
      objetsCorrection,
    ),
  }
}

function calculeHauteur(
  cote: number,
  nomTriangle: string,
  typeDeReponse: string,
  nomPied: string,
): string {
  const demiBase = `${nomPied}${nomTriangle.slice(1, 2)}`
  const nomHypotenuse = `${nomTriangle.slice(1, 3)}`
  const nomHauteur = `${nomPied}${nomTriangle[2]}`
  const nomTriangleRectangle = `${nomHypotenuse}${nomPied}`
  const correction = `Soit $${nomPied}$ le pied de la hauteur issue de $${nomTriangle.slice(2, 3)}$, comme $${nomTriangle}$ est équilatéral, $${nomPied}$ est le milieu de $[${nomTriangle.slice(0, 2)}]$.<br>
 Pour calculer la hauteur $${nomHauteur}$ du triangle équilatéral $${nomTriangle}$ de longueur de côté $${texNombre(cote, 0)}\\text{ cm}$, on utilise le théorème de Pythagore dans le triangle $${nomTriangleRectangle}$ rectangle en $${nomPied}$.<br>
 $${nomHypotenuse}^2 = ${demiBase}^2 + ${nomHauteur}^2$<br>
 $${texNombre(cote, 0)}^2 = ${texNombre(cote / 2, 1)}^2 + ${nomHauteur}^2$<br>
 $${texNombre(cote * cote, 0)} = ${texNombre((cote * cote) / 4, 2)} + ${nomHauteur}^2$<br>
 Soit :<br>
 $${nomHauteur}^2=${texNombre(cote * cote, 0)} - ${texNombre((cote * cote) / 4, 2)}=${texNombre((3 * cote * cote) / 4, 2)}$<br>
 $${nomHauteur}=\\sqrt{${texNombre((3 * cote * cote) / 4, 2)}}$<br>
 Donc la hauteur $${nomHauteur}$ est ${typeDeReponse.includes('exacte') ? 'égale' : 'environ égale'} à
    ${
      typeDeReponse.includes('exacte')
        ? `$${miseEnEvidence(`\\sqrt{${texNombre((3 * cote * cote) / 4, 2)}}`)}$`
        : `$${miseEnEvidence(texNombre((cote * Math.sqrt(3)) / 2, 1))}$`
    } cm.`

  return correction
}

function calculeAire(
  cote: number,
  nomTriangle: string,
  typeDeReponse: string,
  nomPied: string,
): string {
  const calculeLaHauteur = calculeHauteur(
    cote,
    nomTriangle,
    typeDeReponse,
    nomPied,
  )
  const correction = `Tout d'abord calculons la hauteur issue de $${nomTriangle[2]}$ dans le triangle $${nomTriangle}$ :<br>
  ${calculeLaHauteur.replace(`${context.isHtml ? orangeMathalea : 'f15929'}`, '000000')}<br>
  L'aire d'un triangle est donnée par la formule $\\dfrac{\\mathcal{B}\\times h}{2}$.<br>
  Donc, l'aire du triangle $${nomTriangle}$ est :<br>
  $\\dfrac{${texNombre(cote, 0)}\\times \\sqrt{${texNombre((3 * cote * cote) / 4, 2)}}}{2}${
    typeDeReponse.includes('exacte')
      ? `=${texNombre(cote / 2, 1)} \\sqrt{${texNombre((3 * cote * cote) / 4, 2)}}`
      : `\\approx${texNombre((cote * cote * Math.sqrt(3)) / 4, 1)}`
  }$<br>
  Donc l'aire du triangle équilatéral de côté $${texNombre(
    cote,
    0,
  )}$ cm est ${typeDeReponse.includes('exacte') ? 'égale' : 'environ égale'} à
  ${
    typeDeReponse.includes('exacte')
      ? `$${miseEnEvidence(
          `${texNombre(cote / 2, 1)} \\sqrt{${texNombre((3 * cote * cote) / 4, 2)}}`,
        )}$ cm$^2$.`
      : `$${miseEnEvidence(texNombre((cote * cote * Math.sqrt(3)) / 4, 1))}$ cm$^2$.`
  }`

  return correction
}

function calculeCote(
  hauteur: number,
  nomTriangle: string,
  typeDeReponse: string,
  nomPied: string,
): string {
  const nomHypotenuse = `${nomTriangle.slice(1, 3)}`
  const nomHauteur = `${nomPied}${nomTriangle[2]}`
  const demiBase = `${nomPied}${nomTriangle.slice(1, 2)}`
  const nomTriangleRectangle = `${nomHypotenuse}${nomPied}`
  const correction = `Soit $${nomPied}$ le pied de la hauteur issue de $${nomTriangle.slice(2, 3)}$, comme $${nomTriangle}$ est équilatéral, $${nomPied}$ est le milieu de $[${nomTriangle.slice(0, 2)}]$.<br>
 Pour calculer le côté $${nomHypotenuse}$ du triangle équilatéral $${nomTriangle}$ de hauteur $${texNombre(hauteur, 0)}\\text{ cm}$, on utilise le théorème de Pythagore dans le triangle $${nomTriangleRectangle}$ rectangle en $${nomPied}$.<br>
 $${nomHypotenuse}^2 = ${demiBase}^2 + ${nomHauteur}^2$<br>
 $${nomHypotenuse}^2 = \\left(\\dfrac{${nomHypotenuse}}{2}\\right)^2 + ${nomHauteur}^2$<br>
  $${nomHypotenuse}^2 - \\dfrac{${nomHypotenuse}^2}{4}= ${nomHauteur}^2$<br>
  $${nomHauteur}^2=\\dfrac{3}{4}${nomHypotenuse}^2$<br>
  $\\dfrac{4}{3}${nomHauteur}^2=${nomHypotenuse}^2$<br>
  Soit :<br>
  $${nomHypotenuse}^2=\\dfrac{4}{3}\\times ${texNombre(hauteur * hauteur, 0)}=\\dfrac{${texNombre(4 * hauteur * hauteur, 0)}}{3}$<br>
  $${nomHypotenuse}=\\sqrt{\\dfrac{${texNombre(4 * hauteur * hauteur, 0)}}{3}}$<br>
Donc le côté $${nomHypotenuse}$ est égal à ${
    typeDeReponse.includes('exacte')
      ? `$${miseEnEvidence(`\\sqrt{\\dfrac{${texNombre(4 * hauteur * hauteur, 0)}}{3}}`)}$`
      : `$${miseEnEvidence(texNombre((2 * hauteur) / Math.sqrt(3), 1))}$`
  } cm.
 `

  return correction
}

/**
 * @author Jean-claude Lhote
 */
export default class TriangleEquilateral extends Exercice {
  niveau: number = 4
  constructor() {
    super()
    this.sup = '1-2'
    this.niveau = 4
    this.spacingCorr = 2
    this.comment =
      "La différence entre valeur approchée et valeur arrondie se situe au niveau de la valeur attendue en interactif. Avec valeur approchée, l'élève peut donner la valeur par excès ou par défaut, tandis qu'avec valeur arrondie, il doit donner la valeur arrondie au dixième le plus proche."
    this.besoinFormulaireTexte = [
      'Type de questions',
      "Nombres séparés par des tirets\n1 : Calcul de la hauteur\n2 : Calcul de l'aire",
    ]

    this.besoinFormulaire2Numerique = [
      'Type de réponse attendue',
      3,
      '1 : Valeur exacte\n2 : Valeur approchée par excès ou par défaut à 0,1 près\n3 : Valeur arrondie à 0,1 près',
    ]
    this.sup2 = 1
    this.besoinFormulaire3CaseACocher = ['Avec figure', true]
    this.sup3 = true
    this.nbQuestions = 1
  }

  nouvelleVersion(): void {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: this.niveau === 4 ? 2 : 3,
      melange: 1000,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const nomTriangle = choisitLettresDifferentes(3).join('')
      const nomPied = choisitLettresDifferentes(1, nomTriangle, true)[0]

      let cote: number = 0
      let hauteur: number = 0
      const typeDeQuestion = listeTypeDeQuestions[i]
      const uniteReponse = typeDeQuestion === 2 ? 'cm²' : 'cm'
      const typeDeReponse =
        this.sup2 === 1
          ? 'Donner la valeur exacte'
          : this.sup2 === 2
            ? `Donner une valeur approchée à $0{,}1$ ${uniteReponse} près`
            : `Donner la valeur arrondie à $0{,}1$ ${uniteReponse} près`
      let question = ''
      let correction = ''
      switch (typeDeQuestion) {
        case 3: // Calcul du côté (Hors programme en 3e !)
          {
            hauteur = randint(2, 20)
            cote = (hauteur * 2) / Math.sqrt(3)
            const figures = figureTriangleEquilateral(
              nomTriangle,
              cote,
              hauteur,
              nomPied,
              'hauteur',
            )
            question =
              `Calculer la longueur du côté du triangle équilatéral $${nomTriangle}$ dont la hauteur mesure $${texNombre(hauteur, 0)}\\text{ cm}$.<br>
          ${typeDeReponse}.` +
              ajouteQuestionMathlive({
                exercice: this,
                question: i,
                texteApres: ' cm',
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: {
                    value: typeDeReponse.includes('exacte')
                      ? `\\sqrt{\\dfrac{${texNombre(4 * hauteur * hauteur, 0)}}{3}}`
                      : typeDeReponse.includes('approchée')
                        ? [
                            `${((2 * hauteur) / Math.sqrt(3)).toFixed(1)}`,
                            `${((2 * hauteur) / Math.sqrt(3) + 0.1).toFixed(1)}`,
                          ]
                        : `${texNombre(Math.round(((2 * hauteur) / Math.sqrt(3)) * 10) / 10, 1)}`,
                  },
                },
                typeInteractivite: 'mathlive',
              }) +
              `<br>${this.sup3 ? `${figures.figureEnonce}<br><br>` : ''}`
            correction = `${figures.figureCorrection}<br><br>${calculeCote(hauteur, nomTriangle, typeDeReponse, nomPied)}`
          }
          break

        case 2: // Calcul de l'aire connaissant le côté.
          {
            cote = randint(2, 20)
            const figures = figureTriangleEquilateral(
              nomTriangle,
              cote,
              cote * (Math.sqrt(3) / 2),
              nomPied,
              'cote',
            )
            question = `Calculer l'aire du triangle équilatéral de longueur de côté $${texNombre(cote, 0)}\\text{ cm}$.<br>
            ${typeDeReponse}`
            question +=
              ajouteQuestionMathlive({
                exercice: this,
                question: i,
                texteApres: ' cm$^2$',
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: {
                    value: typeDeReponse.includes('exacte')
                      ? `${texNombre((cote * cote) / 4, 2)}\\sqrt{3}`
                      : typeDeReponse.includes('approchée')
                        ? [
                            `${((cote * cote * Math.sqrt(3)) / 4).toFixed(1)}`,
                            `${((cote * cote * Math.sqrt(3)) / 4 + 0.1).toFixed(1)}`,
                          ]
                        : `${texNombre(Math.round(((cote * cote * Math.sqrt(3)) / 4) * 10) / 10, 1)}`,
                  },
                },
                typeInteractivite: 'mathlive',
              }) + `<br>${this.sup3 ? `${figures.figureEnonce}<br><br>` : ''}`

            correction = `${figures.figureCorrection}<br><br>${calculeAire(cote, nomTriangle, typeDeReponse, nomPied)}`
          }
          break
        case 1: // Calcul de la hauteur
        default:
          {
            cote = randint(2, 20)
            const figures = figureTriangleEquilateral(
              nomTriangle,
              cote,
              cote * (Math.sqrt(3) / 2),
              nomPied,
              'cote',
            )
            question =
              `Calculer la mesure de la hauteur du triangle équilatéral $${nomTriangle}$ de longueur de côté $${texNombre(cote, 0)}\\text{ cm}$.<br>
            ${typeDeReponse}.` +
              ajouteQuestionMathlive({
                exercice: this,
                question: i,
                texteApres: ' cm',
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: {
                    value: typeDeReponse.includes('exacte')
                      ? `\\sqrt{${(3 * cote * cote) / 4}}`
                      : typeDeReponse.includes('approchée')
                        ? [
                            `${((cote * Math.sqrt(3)) / 2).toFixed(1)}`,
                            `${((cote * Math.sqrt(3)) / 2 + 0.1).toFixed(1)}`,
                          ]
                        : `${texNombre(Math.round(((cote * Math.sqrt(3)) / 2) * 10) / 10, 1)}`,
                  },
                },
                typeInteractivite: 'mathlive',
              }) +
              `<br>${this.sup3 ? `${figures.figureEnonce}<br><br>` : ''}`
            correction = `${figures.figureCorrection}<br><br>${calculeHauteur(cote, nomTriangle, typeDeReponse, nomPied)}`
          }
          break
      }
      if (this.questionJamaisPosee(i, typeDeQuestion + String(cote))) {
        this.listeQuestions.push(question)
        this.listeCorrections.push(correction)
        i++
      }
      cpt++
    }
  }
}
