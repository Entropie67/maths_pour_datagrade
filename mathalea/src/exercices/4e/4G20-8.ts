import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { rotation } from '../../lib/2d/transformations'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { RedactionPythagore } from './_pythagore'

export const titre =
  'Calculer mentalement une longueur avec le théorème de Pythagore'
export const dateDePublication = '05/10/2024'
export const dateDeModifImportante = '21/08/2026'
export const interactifReady = true

export const uuid = '6dc46'
export const refs = {
  'fr-fr': ['4G20-8', 'BP2AutoR3'],
  'fr-ch': ['10LCGM3A-4', '10LSGM3A-4', '11CTGM2A-4', 'PRQMG03A-4'],
}

/** Longueur maximale d'un côté proposée par défaut (carrés de 1 à 15). */
const LONGUEUR_MAX_DEFAUT = 15

/**
 * Trace le triangle rectangle en son premier sommet, à l'échelle, et place les
 * longueurs connues sur les côtés concernés.
 * @param noms Noms des sommets, celui de l'angle droit en premier
 * @param longueurAB Longueur du côté de l'angle droit porté par les deux premiers sommets
 * @param longueurAC Longueur de l'autre côté de l'angle droit
 * @param labels Textes à placer sur $[AB]$, $[AC]$ et $[BC]$, une chaîne vide pour un côté sans indication
 */
function figureTriangleRectangle(
  noms: [string, string, string],
  longueurAB: number,
  longueurAC: number,
  labels: [string, string, string],
): string {
  // Les longueurs peuvent aller jusqu'à plusieurs dizaines : on ramène le plus
  // grand côté de l'angle droit à 9 pour que la figure garde une taille lisible.
  const facteur = 9 / Math.max(longueurAB, longueurAC)
  const origine = pointAbstrait(0, 0)
  const triangle = rotation(
    polygone(
      origine,
      pointAbstrait(longueurAB * facteur, 0),
      pointAbstrait(0, longueurAC * facteur),
    ),
    origine,
    randint(0, 360),
  )
  const [A, B, C] = triangle.listePoints
  const objets: NestedObjetMathalea2dArray = [
    triangle,
    nommePolygone(triangle, noms.join('')),
    codageAngleDroit(B, A, C),
  ]
  const cotes = [
    [B, A],
    [A, C],
    [C, B],
  ]
  for (const [k, label] of labels.entries()) {
    if (label !== '') {
      // const G = centreGraviteTriangle(A,B,C)

      objets.push(
        placeLatexSurSegment(label, cotes[k][0], cotes[k][1], {
          distance: 0.6,
          letterSize: 'small',
        }),
      )
    }
  }
  return mathalea2d(
    Object.assign(
      { scale: 0.6, display: 'block' as const },
      fixeBordures(objets),
    ),
    objets,
  )
}

/**
 * Calcul mental utilisant les carrés de 1 à 15 avec le théorème de Pythagore
 * @author Mireille Gain
 */
export default class CalculMentalPythagore extends Exercice {
  constructor() {
    super()
    this.consigne =
      'Calculer la longueur demandée sous forme de racine carrée, puis de la partie entière du résultat.'
    this.nbQuestions = 2 // Ligne obligatoire ? Indique le nombre de questions affiché à l'ouverture de l'exercice
    this.spacing = 1.5 // Indique l'espace entre les lignes dans un exercice. C'est 1 par défaut, si cette ligne est absente.
    this.spacingCorr = 1.5
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Recherche de côtés',
      3,
      "1 : Hypoténuse\n2 : Côtés de l'angle droit\n3 : Mélange",
    ]
    this.sup2 = LONGUEUR_MAX_DEFAUT
    this.besoinFormulaire2Numerique = ["Longueur maximale d'un côté", 99]
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ["Figure dans l'énoncé", false]
    this.sup4 = false
    this.besoinFormulaire4CaseACocher = [
      'Écrire les unités dans les calculs de la correction',
      false,
    ]
  }

  nouvelleVersion() {
    // Triangle ABC rectangle en A
    const typeQuestionsDisponibles =
      this.sup === 1
        ? ['hypotenuse']
        : this.sup === 2
          ? ['coteAngleDroit']
          : ['hypotenuse', 'coteAngleDroit']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    // Les trois plages se déduisent de la longueur maximale et redonnent les
    // valeurs historiques (2 à 5, 6 à 9 et 10 à 15) quand ce maximum vaut 15.
    const longueurMax = Math.max(6, Number(this.sup2) || LONGUEUR_MAX_DEFAUT)
    const limitePetiteLongueur = Math.round(longueurMax / 3)
    const limiteMoyenneLongueur = Math.round(longueurMax * 0.6)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const AB = randint(2, limitePetiteLongueur)
      const AC = randint(limitePetiteLongueur + 1, limiteMoyenneLongueur)
      const BC = randint(limiteMoyenneLongueur + 1, longueurMax)
      const choixA = randint(1, 26, [17, 15])
      const choixB = randint(1, 26, [17, 15, choixA])
      const choixC = randint(1, 26, [17, 15, choixA, choixB])
      const sommetA = lettreDepuisChiffre(choixA)
      const sommetB = lettreDepuisChiffre(choixB)
      const sommetC = lettreDepuisChiffre(choixC)

      // Le côté cherché : l'hypoténuse [BC], ou l'un des deux côtés de l'angle droit.
      const coteCherche =
        listeTypeQuestions[i] === 'coteAngleDroit' ? choice(['AB', 'AC']) : 'BC'

      let nomCherche: string
      let carreCherche: number
      let texteEnonce: string
      // La figure n'est construite qu'à la demande : elle consomme du hasard
      // pour son orientation et n'a pas de raison d'être calculée sinon.
      let figure: () => string
      let redaction: string[]
      switch (coteCherche) {
        case 'AB':
          // Sont connus le côté [AC] de l'angle droit et l'hypoténuse [BC].
          nomCherche = sommetA + sommetB
          carreCherche = BC ** 2 - AC ** 2
          texteEnonce = `On considère le triangle $${sommetA}${sommetB}${sommetC}$ rectangle en $${sommetA}$ tel que $${sommetA}${sommetC} = ${AC}\\text{ cm}$ et $${sommetB}${sommetC} = ${BC}\\text{ cm}$. <br>Calculer $${nomCherche}$.<br>`
          figure = () =>
            figureTriangleRectangle(
              [sommetA, sommetB, sommetC],
              Math.sqrt(BC ** 2 - AC ** 2),
              AC,
              ['', `${AC}\\text{ cm}`, `${BC}\\text{ cm}`],
            )
          redaction = RedactionPythagore(
            sommetA,
            sommetB,
            sommetC,
            2,
            Math.floor(Math.sqrt(carreCherche)),
            AC,
            BC,
            'cm',
            undefined,
            this.sup4,
            undefined,
            undefined,
            !this.interactif,
          )
          break

        case 'AC':
          // Sont connus le côté [AB] de l'angle droit et l'hypoténuse [BC].
          nomCherche = sommetA + sommetC
          carreCherche = BC ** 2 - AB ** 2
          texteEnonce = `On considère le triangle $${sommetA}${sommetB}${sommetC}$ rectangle en $${sommetA}$ tel que $${sommetA}${sommetB} = ${AB}\\text{ cm}$ et $${sommetB}${sommetC} = ${BC}\\text{ cm}$.<br> Calculer $${nomCherche}$.<br>`
          figure = () =>
            figureTriangleRectangle(
              [sommetA, sommetB, sommetC],
              AB,
              Math.sqrt(BC ** 2 - AB ** 2),
              [`${AB}\\text{ cm}`, '', `${BC}\\text{ cm}`],
            )
          redaction = RedactionPythagore(
            sommetA,
            sommetC,
            sommetB,
            2,
            Math.floor(Math.sqrt(carreCherche)),
            AB,
            BC,
            'cm',
            undefined,
            this.sup4,
            undefined,
            undefined,
            !this.interactif,
          )
          break

        // case 'BC'
        default:
          // Sont connus les deux côtés [AB] et [AC] de l'angle droit.
          nomCherche = sommetB + sommetC
          carreCherche = AB ** 2 + AC ** 2
          texteEnonce = `On considère le triangle $${sommetA}${sommetB}${sommetC}$ rectangle en $${sommetA}$ tel que $${sommetA}${sommetB} = ${AB}\\text{ cm}$ et $${sommetA}${sommetC} = ${AC}\\text{ cm}$.<br> Calculer $${nomCherche}$.<br>`
          figure = () =>
            figureTriangleRectangle([sommetA, sommetB, sommetC], AB, AC, [
              `${AB}\\text{ cm}`,
              `${AC}\\text{ cm}`,
              '',
            ])
          redaction = RedactionPythagore(
            sommetA,
            sommetB,
            sommetC,
            1,
            AB,
            AC,
            Math.floor(Math.sqrt(carreCherche)),
            'cm',
            undefined,
            this.sup4,
            undefined,
            undefined,
            !this.interactif,
          )
          break
      }

      let texte = this.sup3
        ? `${figure()}Calculer $${nomCherche}$.<br>`
        : texteEnonce
      if (this.interactif) {
        texte += addMultiMathfield(this, i, {
          dataTemplate: `$${nomCherche}=$ %{champ1} $\\text{cm}$ (Racine carrée)
    $${nomCherche} \\approx$ %{champ2} $\\text{cm}$ (Partie entière)`,
          dataOptions: {
            // `ldots` place des pointillés là où la réponse est attendue quand
            // l'exercice n'est pas interactif.
            champ1: {
              keyboard: KeyboardType.clavierFullOperations,
              ldots: true,
            },
            champ2: { keyboard: KeyboardType.clavierNumbers, ldots: true },
          },
        })
      }

      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          champ1: { value: `\\sqrt{${carreCherche}}` },
          champ2: { value: String(Math.floor(Math.sqrt(carreCherche))) },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      if (this.questionJamaisPosee(i, AB, BC, AC, coteCherche)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = redaction[0] ?? ''
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
