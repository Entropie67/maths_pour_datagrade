import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
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
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = "Lire l'abscisse relative d'un point"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Clone de 5R11 avec une seule question.
 * @author Stéphane Guyon
 */
export const uuid = 'a9111'

export const refs = {
  'fr-fr': ['2N11-4'],
  'fr-ch': ['9R1NO3A-3', '9R2NO3A-3', '9R3NO3A-3'],
}

const changeCoord = function (x: number, abs0: number, pas1: number) {
  return abs0 + (x - abs0) * 3 * pas1
}

export default class LireAbscisseRelative extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.consigne = "Lire l'abscisse du point suivant."
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let objets: NestedObjetMathalea2dArray = []

    for (let i = 0; i < this.nbQuestions; i++) {
      objets = []

      const l1 = lettreDepuisChiffre(i * 3 + 1)

      let abs0: number
      let pas1: number
      let pas2: number
      let precision: number

      if (randint(0, 1) === 0) {
        // Lecture au centième.
        abs0 = randint(-4, -2) / 10
        pas1 = 10
        pas2 = 10
        precision = 2
      } else {
        // Lecture au millième.
        abs0 = randint(-6, -2) / 100
        pas1 = 100
        pas2 = 10
        precision = 3
      }

      const x1 = randint(0, 6)
      const x11 = x1 === 6 ? randint(1, 3) : randint(1, 9)
      const abs1 = arrondi(abs0 + x1 / pas1 + x11 / pas1 / pas2, precision)
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
          labelsPrincipaux: true,
          thickDistance: 1 / pas1,
        }),
      )

      const A = pointAbstrait(changeCoord(abs1, abs0, pas1), 0, l1, 'above')
      objets.push(tracePoint(A), labelPoint(A))

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
          `${l1}(%{champ1})`,
          KeyboardType.clavierDeBaseAvecFraction,
          '\\ldots',
        )
        handleAnswers(this, i, {
          bareme: (listePoints) => [listePoints[0], 1],
          champ1: { value: String(abs1) },
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
          pointListe: [[abs1, l1]],
          labelListe: [[abs1, texNombre(abs1, precision)]] as [
            number,
            string,
          ][],
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
