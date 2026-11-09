import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer l'aire ou le côté d'un carré"
export const interactifReady = true

export const dateDePublication = '21/04/2023'

export const uuid = '90e7a'
export const refs = {
  'fr-fr': ['6M2C-flash2'],
  'fr-ch': ['10CTGM1D-2', '10LCGM1D-2', '10LSGM1D-2', '11CTGM1F-2', '11LCGM1F-2', '11LSGM1F-2'],
}
/**
 *
 * @author
 */
export default class RelationAireCoteCarre extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '3'
    this.besoinFormulaireTexte = [
      'Types de question',
      "Nombre séparés par des tirets\n1: Calculer l'aire\n2: Déterminer le côté\n3: Mélange",
    ]
  }

  nouvelleVersion() {
    this.nbQuestions = Math.min(18, this.nbQuestions)
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['calculerAire', 'determinerCote'],
    }).map(String)

    const cotes = combinaisonListes(
      [2, 3, 4, 5, 6, 7, 8, 9, 10],
      this.nbQuestions,
    )
    const cotesDisponiblesForAire = [2, 3, 4, 5, 6, 7, 8, 9, 10]
    const cotesDisponiblesForCote = [2, 3, 4, 5, 6, 7, 8, 9, 10]
    for (let i = 0; i < this.nbQuestions; i++) {
      if (listeTypeQuestions[i] === 'calculerAire') {
        const index = Math.floor(Math.random() * cotesDisponiblesForAire.length)
        cotes[i] = cotesDisponiblesForAire[index]
        cotesDisponiblesForAire.splice(index, 1)
      } else if (listeTypeQuestions[i] === 'determinerCote') {
        const index = Math.floor(Math.random() * cotesDisponiblesForCote.length)
        cotes[i] = cotesDisponiblesForCote[index]
        cotesDisponiblesForCote.splice(index, 1)
      }
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
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
      if (this.questionJamaisPosee(i, listeTypeQuestions[i], cotes[i])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
