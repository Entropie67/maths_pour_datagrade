import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDe,
} from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Lire l'abscisse relative d'un point"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Lire l'abscisse décimale d'un point
 * @author Jean-claude Lhote et Rémi Angot
 */
export const uuid = 'cd7ce'

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
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Nombre relatif à une décimale\n2 : Nombre relatif à deux décimales\n3 : Nombre relatif à trois décimales\n4 : Mélange',
    ]

    this.consigne = "Lire l'abscisse de chacun des points suivants."
    this.nbQuestions = 3

    this.sup = 4
  }

  nouvelleVersion() {
    let typesDeQuestions

    let objets = []

    if (this.sup === 4) {
      typesDeQuestions = combinaisonListes([1, 2, 3], this.nbQuestions)
    } else {
      typesDeQuestions = combinaisonListes(
        [parseInt(this.sup)],
        this.nbQuestions,
      )
    }

    for (
      let i = 0,
        abs0,
        l1,
        l2,
        l3,
        x1,
        x2,
        x3,
        x11,
        x22,
        x33,
        pas1,
        pas2,
        abs1,
        abs2,
        abs3,
        A,
        B,
        C,
        texte,
        texteCorr;
      i < this.nbQuestions;
      i++
    ) {
      objets = []
      let precision
      l1 = lettreDepuisChiffre(i * 3 + 1)
      l2 = lettreDepuisChiffre(i * 3 + 2)
      l3 = lettreDepuisChiffre(i * 3 + 3)
      switch (typesDeQuestions[i]) {
        case 1: // Placer des décimaux relatifs sur un axe (1 décimale)
          abs0 = randint(-6, -3)
          pas1 = 1
          pas2 = 10
          precision = 1
          break

        case 2: // Placer des décimaux relatifs sur un axe (2 décimales)
          abs0 = randint(-4, -2) / 10
          pas1 = 10
          pas2 = 10
          precision = 2
          break

        case 3: // Placer des décimaux relatifs sur un axe (3 décimales)
        default:
          abs0 = randint(-6, -2) / 100
          pas1 = 100
          pas2 = 10
          precision = 3
          break
      }
      x1 = randint(0, 2)
      x2 = randint(3, 4)
      x3 = randint(5, 6)
      x11 = randint(1, 9)
      x22 = randint(1, 9)
      x33 = randint(1, 3)
      abs1 = arrondi(abs0 + x1 / pas1 + x11 / pas1 / pas2, typesDeQuestions[i]) // le type de questions est égal au nombre de décimales.
      abs2 = arrondi(abs0 + x2 / pas1 + x22 / pas1 / pas2, typesDeQuestions[i])
      abs3 = arrondi(abs0 + x3 / pas1 + x33 / pas1 / pas2, typesDeQuestions[i])
      objets.push(
        droiteGraduee({
          Unite: 3 * pas1,
          Min: abs0,
          Max: abs0 + 6.9 / pas1,
          x: abs0,
          y: 0,
          thickSecDist: 1 / pas2 / pas1,
          thickSec: true,
          axeEpaisseur: 1,
          thickEpaisseur: 1,
          labelsPrincipaux: true,
          thickDistance: 1 / pas1,
        }),
      )

      A = pointAbstrait(changeCoord(abs1, abs0, pas1), 0, l1, 'above')
      B = pointAbstrait(changeCoord(abs2, abs0, pas1), 0, l2, 'above')
      C = pointAbstrait(changeCoord(abs3, abs0, pas1), 0, l3, 'above')
      objets.push(tracePoint(A, B, C), labelPoint(A, B, C))

      texte = mathalea2d(
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
        // j'ai aussi omis le paramêtre suivant {formatInteractif: 'fillInTheBlank'}, c'est la fonction verifQuestionMathlive qui va se débrouiller à partir des noms champ1 et suivants
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
      texteCorr = mathalea2d(
        {
          xmin: abs0 - 0.5,
          xmax: abs0 + 22,
          ymin: -1.5,
          ymax: 1,
          scale: 0.75,
          zoom: 1.5,
        },
        droiteGraduee({
          Unite: 3 * pas1,
          Min: abs0,
          Max: abs0 + 6.9 / pas1,
          x: abs0,
          y: 0,
          thickSecDist: 1 / pas2 / pas1,
          thickSec: true,
          axeEpaisseur: 1,
          thickEpaisseur: 1,
          labelsPrincipaux: true,
          thickDistance: 1 / pas1,
          labelPointTaille: 8,
          labelPointLargeur: 0, // ce paramètre ne sert plus
          pointListe: [
            [abs1, l1],
            [abs2, l2],
            [abs3, l3],
          ],
          labelListe: [
            [abs1, texNombre(abs1, precision)],
            [abs2, texNombre(abs2, precision)],
            [abs3, texNombre(abs3, precision)],
          ],
          labelDistance: 0.7,
          labelCustomDistance: 1.2,
        }),
      )
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this)
  }
}
