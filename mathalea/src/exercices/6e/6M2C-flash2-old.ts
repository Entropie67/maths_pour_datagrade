import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer l'aire ou le côté d'un carré"
export const interactifReady = true

export const dateDePublication = '21/04/2023'

export const uuid = '90e79'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 *
 * @author
 */
export default class RelationAireCoteTriangle extends Exercice {
  nbQuestions = 8

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['calculerAire', 'determinerCote']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    const cotes = combinaisonListes(
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      switch (listeTypeQuestions[i]) {
        case 'calculerAire':
          texte = `Quelle est l'aire d'un carré de côté $${cotes[i]}\\text{ cm}$ ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            {
              texteAvant: '<br> $\\mathcal{A} = $',
              texteApres: '$\\text{ cm}^2$',
            },
          )
          handleAnswers(this, i, { reponse: { value: cotes[i] ** 2 } })
          texteCorr = `$\\mathcal{A} = ${cotes[i]}\\text{ cm} \\times ${cotes[i]}\\text{ cm} = ${miseEnEvidence(cotes[i] * cotes[i])}\\text{ cm}^2$`
          break
        case 'determinerCote':
          texte = `Quelle est la longueur du côté d'un carré de $${cotes[i] ** 2}\\text{ cm}^2$ d'aire ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            { texteAvant: '<br> $c = $', texteApres: '$\\text{ cm}$' },
          )
          handleAnswers(this, i, { reponse: { value: cotes[i] } })
          texteCorr = `On sait que $${cotes[i] ** 2}\\text{ cm}^2 = ${cotes[i]}\\text{ cm} \\times ${cotes[i]}\\text{ cm}$.<br>`
          texteCorr += `Donc la longueur du côté du carré est de $${miseEnEvidence(cotes[i])}\\text{ cm}$.`
          break
      }
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
