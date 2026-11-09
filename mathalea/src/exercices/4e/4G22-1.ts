import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import {
  CodageAngleDroit3D,
  point3d,
  polygone3d,
} from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { pyramide3d } from '../../lib/3d/3dProjectionMathalea2d/Pyramide3dPerspectiveCavaliere'
import { orangeMathalea } from '../../lib/colors'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer dans une pyramide régulière à base carrée'
export const dateDePublication = '31/12/2025'
export const interactifReady = true

export const uuid = 'c18ea'

export const refs = {
  'fr-fr': ['4G22-1'],
  'fr-ch': ['10LSGM3B-1', '11LCGM1B-1', '11LSGM1B-1', 'PRQMG02C-4', 'PRQMG03B-4'],
}

function figurePyramideCarree(
  nomPyramide: string,
  cote: number,
  hauteurOuArete: number,
  nomPied: string,
  afficheQuelleLongueur: 'hauteur' | 'arete',
  nomMilieuBase?: string,
): { figureEnonce: string; figureCorrection: string } {
  const scale = 0.6 // le scale pour la sortie latex
  const A = point3d(0, 0, 0, true, nomPyramide.slice(0, 1), 'below left')
  const B = point3d(7, 0, 0, true, nomPyramide.slice(1, 2), 'below right')
  const C = point3d(7, 7, 0, true, nomPyramide.slice(2, 3), 'right')
  const D = point3d(0, 7, 0, true, nomPyramide.slice(3, 4), 'left')
  const H = point3d(3.5, 3.5, 0, true, nomPied, 'below')
  H.isVisible = false
  const E = point3d(3.5, 3.5, 6, true, nomPyramide.slice(4, 5), 'above')
  const base = polygone3d(A, B, C, D)
  const pyramide = pyramide3d(base, E, 'black', H, false, 'black', true, false)
  const hauteurSeg = segment(H.c2d, E.c2d)
  hauteurSeg.pointilles = 2
  const diag1 = segment(A.c2d, C.c2d)
  const diag2 = segment(B.c2d, D.c2d)
  diag1.pointilles = 2
  diag2.pointilles = 2
  const afficheLongueurCote = placeLatexSurSegment(
    `${texNombre(cote, 0)}\\text{ cm}`,
    C.c2d,
    B.c2d,
    { distance: 1.1, letterSize: 'small', horizontal: true },
  )
  const afficheHauteur =
    afficheQuelleLongueur === 'hauteur'
      ? placeLatexSurSegment(
          `${texNombre(hauteurOuArete, 0)}\\text{ cm}`,
          E.c2d,
          H.c2d,
          { distance: 0.3, letterSize: 'small', horizontal: false },
        )
      : placeLatexSurSegment(
          `${texNombre(hauteurOuArete, 0)}\\text{ cm}`,
          E.c2d,
          C.c2d,
          { distance: 0.5, letterSize: 'small', horizontal: false },
        )
  const angledroit1 = new CodageAngleDroit3D(A, B, C, 'red', 1.5)
  const angledroit2 = new CodageAngleDroit3D(A, H, E, 'red', 1.5)
  const angledroit3 = new CodageAngleDroit3D(B, H, E, 'red', 1.5)
  const angledroits = [angledroit1, angledroit2, angledroit3]
  const objets = [
    pyramide.c2d,
    hauteurSeg,
    ...angledroits,
    diag1,
    diag2,
    afficheLongueurCote,
    afficheHauteur,
  ]
  if (nomMilieuBase) {
    const M = point3d(3.5, 0, 0, true, nomMilieuBase, 'below')
    const demiBaseSeg = segment(M.c2d, H.c2d)
    demiBaseSeg.pointilles = 2
    objets.push(demiBaseSeg)
    const afficheMilieuBase = labelPoint(M.c2d)
    const codageAngle = new CodageAngleDroit3D(B, M, H, 'red', 1.5)
    objets.push(codageAngle)
    const hauteurFace = segment(M.c2d, E.c2d)
    objets.push(hauteurFace)
    objets.push(afficheMilieuBase)
  }
  const objetsCorrection = [...objets]
  return {
    figureEnonce: mathalea2d(
      Object.assign({ scale }, fixeBordures(objets)),
      objets,
    ),
    figureCorrection: mathalea2d(
      Object.assign({ scale }, fixeBordures(objetsCorrection)),
      objetsCorrection,
    ),
  }
}

function calculeHauteurPyramide(
  cote: number,
  arete: number,
  nomPyramide: string,
  typeDeReponse: string,
  nomPied: string,
): string {
  const nomTriangle = nomPyramide.slice(0, 3)
  const nomHauteur = `${nomPied}${nomPyramide[4]}`
  const nomTriangleRectangle = `${nomTriangle[0]}${nomPied}${nomPyramide[4]}`
  const nomHypotenuse = `${nomTriangleRectangle[0]}${nomTriangleRectangle[2]}`
  const demiBase = `${nomTriangle[0]}${nomPied}`
  const correction = `${calculeDemiDiagonale(
    cote,
    nomTriangle,
    typeDeReponse,
    nomPied,
  )}
  Maintenant, calculons la hauteur $${nomHauteur}$ de la pyramide $${nomPyramide}$.<br>
  Dans le triangle $${nomTriangleRectangle}$ rectangle en $${nomPied}$, d'après le théorème de Pythagore :<br>
  $${nomHypotenuse}^2 = ${demiBase}^2 + ${nomHauteur}^2$<br>
  $${texNombre(arete, 0)}^2 = \\left(\\dfrac{\\sqrt{${texNombre(2 * cote * cote, 0)}}}{2}\\right)^2 + ${nomHauteur}^2$<br>
  $${texNombre(arete * arete, 0)} = \\dfrac{${texNombre(2 * cote * cote, 0)}}{4} + ${nomHauteur}^2$<br>
  $${texNombre(arete * arete, 0)} = ${texNombre((cote * cote) / 2, 1)} + ${nomHauteur}^2$<br>
  Donc :<br>
  $${nomHauteur}^2 = ${texNombre(arete * arete, 0)} - ${texNombre((cote * cote) / 2, 1)}$<br>
  $${nomHauteur}^2 = ${texNombre(arete * arete - (cote * cote) / 2, 1)}$<br>
  Donc :<br>
  $${nomHauteur}=\\sqrt{${texNombre(arete * arete - (cote * cote) / 2, 1)}}${
    typeDeReponse.includes('exacte')
      ? ''
      : `${egalOuApprox(Math.sqrt(arete * arete - (cote * cote) / 2), 1)}${texNombre(
          Math.sqrt(arete * arete - (cote * cote) / 2),
          1,
        )}`
  }$<br>
  ${
    typeDeReponse.includes('exacte')
      ? `La hauteur $${nomHauteur}$ de la pyramide $${nomPyramide}$ est donc égale à $${miseEnEvidence(
          `\\sqrt{${texNombre(arete * arete - (cote * cote) / 2, 1)}}`,
        )}\\text{ cm}$.`
      : `La hauteur $${nomHauteur}$ de la pyramide $${nomPyramide}$ est donc ${typeDeReponse.includes('approchée') ? 'environ ' : ''}égale à $${miseEnEvidence(
          texNombre(Math.sqrt(arete * arete - (cote * cote) / 2), 1),
        )}\\text{ cm}$.`
  }
 `

  return correction
}

function calculeHauteurFaceLaterale(
  cote: number,
  hauteur: number,
  nomPyramide: string,
  typeDeReponse: string,
  nomPied: string,
  nomMilieuBase: string,
): string {
  const nomApex = nomPyramide.slice(4)
  const nomFaceLaterale = `${nomPyramide[0]}${nomPyramide[1]}${nomPyramide[4]}`
  const nomTriangle = nomMilieuBase + nomPied + nomApex
  const nomHauteur = `${nomPied}${nomApex}`
  const nomHypotenuse = `${nomMilieuBase}${nomApex}`
  const demiBase = `${nomMilieuBase}${nomPied}`
  const correction = `Tout d'abord calculons la longueur $${demiBase}$ qui est la moitié du côté de la base.<br>
  $${demiBase} = \\dfrac{1}{2} \\times ${texNombre(cote, 0)} = ${texNombre(cote / 2, 1)}\\text{ cm}$.<br>
  Maintenant, calculons la hauteur de la face latérale $${nomFaceLaterale}$ de la pyramide $${nomPyramide}$.<br>
  Dans le triangle $${nomTriangle}$ rectangle en $${nomPied}$, d'après le théorème de Pythagore :<br>
  $${nomHypotenuse}^2 = ${demiBase}^2 + ${nomHauteur}^2$<br>
  $${nomHypotenuse}^2 = ${texNombre(cote / 2, 1)}^2 + ${texNombre(hauteur, 0)}^2$<br>
  $${nomHypotenuse}^2 = ${texNombre((cote * cote) / 4, 2)} + ${texNombre(hauteur * hauteur, 0)}$<br>
  $${nomHypotenuse}^2 = ${texNombre((cote * cote) / 4 + hauteur * hauteur, 2)}$<br>
  Donc :<br>
  $${nomHypotenuse}=\\sqrt{${texNombre((cote * cote) / 4 + hauteur * hauteur, 2)}}${
    typeDeReponse.includes('exacte')
      ? ''
      : `${egalOuApprox(Math.sqrt(hauteur * hauteur + (cote * cote) / 4), 1)}${texNombre(Math.sqrt(hauteur * hauteur + (cote * cote) / 4), 1)}`
  }$<br>
  ${
    typeDeReponse.includes('exacte')
      ? `La hauteur $${nomHypotenuse}$ de la face latérale $${nomFaceLaterale}$ est donc égale à $${miseEnEvidence(
          `\\sqrt{${texNombre((cote * cote) / 4 + hauteur * hauteur, 2)}}`,
        )}\\text{ cm}$.`
      : `La hauteur $${nomHypotenuse}$ de la face latérale $${nomFaceLaterale}$ est donc ${typeDeReponse.includes('approchée') ? 'environ ' : ''}égale à $${miseEnEvidence(
          texNombre(Math.sqrt(hauteur * hauteur + (cote * cote) / 4), 1),
        )}\\text{ cm}$.`
  }`

  return correction
}

function calculAireTotalePyramide(
  cote: number,
  hauteur: number,
  nomPyramide: string,
  typeDeReponse: string,
  nomPied: string,
  nomMilieuBase: string,
): string {
  const nomApex = nomPyramide.slice(4)
  const nomFaceLaterale = `${nomPyramide[0]}${nomPyramide[1]}${nomApex}`
  const aireBase = cote * cote
  const aireFaceLaterale = `\\dfrac{1}{2} \\times ${texNombre(cote, 0)} \\times \\sqrt{${texNombre((cote * cote) / 4 + hauteur * hauteur, 2)}}`
  const aireFaceLateraleReduite = `${texNombre(cote / 2, 0)} \\sqrt{${texNombre((cote * cote) / 4 + hauteur * hauteur, 2)}}`
  const aireFacesLaterales = typeDeReponse.includes('exacte')
    ? `${texNombre(cote * 2, 0)} \\sqrt{${texNombre((cote * cote) / 4 + hauteur * hauteur, 2)}}`
    : `${texNombre(2 * cote * Math.sqrt(hauteur * hauteur + (cote * cote) / 4), 2)}`

  const correction = `
 Tout d'abord, calculons la hauteur $${nomMilieuBase + nomApex}$ de la face latérale $${nomFaceLaterale}$.<br>
            ${calculeHauteurFaceLaterale(cote, hauteur, nomPyramide, 'exacte', nomPied, nomMilieuBase).replace(`${context.isHtml ? orangeMathalea : 'f15929'}`, '000000')}<br>
            Maintenant, calculons l'aire totale de la pyramide $${nomPyramide}$.<br>
            L'aire de la base est égale à :<br>
            $\\text{Aire}_{\\text{base}} = ${texNombre(cote, 0)} \\times ${texNombre(cote, 0)} = ${texNombre(aireBase, 0)}\\text{ cm}^2$<br>
            L'aire d'une face latérale est égale à :<br>
            $\\text{Aire}_{\\text{face latérale}} = ${aireFaceLaterale}\\text{ cm}^2$ soit $${aireFaceLateraleReduite}\\text{ cm}^2$.<br>
            Donc, l'aire totale de la pyramide est égale à :<br>
            $\\text{Aire}_{\\text{totale}} = \\text{Aire}_{\\text{base}} + 4 \\times \\text{Aire}_{\\text{face latérale}}$<br>
            $\\text{Aire}_{\\text{totale}} = ${texNombre(cote * cote, 0)} +  ${aireFacesLaterales}$<br>
            ${
              typeDeReponse.includes('exacte')
                ? ''
                : `$\\text{Aire}_{\\text{totale}} \\approx ${texNombre(
                    cote * cote +
                      2 *
                        cote *
                        Math.sqrt(hauteur * hauteur + (cote * cote) / 4),
                    2,
                  )}\\text{ cm}^2$<br>`
            }
            ${
              typeDeReponse.includes('exacte')
                ? `L'aire totale de la pyramide $${nomPyramide}$ est donc égale à $${miseEnEvidence(
                    `${texNombre(cote * cote, 0)} +  ${aireFacesLaterales}`,
                  )}\\text{ cm}^2$.`
                : `L'aire totale de la pyramide $${nomPyramide}$ est donc ${typeDeReponse.includes('approchée') ? 'environ ' : ''}égale à $${miseEnEvidence(
                    texNombre(
                      Math.round(
                        (cote * cote +
                          2 *
                            cote *
                            Math.sqrt(hauteur * hauteur + (cote * cote) / 4)) *
                          10,
                      ) / 10,
                      1,
                    ),
                  )}\\text{ cm}^2$.`
            }`
  return correction
}

function calculeArete(
  cote: number,
  hauteur: number,
  nomPyramide: string,
  typeDeReponse: string,
  nomPied: string,
): string {
  const nomTriangle = nomPyramide.slice(0, 3)
  // L'arête latérale est l'hypoténuse du triangle rectangle formé par la demi-diagonale
  // de la base (dont le carré vaut 2*cote²/4 = cote²/2) et la hauteur de la pyramide.
  const areteCarree = (cote * cote) / 2 + hauteur * hauteur
  const correction = `${calculeDemiDiagonale(
    cote,
    nomTriangle,
    typeDeReponse,
    nomPied,
  )}
  Maintenant, calculons la longueur de l'arête latérale $${nomPyramide[0]}${nomPyramide[4]}$ de la pyramide $${nomPyramide}$.<br>
  Dans le triangle $${nomPyramide[0]}${nomPied}${nomPyramide[4]}$ rectangle en $${nomPied}$, d'après le théorème de Pythagore :<br>
  $${nomPyramide[0]}${nomPyramide[4]}^2 = ${nomPyramide[0]}${nomPied}^2 + ${nomPied}${nomPyramide[4]}^2$<br>
  $${nomPyramide[0]}${nomPyramide[4]}^2 = \\left(\\dfrac{\\sqrt{${texNombre(2 * cote * cote, 0)}}}{2}\\right)^2 + ${texNombre(hauteur, 0)}^2$<br>
  $${nomPyramide[0]}${nomPyramide[4]}^2 = \\dfrac{${texNombre(2 * cote * cote, 0)}}{4} + ${texNombre(hauteur * hauteur, 0)}$<br>
  $${nomPyramide[0]}${nomPyramide[4]}^2 = ${texNombre((cote * cote) / 2, 1)} + ${texNombre(hauteur * hauteur, 0)}$<br>
  $${nomPyramide[0]}${nomPyramide[4]}^2 = ${texNombre(areteCarree, 1)}$<br>
  Donc :<br>
  $${nomPyramide[0]}${nomPyramide[4]}=\\sqrt{${texNombre(areteCarree, 1)}}${
    typeDeReponse.includes('exacte')
      ? ''
      : `${egalOuApprox(Math.sqrt(areteCarree), 1)}${texNombre(
          Math.sqrt(areteCarree),
          1,
        )}`
  }$<br>
  ${
    typeDeReponse.includes('exacte')
      ? `La longueur de l'arête latérale $${nomPyramide[0]}${nomPyramide[4]}$ est donc égale à $${miseEnEvidence(
          `\\sqrt{${texNombre(areteCarree, 1)}}`,
        )}\\text{ cm}$.`
      : `La longueur de l'arête latérale $${nomPyramide[0]}${nomPyramide[4]}$ est donc ${typeDeReponse.includes('approchée') ? 'environ ' : ''}égale à $${miseEnEvidence(
          texNombre(Math.sqrt(areteCarree), 1),
        )}\\text{ cm}$.`
  }
  `
  return correction
}

function calculeDemiDiagonale(
  cote: number,
  nomTriangle: string,
  typeDeReponse: string,
  nomPied: string,
): string {
  const nomHypotenuse = `${nomTriangle[0]}${nomTriangle[2]}`
  const demiDiag = `${nomTriangle[0]}${nomPied}`
  const correction = `Tout d'abord calculons la longueur $${demiDiag}$ qui est la moitié de la diagonale $${nomHypotenuse}$.<br>
  Dans le triangle $${nomTriangle}$ rectangle en $${nomTriangle[1]}$, d'après le théorème de Pythagore :<br>
  $${nomHypotenuse}^2 = ${nomTriangle.slice(0, 2)}^2 + ${nomTriangle.slice(1)}^2$<br>
  $${nomHypotenuse}^2 = ${texNombre(cote, 0)}^2 + ${texNombre(cote, 0)}^2$<br>
  $${nomHypotenuse}^2 = 2\\times ${texNombre(cote * cote, 0)} = ${texNombre(2 * cote * cote, 0)}$<br>
  Donc :<br>
  $${nomHypotenuse}=\\sqrt{${texNombre(2 * cote * cote, 0)}}\\text{ cm}$<br>
  Ainsi, la moitié de la diagonale $${nomHypotenuse}$ est égale à :<br>
  $${demiDiag}=\\dfrac{1}{2} \\times ${nomHypotenuse} = \\dfrac{\\sqrt{${texNombre(2 * cote * cote, 0)}}}{2}\\text{ cm}$<br>`
  return correction
}

/**
 * @author Jean-claude Lhote
 */
export default class CalculeDansPyramide extends Exercice {
  niveau: number = 4
  constructor() {
    super()
    this.sup = '5'
    this.niveau = 4
    this.spacingCorr = 2
    this.comment =
      "La différence entre valeur approchée et valeur arrondie se situe au niveau de la valeur attendue en interactif. Avec valeur approchée, l'élève peut donner la valeur par excès ou par défaut, tandis qu'avec valeur arrondie, il doit donner la valeur arrondie au dixième le plus proche."
    this.besoinFormulaireTexte = [
      'Type de questions',
      "Nombres séparés par des tirets :\n1 : Calcul de l'arête latérale\n2 : Calcul de la hauteur\n3 : Calcul de la hauteur de la face latérale\n4 Calcul de l'aire totale de la pyramide\n5: Mélange",
    ]

    this.besoinFormulaire2Numerique = [
      'Type de réponse attendue',
      3,
      '1 : Valeur exacte\n2 : Valeur approchée par excès ou par défaut à 0,1 cm près\n3 : Valeur arrondie à 0,1 cm près',
    ]
    this.sup2 = 1
    this.besoinFormulaire3CaseACocher = ["Figure dans l'énoncé", true]
    this.sup3 = true
    this.besoinFormulaire4CaseACocher = ['Figure dans la correction', false]
    this.sup4 = false
    this.nbQuestions = 1
  }

  nouvelleVersion(): void {
    context.anglePerspective = 60
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typeDeReponse =
        this.sup2 === 1
          ? 'Donner la valeur exacte'
          : this.sup2 === 2
            ? 'Donner une valeur approchée à $0{,}1$ cm près'
            : 'Donner la valeur arrondie à $0{,}1$ cm près'

      const nomPyramide = choisitLettresDifferentes(5).join('')
      const nomPied = choisitLettresDifferentes(1, nomPyramide, true)[0]
      const nomApex = nomPyramide.slice(4)
      const nomMilieuBase = choisitLettresDifferentes(
        1,
        nomPyramide + nomPied,
        true,
      )[0]
      const k = randint(1, 4)

      let cote: number = 0
      let hauteur: number = 0
      const typeDeQuestion = listeTypeDeQuestions[i]
      let question = ''
      let correction = ''
      switch (typeDeQuestion) {
        case 4: // Calcul de l'aire totale de la pyramide
          {
            cote = randint(3, 5) * k
            hauteur = randint(4, 6) * k
            const figures = figurePyramideCarree(
              nomPyramide,
              cote,
              hauteur,
              nomPied,
              'hauteur',
              nomMilieuBase,
            )
            question = `Calculer l'aire totale de la pyramide régulière $${nomPyramide}$ dont la base est un carré de $${texNombre(cote, 0)}\\text{ cm}$ et la hauteur mesure $${texNombre(hauteur, 0)}\\text{ cm}$.<br>
            ${typeDeReponse}.`
            question +=
              ajouteQuestionMathlive({
                exercice: this,
                question: i,
                texteApres: ' cm$^2$',
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: {
                    value: typeDeReponse.includes('exacte')
                      ? `${cote * cote} + ${2 * cote}\\sqrt{${(cote * cote) / 4 + hauteur * hauteur}}`
                      : typeDeReponse.includes('approchée')
                        ? [
                            `${(cote * cote + 2 * cote * Math.sqrt(hauteur * hauteur + (cote * cote) / 4)).toFixed(1)}`,
                            `${(cote * cote + 2 * cote * Math.sqrt(hauteur * hauteur + (cote * cote) / 4) + 0.1).toFixed(1)}`,
                          ]
                        : `${texNombre(Math.round((cote * cote + 2 * cote * Math.sqrt(hauteur * hauteur + (cote * cote) / 4)) * 10) / 10, 1)}`,
                  },
                },
                typeInteractivite: 'mathlive',
              }) + (this.sup3 ? `<br>${figures.figureEnonce}<br><br>` : '')
            correction = `${this.sup4 ? `${figures.figureCorrection}<br><br>` : ''}${calculAireTotalePyramide(cote, hauteur, nomPyramide, typeDeReponse, nomPied, nomMilieuBase)}`
          }
          break

        case 3: // Calcul de la hauteur de la face latérale connaissant le côté et la hauteur.
          {
            cote = randint(3, 5) * k
            hauteur = randint(4, 6) * k
            const figures = figurePyramideCarree(
              nomPyramide,
              cote,
              hauteur,
              nomPied,
              'hauteur',
              nomMilieuBase,
            )
            question = `Calculer la hauteur $${nomMilieuBase + nomApex}$ de la face latérale de la pyramide régulière $${nomPyramide}$ dont la base est un carré de $${texNombre(cote, 0)}\\text{ cm}$ et la hauteur mesure $${texNombre(hauteur, 0)}\\text{ cm}$.<br>
            ${typeDeReponse}.`
            question +=
              ajouteQuestionMathlive({
                exercice: this,
                question: i,
                texteApres: '$\\text{ cm}$',
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: {
                    value: typeDeReponse.includes('exacte')
                      ? `\\sqrt{${hauteur * hauteur + (cote * cote) / 4}}`
                      : typeDeReponse.includes('approchée')
                        ? [
                            `${Math.sqrt(hauteur * hauteur + (cote * cote) / 4).toFixed(1)}`,
                            `${(Math.sqrt(hauteur * hauteur + (cote * cote) / 4) + 0.1).toFixed(1)}`,
                          ]
                        : `${texNombre(Math.round(Math.sqrt(hauteur * hauteur + (cote * cote) / 4) * 10) / 10, 1)}`,
                  },
                },
                typeInteractivite: 'mathlive',
              }) + (this.sup3 ? `<br>${figures.figureEnonce}<br><br>` : '')

            correction = `${this.sup4 ? `${figures.figureCorrection}<br><br>` : ''}${calculeHauteurFaceLaterale(cote, hauteur, nomPyramide, typeDeReponse, nomPied, nomMilieuBase)}`
          }
          break
        case 2: // Calcul de la hauteur de la pyramide connaissant le côté.
          {
            cote = randint(3, 5) * k
            hauteur = (cote / k + 1) * k
            const figures = figurePyramideCarree(
              nomPyramide,
              cote,
              hauteur,
              nomPied,
              'arete',
            )
            question = `Calculer la hauteur $${nomPied + nomApex}$ de la pyramide régulière $${nomPyramide}$ dont la base est un carré de $${texNombre(cote, 0)}\\text{ cm}$ et la longueur de l'arête latérale est $${texNombre(hauteur, 0)}\\text{ cm}$.<br>
            ${typeDeReponse}.`
            question +=
              ajouteQuestionMathlive({
                exercice: this,
                question: i,
                texteApres: '$\\text{ cm}$',
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: {
                    value: typeDeReponse.includes('exacte')
                      ? `\\sqrt{${hauteur * hauteur - (cote * cote) / 2}}`
                      : typeDeReponse.includes('approchée')
                        ? [
                            `${Math.sqrt(hauteur * hauteur - (cote * cote) / 2).toFixed(1)}`,
                            `${(Math.sqrt(hauteur * hauteur - (cote * cote) / 2) + 0.1).toFixed(1)}`,
                          ]
                        : `${texNombre(Math.round(Math.sqrt(hauteur * hauteur - (cote * cote) / 2) * 10) / 10, 1)}`,
                  },
                },
                typeInteractivite: 'mathlive',
              }) + (this.sup3 ? `<br>${figures.figureEnonce}<br><br>` : '')

            correction = `${this.sup4 ? `${figures.figureCorrection}<br><br>` : ''}${calculeHauteurPyramide(cote, hauteur, nomPyramide, typeDeReponse, nomPied)}`
          }
          break
        case 1: // Calcul de l'arête latérale connaissant la hauteur.
        default:
          {
            cote = randint(3, 5) * k
            hauteur = (cote / k - 1) * k
            const figures = figurePyramideCarree(
              nomPyramide,
              cote,
              hauteur,
              nomPied,
              'hauteur',
            )
            question =
              `Calculer la mesure de l'arête latérale $${nomPyramide[0] + nomApex}$ de la pyramide régulière $${nomPyramide}$ dont la base est un carré de $${texNombre(cote, 0)}\\text{ cm}$ et la hauteur mesure $${texNombre(hauteur, 0)}\\text{ cm}$.<br>
            ${typeDeReponse}.` +
              ajouteQuestionMathlive({
                exercice: this,
                question: i,
                texteApres: '$\\text{ cm}$',
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: {
                    value: typeDeReponse.includes('exacte')
                      ? `\\sqrt{${(cote * cote) / 2 + hauteur * hauteur}}`
                      : typeDeReponse.includes('approchée')
                        ? [
                            `${Math.sqrt((cote * cote) / 2 + hauteur * hauteur).toFixed(1)}`,
                            `${(Math.sqrt((cote * cote) / 2 + hauteur * hauteur) + 0.1).toFixed(1)}`,
                          ]
                        : `${texNombre(Math.round(Math.sqrt((cote * cote) / 2 + hauteur * hauteur) * 10) / 10, 1)}`,
                  },
                },
                typeInteractivite: 'mathlive',
              }) +
              `<br>${this.sup3 ? `${figures.figureEnonce}<br><br>` : ''}`
            correction =
              (this.sup4 ? '' : `${figures.figureCorrection}<br><br>`) +
              `${calculeArete(cote, hauteur, nomPyramide, typeDeReponse, nomPied)}`
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
    context.anglePerspective = 30
  }
}
