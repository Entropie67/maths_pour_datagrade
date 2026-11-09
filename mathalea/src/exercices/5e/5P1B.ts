import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer des variations en pourcentages'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '16/08/2021'
/**
 * Calculer +/- 20, 30, 40 ou 60 %
 * @author Rémi Angot
 * Rendre l'exercice interactif Laurence Candille
 */
export const uuid = 'b2c55'

export const refs = {
  'fr-fr': ['5P1B', 'BP2AutoB5', 'BP2CCF13'],
  'fr-2016': ['5N110', 'BP2AutoB5', 'BP2CCF13'],
  'fr-ch': ['10CTFA1E-2', '10LCFA1E-2', '10LSFA1E-2', 'PRQPF05B-5'],
}
export default class VariationEnPourcentages extends Exercice {
  constructor() {
    super()

    this.consigne = 'Calculer le nouveau prix.'
    this.nbQuestions = 5

    this.spacingCorr = 2

  }

  nouvelleVersion() {
    let reponse
    for (
      let i = 0, prix, taux, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      prix = choice([
        randint(2, 9),
        randint(1, 9) * 10,
        randint(1, 9) * 100,
        randint(11, 99) / 10,
      ])
      // X | X0 | X00 | X,X0
      taux = choice([20, 30, 40, 60])
      if (choice([true, false])) {
        reponse = (prix * (100 - taux)) / 100
        if (context.isHtml) {
          // partie html
          texte = `Un article coûtait $${texPrix(prix)}$ € et son prix diminue de $${taux}\\, \\%$.<br><br>`
          if (this.interactif) {
            texte += '&ensp;&ensp;&ensp;&ensp;Le nouveau prix est :'
            texte +=
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                texteApres: '€',
              }) + '<br>'
          }
        } else {
          // partie latex
          texte = `Un article coûtait $${texPrix(prix)}$ € et son prix diminue de $${taux}\\, \\%$.<br><br>`
        }

        texteCorr = `$\\text{Diminution : }${texFractionFromString(taux, 100)}\\times  ${texPrix(prix)} = ${texPrix(prix * taux)}\\div 100=${texPrix((prix * taux) / 100)}$ €`
        texteCorr += '<br>'
        texteCorr += `$\\text{Nouveau prix : }${texPrix(prix)}-${texPrix((prix * taux) / 100)}=${texPrix(prix - (prix * taux) / 100)}$`
      } else {
        reponse = (prix * (100 + taux)) / 100
        if (context.isHtml) {
          // partie html
          texte = `Un article coûtait $${texPrix(prix)}$ € et son prix augmente de $${taux}\\ \\%$.<br><br>`
          if (this.interactif) {
            texte += '&ensp;&ensp;&ensp;&ensp;Le nouveau prix est :'
            texte +=
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                texteApres: '€',
              }) + '<br>'
          }
        } else {
          // partie latex
          texte = `Un article coûtait $${texPrix(prix)}$ € et son prix augmente de $${taux}\\, \\%$.<br><br>`
        }
        texteCorr = `$\\text{Augmentation : }${texFractionFromString(taux, 100)}\\times  ${texPrix(prix)}= ${texPrix(prix * taux)}\\div 100=${texPrix((prix * taux) / 100)}$ €`
        texteCorr += '<br>'
        texteCorr += `$\\text{Nouveau prix : }${texPrix(prix)}+${texPrix((prix * taux) / 100)}=${texPrix(prix * (1 + taux / 100))}$`
      }
      handleAnswers(this, i, { reponse: { value: reponse.toFixed(2) } })
      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation
      texteCorr += ' €'

      if (this.questionJamaisPosee(i, taux, prix, reponse)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
