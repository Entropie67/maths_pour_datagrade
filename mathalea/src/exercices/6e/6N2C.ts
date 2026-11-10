import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

export const titre = 'Diviser par $10$, $100$, $1\\,000$ revient à …'
export const dateDePublication = '07/06/2025'

/**
 * Diviser par 10, 100, 1 000 revient à ....
 * @author Éric Elter
 */
export const uuid = '795b9'
export const refs = {
  'fr-fr': ['6N2C', '6AutoN4-1'],
  'fr-2016': ['6C30-10'],
  'fr-ch': ['9R1NO6F-5', '9R2NO6F-5', '9R3NO6F-5'],
}

export default class DiviserPar10 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      "Choix de l'opération",
      `Nombres séparés par des tirets :
    1 : Diviser par ... revient à ...
    2 : Multiplier par ... revient à ...
    3 : Mélange`,
    ]
    this.besoinFormulaire2Texte = [
      'Choix du nombre',
      `Nombres séparés par des tirets :
    1 : Division par 10
    2 : Division par 100
    3 : Division par 1 000
    4 : Mélange`,
    ]
    this.sup2 = 4
    this.sup = 1
  }

  nouvelleVersion() {
    const diviseursPossibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const operationsPossibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    let combien = 0
    let reponse = ''

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (diviseursPossibles[i]) {
        case 1:
          combien = 10
          reponse = texNombre(0.1)
          break
        case 2:
          combien = 100
          reponse = texNombre(0.01)
          break
        case 3:
          combien = 1000
          reponse = texNombre(0.001)
          break
      }
      if (this.questionJamaisPosee(i, combien, operationsPossibles[i])) {
        // Si la question n'a jamais été posée, on en créé une autre
        let texte = ''
        let texteCorr = ''
        if (operationsPossibles[i] === 1) {
          texte += `Diviser par $${texNombre(combien)}$ revient à `
          texte += this.interactif
            ? choixDeroulant(this, 2 * i, {
                choices: [
                  { label: 'Choisir un verbe', value: '' },
                  { label: 'ajouter', value: 'ajouter' },
                  { label: 'diviser', value: 'diviser' },
                  { label: 'multiplier', value: 'multiplier' },
                  { label: 'soustraire', value: 'soustraire' },
                ],
              })
            : '$\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots$'
          handleAnswers(
            this,
            2 * i,
            { reponse: { value: 'multiplier' } },
            { formatInteractif: 'liste-deroulante' },
          )
          texte += ' par '
          texte += this.interactif
            ? choixDeroulant(this, 2 * i + 1, {
                choices: [
                  { label: 'Choisir la bonne valeur', value: '' },
                  { latex: '0,1', value: `${texNombre(0.1)}` },
                  { latex: '0,01', value: `${texNombre(0.01)}` },
                  { latex: '0,001', value: `${texNombre(0.001)}` },
                ],
              })
            : '$\\ldots\\ldots\\ldots\\ldots$'
          handleAnswers(
            this,
            2 * i + 1,
            { reponse: { value: reponse } },
            { formatInteractif: 'liste-deroulante' },
          )
          texteCorr = `Diviser par $${texNombre(combien)}$ revient à ${texteEnCouleurEtGras('multiplier')} par $${miseEnEvidence(reponse)}$.`
        } else {
          texte += `Multiplier par $${reponse}$ revient à `
          texte += this.interactif
            ? choixDeroulant(this, 2 * i, {
                choices: [
                  { label: 'Choisir un verbe', value: '' },
                  { label: 'ajouter', value: 'ajouter' },
                  { label: 'diviser', value: 'diviser' },
                  { label: 'multiplier', value: 'multiplier' },
                  { label: 'soustraire', value: 'soustraire' },
                ],
              })
            : '$\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots$'
          handleAnswers(
            this,
            2 * i,
            { reponse: { value: 'diviser' } },
            { formatInteractif: 'liste-deroulante' },
          )
          texte += ' par '
          texte += this.interactif
            ? choixDeroulant(this, 2 * i + 1, {
                choices: [
                  { label: 'Choisir la bonne valeur', value: '' },
                  { latex: '10', value: '10' },
                  { latex: '100', value: '100' },
                  { latex: '1\\,000', value: '1000' },
                ],
              })
            : '$\\ldots\\ldots\\ldots\\ldots$'
          handleAnswers(
            this,
            2 * i + 1,
            { reponse: { value: combien } },
            { formatInteractif: 'liste-deroulante' },
          )
          texteCorr = `Multiplier par $${reponse}$ revient à ${texteEnCouleurEtGras('diviser')} par $${miseEnEvidence(texNombre(combien))}$.`
        }
        texte += '.'

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
