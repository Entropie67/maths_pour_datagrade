import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const dateDePublication = '22/12/2025'

export const interactifReady = true

export const titre =
  'Diviser par $0{,}1$ ; $0{,}01$ ; $0{,}001$ (Calculs à trous)'

/**
 * @author Michael ROSSEL
 */

export const uuid = '6d205'
export const refs = {
  'fr-fr': [''],
  'fr-ch': ['9R1NO6G-9', '9R2NO6G-9', '9R3NO6G-9'],
}
export default class DiviserPar001 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4

    this.consigne = `Compléter${sp()}:`
    this.correctionDetailleeDisponible = true

    this.sup = false
    this.sup2 = 4
    this.besoinFormulaireCaseACocher = ['Nombres entiers', true]
    this.besoinFormulaire2Texte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Nombre à retrouver\n2 : 0,1 ou 0,01 ou 0,001 à retrouver\n3 : Résultat à retrouver\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })

    const rang = ['milliers', 'centaines', 'dizaines']
    const coefficients = combinaisonListes([-1, -2, -3], this.nbQuestions)
    for (
      let i = 0,
        texte: string,
        texteCorr: string,
        nombre,
        nombreentier,
        resultat,
        exposant,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const coefficient = coefficients[i]
      texte = ''
      texteCorr = ''
      if (!this.sup) {
        exposant = -randint(1, 3)
      } else {
        exposant = 0
      }
      nombreentier = randint(10, 1000) + randint(10, 999) * choice([0, 1000])
      nombre = nombreentier * 10 ** exposant
      resultat = nombre / 10 ** coefficient
      let reponse: string = ''
      switch (listeTypeDeQuestions[i]) {
        case 1:
          texte = remplisLesBlancs(
            this,
            i,
            `%{champ1} ~\\div~ ${texNombre(10 ** coefficient)}${sp(2)}~=~${sp(2)}${texNombre(resultat)}`,
            KeyboardType.numbersSpace,
          )
          if (this.correctionDetaillee) {
            texteCorr = `Quand on divise par $${texNombre(10 ** coefficient)}=${texFractionFromString(1, 10 ** -coefficient)}$, cela revient à multiplier par $${texNombre(10 ** -coefficient)}$.<br>`
            texteCorr += `Le chiffre des unités se positionne donc dans les ${rang[3 + coefficient]}${sp()}:<br>`
          }
          texteCorr += `$${miseEnEvidence(texNombre(nombre))} ~\\div~ ${texNombre(10 ** coefficient)}${sp(2)}=${sp(2)}${texNombre(resultat)}$.`
          reponse = texNombre(nombre, 6)
          break
        case 3:
          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(nombre)}  ~\\div~ ${texNombre(10 ** coefficient)}${sp(2)} ~=~ %{champ1}`,
            KeyboardType.numbersSpace,
          )
          if (this.correctionDetaillee) {
            texteCorr = `Quand on divise par $${texNombre(10 ** coefficient)}~=~${texFractionFromString(1, 10 ** -coefficient)}$, cela revient à multiplier par $${texNombre(10 ** -coefficient)}$.<br>`
            texteCorr += `Le chiffre des unités se positionne donc dans les ${rang[3 + coefficient]}${sp()}:<br>`
          }
          texteCorr += `$${texNombre(nombre)} ~\\div~ ${texNombre(10 ** coefficient)}${sp(2)}~=~${sp(2)}${miseEnEvidence(texNombre(resultat))}$`
          reponse = texNombre(resultat, 6)
          break
        case 2:
          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(nombre)}  ~\\div~ %{champ1}${sp(2)} ~=~ ${sp(2)}${texNombre(resultat)}`,
            KeyboardType.numbersSpace,
          )
          if (this.correctionDetaillee) {
            texteCorr = `Quand on divise par $${texNombre(10 ** coefficient)}=${texFractionFromString(1, 10 ** -coefficient)}$, cela revient à multiplier par $${texNombre(10 ** -coefficient)}$.<br>`
            texteCorr += `Le chiffre des unités se positionne donc dans les ${rang[3 + coefficient]}${sp()}:<br>`
          }
          texteCorr += `$${texNombre(nombre)} ~\\div~ ${miseEnEvidence(texNombre(10 ** coefficient))}${sp(2)}~=~${sp(2)}${texNombre(resultat)}$.`
          reponse = texNombre(10 ** coefficient, 6)
          break
      }

      if (this.questionJamaisPosee(i, nombre, coefficient)) {
        handleAnswers(this, i, { champ1: { value: reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
