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
  "Trouver l'exposant manquant dans des nombres écrits avec des puissances de $10$"
export const dateDePublication = '08/09/2023'
export const amcReady = true
export const amcType = 'qcmMono'

export const interactifReady = true

/**
 * On donne la notation scientifique d'un nombre et on doit trouver l'exposant manquant de 10 dans le membre de gauche.
 * @author Jean-claude Lhote (adapté par Éric Elter)
 */
export const uuid = 'f49ff'

export const refs = {
  'fr-fr': ['2N41-2', 'BP2AutoE3'],
  'fr-ch': ['10LCNO5A-2', '10LSNO5A-2'],
}
export default class CalculsAvecPuissancesDeDixBis extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Facile\n2 : Moyen\n3 : Difficile',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des exposants élevés', false]
    this.sup = 1
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    if (this.interactif) {
      this.consigne =
        this.nbQuestions === 1
          ? "Choisir l'exposant manquant dans l'égalité suivante."
          : "Choisir l'exposant manquant dans les égalités suivantes."
    } else {
      this.consigne =
        this.nbQuestions === 1
          ? "Trouver l'exposant manquant dans l'égalité suivante."
          : "Trouver l'exposant manquant dans les égalités suivantes."
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let decalage = 0
      let mantisse = 0
      let exp = 0

      switch (this.sup - 1) {
        case 0:
          decalage = randint(-1, 1, 0)
          mantisse = randint(1, 9)
          exp = !this.sup2
            ? randint(decalage - 3, decalage + 3, [decalage, 0])
            : choice(
                rangeMinMax(decalage - 4, decalage + 8),
                rangeMinMax(decalage - 2, decalage + 2),
              )
          break
        case 1:
          decalage = randint(-2, 2, 0)
          mantisse = arrondi(randint(11, 99) / 10)
          exp = !this.sup2
            ? randint(decalage - 3, decalage + 3, [decalage, 0])
            : choice(
                rangeMinMax(decalage - 9, decalage + 9),
                rangeMinMax(decalage - 3, decalage + 3),
              )
          break
        case 2:
          decalage = randint(-3, 3, 0)
          if (randint(0, 1) === 1) mantisse = arrondi(randint(111, 999) / 100)
          else mantisse = arrondi((randint(1, 9) * 100 + randint(1, 9)) / 100)
          exp = !this.sup2
            ? randint(decalage - 3, decalage + 3, [decalage, 0])
            : choice(
                rangeMinMax(decalage - 10, decalage + 10),
                rangeMinMax(decalage - 4, decalage + 4),
              )
          break
        /*        case 3:
          decalage = randint(-4, 4, 0)
          if (randint(0, 1) === 1) mantisse = calcul((randint(1, 9) * 1000 + randint(1, 19) * 5) / 1000)
          else mantisse = calcul(randint(1111, 9999) / 1000)
          exp = randint(3, 7, abs(decalage)) * choice([-1, 1])
          break */
      }
      // nombre = calcul(mantisse * 10 ** exp)
      const mantisse1 = arrondi(mantisse * 10 ** decalage)
      const exp1 = exp - decalage

      // decimalstring = `${texNombre(mantisse1)} \\times 10^{${exp1}}`
      const scientifiquestring = `${texNombre(mantisse)} \\times 10^{${exp}}`

      const texteCorr = `$${scientifiquestring}=${miseEnEvidence(texNombre(mantisse1) + `\\times 10^{${-decalage}}`, bleuMathalea)}\\times  10^{${exp}}=${texNombre(mantisse1)} \\times 10^{${miseEnEvidence(-decalage + '+' + ecritureParentheseSiNegatif(exp), bleuMathalea)}}= ${texNombre(mantisse1)} \\times 10^{${miseEnEvidence(exp1)}}$`
      let texte = `$${scientifiquestring}=${texNombre(mantisse1)}\\times 10^{${miseEnEvidence('\\ldots', 'black')}}$`
      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: `$${exp1}$`,
          statut: true,
        },
        {
          texte: `$${exp1 - 1}$`,
          statut: false,
        },
        {
          texte: `$${exp1 + 1}$`,
          statut: false,
        },
        {
          texte: `$${-exp1}$`,
          statut: false,
        },
      ]
      this.autoCorrection[i].options = {
        ordered: false,
        lastChoice: 5,
      }

      const props = propositionsQcm(this, i)
      if (this.interactif) texte += props.texte
      if (this.questionJamaisPosee(i, decalage, mantisse, exp)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
