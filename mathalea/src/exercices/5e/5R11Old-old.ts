import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDe,
} from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { sortRandomlyLikeV8 } from '../../lib/outils/arrayOutils'

export const titre = "Lire l'abscisse relative d'un point"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Lire l'abscisse décimale d'un point
 * @author Jean-claude Lhote et Rémi Angot
 */
export const uuid = '4ca10'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

const changeCoord = function (x: number, abs0: number, pas1: number) {
  return abs0 + (x - abs0) * 3 * pas1
}

export default class LireAbscisseRelative extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Niveau de difficulté',
      [
        'Nombres séparés par des tirets :',
        '1 : Nombre relatif entier',
        '2 : Nombre relatif à une décimale',
        '3 : Nombre relatif à deux décimales',
        '4 : Nombre relatif à trois décimales',
        '0 : Mélange',
      ].join('\n'),
    ]

    this.consigne = "Lire l'abscisse de chacun des points suivants."
    this.nbQuestions = 3
    this.sup = '2-3-4'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [
      'entier',
      '1decimale',
      '2decimales',
      '3decimales',
    ]
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
      listeOfCase: typesDeQuestionsDisponibles,
    }) as string[]

    let objets: NestedObjetMathalea2dArray = []

    for (let i = 0; i < this.nbQuestions; i++) {
      objets = []

      const l1 = lettreDepuisChiffre(i * 3 + 1)
      const l2 = lettreDepuisChiffre(i * 3 + 2)
      const l3 = lettreDepuisChiffre(i * 3 + 3)

      let abs0: number
      let pas1: number
      let pas2: number
      let precision: number
      let abs1: number
      let abs2: number
      let abs3: number

      switch (listeTypeDeQuestions[i]) {
        case 'entier': {
          // Nombre relatif entier
          // abs0 ∈ [-5, -2] garantit que 0 et 1 sont tous les deux dans [abs0+1, abs0+6]
          // (abs0+1 ≤ 0 → abs0 ≤ -1 ; abs0+6 ≥ 1 → abs0 ≥ -5)
          abs0 = randint(-5, -2)
          pas1 = 1
          pas2 = 1
          precision = 0
          // Candidats : entiers visibles sur l'axe, hors 0 et 1 (qui servent de repères)
          const candidats = [1, 2, 3, 4, 5, 6]
            .map((d) => abs0 + d)
            .filter((v) => v !== 0 && v !== 1)
          // Tirage de 3 valeurs distinctes, triées
          const choisis = sortRandomlyLikeV8(candidats)
            .slice(0, 3)
            .sort((a, b) => a - b)
          abs1 = choisis[0]
          abs2 = choisis[1]
          abs3 = choisis[2]
          break
        }

        case '1decimale': {
          // Décimaux relatifs à 1 décimale
          abs0 = randint(-6, -3)
          pas1 = 1
          pas2 = 10
          precision = 1
          const x1 = randint(0, 2)
          const x2 = randint(3, 4)
          const x3 = randint(5, 6)
          const x11 = randint(1, 9)
          const x22 = randint(1, 9)
          const x33 = randint(1, 3)
          abs1 = arrondi(abs0 + x1 / pas1 + x11 / pas1 / pas2, precision)
          abs2 = arrondi(abs0 + x2 / pas1 + x22 / pas1 / pas2, precision)
          abs3 = arrondi(abs0 + x3 / pas1 + x33 / pas1 / pas2, precision)
          break
        }

        case '2decimales': {
          // Décimaux relatifs à 2 décimales
          abs0 = randint(-4, -2) / 10
          pas1 = 10
          pas2 = 10
          precision = 2
          const x1 = randint(0, 2)
          const x2 = randint(3, 4)
          const x3 = randint(5, 6)
          const x11 = randint(1, 9)
          const x22 = randint(1, 9)
          const x33 = randint(1, 3)
          abs1 = arrondi(abs0 + x1 / pas1 + x11 / pas1 / pas2, precision)
          abs2 = arrondi(abs0 + x2 / pas1 + x22 / pas1 / pas2, precision)
          abs3 = arrondi(abs0 + x3 / pas1 + x33 / pas1 / pas2, precision)
          break
        }

        case '3decimales':
        default: {
          // Décimaux relatifs à 3 décimales
          abs0 = randint(-6, -2) / 100
          pas1 = 100
          pas2 = 10
          precision = 3
          const x1 = randint(0, 2)
          const x2 = randint(3, 4)
          const x3 = randint(5, 6)
          const x11 = randint(1, 9)
          const x22 = randint(1, 9)
          const x33 = randint(1, 3)
          abs1 = arrondi(abs0 + x1 / pas1 + x11 / pas1 / pas2, precision)
          abs2 = arrondi(abs0 + x2 / pas1 + x22 / pas1 / pas2, precision)
          abs3 = arrondi(abs0 + x3 / pas1 + x33 / pas1 / pas2, precision)
          break
        }
      }

      const estEntier = listeTypeDeQuestions[i] === 'entier'
      objets.push(
        droiteGraduee({
          Unite: 3 * pas1,
          Min: abs0,
          Max: abs0 + 6.9 / pas1,
          x: abs0,
          y: 0,
          thickSecDist: 1 / pas2 / pas1,
          thickSec: pas2 > 1,
          axeEpaisseur: 1,
          thickEpaisseur: 1,
          labelsPrincipaux: !estEntier,
          thickDistance: 1 / pas1,
          ...(estEntier && {
            labelListe: [
              [0, '0'],
              [1, '1'],
            ] as [number, string][],
          }),
        }),
      )

      const A = pointAbstrait(changeCoord(abs1, abs0, pas1), 0, l1, 'above')
      const B = pointAbstrait(changeCoord(abs2, abs0, pas1), 0, l2, 'above')
      const C = pointAbstrait(changeCoord(abs3, abs0, pas1), 0, l3, 'above')
      objets.push(tracePoint(A, B, C))
      objets.push(
        latex2d(A.nom, A.x, A.y + 0.5, {}),
        latex2d(B.nom, B.x, B.y + 0.5, {}),
        latex2d(C.nom, C.x, C.y + 0.5, {}),
      )

      let texte = mathalea2d(
        {
          xmin: abs0 - 0.5,
          xmax: abs0 + 22,
          ymin: -1,
          ymax: 1,
          scale: 0.75,
          zoom: 1.5,
        },
        objets,
      )

      if (!context.isAmc && this.interactif) {
        texte += remplisLesBlancs(
          this,
          i,
          `${l1}(%{champ1})\\quad ${l2}(%{champ2})\\quad ${l3}(%{champ3})`,
          KeyboardType.clavierDeBaseAvecFraction,
          '\\ldots',
        )
        handleAnswers(this, i, {
          bareme: (listePoints) => [
            listePoints[0] + listePoints[1] + listePoints[2],
            3,
          ],
          champ1: { value: String(abs1) },
          champ2: { value: String(abs2) },
          champ3: { value: String(abs3) },
        })
      } else {
        this.autoCorrectionAMC[i] = {
          enonce: '',
          options: { barreseparation: false },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: texte + `<br>Abscisse de ${l1}`,
                    valeur: abs1,
                    param: {
                      digits: nombreDeChiffresDe(abs1),
                      decimals: nombreDeChiffresDansLaPartieDecimale(abs1),
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  multicolsBegin: true,
                  reponse: {
                    texte: `Abscisse de ${l2}`,
                    valeur: abs2,
                    param: {
                      digits: nombreDeChiffresDe(abs2),
                      decimals: nombreDeChiffresDansLaPartieDecimale(abs2),
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  multicolsEnd: true,
                  reponse: {
                    texte: `Abscisse de ${l3}`,
                    valeur: abs3,
                    param: {
                      digits: nombreDeChiffresDe(abs3),
                      decimals: nombreDeChiffresDansLaPartieDecimale(abs3),
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      const texteCorr = mathalea2d(
        {
          xmin: abs0 - 0.5,
          xmax: abs0 + 22,
          ymin: -1.5,
          ymax: 1,
          scale: 0.75,
          zoom: 1.5,
        },
        [
          droiteGraduee({
            Unite: 3 * pas1,
            Min: abs0,
            Max: abs0 + 6.9 / pas1,
            x: abs0,
            y: 0,
            thickSecDist: 1 / pas2 / pas1,
            thickSec: !estEntier,
            axeEpaisseur: 1,
            thickEpaisseur: 1,
            labelsPrincipaux: !estEntier,
            thickDistance: 1 / pas1,
            labelPointTaille: 8,
            labelPointLargeur: 0, // ce paramètre ne sert plus
            labelListe: estEntier
              ? ([
                  [0, '0'],
                  [1, '1'],
                ] as [number, string][])
              : [],
            labelDistance: 0.7,
            labelCustomDistance: 1.2,
          }),
          tracePoint(A, B, C),
          latex2d(A.nom, A.x, A.y + 0.5, {}),
          latex2d(B.nom, B.x, B.y + 0.5, {}),
          latex2d(C.nom, C.x, C.y + 0.5, {}),
          latex2d(texNombre(abs1, precision), A.x, A.y - 1.2, {
            letterSize: 'small',
            color: orangeMathalea,
            gras: true,
          }),
          latex2d(texNombre(abs2, precision), B.x, B.y - 1.2, {
            letterSize: 'small',
            color: orangeMathalea,
            gras: true,
          }),
          latex2d(texNombre(abs3, precision), C.x, C.y - 1.2, {
            letterSize: 'small',
            color: orangeMathalea,
            gras: true,
          }),
        ],
      )

      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this)
  }
}
