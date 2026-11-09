import { bleuMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi, rangeMinMax } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Donner le résultat de nombres écrits avec des puissances de $10$ en notation scientifique'
export const dateDeModifImportante = '08/09/2023'
export const amcReady = true
export const amcType = 'qcmMono'

export const interactifReady = true

/**
 * Un nombre est donné par le produit d'un décimal par une puissance de dix, il faut l'écrire en notation scientifique
 * @author Jean-claude Lhote
 */
export const uuid = '762fe'

export const refs = {
  'fr-fr': ['4C32-1', 'BP2AutoF7'],
  'fr-ch': ['10LCNO5B-2', '10LSNO5B-2', 'PRQNO07C-2', 'PRQNO15C-5'],
}
export default class CalculsAvecPuissancesDeDix extends Exercice {
  classe: number
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Facile\n2 : Moyen\n3 : Difficile',
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre avant la puissance de 10',
      3,
      '1 : Plus grand que 1\n2 : Plus petit que 1\n3 : Mélange',
    ]
    this.besoinFormulaire3Numerique = [
      'Signe de la puissance de 10',
      3,
      '1 : Positive\n2 : Négative\n3 : Mélange',
    ]
    this.sup = 1
    this.sup2 = 3
    this.sup3 = 3
    this.nbQuestions = 5
    this.classe = 4
  }

  nouvelleVersion() {
    if (this.interactif) {
      this.consigne =
        this.nbQuestions === 1
          ? 'Choisir la notation scientifique associée au nombre suivant.'
          : 'Choisir la notation scientifique associée à chacun des nombres suivants.'
    } else {
      this.consigne =
        this.nbQuestions === 1
          ? 'Donner la notation scientifique du nombre suivant.'
          : 'Donner la notation scientifique des nombres suivants.'
    }
    // let typeDeQuestionsDisponibles

    for (
      let i = 0,
        texte,
        texteCorr,
        mantisse1,
        exp1,
        decalage,
        mantisse,
        exp,
        decimalstring,
        scientifiquestring,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (this.sup - 1) {
        case 0:
          decalage = randint(-1, 1, 0)
          decalage =
            this.sup2 === 1
              ? Math.abs(decalage)
              : this.sup2 === 2
                ? -Math.abs(decalage)
                : decalage
          mantisse = randint(1, 9)
          break
        case 1:
          decalage = randint(-2, 2, 0)
          decalage =
            this.sup2 === 1
              ? Math.abs(decalage)
              : this.sup2 === 2
                ? -Math.abs(decalage)
                : decalage
          mantisse = arrondi(randint(11, 99) / 10)
          break
        case 2:
        default:
          decalage = randint(-3, 3, 0)
          decalage =
            this.sup2 === 1
              ? Math.abs(decalage)
              : this.sup2 === 2
                ? -Math.abs(decalage)
                : decalage
          if (randint(0, 1) === 1) mantisse = arrondi(randint(111, 999) / 100)
          else mantisse = arrondi((randint(1, 9) * 100 + randint(1, 9)) / 100)
          break
        /*        case 3:
          decalage = randint(-4, 4, 0)
          if (randint(0, 1) === 1) mantisse = calcul((randint(1, 9) * 1000 + randint(1, 19) * 5) / 1000)
          else mantisse = calcul(randint(1111, 9999) / 1000)
          exp = randint(3, 7, abs(decalage)) * choice([-1, 1])
          break */
      }
      exp =
        this.classe === 4
          ? this.sup3 === 1
            ? randint(decalage + 1, decalage + 3, 0)
            : this.sup3 === 2
              ? randint(decalage - 3, decalage - 1, 0)
              : randint(decalage - 3, decalage + 3, [decalage, 0])
          : this.sup3 === 1
            ? randint(
                decalage + 3 + this.sup - 1,
                decalage + 8 + this.sup - 1,
                0,
              )
            : this.sup3 === 2
              ? randint(
                  decalage - 8 - (this.sup - 1),
                  decalage - 2 - (this.sup - 1),
                  [0, decalage],
                )
              : choice(
                  rangeMinMax(
                    decalage - 8 - (this.sup - 1),
                    decalage + 8 + this.sup - 1,
                  ),
                  rangeMinMax(
                    decalage - 2 - (this.sup - 1),
                    decalage + 2 + this.sup - 1,
                  ),
                )
      mantisse1 = arrondi(mantisse * 10 ** decalage)
      exp1 = exp - decalage

      decimalstring = `${texNombre(mantisse1)} \\times 10^{${exp1}}`
      scientifiquestring = `${texNombre(mantisse)} \\times 10^{${exp}}`

      texte = `$${decimalstring}$`
      texteCorr =
        this.classe === 4
          ? `$${decimalstring} = ${texNombre(mantisse1)} \\times ${texNombre(10 ** exp1)} = ${texNombre(mantisse1 * 10 ** exp1)} = ${miseEnEvidence(scientifiquestring)}$`
          : `$${texNombre(mantisse1)} \\times 10^{${exp1}} = ${miseEnEvidence(`${texNombre(mantisse)}\\times 10^{${decalage}}`, bleuMathalea)}\\times  10^{${exp1}} = ${texNombre(mantisse)} \\times 10^{${miseEnEvidence(decalage + '+' + ecritureParentheseSiNegatif(exp1), bleuMathalea)}}=${miseEnEvidence(scientifiquestring)}$`
      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].options = {
        ordered: false,
        lastChoice: 5,
      }
      this.autoCorrection[i].propositions = [
        {
          texte: `$${scientifiquestring}$`,
          statut: true,
        },
        {
          texte: `$${texNombre(mantisse * choice([1, 10, 0.1]))} \\times 10^{${exp - 1}}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(mantisse * choice([1, 0.01, 0.1]))} \\times 10^{${exp + 1}}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(mantisse * 10)} \\times 10^{${exp + randint(0, 1)}}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(mantisse * 0.1)} \\times 10^{${exp + randint(0, 1)}}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(mantisse)} \\times 10^{${-exp}}$`,
          statut: false,
        },
      ]

      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
