import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'

import { amcConvert } from '../../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../../lib/amc/amcHelpers'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Calculer avec des puissances'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '8d08f'

export const refs = {
  'fr-fr': ['can3C2-01', '2N43-flash2'],
  'fr-ch': [],
}
export default class CalculPuissanceSimple extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const bases = [2, 3, 5, 7]
    for (
      let i = 0, a, b, c, index, texte, texteCorr;
      i < this.nbQuestions;
      i++
    ) {
      this.autoCorrection[i] = {}
      this.autoCorrectionAMC[i] = {}
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])

      index = randint(0, 3)
      a = bases[index]
      b = randint(20, 50)
      c = [
        ['e double', 'a moitié'],
        ['e triple', 'e tiers'],
        ['e quintuple', 'e cinquième'],
        ['e septuple', 'e septième'],
      ]
      switch (
        choice(['a', 'b', 'c', 'd']) //
      ) {
        case 'a':
          texte =
            `Donner l${c[index][0]} de $${a}^{${b}}$. ` +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            )
          handleAnswers(this, i, {
            reponse: {
              value: [`${a}^{${b + 1}}`],
              options: { texteAvecCasse: true },
            },
          })
          texteCorr = `L${c[index][0]} de $${a}^{${b}}$ se calcule par
       : <br>
       $${a}\\times ${a}^{${b}}=${a}^{${b} + 1}=${miseEnEvidence(`${a}^{${b + 1}}`)}$`
          if (context.isAmc) {
            handleAnswers(this, i, { reponse: { value: a ** (b + 1) } })
            const amcParam = ensureAmcParam(this, i)
            amcParam.basePuissance = a
            amcParam.exposantPuissance = b + 1
            amcParam.baseNbChiffres = 1
            amcParam.exposantNbChiffres = 2
          }
          this.canEnonce = texte
          break
        case 'b':
          texte =
            `Donner l${c[index][1]} de $${a}^{${b}}$. ` +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            )
          handleAnswers(this, i, {
            reponse: {
              value: [`${a}^{${b - 1}}`],
              options: { texteAvecCasse: true },
            },
          })
          texteCorr = `L${c[index][1]} de $${a}^{${b}}$ se calcule par
      : <br>
      
      $ ${a}^{${b}}\\div ${a}=\\dfrac{${a}^{${b}}}{${a}}=${a}^{${b} - 1}=${miseEnEvidence(`${a}^{${b - 1}}`)}$`
          if (context.isAmc) {
            handleAnswers(this, i, { reponse: { value: a ** (b - 1) } })
            const amcParam = ensureAmcParam(this, i)
            amcParam.basePuissance = a
            amcParam.exposantPuissance = b - 1
            amcParam.baseNbChiffres = 1
            amcParam.exposantNbChiffres = 2
          }
          this.canEnonce = texte
          break
        case 'c':
          texte = `Calculer $${a ** 2}\\times ${a}^{${b}}$ `
          if (!context.isAmc) {
            texte +=
              `sous la forme d'une puissance de $${a}$.` +
              ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
              )
          }

          handleAnswers(this, i, {
            reponse: {
              value: [`${a}^{${b + 2}}`],
              options: { texteAvecCasse: true },
            },
          })
          texteCorr = ` Comme $${a ** 2}=${a}^2$, alors $${a ** 2}\\times ${a}^{${b}}=${a}^2\\times ${a}^{${b}}=${a}^{${b}+2}=${miseEnEvidence(`${a}^{${2 + b}}`)}$`
          if (context.isAmc) {
            handleAnswers(this, i, { reponse: { value: a ** (b + 2) } })
            const amcParam = ensureAmcParam(this, i)
            amcParam.basePuissance = a
            amcParam.exposantPuissance = b + 2
            amcParam.baseNbChiffres = 1
            amcParam.exposantNbChiffres = 2
          }
          this.canEnonce = texte
          break
        case 'd':
        default:
          texte = `Calculer $${a}^{${b}}\\div ${a ** 2}$ `
          if (!context.isAmc) {
            texte +=
              `sous la forme d'une puissance de $${a}$.` +
              ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
              )
          }

          handleAnswers(this, i, {
            reponse: {
              value: [`${a}^{${b - 2}}`],
              options: { texteAvecCasse: true },
            },
          })
          texteCorr = `Comme $${a ** 2}=${a}^2$, alors $${a}^{${b}}\\div ${a ** 2}=
        \\dfrac{${a}^{${b}}}{${a}^2}=${a}^{${b}-2}=${miseEnEvidence(`${a}^{${b - 2}}`)}$`
          if (context.isAmc) {
            handleAnswers(this, i, { reponse: { value: a ** (b - 2) } })
            const amcParam = ensureAmcParam(this, i)
            amcParam.basePuissance = a
            amcParam.exposantPuissance = b - 2
            amcParam.baseNbChiffres = 1
            amcParam.exposantNbChiffres = 2
          }
          this.canEnonce = texte
          break
        // this.optionsChampTexte = { texteApres: "(juste l'exposant)" }
      }
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr + '.')
    }
    listeQuestionsToContenu(this)
  }
}
