// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 9aeec continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { labelPoint } from '../../lib/2d/textes'
import { cone3d } from '../../lib/3d/3dProjectionMathalea2d/Cone3dPerspectiveCavaliere'
import {
  arete3d,
  CodageAngleDroit3D,
  point3d,
  vecteur3d,
} from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer dans un cône de révolution'
export const dateDePublication = '13/06/2026'
export const interactifReady = true

export const uuid = '9aeec'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

function figureCone(
  nomSommet: string,
  rayon: number,
  hauteurOuGeneratrice: number,
  nomPied: string,
  afficheQuelleLongueur: 'hauteur' | 'generatrice',
  nomCentreBase?: string,
): { figureEnonce: string; figureCorrection: string } {
  const scale = 0.6 // le scale pour la sortie latex
  const O = point3d(0, 0, 0, true, nomCentreBase, 'below left')
  const S = point3d(0, 0, 7, true, nomSommet, 'above right')
  const P = point3d(
    7 * Math.cos(Math.PI / 6),
    7 * Math.sin(Math.PI / 6),
    0,
    true,
    nomPied,
    'right',
  )
  const Q = point3d(-7, 0, 0, true)
  const SO = arete3d(S, O, 'black', false)
  const OP = arete3d(O, P, 'black', false)
  const labels = labelPoint(S.c2d, P.c2d)
  const leCone = cone3d(
    O,
    S,
    vecteur3d(O, P),
    'black',
    true,
    'black',
    'none',
    true,
    true,
  )

  const afficheHauteurOuGeneratrice =
    afficheQuelleLongueur === 'hauteur'
      ? placeLatexSurSegment(
          `${texNombre(hauteurOuGeneratrice, 0)}\\text{ cm}`,
          S.c2d,
          O.c2d,
          { distance: 0.3, letterSize: 'small', horizontal: false },
        )
      : placeLatexSurSegment(
          `${texNombre(hauteurOuGeneratrice, 0)}\\text{ cm}`,
          S.c2d,
          P.c2d,
          { distance: 0.5, letterSize: 'small', horizontal: false },
        )
  const afficheRayon = placeLatexSurSegment(
    `${texNombre(rayon, 1)}\\text{ cm}`,
    P.c2d,
    O.c2d,
    { distance: 0.3, letterSize: 'small', horizontal: false },
  )
  const angledroit1 = new CodageAngleDroit3D(S, O, P, 'red', 1.5)
  const objets = [
    leCone.c2d,
    angledroit1,
    afficheHauteurOuGeneratrice,
    SO.c2d,
    OP.c2d,
    labels,
    afficheRayon,
  ]

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

function calculeHauteurCone(
  rayon: number,
  generatrice: number,
  noms: string,
  typeDeReponse: string,
): string {
  const nomSommet = noms[0]
  const nomCentreBase = noms[1]
  const nomPied = noms[2]
  const nomHypotenuse = nomSommet + nomPied
  const nomRayon = nomCentreBase + nomPied
  const nomHauteur = nomCentreBase + nomSommet
  const nomTriangleRectangle = nomSommet + nomCentreBase + nomPied
  const correction = `Calculons la hauteur $${nomHauteur}$ du cône de sommet $${nomSommet}$ et de génératrice $[${nomHypotenuse}]$.<br>
  Dans le triangle $${nomTriangleRectangle}$ rectangle en $${nomCentreBase}$, d'après le théorème de Pythagore :<br>
  $${nomHypotenuse}^2 = ${nomRayon}^2 + ${nomHauteur}^2$<br>
  $${texNombre(generatrice, 0)}^2 = ${texNombre(rayon, 1)}^2 + ${nomHauteur}^2$<br>
  $${texNombre(generatrice * generatrice, 0)} =${texNombre(rayon * rayon, 2)} + ${nomHauteur}^2$<br>
  Donc :<br>
  $${nomHauteur}^2 = ${texNombre(generatrice * generatrice, 0)} - ${texNombre(rayon * rayon, 2)}$<br>
  $${nomHauteur}^2 = ${texNombre(generatrice * generatrice - rayon * rayon, 2)}$<br>
  Donc :<br>
  $${nomHauteur}=\\sqrt{${texNombre(generatrice * generatrice - rayon * rayon, 2)}}${
    typeDeReponse.includes('exacte')
      ? ''
      : `${egalOuApprox(Math.sqrt(generatrice * generatrice - rayon * rayon), 2)}${texNombre(
          Math.sqrt(generatrice * generatrice - rayon * rayon),
          1,
        )}`
  }$<br>
  ${
    typeDeReponse.includes('exacte')
      ? `La hauteur $${nomHauteur}$ du cône est donc égale à $${miseEnEvidence(
          `\\sqrt{${texNombre(generatrice * generatrice - rayon * rayon, 2)}}`,
        )}\\text{ cm}$.`
      : `La hauteur $${nomHauteur}$ du cône est donc ${typeDeReponse.includes('approchée') ? 'environ ' : ''}égale à $${miseEnEvidence(
          texNombre(Math.sqrt(generatrice * generatrice - rayon * rayon), 1),
        )}\\text{ cm}$.`
  }
 `

  return correction
}

function calculeGeneratrice(
  rayon: number,
  hauteur: number,
  noms: string,
  typeDeReponse: string,
): string {
  const nomSommet = noms[0]
  const nomCentreBase = noms[1]
  const nomPied = noms[2]
  const nomHypotenuse = nomSommet + nomPied
  const nomRayon = nomCentreBase + nomPied
  const nomHauteur = nomCentreBase + nomSommet
  const nomTriangleRectangle = nomSommet + nomCentreBase + nomPied
  const correction = `Calculons la longueur de la génératrice $[${nomHypotenuse}]$.<br>
  Dans le triangle $${nomTriangleRectangle}$ rectangle en $${nomCentreBase}$, d'après le théorème de Pythagore :<br>
  $${nomHypotenuse}^2 = ${nomRayon}^2 + ${nomHauteur}^2$<br>
  $${nomHypotenuse}^2 = ${texNombre(rayon, 1)}^2 + ${texNombre(hauteur, 0)}^2$<br>
  $${nomHypotenuse}^2 = ${texNombre(rayon * rayon, 2)} + ${texNombre(hauteur * hauteur, 0)}$<br>
  $${nomHypotenuse}^2 = ${texNombre(rayon * rayon + hauteur * hauteur, 2)}$<br>
  Donc :<br>
  $${nomHypotenuse}=${
    typeDeReponse.includes('exacte')
      ? `${miseEnEvidence(`\\sqrt{${texNombre(rayon * rayon + hauteur * hauteur, 2)}}`)}\\text{ cm}`
      : `\\sqrt{${texNombre(rayon * rayon + hauteur * hauteur, 2)}}${egalOuApprox(Math.sqrt(hauteur * hauteur + rayon * rayon), 1)}${miseEnEvidence(texNombre(Math.sqrt(hauteur * hauteur + rayon * rayon), 1))}\\text{ cm}`
  }$<br>
 `

  return correction
}

/**
 * @author Jean-claude Lhote
 */
export default class CalculeDansConeOld extends Exercice {
  niveau: number = 4
  constructor() {
    super()
    this.sup = '3'
    this.niveau = 4
    this.spacingCorr = 2
    this.comment =
      "La différence entre valeur approchée et valeur arrondie se situe au niveau de la valeur attendue en interactif. Avec valeur approchée, l'élève peut donner la valeur par excès ou par défaut, tandis qu'avec valeur arrondie, il doit donner la valeur arrondie au dixième le plus proche."
    this.besoinFormulaireTexte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Calcul de la hauteur\n2 : Calcul de la génératrice\n3: Mélange',
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
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typeDeReponse =
        this.sup2 === 1
          ? 'Donner la valeur exacte'
          : this.sup2 === 2
            ? 'Donner une valeur approchée à 0,1 cm près'
            : 'Donner la valeur arrondie à 0,1 cm près'

      const noms = choisitLettresDifferentes(3).join('')
      const k = randint(1, 4)

      let generatrice: number = 0
      let hauteur: number = 0
      let rayon: number = 0
      const typeDeQuestion = listeTypeDeQuestions[i]
      let question = ''
      let correction = ''
      switch (typeDeQuestion) {
        case 1: // Calcul de la hauteur du cône connaissant la génératrice et le rayon.
          {
            generatrice = randint(3, 5) * k
            rayon = (generatrice / (k + 1)) * k
            hauteur = Math.sqrt(generatrice * generatrice - rayon * rayon)
            const figures = figureCone(
              noms[0],
              rayon,
              generatrice,
              noms[2],
              'generatrice',
              noms[1],
            )
            question = `Calculer la hauteur $${noms.slice(0, 2)}$ du cône de sommet $${noms[0]}$, de génératrice $[${noms[0] + noms[2]}]$ de longueur $${texNombre(generatrice, 1)}\\,\\text{cm}$ et de rayon $${noms[1] + noms[2]}=${texNombre(rayon, 1)}\\,\\text{cm}$.<br>
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
                      ? `\\sqrt{${texNombre(generatrice * generatrice - rayon * rayon)}}`
                      : typeDeReponse.includes('approchée')
                        ? [
                            `${Math.sqrt(generatrice * generatrice - rayon * rayon).toFixed(1)}`,
                            `${(Math.sqrt(generatrice * generatrice - rayon * rayon) + 0.1).toFixed(1)}`,
                          ]
                        : `${texNombre(Math.round(Math.sqrt(generatrice * generatrice - rayon * rayon) * 10) / 10, 1)}`,
                  },
                },
                typeInteractivite: 'mathlive',
              }) + (this.sup3 ? `<br>${figures.figureEnonce}<br><br>` : '')

            correction = `${this.sup4 ? `${figures.figureCorrection}<br><br>` : ''}${calculeHauteurCone(rayon, generatrice, noms, typeDeReponse)}`
          }
          break
        case 2: // Calcul de la génératrice connaissant hauteur et rayon.
        default:
          {
            hauteur = randint(3, 5) * k
            rayon = (hauteur / k - 1) * k

            const figures = figureCone(
              noms[0],
              rayon,
              hauteur,
              noms[2],
              'hauteur',
              noms[1],
            )
            question = `Calculer la longueur de la génératrice $[${noms[0] + noms[2]}]$ du cône de sommet $${noms[0]}$ de hauteur $${noms[1] + noms[0]}=${texNombre(hauteur, 1)}\\,\\text{cm}$ et de rayon $${noms[1] + noms[2]}=${texNombre(rayon, 1)}\\,\\text{cm}$.<br>
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
                      ? `\\sqrt{${texNombre(hauteur * hauteur + rayon * rayon)}}`
                      : typeDeReponse.includes('approchée')
                        ? [
                            `${Math.sqrt(hauteur * hauteur + rayon * rayon).toFixed(1)}`,
                            `${(Math.sqrt(hauteur * hauteur + rayon * rayon) + 0.1).toFixed(1)}`,
                          ]
                        : `${texNombre(Math.round(Math.sqrt(hauteur * hauteur + rayon * rayon) * 10) / 10, 1)}`,
                  },
                },
                typeInteractivite: 'mathlive',
              }) + (this.sup3 ? `<br>${figures.figureEnonce}<br><br>` : '')

            correction = `${this.sup4 ? `${figures.figureCorrection}<br><br>` : ''}${calculeGeneratrice(rayon, hauteur, noms, typeDeReponse)}`
          }
          break
      }
      if (
        this.questionJamaisPosee(
          i,
          typeDeQuestion + String(rayon) + String(generatrice),
        )
      ) {
        this.listeQuestions.push(question)
        this.listeCorrections.push(correction)
        i++
      }
      cpt++
    }
    context.anglePerspective = 30
  }
}
