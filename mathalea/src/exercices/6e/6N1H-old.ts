import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Lire l'abscisse décimale d'un point"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '31/10/2023'

/**
 * Lire l'abscisse décimale d'un point
 * @author Jean-claude Lhote et Rémi Angot
 */
export const uuid = 'c1888'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}
export default class LireAbscisseDecimale extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Une seule décimale\n2 : Deux décimales \n3 : Trois décimales\n4 : Mélange',
    ]
    this.consigne = "Lire l'abscisse de chacun des points suivants."
    this.nbQuestions = 3

    this.sup = 1
    this.interactif = false
  }

  nouvelleVersion() {
    // numeroExercice est 0 pour l'exercice 1
    let typesDeQuestions

    if (this.sup === 4) {
      typesDeQuestions = combinaisonListes([1, 2, 3], this.nbQuestions)
    } else {
      typesDeQuestions = combinaisonListes([this.sup], this.nbQuestions)
    }

    this.contenu = this.consigne
    for (
      let i = 0,
        d = [],
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
        xA,
        xB,
        xC,
        pas1,
        pas2,
        thick1,
        thick2,
        texte = '',
        texteCorr = '',
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      l1 = lettreDepuisChiffre(i * 3 + 1)
      l2 = lettreDepuisChiffre(i * 3 + 2)
      l3 = lettreDepuisChiffre(i * 3 + 3)
      if (context.isAmc) {
        this.autoCorrection[i] = {
          propositions: [{ texte: '', statut: 4, feedback: '' }],
        }
      }
      switch (typesDeQuestions[i]) {
        case 1: // Placer des décimaux sur un axe (1 décimale)
          abs0 = randint(0, 9)
          pas1 = 1
          pas2 = 10
          break

        case 2: // Placer des décimaux sur un axe (2 décimales)
          abs0 = randint(0, 90) / 10
          pas1 = 10
          pas2 = 10
          break

        case 3: // Placer des décimaux sur un axe (3 décimales)
        default:
          abs0 = randint(0, 990) / 100
          pas1 = 100
          pas2 = 10
          break
      }
      x1 = randint(0, 1)
      x2 = randint(3, 4)
      // x3 = randint(5, 6)
      x3 = 6
      x11 = randint(1, 9)
      x22 = randint(1, 9)
      x33 = randint(1, 9)
      xA = arrondi(x1 + x11 / pas2)
      xB = arrondi(x2 + x22 / pas2)
      xC = arrondi(x3 + x33 / pas2)
      thick1 = randint(0, 3)
      thick2 = randint(2, 6, thick1)
      d[2 * i] = droiteGraduee({
        Unite: 4,
        Min: 0,
        Max: 7.1,
        axeStyle: '->',
        pointTaille: 5,
        pointStyle: 'x',
        labelsPrincipaux: false,
        thickSec: true,
        thickSecDist: 1 / pas2,
        labelListe: [
          [
            thick1,
            `${stringNombre(abs0 + thick1 / pas1, 1 + Math.log10(pas1))}`,
          ],
          [
            thick2,
            `${stringNombre(abs0 + thick2 / pas1, 1 + Math.log10(pas1))}`,
          ],
        ],
        pointListe: [
          [xA, l1],
          [xB, l2],
          [xC, l3],
        ],
        labelCustomDistance: 1,
      })
      d[2 * i + 1] = droiteGraduee({
        Unite: 4,
        Min: 0,
        Max: 7.1,
        axeStyle: '->',
        pointTaille: 5,
        pointStyle: 'x',
        labelsPrincipaux: false,
        thickSec: true,
        thickSecDist: 1 / pas2,
        labelListe: [
          // [0, `${stringNombre(abs0)}`],
          [
            xA,
            `\\boldsymbol{${texNombre(xA / pas1 + abs0, 1 + Math.log10(pas1))}}`,
          ],
          [
            xB,
            `\\boldsymbol{${texNombre(xB / pas1 + abs0, 1 + Math.log10(pas1))}}`,
          ],
          [
            xC,
            `\\boldsymbol{${texNombre(xC / pas1 + abs0, 1 + Math.log10(pas1))}}`,
          ],
        ],
        labelColor: orangeMathalea,
        labelDistance: 1.5,
        pointListe: [
          [xA, l1],
          [xB, l2],
          [xC, l3],
        ],
        labelCustomDistance: 1,
      })

      texte = mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: 0.5 },
          fixeBordures([d[2 * i]]),
        ),
        d[2 * i],
      )
      texteCorr = mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: 0.5 },
          fixeBordures([d[2 * i + 1]]),
        ),
        d[2 * i + 1],
      )

      if (this.interactif && context.isHtml) {
        handleAnswers(
          this,
          3 * i,
          {
            reponse: { value: arrondi(xA / pas1 + abs0, 1 + Math.log10(pas1)) },
          },
          { formatInteractif: 'mathlive' },
        )
        handleAnswers(
          this,
          3 * i + 1,
          {
            reponse: { value: arrondi(xB / pas1 + abs0, 1 + Math.log10(pas1)) },
          },
          { formatInteractif: 'mathlive' },
        )
        handleAnswers(
          this,
          3 * i + 2,
          {
            reponse: { value: arrondi(xC / pas1 + abs0, 1 + Math.log10(pas1)) },
          },
          { formatInteractif: 'mathlive' },
        )
        texte +=
          `<br><br>$${l1}$` +
          sp(1) +
          ajouteChampTexteMathLive(this, 3 * i, KeyboardType.clavierNumbers)
        texte +=
          sp(6) +
          `$${l2}$` +
          sp(1) +
          ajouteChampTexteMathLive(this, 3 * i + 1, KeyboardType.clavierNumbers)
        texte +=
          sp(6) +
          `$${l3}$` +
          sp(1) +
          ajouteChampTexteMathLive(this, 3 * i + 2, KeyboardType.clavierNumbers)
      } else {
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: texte,
            propositions: [
              {
                texte: texteCorr,
                statut: 1,
                sanscadre: false,
                pointilles: true,
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
      }
      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
